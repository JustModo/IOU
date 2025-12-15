import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
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
}: ConfirmModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/70 px-4">
        <View className="bg-[#121317] p-6 rounded-2xl w-full max-w-sm border border-gray-800">
          <View className="items-center mb-4">
            {variant === "danger" && (
                <View className="w-12 h-12 rounded-full bg-red-900/30 items-center justify-center mb-4">
                    <Feather name="alert-triangle" size={24} color="#f87171" />
                </View>
            )}
            <Text className="text-white text-xl font-bold text-center mb-2">
              {title}
            </Text>
            <Text className="text-gray-400 text-center leading-5">
              {message}
            </Text>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 py-3 bg-[#1e1f23] rounded-xl items-center"
              onPress={onCancel}
            >
              <Text className="text-white font-semibold">{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl items-center ${
                variant === "danger" ? "bg-red-600" : "bg-blue-600"
              }`}
              onPress={onConfirm}
            >
              <Text className="text-white font-semibold">{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
