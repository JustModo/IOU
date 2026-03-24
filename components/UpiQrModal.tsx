import React from "react";
import { Linking, Modal, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { appAlert } from "@/services/alertService";
import { COLORS } from "@/constants";

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
      <View className="flex-1 justify-center items-center px-4" style={{ backgroundColor: COLORS.overlay }}>
        <View className="bg-background p-6 w-full max-w-sm border border-input items-center">
          <Text className="text-foreground text-[17px] font-bold text-center mb-6 tracking-widest uppercase">{name}</Text>
          <View className="bg-foreground p-3 mb-4">
            <QRCode value={upiUrl} size={200} />
          </View>
          <Text className="text-muted-foreground text-[15px] mb-8">{upiId}</Text>
          <View className="flex-row gap-3 w-full">
            <TouchableOpacity
              className="flex-1 py-3 border border-input items-center"
              onPress={onClose}
            >
              <Text className="text-foreground font-medium text-[15px]">Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 bg-foreground items-center"
              onPress={() => {
                Linking.openURL(upiUrl).catch(() =>
                  appAlert("Error", "No UPI app found on this device")
                );
              }}
            >
              <Text className="text-background font-medium text-[15px]">Pay Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
