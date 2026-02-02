WITH
log AS (
SELECT /*+  MATERIALIZE NO_MERGE  */
       --DISTINCT
       thread#,
       sequence#,
       first_time,
       blocks,
       block_size
  FROM v$archived_log
 WHERE first_time IS NOT NULL
),
log_denorm AS (
SELECT /*+  MATERIALIZE NO_MERGE  */
      thread#,
      ''|| TO_CHAR(TRUNC(first_time), 'YYYYMMDD') yyyymmdd,
      ''|| TO_CHAR(TRUNC(first_time), 'Dy') day,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '00', 1, 0)),1,3) h00,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '01', 1, 0)),1,3) h01,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '02', 1, 0)),1,3) h02,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '03', 1, 0)),1,3) h03,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '04', 1, 0)),1,3) h04,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '05', 1, 0)),1,3) h05,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '06', 1, 0)),1,3) h06,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '07', 1, 0)),1,3) h07,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '08', 1, 0)),1,3) h08,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '09', 1, 0)),1,3) h09,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '10', 1, 0)),1,3) h10,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '11', 1, 0)),1,3) h11,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '12', 1, 0)),1,3) h12,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '13', 1, 0)),1,3) h13,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '14', 1, 0)),1,3) h14,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '15', 1, 0)),1,3) h15,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '16', 1, 0)),1,3) h16,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '17', 1, 0)),1,3) h17,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '18', 1, 0)),1,3) h18,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '19', 1, 0)),1,3) h19,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '20', 1, 0)),1,3) h20,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '21', 1, 0)),1,3) h21,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '22', 1, 0)),1,3) h22,
      ''|| substr(SUM(DECODE(TO_CHAR(first_time, 'HH24'), '23', 1, 0)),1,3) h23,
      ''||  ROUND(SUM(blocks * block_size) / POWER(10,9), 1)  TOT_GB,
      ''|| substr(COUNT(*),1,2) cnt,
      ''||  ROUND(SUM(blocks * block_size) / POWER(10,9) / COUNT(*), 1) AVG_GB
  FROM log
 GROUP BY
       thread#,
       TRUNC(first_time)
 ORDER BY
       thread#,
       TRUNC(first_time) DESC
),
ordered_log AS (
SELECT /*+  MATERIALIZE NO_MERGE  */
       ROWNUM seq, log_denorm.*
  FROM log_denorm
),
min_set AS (
SELECT /*+  MATERIALIZE NO_MERGE  */
       thread#,
       MIN(seq) seq
  FROM ordered_log
 GROUP BY
       thread#
)
SELECT /*+  NO_MERGE  */
log.THREAD#  , YYYYMMDD,  DAY , H00, H01, H02, H03, H04, H05, H06, H07, H08, H09, H10, H11, H12, H13, H14, H15, H16, H17, H18, H19, H20, H21, H22, H23, TOT_GB, CNT, AVG_GB
  FROM ordered_log log,
       min_set ms
 WHERE log.thread# = ms.thread#
   AND log.seq < ms.seq + 14
 ORDER BY
       log.thread#,
       log.yyyymmdd DESC ;