-- Optional seed data for DRIP menu + reviews

insert into menu_items (name, description, category, price, image_url, tag, popular, sort_order) values
('Spanish Latte', 'House favourite. Sweet condensed milk, double espresso, silky foam.', 'coffee', 950, 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1200&auto=format&fit=crop', 'Popular', true, 1),
('Cortado Coffee', 'Equal parts espresso and steamed milk.', 'coffee', 650, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=1200&auto=format&fit=crop', null, true, 2),
('Tiramisu Latte', 'Espresso, mascarpone cream, cocoa dust.', 'coffee', 1050, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=1200&auto=format&fit=crop', 'Signature', true, 3),
('Hot Honey Croissant Sando', 'Newest lunch ritual — crunchy, sweet heat.', 'bakery', 1450, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop', 'New', true, 1),
('Crunchy Chicken Wrap', 'Crisp chicken, house sauce, fresh greens.', 'kitchen', 1650, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=1200&auto=format&fit=crop', null, true, 1),
('The Bronze', 'Double espresso, caramelised jaggery, smoked cream.', 'signature', 950, 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1200&auto=format&fit=crop', 'Signature Nº 1', false, 1);

insert into reviews (author, role, quote, rating, featured) values
('Google Guest', '685 REVIEWS · 4.5★', '“Excellent coffee, tasty pastry and crunchy wrap, and very good service. Free parking available.”', 5, true),
('Regular', 'GULBERG REGULAR', '“Their Spanish latte and tiramisu latte is so good — highly recommended.”', 5, true),
('Weekend Visitor', 'LAHORE', '“Great iced latte, courteous staff and cozy ambience.”', 5, true);
