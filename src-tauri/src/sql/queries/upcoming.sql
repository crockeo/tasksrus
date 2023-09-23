SELECT *
FROM tasks
WHERE scheduled NOT IN ('anytime', 'oneday')
  AND scheduled > ?
  AND completed IS NULL
