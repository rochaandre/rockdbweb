"""
# ==============================================================================
# ROCKDB - Oracle Database Administration & Monitoring Tool
# ==============================================================================
# File: storage_charts_mod.py
# Author: Andre Rocha (TechMax Consultoria)
# 
# LICENSE: Creative Commons Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)
#
# TERMS:
# 1. You are free to USE and REDISTRIBUTE this software in any medium or format.
# 2. YOU MAY NOT MODIFY, transform, or build upon this code.
# 3. You must maintain this header and original naming/ownership information.
#
# This software is provided "AS IS", without warranty of any kind.
# Copyright (c) 2026 Andre Rocha. All rights reserved.
# ==============================================================================
"""
import oracledb
from .utils import get_oracle_connection

def get_storage_charts_data(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        data = {
            'fra': None,
            'datafiles': None,
            'sga': [],
            'sga_total_mb': 0,
            'undo': [],
            'temp': []
        }

        # 1. Flash Recovery Area (FRA)
        try:
            cursor.execute("""
                select name, 
                       trunc(space_limit / 1024 / 1024) as limit_mb,
                       trunc(space_used / 1024 / 1024) as used_mb,
                       trunc(space_reclaimable / 1024 / 1024) as reclaimable_mb,
                       number_of_files
                from v$recovery_file_dest
            """)
            row = cursor.fetchone()
            if row:
                data['fra'] = {
                    'name': row[0],
                    'limit_mb': row[1],
                    'used_mb': row[2],
                    'reclaimable_mb': row[3],
                    'files': row[4],
                    'free_mb': max(0, row[1] - row[2])
                }
        except Exception as e:
            print(f"FRA query failed: {e}")

        # 2. Datafiles Total (Livre x Usado)
        try:
            cursor.execute("""
                with ts_usage as (
                  select tablespace_name, sum(bytes) total_bytes
                  from dba_data_files
                  group by tablespace_name
                ),
                ts_free as (
                  select tablespace_name, sum(bytes) free_bytes
                  from dba_free_space
                  group by tablespace_name
                )
                select trunc(sum(total_bytes) / 1024 / 1024) as total_mb,
                       trunc(sum(total_bytes - nvl(free_bytes, 0)) / 1024 / 1024) as used_mb,
                       trunc(sum(nvl(free_bytes, 0)) / 1024 / 1024) as free_mb
                from ts_usage
                left join ts_free on ts_usage.tablespace_name = ts_free.tablespace_name
            """)
            row = cursor.fetchone()
            if row:
                data['datafiles'] = {
                    'total_mb': row[0],
                    'used_mb': row[1],
                    'free_mb': row[2]
                }
        except Exception as e:
            print(f"Datafiles query failed: {e}")

        # 3. SGA Usage
        try:
            cursor.execute("""
                select nvl(pool, name) as name, trunc(sum(bytes) / 1024 / 1024) as mb
                from v$sgastat
                group by nvl(pool, name)
                order by mb desc
            """)
            rows = cursor.fetchall()
            data['sga'] = [{'name': r[0], 'mb': r[1]} for r in rows if r[1] > 0]
            
            cursor.execute("select trunc(sum(value)/1024/1024) from v$sga")
            row_total = cursor.fetchone()
            data['sga_total_mb'] = row_total[0] if row_total else 0
        except Exception as e:
            print(f"SGA query failed: {e}")

        # 4. UNDO Tablespace
        try:
            cursor.execute("""
                select tablespace_name, 
                       trunc(sum(bytes) / 1024 / 1024) as total_mb,
                       trunc((sum(bytes) - nvl(sum(free_bytes), 0)) / 1024 / 1024) as used_mb,
                       trunc(nvl(sum(free_bytes), 0) / 1024 / 1024) as free_mb
                from dba_data_files df
                left join (select tablespace_name, sum(bytes) free_bytes from dba_free_space group by tablespace_name) fs
                  using (tablespace_name)
                where tablespace_name in (select tablespace_name from dba_tablespaces where contents = 'UNDO')
                group by tablespace_name
            """)
            rows = cursor.fetchall()
            data['undo'] = [{'tablespace_name': r[0], 'total_mb': r[1], 'used_mb': r[2], 'free_mb': r[3]} for r in rows]
        except Exception as e:
            print(f"Undo query failed: {e}")

        # 5. TEMP Tablespace
        try:
            cursor.execute("""
                select tablespace_name, 
                       trunc(tablespace_size * (select value from v$parameter where name = 'db_block_size') / 1024 / 1024) as total_mb,
                       trunc(allocated_space * (select value from v$parameter where name = 'db_block_size') / 1024 / 1024) as used_mb,
                       trunc(free_space * (select value from v$parameter where name = 'db_block_size') / 1024 / 1024) as free_mb
                from v$temp_tablespace_utilization
            """)
            rows = cursor.fetchall()
            if not rows:
                cursor.execute("""
                    select tablespace_name, trunc(sum(bytes)/1024/1024) as total_mb 
                    from dba_temp_files group by tablespace_name
                """)
                rows = cursor.fetchall()
                data['temp'] = [{'tablespace_name': r[0], 'total_mb': r[1], 'used_mb': 0, 'free_mb': r[1]} for r in rows]
            else:
                data['temp'] = [{'tablespace_name': r[0], 'total_mb': r[1], 'used_mb': r[2], 'free_mb': r[3]} for r in rows]
        except Exception as e:
            print(f"Temp query failed: {e}")

        # 6. PGA Usage
        try:
            cursor.execute("""
                select name, trunc(value/1024/1024) as mb
                from v$pgastat
                where name in ('aggregate PGA target parameter', 'aggregate PGA auto target', 'total PGA allocated', 'total PGA inuse')
            """)
            rows = cursor.fetchall()
            data['pga'] = [{'name': r[0], 'mb': r[1]} for r in rows]
        except Exception as e:
            print(f"PGA query failed: {e}")

        # 7. Top 10 Tablespaces
        try:
            cursor.execute("""
                with ts_usage as (
                  select tablespace_name, sum(bytes) total_bytes
                  from dba_data_files
                  group by tablespace_name
                )
                select * from (
                    select tablespace_name, trunc(total_bytes/1024/1024) as mb
                    from ts_usage
                    order by total_bytes desc
                ) where rownum <= 10
            """)
            rows = cursor.fetchall()
            data['top_tablespaces'] = [{'name': r[0], 'mb': r[1]} for r in rows]
        except Exception as e:
            print(f"Top Tablespaces query failed: {e}")

        return data

    except Exception as e:
        print(f"Error fetching storage charts data: {e}")
        raise e
    finally:
        if connection:
            connection.close()
