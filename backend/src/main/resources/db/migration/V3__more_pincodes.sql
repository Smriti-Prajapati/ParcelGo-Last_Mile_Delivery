INSERT INTO zones (name, description) VALUES
('Agra Zone', 'Agra and surrounding areas'),
('Lucknow Zone', 'Lucknow and surrounding areas'),
('Jaipur Zone', 'Jaipur and surrounding areas'),
('Hyderabad Zone', 'Hyderabad and surrounding areas'),
('Bengaluru Zone', 'Bengaluru and surrounding areas'),
('Chennai Zone', 'Chennai and surrounding areas'),
('Kolkata Zone', 'Kolkata and surrounding areas'),
('Ahmedabad Zone', 'Ahmedabad and surrounding areas'),
('Surat Zone', 'Surat and surrounding areas')
ON CONFLICT (name) DO NOTHING;

INSERT INTO zone_areas (zone_id, pincode, area_name)
SELECT z.id, '206001', 'Etawah HO' FROM zones z WHERE z.name = 'Agra Zone'
ON CONFLICT (pincode) DO NOTHING;

INSERT INTO zone_areas (zone_id, pincode, area_name)
SELECT z.id, '282001', 'Agra HO' FROM zones z WHERE z.name = 'Agra Zone'
ON CONFLICT (pincode) DO NOTHING;

INSERT INTO zone_areas (zone_id, pincode, area_name)
SELECT z.id, '226001', 'Lucknow HO' FROM zones z WHERE z.name = 'Lucknow Zone'
ON CONFLICT (pincode) DO NOTHING;

INSERT INTO zone_areas (zone_id, pincode, area_name)
SELECT z.id, '302001', 'Jaipur HO' FROM zones z WHERE z.name = 'Jaipur Zone'
ON CONFLICT (pincode) DO NOTHING;

INSERT INTO zone_areas (zone_id, pincode, area_name)
SELECT z.id, '500001', 'Hyderabad HO' FROM zones z WHERE z.name = 'Hyderabad Zone'
ON CONFLICT (pincode) DO NOTHING;

INSERT INTO zone_areas (zone_id, pincode, area_name)
SELECT z.id, '560001', 'Bengaluru HO' FROM zones z WHERE z.name = 'Bengaluru Zone'
ON CONFLICT (pincode) DO NOTHING;

INSERT INTO zone_areas (zone_id, pincode, area_name)
SELECT z.id, '600001', 'Chennai HO' FROM zones z WHERE z.name = 'Chennai Zone'
ON CONFLICT (pincode) DO NOTHING;

INSERT INTO zone_areas (zone_id, pincode, area_name)
SELECT z.id, '700001', 'Kolkata HO' FROM zones z WHERE z.name = 'Kolkata Zone'
ON CONFLICT (pincode) DO NOTHING;

INSERT INTO zone_areas (zone_id, pincode, area_name)
SELECT z.id, '380001', 'Ahmedabad HO' FROM zones z WHERE z.name = 'Ahmedabad Zone'
ON CONFLICT (pincode) DO NOTHING;

INSERT INTO zone_areas (zone_id, pincode, area_name)
SELECT z.id, '395001', 'Surat HO' FROM zones z WHERE z.name = 'Surat Zone'
ON CONFLICT (pincode) DO NOTHING;

INSERT INTO zone_areas (zone_id, pincode, area_name)
SELECT z.id, '110001', 'New Delhi HO' FROM zones z WHERE z.name = 'Delhi South'
ON CONFLICT (pincode) DO NOTHING;

INSERT INTO zone_areas (zone_id, pincode, area_name)
SELECT z.id, '400001', 'Mumbai HO' FROM zones z WHERE z.name = 'Mumbai Central'
ON CONFLICT (pincode) DO NOTHING;
