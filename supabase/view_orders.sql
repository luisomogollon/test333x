-- Ver todas las órdenes con sus items y productos
SELECT 
    o.id as order_id,
    o.total,
    o.status,
    o.created_at as order_date,
    oi.quantity,
    oi.price as item_price,
    p.name as product_name,
    p.description as product_description
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
ORDER BY o.created_at DESC;

-- Ver el carrito actual de un usuario específico
SELECT 
    ci.quantity,
    p.name as product_name,
    p.price,
    p.stock,
    (ci.quantity * p.price) as subtotal
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
WHERE ci.user_id = auth.uid()  -- Esto mostrará solo los items del usuario actual
ORDER BY ci.created_at DESC;
