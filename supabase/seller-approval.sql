-- Add seller approval flag
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS seller_approved BOOLEAN DEFAULT FALSE;

-- Gate product creation by seller approval
DROP POLICY IF EXISTS "Sellers can insert their own products" ON public.products;
CREATE POLICY "Sellers can insert their own products"
ON public.products
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = products.seller_id 
      AND users.auth_id = auth.uid()
      AND users.role = 'seller'
      AND COALESCE(users.seller_approved, false) = true
  )
);


