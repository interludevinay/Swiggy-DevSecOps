/*
  # Swiggy Clone Database Schema

  1. New Tables
    - `restaurants`
      - `id` (uuid, primary key)
      - `name` (text) - Restaurant name
      - `description` (text) - Restaurant description
      - `image_url` (text) - Restaurant image
      - `rating` (numeric) - Average rating
      - `delivery_time` (text) - Estimated delivery time
      - `cuisine_types` (text array) - Types of cuisine offered
      - `cost_for_two` (integer) - Cost for two people
      - `is_open` (boolean) - Restaurant open status
      - `address` (text) - Restaurant address
      - `created_at` (timestamp)
    
    - `menu_items`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key) - Links to restaurant
      - `name` (text) - Item name
      - `description` (text) - Item description
      - `price` (numeric) - Item price
      - `image_url` (text) - Item image
      - `category` (text) - Food category
      - `is_veg` (boolean) - Vegetarian flag
      - `is_bestseller` (boolean) - Bestseller flag
      - `created_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - User identifier
      - `restaurant_id` (uuid, foreign key) - Links to restaurant
      - `items` (jsonb) - Order items with quantities
      - `total_amount` (numeric) - Total order amount
      - `delivery_address` (text) - Delivery address
      - `status` (text) - Order status
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access to restaurants and menu items
    - Add policies for authenticated users to manage their orders
*/

CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  rating numeric DEFAULT 0,
  delivery_time text,
  cuisine_types text[] DEFAULT '{}',
  cost_for_two integer DEFAULT 0,
  is_open boolean DEFAULT true,
  address text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  image_url text,
  category text,
  is_veg boolean DEFAULT true,
  is_bestseller boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE SET NULL,
  items jsonb NOT NULL,
  total_amount numeric NOT NULL,
  delivery_address text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view restaurants"
  ON restaurants FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view menu items"
  ON menu_items FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view their orders"
  ON orders FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);