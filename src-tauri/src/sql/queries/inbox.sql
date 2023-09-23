SELECT *
FROM tasks
WHERE scheduled = 'anytime'
  AND completed IS NULL
  AND NOT EXISTS (
  SELECT *
  FROM links
  WHERE links.from_id = tasks.id
     OR links.to_id = tasks.id
)
