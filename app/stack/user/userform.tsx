import React, { useEffect, useState } from "react";
import { AntDesign, MaterialCommunityIcons, Feather, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDB } from "@/context/DBContext";
import { User } from "@/types/user";
import { pickAndSaveImage } from "@/services/imageService";
import ConfirmModal from "@/components/ConfirmModal";
import { CameraView, useCameraPermissions } from "expo-camera";
import { appAlert } from "@/services/alertService";

export default function AddUser() {
  const router = useRouter();
  const { insertUser, updateUser, deleteUser } = useDB();

  const { user, mode } = useLocalSearchParams() as {
    user?: string;
    mode: "insert" | "update";
  };

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [upiId, setUpiId] = useState<string>("");
  const [id, setId] = useState<number | undefined>(undefined);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    if (mode === "update" && user) {
      try {
        const parsedUser: User = JSON.parse(user);
        setId(parsedUser.id);
        setName(parsedUser.name);
        setSelectedImage(parsedUser.pfp ?? null);
        setUpiId(parsedUser.upi_id ?? "");
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
  }, [mode, user]);

  const handlePickImage = async () => {
    try {
      const uri = await pickAndSaveImage();
      if (uri) setSelectedImage(uri);
    } catch (error: any) {
      alert(error?.message || "An error occurred while picking the image");
    }
  };

  const handleInsert = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const res = await insertUser(trimmed, selectedImage, upiId.trim() || null);
    if (res) router.back();
  };

  const handleUpdate = async () => {
    if (!id) return;
    const res = await updateUser(id, name, selectedImage, upiId.trim() || null);
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

  const handleOpenScanner = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        appAlert("Permission required", "Camera access is needed to scan QR codes");
        return;
      }
    }
    setScannerVisible(true);
  };

  const handleBarCodeScanned = (result: { data: string }) => {
    setScannerVisible(false);
    const raw = result.data;
    // Parse UPI ID from upi:// deep link or raw string
    try {
      if (raw.startsWith("upi://")) {
        const url = new URL(raw);
        const pa = url.searchParams.get("pa");
        if (pa) {
          setUpiId(pa);
          return;
        }
      }
    } catch {}
    // Fallback: use raw value if it looks like a UPI ID (contains @)
    if (raw.includes("@")) {
      setUpiId(raw);
    } else {
      appAlert("Invalid QR", "Could not find a UPI ID in this QR code");
    }
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

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Section */}
          <View className="items-center gap-4 w-full py-16">
            <View className="bg-[#121317] h-60 w-60 rounded-full overflow-hidden">
              <TouchableOpacity
                onPress={handlePickImage}
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

            <View className="gap-2 w-full px-8">
              <Text className="text-white font-semibold px-2">UPI ID</Text>
              <View className="flex-row items-center gap-2">
                <TextInput
                  className="flex-1 p-4 bg-[#121317] text-white rounded-lg"
                  placeholder="name@upi"
                  placeholderTextColor="gray"
                  value={upiId}
                  onChangeText={setUpiId}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TouchableOpacity
                  className="bg-[#121317] p-4 rounded-lg"
                  onPress={handleOpenScanner}
                >
                  <MaterialIcons name="qr-code-scanner" size={24} color="white" />
                </TouchableOpacity>
              </View>
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
        </ScrollView>
      </KeyboardAvoidingView>

      {/* QR Scanner Modal */}
      <Modal visible={scannerVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
          <View className="w-full h-16 bg-[#121317] flex-row items-center px-6">
            <TouchableOpacity
              onPress={() => setScannerVisible(false)}
              className="flex-row items-center gap-2"
            >
              <AntDesign name="left" size={24} color="white" />
              <Text className="text-white font-semibold text-lg">Cancel</Text>
            </TouchableOpacity>
          </View>
          <CameraView
            style={{ flex: 1 }}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={handleBarCodeScanned}
          />
        </SafeAreaView>
      </Modal>
      
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
