/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: sessions-data.ts
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
export const MOCK_SESSIONS = [
    {
        sid: '124',
        serial: '55212',
        inst_id: '1',
        username: 'HR_APP_OWNER',
        status: 'ACTIVE',
        osuser: 'app_server',
        machine: 'node-app-01',
        program: 'JDBC Thin Client',
        module: 'PAYROLL_MODULE',
        logon_time: '2026-02-16 08:00:12',
        last_call_et: 45,
        sql_id: '9y6zghyqw1z77',
        event: 'db file sequential read',
        wait_class: 'User I/O',
        seconds_in_wait: 12,
        blocking_status: 'NONE',
        paddr: '000000009B21FA90'
    },
    {
        sid: '442',
        serial: '12882',
        inst_id: '1',
        username: 'SYS',
        status: 'ACTIVE',
        osuser: 'oracle',
        machine: 'oracle-srv-01',
        program: 'sqlplus@oracle-srv-01 (TNS V1-V3)',
        module: 'SQL*Plus',
        logon_time: '2026-02-16 10:30:00',
        last_call_et: 2,
        sql_id: '3b8vjnxmx8z11',
        event: 'SQL*Net message from client',
        wait_class: 'Network',
        seconds_in_wait: 0,
        blocking_status: 'BLOCKER',
        paddr: '000000009B21FB10'
    },
    {
        sid: '215',
        serial: '44102',
        inst_id: '1',
        username: 'REPORTING_SVC',
        status: 'INACTIVE',
        osuser: 'svc_acc',
        machine: 'reporting-host',
        program: 'oracle@reporting-host (TNS V1-V3)',
        module: 'DATA_WAREHOUSE',
        logon_time: '2026-02-16 01:20:44',
        last_call_et: 1240,
        sql_id: null,
        event: 'SQL*Net message from client',
        wait_class: 'Idle',
        seconds_in_wait: 1240,
        blocking_status: 'WAITING',
        blocking_sid: '442',
        paddr: '000000009B21FC40'
    }
]

export const MOCK_BLOCKING = [
    {
        blocking_sid: '442',
        waiting_sid: '215',
        inst_id: '1',
        seconds_in_wait: 450,
        lock_type: 'TM (Table Lock)',
        operation: 'ENQUEUE'
    },
    {
        blocking_sid: '442',
        waiting_sid: '881',
        inst_id: '1',
        seconds_in_wait: 120,
        lock_type: 'TX (Row Lock)',
        operation: 'ENQUEUE'
    }
]

export const MOCK_LONG_OPS = [
    {
        sid: '124',
        username: 'HR_APP_OWNER',
        opname: 'Table Scan',
        target: 'SALARY_HISTORY',
        sofar: 45000,
        totalwork: 120000,
        units: 'Blocks',
        start_time: '2026-02-16 10:40:00',
        elapsed_seconds: 45,
        time_remaining: 120
    },
    {
        sid: '921',
        username: 'SYS',
        opname: 'RMAN: Aggregate Input',
        target: 'DATABASE',
        sofar: 88,
        totalwork: 100,
        units: 'Percent',
        start_time: '2026-02-16 10:10:00',
        elapsed_seconds: 2400,
        time_remaining: 300
    }
]

export const MOCK_STATS = {
    total: 452,
    active: 28,
    inactive: 424,
    blocking: 2,
    parallel: 45,
    background: 88
}

export const MOCK_SQL_PLAN = [
    {
        id: 0,
        operation: 'SELECT STATEMENT',
        options: '',
        object_name: '',
        cost: 1450,
        rows: 25000,
        bytes: 1250000,
        cpu_cost: 45212,
        io_cost: 1280
    },
    {
        id: 1,
        operation: '  HASH JOIN',
        options: '',
        object_name: '',
        cost: 1450,
        rows: 25000,
        bytes: 1250000,
        cpu_cost: 45212,
        io_cost: 1280
    },
    {
        id: 2,
        operation: '    TABLE ACCESS',
        options: 'FULL',
        object_name: 'SALARY_HISTORY',
        cost: 650,
        rows: 120000,
        bytes: 4500000,
        cpu_cost: 12500,
        io_cost: 580
    },
    {
        id: 3,
        operation: '    TABLE ACCESS',
        options: 'BY INDEX ROWID',
        object_name: 'EMPLOYEES',
        cost: 480,
        rows: 4500,
        bytes: 250000,
        cpu_cost: 8500,
        io_cost: 420
    },
    {
        id: 4,
        operation: '      INDEX',
        options: 'RANGE SCAN',
        object_name: 'EMP_DEPARTMENT_IX',
        cost: 12,
        rows: 450,
        bytes: 0,
        cpu_cost: 250,
        io_cost: 8
    }
]
