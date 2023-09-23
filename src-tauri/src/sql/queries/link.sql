INSERT INTO links (from_id, to_id)
VALUES (?, ?)
ON CONFLICT (from_id, to_id) DO NOTHING
