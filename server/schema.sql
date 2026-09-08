-- ==============================================================================
-- Café Emil Backend Database Schema for Supabase
-- Run this SQL in your Supabase Project -> SQL Editor
-- ==============================================================================

-- 1. CMS Content Table
CREATE TABLE IF NOT EXISTS public.cms_content (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access to CMS content
CREATE POLICY "Public read access for cms_content" 
  ON public.cms_content FOR SELECT 
  TO anon, authenticated, service_role 
  USING (true);

-- Allow authenticated / service_role to update CMS content
CREATE POLICY "Service role full access for cms_content" 
  ON public.cms_content FOR ALL 
  TO service_role, authenticated 
  USING (true);

-- 2. Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access for admin_users" 
  ON public.admin_users FOR ALL 
  TO service_role 
  USING (true);

-- 3. Supabase Storage Bucket for Images
-- Note: You can also create this bucket in Supabase Dashboard -> Storage -> "New Bucket" -> Name: "cafe-emil-images" (Public: ON)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cafe-emil-images', 'cafe-emil-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public reads on storage bucket
CREATE POLICY "Public access to cafe-emil-images"
  ON storage.objects FOR SELECT
  TO anon, authenticated, service_role
  USING (bucket_id = 'cafe-emil-images');

-- Allow uploads to storage bucket
CREATE POLICY "Upload access to cafe-emil-images"
  ON storage.objects FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (bucket_id = 'cafe-emil-images');

-- Allow deletes on storage bucket
CREATE POLICY "Delete access to cafe-emil-images"
  ON storage.objects FOR DELETE
  TO anon, authenticated, service_role
  USING (bucket_id = 'cafe-emil-images');

