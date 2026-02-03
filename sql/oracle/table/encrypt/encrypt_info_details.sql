 SELECT 'Encrypted Tablespaces' label,  decode(total,0,'NO','YES') value
 FROM (
 SELECT count(*) total
 FROM dba_tablespaces
 WHERE encrypted ='YES'
 )
 UNION all
 SELECT 'Encrypted Columns' lbl,  decode(total,0,'NO','YES') value
 FROM (
 SELECT count(*) total
 FROM dba_encrypted_columns
 )
 UNION all
 select 'Wallet' lbl, WRL_TYPE || ' '  || WRL_PARAMETER || ' Status '|| status value
 FROM v$encryption_wallet
 UNION ALL
 SELECT 'Encrypted tablespace ' lbl, tablespace_name value
 FROM dba_tablespaces
 WHERE encrypted ='YES'
 UNION ALL
 SELECT 'Table column encrypted ' lbl, table_name ||' ' ||  COLUMN_name value
 FROM dba_encrypted_columns
union all
select * from (
 SELECT a.acl,
                    a.host ||' ' ||
                    a.lower_port ||' ' ||
                    a.upper_port ||' ' ||
                    b.principal ||' ' ||
                    b.privilege ||' ' ||
                    b.is_grant ||' ' ||
                    b.start_date ||' ' ||
                    b.end_date
             FROM   dba_network_acls a
                    JOIN dba_network_acl_privileges b ON a.acl = b.acl
             ORDER BY a.acl, a.host, a.lower_port, a.upper_port
  ) ;