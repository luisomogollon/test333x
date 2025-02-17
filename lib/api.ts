import { supabase } from './supabase';
import { Database } from '../types/supabase';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

// Products
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        name,
        icon
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getFlashSaleProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        name,
        icon
      )
    `)
    .eq('is_flash_sale', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getProductsByCategory = async (categoryId: number) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        name,
        icon
      )
    `)
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getProductById = async (id: number) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        name,
        icon
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Categories
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
};

// Cart
export const addToCart = async (userId: string, productId: number, quantity: number = 1) => {
  const { error } = await supabase
    .from('cart_items')
    .upsert({
      user_id: userId,
      product_id: productId,
      quantity
    }, {
      onConflict: 'user_id,product_id'
    });

  if (error) throw error;
};

export const removeFromCart = async (userId: string, productId: number) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) throw error;
};

export const getCartItems = async (userId: string) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      quantity,
      products (
        *,
        categories (
          name,
          icon
        )
      )
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data;
};

// Favorites
export const toggleFavorite = async (userId: string, productId: number) => {
  // First check if it exists
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  if (data) {
    // Remove if exists
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
    return false; // Indicates item was removed from favorites
  } else {
    // Add if doesn't exist
    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        product_id: productId
      });

    if (error) throw error;
    return true; // Indicates item was added to favorites
  }
};

export const getFavorites = async (userId: string) => {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      products (
        *,
        categories (
          name,
          icon
        )
      )
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data;
};
