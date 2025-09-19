-- Allow anyone to read basic seller info for product listings
DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
CREATE POLICY "Users are viewable by everyone"
ON public.users
FOR SELECT
USING (true);

-- Optional: backfill missing rows in public.users from auth.users
INSERT INTO public.users (auth_id, role, business_name, phone_number, selling_focus)
SELECT u.id,
       COALESCE(u.raw_user_meta_data->>'role', 'buyer'),
       u.raw_user_meta_data->>'businessName',
       u.raw_user_meta_data->>'phoneNumber',
       u.raw_user_meta_data->>'sellingFocus'
FROM auth.users u
LEFT JOIN public.users pu ON pu.auth_id = u.id
WHERE pu.id IS NULL;


