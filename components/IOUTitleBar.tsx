import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface IOUTitleBarProps {
  searchText: string;
  setSearchText: (text: string) => void;
}

export default function IOUTitleBar({
  searchText,
  setSearchText,
}: IOUTitleBarProps) {
  const [searchActive, setSearchActive] = useState(false);

  const router = useRouter();

  return (
    <View className="w-screen h-16 bg-[#121317] flex-row items-center px-6">
      {searchActive ? (
        <TextInput
          className="flex-1 text-white py-2 rounded-lg text-xl "
          placeholder="Search..."
          placeholderTextColor="#aaa"
          value={searchText}
          onChangeText={setSearchText}
          autoFocus
        />
      ) : (
        <Text className="text-white text-xl font-semibold flex-1 py-2">
          {"IOU"}
        </Text>
      )}

      <Pressable
        onPress={() => {
          setSearchText("");
          setSearchActive(!searchActive);
        }}
        className="ml-4"
      >
        <Ionicons
          name={searchActive ? "close" : "search"}
          size={24}
          color="white"
        />
      </Pressable>

      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/stack/user/userform",
            params: { mode: "insert" },
          })
        }
        className="ml-6"
      >
        <AntDesign name="adduser" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
