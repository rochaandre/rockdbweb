-- Open Cursors Detail
SELECT sid, user_name, count(*) as cursor_count
FROM v$open_cursor
WHERE user_name LIKE :owner_filter
GROUP BY sid, user_name
ORDER BY cursor_count DESC
FETCH FIRST 50 ROWS ONLY
