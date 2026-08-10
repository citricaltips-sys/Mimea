-- Supabase schema for MimeaHub
-- Run this in the Supabase SQL Editor

-- Scans table
CREATE TABLE IF NOT EXISTS public.scans (
  id BIGSERIAL PRIMARY KEY,
  disease_key TEXT NOT NULL,
  disease_name TEXT NOT NULL,
  crop_type TEXT,
  confidence NUMERIC NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  coordinates TEXT,
  sync_status TEXT DEFAULT 'pending',
  is_outbreak BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'local',
  notes TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  remote_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Outbreaks table
CREATE TABLE IF NOT EXISTS public.outbreaks (
  id BIGSERIAL PRIMARY KEY,
  disease_key TEXT NOT NULL,
  disease_name TEXT NOT NULL,
  crop_type TEXT,
  confidence NUMERIC NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  notes TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT DEFAULT 'community',
  sync_status TEXT DEFAULT 'synced',
  is_outbreak BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Market Prices table
CREATE TABLE IF NOT EXISTS public.market_prices (
  id BIGSERIAL PRIMARY KEY,
  crop TEXT NOT NULL,
  variety TEXT,
  county TEXT NOT NULL,
  price NUMERIC NOT NULL,
  unit TEXT DEFAULT 'kg',
  trend TEXT DEFAULT 'stable',
  change TEXT DEFAULT '0%',
  market TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Certified Agrovets table
CREATE TABLE IF NOT EXISTS public.agrovets (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  county TEXT NOT NULL,
  town TEXT,
  phone TEXT,
  services TEXT[] DEFAULT '{}',
  certified BOOLEAN DEFAULT true,
  rating NUMERIC DEFAULT 0,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbreaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agrovets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow public read access" ON public.outbreaks;
  DROP POLICY IF EXISTS "Allow public insert access" ON public.outbreaks;
  DROP POLICY IF EXISTS "Allow public update access" ON public.outbreaks;
  DROP POLICY IF EXISTS "Allow public delete access" ON public.outbreaks;
  DROP POLICY IF EXISTS "Allow public read access" ON public.scans;
  DROP POLICY IF EXISTS "Allow public insert access" ON public.scans;
  DROP POLICY IF EXISTS "Allow public update access" ON public.scans;
  DROP POLICY IF EXISTS "Allow public delete access" ON public.scans;
  DROP POLICY IF EXISTS "Allow public read access" ON public.market_prices;
  DROP POLICY IF EXISTS "Allow public insert access" ON public.market_prices;
  DROP POLICY IF EXISTS "Allow public update access" ON public.market_prices;
  DROP POLICY IF EXISTS "Allow public delete access" ON public.market_prices;
  DROP POLICY IF EXISTS "Allow public read access" ON public.agrovets;
  DROP POLICY IF EXISTS "Allow public insert access" ON public.agrovets;
  DROP POLICY IF EXISTS "Allow public update access" ON public.agrovets;
  DROP POLICY IF EXISTS "Allow public delete access" ON public.agrovets;
END $$;

-- Public access policies (for anonymous use)
CREATE POLICY "Allow public read access" ON public.outbreaks FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.outbreaks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.outbreaks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.outbreaks FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.scans FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.scans FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.scans FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.scans FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.market_prices FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.market_prices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.market_prices FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.market_prices FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.agrovets FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.agrovets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.agrovets FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.agrovets FOR DELETE USING (true);

-- Enable realtime for outbreaks (optional, for live updates)
-- alter publication supabase_realtime add table public.outbreaks;

-- Seed market prices (Kenya) - Representative prices based on major Kenyan markets
-- For live data, integrate with: Kenya National Bureau of Statistics, AMIS, or a market API
INSERT INTO public.market_prices (crop, variety, county, price, unit, trend, change, market, updated_at) VALUES
('Tomato', 'Ng''ongo', 'Nairobi', 120, 'kg', 'up', '+8%', 'Wakulima Market', now()),
('Tomato', 'Money Maker', 'Kiambu', 105, 'kg', 'down', '-3%', 'Kiambu Open Air', now()),
('Tomato', 'Ng''ongo', 'Nakuru', 115, 'kg', 'up', '+6%', 'Nakuru Market', now()),
('Tomato', 'Kileleshwa', 'Mombasa', 130, 'kg', 'up', '+10%', 'Mombasa Main Market', now()),
('Potato', 'Shangi', 'Nakuru', 45, 'kg', 'up', '+5%', 'Nakuru Market', now()),
('Potato', 'Kenya Mpya', 'Nyeri', 50, 'kg', 'stable', '0%', 'Nyeri Town Market', now()),
('Potato', 'Shangi', 'Eldoret', 42, 'kg', 'down', '-2%', 'Eldoret Grain Market', now()),
('Potato', 'Asante', 'Meru', 48, 'kg', 'up', '+4%', 'Meru Open Air', now()),
('Cabbage', 'Golden Acre', 'Kisumu', 35, 'head', 'down', '-6%', 'Kisumu Market', now()),
('Cabbage', 'Black Queen', 'Nairobi', 40, 'head', 'stable', '0%', 'Wakulima Market', now()),
('Onion', 'Red Creole', 'Mombasa', 150, 'kg', 'up', '+12%', 'Mombasa Main Market', now()),
('Onion', 'Red Creole', 'Nairobi', 140, 'kg', 'up', '+9%', 'Wakulima Market', now()),
('Onion', 'Bombay', 'Kiambu', 130, 'kg', 'stable', '0%', 'Kiambu Open Air', now()),
('Maize', 'DH04', 'Eldoret', 55, 'kg', 'stable', '0%', 'Eldoret Grain Market', now()),
('Maize', 'H614', 'Nakuru', 50, 'kg', 'down', '-4%', 'Nakuru Market', now()),
('Maize', 'H614', 'Kisumu', 52, 'kg', 'up', '+3%', 'Kisumu Market', now()),
('Spinach', 'Local', 'Nairobi', 60, 'bunch', 'up', '+4%', 'Wakulima Market', now()),
('Spinach', 'Local', 'Kiambu', 55, 'bunch', 'stable', '0%', 'Kiambu Open Air', now()),
('Kale', 'Sukuma Wiki', 'Kiambu', 25, 'bunch', 'stable', '0%', 'Kiambu Open Air', now()),
('Kale', 'Sukuma Wiki', 'Nairobi', 30, 'bunch', 'up', '+5%', 'Wakulima Market', now()),
('Carrot', 'Nzumbo', 'Nyeri', 90, 'kg', 'up', '+7%', 'Nyeri Town Market', now()),
('Carrot', 'Nzumbo', 'Nairobi', 100, 'kg', 'up', '+8%', 'Wakulima Market', now()),
('Chilli', 'Habanero', 'Meru', 180, 'kg', 'up', '+15%', 'Meru Open Air', now()),
('Chilli', 'Bird Eye', 'Kisumu', 160, 'kg', 'up', '+11%', 'Kisumu Market', now()),
('Watermelon', 'Sugarbaby', 'Kiambu', 40, 'kg', 'down', '-5%', 'Kiambu Open Air', now()),
('Mango', 'Apple', 'Mombasa', 120, 'kg', 'up', '+7%', 'Mombasa Main Market', now()),
('Mango', 'Ngowe', 'Kilifi', 100, 'kg', 'stable', '0%', 'Kilifi Market', now()),
('Coffee', 'Arabica', 'Nyeri', 280, 'kg', 'up', '+6%', 'Nyeri Town Market', now()),
('Tea', 'Purple', 'Kericho', 350, 'kg', 'up', '+4%', 'Kericho Market', now()),
('Avocado', 'Hass', 'Nairobi', 180, 'kg', 'up', '+18%', 'Wakulima Market', now()),
('Passion', 'Purple', 'Kisumu', 120, 'kg', 'up', '+9%', 'Kisumu Market', now())
ON CONFLICT (id) DO NOTHING;

-- Seed certified agrovets (Kenya) - Representative directory of certified input suppliers
-- For a live directory, integrate with: KEPHIS, AgriNet, or Kenya Seed Company database
INSERT INTO public.agrovets (name, county, town, phone, services, certified, rating, latitude, longitude) VALUES
('Kenya Agri Supplies Ltd', 'Nairobi', 'Nairobi CBD', '+254 20 123 456', ARRAY['Seeds','Fertilizers','Chemicals','Advisory'], true, 4.5, -1.2921, 36.8219),
('GreenGrow Agrovet', 'Kiambu', 'Kiambu Town', '+254 720 111 222', ARRAY['Seeds','Organic Inputs','Tools'], true, 4.2, -1.1746, 36.8344),
('Nakuru Farm Inputs', 'Nakuru', 'Nakuru Town', '+254 51 321 987', ARRAY['Fertilizers','Chemicals','Irrigation'], true, 4.0, -0.3031, 36.0800),
('Lake Agro Center', 'Kisumu', 'Kisumu CBD', '+254 57 202 445', ARRAY['Seeds','Fertilizers','Pesticides'], true, 3.9, -0.1022, 34.7617),
('Coastal Agri Store', 'Mombasa', 'Mombasa Island', '+254 41 555 888', ARRAY['Seeds','Chemicals','Advisory'], true, 4.3, -4.0435, 39.6682),
('Rift Valley Agrovet', 'Eldoret', 'Eldoret Town', '+254 53 207 112', ARRAY['Seeds','Fertilizers','Animal Health'], true, 4.1, 0.5143, 35.2698),
('Mount Kenya Agro', 'Nyeri', 'Nyeri Town', '+254 61 203 990', ARRAY['Tea Inputs','Fertilizers','Tools'], true, 4.6, -0.4201, 36.9478),
('Meru Agribusiness Hub', 'Meru', 'Meru Town', '+254 64 312 771', ARRAY['Miraa Inputs','Fertilizers','Chemicals'], true, 4.0, 0.0470, 37.6530),
('Smart Crop Solutions', 'Nairobi', 'Westlands', '+254 711 222 333', ARRAY['Digital Advisory','Seeds','Precision Inputs'], true, 4.7, -1.2636, 36.8036),
('Mavuno Agrovet', 'Kiambu', 'Thika', '+254 67 514 892', ARRAY['Seeds','Irrigation','Tools'], true, 4.4, -1.0333, 37.0833),
('Kapsoya Agrovet', 'Eldoret', 'Kapsoya', '+254 53 207 445', ARRAY['Seeds','Fertilizers','Vet Services'], true, 4.3, 0.5143, 35.2698),
('Kisumu Certified Agri', 'Kisumu', 'Kisumu West', '+254 57 202 998', ARRAY['Seeds','Pesticides','Advisory'], true, 4.1, -0.1022, 34.7617),
('Nairobi West Agrovet', 'Nairobi', 'Nairobi West', '+254 20 567 123', ARRAY['Fertilizers','Tools','Animal Health'], true, 4.0, -1.3000, 36.7800),
('Machakos Farmers Hub', 'Machakos', 'Machakos Town', '+254 44 321 654', ARRAY['Seeds','Irrigation','Chemicals'], true, 4.2, -1.5167, 37.2667),
('Garissa Agri Supplies', 'Garissa', 'Garissa Town', '+254 46 201 789', ARRAY['Seeds','Fertilizers','Water Pumps'], true, 3.8, -0.4536, 39.6401),
('Kajiado Farm Inputs', 'Kajiado', 'Kajiado Town', '+254 45 302 456', ARRAY['Seeds','Vet Medicine','Fencing'], true, 4.0, -1.8523, 36.7769),
('Nyeri Digital Agrovet', 'Nyeri', 'Nyeri Town', '+254 61 203 771', ARRAY['Digital Advisory','Seeds','Fertilizers'], true, 4.8, -0.4201, 36.9478),
('Mombasa Agro Link', 'Mombasa', 'Nyali', '+254 41 555 223', ARRAY['Seeds','Chemicals','Irrigation'], true, 4.4, -4.0435, 39.6682),
('Kiambu Certified Seeds', 'Kiambu', 'Kiambu Town', '+254 720 444 123', ARRAY['Certified Seeds','Fertilizers','Training'], true, 4.6, -1.1746, 36.8344),
('Nakuru Green Agrovet', 'Nakuru', 'Naivasha Rd', '+254 51 987 654', ARRAY['Organic Inputs','Seeds','Advisory'], true, 4.1, -0.3031, 36.0800)
ON CONFLICT (id) DO NOTHING;
