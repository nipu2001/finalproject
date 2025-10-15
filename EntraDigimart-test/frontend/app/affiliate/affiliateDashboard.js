import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

const AffiliateDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLinkModalVisible, setLinkModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Sample data for demonstration
  const statsData = {
    totalCommissions: 1245,
    pendingCommissions: 320,
    clicks: 2456,
    conversions: 128,
    conversionRate: 5.2,
    topProducts: 5
  };

  const commissionHistory = [
    { id: 1, product: 'Handmade Basket', sale: 45, commission: 13.5, date: '2023-11-15', status: 'Paid' },
    { id: 2, product: 'Organic Honey', sale: 32, commission: 9.6, date: '2023-11-12', status: 'Paid' },
    { id: 3, product: 'Artisan Pottery', sale: 28, commission: 8.4, date: '2023-11-10', status: 'Pending' },
    { id: 4, product: 'Handwoven Scarf', sale: 38, commission: 11.4, date: '2023-11-05', status: 'Paid' },
    { id: 5, product: 'Village Spices', sale: 41, commission: 12.3, date: '2023-11-02', status: 'Pending' },
  ];

  const topProducts = [
    { 
      id: 1, 
      name: 'Handmade Basket', 
      category: 'Handicrafts', 
      price: 25, 
      commission: 30, 
      clicks: 245, 
      conversions: 32,
      image: 'https://placehold.co/100x100/e2e8f0/1e293b?text=Basket'
    },
    { 
      id: 2, 
      name: 'Organic Honey', 
      category: 'Food', 
      price: 15, 
      commission: 25, 
      clicks: 198, 
      conversions: 28,
      image: 'https://placehold.co/100x100/e2e8f0/1e293b?text=Honey'
    },
    { 
      id: 3, 
      name: 'Artisan Pottery', 
      category: 'Handicrafts', 
      price: 35, 
      commission: 30, 
      clicks: 176, 
      conversions: 24,
      image: 'https://placehold.co/100x100/e2e8f0/1e293b?text=Pottery'
    },
    { 
      id: 4, 
      name: 'Handwoven Scarf', 
      category: 'Textiles', 
      price: 28, 
      commission: 25, 
      clicks: 162, 
      conversions: 22,
      image: 'https://placehold.co/100x100/e2e8f0/1e293b?text=Scarf'
    },
    { 
      id: 5, 
      name: 'Village Spices', 
      category: 'Food', 
      price: 12, 
      commission: 30, 
      clicks: 154, 
      conversions: 20,
      image: 'https://placehold.co/100x100/e2e8f0/1e293b?text=Spices'
    },
  ];

  const renderDashboard = () => (
    <View className="p-4">
      <Text className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Affiliate Dashboard</Text>
      
      {/* Stats Cards */}
      <View className="flex-row flex-wrap justify-between mb-6">
        <View className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm w-[48%] mb-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-gray-600 dark:text-gray-300">Total Commissions</Text>
            <FontAwesome name="money" size={24} color="#4F46E5" />
          </View>
          <Text className="text-2xl font-bold mt-2 text-gray-800 dark:text-white">${statsData.totalCommissions}</Text>
          <Text className="text-sm text-green-500 mt-1">+15% from last month</Text>
        </View>

        <View className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm w-[48%] mb-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-gray-600 dark:text-gray-300">Pending Commissions</Text>
            <Ionicons name="time" size={24} color="#F59E0B" />
          </View>
          <Text className="text-2xl font-bold mt-2 text-gray-800 dark:text-white">${statsData.pendingCommissions}</Text>
          <Text className="text-sm text-blue-500 mt-1">Next payout: Nov 30</Text>
        </View>

        <View className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm w-[48%]">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-gray-600 dark:text-gray-300">Clicks</Text>
            <Ionicons name="tap" size={24} color="#10B981" />
          </View>
          <Text className="text-2xl font-bold mt-2 text-gray-800 dark:text-white">{statsData.clicks}</Text>
          <Text className="text-sm text-green-500 mt-1">+22% from last week</Text>
        </View>

        <View className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm w-[48%]">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-gray-600 dark:text-gray-300">Conversion Rate</Text>
            <Ionicons name="stats-chart" size={24} color="#8B5CF6" />
          </View>
          <Text className="text-2xl font-bold mt-2 text-gray-800 dark:text-white">{statsData.conversionRate}%</Text>
          <Text className="text-sm text-green-500 mt-1">Industry avg: 3.5%</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
        <Text className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Quick Actions</Text>
        <View className="flex-row flex-wrap justify-between">
          <TouchableOpacity 
            className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-lg w-[48%] mb-3 items-center"
            onPress={() => setActiveTab('products')}
          >
            <Ionicons name="link" size={24} color="#4F46E5" />
            <Text className="mt-2 text-indigo-600 dark:text-indigo-300 font-medium">Get Links</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-green-100 dark:bg-green-900 p-3 rounded-lg w-[48%] mb-3 items-center"
            onPress={() => setActiveTab('performance')}
          >
            <Ionicons name="stats-chart" size={24} color="#10B981" />
            <Text className="mt-2 text-green-600 dark:text-green-300 font-medium">Performance</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg w-[48%] items-center"
            onPress={() => Linking.openURL('https://socialmedia.com')}
          >
            <Ionicons name="share-social" size={24} color="#F59E0B" />
            <Text className="mt-2 text-yellow-600 dark:text-yellow-300 font-medium">Share</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg w-[48%] items-center"
            onPress={() => setActiveTab('resources')}
          >
            <Ionicons name="document" size={24} color="#8B5CF6" />
            <Text className="mt-2 text-purple-600 dark:text-purple-300 font-medium">Resources</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Commissions */}
      <View className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <Text className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Recent Commissions</Text>
        {commissionHistory.slice(0, 3).map(commission => (
          <View key={commission.id} className="flex-row justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
            <View className="flex-1">
              <Text className="font-medium text-gray-800 dark:text-white">{commission.product}</Text>
              <Text className="text-gray-500 dark:text-gray-400">Sale: ${commission.sale}</Text>
            </View>
            <View className="items-end">
              <Text className="font-bold text-green-500">${commission.commission}</Text>
              <Text className={`text-xs ${commission.status === 'Paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                {commission.status}
              </Text>
            </View>
          </View>
        ))}
        <TouchableOpacity 
          className="mt-4 items-center"
          onPress={() => setActiveTab('commissions')}
        >
          <Text className="text-indigo-600 dark:text-indigo-400 font-medium">View All Commissions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProducts = () => (
    <View className="p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-gray-800 dark:text-white">Promote Products</Text>
        <View className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <TextInput 
            placeholder="Search products..." 
            className="p-2 w-40 text-gray-800 dark:text-white"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>
      
      {/* Category Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
        <View className="flex-row space-x-2">
          {['All', 'Handicrafts', 'Food', 'Textiles', 'Agriculture', 'Featured'].map(category => (
            <TouchableOpacity 
              key={category}
              className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm"
            >
              <Text className="text-gray-800 dark:text-white">{category}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Products List */}
      {topProducts.map(product => (
        <View key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
          <View className="flex-row">
            <View className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg mr-4"></View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-800 dark:text-white">{product.name}</Text>
              <Text className="text-gray-500 dark:text-gray-400">{product.category}</Text>
              <View className="flex-row justify-between mt-2">
                <Text className="text-gray-800 dark:text-white font-bold">${product.price}</Text>
                <Text className="text-green-500 font-bold">{product.commission}% commission</Text>
              </View>
            </View>
          </View>
          
          <View className="flex-row justify-between mt-4">
            <View className="items-center">
              <Text className="text-gray-500 dark:text-gray-400 text-xs">Clicks</Text>
              <Text className="text-gray-800 dark:text-white font-bold">{product.clicks}</Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-500 dark:text-gray-400 text-xs">Conversions</Text>
              <Text className="text-gray-800 dark:text-white font-bold">{product.conversions}</Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-500 dark:text-gray-400 text-xs">Conv. Rate</Text>
              <Text className="text-gray-800 dark:text-white font-bold">
                {((product.conversions / product.clicks) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            className="bg-indigo-600 p-3 rounded-lg mt-4 items-center flex-row justify-center"
            onPress={() => {
              setSelectedProduct(product);
              setLinkModalVisible(true);
            }}
          >
            <Ionicons name="link" size={20} color="white" />
            <Text className="text-white font-bold ml-2">Get Affiliate Link</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderPerformance = () => (
    <View className="p-4">
      <Text className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Performance Analytics</Text>
      
      <View className="flex-row mb-6">
        <TouchableOpacity className="flex-1 bg-indigo-600 p-3 rounded-lg mr-2 items-center">
          <Text className="text-white font-bold">7 Days</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-gray-200 dark:bg-gray-700 p-3 rounded-lg mx-2 items-center">
          <Text className="text-gray-800 dark:text-white font-bold">30 Days</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-gray-200 dark:bg-gray-700 p-3 rounded-lg ml-2 items-center">
          <Text className="text-gray-800 dark:text-white font-bold">90 Days</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      <View className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <Text className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Overview</Text>
        <View className="flex-row justify-between mb-4">
          <View className="items-center">
            <Text className="text-2xl font-bold text-gray-800 dark:text-white">{statsData.clicks}</Text>
            <Text className="text-gray-500 dark:text-gray-400">Clicks</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-gray-800 dark:text-white">{statsData.conversions}</Text>
            <Text className="text-gray-500 dark:text-gray-400">Conversions</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-gray-800 dark:text-white">${statsData.totalCommissions}</Text>
            <Text className="text-gray-500 dark:text-gray-400">Commissions</Text>
          </View>
        </View>
        
        <View className="h-40 bg-gray-100 dark:bg-gray-700 rounded-lg items-center justify-center mb-4">
          <Text className="text-gray-500 dark:text-gray-400">Performance chart would be displayed here</Text>
        </View>
      </View>

      {/* Top Performing Products */}
      <View className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <Text className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Top Performing Products</Text>
        {topProducts.slice(0, 3).map((product, index) => (
          <View key={product.id} className="flex-row justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center">
              <Text className="text-lg font-bold text-gray-400 mr-3">{index + 1}</Text>
              <View>
                <Text className="font-medium text-gray-800 dark:text-white">{product.name}</Text>
                <Text className="text-gray-500 dark:text-gray-400">{product.clicks} clicks</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="font-bold text-green-500">{product.conversions} sales</Text>
              <Text className="text-gray-500 dark:text-gray-400">
                {((product.conversions / product.clicks) * 100).toFixed(1)}% rate
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderLinkModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isLinkModalVisible}
      onRequestClose={() => setLinkModalVisible(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50 p-4">
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-800 dark:text-white">Affiliate Link</Text>
            <TouchableOpacity onPress={() => setLinkModalVisible(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          {selectedProduct && (
            <>
              <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{selectedProduct.name}</Text>
              <Text className="text-gray-500 dark:text-gray-400 mb-4">Earn {selectedProduct.commission}% commission on each sale</Text>
              
              <View className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6">
                <Text className="text-gray-800 dark:text-white font-mono">
                  https://village-marketplace.com/affiliate?ref=12345&product={selectedProduct.id}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <TouchableOpacity 
                  className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg flex-1 mr-2 items-center"
                  onPress={() => {
                    // Copy to clipboard functionality would go here
                    alert('Link copied to clipboard!');
                  }}
                >
                  <Text className="text-gray-800 dark:text-white font-bold">Copy Link</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="bg-indigo-600 p-3 rounded-lg flex-1 ml-2 items-center"
                  onPress={() => {
                    Linking.openURL(`https://socialmedia.com/share?url=https://village-marketplace.com/affiliate?ref=12345&product=${selectedProduct.id}`);
                  }}
                >
                  <Text className="text-white font-bold">Share</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return renderDashboard();
      case 'products': return renderProducts();
      case 'performance': return renderPerformance();
      case 'commissions': return <View className="p-4"><Text className="text-2xl font-bold text-gray-800 dark:text-white">Commissions</Text></View>;
      case 'resources': return <View className="p-4"><Text className="text-2xl font-bold text-gray-800 dark:text-white">Resources</Text></View>;
      default: return renderDashboard();
    }
  };

  return (
    <View className="flex-1 bg-gray-100 dark:bg-gray-900">
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 pt-10 pb-4 px-4 shadow-sm">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Affiliate Program</Text>
          <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)}>
            <Ionicons name={isDarkMode ? "sunny" : "moon"} size={24} color={isDarkMode ? "#F59E0B" : "#4F46E5"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1">
        {renderContent()}
      </ScrollView>

      {/* Link Modal */}
      {renderLinkModal()}

      {/* Bottom Navigation */}
      <View className="bg-white dark:bg-gray-800 flex-row justify-between items-center px-6 py-3 border-t border-gray-200 dark:border-gray-700">
        <TouchableOpacity 
          className={`items-center py-2 ${activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
          onPress={() => setActiveTab('dashboard')}
        >
          <Ionicons name="grid" size={24} color={activeTab === 'dashboard' ? '#4F46E5' : '#9CA3AF'} />
          <Text className={`text-xs mt-1 ${activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className={`items-center py-2 ${activeTab === 'products' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
          onPress={() => setActiveTab('products')}
        >
          <Ionicons name="bag" size={24} color={activeTab === 'products' ? '#4F46E5' : '#9CA3AF'} />
          <Text className={`text-xs mt-1 ${activeTab === 'products' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>Products</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className={`items-center py-2 ${activeTab === 'performance' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
          onPress={() => setActiveTab('performance')}
        >
          <Ionicons name="stats-chart" size={24} color={activeTab === 'performance' ? '#4F46E5' : '#9CA3AF'} />
          <Text className={`text-xs mt-1 ${activeTab === 'performance' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>Performance</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className={`items-center py-2 ${activeTab === 'commissions' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
          onPress={() => setActiveTab('commissions')}
        >
          <FontAwesome name="money" size={24} color={activeTab === 'commissions' ? '#4F46E5' : '#9CA3AF'} />
          <Text className={`text-xs mt-1 ${activeTab === 'commissions' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>Commissions</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className={`items-center py-2 ${activeTab === 'resources' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
          onPress={() => setActiveTab('resources')}
        >
          <Ionicons name="document" size={24} color={activeTab === 'resources' ? '#4F46E5' : '#9CA3AF'} />
          <Text className={`text-xs mt-1 ${activeTab === 'resources' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>Resources</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AffiliateDashboard;