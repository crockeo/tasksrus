SELECT *
FROM tasks
WHERE scheduled = 'anytime'
  AND completed IS NULL
