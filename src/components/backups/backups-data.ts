export interface BackupJob {
    id: number
    command_id: string
    operation: string
    status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'COMPLETED WITH WARNINGS'
    start_time: string
    time_taken: string
    output_device: string
    input_bytes: string
    output_bytes: string
}

export const ACTIVE_BACKUP_JOBS: BackupJob[] = [
    {
        id: 101,
        command_id: 'RMAN-001',
        operation: 'RMAN BACKUP FULL',
        status: 'RUNNING',
        start_time: '2026-01-29 13:00:00',
        time_taken: '00:48:12',
        output_device: 'DISK',
        input_bytes: '450 GB',
        output_bytes: '120 GB'
    },
    {
        id: 102,
        command_id: 'EXPDP-055',
        operation: 'EXPORT SCHEMA HR',
        status: 'RUNNING',
        start_time: '2026-01-29 13:30:00',
        time_taken: '00:18:05',
        output_device: 'DATA_PUMP_DIR',
        input_bytes: '5 GB',
        output_bytes: '1.2 GB'
    }
]

export const BACKUP_HISTORY: BackupJob[] = [
    {
        id: 99,
        command_id: 'RMAN-000',
        operation: 'RMAN BACKUP FULL',
        status: 'COMPLETED',
        start_time: '2026-01-28 02:00:00',
        time_taken: '04:15:00',
        output_device: 'TAPE',
        input_bytes: '2.5 TB',
        output_bytes: '2.5 TB'
    },
    {
        id: 98,
        command_id: 'EXPDP-054',
        operation: 'EXPORT SCHEMA SALES',
        status: 'COMPLETED WITH WARNINGS',
        start_time: '2026-01-28 20:00:00',
        time_taken: '01:20:00',
        output_device: 'DATA_PUMP_DIR',
        input_bytes: '50 GB',
        output_bytes: '12 GB'
    },
    {
        id: 97,
        command_id: 'RMAN-OLD',
        operation: 'RMAN ARCHIVELOG',
        status: 'FAILED',
        start_time: '2026-01-27 12:00:00',
        time_taken: '00:05:00',
        output_device: 'DISK',
        input_bytes: '0',
        output_bytes: '0'
    }
]

export interface BackupSet {
    bs_key: number
    job_id: number
    type: 'FULL' | 'INCR' | 'ARCH'
    tag: string
    pieces: number
    completion_time: string
    elapsed: string
    size: string
    device_type: string
}

export const BACKUP_SETS: BackupSet[] = [
    { bs_key: 3501, job_id: 99, type: 'FULL', tag: 'TAG20260128T020000', pieces: 4, completion_time: '2026-01-28 06:15:00', elapsed: '04:15:00', size: '2.5 TB', device_type: 'TAPE' },
    { bs_key: 3502, job_id: 99, type: 'ARCH', tag: 'TAG20260128T061500', pieces: 1, completion_time: '2026-01-28 06:18:00', elapsed: '00:03:00', size: '500 MB', device_type: 'TAPE' },
    { bs_key: 3499, job_id: 101, type: 'INCR', tag: 'TAG20260127T200000', pieces: 2, completion_time: '2026-01-27 21:20:00', elapsed: '01:20:00', size: '150 GB', device_type: 'DISK' }
]

export interface BackupDatafile {
    file_id: number
    bs_key: number
    name: string
    tablespace: string
    checkpoint_scn: string
    size: string
}

export const BACKUP_DATAFILES: BackupDatafile[] = [
    { file_id: 1, bs_key: 3501, name: '+DATA/ORCL/DATAFILE/system.256.123456', tablespace: 'SYSTEM', checkpoint_scn: '15203040', size: '800 MB' },
    { file_id: 2, bs_key: 3501, name: '+DATA/ORCL/DATAFILE/sysaux.257.123456', tablespace: 'SYSAUX', checkpoint_scn: '15203040', size: '1.2 GB' },
    { file_id: 3, bs_key: 3501, name: '+DATA/ORCL/DATAFILE/undotbs1.258.123456', tablespace: 'UNDOTBS1', checkpoint_scn: '15203040', size: '500 MB' },
    { file_id: 4, bs_key: 3501, name: '+DATA/ORCL/DATAFILE/users.259.123456', tablespace: 'USERS', checkpoint_scn: '15203040', size: '100 MB' },
    { file_id: 5, bs_key: 3499, name: '+DATA/ORCL/DATAFILE/users.259.123456', tablespace: 'USERS', checkpoint_scn: '15203500', size: '5 MB' }
]

export interface BackupSummary {
    metric: string
    value: string
    trend: 'up' | 'down' | 'stable'
}

export const BACKUP_SUMMARY: BackupSummary[] = [
    { metric: 'Total Backups (7 Days)', value: '14', trend: 'stable' },
    { metric: 'Successful Jobs', value: '12', trend: 'stable' },
    { metric: 'Failed Jobs', value: '2', trend: 'up' },
    { metric: 'Avg Duration (Full)', value: '04:10:00', trend: 'down' },
    { metric: 'Total Size (7 Days)', value: '15.4 TB', trend: 'up' }
]
