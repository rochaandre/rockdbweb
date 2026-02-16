 SELECT di.OWNER , di.index_name,
       trunc((dt.num_rows / di.clustering_factor) /
             (dt.num_rows / dt.blocks),2) factor,
             'alter index ' ||  dt.owner ||'.'|| di.INDEX_NAME ||' rebuild tablespace '|| di.TABLESPACE_NAME ||' online ' rebuild
  FROM dba_indexes di, dba_tables dt, dba_constraints dc
 WHERE di.table_name = dt.table_name
   AND dt.table_name = dc.table_name
   AND di.index_name = dc.index_name
   AND di.owner = dc.OWNER
   AND dt.OWNER = dc.OWNER
   AND dc.CONSTRAINT_TYPE = 'P'
   AND  dt.blocks >0
   AND di.clustering_factor>0
   AND trunc((dt.num_rows / di.clustering_factor) /
             (dt.num_rows / dt.blocks),2) <= 0.75
   AND dt.owner NOT IN
   ('SYS','SYSMAN','SYSTEM','GGUSER', 'XS$NULL','ORACLE_OCM','APEX_PUBLIC_USER','DIP','DBAJOBS','SYSMAN','DBSNMP','SI_INFORMTN_SCHEMA','APEX_030200','APEX_040000','ORDPLUGINS','APPQOSSYS','XDB','WMSYS','EXFSYS','ANONYMOUS','CTXSYS','ORDSYS','ORDDATA','MDSYS','FLOWS_FILES','MGMT_VIEW','OUTLN','SH','OE','PM','BI','OLAPSYS','IX','SCOTT','HR','PM','OWBSYS','ORAINT','LBACSYS','APPQOSSYS','GSMCATUSER','MDDATA','DBSFWUSER','SYSBACKUP','REMOTE_SCHEDULER_AGENT','GGSYS','ANONYMOUS','GSMUSER','SYSRAC','CTXSYS','ORDS_PUBLIC_USER','OJVMSYS','DV','SI_INFORMTN_SCHEMA','DVSYS','AUDSYS','C##DBAAS_BACKUP','GSMADMIN_INTERNAL','ORDPLUGINS','DIP','LBACSYS','MDSYS','OLAPSYS','ORDDATA','SYSKM','OUTLN','SYS$UMF','ORACLE_OCM','XDB','WMSYS','ORDSYS','SYSDG','PYQSYS','C##CLOUD$SERVICE','C##ADP$SERVICE','ORDS_METADATA','C##OMLIDM','OML$MODELS','ORDS_PLSQL_GATEWAY','APEX_200200','GRAPH$METADATA','C##CLOUD_OPS','SSB','C##API','OMLMOD$PROXY','C##DV_ACCT_ADMIN','APEX_INSTANCE_ADMIN_USER','RMAN$CATALOG','C##DV_OWNER','GRAPH$PROXY_USER','OML$PROXY')
   ORDER BY factor ;