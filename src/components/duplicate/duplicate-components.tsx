import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Terminal, Copy, Server, CheckCircle2, ShieldAlert, Activity, Database } from "lucide-react"

export interface DuplicateSourceInfo {
    database: {
        name: string;
        db_unique_name: string;
        open_mode: string;
        log_mode: string;
        database_role: string;
        platform_name: string;
    };
    size: {
        datafile_count: number;
        total_size_gb: number;
    };
    temp_tablespaces: {
        tablespace: string;
        size_mb: number;
        file_count: number;
    }[];
    memory_parameters: {
        name: string;
        value: string;
        display: string;
    }[];
    activity: {
        sessions: number;
        open_cursors: number;
    };
    connection_string: string;
}

// --- Helper Code Block Component ---
function CodeBlock({ code, title = "Script" }: { code: string; title?: string }) {
    return (
        <div className="flex flex-col gap-2 mt-4">
            <Label className="text-primary font-bold">{title}</Label>
            <div className="flex-1 rounded-md bg-zinc-950 p-4 text-zinc-50 font-mono text-sm shadow-inner relative group border border-zinc-800">
                <Terminal className="absolute top-4 right-4 text-zinc-700 size-5" />
                <div className="whitespace-pre-wrap break-all text-xs leading-relaxed text-blue-400">{code}</div>
                <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => navigator.clipboard.writeText(code)}
                    title="Copy to Clipboard"
                >
                    <Copy className="size-4" />
                </Button>
            </div>
        </div>
    )
}

// --- Tab 1: Source Info & Connectivity ---
export function SourceInfoTab({ info }: { info: DuplicateSourceInfo | null }) {
    if (!info) return <div className="p-8 text-center text-muted-foreground">Loading source information...</div>

    const tnsCode = `
# Target TNS Alias (Add to tnsnames.ora on the RMAN Client/Source)
TARGET_DB =
  (DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(HOST = target_host_ip)(PORT = 1521))
    (CONNECT_DATA =
      (SERVER = DEDICATED)
      (SERVICE_NAME = target_service_name)
    )
  )

# Test Connectivity using SQL*Plus
sqlplus sys/password@TARGET_DB as sysdba
`.trim()

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-surface border-border">
                    <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Source DB Name</CardTitle>
                        <Database className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent className="py-2">
                        <div className="text-xl font-bold text-primary">{info.database.name}</div>
                        <p className="text-[10px] text-muted-foreground font-mono">{info.database.db_unique_name} ({info.database.database_role})</p>
                    </CardContent>
                </Card>
                <Card className="bg-surface border-border">
                    <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Est. Size</CardTitle>
                        <Server className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent className="py-2">
                        <div className="text-xl font-bold">{info.size.total_size_gb} GB</div>
                        <p className="text-[10px] text-muted-foreground font-mono">{info.size.datafile_count} Datafiles</p>
                    </CardContent>
                </Card>
                <Card className="bg-surface border-border">
                    <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Memory Config</CardTitle>
                        <Activity className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent className="py-2">
                        <div className="space-y-1 text-xs font-mono">
                            {info.memory_parameters.map(p => (
                                <div key={p.name} className="flex justify-between">
                                    <span className="text-muted-foreground">{p.name}:</span>
                                    <span className="font-semibold">{p.display}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-surface border-border">
                    <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase">DB Status</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent className="py-2">
                        <div className="text-sm font-bold flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-[10px]">
                                {info.database.log_mode}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{info.database.open_mode}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Platform: {info.database.platform_name}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold mb-2">Connectivity Preparation</h3>
                <p className="text-xs text-muted-foreground mb-4">
                    Before duplicating the database, verify that the Source (RMAN client) can communicate with the Auxiliary (Target) instance.
                </p>
                <CodeBlock code={tnsCode} title="Network Configuration & Test" />
            </div>
        </div>
    )
}

// --- Tab 2: Initialization ---
export function InitializationTab() {
    const [dbName, setDbName] = useState('DUPDB')
    const [sgaTarget, setSgaTarget] = useState('10G')
    const [controlFiles, setControlFiles] = useState('/dup/oracle/oradata/prod/control01.ctl, /dup/oracle/oradata/prod/control02.ctl')
    const [dbConvert, setDbConvert] = useState('/oracle/oradata/prod/,/dup/oracle/oradata/prod/')
    const [logConvert, setLogConvert] = useState('/oracle/oradata/prod/redo,/dup/oracle/oradata/prod/redo')
    const [isPdb, setIsPdb] = useState(false)
    const [useDiag, setUseDiag] = useState(true)

    let initCode = `
# Minimum Requirement
DB_NAME=${dbName}
sga_target=${sgaTarget}
remote_login_passwordfile=exclusive
`.trim()

    if (isPdb) initCode += `\nenable_pluggable_database=true`
    if (useDiag) initCode += `\ndiagnostic_dest=/u01/app/oracle`
    initCode += `\nCONTROL_FILES=(${controlFiles})`
    initCode += `\nDB_FILE_NAME_CONVERT=(${dbConvert})`
    initCode += `\nLOG_FILE_NAME_CONVERT=(${logConvert})`

    const mkdirCode = `
# Create required directories on the target host
mkdir -p /dup/oracle/oradata/prod/
mkdir -p /dup/oracle/oradata/prod/redo
mkdir -p /u01/app/oracle/admin/${dbName}/adump
`.trim()

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="space-y-4 p-4 border border-border rounded-md bg-surface">
                <h3 className="text-sm font-semibold mb-2">Auxiliary init.ora Configuration</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Target DB_NAME</Label>
                        <Input value={dbName} onChange={(e) => setDbName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>SGA Target</Label>
                        <Input value={sgaTarget} onChange={(e) => setSgaTarget(e.target.value)} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>CONTROL_FILES (comma separated)</Label>
                    <Input value={controlFiles} onChange={(e) => setControlFiles(e.target.value)} />
                </div>

                <div className="space-y-2">
                    <Label>DB_FILE_NAME_CONVERT (source, target)</Label>
                    <Input value={dbConvert} onChange={(e) => setDbConvert(e.target.value)} />
                </div>

                <div className="space-y-2">
                    <Label>LOG_FILE_NAME_CONVERT (source, target)</Label>
                    <Input value={logConvert} onChange={(e) => setLogConvert(e.target.value)} />
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="pdb_cb" checked={isPdb} onChange={(e) => setIsPdb(e.target.checked)} />
                        <Label htmlFor="pdb_cb">Enable Pluggable Database</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="diag_cb" checked={useDiag} onChange={(e) => setUseDiag(e.target.checked)} />
                        <Label htmlFor="diag_cb">Use Diagnostic Dest</Label>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <CodeBlock code={initCode} title="init.ora File Content (e.g., initdupdb.ora)" />
                <CodeBlock code={mkdirCode} title="Directory Creation Script (Target Host)" />
            </div>
        </div>
    )
}

// --- Tab 3: Duplicate Command ---
export function DuplicateCommandTab() {
    const [creationType, setCreationType] = useState('ACTIVE')
    const [targetType, setTargetType] = useState('FILESYSTEM')
    const [channels, setChannels] = useState(4)
    const [dbName, setDbName] = useState('DUPDB')

    let rmanCode = `
# Connect to both databases
rman target sys/password@PROD_DB auxiliary sys/password@DUPDB_TARGET

RUN {
`.trim() + "\n"

    for (let i = 1; i <= channels; i++) {
        rmanCode += `  ALLOCATE AUXILIARY CHANNEL c${i} DEVICE TYPE DISK;\n`
    }

    rmanCode += `\n  DUPLICATE TARGET DATABASE TO ${dbName}\n`
    
    if (creationType === 'ACTIVE') {
        rmanCode += `  FROM ACTIVE DATABASE\n`
    } else {
        rmanCode += `  BACKUP LOCATION '/path/to/rman/backups'\n`
    }

    if (targetType === 'ASM') {
        rmanCode += `  SPFILE\n    SET DB_CREATE_FILE_DEST='+DATA'\n    SET DB_CREATE_ONLINE_LOG_DEST_1='+REDO'\n`
    }

    rmanCode += `  NOFILENAMECHECK;\n`

    rmanCode += `\n`
    for (let i = 1; i <= channels; i++) {
        rmanCode += `  RELEASE CHANNEL c${i};\n`
    }
    rmanCode += `}`

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="space-y-6 p-4 border border-border rounded-md bg-surface">
                
                <div className="space-y-3">
                    <Label>Duplication Strategy</Label>
                    <RadioGroup value={creationType} onValueChange={setCreationType} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ACTIVE" id="active_db" />
                            <Label htmlFor="active_db">From Active Database</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="BACKUP" id="backup_db" />
                            <Label htmlFor="backup_db">From RMAN Backup</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-3">
                    <Label>Target Storage Type</Label>
                    <RadioGroup value={targetType} onValueChange={setTargetType} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="FILESYSTEM" id="fs_db" />
                            <Label htmlFor="fs_db">Filesystem (use convert)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ASM" id="asm_db" />
                            <Label htmlFor="asm_db">ASM (Oracle Managed Files)</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Auxiliary Channels (Parallelism)</Label>
                        <select 
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 shadow-sm text-sm" 
                            value={channels} 
                            onChange={(e) => setChannels(Number(e.target.value))}
                        >
                            <option value={1}>1 Channel</option>
                            <option value={2}>2 Channels</option>
                            <option value={4}>4 Channels</option>
                            <option value={8}>8 Channels</option>
                            <option value={16}>16 Channels (Enterprise)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label>Target DB Name</Label>
                        <Input value={dbName} onChange={(e) => setDbName(e.target.value)} />
                    </div>
                </div>

                <div className="text-xs text-amber-500 bg-amber-500/10 p-3 rounded border border-amber-500/20">
                    <ShieldAlert className="size-4 inline mr-2 -mt-0.5" />
                    <strong>Note:</strong> Enterprise Edition is recommended when using more than 1 channel. Active Database cloning over network requires sufficient bandwidth.
                </div>
            </div>

            <div className="flex flex-col">
                <CodeBlock code={rmanCode} title="RMAN Duplicate Command" />
            </div>
        </div>
    )
}

// --- Tab 4: Validation Environment ---
export function ValidationTab() {
    const checklistCode = `
# 1. Start the Auxiliary Instance in NOMOUNT mode
export ORACLE_SID=dupdb
sqlplus / as sysdba
SQL> startup nomount pfile='initdupdb.ora';

# 2. Check listener connectivity
lsnrctl status

# 3. Test TNS from RMAN server to Target
tnsping TARGET_DB

# 4. Connect to both with RMAN to verify credentials
rman target sys/pwd@PROD_DB auxiliary sys/pwd@TARGET_DB
RMAN> show all;
`.trim()

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-lg font-semibold tracking-tight">Pre-Duplication Checklist</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-muted/10">
                    <CardHeader className="py-3">
                        <CardTitle className="text-sm">1. Operating System Checks</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p>✓ Ensure target directories exist and have oracle ownership.</p>
                        <p>✓ Verify memory sizing fits in target physical memory.</p>
                        <p>✓ Check disk space matches source database size.</p>
                    </CardContent>
                </Card>
                <Card className="bg-muted/10">
                    <CardHeader className="py-3">
                        <CardTitle className="text-sm">2. Oracle Networking (TNS)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p>✓ Configure static listener for the auxiliary instance (required for grid/remote dup).</p>
                        <p>✓ Configure tnsnames.ora with consistent aliases.</p>
                        <p>✓ Password files must be identical if using Active Duplicate.</p>
                    </CardContent>
                </Card>
            </div>
            <CodeBlock code={checklistCode} title="Auxiliary Instance Startup Instructions" />
        </div>
    )
}

// --- Tab 5: Temp Tablespaces ---
export function TempTablespacesTab({ info }: { info: DuplicateSourceInfo | null }) {
    if (!info) return null

    let tempCode = `-- Verify temporary tablespaces after duplication\nSELECT name, bytes/1024/1024 as size_mb FROM v$tempfile;\n\n`
    
    if (info.temp_tablespaces && info.temp_tablespaces.length > 0) {
        tempCode += `-- Recreate Tempfiles matching source (Review file paths before execution!)\n`
        info.temp_tablespaces.forEach(ts => {
            const path = `/dup/oracle/oradata/prod/temp_${ts.tablespace.toLowerCase()}01.dbf`
            tempCode += `ALTER TABLESPACE ${ts.tablespace} ADD TEMPFILE '${path}' SIZE ${ts.size_mb}M AUTOEXTEND ON;\n`
        })
    } else {
        tempCode += `-- No temporary tablespaces found on source.\n`
    }

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">Temporary Tablespace Management</h2>
            <p className="text-sm text-muted-foreground">
                RMAN Duplicate does not duplicate temporary tablespace files. Although they are created as empty logical constructs in the dictionary, you usually need to add physical tempfiles post-duplication if using a different directory structure. 
            </p>
            <CodeBlock code={tempCode} title="Add Tempfiles Script (SQL*Plus / SQL Developer)" />
        </div>
    )
}

// --- Tab 6: Post Verification ---
export function PostVerificationTab() {
    const postCode = `
-- Post-Migration Verification Checks
SELECT name, open_mode, database_role, created FROM v$database;

SELECT count(*), status FROM dba_data_files GROUP BY status;

SELECT * FROM v$recover_file;

-- Invalid objects compilation
@?/rdbms/admin/utlrp.sql

-- Check for invalid objects
SELECT owner, object_type, count(*) 
FROM dba_objects 
WHERE status = 'INVALID' 
GROUP BY owner, object_type;

-- Re-enable constraints or triggers if disabled
SELECT table_name, constraint_name, status 
FROM dba_constraints 
WHERE status = 'DISABLED';
`.trim()

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">Post Migration Validation</h2>
            <p className="text-sm text-muted-foreground">
                After RMAN completes the duplication, the database is opened with RESETLOGS and a new DBID is generated. Execute these queries to validate consistency and health of the copied database.
            </p>
            <CodeBlock code={postCode} title="Validation Scripts" />
        </div>
    )
}
