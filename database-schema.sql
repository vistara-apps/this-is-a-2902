-- LeadFlow AI Database Schema for Supabase
-- This file contains the complete database schema for the LeadFlow AI application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid', 'trialing');
CREATE TYPE lead_segment AS ENUM ('Hot', 'Warm', 'Cold', 'Nurture');
CREATE TYPE activity_type AS ENUM (
  'email_sent', 'email_opened', 'email_clicked', 'email_replied',
  'lead_created', 'lead_updated', 'sequence_started', 'sequence_completed',
  'converted', 'unsubscribed'
);
CREATE TYPE sequence_step_type AS ENUM ('email', 'delay', 'condition', 'webhook');
CREATE TYPE trigger_type AS ENUM ('immediate', 'delay', 'condition', 'webhook');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  subscription_plan TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan_id TEXT NOT NULL,
  status subscription_status NOT NULL DEFAULT 'trialing',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table
CREATE TABLE public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id TEXT UNIQUE NOT NULL DEFAULT ('lead_' || generate_random_uuid()),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  title TEXT,
  phone TEXT,
  website TEXT,
  industry TEXT,
  source TEXT,
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  segment lead_segment DEFAULT 'Nurture',
  last_activity TIMESTAMP WITH TIME ZONE,
  external_crm_id TEXT,
  notes TEXT,
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, email)
);

-- Sequences table
CREATE TABLE public.sequences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sequence_id TEXT UNIQUE NOT NULL DEFAULT ('seq_' || generate_random_uuid()),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  trigger_conditions JSONB DEFAULT '{}',
  target_segments lead_segment[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sequence steps table
CREATE TABLE public.sequence_steps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  step_id TEXT UNIQUE NOT NULL DEFAULT ('step_' || generate_random_uuid()),
  sequence_id UUID REFERENCES public.sequences(id) ON DELETE CASCADE NOT NULL,
  order_index INTEGER NOT NULL,
  type sequence_step_type NOT NULL,
  name TEXT NOT NULL,
  content JSONB DEFAULT '{}', -- Email content, delay settings, etc.
  delay_days INTEGER DEFAULT 0,
  delay_hours INTEGER DEFAULT 0,
  conditions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(sequence_id, order_index)
);

-- Lead activities table
CREATE TABLE public.lead_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  activity_id TEXT UNIQUE NOT NULL DEFAULT ('activity_' || generate_random_uuid()),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  sequence_id UUID REFERENCES public.sequences(id) ON DELETE SET NULL,
  step_id UUID REFERENCES public.sequence_steps(id) ON DELETE SET NULL,
  type activity_type NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}'
);

-- Lead sequence enrollments table
CREATE TABLE public.lead_sequence_enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  sequence_id UUID REFERENCES public.sequences(id) ON DELETE CASCADE NOT NULL,
  current_step_id UUID REFERENCES public.sequence_steps(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active', -- active, paused, completed, failed
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  next_action_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(lead_id, sequence_id)
);

-- Email templates table
CREATE TABLE public.email_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables TEXT[], -- Available template variables
  category TEXT DEFAULT 'general',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integrations table
CREATE TABLE public.integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL, -- 'hubspot', 'salesforce', 'gmail', etc.
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}', -- API keys, settings, etc.
  is_active BOOLEAN DEFAULT TRUE,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, provider)
);

-- Webhooks table
CREATE TABLE public.webhooks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL, -- Array of event types to listen for
  secret TEXT, -- For webhook signature verification
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_score ON public.leads(score DESC);
CREATE INDEX idx_leads_segment ON public.leads(segment);
CREATE INDEX idx_leads_last_activity ON public.leads(last_activity DESC);

CREATE INDEX idx_sequences_user_id ON public.sequences(user_id);
CREATE INDEX idx_sequences_active ON public.sequences(is_active);

CREATE INDEX idx_sequence_steps_sequence_id ON public.sequence_steps(sequence_id);
CREATE INDEX idx_sequence_steps_order ON public.sequence_steps(sequence_id, order_index);

CREATE INDEX idx_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX idx_activities_sequence_id ON public.lead_activities(sequence_id);
CREATE INDEX idx_activities_type ON public.lead_activities(type);
CREATE INDEX idx_activities_timestamp ON public.lead_activities(timestamp DESC);

CREATE INDEX idx_enrollments_lead_id ON public.lead_sequence_enrollments(lead_id);
CREATE INDEX idx_enrollments_sequence_id ON public.lead_sequence_enrollments(sequence_id);
CREATE INDEX idx_enrollments_status ON public.lead_sequence_enrollments(status);
CREATE INDEX idx_enrollments_next_action ON public.lead_sequence_enrollments(next_action_at);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sequences_updated_at BEFORE UPDATE ON public.sequences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sequence_steps_updated_at BEFORE UPDATE ON public.sequence_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_sequence_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Leads policies
CREATE POLICY "Users can manage own leads" ON public.leads
  FOR ALL USING (auth.uid() = user_id);

-- Sequences policies
CREATE POLICY "Users can manage own sequences" ON public.sequences
  FOR ALL USING (auth.uid() = user_id);

-- Sequence steps policies
CREATE POLICY "Users can manage own sequence steps" ON public.sequence_steps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sequences 
      WHERE sequences.id = sequence_steps.sequence_id 
      AND sequences.user_id = auth.uid()
    )
  );

-- Lead activities policies
CREATE POLICY "Users can manage own lead activities" ON public.lead_activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_activities.lead_id 
      AND leads.user_id = auth.uid()
    )
  );

-- Lead sequence enrollments policies
CREATE POLICY "Users can manage own enrollments" ON public.lead_sequence_enrollments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_sequence_enrollments.lead_id 
      AND leads.user_id = auth.uid()
    )
  );

-- Email templates policies
CREATE POLICY "Users can manage own templates" ON public.email_templates
  FOR ALL USING (auth.uid() = user_id);

-- Integrations policies
CREATE POLICY "Users can manage own integrations" ON public.integrations
  FOR ALL USING (auth.uid() = user_id);

-- Webhooks policies
CREATE POLICY "Users can manage own webhooks" ON public.webhooks
  FOR ALL USING (auth.uid() = user_id);

-- Functions for lead scoring and automation
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_row public.leads)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  days_since_activity INTEGER;
  email_domain TEXT;
BEGIN
  -- Email engagement scoring (0-30 points)
  IF lead_row.last_activity IS NOT NULL THEN
    days_since_activity := EXTRACT(DAY FROM NOW() - lead_row.last_activity);
    IF days_since_activity <= 7 THEN
      score := score + 30;
    ELSIF days_since_activity <= 30 THEN
      score := score + 20;
    ELSIF days_since_activity <= 90 THEN
      score := score + 10;
    END IF;
  END IF;
  
  -- Company size scoring (0-25 points)
  IF lead_row.company IS NOT NULL THEN
    IF lead_row.company ILIKE '%enterprise%' OR lead_row.company ILIKE '%corp%' THEN
      score := score + 25;
    ELSIF lead_row.company ILIKE '%inc%' OR lead_row.company ILIKE '%llc%' THEN
      score := score + 15;
    ELSE
      score := score + 10;
    END IF;
  END IF;
  
  -- Email domain scoring (0-20 points)
  IF lead_row.email IS NOT NULL THEN
    email_domain := split_part(lead_row.email, '@', 2);
    IF email_domain NOT IN ('gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com') THEN
      score := score + 20;
    END IF;
  END IF;
  
  -- Title/Role scoring (0-25 points)
  IF lead_row.title IS NOT NULL THEN
    IF lead_row.title ILIKE '%ceo%' OR lead_row.title ILIKE '%founder%' THEN
      score := score + 25;
    ELSIF lead_row.title ILIKE '%director%' OR lead_row.title ILIKE '%vp%' THEN
      score := score + 20;
    ELSIF lead_row.title ILIKE '%manager%' THEN
      score := score + 15;
    ELSE
      score := score + 10;
    END IF;
  END IF;
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to determine lead segment based on score
CREATE OR REPLACE FUNCTION get_lead_segment(score INTEGER)
RETURNS lead_segment AS $$
BEGIN
  IF score >= 80 THEN
    RETURN 'Hot';
  ELSIF score >= 60 THEN
    RETURN 'Warm';
  ELSIF score >= 40 THEN
    RETURN 'Cold';
  ELSE
    RETURN 'Nurture';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update lead scores and segments
CREATE OR REPLACE FUNCTION update_lead_score_and_segment()
RETURNS TRIGGER AS $$
DECLARE
  new_score INTEGER;
  new_segment lead_segment;
BEGIN
  new_score := calculate_lead_score(NEW);
  new_segment := get_lead_segment(new_score);
  
  NEW.score := new_score;
  NEW.segment := new_segment;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lead_score
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_score_and_segment();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sample data for development (optional)
-- Uncomment the following lines to insert sample data

/*
-- Insert sample email templates
INSERT INTO public.email_templates (user_id, name, subject, body, category, is_default) VALUES
  (
    (SELECT id FROM public.users LIMIT 1),
    'Welcome Email',
    'Welcome to {{company_name}}!',
    'Hi {{first_name}},\n\nWelcome to our platform! We''re excited to have you on board.\n\nBest regards,\nThe Team',
    'onboarding',
    true
  ),
  (
    (SELECT id FROM public.users LIMIT 1),
    'Follow-up Email',
    'Following up on our conversation',
    'Hi {{first_name}},\n\nI wanted to follow up on our recent conversation about {{topic}}.\n\nWould you be available for a quick call this week?\n\nBest regards,\n{{sender_name}}',
    'follow-up',
    true
  );
*/
