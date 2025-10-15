import React, { useState } from "react";
import { View, Text, ScrollView, Image, Pressable, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Search, Users, MessageCircle, Upload, FileText } from "lucide-react-native";
import * as DocumentPicker from 'expo-document-picker';

export default function InvestorConnection() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("explore"); // explore | invitations | connections
  const [search, setSearch] = useState("");

  const [investors, setInvestors] = useState([
    { id: 1, name: "Anne", role: "Angel Investor", img: "https://randomuser.me/api/portraits/women/45.jpg", status: "none" },
    { id: 2, name: "Lissa", role: "Venture Capitalist", img: "https://randomuser.me/api/portraits/women/46.jpg", status: "pending" },
    { id: 3, name: "Mark", role: "Seed Investor", img: "https://randomuser.me/api/portraits/men/35.jpg", status: "accepted" },
  ]);

  const requestInvestor = (id) => {
    setInvestors(prev =>
      prev.map(i => i.id === id ? { ...i, status: "pending" } : i)
    );
    setActiveTab("invitations");
  };

  const acceptInvestor = (id) => {
    setInvestors(prev =>
      prev.map(i => i.id === id ? { ...i, status: "accepted" } : i)
    );
  };

  const rejectInvestor = (id) => {
    setInvestors(prev =>
      prev.map(i => i.id === id ? { ...i, status: "none" } : i)
    );
  };

  const openChat = (investorName) => {
    Alert.alert(`Chat with ${investorName}`);
    // You can navigate to your ChatScreen here
    // router.push(`/chat/${investorName}`)
  };

  const uploadProposal = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });
    if (result.type === "success") {
      Alert.alert("PDF Uploaded", result.name);
    }
  };

  const viewAgreement = () => {
    Alert.alert("View Agreement pressed");
    // You can implement PDF viewer here
  };

  const filteredInvestors = investors.filter(
    i =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-orange-400">
      {/* Header */}
      <View className="flex-row items-center p-4">
        <Pressable onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={28} color="white" />
        </Pressable>
        <Text className="text-xl font-extrabold text-white">Investor Connections</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row justify-around p-2 bg-white rounded-t-2xl">
        {[
          { key: "explore", label: "Explore", icon: Search },
          { key: "invitations", label: "Invitations", icon: Users },
          { key: "connections", label: "Connections", icon: Users }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <Pressable
              key={tab.key}
              className={`flex-1 flex-row items-center justify-center p-3 mx-1 rounded-xl ${
                activeTab === tab.key ? "bg-orange-400" : "bg-gray-200"
              }`}
              onPress={() => setActiveTab(tab.key)}
            >
              <Icon size={18} color={activeTab === tab.key ? "white" : "black"} className="mr-1" />
              <Text className={`font-semibold ${activeTab === tab.key ? "text-white" : "text-gray-700"}`}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3 bg-gray-100">
        <View className="flex-row items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm">
          <Search size={18} color="gray" className="mr-2" />
          <TextInput
            placeholder="Search by role or name"
            value={search}
            onChangeText={setSearch}
            className="flex-1 text-base"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 p-4 bg-gray-100">

        {/* === Explore Tab === */}
        {activeTab === "explore" &&
          filteredInvestors.filter(i => i.status === "none").map((i) => (
            <View key={i.id} className="flex-row items-center p-3 mb-3 bg-white rounded-lg shadow">
              <Image source={{ uri: i.img }} className="w-12 h-12 mr-3 rounded-full" />
              <View className="flex-1">
                <Text className="font-semibold">{i.name}</Text>
                <Text className="text-gray-500">{i.role}</Text>
              </View>
              <Pressable
                onPress={() => requestInvestor(i.id)}
                className="px-3 py-2 bg-blue-500 rounded-lg"
              >
                <Text className="text-white">Request</Text>
              </Pressable>
            </View>
          ))}

        {/* === Invitations Tab === */}
        {activeTab === "invitations" &&
          filteredInvestors.filter(i => i.status === "pending").map((i) => (
            <View key={i.id} className="flex-row items-center p-3 mb-3 bg-white rounded-lg shadow">
              <Image source={{ uri: i.img }} className="w-12 h-12 mr-3 rounded-full" />
              <View className="flex-1">
                <Text className="font-semibold">{i.name}</Text>
                <Text className="text-gray-500">{i.role}</Text>
              </View>
              <View className="flex-row space-x-2">
                <Pressable onPress={() => acceptInvestor(i.id)} className="px-4 py-2 bg-blue-500 rounded-lg">
                  <Text className="text-white">Accept</Text>
                </Pressable>
                <Pressable onPress={() => rejectInvestor(i.id)} className="px-4 py-2 bg-blue-200 rounded-lg">
                  <Text className="text-blue-800">Reject</Text>
                </Pressable>
              </View>
            </View>
          ))}

        {/* === Connections Tab === */}
        {activeTab === "connections" &&
          filteredInvestors.filter(i => i.status === "accepted").map((i) => (
            <View key={i.id} className="p-4 mb-3 bg-white shadow rounded-xl">
              <View className="flex-row items-center mb-3">
                <Image source={{ uri: i.img }} className="w-12 h-12 mr-3 rounded-full" />
                <View>
                  <Text className="font-semibold">{i.name}</Text>
                  <Text className="text-gray-500">{i.role}</Text>
                </View>
              </View>

              {/* Actions */}
              <View className="flex-row mb-3 space-x-2">
                <Pressable onPress={() => openChat(i.name)} className="flex-row items-center justify-center flex-1 px-3 py-2 bg-yellow-400 rounded-lg">
                  <MessageCircle size={18} color="white" className="mr-1" />
                  <Text className="font-semibold text-white">Chat</Text>
                </Pressable>
                <Pressable onPress={uploadProposal} className="flex-row items-center justify-center flex-1 px-3 py-2 bg-orange-400 rounded-lg">
                  <Upload size={18} color="white" className="mr-1" />
                  <Text className="font-semibold text-white">Send Proposal</Text>
                </Pressable>
                <Pressable onPress={viewAgreement} className="flex-row items-center justify-center flex-1 px-3 py-2 bg-green-500 rounded-lg">
                  <FileText size={18} color="white" className="mr-1" />
                  <Text className="font-semibold text-white">View Agreement</Text>
                </Pressable>
              </View>
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}
