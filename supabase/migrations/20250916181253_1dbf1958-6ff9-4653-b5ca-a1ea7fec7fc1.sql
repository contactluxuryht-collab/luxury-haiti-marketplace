-- Insert comprehensive categories for a full marketplace
INSERT INTO public.categories (name, description) VALUES
-- Electronics & Technology
('Electronics', 'Smartphones, tablets, computers, and electronic accessories'),
('Computers & Laptops', 'Desktop computers, laptops, and computer accessories'),
('Gaming', 'Video games, gaming consoles, and gaming accessories'),
('Audio & Headphones', 'Headphones, speakers, and audio equipment'),
('Cameras & Photography', 'Digital cameras, lenses, and photography equipment'),

-- Fashion & Beauty
('Women''s Fashion', 'Clothing, shoes, and accessories for women'),
('Men''s Fashion', 'Clothing, shoes, and accessories for men'),
('Kids & Baby', 'Children''s clothing, toys, and baby products'),
('Shoes', 'Footwear for men, women, and children'),
('Bags & Luggage', 'Handbags, backpacks, and travel luggage'),
('Beauty & Personal Care', 'Cosmetics, skincare, and personal care products'),
('Watches', 'Wristwatches and smartwatches'),

-- Home & Garden
('Home & Kitchen', 'Kitchen appliances, cookware, and home essentials'),
('Furniture', 'Indoor and outdoor furniture'),
('Home Decor', 'Decorative items and home accessories'),
('Garden & Outdoor', 'Gardening tools, outdoor furniture, and patio items'),
('Tools & Hardware', 'Power tools, hand tools, and hardware supplies'),

-- Sports & Recreation
('Sports & Fitness', 'Exercise equipment, sportswear, and fitness accessories'),
('Outdoor Recreation', 'Camping gear, hiking equipment, and outdoor sports'),
('Automotive', 'Car accessories, parts, and automotive tools'),
('Bicycles', 'Bikes, cycling accessories, and bike parts'),

-- Health & Wellness
('Health & Wellness', 'Vitamins, supplements, and health products'),
('Medical Supplies', 'Medical equipment and healthcare products'),

-- Books & Media
('Books', 'Physical and digital books across all genres'),
('Movies & TV', 'DVDs, Blu-rays, and entertainment media'),
('Music', 'Musical instruments and music accessories'),

-- Food & Beverages
('Food & Beverages', 'Packaged foods, snacks, and beverages'),
('Gourmet & Specialty Foods', 'International foods and specialty ingredients'),

-- Arts & Crafts
('Arts & Crafts', 'Art supplies, craft materials, and DIY projects'),
('Collectibles', 'Rare items, memorabilia, and collectible goods'),

-- Business & Industrial
('Office Supplies', 'Stationery, office equipment, and business supplies'),
('Industrial & Scientific', 'Professional equipment and industrial supplies'),

-- Pet Supplies
('Pet Supplies', 'Food, toys, and accessories for pets'),

-- Traditional & Cultural (keeping the original Haitian categories)
('Traditional Crafts', 'Handmade crafts and traditional items'),
('Coffee & Spices', 'Premium coffee beans and exotic spices'),
('Textiles & Clothing', 'Traditional textiles and cultural clothing'),
('Jewelry & Accessories', 'Handcrafted jewelry and fashion accessories'),
('Art & Paintings', 'Original artwork and cultural paintings')

ON CONFLICT (name) DO NOTHING;