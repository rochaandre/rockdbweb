-- Comprehensive SQL Statistics from V$SQL (11g Compatible)
SELECT 
    inst_id,
    sql_id,
    child_number,
    plan_hash_value,
    -- full_plan_hash_value, -- 12c+
    parsing_schema_name,
    module,
    action,
    service,
    first_load_time,
    last_active_time,
    executions,
    loads,
    invalidations,
    parse_calls,
    disk_reads,
    direct_reads,
    direct_writes,
    buffer_gets,
    rows_processed,
    sharable_mem,
    persistent_mem,
    runtime_mem,
    fetches,
    end_of_fetch_count,
    sorts,
    px_servers_executions,
    cpu_time,
    elapsed_time,
    avg_hard_parse_time,
    application_wait_time,
    concurrency_wait_time,
    cluster_wait_time,
    user_io_wait_time,
    plsql_exec_time,
    java_exec_time,
    optimizer_mode,
    optimizer_cost,
    optimizer_env_hash_value,
    parsing_user_id,
    parsing_schema_id,
    kept_versions,
    address,
    hash_value,
    old_hash_value,
    users_opening,
    users_executing,
    loaded_versions,
    open_versions,
    is_obsolete,
    is_bind_sensitive,
    is_bind_aware,
    is_shareable,
    sql_profile,
    -- sql_patch, -- 12c+
    sql_plan_baseline,
    program_id,
    program_line#,
    exact_matching_signature,
    force_matching_signature,
    typecheck_mem,
    io_cell_offload_eligible_bytes,
    io_interconnect_bytes,
    physical_read_requests,
    physical_read_bytes,
    physical_write_requests,
    physical_write_bytes,
    optimized_phy_read_requests,
    locked_total,
    pinned_total,
    io_cell_uncompressed_bytes,
    io_cell_offload_returned_bytes,
    -- con_id, -- 12c+
    -- is_reoptimizable, -- 12c+
    -- is_resolved_adaptive_plan, -- 12c+
    -- im_scans, -- 12c+
    -- im_scan_bytes_uncompressed, -- 12c+
    -- im_scan_bytes_inmemory, -- 12c+
    ddl_no_invalidate,
    is_rolling_invalid,
    -- is_rolling_refresh_invalid, -- 12c+
    result_cache
    -- sql_quarantine, -- 19c+
    -- avoided_executions -- 19c+
FROM gv$sql
WHERE sql_id = :sql_id
AND inst_id = :inst_id
AND child_number = :child_number
