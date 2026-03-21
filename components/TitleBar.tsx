import React, { ReactNode, useState } from "react";
import { Text, View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TitleBarProps {
  title: string;
  searchText?: string;
  setSearchText?: (text: string) => void;
  children?: ReactNode;
}

export default function TitleBar({
  title,
  searchText,
  setSearchText,
  children,
}: TitleBarProps) {
  const [searchActive, setSearchActive] = useState(false);

  const searchEnabled = searchText !== undefined && setSearchText !== undefined;

  return (
    <View className="w-full h-16 bg-black border-b border-[#222] flex-row items-center px-4">
      {searchEnabled && searchActive ? (
        <TextInput
          className="flex-1 text-white py-2 rounded-lg text-xl"
          placeholder="Search..."
          placeholderTextColor="#aaa"
          value={searchText}
          onChangeText={setSearchText}
          autoFocus
        />
      ) : (
        <Text className="text-white text-xl font-semibold flex-1 py-2">
          {title}
        </Text>
      )}

      {searchEnabled && (
        <Pressable
          onPress={() => {
            setSearchText("");
            setSearchActive((prev) => !prev);
          }}
          className="ml-4"
        >
          <Ionicons
            name={searchActive ? "close" : "search"}
            size={24}
            color="white"
          />
        </Pressable>
      )}

      {searchEnabled && children}
    </View>
  );
}
