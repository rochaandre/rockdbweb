import type { SessionDetail } from './detail-sidebar'

export const SESSIONS_DATA: (Partial<SessionDetail> & {
    fileIO?: string
    cpu?: string
    command?: string
    lckObj?: string
    status?: string
    pqs?: string
    owner?: string
    completed?: string
    elapsed?: string
    remain?: string
    temp?: string
})[] = [
        { sid: 537, serial: 30684, username: 'N108044', fileIO: '', cpu: '', command: 'SELECT', lckObj: '', status: 'ACTIVE', pqs: '', owner: '', completed: '', elapsed: '', remain: '', temp: '', event: 'On CPU', sqlText: 'SELECT * FROM DUAL', waitInfo: ['On CPU'], schema: 'SYS', logonTime: '1/28 08:00', pid: 100, osPid: 1000, pga: '10 MB', lastCallEt: 0, sqlId: 'a1b2c3d4e5', child: 0 },

        {
            sid: 1644, serial: 38019, username: 'C107841', fileIO: '', cpu: '99.0', command: 'SELECT', lckObj: '202', status: 'ACTIVE', pqs: '', owner: '', completed: '', elapsed: '', remain: '', temp: '', event: 'On CPU',
            schema: 'SYS',
            logonTime: '1/28 08:51:32',
            pid: 927,
            osPid: 9017,
            pga: '85.6 MB',
            lastCallEt: 0,
            sqlId: 'cvbr9sfpk52jb',
            child: 2,
            waitInfo: ['SQL*Net message to client', 'Seq#=7993', 'driver id=0x54435000', '#bytes=1', 'Wait_Time<.01 sec'],
            sqlText: `SELECT DISTINCT \nC.TABLE_NAME, \nC.CONSTRAINT_NAME FROM \nALL_CONSTRAINTS C, \nALL_CONS_COLUMNS CC \nWHERE \nC.CONSTRAINT_TYPE = 'R' \nAND CC.OWNER = C.OWNER \nAND CC.CONSTRAINT_NAME \n= C.R_CONSTRAINT_NAME \nAND CC.OWNER = 'DBAMV'`
        },

        // More data
        { sid: 1700, serial: 12345, username: 'APP_SVC', fileIO: '2.5', cpu: '12.0', command: 'UPDATE', lckObj: '505', status: 'ACTIVE', pqs: '', owner: 'APP', completed: '55', elapsed: '120', remain: '90', temp: '200', event: 'db file sequential read', sqlText: 'UPDATE orders SET status = :1 WHERE id = :2', waitInfo: ['db file sequential read', 'file#=4', 'block#=1234'], schema: 'APP', logonTime: '1/28 09:10', pid: 200, osPid: 2001, pga: '45 MB', lastCallEt: 5, sqlId: 'uu88ii99oo', child: 0 },

        { sid: 1850, serial: 99887, username: 'REPORTING', fileIO: '15.0', cpu: '45.0', command: 'SELECT', lckObj: '', status: 'ACTIVE', pqs: '4', owner: 'DW', completed: '', elapsed: '500', remain: '', temp: '1.2G', event: 'direct path read temp', sqlText: 'SELECT /*+ PARALLEL(4) */ * FROM big_table', waitInfo: ['direct path read temp', 'file#=201', 'block#=9999'], schema: 'DW', logonTime: '1/28 07:45', pid: 305, osPid: 3004, pga: '512 MB', lastCallEt: 12, sqlId: 'pp00oo99ii', child: 1 },

        { sid: 1920, serial: 11223, username: 'BK_PROCESS', fileIO: '', cpu: '0.1', command: 'INSERT', lckObj: '', status: 'INACTIVE', pqs: '', owner: '', completed: '', elapsed: '', remain: '', temp: '', event: 'SQL*Net message from client', sqlText: 'INSERT INTO logs VALUES (...)', waitInfo: ['SQL*Net message from client'], schema: 'LOGS', logonTime: '1/28 06:00', pid: 110, osPid: 1102, pga: '5 MB', lastCallEt: 600, sqlId: 'xx11yy22zz', child: 0 },

        { sid: 2001, serial: 44556, username: 'DBA_USER', fileIO: '', cpu: '5.0', command: 'ALTER', lckObj: '', status: 'ACTIVE', pqs: '', owner: 'SYS', completed: '', elapsed: '2', remain: '', temp: '', event: 'library cache lock', sqlText: 'ALTER SYSTEM FLUSH SHARED_POOL', waitInfo: ['library cache lock', 'handle address=...'], schema: 'SYS', logonTime: '1/28 10:00', pid: 500, osPid: 5005, pga: '20 MB', lastCallEt: 2, sqlId: 'aa11bb22cc', child: 0 },

        { sid: 2050, serial: 77889, username: 'LONG_JOB', fileIO: '50.0', cpu: '30.0', command: 'PL/SQL', lckObj: '', status: 'ACTIVE', pqs: '', owner: 'JOB', completed: '12', elapsed: '3600', remain: '20000', temp: '5.5G', event: 'CPU', sqlText: 'BEGIN long_running_proc; END;', waitInfo: ['On CPU'], schema: 'JOB', logonTime: '1/27 22:00', pid: 888, osPid: 8088, pga: '2 GB', lastCallEt: 4, sqlId: 'jj33kk44ll', child: 0 },

        { sid: 2100, serial: 99112, username: 'BAD_USER', fileIO: '', cpu: '0.0', command: 'SELECT', lckObj: '', status: 'KILLED', pqs: '', owner: 'HR', completed: '', elapsed: '400', remain: '', temp: '', event: 'SQL*Net message to client', sqlText: 'select * from employees', waitInfo: ['SQL*Net message to client'], schema: 'HR', logonTime: '1/28 10:15', pid: 600, osPid: 6001, pga: '1 MB', lastCallEt: 400, sqlId: 'zz99xx88yy', child: 0 },

        { sid: 2200, serial: 33445, username: 'PARALLEL_GUY', fileIO: '22.0', cpu: '15.0', command: 'SELECT', lckObj: '', status: 'ACTIVE', pqs: '8', owner: 'DW', completed: '', elapsed: '150', remain: '60', temp: '500 MB', event: 'PX Deq: Execution Msg', sqlText: 'SELECT /*+ PARALLEL(8) */ * FROM sales', waitInfo: ['PX Deq: Execution Msg'], schema: 'DW', logonTime: '1/28 09:30', pid: 700, osPid: 7001, pga: '200 MB', lastCallEt: 10, sqlId: 'pp77oo66ii', child: 0 }
    ]

// Mock Long Ops Data
export const LONG_OPS_DATA = [
    {
        sid: 532,
        serial: 12112,
        opname: 'Table Scan',
        target: 'SALES',
        target_desc: 'Table Scan',
        sofar: 45000,
        totalwork: 90000,
        units: 'Blocks',
        start_time: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
        time_remaining: 300, // seconds
        message: 'Table Scan:  SALES: 45000 out of 90000 Blocks done',
        username: 'APP_USER',
        sql_id: '8a9q0w8s7d'
    },
    {
        sid: 890,
        serial: 456,
        opname: 'RMAN Backup',
        target: 'MOCK_DB',
        target_desc: 'RMAN Backup',
        sofar: 120,
        totalwork: 2000,
        units: 'MB',
        start_time: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        time_remaining: 4500, // seconds
        message: 'RMAN:  MOCK_DB: 120 out of 2000 MB done',
        username: 'SYS',
        sql_id: 'rmanbackup12'
    },
    {
        sid: 1644,
        serial: 34222,
        opname: 'Index Creation',
        target: 'IDX_SALES_DATE',
        target_desc: 'Index Build',
        sofar: 8500,
        totalwork: 10000,
        units: 'Rows',
        start_time: new Date(Date.now() - 1000 * 60 * 2), // 2 mins ago
        time_remaining: 45, // seconds
        message: 'Index Build:  IDX_SALES_DATE: 8500 out of 10000 Rows done',
        username: 'DBA_ADMIN',
        sql_id: 'idxcreate99'
    }
]
