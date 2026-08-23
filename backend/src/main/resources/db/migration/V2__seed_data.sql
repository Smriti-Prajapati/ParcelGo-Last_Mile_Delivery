INSERT INTO zones (name, description) VALUES
('Bhopal Central', 'Central Bhopal area'),
('Bhopal North', 'Northern Bhopal including Berasia Road'),
('Indore East', 'Eastern Indore including Vijay Nagar'),
('Indore West', 'Western Indore including Palasia'),
('Delhi South', 'South Delhi including Saket, Hauz Khas'),
('Delhi North', 'North Delhi including Civil Lines'),
('Noida Zone', 'Noida and Greater Noida'),
('Mumbai Central', 'Central Mumbai including Dadar, Parel'),
('Pune City', 'Pune city center')
ON CONFLICT (name) DO NOTHING;

INSERT INTO zone_areas (zone_id, pincode, area_name) VALUES
(1, '462001', 'Bhopal HO'),
(1, '462002', 'Bhopal City'),
(1, '462003', 'TT Nagar'),
(2, '462010', 'Berasia Road'),
(2, '462038', 'Karond'),
(3, '452001', 'Indore HO'),
(3, '452010', 'Vijay Nagar'),
(4, '452011', 'Palasia'),
(4, '452018', 'Scheme 54'),
(5, '110017', 'Saket'),
(5, '110016', 'Hauz Khas'),
(6, '110009', 'Civil Lines Delhi'),
(6, '110054', 'Shakti Nagar'),
(7, '201301', 'Noida Sector 18'),
(7, '201306', 'Noida Sector 62'),
(8, '400012', 'Dadar'),
(8, '400013', 'Parel'),
(9, '411001', 'Pune Camp'),
(9, '411004', 'Shivajinagar')
ON CONFLICT (pincode) DO NOTHING;

INSERT INTO rate_cards (name, order_type, zone_type, min_weight, max_weight, rate_per_kg, base_charge) VALUES
('B2C Intra 0-1kg', 'B2C', 'INTRA', 0, 1, 30, 40),
('B2C Intra 1-5kg', 'B2C', 'INTRA', 1, 5, 25, 40),
('B2C Intra 5-20kg', 'B2C', 'INTRA', 5, 20, 20, 40),
('B2C Intra 20+kg', 'B2C', 'INTRA', 20, 9999, 15, 40),
('B2C Inter 0-1kg', 'B2C', 'INTER', 0, 1, 60, 80),
('B2C Inter 1-5kg', 'B2C', 'INTER', 1, 5, 50, 80),
('B2C Inter 5-20kg', 'B2C', 'INTER', 5, 20, 40, 80),
('B2C Inter 20+kg', 'B2C', 'INTER', 20, 9999, 30, 80),
('B2B Intra 0-5kg', 'B2B', 'INTRA', 0, 5, 20, 30),
('B2B Intra 5-20kg', 'B2B', 'INTRA', 5, 20, 15, 30),
('B2B Intra 20-50kg', 'B2B', 'INTRA', 20, 50, 12, 30),
('B2B Intra 50+kg', 'B2B', 'INTRA', 50, 9999, 10, 30),
('B2B Inter 0-5kg', 'B2B', 'INTER', 0, 5, 45, 60),
('B2B Inter 5-20kg', 'B2B', 'INTER', 5, 20, 35, 60),
('B2B Inter 20-50kg', 'B2B', 'INTER', 20, 50, 28, 60),
('B2B Inter 50+kg', 'B2B', 'INTER', 50, 9999, 22, 60);

INSERT INTO cod_surcharges (order_type, surcharge_amount) VALUES
('B2C', 35),
('B2B', 75)
ON CONFLICT (order_type) DO NOTHING;

-- password for all demo accounts is: password
INSERT INTO users (name, email, password, role, phone) VALUES
('Admin User', 'admin@parcelgo.in', '$2a$10$lI9qtisXlECZtMbMZssLGOb6GFji3.MxyQ6xo3VF37uN8GEgKyqQ6', 'ADMIN', '9800000001'),
('Agent', 'agent@parcelgo.in', '$2a$10$lI9qtisXlECZtMbMZssLGOb6GFji3.MxyQ6xo3VF37uN8GEgKyqQ6', 'AGENT', '9800000002'),
('Aman Verma', 'aman@parcelgo.in', '$2a$10$lI9qtisXlECZtMbMZssLGOb6GFji3.MxyQ6xo3VF37uN8GEgKyqQ6', 'AGENT', '9800000003'),
('Priya Singh', 'priya@parcelgo.in', '$2a$10$lI9qtisXlECZtMbMZssLGOb6GFji3.MxyQ6xo3VF37uN8GEgKyqQ6', 'AGENT', '9800000004'),
('Customer', 'customer@example.com', '$2a$10$lI9qtisXlECZtMbMZssLGOb6GFji3.MxyQ6xo3VF37uN8GEgKyqQ6', 'CUSTOMER', '9900000001'),
('Sneha Patel', 'sneha@example.com', '$2a$10$lI9qtisXlECZtMbMZssLGOb6GFji3.MxyQ6xo3VF37uN8GEgKyqQ6', 'CUSTOMER', '9900000002')
ON CONFLICT (email) DO NOTHING;

INSERT INTO delivery_agents (user_id, zone_id, latitude, longitude, availability, vehicle_number)
SELECT u.id, 1, 23.2599, 77.4126, 'AVAILABLE', 'MP04AB1234' FROM users u WHERE u.email = 'agent@parcelgo.in'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO delivery_agents (user_id, zone_id, latitude, longitude, availability, vehicle_number)
SELECT u.id, 5, 28.6139, 77.2090, 'AVAILABLE', 'DL01CD5678' FROM users u WHERE u.email = 'aman@parcelgo.in'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO delivery_agents (user_id, zone_id, latitude, longitude, availability, vehicle_number)
SELECT u.id, 3, 22.7196, 75.8577, 'OFFLINE', 'MP09EF9012' FROM users u WHERE u.email = 'priya@parcelgo.in'
ON CONFLICT (user_id) DO NOTHING;
