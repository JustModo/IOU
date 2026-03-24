import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "@/constants";

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
      <View className="flex-1 justify-center items-center px-4" style={{ backgroundColor: COLORS.overlay }}>
        <View className="bg-background p-6 w-full max-w-sm border border-input">
          <View className="items-center mb-6">
            {variant === "danger" && (
                <View className="mb-4">
                    <Feather name="alert-triangle" size={32} color={COLORS.destructive} />
                </View>
            )}
            <Text className="text-foreground text-[17px] font-bold text-center mb-2 tracking-widest uppercase">
              {title}
            </Text>
            <Text className="text-muted-foreground text-center text-[14px] leading-5">
              {message}
            </Text>
          </View>

          <View className="flex-row gap-3">
            {!isAlert && (
              <TouchableOpacity
                className="flex-1 py-3 border border-input items-center"
                onPress={onCancel}
              >
                <Text className="text-foreground font-medium text-[15px]">{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className={`flex-1 py-3 items-center ${
                variant === "danger" ? "bg-destructive" : "bg-foreground"
              }`}
              onPress={onConfirm}
            >
              <Text className={`font-medium text-[15px] ${variant === "danger" ? "text-destructive-foreground" : "text-background"}`}>{isAlert && confirmText === "Confirm" ? "OK" : confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
