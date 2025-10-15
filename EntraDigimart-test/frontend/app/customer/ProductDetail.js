import React, { useEffect, useState } from 'react';
import { 
  View, Text, Image, TouchableOpacity, 
  ScrollView, SafeAreaView, Dimensions, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../../api';
import { ReviewModal, ReviewItem, RatingStats } from './ReviewComponents';

// eslint-disable-next-line no-unused-vars
const { width } = Dimensions.get('window');

export default function ProductDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({});
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [currentInCart, setCurrentInCart] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${params.productId}`);
        const data = res.data.product;

        if (!data) {
          Alert.alert('Error', 'Product not found');
          return;
        }

        setProduct({
          id: data.id,
          name: data.productName,
          price: Number(data.price),
          category: data.category,
          rating: data.average_rating || 0,
          image: data.images && data.images.length > 0 ? `http://192.168.8.124:5000${data.images[0].path}` : 'https://via.placeholder.com/300x300',
          description: data.description,
          stock: Number(data.stockQty),
          sellerName: data.sellerName,
          reviewCount: data.review_count || 0
        });

        // Check current cart quantity for this product
        await checkCurrentCartQuantity();

        // Fetch reviews and rating stats (non-blocking, after product loads)
        setTimeout(async () => {
          try {
            await fetchReviews(params.productId);
          } catch (error) {
            console.log('Reviews not available:', error.message);
          }
          
          try {
            await checkReviewEligibility(params.productId);
          } catch (error) {
            console.log('Review eligibility check failed:', error.message);
          }

          try {
            await checkFavoriteStatus(params.productId);
          } catch (error) {
            console.log('Favorite status check failed:', error.message);
          }
        }, 500);
      } catch (error) {
        console.error('Error fetching product:', error.response?.data || error.message);
        Alert.alert('Error', 'Failed to fetch product data');
      }
    };

    fetchProduct();
  }, [params.productId]);

  const fetchReviews = async (productId) => {
    try {
      setReviewsLoading(true);
      console.log('=== FETCHING REVIEWS ===');
      console.log('Product ID:', productId);
      console.log('API Base URL:', API.defaults?.baseURL);
      
      const response = await API.get(`/reviews/product/${productId}`);
      
      console.log('✅ Reviews fetch SUCCESS!');
      console.log('Response status:', response.status);
      console.log('Raw response data:', response.data);
      
      const data = response.data.data || response.data;
      
      console.log('Processed data:', {
        reviews: data.reviews,
        ratingStats: data.ratingStats,
        averageRating: data.averageRating,
        totalReviews: data.totalReviews
      });
      
      setReviews(data.reviews || []);
      setRatingStats(data.ratingStats || {});
      setAverageRating(data.averageRating || 0);
      setReviewCount(data.totalReviews || 0);
      
      console.log('✅ Reviews state updated successfully');
    } catch (error) {
      console.error('❌ REVIEWS FETCH ERROR:');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Set default values if reviews fetch fails
      setReviews([]);
      setRatingStats({});
      setAverageRating(0);
      setReviewCount(0);
    } finally {
      setReviewsLoading(false);
    }
  };

  const checkReviewEligibility = async (productId) => {
    try {
      // Check if user is logged in using the same method as the API interceptor
      const { getToken } = await import('../../api');
      const token = await getToken();
      if (!token) {
        console.log('No token found, user not logged in');
        setCanReview(false);
        return;
      }

      const response = await API.get(`/reviews/can-review/${productId}`);
      setCanReview(response.data.data.canReview);
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      // Don't block the page if review eligibility check fails
      setCanReview(false);
    }
  };

  const checkFavoriteStatus = async (productId) => {
    try {
      const { getToken } = await import('../../api');
      const token = await getToken();
      if (!token) {
        setIsFavorite(false);
        return;
      }

      const response = await API.get(`/products/${productId}/favorite/check`);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      // Handle 404 errors gracefully - favorites feature may not be set up yet
      if (error.response?.status === 404) {
        console.log('Favorites feature not available (404)');
      } else if (error.response?.status === 500) {
        console.log('Server error checking favorites (likely database table missing)');
      } else {
        console.log('Error checking favorite status:', error.response?.status || error.message);
      }
      setIsFavorite(false);
    }
  };

  const checkCurrentCartQuantity = async () => {
    try {
      const existingCart = await AsyncStorage.getItem('cart');
      const cartItems = existingCart ? JSON.parse(existingCart) : [];
      const existingItem = cartItems.find(item => item.id === parseInt(params.productId));
      setCurrentInCart(existingItem ? existingItem.quantity : 0);
    } catch (error) {
      console.log('Error checking cart quantity:', error);
      setCurrentInCart(0);
    }
  };

  const toggleFavorite = async () => {
    try {
      const { getToken } = await import('../../api');
      const token = await getToken();
      if (!token) {
        Alert.alert('Login Required', 'Please login to add favorites');
        return;
      }

      setFavoriteLoading(true);
      
      if (isFavorite) {
        await API.delete(`/products/${product.id}/favorite`);
        setIsFavorite(false);
      } else {
        await API.post(`/products/${product.id}/favorite`);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        Alert.alert('Feature Not Available', 'Favorites feature is not currently available. Please try again later.');
      } else if (error.response?.status === 500) {
        Alert.alert('Server Error', 'Unable to update favorites. The feature may not be properly set up.');
      } else {
        Alert.alert('Error', 'Failed to update favorites. Please try again.');
      }
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    fetchReviews(params.productId);
    checkReviewEligibility(params.productId);
  };

  if (!product) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-white">
        <Text className="text-lg text-gray-700">Loading product...</Text>
      </SafeAreaView>
    );
  }

  const incrementQuantity = async () => {
    try {
      // Check current cart to see how many of this item are already added
      const existingCart = await AsyncStorage.getItem('cart');
      const cartItems = existingCart ? JSON.parse(existingCart) : [];
      const existingItem = cartItems.find(item => item.id === product.id);
      const currentInCart = existingItem ? existingItem.quantity : 0;
      
      // Calculate max quantity that can be selected
      const maxSelectable = product.stock - currentInCart;
      
      if (quantity < maxSelectable) {
        setQuantity(quantity + 1);
      } else {
        Alert.alert(
          'Stock Limit', 
          `Maximum ${maxSelectable} can be added. You already have ${currentInCart} in cart.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      // Fallback to simple stock check if cart reading fails
      if (quantity < product.stock) setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };



  const addToCart = async () => {
    // Validate quantity
    if (quantity <= 0) {
      Alert.alert('Invalid Quantity', 'Please select a valid quantity');
      return;
    }

    if (quantity > product.stock) {
      Alert.alert('Insufficient Stock', `Only ${product.stock} items available in stock`);
      return;
    }

    try {
      const existingCart = await AsyncStorage.getItem('cart');
      let cartItems = existingCart ? JSON.parse(existingCart) : [];

      const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
      const currentInCart = existingItemIndex > -1 ? cartItems[existingItemIndex].quantity : 0;
      const newTotalQuantity = currentInCart + quantity;

      // Check if the new total would exceed available stock
      if (newTotalQuantity > product.stock) {
        const maxCanAdd = product.stock - currentInCart;
        if (maxCanAdd <= 0) {
          Alert.alert(
            'Cart Limit Reached', 
            `You already have ${currentInCart} of this item in your cart. Available stock: ${product.stock}`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Insufficient Stock', 
            `Can only add ${maxCanAdd} more items. Available stock: ${product.stock}, In cart: ${currentInCart}`,
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: `Add ${maxCanAdd}`, 
                onPress: async () => {
                  try {
                    if (existingItemIndex > -1) {
                      cartItems[existingItemIndex].quantity = product.stock;
                    } else {
                      cartItems.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        quantity: maxCanAdd,
                        stock_quantity: product.stock
                      });
                    }
                    await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
                    Alert.alert('Added to Cart', `${maxCanAdd} ${product.name} added to your cart\nTotal in cart: ${product.stock}\n\nThe marketplace will show updated availability when you return.`);
                  } catch (error) {
                    Alert.alert('Error', 'Failed to add product to cart');
                  }
                }
              }
            ]
          );
        }
        return;
      }

      // Add to cart normally
      if (existingItemIndex > -1) {
        cartItems[existingItemIndex].quantity = newTotalQuantity;
      } else {
        cartItems.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: quantity,
          stock_quantity: product.stock
        });
      }

      await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
      Alert.alert(
        'Added to Cart', 
        `${quantity} ${product.name} added to your cart\nTotal in cart: ${newTotalQuantity}\n\nThe marketplace will show updated availability when you return.`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => router.push('/customer/cart') }
        ]
      );

    } catch (error) {
      Alert.alert('Error', 'Failed to add product to cart');
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Product Details</Text>
        <TouchableOpacity 
          onPress={toggleFavorite} 
          disabled={favoriteLoading}
          className="p-2"
        >
          <Ionicons 
            name={favoriteLoading ? "heart-half" : (isFavorite ? "heart" : "heart-outline")} 
            size={24} 
            color={isFavorite ? "#EF4444" : "#000"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View className="items-center justify-center p-6 bg-gray-100">
          <Image 
            source={{ uri: product.image }} 
            className="rounded-lg w-80 h-80" 
            resizeMode="contain"
          />
        </View>

        {/* Product Info */}
        <View className="px-5 py-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-2xl font-bold text-gray-900">{product.name}</Text>
            <Text className="text-lg font-bold text-purple-600">Rs. {product.price}.00</Text>
          </View>

          <View className="flex-row items-center mb-4">
            <Ionicons name="star" size={16} color="#FCD34D" />
            <Text className="ml-1 text-sm text-gray-700">
              {averageRating > 0 ? parseFloat(averageRating).toFixed(1) : 'No ratings'}
            </Text>
            <Text className="ml-1 text-sm text-gray-500">
              ({reviewCount} reviews)
            </Text>
            <Text className="ml-2 text-sm text-gray-500">• {product.category}</Text>
          </View>

          {product.sellerName && (
            <View className="flex-row items-center mb-4">
              <Ionicons name="storefront" size={16} color="#8B5CF6" />
              <Text className="ml-1 text-sm text-gray-700">Sold by {product.sellerName}</Text>
            </View>
          )}

          <View className="mb-6">
            <View className="flex-row items-center">
              <Ionicons 
                name={product.stock > 0 ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={product.stock > 0 ? "#10B981" : "#EF4444"} 
              />
              <Text className={`ml-2 text-sm ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
              </Text>
            </View>
            {currentInCart > 0 && (
              <View className="flex-row items-center mt-1">
                <Ionicons name="cart" size={16} color="#8B5CF6" />
                <Text className="ml-2 text-sm text-purple-600">
                  {currentInCart} already in cart • {product.stock - currentInCart} more can be added
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="mb-2 text-lg font-semibold text-gray-900">Description</Text>
            <Text className="text-gray-600">{product.description}</Text>
          </View>

          {/* Quantity Selector */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-lg font-semibold text-gray-900">Quantity</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg">
              <TouchableOpacity 
                onPress={decrementQuantity}
                className="px-4 py-2"
                disabled={quantity <= 1}
              >
                <Text className={`text-lg ${quantity <= 1 ? "text-gray-300" : "text-gray-700"}`}>-</Text>
              </TouchableOpacity>
              <Text className="px-4 py-2 text-lg font-semibold text-gray-900">{quantity}</Text>
              <TouchableOpacity 
                onPress={incrementQuantity}
                className="px-4 py-2"
                disabled={quantity >= product.stock}
              >
                <Text className={`text-lg ${quantity >= product.stock ? "text-gray-300" : "text-gray-700"}`}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity 
            onPress={addToCart}
            disabled={product.stock <= 0}
            className={`items-center py-4 rounded-lg mb-6 ${product.stock <= 0 ? "bg-gray-300" : "bg-purple-600"}`}
          >
            <Text className="text-lg font-semibold text-white">
              {product.stock <= 0 ? 'Out of Stock' : `Add to Cart - Rs. ${product.price * quantity}.00`}
            </Text>
          </TouchableOpacity>

          {/* Reviews & Rating Section */}
          <View className="pt-6 mb-6 border-t border-gray-200">
            <View className="flex-row items-center justify-between mb-6">
              <View>
                <Text className="text-xl font-bold text-gray-900">Reviews & Ratings</Text>
                <Text className="mt-1 text-sm text-gray-500">
                  {reviewCount > 0 ? `${reviewCount} customer reviews` : 'Be the first to review'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowReviewModal(true)}
                className={`px-4 py-2 rounded-lg ${canReview ? 'bg-purple-600' : 'bg-gray-300'}`}
                disabled={!canReview}
              >
                <Text className={`font-medium ${canReview ? 'text-white' : 'text-gray-500'}`}>
                  {canReview ? 'Write Review' : 'Purchase to Review'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Overall Rating Summary */}
            {reviewCount > 0 ? (
              <RatingStats 
                ratingStats={ratingStats}
                averageRating={averageRating}
                reviewCount={reviewCount}
              />
            ) : (
              <View className="p-6 mb-4 bg-purple-50 rounded-xl">
                <View className="items-center">
                  <Ionicons name="star-outline" size={48} color="#8B5CF6" />
                  <Text className="mt-2 text-lg font-semibold text-gray-900">No Reviews Yet</Text>
                  <Text className="mt-1 text-center text-gray-600">
                    Be the first to share your experience with this product
                  </Text>
                  {canReview && (
                    <TouchableOpacity
                      onPress={() => setShowReviewModal(true)}
                      className="px-6 py-2 mt-4 bg-purple-600 rounded-full"
                    >
                      <Text className="font-medium text-white">Write First Review</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Customer Reviews */}
            <View className="mb-4">
              <Text className="mb-3 text-lg font-semibold text-gray-900">
                Customer Reviews
              </Text>
              
              {reviewsLoading ? (
                <View className="items-center py-8">
                  <Text className="text-gray-500">Loading reviews...</Text>
                </View>
              ) : reviews.length > 0 ? (
                <View>
                  {reviews.slice(0, 5).map((review) => (
                    <ReviewItem key={review.id} review={review} />
                  ))}
                  {reviews.length > 5 && (
                    <TouchableOpacity className="p-3 mt-4 border border-purple-200 rounded-lg bg-purple-50">
                      <Text className="font-medium text-center text-purple-600">
                        View all {reviewCount} reviews
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View className="p-4 border-2 border-gray-200 border-dashed rounded-lg bg-gray-50">
                  <Text className="text-center text-gray-500">
                    No customer reviews available yet
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Review Modal */}
      <ReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        productId={product?.id}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </SafeAreaView>
  );
}
