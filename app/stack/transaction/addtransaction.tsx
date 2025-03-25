import React, { useEffect, useRef, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDB } from "@/hooks/useDB";
import { TransactionType } from "@/types/utils";

export default function AddTransaction() {
  const router = useRouter();
  const { id, type } = useLocalSearchParams() as {
    id: string;
    type: TransactionType;
  };

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const amountInputRef = useRef<TextInput | null>(null);

  const { insertIouTransaction } = useDB();

  const mapping: Record<TransactionType, { title: string; mul: number }> = {
    oweme: {
      title: "You Owe Me",
      mul: 1,
    },
    oweyou: {
      title: "I Owe You",
      mul: -1,
    },
    repay: {
      title: "Repay",
      mul: -1,
    },
  };

  const setting = mapping[type];

  const handleInsert = async () => {
    if (!id || Array.isArray(id)) {
      console.error("Invalid ID provided");
      return;
    }
    const parsedID = parseInt(id, 10);
    const parsedAmount = amount.trim() === "" ? 0 : parseFloat(amount);
    const res = await insertIouTransaction(
      parsedID,
      note,
      parsedAmount * setting.mul,
      type
    );
    if (res) router.back();
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
      </View>

      <View className="flex-1 bg-black items-center justify-center px-8 gap-12">
        <Text className="text-white font-light text-6xl text-center">
          {setting.title}
        </Text>

        {/* Input Section */}
        <View className="w-full flex gap-4">
          <View className="w-full flex-row items-center justify-center">
            <Text className="text-white text-7xl">₹</Text>
            <TextInput
              ref={amountInputRef}
              className="p-4 text-white rounded-lg text-center text-7xl bg-transparent"
              placeholderTextColor="gray"
              keyboardType="numeric"
              placeholder="0"
              maxLength={6}
              autoFocus
              onChangeText={(text) => {
                if (/^\d*\.?\d{0,5}$/.test(text) && !/^0\d/.test(text)) {
                  setAmount(text);

                  requestAnimationFrame(() => {
                    amountInputRef.current?.setSelection(
                      text.length,
                      text.length
                    );
                  });
                }
              }}
              onFocus={() => {
                requestAnimationFrame(() => {
                  amountInputRef.current?.setSelection(
                    amount.length,
                    amount.length
                  );
                });
              }}
              value={amount}
            />
          </View>

          <View className="w-full">
            <Text className="text-white font-semibold mb-2 px-2">Notes</Text>
            <TextInput
              className="w-full p-4 bg-[#121317] text-white rounded-lg text-lg"
              placeholder="Enter notes"
              placeholderTextColor="gray"
              value={note}
              onChangeText={setNote}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className="w-full p-4 bg-[#121317] rounded-lg"
          onPress={handleInsert}
        >
          <Text className="text-white text-xl text-center font-semibold">
            Save
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
