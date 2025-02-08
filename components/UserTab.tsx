import { User } from "@/types/user";
import { Status } from "@/types/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function UserTab({ user }: { user: User }) {
  const router = useRouter();

  const status: Status =
    user.amount > 0 ? "positive" : user.amount < 0 ? "negative" : "neutral";

  return (
    <TouchableOpacity
      className="w-screen flex-row items-center"
      activeOpacity={0.7}
      onPress={() => router.push(`/stack/user/${user.id}`)}
    >
      {/* Left Side (Avatar + Name) */}
      <View className="flex-row items-center gap-4 py-2 pl-4 flex-1">
        <View className="bg-[#121317] h-16 w-16 rounded-full overflow-hidden justify-center items-center">
          {user.pfp ? (
            <Image source={{ uri: user.pfp }} className="w-full h-full" />
          ) : (
            <Ionicons name="person-sharp" color="gray" size={24} />
          )}
        </View>
        <Text
          className="text-white text-xl flex-1"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {user.name}
        </Text>
      </View>

      {/* Right Side (Number) */}
      <View className="items-end justify-center pr-4 flex-1">
        <Text
          className={`font-light text-2xl ${
            status === "positive"
              ? "text-green-500"
              : status === "negative"
              ? "text-red-500"
              : "text-[#aaa]"
          }`}
        >
          {`${
            status === "positive" ? "+" : status === "negative" ? "-" : ""
          } ${Math.abs(user.amount)}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
