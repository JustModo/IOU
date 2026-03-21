import React from "react";
import { Alert, Linking, Modal, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

interface UpiQrModalProps {
  visible: boolean;
  name: string;
  upiId: string;
  onClose: () => void;
}

export default function UpiQrModal({ visible, name, upiId, onClose }: UpiQrModalProps) {
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}`;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center bg-black/70 px-4">
        <View className="bg-[#121317] p-6 rounded-2xl w-full max-w-sm border border-gray-800 items-center">
          <View className="bg-white p-4 rounded-xl mb-4">
            <QRCode value={upiUrl} size={200} />
          </View>
          <Text className="text-gray-400 text-base mb-4">{upiId}</Text>
          <View className="flex-row gap-3 w-full">
            <TouchableOpacity
              className="flex-1 py-3 bg-[#1e1f23] rounded-xl items-center"
              onPress={onClose}
            >
              <Text className="text-white font-semibold">Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 bg-blue-600 rounded-xl items-center"
              onPress={() => {
                Linking.openURL(upiUrl).catch(() =>
                  Alert.alert("Error", "No UPI app found on this device")
                );
              }}
            >
              <Text className="text-white font-semibold">Pay Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
