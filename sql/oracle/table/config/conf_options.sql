  SELECT  comp_id, comp_name, version,SCHEMA,status  from DBA_REGISTRY
  UNION ALL
  SELECT      '  ' comp_id,  product comp_name, version version, ' ' SCHEMA, status from PRODUCT_COMPONENT_VERSION ;