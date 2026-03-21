import React from "react";
import { Alert, Modal, Text, TouchableOpacity, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";

interface QrScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanned: (upiId: string) => void;
}

export default function QrScannerModal({ visible, onClose, onScanned }: QrScannerModalProps) {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const handleOpen = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert("Permission required", "Camera access is needed to scan QR codes");
        onClose();
      }
    }
  };

  const handleBarCodeScanned = (result: { data: string }) => {
    const raw = result.data;
    try {
      if (raw.startsWith("upi://")) {
        const url = new URL(raw);
        const pa = url.searchParams.get("pa");
        if (pa) {
          onScanned(pa);
          return;
        }
      }
    } catch {}
    if (raw.includes("@")) {
      onScanned(raw);
    } else {
      Alert.alert("Invalid QR", "Could not find a UPI ID in this QR code");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} onShow={handleOpen}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        <View className="w-full h-16 bg-[#121317] flex-row items-center px-6">
          <TouchableOpacity
            onPress={onClose}
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
  );
}
