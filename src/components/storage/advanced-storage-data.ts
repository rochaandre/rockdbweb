/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: advanced-storage-data.ts
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
export const MOCK_SYSAUX_OCCUPANTS = [
    { OCCUPANT_NAME: 'SM/ADVISOR', SCHEMA_NAME: 'SYS', SPACE_USAGE_KBYTES: 852100, OCCUPANT_DESC: 'Server Manageability - Advisor Framework' },
    { OCCUPANT_NAME: 'SM/OPTSTAT', SCHEMA_NAME: 'SYS', SPACE_USAGE_KBYTES: 624500, OCCUPANT_DESC: 'Server Manageability - Optimizer Statistics History' },
    { OCCUPANT_NAME: 'SM/AWR', SCHEMA_NAME: 'SYS', SPACE_USAGE_KBYTES: 452100, OCCUPANT_DESC: 'Server Manageability - Automatic Workload Repository' },
    { OCCUPANT_NAME: 'STREAMS', SCHEMA_NAME: 'SYS', SPACE_USAGE_KBYTES: 124500, OCCUPANT_DESC: 'Oracle Streams' },
    { OCCUPANT_NAME: 'XDB', SCHEMA_NAME: 'XDB', SPACE_USAGE_KBYTES: 88100, OCCUPANT_DESC: 'Oracle XML Database' },
    { OCCUPANT_NAME: 'AUDIT_TABLES', SCHEMA_NAME: 'SYS', SPACE_USAGE_KBYTES: 45000, OCCUPANT_DESC: 'Database Audit Tables' }
]

export const MOCK_FRA_USAGE = [
    { FILE_TYPE: 'ARCHIVELOG', PERCENT_SPACE_USED: 42.5, PERCENT_SPACE_RECLAIMABLE: 12.2, NUMBER_OF_FILES: 452 },
    { FILE_TYPE: 'BACKUPSET', PERCENT_SPACE_USED: 28.1, PERCENT_SPACE_RECLAIMABLE: 4.5, NUMBER_OF_FILES: 128 },
    { FILE_TYPE: 'IMAGECOPY', PERCENT_SPACE_USED: 0.0, PERCENT_SPACE_RECLAIMABLE: 0.0, NUMBER_OF_FILES: 0 },
    { FILE_TYPE: 'FLASHBACK LOG', PERCENT_SPACE_USED: 15.4, PERCENT_SPACE_RECLAIMABLE: 5.2, NUMBER_OF_FILES: 24 }
]

export const MOCK_DISK_GROUPS = [
    { NAME: 'DATA', TYPE: 'EXTERN', STATE: 'MOUNTED', TOTAL_MB: 1048576, FREE_MB: 245000, BLOCK_SIZE: 4096 },
    { NAME: 'RECO', TYPE: 'EXTERN', STATE: 'MOUNTED', TOTAL_MB: 524288, FREE_MB: 312000, BLOCK_SIZE: 4096 }
]
