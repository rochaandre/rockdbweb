/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: config-data.ts
 * Author: Andre Rocha (TechMax Consultoria)
 * 
 * LICENSE: Creative Commons Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)
 *
 * TERMS:
 * 1. You are free to USE and REDISTRIBUTE this software in any medium or format.
 * 2. YOU MAY NOT MODIFY, transform, or build upon this code.
 * 3. You must maintain this header and original naming/ownership information.
 *
 * This software is provided "AS IS", without warranty of any kind.
 * Copyright (c) 2026 Andre Rocha. All rights reserved.
 * ==============================================================================
 */
export const MOCK_DB_PROPERTIES = [
    { NAME: 'db_name', VALUE: 'ORCL', DESCRIPTION: 'The name of the database' },
    { NAME: 'db_unique_name', VALUE: 'ORCL_UNIQUE', DESCRIPTION: 'The unique name of the database' },
    { NAME: 'db_domain', VALUE: 'localdomain', DESCRIPTION: 'The domain name of the database' },
    { NAME: 'instance_name', VALUE: 'orcl', DESCRIPTION: 'The name of the database instance' },
    { NAME: 'host_name', VALUE: 'oracle-host-01', DESCRIPTION: 'The name of the host running the instance' },
    { NAME: 'version', VALUE: '19.0.0.0.0', DESCRIPTION: 'The version of the Oracle Database' },
    { NAME: 'status', VALUE: 'OPEN', DESCRIPTION: 'The current status of the database' },
    { NAME: 'archiver', VALUE: 'STARTED', DESCRIPTION: 'The status of the archiver process' },
    { NAME: 'database_role', VALUE: 'PRIMARY', DESCRIPTION: 'The role of the database in a Data Guard configuration' },
    { NAME: 'platform_name', VALUE: 'Linux x86 64-bit', DESCRIPTION: 'The operating system platform' }
]

export const MOCK_INSTANCE_PARAMS = [
    { NAME: 'sga_target', VALUE: '4G', DESCRIPTION: 'Target size of the SGA' },
    { NAME: 'pga_aggregate_target', VALUE: '2G', DESCRIPTION: 'Target size of the PGA' },
    { NAME: 'processes', VALUE: '1000', DESCRIPTION: 'Maximum number of processes' },
    { NAME: 'sessions', VALUE: '1500', DESCRIPTION: 'Maximum number of sessions' },
    { NAME: 'db_block_size', VALUE: '8192', DESCRIPTION: 'Database block size in bytes' },
    { NAME: 'compatible', VALUE: '19.0.0', DESCRIPTION: 'Compatibility level of the database' },
    { NAME: 'log_archive_dest_1', VALUE: 'LOCATION=/u01/app/oracle/oradata/arch', DESCRIPTION: 'Archive log destination' },
    { NAME: 'undo_management', VALUE: 'AUTO', DESCRIPTION: 'Undo management mode' },
    { NAME: 'open_cursors', VALUE: '300', DESCRIPTION: 'Maximum number of open cursors' },
    { NAME: 'audit_trail', VALUE: 'DB', DESCRIPTION: 'Audit trail configuration' }
]

export const MOCK_ENV_PROPERTIES = [
    { property: 'ORACLE_HOME', value: '/u01/app/oracle/product/19.3.0/dbhome_1' },
    { property: 'ORACLE_SID', value: 'orcl' },
    { property: 'LD_LIBRARY_PATH', value: '/u01/app/oracle/product/19.3.0/dbhome_1/lib' },
    { property: 'PATH', value: '/usr/local/bin:/usr/bin:/bin:/u01/app/oracle/product/19.3.0/dbhome_1/bin' },
    { property: 'LANG', value: 'en_US.UTF-8' },
    { property: 'TEMP', value: '/tmp' }
]

export const MOCK_CONTROL_FILES = [
    { file_name: '/u01/app/oracle/oradata/ORCL/control01.ctl', status: 'OK' },
    { file_name: '/u01/app/oracle/oradata/ORCL/control02.ctl', status: 'OK' }
]

export const MOCK_REDO_LOGS = [
    { GROUP: 1, THREAD: 1, SEQUENCE: 124, BYTES_MB: 200, MEMBERS: 1, ARCHIVED: 'YES', STATUS: 'INACTIVE' },
    { GROUP: 2, THREAD: 1, SEQUENCE: 125, BYTES_MB: 200, MEMBERS: 1, ARCHIVED: 'YES', STATUS: 'ACTIVE' },
    { GROUP: 3, THREAD: 1, SEQUENCE: 126, BYTES_MB: 200, MEMBERS: 1, ARCHIVED: 'NO', STATUS: 'CURRENT' }
]
