import { Feather } from "@expo/vector-icons";
import { Animated, Text, View, Image } from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from "react-native-gesture-handler";
import { useRef } from "react";
import { User } from "@/types/user";

type BillTransactionRowProps = {
  transaction: any;
  user: User | undefined;
  onEdit: (tx: any) => void;
};

export default function BillTransactionRow({ transaction, user, onEdit }: BillTransactionRowProps) {
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
      onEdit(transaction);
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

  return (
    <PanGestureHandler
      activeOffsetX={[-20, 20]}
      failOffsetY={[-10, 10]}
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
            paddingHorizontal: 8,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "black",
            borderBottomWidth: 1,
            borderBottomColor: "#222"
          }}
        >
             <View className="flex-row items-center gap-4">
                 <View className="w-12 h-12 rounded-full bg-[#121317] items-center justify-center overflow-hidden">
                    {user && user.pfp ? (
                        <Image source={{ uri: user.pfp }} className="w-full h-full" />
                    ) : (
                        <Text className="text-white font-bold text-lg">{transaction.user.charAt(0)}</Text>
                    )}
                 </View>
                 <View>
                    <Text className="text-white text-lg font-medium">{transaction.user}</Text>
                    {transaction.note ? <Text className="text-gray-500 text-sm">{transaction.note}</Text> : null}
                 </View>
              </View>
              <Text className="text-white text-2xl font-light">{transaction.amount}</Text>
        </Animated.View>
        <Animated.View
          style={{ position: "absolute", right: 20, opacity }}
          className={"flex-1 h-full justify-center"}
        >
          <Feather name="edit-2" size={24} color="#aaa" />
        </Animated.View>
      </View>
    </PanGestureHandler>
  );
}
