
export interface ScriptNode {
    id: string
    name: string
    type: 'folder' | 'file'
    children?: ScriptNode[]
    content?: string
}

export const MOCK_FILE_SYSTEM: ScriptNode[] = [
    {
        id: 'ddl',
        name: 'DDL',
        type: 'folder',
        children: []
    },
    {
        id: 'invalid',
        name: 'Invalid',
        type: 'folder',
        children: []
    },
    {
        id: 'matviews',
        name: 'MatViews',
        type: 'folder',
        children: []
    },
    {
        id: 'redo_arch',
        name: 'Redo Logs Archi',
        type: 'folder',
        children: []
    },
    {
        id: 'redo_onlin',
        name: 'Redo Logs Onlin',
        type: 'folder',
        children: []
    },
    {
        id: 'rowid',
        name: 'Rowid',
        type: 'folder',
        children: []
    },
    {
        id: 'segments',
        name: 'Segments',
        type: 'folder',
        children: []
    },
    {
        id: 'segm_indexes',
        name: 'Segm_Indexes',
        type: 'folder',
        children: []
    },
    {
        id: 'segm_tables',
        name: 'Segm_Tables',
        type: 'folder',
        children: []
    },
    {
        id: 'sessions',
        name: 'Sessions',
        type: 'folder',
        children: []
    },
    {
        id: 'spm',
        name: 'SPM',
        type: 'folder',
        children: []
    },
    {
        id: 'sql_area',
        name: 'SQL Area',
        type: 'folder',
        children: [
            {
                id: 'sql_details_template',
                name: 'SQL Analysis.sql',
                type: 'file',
                content: `select * from gv$sql where sql_id=':sql_id';
select * from gv$sql where address='000000020F2D8058' and hash_value=2160742147;
select * from gv$sqlarea where sql_id=':sql_id';
select * from gv$sqlstats where sql_id=':sql_id';
select * from dba_hist_sqlstat where sql_id=':sql_id' order by instance_number, snap_id desc;

-- Plans for a given SQL:
select * from table(DBMS_XPLAN.DISPLAY_CURSOR(':sql_id', NULL, 'ALL'));
-- Plan statistics for last execution:
select * from table(DBMS_XPLAN.DISPLAY_CURSOR(':sql_id', NULL, 'ALLSTATS LAST'));
-- Plans recorded in AWR - can be used to check if the plan was changing:
select * from table(DBMS_XPLAN.DISPLAY_AWR(':sql_id', 3555082078, NULL, 'ALL'));
select * from table(DBMS_XPLAN.DISPLAY_AWR(':sql_id', NULL, NULL, 'ALL'));
select * from v$sql_plan where sql_id=':sql_id';
select * from dba_hist_sql_plan where sql_id=':sql_id';

-- Miscellaneous SQL info:
select * from gv$open_cursor where sql_id=':sql_id';
select * from gv$tempseg_usage where sql_id=':sql_id';
select sql_id, child_number, name, position, value_string`
            }
        ]
    },
    {
        id: 'prd',
        name: 'PRD',
        type: 'folder',
        children: [
            {
                id: 'stats',
                name: 'Stats',
                type: 'file',
                content: 'SELECT * FROM v$sysstat;'
            },
            {
                id: 'transactions',
                name: 'Transactions',
                type: 'file',
                content: 'SELECT * FROM v$transaction;'
            }
        ]
    }
]

export const MOCK_RESULTS_GRID = [
    { col1: 'SYSDATE' },
    { col1: '1/29/2026 21:10:23' }
]
