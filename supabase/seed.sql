-- Optional seed data for DRIP menu + reviews (synced from Foodpanda public menu)

insert into menu_items (name, description, category, price, image_url, tag, popular, sort_order) values
('Tiramisu Latte', 'Creamy coffee dessert layered with cocoa, mascarpone, and espresso-soaked ladyfingers.', 'coffee', 850, 'https://images.deliveryhero.io/image/global-menu-service/FP_PK/vendor/gvi4/product/100953170/bdf84150-ba76-4297-b616-952b124c5cd2.jpg?width=1200&height=1200', '#1 most liked', true, 1),
('Spanish Latte', 'Creamy coffee with a hint of cinnamon and sweetened condensed milk.', 'coffee', 850, 'https://images.deliveryhero.io/image/global-menu-service/FP_PK/vendor/gvi4/product/100894068/27fcb984-1f06-4a95-a69b-a953da90624f.jpg?width=1200&height=1200', 'Popular', true, 2),
('Cortado Coffee', 'Espresso balanced with milk — smooth and rich.', 'coffee', 699, 'https://images.deliveryhero.io/image/global-menu-service/FP_PK/vendor/gvi4/product/100894063/79ca0068-b34c-406e-8fbc-af061eee572a.jpg?width=1200&height=1200', null, true, 3),
('Pistachio Kunafa French Toast', 'Brioche French toast with sweet cheese filling, pistachio crème anglaise and crispy kadaif.', 'signature', 2380, 'https://images.deliveryhero.io/image/global-menu-service/FP_PK/vendor/gvi4/product/595c1fd6-995c-4765-b259-0662ea41c266.jpg?width=1200&height=1200', 'Signature', true, 1),
('House Special Caramel Croissant French Toast', 'Signature caramel croissant French toast — a Drip house favourite.', 'signature', 2090, 'https://images.deliveryhero.io/image/global-menu-service/FP_PK/vendor/gvi4/product/100952941/4d9fc8f5-2f3c-4bc5-b654-5aae4bdf3346.jpg?width=1200&height=1200', '#4 most liked', true, 2),
('Butter Croissant', 'Flaky, buttery pastry with a golden crust.', 'bakery', 600, 'https://images.deliveryhero.io/image/fd-pk/Products/98616881.jpg?width=1200&height=1200', '#3 most liked', true, 1),
('Hot Honey Croissant Sandwich', 'Crispy chicken thigh glazed with hot honey in a Danish butter croissant.', 'kitchen', 1920, 'https://images.deliveryhero.io/image/global-menu-service/FP_PK/vendor/gvi4/product/9a00f459-c2f9-426c-84ca-a8abc257689d.jpg?width=1200&height=1200', 'New', true, 1),
('Crunchy Chicken Wrap', 'Crispy chicken, seasoned potatoes, fresh greens, zesty chipotle sauce.', 'kitchen', 1140, 'https://images.deliveryhero.io/image/global-menu-service/FP_PK/vendor/gvi4/product/100894032/1f2109a5-f8e6-4df9-a9ba-46c4c0bd3780.jpg?width=1200&height=1200', null, true, 2);

insert into reviews (author, role, quote, rating, featured) values
('Google Guest', '685 REVIEWS · 4.5★', '“Excellent coffee, tasty pastry and crunchy wrap, and very good service. Free parking available.”', 5, true),
('Regular', 'GULBERG REGULAR', '“Their Spanish latte and tiramisu latte is so good — highly recommended.”', 5, true),
('Weekend Visitor', 'LAHORE', '“Great iced latte, courteous staff and cozy ambience.”', 5, true);
