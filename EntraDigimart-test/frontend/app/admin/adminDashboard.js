import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { DollarSign, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const OverviewTab = () => {
  const router = useRouter();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24 }}
    >
      {/* Navigation Tabs */}
      <View className="flex-row justify-between mb-6">
        <TouchableOpacity onPress={() => router.push('/admin/adminDashboard')}>
          <Text className="font-semibold text-blue-600">Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/admin/UsersTab')}>
          <Text className="font-semibold text-gray-700">Users</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/admin/SettingsTab')}>
          <Text className="font-semibold text-gray-700">Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/admin/AddRoleTab')}>
          <Text className="font-semibold text-gray-700">Add Role</Text>
        </TouchableOpacity>
      </View>

      {/* Statistics Cards */}
      <View className="mb-6 space-y-3">
        <View className="flex-row items-center p-4 bg-gray-200 rounded-lg">
          <Users size={24} color="#666" />
          <View className="flex-row justify-between flex-1 ml-4">
            <Text className="text-base font-medium text-gray-700">Total Users</Text>
            <Text className="text-lg font-bold text-gray-900">5,432</Text>
          </View>
        </View>

        <View className="flex-row items-center p-4 bg-gray-200 rounded-lg">
          <Users size={24} color="#666" />
          <View className="flex-row justify-between flex-1 ml-4">
            <Text className="text-base font-medium text-gray-700">Active Users</Text>
            <Text className="text-lg font-bold text-gray-900">3,765</Text>
          </View>
        </View>

        <View className="flex-row items-center p-4 bg-gray-200 rounded-lg">
          <DollarSign size={24} color="#666" />
          <View className="flex-row justify-between flex-1 ml-4">
            <Text className="text-base font-medium text-gray-700">Revenue</Text>
            <Text className="text-lg font-bold text-gray-900">Rs. 284,750</Text>
          </View>
        </View>
      </View>

      {/* User Distribution */}
      <View className="p-4 mb-4 bg-white rounded-xl">
        <Text className="mb-4 text-lg font-bold text-gray-900">User Distribution</Text>

        {[
          { label: 'Customers', value: '3,140', color: '#3B82F6' },
          { label: 'Entrepreneurs', value: '2,185', color: '#10B981' },
          { label: 'Investors', value: '75', color: '#8B5CF6' },
          { label: 'Partners', value: '32', color: '#F59E0B' },
          { label: 'Affiliates', value: '1,543', color: '#EF4444' },
        ].map((item, index) => (
          <View
            key={index}
            className="flex-row items-center justify-between py-3 border-b border-gray-100"
          >
            <View className="flex-row items-center space-x-3">
              <View
                style={{ backgroundColor: item.color }}
                className="w-3 h-3 rounded-full"
              />
              <Text className="text-base font-medium text-gray-700">{item.label}</Text>
            </View>
            <Text className="font-semibold text-gray-500">{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Recent Activity */}
      <View className="p-4 bg-white rounded-xl">
        <Text className="mb-4 text-lg font-bold text-gray-900">Recent Activity</Text>

        {[
          { title: 'New user registration', time: '2 minutes ago' },
          { title: 'Payment processed', time: '15 minutes ago' },
          { title: 'User profile updated', time: '1 hour ago' },
        ].map((item, index) => (
          <View
            key={index}
            className="flex-row items-center py-3 space-x-3 border-b border-gray-100"
          >
            <View className="w-2 h-2 bg-orange-500 rounded-full" />
            <View>
              <Text className="font-medium text-gray-700">{item.title}</Text>
              <Text className="mt-1 text-sm text-gray-500">{item.time}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default OverviewTab;
