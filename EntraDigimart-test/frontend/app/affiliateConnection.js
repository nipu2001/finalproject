import { useState } from "react";
import { View, Text, ScrollView, Image, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Search, Users } from "lucide-react-native"; // ✅ icons

export default function AffiliateConnection() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("explore"); // explore | partnered
  const [search, setSearch] = useState("");

  // Dummy affiliates
  const [affiliates, setAffiliates] = useState([
    { id: 1, name: "Anne", role: "YouTube Vlogger", img: "https://randomuser.me/api/portraits/women/44.jpg", requested: false },
    { id: 2, name: "Sam", role: "Instagram Influencer", img: "https://randomuser.me/api/portraits/men/32.jpg", requested: false },
    { id: 3, name: "Lissa", role: "Blogger Affiliate", img: "https://randomuser.me/api/portraits/women/65.jpg", requested: true },
  ]);

  // Toggle request
  const toggleRequest = (id) => {
    setAffiliates((prev) =>
      prev.map((a) => (a.id === id ? { ...a, requested: !a.requested } : a))
    );
  };

  // Filter by search
  const filteredAffiliates = affiliates.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-orange-400">
      {/* Header */}
      <View className="flex-row items-center p-4">
        <Pressable onPress={() => router.push("/profile")} className="mr-3">
          <ChevronLeft size={28} color="white" />
        </Pressable>
        <Text className="text-xl font-extrabold text-white">Affiliate Connection</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row justify-around p-2 bg-white rounded-t-2xl">
        <Pressable
          className={`flex-1 flex-row items-center justify-center p-3 mx-1 rounded-xl ${
            activeTab === "explore" ? "bg-orange-400" : "bg-gray-200"
          }`}
          onPress={() => setActiveTab("explore")}
        >
          <Search size={18} color={activeTab === "explore" ? "white" : "black"} className="mr-1" />
          <Text
            className={`font-semibold ${
              activeTab === "explore" ? "text-white" : "text-gray-700"
            }`}
          >
            Explore Affiliates
          </Text>
        </Pressable>

        <Pressable
          className={`flex-1 flex-row items-center justify-center p-3 mx-1 rounded-xl ${
            activeTab === "partnered" ? "bg-orange-400" : "bg-gray-200"
          }`}
          onPress={() => setActiveTab("partnered")}
        >
          <Users size={18} color={activeTab === "partnered" ? "white" : "black"} className="mr-1" />
          <Text
            className={`font-semibold ${
              activeTab === "partnered" ? "text-white" : "text-gray-700"
            }`}
          >
            Partnered Affiliates
          </Text>
        </Pressable>
      </View>

      {/* Search Bar (common) */}
      <View className="px-4 py-3 bg-gray-100">
        <View className="flex-row items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm">
          <Search size={18} color="gray" className="mr-2" />
          <TextInput
            placeholder="Search by type (YouTube Vlogger, Instagram Influencer, Blogger...)"
            value={search}
            onChangeText={setSearch}
            className="flex-1 text-base"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 p-4 bg-gray-100">
        {/* === EXPLORE TAB === */}
        {activeTab === "explore" && (
          <>
            {filteredAffiliates.filter((a) => !a.requested).map((affiliate) => (
              <View
                key={affiliate.id}
                className="flex-row items-center p-3 mb-3 bg-white rounded-lg shadow"
              >
                <Image
                  source={{ uri: affiliate.img }}
                  className="w-12 h-12 mr-3 rounded-full"
                />
                <View className="flex-1">
                  <Text className="font-semibold">{affiliate.name}</Text>
                  <Text className="text-gray-500">{affiliate.role}</Text>
                </View>
                <Pressable
                  onPress={() => toggleRequest(affiliate.id)}
                  className={`px-3 py-1 rounded-lg ${
                    affiliate.requested ? "bg-blue-300" : "bg-blue-500"
                  }`}
                >
                  <Text className="text-white">
                    {affiliate.requested ? "Requested" : "Request"}
                  </Text>
                </Pressable>
              </View>
            ))}
          </>
        )}

        {/* === PARTNERED TAB === */}
        {activeTab === "partnered" && (
          <>
            {filteredAffiliates.filter((a) => a.requested).map((affiliate) => (
              <View key={affiliate.id} className="p-4 mb-3 bg-white shadow rounded-xl">
                <View className="flex-row items-center mb-3">
                  <Image
                    source={{ uri: affiliate.img }}
                    className="w-12 h-12 mr-3 rounded-full"
                  />
                  <View>
                    <Text className="font-semibold">{affiliate.name}</Text>
                    <Text className="text-gray-500">{affiliate.role}</Text>
                  </View>
                </View>

                {/* Actions */}
                <Pressable className="w-20 px-3 py-1 mb-3 bg-yellow-400 rounded-lg">
                  <Text className="font-semibold text-center">Chat</Text>
                </Pressable>

                {/* Content creation */}
                <Text className="text-sm text-gray-500">
                  Create Content & Share Link
                </Text>
                <TextInput
                  placeholder="Content Title"
                  className="px-3 py-2 mt-2 mb-2 bg-gray-100 rounded-lg"
                />
                <TextInput
                  placeholder="Description"
                  className="px-3 py-2 mb-2 bg-gray-100 rounded-lg"
                />
                <Pressable className="px-3 py-2 mb-2 bg-gray-200 rounded-lg">
                  <Text>Add Flyer</Text>
                </Pressable>

                {/* Buttons */}
                <View className="flex-row">
                  <Pressable className="px-3 py-2 mr-2 bg-orange-400 rounded-lg">
                    <Text className="text-white">Generate Link</Text>
                  </Pressable>
                  <Pressable className="px-3 py-2 bg-green-500 rounded-lg">
                    <Text className="text-white">View Agreement</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
