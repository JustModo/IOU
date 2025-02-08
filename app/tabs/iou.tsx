import IOUTitleBar from "@/components/IOUTitleBar";
import { useDB } from "@/hooks/useDB";
import { useEffect } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import UserTab from "@/components/UserTab";

export default function IOU() {
  const { users } = useDB();

  useEffect(() => {
    console.log(users);
  }, [users]);

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-black">
      <IOUTitleBar />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingVertical: 20 }}
      >
        {users.map((user) => (
          <UserTab key={user.id} user={user} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
