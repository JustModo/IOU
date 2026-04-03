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
import { COLORS } from "@/constants";

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
      <SafeAreaView className="bg-background flex-1 justify-center items-center">
        <Text className="text-foreground text-lg">
          {isLoading ? "Loading..." : "User not found"}
        </Text>
      </SafeAreaView>
    );
  }

  const status = getAmountStatus(data.amount);
  const { display } = formatAmount(data.amount);
  const hasUpiId = Boolean(data.upi_id?.trim());
  const actionLabels = repayMode
    ? {
        leftTitle: "Collect",
        rightTitle: "Repay",
      }
    : {
        leftTitle: "Lend",
        rightTitle: "Borrow",
      };

  return (
    <SafeAreaView className="bg-background flex-1">
      {/* Header */}
      <View className="w-full h-16 bg-background border-b border-border flex-row items-center px-4 justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-2"
        >
          <AntDesign name="left" size={24} color={COLORS.foreground} />
          <Text className="text-foreground font-semibold text-lg">Back</Text>
        </TouchableOpacity>
        <View className="flex-row items-center gap-4">
          {hasUpiId && (
            <TouchableOpacity onPress={() => setQrVisible(true)}>
              <MaterialIcons name="qr-code" size={22} color={COLORS.foreground} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/stack/user/userform",
                params: { mode: "update", user: JSON.stringify(data) },
              })
            }
          >
            <Feather name="edit-2" size={22} color={COLORS.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Section */}
      <View className="p-4 py-8 flex-row items-center">
        <View className="bg-muted border border-border h-28 w-28 rounded-full overflow-hidden justify-center items-center">
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
            className="text-foreground text-4xl"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {data.name}
          </Text>
        </View>
      </View>

      <View className="px-4 py-2 border-b border-border">
        <Text className="text-foreground text-lg font-semibold">Details</Text>
      </View>

      {/* Scrollable Content */}
      <GestureHandlerRootView className="flex-1">
        <ScrollView className="flex-1">
          {isLoading ? (
            <Text className="text-foreground text-center py-4">
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
            <Text className="text-muted-foreground text-center py-4">
              No transactions found
            </Text>
          )}
        </ScrollView>
      </GestureHandlerRootView>

      {/* Bottom Button Section */}
      <View className="border-t border-border bg-background px-2 pb-2">
        <View className="flex-row h-16 border-y border-border">
          <TouchableOpacity
            className="flex-1 h-full justify-center px-2 active:bg-muted"
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
            <Text className="text-center text-sm font-semibold" style={{ color: COLORS.success }}>
              {actionLabels.leftTitle}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-20 h-16 border-x border-border bg-muted justify-center items-center active:bg-accent"
            onPress={() => setRepayMode((prev) => !prev)}
          >
            <MaterialCommunityIcons
              name={repayMode ? "swap-horizontal" : "swap-vertical"}
              size={20}
              color={COLORS.foreground}
            />
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 h-full justify-center px-2 active:bg-muted"
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
            <Text className="text-center text-sm font-semibold" style={{ color: COLORS.destructive }}>
              {actionLabels.rightTitle}
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
