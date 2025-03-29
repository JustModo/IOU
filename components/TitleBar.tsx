import React, { ReactNode, useState } from "react";
import { Text, View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TitleBarProps {
  searchText: string;
  setSearchText: (text: string) => void;
  title: string;
  children?: ReactNode;
}

export default function TitleBar({
  searchText,
  setSearchText,
  title,
  children,
}: TitleBarProps) {
  const [searchActive, setSearchActive] = useState(false);

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
          {title}
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

      {children}
    </View>
  );
}
