-- Create categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  image_url text,
  created_at timestamp DEFAULT now()
);

-- Create wishlist table
CREATE TABLE public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp DEFAULT now()
);

-- Create cart table
CREATE TABLE public.cart (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Add category_id to products table
ALTER TABLE public.products ADD COLUMN category_id uuid;

-- Enable RLS on new tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

-- Categories policies (everyone can view, only authenticated users can manage)
CREATE POLICY "Everyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Wishlist policies
CREATE POLICY "Users can view their own wishlist" ON public.wishlist
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = wishlist.user_id 
      AND users.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can add to their own wishlist" ON public.wishlist
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = wishlist.user_id 
      AND users.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove from their own wishlist" ON public.wishlist
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = wishlist.user_id 
      AND users.auth_id = auth.uid()
    )
  );

-- Reviews policies
CREATE POLICY "Everyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = reviews.user_id 
      AND users.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = reviews.user_id 
      AND users.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own reviews" ON public.reviews
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = reviews.user_id 
      AND users.auth_id = auth.uid()
    )
  );

-- Cart policies
CREATE POLICY "Users can view their own cart" ON public.cart
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = cart.user_id 
      AND users.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can add to their own cart" ON public.cart
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = cart.user_id 
      AND users.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own cart" ON public.cart
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = cart.user_id 
      AND users.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove from their own cart" ON public.cart
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = cart.user_id 
      AND users.auth_id = auth.uid()
    )
  );

-- Insert sample categories
INSERT INTO public.categories (name, description) VALUES
  ('Jewelry', 'Handcrafted jewelry and accessories'),
  ('Textiles', 'Traditional and modern textiles'),
  ('Coffee', 'Premium coffee beans and blends'),
  ('Art', 'Paintings, sculptures, and artwork'),
  ('Crafts', 'Handmade crafts and decorative items'),
  ('Food', 'Traditional foods and spices');

-- Add foreign key constraint for products.category_id
ALTER TABLE public.products 
ADD CONSTRAINT products_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);