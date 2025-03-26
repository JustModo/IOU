import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import TransactionTab from "@/components/TransactionTab";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import { useDB } from "@/hooks/useDB";
import { Status } from "@/types/utils";
import { User } from "@/types/user";
import { IOUTransaction } from "@/types/transaction";

export default function UserScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { users, fetchTransactionsByID } = useDB();

  const [data, setData] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<IOUTransaction[] | null>(
    null
  );

  useEffect(() => {
    if (!id || !users.length) return;

    const userData = users.find((user) => user.id === Number(id)) || null;
    setData(userData);

    if (id && !Array.isArray(id)) {
      fetchTransactionsByID(Number(id)).then(setTransactions);
    }
  }, [id, users]);

  if (!data) return null;

  const status: Status =
    data.amount > 0 ? "positive" : data.amount < 0 ? "negative" : "neutral";

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
        <View className="bg-[#121317] h-28 w-28 rounded-full overflow-hidden justify-center items-center">
          {data.pfp ? (
            <Image source={{ uri: data.pfp }} className="w-full h-full" />
          ) : (
            <Ionicons name="person-sharp" color="gray" size={42} />
          )}
        </View>

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
          {transactions?.reverse().map((transaction) => (
            <TransactionTab key={transaction.id} transaction={transaction} />
          ))}
        </ScrollView>
      </GestureHandlerRootView>

      {/* Bottom Button Section */}
      <View className="w-full bg-[#121317] flex-row justify-between overflow-visible h-14 items-end rounded-2xl">
        <TouchableOpacity
          className="flex-1 h-full justify-center"
          onPress={() =>
            router.push({
              pathname: `/stack/transaction/addtransaction`,
              params: { type: "oweme", id: data.id, mode: "insert" },
            })
          }
        >
          <Text className="text-white text-center text-lg font-semibold">
            Owes Me
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-20 h-16 bg-[#1e1f23] justify-center items-center rounded-t-xl"
          onPress={() =>
            router.push({
              pathname: `/stack/transaction/addtransaction`,
              params: { type: "repay", id: data.id, mode: "insert" },
            })
          }
        >
          <MaterialCommunityIcons name="cash-plus" size={32} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 h-full justify-center"
          onPress={() =>
            router.push({
              pathname: `/stack/transaction/addtransaction`,
              params: { type: "oweyou", id: data.id, mode: "insert" },
            })
          }
        >
          <Text className="text-white text-center text-lg font-semibold">
            Owe You
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
