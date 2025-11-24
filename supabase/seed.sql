-- Official Listings
insert into listings (
  title, address, latitude, longitude, rent, bedrooms, bathrooms, 
  neighborhood, lease_term, heating_type, nearest_tcat_route, 
  elevation_warning, distance_from_campus_miles, is_official_listing, 
  description, photos
) values 
(
  'Modern Collegetown Apartment', 
  '409 College Ave, Ithaca, NY 14850', 
  42.4426, -76.4850, 
  1800, 2, 1, 
  'Collegetown', '12-month', 'Steam', 'Route 30', 
  false, 0.2, true,
  'Newly renovated apartment in the heart of Collegetown. Steps to campus.',
  ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80']
),
(
  'Quiet Fall Creek House', 
  '202 E Falls St, Ithaca, NY 14850', 
  42.4510, -76.4950, 
  1400, 3, 1.5, 
  'Fall Creek', '12-month', 'Gas', 'Route 13', 
  true, 1.5, true,
  'Charming historic house near Ithaca Falls. Great for grad students.',
  ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80']
),
(
  'Luxury Downtown Loft', 
  '115 E State St, Ithaca, NY 14850', 
  42.4396, -76.4970, 
  2200, 1, 1, 
  'Downtown', '12-month', 'Electric Baseboard', 'Route 10', 
  false, 2.0, true,
  'High ceilings, exposed brick, and modern amenities on the Commons.',
  ARRAY['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80']
);

-- Sublets (Note: user_id is null here for simplicity, but in real app would be linked to a user)
insert into listings (
  title, address, latitude, longitude, rent, bedrooms, bathrooms, 
  neighborhood, lease_term, heating_type, nearest_tcat_route, 
  elevation_warning, distance_from_campus_miles, is_official_listing, 
  description, photos
) values 
(
  'Spring Semester Sublet - Collegetown', 
  '123 Dryden Rd, Ithaca, NY 14850', 
  42.4430, -76.4840, 
  950, 1, 1, 
  'Collegetown', 'Sublet', 'Steam', 'Route 30', 
  false, 0.3, false,
  'Subletting my room for Spring 2025. Fully furnished!',
  ARRAY['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80']
),
(
  'Sunny Room in Varna', 
  '999 Dryden Rd, Ithaca, NY 14850', 
  42.4550, -76.4500, 
  700, 1, 1, 
  'Varna', 'Sublet', 'Gas', 'Route 43', 
  false, 3.5, false,
  'Quiet room in a shared house. Car recommended but on bus route.',
  ARRAY['https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80']
);
