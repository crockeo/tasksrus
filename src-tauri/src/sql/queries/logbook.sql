SELECT *
FROM tasks
WHERE completed IS NOT NULL
ORDER BY completed DESC
