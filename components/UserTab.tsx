import { User } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { getAmountStatus, formatAmount, statusColor } from "@/utils";

export default function UserTab({ user }: { user: User }) {
  const router = useRouter();

  const status = getAmountStatus(user.amount);
  const { display } = formatAmount(user.amount);

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
          className="font-light text-2xl"
          style={statusColor(status)}
        >
          {display}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
