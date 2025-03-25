import { Feather } from "@expo/vector-icons";
import { Animated, Text, View } from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from "react-native-gesture-handler";
import { useRef } from "react";
import { IOUTransaction } from "@/types/transaction";

type TransactionTabProps = {
  transaction: IOUTransaction;
};

export default function TransactionTab({ transaction }: TransactionTabProps) {
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

  const formatToUTC = (isoString: string): string => {
    const date = new Date(isoString);

    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", {
      month: "long",
      timeZone: "UTC",
    });
    const year = date.getUTCFullYear();

    const hours = date.getUTCHours() % 12 || 12;
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const ampm = date.getUTCHours() >= 12 ? "PM" : "AM";

    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  };

  const handleEvent = () => {
    console.log("Swiped left!", transaction.id);
  };

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
            padding: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <View className="max-w-[80%]">
            <Text className="text-lg text-white">{transaction.note}</Text>
            <Text className="text-sm text-[#aaa]">
              {formatToUTC(transaction.date)}
            </Text>
          </View>
          <Text className="text-white font-light text-2xl">
            {`${
              transaction.amount > 0 ? "+" : transaction.amount < 0 ? "-" : ""
            } ${Math.abs(transaction.amount)}`}
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
