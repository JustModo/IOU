import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  return (
    <SafeAreaView className="bg-black flex-1">
      <View className="w-screen h-16 bg-[#121317] flex-row items-center px-4">
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="left" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View className="flex-1 p-8">
        <Text className="text-white text-xl">{id}</Text>
      </View>
    </SafeAreaView>
  );
}
