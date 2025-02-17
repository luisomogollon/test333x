import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { getCategories, getProducts, getProductsByCategory } from '../../lib/api';
import { Database } from '../../types/supabase';
import { CustomIcon } from '../../components/CustomIcon';

type Product = Database['public']['Tables']['products']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'];
};
type Category = Database['public']['Tables']['categories']['Row'];

const { width: screenWidth } = Dimensions.get('window');

const getCategoryIconSize = () => {
  if (screenWidth < 360) return 28;
  if (screenWidth < 400) return 32;
  if (screenWidth < 600) return 36;
  return 40;
};

const getCategoryIconContainerSize = () => {
  if (screenWidth < 360) return 44;
  if (screenWidth < 400) return 48;
  if (screenWidth < 600) return 52;
  return 56;
};

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Newest');
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 12, seconds: 56 });
  const [bannerIndex, setBannerIndex] = useState(0);
  const [displayedCategories, setDisplayedCategories] = useState<Category[]>([]);
  const [notification, setNotification] = useState(false);
  const { width } = useWindowDimensions();

  const banners = [
    {
      id: 1,
      title: "New Collection",
      subtitle: "Spring/Summer 2025",
      image: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=500"
    },
    {
      id: 2,
      title: "Summer Sale",
      subtitle: "Up to 50% Off",
      image: "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=500"
    },
    {
      id: 3,
      title: "Exclusive Deals",
      subtitle: "Limited Time Only",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500"
    },
    {
      id: 4,
      title: "Premium Collection",
      subtitle: "New Arrivals 2025",
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=500"
    },
    {
      id: 5,
      title: "Special Offer",
      subtitle: "Buy 2 Get 1 Free",
      image: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=500"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadProductsByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    setDisplayedCategories(categories);
  }, [categories]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex(prevIndex => (prevIndex + 1) % banners.length);
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const categoriesData = await getCategories();
      const productsData = await getProducts();
      setCategories(categoriesData);
      setProducts(productsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setLoading(false);
    }
  };

  const loadProductsByCategory = async (categoryId: number) => {
    try {
      const productsData = await getProductsByCategory(categoryId);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleCategoryPress = (categoryId: number) => {
    setSelectedCategory(categoryId);
    loadProductsByCategory(categoryId);
  };

  const handleProductPress = (productId: number) => {
    router.push(`/product/${productId}`);
  };

  const filters = ['All', 'Newest', 'Popular', 'Man', 'Woman'];

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: any } = {
      'T-Shirt': 'shirt',
      'Pant': 'trousers',
      'Dress': 'woman',
      'Jacket': 'shirt',
    };
    return iconMap[categoryName] || 'cube';
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={20} color="#666" />
          <Text style={styles.locationText}>New York, USA</Text>
          <Ionicons name="chevron-down-outline" size={20} color="#0a0a0a" />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => console.log('Notifications pressed')}>
            <Ionicons name="notifications" size={24} color="#000" />
            {notification && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <TouchableOpacity onPress={() => console.log('Settings pressed')}>
          <Ionicons name="settings-outline" size={20} color="#666" style={styles.settingsIcon} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#8B4513" />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Banner Carousel */}
          <View style={styles.bannerSection}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={e => {
                const offset = e.nativeEvent.contentOffset.x;
                const newIndex = Math.round(offset / e.nativeEvent.layoutMeasurement.width);
                setBannerIndex(newIndex);
              }}
              scrollEventThrottle={16}
              contentOffset={{ x: bannerIndex * width, y: 0 }}
            >
              {banners.map((banner) => (
                <View key={banner.id} style={[styles.banner, { width: width - 32 }]}>
                  <View style={styles.bannerContent}>
                    <Text style={styles.bannerTitle}>{banner.title}</Text>
                    <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                    <TouchableOpacity style={styles.shopButton}>
                      <Text style={styles.shopButtonText}>Shop Now</Text>
                    </TouchableOpacity>
                  </View>
                  <Image
                    source={{ uri: banner.image }}
                    style={styles.bannerImage}
                  />
                </View>
              ))}
            </ScrollView>
            <View style={styles.paginationContainer}>
              {banners.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === bannerIndex && styles.paginationDotActive
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Categories */}
          <View style={styles.categoriesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Category</Text>
              <Link href="/(tabs)/favorites" style={styles.seeAllLink}>
                <Text style={styles.seeAllText}>See All</Text>
              </Link>
            </View>
            <View style={styles.categoriesList}>
              {displayedCategories
                .sort((a, b) => {
                  const order = ['T-Shirt', 'Pant', 'Dress', 'Jacket'];
                  return order.indexOf(a.name) - order.indexOf(b.name);
                })
                .map((category) => (
                  <TouchableOpacity 
                    key={category.id} 
                    style={styles.categoryItem}
                    onPress={() => handleCategoryPress(category.id)}>
                    <View style={[styles.categoryIconContainer, { width: getCategoryIconContainerSize(), height: getCategoryIconContainerSize() }]}>
                      <CustomIcon 
                        name={category.name.toLowerCase() as 't-shirt' | 'pants' | 'dress' | 'jacket'}
                        width={getCategoryIconSize()}
                        height={getCategoryIconSize()}
                        color="#704f38" // Ensure the color is the same as the banner button
                      />
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>

          {/* Flash Sale Section */}
          <View style={styles.flashSaleSection}>
            <View style={styles.flashSaleHeader}>
              <Text style={styles.flashSaleTitle}>Flash Sale</Text>
              <View style={styles.timerContainer}>
                <Text style={styles.closingText}>Closing in:</Text>
                <View style={styles.timerNumbersContainer}>
                  <View style={styles.timerBox}>
                    <Text style={styles.timerText}>{String(timeLeft.hours).padStart(2, '0')}</Text>
                  </View>
                  <Text style={styles.timerSeparator}>:</Text>
                  <View style={styles.timerBox}>
                    <Text style={styles.timerText}>{String(timeLeft.minutes).padStart(2, '0')}</Text>
                  </View>
                  <Text style={styles.timerSeparator}>:</Text>
                  <View style={styles.timerBox}>
                    <Text style={styles.timerText}>{String(timeLeft.seconds).padStart(2, '0')}</Text>
                  </View>
                </View>
              </View>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersContainer}>
              {filters.map((filter, index) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter && styles.filterButtonActive,
                    index === 0 && { marginLeft: 16 }
                  ]}
                  onPress={() => setSelectedFilter(filter)}>
                  <Text style={[
                    styles.filterText,
                    selectedFilter === filter && styles.filterTextActive
                  ]}>{filter}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Products */}
          <View style={styles.productsSection}>
            <View style={styles.productsContainer}>
              <View style={styles.productsList}>
                {products.slice(0, 4).map((product) => (
                  <TouchableOpacity 
                    key={product.id} 
                    style={[
                      styles.productItem, 
                      { width: (width - 48) / 2 }, // Display 2 products per row
                    ]}
                    onPress={() => handleProductPress(product.id)}>
                    <View style={styles.productImageContainer}>
                      <Image
                        source={{ uri: product.image_url }}
                        style={styles.productImage}
                      />
                      <View style={styles.productImageOverlay} />
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                      <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffdf8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    padding: 8,
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  settingsIcon: {
    marginLeft: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerSection: {
    marginBottom: 24,
  },
  banner: {
    backgroundColor: '#fceed7',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  bannerImage: {
    width: 120,
    height: 160,
    borderRadius: 12,
  },
  shopButton: {
    backgroundColor: '#704f38',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  shopButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D3D3D3',
  },
  paginationDotActive: {
    backgroundColor: '#704f38',
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllLink: {
    padding: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: '#704f38',
  },
  categoriesList: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 16,
    width: '100%',
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  categoryIconContainer: {
    width: getCategoryIconContainerSize(),
    height: getCategoryIconContainerSize(),
    borderRadius: getCategoryIconContainerSize() / 2,
    backgroundColor: '#eee7dc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
	elevation: 3,
  },
  categoryName: {
    fontSize: 14,
    color: '#666',
  },
  productsSection: {
    marginBottom: 24,
  },
  productsContainer: {
    gap: 16,
  },
  productsList: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  productItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  productImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#8B4513',
    opacity: 0.1,
    borderRadius: 12,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  flashSaleSection: {
    marginBottom: 16,
  },
  flashSaleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  flashSaleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  closingText: {
    fontSize: 15,
    color: '#666',
  },
  timerNumbersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  timerBox: {
    backgroundColor: '#eee7dc',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#704f38',
  },
  timerSeparator: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 1,
  },
  filtersContainer: {
    paddingVertical: 4,
    gap: 6,
    
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: '#704f38',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});