/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: storage-data.ts
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
export const MOCK_TABLESPACES = [
    { TABLESPACE_NAME: 'SYSTEM', STATUS: 'ONLINE', CONTENTS: 'PERMANENT', TOTAL_MB: 1024, USED_MB: 850, FREE_MB: 174, USED_PERCENT: '83', FILE_COUNT: 1 },
    { TABLESPACE_NAME: 'SYSAUX', STATUS: 'ONLINE', CONTENTS: 'PERMANENT', TOTAL_MB: 2048, USED_MB: 1200, FREE_MB: 848, USED_PERCENT: '58.5', FILE_COUNT: 1 },
    { TABLESPACE_NAME: 'UNDOTBS1', STATUS: 'ONLINE', CONTENTS: 'UNDO', TOTAL_MB: 512, USED_MB: 45, FREE_MB: 467, USED_PERCENT: '8.8', FILE_COUNT: 1 },
    { TABLESPACE_NAME: 'USERS', STATUS: 'ONLINE', CONTENTS: 'PERMANENT', TOTAL_MB: 40960, USED_MB: 38500, FREE_MB: 2460, USED_PERCENT: '94', FILE_COUNT: 4 },
    { TABLESPACE_NAME: 'TEMP', STATUS: 'ONLINE', CONTENTS: 'TEMPORARY', TOTAL_MB: 2048, USED_MB: 120, FREE_MB: 1928, USED_PERCENT: '5.8', FILE_COUNT: 1 },
    { TABLESPACE_NAME: 'SALES_DATA', STATUS: 'ONLINE', CONTENTS: 'PERMANENT', TOTAL_MB: 102400, USED_MB: 75200, FREE_MB: 27200, USED_PERCENT: '73.4', FILE_COUNT: 8 }
]

export const MOCK_DATAFILES = [
    { FILE_ID: 1, FILE_NAME: '/u01/app/oracle/oradata/ORCL/system01.dbf', TABLESPACE_NAME: 'SYSTEM', STATUS: 'AVAILABLE', BYTES_MB: 1024 },
    { FILE_ID: 2, FILE_NAME: '/u01/app/oracle/oradata/ORCL/sysaux01.dbf', TABLESPACE_NAME: 'SYSAUX', STATUS: 'AVAILABLE', BYTES_MB: 2048 },
    { FILE_ID: 3, FILE_NAME: '/u01/app/oracle/oradata/ORCL/undotbs01.dbf', TABLESPACE_NAME: 'UNDOTBS1', STATUS: 'AVAILABLE', BYTES_MB: 512 },
    { FILE_ID: 4, FILE_NAME: '/u01/app/oracle/oradata/ORCL/users01.dbf', TABLESPACE_NAME: 'USERS', STATUS: 'AVAILABLE', BYTES_MB: 10240 },
    { FILE_ID: 5, FILE_NAME: '/u01/app/oracle/oradata/ORCL/users02.dbf', TABLESPACE_NAME: 'USERS', STATUS: 'AVAILABLE', BYTES_MB: 10240 },
    { FILE_ID: 6, FILE_NAME: '/u01/app/oracle/oradata/ORCL/users03.dbf', TABLESPACE_NAME: 'USERS', STATUS: 'AVAILABLE', BYTES_MB: 10240 },
    { FILE_ID: 7, FILE_NAME: '/u01/app/oracle/oradata/ORCL/users04.dbf', TABLESPACE_NAME: 'USERS', STATUS: 'AVAILABLE', BYTES_MB: 10240 }
]

export const MOCK_STORAGE_STATS = {
    allocated_gb: 154,
    used_gb: 118,
    free_gb: 36,
    file_count: 17
}

export const MOCK_STORAGE_TREND = [
    { name: 'Mon', value: 112 },
    { name: 'Tue', value: 114 },
    { name: 'Wed', value: 115 },
    { name: 'Thu', value: 116 },
    { name: 'Fri', value: 117 },
    { name: 'Sat', value: 118 },
    { name: 'Sun', value: 118 }
]

export const MOCK_SYSAUX_CHART = [
    { name: 'Optimizer Stats', value: 624500, color: '#f59e0b', percentage: 28 },
    { name: 'AWR', value: 452100, color: '#3b82f6', percentage: 20 },
    { name: 'Advisor', value: 852100, color: '#ef4444', percentage: 38 },
    { name: 'Other', value: 312500, color: '#64748b', percentage: 14 }
]

export const MOCK_FRA_TREND = [
    { name: 'Capacity', value: 500, color: '#10b981' },
    { name: 'Used', value: 380, color: '#3b82f6' },
    { name: 'Reclaimable', value: 85, color: '#f59e0b' }
]
