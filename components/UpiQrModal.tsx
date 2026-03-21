import React from "react";
import { Linking, Modal, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { appAlert } from "@/services/alertService";

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
      <View className="flex-1 justify-center items-center bg-black/80 px-4">
        <View className="bg-black p-6 w-full max-w-sm border border-[#333] items-center">
          <Text className="text-white text-[17px] font-bold text-center mb-6 tracking-widest uppercase">{name}</Text>
          <View className="bg-white p-3 mb-4">
            <QRCode value={upiUrl} size={200} />
          </View>
          <Text className="text-gray-400 text-[15px] mb-8">{upiId}</Text>
          <View className="flex-row gap-3 w-full">
            <TouchableOpacity
              className="flex-1 py-3 border border-[#333] items-center"
              onPress={onClose}
            >
              <Text className="text-white font-medium text-[15px]">Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 bg-white items-center"
              onPress={() => {
                Linking.openURL(upiUrl).catch(() =>
                  appAlert("Error", "No UPI app found on this device")
                );
              }}
            >
              <Text className="text-black font-medium text-[15px]">Pay Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
