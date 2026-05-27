-- Supabase Database Schema for AI Tools Directory

-- 1. Create users table (synchronized with Supabase Auth)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  subscription_status TEXT DEFAULT 'free' NOT NULL CHECK (subscription_status IN ('free', 'pro')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Allow users to view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow users to update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Trigger to sync auth.users with public.users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, subscription_status)
  VALUES (new.id, new.email, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Create tools table
CREATE TABLE public.tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  pricing_model TEXT NOT NULL,
  website_url TEXT NOT NULL,
  full_review TEXT, -- Paywalled field
  average_rating NUMERIC(3,2) DEFAULT 0.00 NOT NULL,
  ratings_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for tools
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- Tools policies (Select is public, write is restricted)
CREATE POLICY "Allow public read access to tools" ON public.tools
  FOR SELECT USING (true);


-- 3. Create favorites table
CREATE TABLE public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, tool_id)
);

-- Enable RLS for favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Favorites policies
CREATE POLICY "Allow users to view own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to add own favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to remove own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);


-- 4. Create ratings table
CREATE TABLE public.ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, tool_id)
);

-- Enable RLS for ratings
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Ratings policies
CREATE POLICY "Allow public read access to ratings" ON public.ratings
  FOR SELECT USING (true);

CREATE POLICY "Allow users to add/update own rating" ON public.ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own rating" ON public.ratings
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own rating" ON public.ratings
  FOR DELETE USING (auth.uid() = user_id);


-- Trigger to automatically calculate and update average rating + rating counts for tools
CREATE OR REPLACE FUNCTION public.calculate_tool_rating()
RETURNS trigger AS $$
DECLARE
  target_tool_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_tool_id := OLD.tool_id;
  ELSE
    target_tool_id := NEW.tool_id;
  END IF;

  UPDATE public.tools
  SET 
    average_rating = COALESCE(
      (SELECT AVG(rating)::NUMERIC(3,2) FROM public.ratings WHERE tool_id = target_tool_id),
      0.00
    ),
    ratings_count = COALESCE(
      (SELECT COUNT(*) FROM public.ratings WHERE tool_id = target_tool_id),
      0
    )
  WHERE id = target_tool_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER update_tool_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION public.calculate_tool_rating();
