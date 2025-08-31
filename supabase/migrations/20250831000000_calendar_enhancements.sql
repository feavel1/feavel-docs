-- Calendar System Implementation

-- Enable the btree_gist extension required for exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 1. Create services_v2 table to support reservation types
CREATE TABLE IF NOT EXISTS public.services_v2 (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by INTEGER NOT NULL REFERENCES public.studios(id),
  name VARCHAR(255) NOT NULL,
  description JSONB,
  price DECIMAL(10, 2) NOT NULL,
  service_type VARCHAR(50) NOT NULL DEFAULT 'single_download',
  enabled BOOLEAN DEFAULT true,
  status VARCHAR(50),
  cover_url TEXT,
  highlights JSONB
);

-- 2. Create events table to store all calendar events
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration TSTZRANGE NOT NULL,
  event_type VARCHAR(50) NOT NULL DEFAULT 'other',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  studio_id INTEGER NOT NULL REFERENCES public.studios(id),
  service_id INTEGER REFERENCES public.services_v2(id),
  user_id UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  metadata JSONB
);

-- Add exclusion constraint to prevent overlapping events for the same studio
ALTER TABLE public.events
  ADD CONSTRAINT exclude_studio_events
  EXCLUDE USING gist (studio_id WITH =, duration WITH &&);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_duration ON public.events USING gist (duration);
CREATE INDEX IF NOT EXISTS idx_events_studio_id ON public.events(studio_id);
CREATE INDEX IF NOT EXISTS idx_events_service_id ON public.events(service_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_is_public ON public.events(is_public);
CREATE INDEX IF NOT EXISTS idx_services_v2_created_by ON public.services_v2(created_by);
CREATE INDEX IF NOT EXISTS idx_services_v2_service_type ON public.services_v2(service_type);

-- Add comments for documentation
COMMENT ON TABLE public.events IS 'Calendar events with support for reservations, availability, seminars, etc.';
COMMENT ON COLUMN public.events.duration IS 'Duration of the event using PostgreSQL tstzrange for efficient queries and exclusion constraints';
COMMENT ON COLUMN public.events.event_type IS 'Type of event (reservation, availability, seminar, etc.)';
COMMENT ON COLUMN public.events.status IS 'Status of the event for approval workflow (pending, approved, rejected, canceled)';
COMMENT ON COLUMN public.events.service_id IS 'Reference to the service associated with this event';
COMMENT ON TABLE public.services_v2 IS 'Services offered that can be associated with calendar events';
COMMENT ON COLUMN public.services_v2.service_type IS 'Type of service (single_download, reservation, package_delivery)';
COMMENT ON COLUMN public.services_v2.description IS 'Service description in JSONB format to support rich text editor';