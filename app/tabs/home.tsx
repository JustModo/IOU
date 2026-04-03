import { COLORS } from "@/constants";
import { useDB } from "@/context/DBContext";
import { computeDashboardStats, getTopBalances } from "@/utils";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatCurrency(amount: number): string {
  return `₹${Number.isFinite(amount) ? amount : 0}`;
}

function formatSignedCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return "₹0";
  if (amount > 0) return `+₹${amount}`;
  if (amount < 0) return `-₹${Math.abs(amount)}`;
  return "₹0";
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

export default function HomeTab() {
  const { users } = useDB();
  const router = useRouter();
  const pulse = useRef(new Animated.Value(0)).current;

  const stats = useMemo(() => computeDashboardStats(users), [users]);
  const topBalances = useMemo(() => getTopBalances(users, 3), [users]);
  const maxTopBalance = topBalances[0]?.absoluteAmount ?? 0;
  const netColor =
    stats.netBalance > 0
      ? COLORS.success
      : stats.netBalance < 0
        ? COLORS.destructive
        : COLORS.foreground;

  const netLabel =
    stats.netBalance > 0
      ? "You are in positive"
      : stats.netBalance < 0
        ? "You owe overall"
        : "Perfectly settled";

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const ringScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const dotScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const dotOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5 pb-4">
        <View className="pt-2 pb-4 border-b border-border">
          <View className="mt-3 flex-row items-end justify-between">
            <View className="flex-1">
              <Text className="text-subtle text-[11px] uppercase">Owed To Me</Text>
              <Text className="text-lg mt-1" style={{ color: COLORS.success }}>
                {formatCurrency(stats.totalOwedToMe)}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-subtle text-[11px] uppercase">I Owe</Text>
              <Text className="text-lg mt-1" style={{ color: COLORS.destructive }}>
                {formatCurrency(stats.totalIOwe)}
              </Text>
            </View>
            <View className="flex-1 items-end">
              <Text className="text-subtle text-[11px] uppercase">Exposure</Text>
              <Text className="text-lg mt-1 text-foreground">{formatCurrency(stats.exposure)}</Text>
            </View>
          </View>
        </View>

        <View className="flex-1 border-b border-border items-center justify-center py-4">
          <Text className="text-subtle text-xs uppercase tracking-wider">Current Position</Text>

          <View className="items-center mt-6">
            <Animated.View
              className="w-32 h-32 rounded-full items-center justify-center"
              style={{
                borderWidth: 1,
                borderStyle: "dashed",
                borderColor: COLORS.border,
                transform: [{ scale: ringScale }],
              }}
            >
              <Animated.View
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: netColor,
                  opacity: dotOpacity,
                  transform: [{ scale: dotScale }],
                }}
              />
            </Animated.View>

            <Text className="text-4xl mt-5" style={{ color: netColor }}>
              {formatSignedCurrency(stats.netBalance)}
            </Text>
            <Text className="text-muted-foreground text-sm mt-1">{netLabel}</Text>
          </View>

        </View>

        <View className="pt-4">
          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 h-20 border border-border items-center justify-center"
              onPress={() => router.push("/tabs/iou")}
            >
              <Feather name="plus-circle" size={18} color={COLORS.foreground} />
              <Text className="text-foreground text-sm mt-2">Add IOU</Text>
            </Pressable>

            <Pressable
              className="flex-1 h-20 border border-border items-center justify-center"
              onPress={() =>
                router.push({
                  pathname: "/stack/user/userform",
                  params: { mode: "insert" },
                })
              }
            >
              <Feather name="user-plus" size={18} color={COLORS.foreground} />
              <Text className="text-foreground text-sm mt-2">Add User</Text>
            </Pressable>
          </View>

          <View className="mt-4">
            <Text className="text-subtle text-[11px] uppercase tracking-wider">Top Open Balances</Text>

            {topBalances.length > 0 ? (
              <View className="mt-2 gap-2">
                {topBalances.map((point) => {
                  const width =
                    maxTopBalance > 0
                      ? Math.max((point.absoluteAmount / maxTopBalance) * 100, 8)
                      : 8;

                  return (
                    <View key={point.id}>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-foreground text-xs">{firstName(point.name) || "NA"}</Text>
                        <Text
                          className="text-xs"
                          style={{ color: point.amount >= 0 ? COLORS.success : COLORS.destructive }}
                        >
                          {formatSignedCurrency(point.amount)}
                        </Text>
                      </View>
                      <View className="h-1 bg-border mt-1">
                        <View
                          className="h-full"
                          style={{
                            width: `${width}%`,
                            backgroundColor: point.amount >= 0 ? COLORS.success : COLORS.destructive,
                          }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text className="text-muted-foreground text-xs mt-2">No open balances</Text>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}