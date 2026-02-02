-- SQLcl Example
PROMPT 'Current Database User:'
SHOW USER
SELECT name, open_mode FROM v$database;
