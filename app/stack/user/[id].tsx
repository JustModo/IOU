import React, { useEffect, useState, useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import TransactionTab from "@/components/TransactionTab";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import { useDB } from "@/context/DBContext";
import { User } from "@/types/user";
import { IOUTransaction } from "@/types/transaction";
import { getAmountStatus, formatAmount, statusColor } from "@/utils";
import UpiQrModal from "@/components/UpiQrModal";
import { appAlert } from "@/services/alertService";

export default function UserScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { users, fetchTransactionsByID } = useDB();

  const [data, setData] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<IOUTransaction[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [repayMode, setRepayMode] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);

  const userId = typeof id === "string" ? Number(id) : null;

  const loadData = useCallback(async () => {
    if (userId === null || !users.length) return;

    setIsLoading(true);

    try {
      const userData = users.find((user) => user.id === userId) || null;
      setData(userData);
      if (userData) {
        const transactionData = await fetchTransactionsByID(userId);
        setTransactions(transactionData);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, users, fetchTransactionsByID]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!data) {
    return (
      <SafeAreaView className="bg-black flex-1 justify-center items-center">
        <Text className="text-white text-lg">
          {isLoading ? "Loading..." : "User not found"}
        </Text>
      </SafeAreaView>
    );
  }

  const status = getAmountStatus(data.amount);
  const { display } = formatAmount(data.amount);

  return (
    <SafeAreaView className="bg-black flex-1">
      {/* Header */}
      <View className="w-full h-16 bg-black border-b border-[#222] flex-row items-center px-4 justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-2"
        >
          <AntDesign name="left" size={24} color="white" />
          <Text className="text-white font-semibold text-lg">Back</Text>
        </TouchableOpacity>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => {
              if (data.upi_id) {
                setQrVisible(true);
              } else {
                appAlert("No UPI ID", "Set a UPI ID for this user in edit mode");
              }
            }}
          >
            <MaterialIcons name="qr-code" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/stack/user/userform",
                params: { mode: "update", user: JSON.stringify(data) },
              })
            }
          >
            <Feather name="edit-2" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Section */}
      <View className="p-4 py-8 flex-row items-center border-b border-[#222]">
        <View className="bg-[#111] border border-[#222] h-28 w-28 rounded-full overflow-hidden justify-center items-center">
          {data?.pfp ? (
            <Image source={{ uri: data.pfp }} className="w-full h-full" />
          ) : (
            <Ionicons name="person-sharp" color="gray" size={42} />
          )}
        </View>

        <View className="flex-1 items-end justify-end px-2">
          <Text
            className="font-light text-3xl"
            style={statusColor(status)}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {display}
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
      <GestureHandlerRootView className="flex-1">
        <ScrollView className="flex-1">
          {isLoading ? (
            <Text className="text-white text-center py-4">
              Loading transactions...
            </Text>
          ) : transactions && transactions.length > 0 ? (
            [...transactions]
              .reverse()
              .map((transaction) => (
                <TransactionTab
                  key={transaction.id}
                  transaction={transaction}
                />
              ))
          ) : (
            <Text className="text-gray-400 text-center py-4">
              No transactions found
            </Text>
          )}
        </ScrollView>
      </GestureHandlerRootView>

      {/* Bottom Button Section */}
      <View className="mb-4">
        <View className="bg-[#121317] flex-row justify-between overflow-visible h-14 items-end rounded-2xl mx-1 w-[98%] self-center">
          <TouchableOpacity
            className="flex-1 h-full justify-center active:opacity-75"
            onPress={() =>
              router.push({
                pathname: `/stack/transaction/transactionform`,
                params: {
                  type: repayMode ? "repay" : "oweme",
                  id: data.id,
                  mode: "insert",
                },
              })
            }
          >
            <Text className="text-white text-center text-lg font-semibold">
              {repayMode ? "Got Back" : "Lent"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-20 h-16 bg-[#1e1f23] justify-center items-center rounded-t-xl active:opacity-75"
            onPress={() => setRepayMode((prev) => !prev)}
            style={{ marginBottom: -1 }}
          >
            <MaterialCommunityIcons
              name={repayMode ? "cash-minus" : "cash-plus"}
              size={36}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 h-full justify-center active:opacity-75"
            onPress={() =>
              router.push({
                pathname: `/stack/transaction/transactionform`,
                params: {
                  type: repayMode ? "repaid" : "oweyou",
                  id: data.id,
                  mode: "insert",
                },
              })
            }
          >
            <Text className="text-white text-center text-lg font-semibold">
              {repayMode ? "Paid Back" : "Borrowed"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <UpiQrModal
        visible={qrVisible}
        name={data.name}
        upiId={data.upi_id || ""}
        onClose={() => setQrVisible(false)}
      />
    </SafeAreaView>
  );
}
