import IOUTitleBar from "@/components/IOUTitleBar";
import { useDB } from "@/hooks/useDB";
// import { useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function IOU() {
  const { users, addUser, deleteUser } = useDB();

  // useEffect(() => {
  //   console.log(users);
  // }, [users]);

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-black">
      <IOUTitleBar text="IOU" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingVertical: 20 }}
      >
        <UserTab id="hi" />
      </ScrollView>
    </SafeAreaView>
  );
}

function UserTab({ id }: { id: string }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="w-screen flex-row items-center"
      activeOpacity={0.7}
      onPress={() => router.push(`/stack/user/${id}`)}
    >
      {/* Left Side (Avatar + Name) */}
      <View className="flex-row items-center gap-4 py-2 pl-4 flex-1">
        <View className="bg-slate-500 h-14 w-14 rounded-full"></View>
        <Text
          className="text-white text-xl flex-1"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          Nameeeew
        </Text>
      </View>

      {/* Right Side (Number) */}
      <View className="items-end justify-center pr-4 flex-1">
        <Text className="text-white font-light text-2xl">+ 2400</Text>
      </View>
    </TouchableOpacity>
  );
}
