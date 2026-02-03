select PROPERTY_NAME name, PROPERTY_VALUE  value from database_properties where PROPERTY_NAME in ('NLS_CHARACTERSET', 'NLS_NCHAR_CHARACTERSET')
union all
SELECT parameter,value FROM NLS_DATABASE_PARAMETERS ;