import React from "react";
import { useEffect } from "react";
import { View, Text } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useDBMigrations } from "../db";
import { useRouter } from "expo-router";
import { useDB } from "@/context/DBContext";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { success, error } = useDBMigrations();
  const router = useRouter();
  const { fetchData } = useDB();

  useEffect(() => {
    async function prepare() {
      if (success) {
        await SplashScreen.hideAsync();
        await fetchData();
        router.replace("/tabs/iou");
      }
    }
    prepare();
  }, [router, success, fetchData]);

  if (error) {
    return (
      <View className="bg-black flex-1 justify-center items-center">
        <Text className="text-white">Migration error: {error?.message}</Text>
      </View>
    );
  }
  return <View className="bg-black flex-1" />;
}
