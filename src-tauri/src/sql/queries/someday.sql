SELECT *
FROM tasks
WHERE scheduled = 'someday'
  AND completed IS NULL
