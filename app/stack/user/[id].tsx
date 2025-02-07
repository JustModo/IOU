import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { AntDesign, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import TransactionTab from "@/components/TransactionTab";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";

export default function UserScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const data = {
    id: 123,
    name: "John Doe",
    amount: 1203,
    transactions: [
      { id: 1, title: "Hola1", time: new Date().toUTCString(), amount: 123 },
      { id: 2, title: "Hola2", time: new Date().toUTCString(), amount: -123 },
      { id: 3, title: "Hola3", time: new Date().toUTCString(), amount: 0 },
      { id: 4, title: "Hola4", time: new Date().toUTCString(), amount: 1283 },
    ],
  };

  type Status = "negative" | "positive" | "neutral";

  const status: Status =
    data.amount > 0 ? "positive" : data.amount < 0 ? "negative" : "neutral";

  return (
    <SafeAreaView className="bg-black flex-1">
      {/* Header */}
      <View className="w-full h-16 bg-[#121317] flex-row items-center px-6 justify-between">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2">
          <AntDesign name="left" size={24} color="white" />
          <Text className="text-white font-semibold text-lg">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            console.log("Hello", id);
          }}
        >
          <Feather name="edit-2" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View className="p-4 py-8 flex-row items-center">
        <View className="bg-slate-500 h-28 w-28 rounded-full" />

        <View className="flex-1 items-end justify-end">
          <Text
            className={`font-light text-3xl ${
              status === "positive"
                ? "text-green-500"
                : status === "negative"
                ? "text-red-500"
                : "text-[#aaa]"
            }`}
          >
            {`${
              status === "positive" ? "+" : status === "negative" ? "-" : ""
            } ${Math.abs(data.amount)}`}
          </Text>
          <Text
            className="text-white text-4xl"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {data.name}
          </Text>
        </View>
      </View>

      <View className="px-4 py-2">
        <Text className="text-white text-lg font-semibold">Details</Text>
      </View>

      {/* Scrollable Content */}
      <GestureHandlerRootView>
        <ScrollView className="flex-1">
          {data.transactions.map((transaction) => (
            <TransactionTab key={transaction.id} transaction={transaction} />
          ))}
        </ScrollView>
      </GestureHandlerRootView>

      {/* Bottom Button Section */}
      <View className="w-full bg-[#121317] flex-row justify-between overflow-visible h-14 items-end rounded-2xl">
        <TouchableOpacity className="flex-1 h-full justify-center">
          <Text className="text-white text-center text-lg font-semibold">
            Owes Me
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="w-20 h-16 bg-[#1e1f23] justify-center items-center rounded-t-xl">
          <MaterialCommunityIcons name="cash-plus" size={32} color="white" />
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 h-full justify-center">
          <Text className="text-white text-center text-lg font-semibold">
            Owe You
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
