import React, { useState } from "react";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useDB } from "@/hooks/useDB";

export default function adduser() {
  const router = useRouter();
  const { insertUser } = useDB();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [name, setName] = useState<string>("");

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    const res = await insertUser(trimmed, selectedImage);
    if (res) router.back();
  };

  return (
    <SafeAreaView className="bg-black flex-1">
      {/* Header */}
      <View className="w-full h-16 bg-[#121317] flex-row items-center px-6 justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-2"
        >
          <AntDesign name="left" size={24} color="white" />
          <Text className="text-white font-semibold text-lg">Back</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 bg-black items-center justify-between">
        {/* Profile Section */}
        <View className="flex-1 items-center gap-4 w-full py-16">
          <View className="bg-[#121317] h-60 w-60 rounded-full overflow-hidden">
            <TouchableOpacity
              onPress={pickImage}
              onLongPress={() => setSelectedImage(null)}
              className="w-full h-full justify-center items-center"
            >
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
                  className="w-full h-full"
                />
              ) : (
                <MaterialCommunityIcons
                  name="camera-plus"
                  size={32}
                  color="#aaa"
                />
              )}
            </TouchableOpacity>
          </View>

          <View className="gap-2 w-full px-8">
            <Text className="text-white font-semibold px-2">Name</Text>
            <TextInput
              className="w-full p-4 bg-[#121317] text-white rounded-lg"
              placeholder="Enter name"
              placeholderTextColor="gray"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className="w-full p-4 bg-[#121317] rounded-lg"
          onPress={handleSave}
          disabled={!name}
        >
          <Text
            className="text-white text-xl text-center font-semibold"
            style={{ color: name.trim() ? "white" : "#aaa" }}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
