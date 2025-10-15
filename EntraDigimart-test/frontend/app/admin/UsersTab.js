import {
  Edit,
  Eye,
  Filter,
  Plus,
  Search,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const UsersTab = () => {
  return (
    <ScrollView
      className="px-4 pt-4 pb-6"
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View className="p-6 mb-5 bg-white shadow-md rounded-2xl">
        <View className="pb-4 mb-5 border-b border-gray-100">
          <Text className="mb-1 text-2xl font-bold text-gray-900">
            User Management
          </Text>
          <Text className="text-base leading-6 text-gray-500">
            Manage and monitor all registered users
          </Text>
        </View>

        {/* Quick Stats Grid */}
        <View className="flex-row justify-between space-x-4">
          <View className="items-center flex-1 p-4 border border-gray-200 bg-gray-50 rounded-xl">
            <View className="items-center justify-center w-12 h-12 mb-3 bg-white rounded-full shadow-sm">
              <Users size={24} color="#FF8C00" />
            </View>
            <Text className="mb-1 text-lg font-bold text-gray-900">5,432</Text>
            <Text className="text-xs font-medium text-center text-gray-500">
              Total Users
            </Text>
          </View>

          <View className="items-center flex-1 p-4 border border-gray-200 bg-gray-50 rounded-xl">
            <View className="items-center justify-center w-12 h-12 mb-3 bg-white rounded-full shadow-sm">
              <UserCheck size={24} color="#10B981" />
            </View>
            <Text className="mb-1 text-lg font-bold text-gray-900">3,765</Text>
            <Text className="text-xs font-medium text-center text-gray-500">
              Active Users
            </Text>
          </View>

          <View className="items-center flex-1 p-4 border border-gray-200 bg-gray-50 rounded-xl">
            <View className="items-center justify-center w-12 h-12 mb-3 bg-white rounded-full shadow-sm">
              <UserPlus size={24} color="#3B82F6" />
            </View>
            <Text className="mb-1 text-lg font-bold text-gray-900">47</Text>
            <Text className="text-xs font-medium text-center text-gray-500">
              New Today
            </Text>
          </View>
        </View>
      </View>

      {/* Control Panel */}
      <View className="p-5 mb-5 bg-white shadow-md rounded-2xl">
        <Text className="mb-4 text-lg font-bold text-gray-900">
          User Controls
        </Text>

        {/* Action Buttons Row */}
        <View className="flex-row mb-4 space-x-3">
          <TouchableOpacity className="flex-row items-center justify-center flex-1 py-3 bg-orange-500 shadow-md rounded-xl">
            <Plus size={18} color="#FFF" />
            <Text className="ml-2 text-base font-bold text-white">
              Add New User
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-center flex-1 py-3 border border-gray-200 bg-gray-50 rounded-xl">
            <Filter size={18} color="#6B7280" />
            <Text className="ml-2 text-sm font-semibold text-gray-600">
              Filter
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center px-4 py-3 bg-white border border-gray-100 shadow-sm rounded-xl">
          <Search size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-800"
            placeholder="Search users by name, email, or role..."
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* User List */}
      <View className="p-5 mb-4 bg-white shadow-md rounded-2xl">
        <View className="flex-row items-center justify-between pb-3 mb-5 border-b border-gray-100">
          <Text className="text-xl font-bold text-gray-900">All Users</Text>
          <View className="bg-gray-100 px-3 py-1.5 rounded-full">
            <Text className="text-xs font-medium text-gray-500">
              Showing 5 of 5,432 users
            </Text>
          </View>
        </View>

        {[
          { name: "John Smith", email: "john.smith@email.com", role: "Administrator" },
          { name: "Sarah Johnson", email: "sarah.j@email.com", role: "Manager" },
          { name: "Mike Davis", email: "mike.davis@email.com", role: "Support" },
          { name: "Emily Chen", email: "emily.chen@email.com", role: "User" },
          { name: "Robert Wilson", email: "robert.w@email.com", role: "Manager" },
        ].map((user, i) => (
          <View
            key={i}
            className="flex-row items-center justify-between py-3 border-b border-gray-100"
          >
            <View className="flex-row items-center flex-1 space-x-3">
              <View className="items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                <User size={24} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900 mb-0.5">
                  {user.name}
                </Text>
                <Text className="text-sm text-gray-600 mb-0.5">
                  {user.email}
                </Text>
                <Text className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded self-start">
                  {user.role}
                </Text>
              </View>
            </View>

            <View className="flex-row space-x-2">
              <TouchableOpacity className="p-2 rounded-lg bg-gray-50">
                <Eye size={18} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity className="p-2 rounded-lg bg-gray-50">
                <Edit size={18} color="#FF8C00" />
              </TouchableOpacity>
              <TouchableOpacity className="p-2 rounded-lg bg-gray-50">
                <Trash2 size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* User Statistics */}
      <View className="p-5 bg-white shadow-md rounded-2xl">
        <Text className="mb-4 text-lg font-bold text-gray-900">
          User Statistics
        </Text>

        {[
          ["Total Users:", "2,547"],
          ["Active Today:", "1,234"],
          ["New This Month:", "432"],
          ["Administrators:", "12"],
        ].map(([label, value], i) => (
          <View
            key={i}
            className="flex-row justify-between py-2 border-b border-gray-100"
          >
            <Text className="text-base font-medium text-gray-700">{label}</Text>
            <Text className="text-base font-bold text-gray-900">{value}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default UsersTab;
