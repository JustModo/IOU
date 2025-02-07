import React, { useState } from "react";
import { Text, View, TextInput, Pressable } from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";

export default function IOUTitleBar({ text = "" }) {
  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState("");

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
        <Text className="text-white text-xl flex-1 py-2">{text}</Text>
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

      <Pressable onPress={() => {}} className="ml-6">
        <AntDesign name="adduser" size={24} color="white" />
      </Pressable>
    </View>
  );
}
