SELECT *
FROM tasks
WHERE scheduled NOT IN ('anytime', 'someday')
  AND scheduled <= ?
  AND completed IS NULL
  AND deleted IS NULL
