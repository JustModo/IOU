import { Feather } from "@expo/vector-icons";
import { Animated, Text, View } from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from "react-native-gesture-handler";
import { useRef } from "react";
import { IOUTransaction } from "@/types/transaction";
import { useRouter } from "expo-router";
import { formatDateToDisplay, formatAmount, getAmountStatus, statusColor } from "@/utils";

type TransactionTabProps = {
  transaction: IOUTransaction;
};

export default function TransactionTab({ transaction }: TransactionTabProps) {
  const router = useRouter();
  const translateX = useRef(new Animated.Value(0)).current;
  const swipeDetected = useRef(false);

  const clampedTranslateX = translateX.interpolate({
    inputRange: [-100, 0],
    outputRange: [-50, 0],
    extrapolate: "clamp",
  });

  const handleGesture = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: false }
  );

  const handleGestureEnd = (event: PanGestureHandlerGestureEvent) => {
    const swipeThreshold = -100;
    if (event.nativeEvent.translationX < swipeThreshold) {
      handleEvent();
      swipeDetected.current = true;
    }

    Animated.timing(translateX, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      swipeDetected.current = false;
    });
  };

  const opacity = translateX.interpolate({
    inputRange: [-100, -50, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

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

  return (
    <PanGestureHandler
      activeOffsetX={[-20, 20]} // Ignore small horizontal swipes
      failOffsetY={[-10, 10]} // Prioritize vertical scrolling
      onGestureEvent={(event) => {
        if (event.nativeEvent.translationX < 0) {
          handleGesture(event);
        }
      }}
      onHandlerStateChange={(event) => {
        if (event.nativeEvent.state === State.END) {
          handleGestureEnd(event);
        }
      }}
    >
      <View>
        <Animated.View
          style={{
            transform: [{ translateX: clampedTranslateX }],
            paddingVertical: 16,
            paddingHorizontal: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottomWidth: 1,
            borderBottomColor: "#222",
            backgroundColor: "black",
          }}
        >
          <View className="max-w-[80%]">
            <Text className="text-lg text-white">
              {transaction.note !== "" ? transaction.note : "Note"}
            </Text>
            <Text className="text-sm text-[#aaa]">
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
          style={{ position: "absolute", right: 20, opacity }}
          className={"flex-1 h-full justify-center"}
        >
          <Feather name="edit-2" size={20} color="#aaa" />
        </Animated.View>
      </View>
    </PanGestureHandler>
  );
}
