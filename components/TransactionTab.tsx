import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { IOUTransaction } from "@/types/transaction";
import { useRouter } from "expo-router";
import { formatDateToDisplay, formatAmount, getAmountStatus, statusColor } from "@/utils";
import { COLORS } from "@/constants";

type TransactionTabProps = {
  transaction: IOUTransaction;
};

export default function TransactionTab({ transaction }: TransactionTabProps) {
  const router = useRouter();
  const translateX = useSharedValue(0);
  const swipeThreshold = -100;

  const handleEvent = () => {
    router.push({
      pathname: `/stack/transaction/transactionform`,
      params: {
        id: transaction.user_id,
        mode: "update",
        transaction: JSON.stringify(transaction),
      },
    });
  };

  const status = getAmountStatus(transaction.amount);
  const { display } = formatAmount(transaction.amount);

  const rowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          translateX.value,
          [-100, 0],
          [-50, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-100, -50, 0],
      [1, 0.5, 0],
      Extrapolation.CLAMP
    ),
  }));

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-10, 10])
    .onUpdate((event) => {
      translateX.value = Math.min(0, event.translationX);
    })
    .onEnd((event) => {
      if (event.translationX < swipeThreshold) {
        scheduleOnRN(handleEvent);
      }
      translateX.value = withTiming(0, { duration: 180 });
    });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View collapsable={false}>
        <Animated.View
          style={[
            rowAnimatedStyle,
            {
              paddingVertical: 16,
              paddingHorizontal: 20,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
              backgroundColor: COLORS.background,
            },
          ]}
        >
          <View className="max-w-[80%]">
            <Text className="text-lg text-foreground">
              {transaction.note !== "" ? transaction.note : "Note"}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {formatDateToDisplay(transaction.date)}
            </Text>
          </View>
          <Text
            className="font-light text-2xl"
            style={statusColor(status)}
          >
            {display}
          </Text>
        </Animated.View>
        <Animated.View
          style={[{ position: "absolute", right: 20 }, iconAnimatedStyle]}
          className={"flex-1 h-full justify-center"}
        >
          <Feather name="edit-2" size={20} color={COLORS.mutedForeground} />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}
