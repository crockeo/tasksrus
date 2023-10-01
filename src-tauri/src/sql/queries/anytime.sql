SELECT *
FROM tasks
WHERE scheduled = 'anytime'
  AND completed IS NULL
  AND deleted IS NULL
  AND EXISTS (
    SELECT *
    FROM links
    WHERE links.to_id = tasks.id
  )
