DO $$ 
BEGIN
    -- Drop existing policies if they exist
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own orders') THEN
        DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create their own orders') THEN
        DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their order items') THEN
        DROP POLICY IF EXISTS "Users can view their order items" ON order_items;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create their order items') THEN
        DROP POLICY IF EXISTS "Users can create their order items" ON order_items;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own cart items') THEN
        DROP POLICY IF EXISTS "Users can view their own cart items" ON cart_items;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own cart items') THEN
        DROP POLICY IF EXISTS "Users can insert their own cart items" ON cart_items;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own cart items') THEN
        DROP POLICY IF EXISTS "Users can update their own cart items" ON cart_items;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own cart items') THEN
        DROP POLICY IF EXISTS "Users can delete their own cart items" ON cart_items;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own favorites') THEN
        DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own favorites') THEN
        DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own favorites') THEN
        DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;
    END IF;

    -- Drop existing tables in reverse order of dependencies
    DROP TABLE IF EXISTS order_items CASCADE;
    DROP TABLE IF EXISTS orders CASCADE;
    DROP TABLE IF EXISTS favorites CASCADE;
    DROP TABLE IF EXISTS cart_items CASCADE;
    DROP TABLE IF EXISTS products CASCADE;
    DROP TABLE IF EXISTS categories CASCADE;
END $$;
