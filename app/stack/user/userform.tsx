import React, { useEffect, useState } from "react";
import { AntDesign, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useDB } from "@/context/DBContext";
import { User } from "@/types/user";
import * as FileSystem from "expo-file-system";
import ConfirmModal from "@/components/ConfirmModal";

export default function AddUser() {
  const router = useRouter();
  const { insertUser, updateUser, deleteUser } = useDB();

  const { user, mode } = useLocalSearchParams() as {
    user?: string;
    mode: "insert" | "update";
  };

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [id, setId] = useState<number | undefined>(undefined);
  
  // Confirm Modal State
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    if (mode === "update" && user) {
      try {
        const parsedUser: User = JSON.parse(user);
        setId(parsedUser.id);
        setName(parsedUser.name);
        setSelectedImage(parsedUser.pfp ?? null);
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
  }, [mode, user]);

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
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

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const sourceUri = result.assets[0].uri;

        const imagesDir = `${FileSystem.documentDirectory}images/`;
        await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });

        const newPath = `${imagesDir}${Date.now()}.jpg`;

        await FileSystem.moveAsync({
          from: sourceUri,
          to: newPath,
        });

        setSelectedImage(newPath);
      }
    } catch (error) {
      // console.error("Error picking image:", error);
      alert("An error occurred while picking the image");
    }
  };

  const handleInsert = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const res = await insertUser(trimmed, selectedImage);
    if (res) router.back();
  };

  const handleUpdate = async () => {
    if (!id) return;
    const res = await updateUser(id, name, selectedImage);
    if (res) router.back();
  };

  const handleDelete = () => {
    setConfirmVisible(true);
  };

  const confirmDelete = async () => {
      if (!id) return;
      const res = await deleteUser(id);
      if (res) {
          router.replace("/");
      }
      setConfirmVisible(false);
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
        {mode === "update" && (
             <TouchableOpacity onPress={handleDelete}>
                <Feather name="trash-2" size={24} color="red" />
             </TouchableOpacity>
        )}
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
                  key={selectedImage}
                  source={{ uri: selectedImage }}
                  className="w-full h-full"
                  onError={(e) => {}
                  }
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
          onPress={mode === "insert" ? handleInsert : handleUpdate}
          disabled={!name.trim()}
        >
          <Text
            className="text-white text-xl text-center font-semibold"
            style={{ color: name.trim() ? "white" : "#aaa" }}
          >
            {mode === "insert" ? "Save" : "Update"}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ConfirmModal
        visible={confirmVisible}
        title="Delete User"
        message="Are you sure you want to delete this user? Their data will be lost."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmVisible(false)}
        confirmText="Delete"
        variant="danger"
      />
    </SafeAreaView>
  );
}
