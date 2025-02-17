import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '../../types';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function Cart() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      loadCartItems();
    }
  }, [user]);

  const loadCartItems = async () => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          user_id,
          created_at,
          product_id,
          quantity,
          product:products (
            id,
            name,
            price,
            image_url,
            stock
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;

    // Check stock
    if (newQuantity > item.product.stock) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Not enough stock available',
      });
      return;
    }

    try {
      setUpdating(true);
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;
      
      setCartItems(items =>
        items.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      setCartItems(items => items.filter(item => item.id !== itemId));
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Your cart is empty',
      });
      return;
    }

    // Show toast notification
    Toast.show({
      type: 'info',
      text1: 'Checkout',
      text2: 'Processing your order...',
      visibilityTime: 3000,
    });

    // Check stock for all items
    for (const item of cartItems) {
      if (item.quantity > item.product.stock) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: `Not enough stock available for ${item.product.name}`,
        });
        return;
      }
    }

    try {
      setProcessing(true);

      // Start a Supabase transaction
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id,
          total: cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
          status: 'processing'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update product stock
      for (const item of cartItems) {
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock: item.product.stock - item.quantity })
          .eq('id', item.product.id);

        if (stockError) throw stockError;
      }

      // Delay before clearing the cart
      setTimeout(async () => {
        // Clear cart
        const { error: clearError } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user?.id);

        if (clearError) throw clearError;

        setCartItems([]);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Your order has been placed successfully!',
          visibilityTime: 3000,
        });

        // Notification
        Toast.show({
          type: 'info',
          text1: 'Notification',
          text2: 'Your order is being processed',
          visibilityTime: 3000,
        });

        // Delay before navigating to another view
        setTimeout(() => {
          router.push('/profile');
        }, 500);
      }, 1000);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
    } finally {
      setProcessing(false);
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cart-outline" size={64} color="#666" />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.continueButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shopping Cart</Text>
      <FlatList
        data={cartItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image
              source={{ uri: item.product.image_url }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.product.name}</Text>
              <Text style={styles.productPrice}>
                ${item.product.price.toFixed(2)}
              </Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={updating || processing}
                >
                  <Ionicons name="remove-circle-outline" size={24} color="#8B4513" />
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={updating || processing}
                >
                  <Ionicons name="add-circle-outline" size={24} color="#8B4513" />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => removeItem(item.id)}
              disabled={updating || processing}
              style={styles.removeButton}
            >
              <Ionicons name="trash-outline" size={24} color="#FF0000" />
            </TouchableOpacity>
          </View>
        )}
      />
      <View style={styles.footer}>
        <Text style={styles.total}>
          Total: <Text style={styles.totalAmount}>${totalPrice.toFixed(2)}</Text>
        </Text>
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            (processing || updating) && styles.disabledButton
          ]}
          onPress={handleCheckout}
          disabled={processing || updating}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          )}
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
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
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
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantity: {
    fontSize: 18,
    marginHorizontal: 12,
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
    marginTop: 16,
  },
  total: {
    fontSize: 18,
    color: '#333',
  },
  totalAmount: {
    fontWeight: 'bold',
    color: '#8B4513',
  },
  checkoutButton: {
    backgroundColor: '#8f5f3d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    elevation:5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});