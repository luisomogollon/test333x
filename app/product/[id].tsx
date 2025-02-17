import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types';
import Toast from 'react-native-toast-message';

const { width: screenWidth } = Dimensions.get('window');

export default function ProductDetails() {
  useEffect(() => {
    // No need to set ref for Toast
  }, []);

  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [notification, setNotification] = useState(false);
  const [totalPrice, setTotalPrice] = useState(product ? product.price : 0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!id || typeof id !== 'string') {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Invalid product ID',
      });
      router.back();
      return;
    }
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      setTotalPrice(product.price * quantity);
    }
  }, [product, quantity]);

  useEffect(() => {
    if (product && user) {
      checkIfFavorite();
    }
  }, [product, user]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Product not found',
        });
        router.back();
        return;
      }

      setProduct(data);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error loading product',
        text2: error.message,
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user!.id)
        .eq('product_id', product!.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsFavorite(!!data);
    } catch (error: any) {
      console.error('Error checking favorite status:', error.message);
    }
  };

  const toggleFavorite = async () => {
    if (!product || !user) return;

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);

        if (error) throw error;
        setIsFavorite(false);
        Toast.show({
          type: 'info',
          text1: 'Removed from Favorites',
          text2: `${product.name} has been removed from your favorites.`,
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            product_id: product.id,
          });

        if (error) {
          if (error.code === '23505') {
            Toast.show({
              type: 'info',
              text1: 'Info',
              text2: 'Product is already in your favorites',
            });
          } else {
            throw error;
          }
        } else {
          setIsFavorite(true);
          Toast.show({
            type: 'success',
            text1: 'Added to Favorites',
            text2: `${product.name} has been added to your favorites.`,
          });
        }
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
    }
  };

  const addToCart = async () => {
    if (!product || !user) return;

    try {
      // Check if item already exists in cart
      const { data: existingItems, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existingItems) {
        // Update quantity if item exists
        const newQuantity = existingItems.quantity + quantity;
        
        // Check stock
        if (newQuantity > product.stock) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Not enough stock available',
          });
          return;
        }

        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItems.id);

        if (error) throw error;
      } else {
        // Check stock
        if (quantity > product.stock) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Not enough stock available',
          });
          return;
        }

        // Add new item if it doesn't exist
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: quantity,
          });

        if (error) throw error;
      }

      setNotification(true);
      router.push('/cart');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.minimalBackButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFavorite} style={styles.minimalFavoriteButton}>
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={28} color={isFavorite ? "#FFD700" : "#333"} />
        </TouchableOpacity>
        <Image
          source={{ uri: product.image_url }}
          style={[styles.image, { height: screenWidth * 0.75 }]}
          resizeMode="cover"
        />
        
        <View style={styles.content}>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>Casual Fashion Style</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={15

              } color="#FFD700" />
              <Text style={styles.ratingText}>4.5</Text>
            </View>
          </View>
          <Text style={styles.name}>{product.name}</Text>
          <View style={styles.productDetails}>
            <Text style={styles.productDetailsTitle}>Product Details</Text>
            <Text style={styles.productDetailsText}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>
          </View>

          {/* Line separator */}
          <View style={styles.separator} />

          <View style={[styles.stockInfo, { marginTop: 24 }]}>
            <Text style={styles.stockLabel}>Available Stock:</Text>
            <Text style={styles.stockValue}>{product.stock}</Text>
          </View>

          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                onPress={() => setQuantity(q => Math.max(1, q - 1))}
                style={styles.quantityButton}
              >
                <Ionicons name="remove" size={24} color="#8B4513" />
              </TouchableOpacity>
              <Text style={styles.quantity}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(q => Math.min(product.stock, q + 1))}
                style={styles.quantityButton}
              >
                <Ionicons name="add" size={24} color="#8B4513" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sizeContainer}>
            <Text style={styles.sizeLabel}>Select Size:</Text>
            <View style={styles.sizeOptions}>
              <TouchableOpacity style={styles.sizeOption}><Text>S</Text></TouchableOpacity>
              <TouchableOpacity style={styles.sizeOption}><Text>M</Text></TouchableOpacity>
              <TouchableOpacity style={styles.sizeOption}><Text>L</Text></TouchableOpacity>
              <TouchableOpacity style={styles.sizeOption}><Text>XL</Text></TouchableOpacity>
              <TouchableOpacity style={styles.sizeOption}><Text>XXL</Text></TouchableOpacity>
              <TouchableOpacity style={styles.sizeOption}><Text>XXXL</Text></TouchableOpacity>
            </View>
          </View>

          <View style={styles.colorContainer}>
            <Text style={styles.colorLabel}>Select Color:</Text>
            <View style={styles.colorOptions}>
              <TouchableOpacity style={[styles.colorOption, { backgroundColor: '#8B4513' }]} />
              <TouchableOpacity style={[styles.colorOption, { backgroundColor: '#Ffff' }]} />
              <TouchableOpacity style={[styles.colorOption, { backgroundColor: '#D3D3D3' }]} />
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.actionsContainer}>
        <View>
          <Text style={styles.totalPriceLabel}>Total Price</Text>
          <Text style={styles.price}>${totalPrice.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.addToCartButton} onPress={addToCart}>
          <Ionicons name="bag-handle" size={24} color="#fff" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
      <Toast />
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
  image: {
    width: '100%',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    color: '#000', // Changed color to black
    fontWeight: '600',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24, // Increased margin
  },
  stockValue: {
    fontSize: 16,
    color: '#666',
  },
  stockLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    padding: 8,
    backgroundColor: '#f0ebeb',
    borderRadius: 8,
    elevation: 3,
  },
  quantity: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  addToCartButton: {
    backgroundColor: '#8f5f3d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20, // Increased border radius
    alignItems: 'center',
    marginLeft: 20,
    elevation: 5,
    flexDirection: 'row', // Added to align icon and text
  },
  addToCartText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 11, // Added to create space between icon and text
  },
  favoriteButton: {
    backgroundColor: '#FF69B4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    aspectRatio: 1,
  },
  minimalBackButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 1,
    borderRadius: 50,
    padding: 6,
    backgroundColor: '#fff',
    elevation: 5,
  },
  minimalFavoriteButton: {
    position: 'absolute',
    top: 40,
    right: 16,
    zIndex: 1,
    borderRadius: 50,
    padding: 8, // Increased padding
    backgroundColor: '#fff',
    elevation: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  productDetails: {
    borderRadius: 8,
  },
  productDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productDetailsText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  sizeContainer: {
    marginBottom: 24,
  },
  sizeLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 6,
  },
  sizeOptions: {
    flexDirection: 'row',
    gap: 6,
  },
  sizeOption: {
    paddingVertical: 4, // Reduced height
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 13,
    marginRight: 18,
    backgroundColor: '#f0ebeb',
    elevation: 3,
  },
  colorContainer: {
    marginBottom: 24,
  },
  colorLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 6,
  },
  colorOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    elevation: 3,
  },
  totalPriceLabel: {
    fontSize: 14,
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 16,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 15,
    marginLeft: 4,
  },
  notificationDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
  },
});