import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
  isAlert?: boolean;
}

export default function ConfirmModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isAlert = false,
}: ConfirmModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel || onConfirm}
    >
      <View className="flex-1 justify-center items-center bg-black/80 px-4">
        <View className="bg-black p-6 w-full max-w-sm border border-[#333]">
          <View className="items-center mb-6">
            {variant === "danger" && (
                <View className="mb-4">
                    <Feather name="alert-triangle" size={32} color="#ff4444" />
                </View>
            )}
            <Text className="text-white text-[17px] font-bold text-center mb-2 tracking-widest uppercase">
              {title}
            </Text>
            <Text className="text-gray-400 text-center text-[14px] leading-5">
              {message}
            </Text>
          </View>

          <View className="flex-row gap-3">
            {!isAlert && (
              <TouchableOpacity
                className="flex-1 py-3 border border-[#333] items-center"
                onPress={onCancel}
              >
                <Text className="text-white font-medium text-[15px]">{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className={`flex-1 py-3 items-center ${
                variant === "danger" ? "bg-[#ff4444]" : "bg-white"
              }`}
              onPress={onConfirm}
            >
              <Text className={`font-medium text-[15px] ${variant === "danger" ? "text-white" : "text-black"}`}>{isAlert && confirmText === "Confirm" ? "OK" : confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
