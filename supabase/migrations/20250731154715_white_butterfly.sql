/*
  # Add due date support to tasks

  1. Schema Changes
    - Add `due_date` column to `tasks` table (date type, nullable)
    - This allows tasks to have optional due dates for calendar scheduling

  2. Notes
    - due_date is nullable, so existing tasks remain unaffected
    - Only stores date (not time) for simplicity
    - Supports calendar view and date-based task organization
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'due_date'
  ) THEN
    ALTER TABLE tasks ADD COLUMN due_date date;
  END IF;
END $$;