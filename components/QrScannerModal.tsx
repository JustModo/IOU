import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { appAlert } from "@/services/alertService";
import { COLORS } from "@/constants";

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
        appAlert("Permission required", "Camera access is needed to scan QR codes");
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
      appAlert("Invalid QR", "Could not find a UPI ID in this QR code");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} onShow={handleOpen}>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View className="w-full h-16 bg-card flex-row items-center px-6">
          <TouchableOpacity
            onPress={onClose}
            className="flex-row items-center gap-2"
          >
            <AntDesign name="left" size={24} color={COLORS.foreground} />
            <Text className="text-foreground font-semibold text-lg">Cancel</Text>
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
