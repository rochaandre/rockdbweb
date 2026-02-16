/**
 * ==============================================================================
 * ROCKDB - Oracle Database Administration & Monitoring Tool
 * ==============================================================================
 * File: asm-data.ts
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
export const MOCK_ASM_DISKS = [
    { NAME: 'DATA_0000', PATH: '/dev/oracleasm/disks/DISK1', GROUP_NAME: 'DATA', STATE: 'NORMAL', TOTAL_MB: 524288, FREE_MB: 122500 },
    { NAME: 'DATA_0001', PATH: '/dev/oracleasm/disks/DISK2', GROUP_NAME: 'DATA', STATE: 'NORMAL', TOTAL_MB: 524288, FREE_MB: 122500 },
    { NAME: 'RECO_0000', PATH: '/dev/oracleasm/disks/DISK3', GROUP_NAME: 'RECO', STATE: 'NORMAL', TOTAL_MB: 262144, FREE_MB: 156000 },
    { NAME: 'RECO_0001', PATH: '/dev/oracleasm/disks/DISK4', GROUP_NAME: 'RECO', STATE: 'NORMAL', TOTAL_MB: 262144, FREE_MB: 156000 }
]

export const MOCK_ASM_OPERATIONS = [
    { GROUP_NAME: 'DATA', OPERATION: 'REBAL', STATE: 'WAIT', POWER: 1, ACTUAL: 1, SOFAR: 0, EST_WORK: 0, EST_RATE: 0, EST_MINUTES: 0 },
    { GROUP_NAME: 'RECO', OPERATION: 'REBAL', STATE: 'DONE', POWER: 1, ACTUAL: 1, SOFAR: 450, EST_WORK: 450, EST_RATE: 12, EST_MINUTES: 0 }
]
