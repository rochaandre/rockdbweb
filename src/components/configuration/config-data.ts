export interface HostInfo {
    hostname: string
    platform_name: string
    num_cpus: number
    phys_memory: string
    uptime: string
    os_kernel: string
}

// Mock Data for Local Disk Info
export const LOCAL_DISK_INFO = [
    { name: "/ (Root)", path: "/", size: "100 GB", used: "60 GB", free: "40 GB", pct: 60, type: 'EXT4' },
    { name: "/u01 (App)", path: "/u01", size: "500 GB", used: "350 GB", free: "150 GB", pct: 70, type: 'XFS' },
    { name: "/u02 (Data)", path: "/u02", size: "2 TB", used: "1.8 TB", free: "200 GB", pct: 90, type: 'ASM' },
]

export const HOST_INFO: HostInfo = {
    hostname: 'db-prod-01.techmax.local',
    platform_name: 'Linux x86 64-bit',
    num_cpus: 48,
    phys_memory: '256 GB',
    uptime: '45 days, 12:30:00',
    os_kernel: '5.4.17-2136.315.6.el8uek.x86_64'
}

export interface DbParameter {
    num: number
    name: string
    value: string
    display_value: string
    isdefault: string
    isses_modifiable: string
    issys_modifiable: string
    ismodified: string
}

export const DB_PARAMETERS: DbParameter[] = [
    { num: 1, name: 'sga_target', value: '64G', display_value: '64G', isdefault: 'FALSE', isses_modifiable: 'FALSE', issys_modifiable: 'IMMEDIATE', ismodified: 'MODIFIED' },
    { num: 2, name: 'pga_aggregate_target', value: '16G', display_value: '16G', isdefault: 'FALSE', isses_modifiable: 'FALSE', issys_modifiable: 'IMMEDIATE', ismodified: 'MODIFIED' },
    { num: 3, name: 'processes', value: '1000', display_value: '1000', isdefault: 'FALSE', isses_modifiable: 'FALSE', issys_modifiable: 'FALSE', ismodified: 'MODIFIED' },
    { num: 4, name: 'open_cursors', value: '300', display_value: '300', isdefault: 'TRUE', isses_modifiable: 'FALSE', issys_modifiable: 'IMMEDIATE', ismodified: 'FALSE' },
    { num: 5, name: 'compatible', value: '19.0.0', display_value: '19.0.0', isdefault: 'FALSE', isses_modifiable: 'FALSE', issys_modifiable: 'FALSE', ismodified: 'FALSE' },
    { num: 6, name: 'undo_retention', value: '900', display_value: '900', isdefault: 'TRUE', isses_modifiable: 'FALSE', issys_modifiable: 'IMMEDIATE', ismodified: 'FALSE' },
    { num: 7, name: 'db_recovery_file_dest_size', value: '200G', display_value: '200G', isdefault: 'FALSE', isses_modifiable: 'FALSE', issys_modifiable: 'IMMEDIATE', ismodified: 'MODIFIED' },
]

export interface ResourceLimit {
    resource_name: string
    current_utilization: number
    max_utilization: number
    initial_allocation: string
    limit_value: string
}

export const RESOURCE_LIMITS: ResourceLimit[] = [
    { resource_name: 'processes', current_utilization: 450, max_utilization: 820, initial_allocation: '1000', limit_value: '1000' },
    { resource_name: 'sessions', current_utilization: 482, max_utilization: 890, initial_allocation: '1520', limit_value: '1520' },
    { resource_name: 'enqueue_locks', current_utilization: 120, max_utilization: 350, initial_allocation: '10000', limit_value: '10000' },
]

export interface DbProperty {
    name: string
    value: string
}

export const DB_PROPERTIES: DbProperty[] = [
    { name: 'APEX', value: '' }, // Header or just label? distinct from others. User listed it at top. Assuming just a property.
    { name: 'DB Role', value: 'PRIMARY' },
    { name: 'DB Status', value: 'OPEN' },
    { name: 'Open Mode', value: 'READ WRITE' },
    { name: 'Version', value: '11.2.0.4.0' },
    { name: 'Log Mode', value: 'NOARCHIVELOG' },
    { name: 'Force Logging', value: 'NO' },
    { name: 'DB Unique Name', value: 'apex' },
    { name: 'Login Allowed', value: 'ALLOWED' },
    { name: 'Instance Role', value: 'PRIMARY_INSTANCE' },
    { name: 'Host Name', value: 'dtcsrvbd01' },
    { name: 'Instance Name', value: 'apex' },
    { name: 'Startup Time', value: '14-NOV-2019 08:39' },
    { name: 'Logins', value: 'ALLOWED' },
    { name: 'Oracle Database Version', value: '11.2.0.4.0' },
    { name: 'Database Block Size', value: '8 KB' },
    { name: 'Database Size', value: '0.010 TB' }, // There is also "Database Size 8.84 GB" at the end. I will include both or merge? User listed both. The first seems to be from "Database size: 0.010 TB" and last "Database Size 8.84 GB". 0.010 TB is approx 10GB. 8.84GB is exact. I'll include both as listed.
    { name: 'Datafiles', value: '6 (on 6 tablespaces)' },
    { name: 'Database Configuration', value: 'Single-instance' },
    { name: 'Database Memory', value: 'SGA 3.7 GB, PGA 1.2 GB, ASMM' },
    { name: 'Hardware', value: 'Unknown' },
    { name: 'Processor', value: 'Intel(R) Core(TM) i7-7700HQ CPU @ 2.80GHz' },
    { name: 'Physical CPUs', value: '16 cores, on Single-instance' },
    { name: 'Oracle CPUs', value: '32 CPUs (threads), on Single-instance' },
    { name: 'Physical RAM', value: '252.2 GB, on Single-instance' },
    { name: 'Operating System', value: 'Linux x86 64-bit' },
    { name: 'Encrypted Tablespaces', value: 'NO' },
    { name: 'Encrypted Columns', value: 'NO' },
    { name: 'Wallet', value: 'file /u01/app/oracle/admin/apex/wallet Status CLOSED' },
    { name: 'Database Size', value: '8.84 GB' },
]
