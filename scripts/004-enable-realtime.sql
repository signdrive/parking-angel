-- Enable realtime for the parking_spots table
BEGIN;
  -- Insert into the publication (if not exists)
  INSERT INTO supabase_realtime.subscription (publication, name, secret)
  VALUES ('supabase_realtime', 'parking_spots_changes', gen_random_uuid()::text)
  ON CONFLICT DO NOTHING;
  
  -- Add table to the publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.parking_spots;
COMMIT;
