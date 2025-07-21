-- Security Fix 1: Fix function search_path vulnerabilities
-- Update all functions to have secure search_path

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix update_deck_card_count function
CREATE OR REPLACE FUNCTION public.update_deck_card_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.decks 
    SET total_cards = total_cards + 1 
    WHERE id = NEW.deck_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.decks 
    SET total_cards = total_cards - 1 
    WHERE id = OLD.deck_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$function$;

-- Security Fix 2: Create proper role system with enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'creator');

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security Fix 3: Create security definer function to check roles safely
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Security Fix 4: Create function to get current user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1
$$;

-- Security Fix 5: Fix profiles table role vulnerability
-- Remove role column from profiles and use user_roles instead
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Security Fix 6: Update RLS policies for secure access

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create secure profile policies
CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create secure user_roles policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Security Fix 7: Add input validation constraints
-- Add length constraints to prevent excessively long content
ALTER TABLE public.flashcards 
ADD CONSTRAINT flashcard_question_length CHECK (char_length(question) <= 2000),
ADD CONSTRAINT flashcard_answer_length CHECK (char_length(answer) <= 5000);

ALTER TABLE public.decks
ADD CONSTRAINT deck_title_length CHECK (char_length(title) <= 200),
ADD CONSTRAINT deck_description_length CHECK (char_length(description) <= 1000);

-- Security Fix 8: Create audit log table for sensitive operations
CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.audit_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.audit_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Security Fix 9: Create trigger for audit logging
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_values)
        VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, row_to_json(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_values, new_values)
        VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_log (user_id, action, table_name, record_id, new_values)
        VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$function$;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_decks_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.decks
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_user_roles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();