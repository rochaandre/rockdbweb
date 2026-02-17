
export interface AsmDiskGroup {
    name: string
    state: 'MOUNTED' | 'DISMOUNTED'
    type: 'EXTERN' | 'NORMAL' | 'HIGH'
    totalMb: number
    freeMb: number
    usableFreeMb: number
    offlineDisks: number
}

export interface AsmDisk {
    groupName: string
    diskNumber: number
    headerStatus: 'MEMBER' | 'CANDIDATE' | 'FORMER'
    mode: 'ONLINE' | 'OFFLINE'
    path: string
    name: string
    totalMb: number
    freeMb: number
    readErrors: number
    writeErrors: number
    readTime: number
    writeTime: number
    reads: number
    writes: number
}

export interface AsmAlert {
    message: string
    time: string
    severity: 'critical' | 'warning' | 'info'
}

export const MOCK_ASM_DATA = {
    isAsmEnabled: true,
    diskGroups: [
        { name: 'DATA', state: 'MOUNTED', type: 'EXTERN', totalMb: 2048000, freeMb: 512000, usableFreeMb: 512000, offlineDisks: 0 },
        { name: 'RECO', state: 'MOUNTED', type: 'EXTERN', totalMb: 1024000, freeMb: 800000, usableFreeMb: 800000, offlineDisks: 0 },
    ] as AsmDiskGroup[],
    disks: [
        { groupName: 'DATA', diskNumber: 0, headerStatus: 'MEMBER', mode: 'ONLINE', path: '/dev/oracleasm/disks/DATA01', name: 'DATA_0000', totalMb: 1024000, freeMb: 256000, readErrors: 0, writeErrors: 0, readTime: 120, writeTime: 45, reads: 50000, writes: 20000 },
        { groupName: 'DATA', diskNumber: 1, headerStatus: 'MEMBER', mode: 'ONLINE', path: '/dev/oracleasm/disks/DATA02', name: 'DATA_0001', totalMb: 1024000, freeMb: 256000, readErrors: 0, writeErrors: 0, readTime: 110, writeTime: 50, reads: 45000, writes: 18000 },
        { groupName: 'RECO', diskNumber: 0, headerStatus: 'MEMBER', mode: 'ONLINE', path: '/dev/oracleasm/disks/RECO01', name: 'RECO_0000', totalMb: 1024000, freeMb: 800000, readErrors: 0, writeErrors: 0, readTime: 15, writeTime: 10, reads: 5000, writes: 2000 },
    ] as AsmDisk[],
    alerts: [
        { message: 'Diskgroup DATA space usage crossed 70%', time: '2026-01-29 10:00:00', severity: 'warning' },
        { message: 'ASM instance startup completed', time: '2026-01-28 08:00:00', severity: 'info' }
    ] as AsmAlert[]
}
