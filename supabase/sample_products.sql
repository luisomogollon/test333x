-- Insert sample products for each category
WITH category_ids AS (
    SELECT id, name FROM categories
)
INSERT INTO products (name, description, price, category_id, stock, image_url) 
VALUES
    -- T-Shirts
    (
        'Classic White T-Shirt',
        'A comfortable and versatile white t-shirt made from 100% cotton',
        19.99,
        (SELECT id FROM category_ids WHERE name = 'T-Shirt'),
        100,
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'
    ),
    (
        'Black Essential Tee',
        'A must-have black t-shirt for any wardrobe',
        24.99,
        (SELECT id FROM category_ids WHERE name = 'T-Shirt'),
        75,
        'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500'
    ),
    -- Pants
    (
        'Blue Denim Jeans',
        'Classic blue jeans with a comfortable fit',
        49.99,
        (SELECT id FROM category_ids WHERE name = 'Pant'),
        50,
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'
    ),
    (
        'Khaki Chinos',
        'Versatile khaki pants perfect for any occasion',
        39.99,
        (SELECT id FROM category_ids WHERE name = 'Pant'),
        60,
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500'
    ),
    -- Dresses
    (
        'Floral Summer Dress',
        'Light and breezy dress with a beautiful floral pattern',
        59.99,
        (SELECT id FROM category_ids WHERE name = 'Dress'),
        40,
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500'
    ),
    (
        'Little Black Dress',
        'Elegant black dress suitable for any formal occasion',
        79.99,
        (SELECT id FROM category_ids WHERE name = 'Dress'),
        30,
        'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=500'
    ),
    -- Jackets
    (
        'Leather Biker Jacket',
        'Classic black leather jacket with silver hardware',
        199.99,
        (SELECT id FROM category_ids WHERE name = 'Jacket'),
        25,
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'
    ),
    (
        'Denim Jacket',
        'Timeless denim jacket perfect for layering',
        89.99,
        (SELECT id FROM category_ids WHERE name = 'Jacket'),
        45,
        'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500'
    ),
    -- Sneakers
    (
        'Classic White Sneakers',
        'Clean and minimalist white sneakers for everyday wear',
        79.99,
        (SELECT id FROM category_ids WHERE name = 'Shoes'),
        35,
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500'
    ),
    (
        'Running Performance Shoes',
        'High-performance running shoes with advanced cushioning',
        129.99,
        (SELECT id FROM category_ids WHERE name = 'Shoes'),
        25,
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'
    );
