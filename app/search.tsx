import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Product } from '../types';
import SearchBar from '../components/SearchBar';

export default function Search() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setProducts([]);
      setSearchPerformed(false);
      return;
    }

    try {
      setLoading(true);
      setSearchPerformed(true);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user?.id,
          product_id: product.id,
        });

      if (error) {
        if (error.code === '23505') {
          Alert.alert('Info', 'Product is already in your favorites');
        } else {
          throw error;
        }
      } else {
        Alert.alert('Success', 'Added to favorites');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const addToCart = async (product: Product) => {
    try {
      // Check if item already exists in cart
      const { data: existingItems, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user?.id)
        .eq('product_id', product.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existingItems) {
        // Update quantity if item exists
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItems.quantity + 1 })
          .eq('id', existingItems.id);

        if (error) throw error;
      } else {
        // Add new item if it doesn't exist
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user?.id,
            product_id: product.id,
            quantity: 1,
          });

        if (error) throw error;
      }

      Alert.alert('Success', 'Added to cart');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <SearchBar onSearch={handleSearch} />
      
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#8B4513" />
        </View>
      ) : searchPerformed && products.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="search-outline" size={64} color="#666" />
          <Text style={styles.emptyText}>No products found</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => router.push(`/product/${item.id}`)}
            >
              <Image
                source={{ uri: item.image_url }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>
                  ${item.price.toFixed(2)}
                </Text>
                <Text style={styles.productDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => addToCart(item)}
                  >
                    <Ionicons name="cart-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.favoriteButton]}
                    onPress={() => addToFavorites(item)}
                  >
                    <Ionicons name="heart-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  list: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 12,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  productPrice: {
    fontSize: 16,
    color: '#8B4513',
    marginTop: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#8B4513',
    padding: 8,
    borderRadius: 6,
  },
  favoriteButton: {
    backgroundColor: '#FF69B4',
  },
});
