import IOUTitleBar from "@/components/IOUTitleBar";
import { useDB } from "@/hooks/useDB";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import UserTab from "@/components/UserTab";
import { User } from "@/types/user";

export default function IOU() {
  const { users } = useDB();

  const [searchText, setSearchText] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    setFilteredUsers(
      users
        .filter((user) =>
          user.name.toLowerCase().includes(searchText.toLowerCase())
        )
        .sort(
          (a, b) =>
            (b.amount !== 0 ? b.amount : -Infinity) -
            (a.amount !== 0 ? a.amount : -Infinity)
        )
    );
  }, [searchText, users]);

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-black">
      <IOUTitleBar searchText={searchText} setSearchText={setSearchText} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingVertical: 20 }}
      >
        {filteredUsers.map((user) => (
          <UserTab key={user.id} user={user} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
