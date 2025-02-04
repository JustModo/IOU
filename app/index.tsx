import { Redirect } from "expo-router";
import { useDBMigrations } from "../db";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";

export default function Index() {
  const { success, error } = useDBMigrations();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (success) {
      setIsReady(true);
    }
  }, [success]);

  if (error) {
    return (
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View>
        <Text>Setting up database...</Text>
      </View>
    );
  }

  return <Redirect href={"/iou/IOUHome"} />;
}
