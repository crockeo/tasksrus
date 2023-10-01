UPDATE tasks
SET title = ?,
    description = ?,
    scheduled = ?,
    completed = ?,
    deleted = ?
WHERE id = ?
