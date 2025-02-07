import { Redirect } from "expo-router";
import { useDBMigrations } from "../db";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";

export default function Index() {
  const { success, error } = useDBMigrations();
  const [isReady, setIsReady] = useState(false);

  // useEffect(() => {
  //   if (success) {
  //     setIsReady(true);
  //   }
  // }, [success]);

  if (error) {
    return (
      <View className="bg-black flex-1 justify-center items-center">
        <Text className="text-white">Migration error: {error?.message}</Text>
      </View>
    );
  }

  // if (!isReady) {
  //   return (
  //     <View className="bg-black flex-1 justify-center items-center">
  //       <Text className="text-white">Setting up database...</Text>
  //     </View>
  //   );
  // }

  return <Redirect href={"/iou/IOUHome"} />;
}
