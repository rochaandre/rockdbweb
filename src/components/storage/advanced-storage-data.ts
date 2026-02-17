export interface SysauxOccupant {
    schema: string
    name: string
    space_usage: string
    space_mb: number
}

export const SYSAUX_OCCUPANTS: SysauxOccupant[] = [
    { schema: 'SYS', name: 'SM/AWR', space_usage: '1.2 GB', space_mb: 1200 },
    { schema: 'SYS', name: 'SM/OPTSTAT', space_usage: '450 MB', space_mb: 450 },
    { schema: 'XDB', name: 'XDB', space_usage: '200 MB', space_mb: 200 },
    { schema: 'SYS', name: 'JOB_SCHEDULER', space_usage: '50 MB', space_mb: 50 },
    { schema: 'ORDSYS', name: 'ORDIM', space_usage: '20 MB', space_mb: 20 },
]

export interface UndoStat {
    begin_time: string
    end_time: string
    undoblks: number
    txncount: number
    maxquerylen: number
    maxconcurrency: number
}

export const UNDO_STATS: UndoStat[] = [
    { begin_time: '19:40', end_time: '19:50', undoblks: 450, txncount: 120, maxquerylen: 300, maxconcurrency: 5 },
    { begin_time: '19:50', end_time: '20:00', undoblks: 520, txncount: 145, maxquerylen: 420, maxconcurrency: 8 },
    { begin_time: '20:00', end_time: '20:10', undoblks: 380, txncount: 90, maxquerylen: 120, maxconcurrency: 4 },
]

export interface TempUsage {
    sid: number
    serial: number
    username: string
    program: string
    tablespace: string
    mb_used: number
    sql_id: string
}

export const TEMP_USAGE: TempUsage[] = [
    { sid: 25, serial: 1024, username: 'REPORT_USR', program: 'python@host1', tablespace: 'TEMP', mb_used: 1024, sql_id: '8a9x7b6c' },
    { sid: 140, serial: 231, username: 'ETL_PROC', program: 'sqlplus@host1', tablespace: 'TEMP', mb_used: 512, sql_id: '3z2y1x0w' },
]

export const DB_GROWTH_HISTORY = [
    { date: '2025-01-01', allocated: 240, used: 180 },
    { date: '2025-02-01', allocated: 250, used: 195 },
    { date: '2025-03-01', allocated: 250, used: 210 },
    { date: '2025-04-01', allocated: 280, used: 235 },
    { date: '2025-05-01', allocated: 300, used: 260 },
]

export const TEMP_HISTORY = [
    { time: '18:00', used_mb: 120 },
    { time: '19:00', used_mb: 450 },
    { time: '20:00', used_mb: 1536 },
    { time: '21:00', used_mb: 800 },
]
