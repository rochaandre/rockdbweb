 select
       name  ,
       detected_usages  ,
       first_usage_date  ,
       currently_used
    from
       dba_feature_usage_statistics
    where
       first_usage_date is not null ;