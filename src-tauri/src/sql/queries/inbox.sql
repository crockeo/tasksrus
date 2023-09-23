SELECT *
FROM tasks
WHERE NOT EXISTS (
  SELECT *
  FROM links
  WHERE links.from_id = tasks.id
     OR links.to_id = tasks.id
)
