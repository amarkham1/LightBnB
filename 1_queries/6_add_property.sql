INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, parking_spaces, number_of_bathrooms, number_of_bedrooms, country, street, city, province, post_code) VALUES
(1, 'test', 'testdescr', 'url.com', 'url.comcover', 3, 2, 1, 'US', 'fake rd', 'toronto', 'adad', '12312')
RETURNING *;