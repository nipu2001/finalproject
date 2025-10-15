import {
  BarChart3,
  Mail,
  Settings,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const AddRoleTab = () => {
  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Create New Role */}
      <View className="p-4 mb-4 bg-white shadow-sm rounded-xl">
        <Text className="mb-4 text-lg font-bold text-gray-900">Create New Role</Text>

        <View className="mb-4">
          <Text className="mb-1 text-sm font-semibold text-gray-700">Role Name</Text>
          <TextInput
            className="p-3 text-base text-gray-900 bg-white border border-gray-300 rounded-lg"
            placeholder="Enter role name..."
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View className="mb-4">
          <Text className="mb-1 text-sm font-semibold text-gray-700">Description</Text>
          <TextInput
            className="h-20 p-3 text-base text-gray-900 bg-white border border-gray-300 rounded-lg text-top"
            placeholder="Describe the role responsibilities..."
            placeholderTextColor="#9CA3AF"
            multiline
          />
        </View>
      </View>

      {/* Permissions */}
      <View className="p-4 mb-4 bg-white shadow-sm rounded-xl">
        <Text className="mb-4 text-lg font-bold text-gray-900">Permissions</Text>

        {/* User Management */}
        <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
          <View className="flex-row items-center space-x-2">
            <Users size={18} color="#6B7280" />
            <Text className="text-base font-medium text-gray-800">User Management</Text>
          </View>
          <TouchableOpacity className="items-center justify-center w-6 h-6 bg-orange-500 border border-orange-500 rounded">
            <Text className="text-xs font-bold text-white">✓</Text>
          </TouchableOpacity>
        </View>

        {/* View Analytics */}
        <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
          <View className="flex-row items-center space-x-2">
            <BarChart3 size={18} color="#6B7280" />
            <Text className="text-base font-medium text-gray-800">View Analytics</Text>
          </View>
          <TouchableOpacity className="items-center justify-center w-6 h-6 bg-white border-2 border-gray-300 rounded" />
        </View>

        {/* System Settings */}
        <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
          <View className="flex-row items-center space-x-2">
            <Settings size={18} color="#6B7280" />
            <Text className="text-base font-medium text-gray-800">System Settings</Text>
          </View>
          <TouchableOpacity className="items-center justify-center w-6 h-6 bg-orange-500 border border-orange-500 rounded">
            <Text className="text-xs font-bold text-white">✓</Text>
          </TouchableOpacity>
        </View>

        {/* Send Messages */}
        <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
          <View className="flex-row items-center space-x-2">
            <Mail size={18} color="#6B7280" />
            <Text className="text-base font-medium text-gray-800">Send Messages</Text>
          </View>
          <TouchableOpacity className="items-center justify-center w-6 h-6 bg-white border-2 border-gray-300 rounded" />
        </View>
      </View>

      {/* Existing Roles */}
      <View className="p-4 mb-4 bg-white shadow-sm rounded-xl">
        <Text className="mb-4 text-lg font-bold text-gray-900">Existing Roles</Text>

        {/* Role Cards */}
        {[
          { name: 'Administrator', users: '5 users', desc: 'Full system access and management capabilities' },
          { name: 'Manager', users: '12 users', desc: 'User management and analytics access' },
          { name: 'Support', users: '8 users', desc: 'Customer support and messaging access' },
        ].map((role, index) => (
          <View key={index} className="p-4 mb-3 bg-white border border-gray-200 shadow-sm rounded-xl">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-bold text-gray-900">{role.name}</Text>
              <Text className="px-2 py-1 text-sm text-gray-500 bg-gray-100 rounded-lg">{role.users}</Text>
            </View>
            <Text className="mb-3 text-sm text-gray-500">{role.desc}</Text>

            <View className="flex-row space-x-3">
              <TouchableOpacity className="flex-row items-center px-3 py-2 space-x-1 border border-orange-300 rounded-lg bg-orange-50">
                <Settings size={16} color="#FF8C00" />
                <Text className="text-sm font-semibold text-orange-500">Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center px-3 py-2 space-x-1 border border-red-300 rounded-lg bg-red-50">
                <UserX size={16} color="#EF4444" />
                <Text className="text-sm font-semibold text-red-500">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Create Role Button */}
      <TouchableOpacity className="flex-row items-center justify-center p-4 mt-5 mb-5 space-x-2 bg-orange-500 shadow-md rounded-xl">
        <UserPlus size={20} color="#FFFFFF" />
        <Text className="text-base font-bold text-white">Create Role</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddRoleTab;
