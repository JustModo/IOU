import React, { ReactNode, useState } from "react";
import { Text, View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";

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
    <View className="w-full h-14 bg-background border-b border-border flex-row items-center px-4">
      {searchEnabled && searchActive ? (
        <TextInput
          className="flex-1 text-foreground py-2 text-base"
          placeholder="Search..."
          placeholderTextColor={COLORS.mutedForeground}
          value={searchText}
          onChangeText={setSearchText}
          autoFocus
        />
      ) : (
        <Text className="text-foreground text-lg font-medium flex-1 py-2">
          {title}
        </Text>
      )}

      {searchEnabled && (
        <Pressable
          onPress={() => {
            setSearchText("");
            setSearchActive((prev) => !prev);
          }}
          className="ml-3"
        >
          <Ionicons
            name={searchActive ? "close" : "search"}
            size={20}
            color={COLORS.foreground}
          />
        </Pressable>
      )}

      {searchEnabled && children}
    </View>
  );
}
