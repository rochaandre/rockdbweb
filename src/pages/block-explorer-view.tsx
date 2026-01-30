
import { useParams, useNavigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Database, Lock, Activity, FileText, Table, AlertTriangle, Code } from 'lucide-react'
import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

// Mock Data for Block Explorer
const MOCK_BLOCKER_DETAILS = {
    sid: 105,
    serial: 4521,
    username: 'SYSTEM',
    status: 'ACTIVE',
    sqlText: `UPDATE employees SET salary = salary * 1.05 WHERE department_id = 10;`,
    plan: [
        { id: 0, operation: 'UPDATE STATEMENT', object: '', cost: 15 },
        { id: 1, operation: 'UPDATE', object: 'EMPLOYEES', cost: '' },
        { id: 2, operation: 'TABLE ACCESS FULL', object: 'EMPLOYEES', cost: 15 },
    ],
    objects: [
        { type: 'TABLE', owner: 'HR', name: 'EMPLOYEES', ddl: `CREATE TABLE "HR"."EMPLOYEES" \n   (	"EMPLOYEE_ID" NUMBER(6,0), \n	"FIRST_NAME" VARCHAR2(20), \n	"LAST_NAME" VARCHAR2(25) CONSTRAINT "EMP_LAST_NAME_NN" NOT NULL ENABLE, \n	"EMAIL" VARCHAR2(25) CONSTRAINT "EMP_EMAIL_NN" NOT NULL ENABLE, \n	"PHONE_NUMBER" VARCHAR2(20), \n	"HIRE_DATE" DATE CONSTRAINT "EMP_HIRE_DATE_NN" NOT NULL ENABLE, \n	"JOB_ID" VARCHAR2(10) CONSTRAINT "EMP_JOB_NN" NOT NULL ENABLE, \n	"SALARY" NUMBER(8,2), \n	"COMMISSION_PCT" NUMBER(2,2), \n	"MANAGER_ID" NUMBER(6,0), \n	"DEPARTMENT_ID" NUMBER(4,0), \n	 CONSTRAINT "EMP_SAL_CHK" CHECK (salary > 0) ENABLE, \n	 CONSTRAINT "EMP_EMP_ID_PK" PRIMARY KEY ("EMPLOYEE_ID")\n  USING INDEX  ENABLE\n   ) ;` },
        { type: 'TRIGGER', owner: 'HR', name: 'EMP_SALARY_TRG', ddl: `CREATE OR REPLACE TRIGGER "HR"."EMP_SALARY_TRG" \nBEFORE UPDATE OF salary ON employees\nFOR EACH ROW\nBEGIN\n  IF :new.salary < :old.salary THEN\n    RAISE_APPLICATION_ERROR(-20001, 'Salary cannot be decreased');\n  END IF;\nEND;` },
    ],
    lockStats: {
        usersInLock: 3,
        openedCursors: 42,
        lockedTableSize: '2.5 GB'
    }
}

export function BlockExplorerView() {
    const { sid } = useParams()
    const navigate = useNavigate()
    const [selectedObject, setSelectedObject] = useState<any | null>(null)

    // In a real app, fetch details by SID
    const details = MOCK_BLOCKER_DETAILS

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-background overflow-hidden">
                {/* Header */}
                <div className="border-b border-border bg-muted/20 p-2 flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                    </Button>
                    <h1 className="text-sm font-semibold flex items-center gap-2">
                        <Lock className="h-4 w-4 text-amber-600" />
                        Block Explorer - SID {sid}
                    </h1>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

                        {/* Session Info */}
                        <Card>
                            <CardHeader className="py-2 pb-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                    <Activity className="h-4 w-4" /> Session Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="text-2xl font-bold">{details.username}</div>
                                <div className="text-sm text-muted-foreground">SID: {details.sid}, Serial: {details.serial}</div>
                                <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {details.status}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lock Stats */}
                        <Card>
                            <CardHeader className="py-2 pb-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" /> Lock Statistics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2 space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Users in Lock:</span>
                                    <span className="font-bold">{details.lockStats.usersInLock}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Open Cursors:</span>
                                    <span className="font-bold">{details.lockStats.openedCursors}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Locked Table Size:</span>
                                    <span className="font-bold">{details.lockStats.lockedTableSize}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* SQL Text */}
                        <Card className="col-span-1 md:col-span-2 lg:col-span-2">
                            <CardHeader className="py-2 pb-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Current SQL
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="bg-muted/10 border border-border rounded p-2 font-mono text-xs overflow-auto max-h-32">
                                    {details.sqlText}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Execution Plan (Moved Up) */}
                        <Card className="col-span-full">
                            <CardHeader className="py-2 pb-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                    <Table className="h-4 w-4" /> Execution Plan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="border border-border rounded-md overflow-hidden">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-muted/20 text-muted-foreground">
                                            <tr>
                                                <th className="px-2 py-1 w-12">ID</th>
                                                <th className="px-2 py-1">Operation</th>
                                                <th className="px-2 py-1">Object</th>
                                                <th className="px-2 py-1 w-20">Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody className="font-mono">
                                            {details.plan.map((row) => (
                                                <tr key={row.id} className="border-t border-border">
                                                    <td className="px-2 py-1">{row.id}</td>
                                                    <td className="px-2 py-1" style={{ paddingLeft: `${(row.id * 10) + 8}px` }}>{row.operation}</td>
                                                    <td className="px-2 py-1">{row.object}</td>
                                                    <td className="px-2 py-1">{row.cost}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Related Objects - Selection */}
                        <Card className="col-span-1 md:col-span-2">
                            <CardHeader className="py-2 pb-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                    <Database className="h-4 w-4" /> Related Objects
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="border border-border rounded-md overflow-hidden h-40">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-muted/20 text-muted-foreground sticky top-0">
                                            <tr>
                                                <th className="px-2 py-1">Type</th>
                                                <th className="px-2 py-1">Owner</th>
                                                <th className="px-2 py-1">Name</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {details.objects.map((obj, i) => (
                                                <tr
                                                    key={i}
                                                    className={`border-t border-border cursor-pointer hover:bg-muted/50 ${selectedObject === obj ? 'bg-primary/10' : ''}`}
                                                    onClick={() => setSelectedObject(obj)}
                                                >
                                                    <td className="px-2 py-1">{obj.type}</td>
                                                    <td className="px-2 py-1">{obj.owner}</td>
                                                    <td className="px-2 py-1 font-medium">{obj.name}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1">Select an object to view DDL below.</p>
                            </CardContent>
                        </Card>

                        {/* Object DDL - Details */}
                        <Card className="col-span-1 md:col-span-2 flex flex-col">
                            <CardHeader className="py-2 pb-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                    <Code className="h-4 w-4" /> Object Statistics / DDL
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2 flex-1 min-h-0">
                                <ScrollArea className="h-40 w-full rounded-md border border-border bg-muted/10 p-2">
                                    {selectedObject ? (
                                        <pre className="font-mono text-xs whitespace-pre-wrap text-foreground">
                                            {selectedObject.ddl}
                                        </pre>
                                    ) : (
                                        <div className="text-xs text-muted-foreground flex items-center justify-center h-full">
                                            Select an object to view details
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
