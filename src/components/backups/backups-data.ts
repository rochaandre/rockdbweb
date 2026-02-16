/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: backups-data.ts
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
export const MOCK_BACKUP_JOBS = [
    {
        session_key: 1245,
        command_id: 'bkup_full_s1',
        status: 'COMPLETED',
        start_time: '2026-02-15 02:00:10',
        time_taken_display: '01:45:22',
        input_type: 'DB FULL',
        output_device_type: 'DISK',
        input_bytes_display: '442.12 GB',
        output_bytes_display: '88.42 GB'
    },
    {
        session_key: 1244,
        command_id: 'arc_logs_hr',
        status: 'COMPLETED',
        start_time: '2026-02-15 04:30:00',
        time_taken_display: '00:05:12',
        input_type: 'ARCHIVELOG',
        output_device_type: 'DISK',
        input_bytes_display: '1.24 GB',
        output_bytes_display: '1.24 GB'
    },
    {
        session_key: 1243,
        command_id: 'bkup_incr_s1',
        status: 'RUNNING',
        start_time: '2026-02-16 10:45:00',
        time_taken_display: '00:12:45',
        input_type: 'DB INCR',
        output_device_type: 'DISK',
        input_bytes_display: '42.12 GB',
        output_bytes_display: '8.42 GB'
    }
]

export const MOCK_BACKUP_SETS = [
    { bs_key: 8812, jobId: 1245, type: 'FULL', tag: 'TAG20260215T0200', device_type: 'DISK', pieces: 4, size_mb: 22100 },
    { bs_key: 8813, jobId: 1245, type: 'FULL', tag: 'TAG20260215T0200', device_type: 'DISK', pieces: 4, size_mb: 22100 },
    { bs_key: 8814, jobId: 1245, type: 'FULL', tag: 'TAG20260215T0200', device_type: 'DISK', pieces: 1, size_mb: 450 }
]

export const MOCK_DATAFILES = [
    { 'file#': 1, bs_key: 8812, tablespace: 'SYSTEM', checkpoint_scn: '1125211', size_mb: 850 },
    { 'file#': 2, bs_key: 8812, tablespace: 'SYSAUX', checkpoint_scn: '1125211', size_mb: 1200 },
    { 'file#': 3, bs_key: 8813, tablespace: 'USERS', checkpoint_scn: '1125211', size_mb: 24500 }
]

export const MOCK_SUMMARY = [
    { input_type: 'DB FULL', total_backups: 42, size_gb: 420.5, status: 'OPTIMAL' },
    { input_type: 'DB INCR', total_backups: 156, size_gb: 120.2, status: 'COMPLETED' },
    { input_type: 'ARCHIVELOG', total_backups: 2412, size_gb: 45.8, status: 'COMPLETED' },
    { input_type: 'DATAFILE', total_backups: 12, size_gb: 4.2, status: 'WARNING' }
]

export const MOCK_NLS = {
    language: 'AMERICAN',
    territory: 'AMERICA',
    db_charset: 'AL32UTF8'
}
