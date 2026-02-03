export interface Tablespace {
    id: number
    name: string
    status: 'ONLINE' | 'OFFLINE'
    total_size: string
    used_size: string
    used_percent: number
    contents: 'PERMANENT' | 'TEMPORARY' | 'UNDO'
    extent_management: 'LOCAL' | 'DICTIONARY'
}

export const TABLESPACES: Tablespace[] = [
    { id: 1, name: 'SYSTEM', status: 'ONLINE', total_size: '2 GB', used_size: '1.8 GB', used_percent: 90, contents: 'PERMANENT', extent_management: 'LOCAL' },
    { id: 2, name: 'SYSAUX', status: 'ONLINE', total_size: '3 GB', used_size: '2.5 GB', used_percent: 83, contents: 'PERMANENT', extent_management: 'LOCAL' },
    { id: 3, name: 'UNDOTBS1', status: 'ONLINE', total_size: '5 GB', used_size: '1.2 GB', used_percent: 24, contents: 'UNDO', extent_management: 'LOCAL' },
    { id: 4, name: 'TEMP', status: 'ONLINE', total_size: '10 GB', used_size: '0.1 GB', used_percent: 1, contents: 'TEMPORARY', extent_management: 'LOCAL' },
    { id: 5, name: 'USERS', status: 'ONLINE', total_size: '500 MB', used_size: '450 MB', used_percent: 90, contents: 'PERMANENT', extent_management: 'LOCAL' },
    { id: 6, name: 'DATA_TS', status: 'ONLINE', total_size: '100 GB', used_size: '65 GB', used_percent: 65, contents: 'PERMANENT', extent_management: 'LOCAL' },
]

export interface Datafile {
    file_id: number
    ts_id: number
    name: string
    size: string
    status: 'AVAILABLE' | 'INVALID'
    autoextend: boolean
}

export const DATAFILES: Datafile[] = [
    { file_id: 1, ts_id: 1, name: '+DATA/ORCL/DATAFILE/system.256.123456', size: '2 GB', status: 'AVAILABLE', autoextend: true },
    { file_id: 2, ts_id: 2, name: '+DATA/ORCL/DATAFILE/sysaux.257.123456', size: '3 GB', status: 'AVAILABLE', autoextend: true },
    { file_id: 3, ts_id: 3, name: '+DATA/ORCL/DATAFILE/undotbs1.258.123456', size: '5 GB', status: 'AVAILABLE', autoextend: true },
    { file_id: 4, ts_id: 5, name: '+DATA/ORCL/DATAFILE/users.259.123456', size: '500 MB', status: 'AVAILABLE', autoextend: false },
    { file_id: 5, ts_id: 6, name: '+DATA/ORCL/DATAFILE/data_ts.260.123456', size: '50 GB', status: 'AVAILABLE', autoextend: true },
    { file_id: 6, ts_id: 6, name: '+DATA/ORCL/DATAFILE/data_ts.261.123456', size: '50 GB', status: 'AVAILABLE', autoextend: true },
]

export interface Segment {
    owner: string
    segment_name: string
    type: string
    size_mb: number
    ts_id: number
}

export const SEGMENTS: Segment[] = [
    { owner: 'HR', segment_name: 'EMPLOYEES', type: 'TABLE', size_mb: 120, ts_id: 5 },
    { owner: 'HR', segment_name: 'DEPARTMENTS', type: 'TABLE', size_mb: 50, ts_id: 5 },
    { owner: 'HR', segment_name: 'EMP_IDX', type: 'INDEX', size_mb: 80, ts_id: 5 },
    { owner: 'SALES', segment_name: 'ORDERS', type: 'TABLE', size_mb: 15000, ts_id: 6 },
    { owner: 'SALES', segment_name: 'ORDER_ITEMS', type: 'TABLE', size_mb: 25000, ts_id: 6 },
    { owner: 'SALES', segment_name: 'CUSTOMERS', type: 'TABLE', size_mb: 5000, ts_id: 6 },
]

export interface RedoGroup {
    group: number
    thread: number
    sequence: number
    bytes: string
    members: number
    status: 'CURRENT' | 'ACTIVE' | 'INACTIVE' | 'UNUSED'
    archived: 'YES' | 'NO'
}

export const REDO_GROUPS: RedoGroup[] = [
    { group: 1, thread: 1, sequence: 1050, bytes: '200 MB', members: 2, status: 'INACTIVE', archived: 'YES' },
    { group: 2, thread: 1, sequence: 1051, bytes: '200 MB', members: 2, status: 'ACTIVE', archived: 'NO' },
    { group: 3, thread: 1, sequence: 1052, bytes: '200 MB', members: 2, status: 'CURRENT', archived: 'NO' },
]

export interface RedoMember {
    group: number
    member: string
}

export const REDO_MEMBERS: RedoMember[] = [
    { group: 1, member: '+DATA/ORCL/ONLINELOG/group_1.262.123456' },
    { group: 1, member: '+FRA/ORCL/ONLINELOG/group_1.262.123456' },
    { group: 2, member: '+DATA/ORCL/ONLINELOG/group_2.263.123456' },
    { group: 2, member: '+FRA/ORCL/ONLINELOG/group_2.263.123456' },
    { group: 3, member: '+DATA/ORCL/ONLINELOG/group_3.264.123456' },
    { group: 3, member: '+FRA/ORCL/ONLINELOG/group_3.264.123456' },
]

export interface ControlFile {
    name: string
    status: string
}

export const CONTROL_FILES: ControlFile[] = [
    { name: '+DATA/ORCL/CONTROLFILE/current.260.123456', status: 'VALID' },
    { name: '+FRA/ORCL/CONTROLFILE/current.260.123456', status: 'VALID' },
]

export const REDO_SWITCH_HISTORY = [
    { time: '08:00', switches: 2 },
    { time: '09:00', switches: 4 },
    { time: '10:00', switches: 12 },
    { time: '11:00', switches: 8 },
    { time: '12:00', switches: 3 },
    { time: '13:00', switches: 5 },
    { time: '14:00', switches: 4 },
]
