import TitleBar from "@/components/TitleBar";
import { useDB } from "@/context/DBContext";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import UserTab from "@/components/UserTab";
import { User } from "@/types/user";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { filterUsers, sortUsers } from "@/utils";
import { COLORS } from "@/constants";

export default function IOU() {
  const { users } = useDB();
  const router = useRouter();

  const [searchText, setSearchText] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    setFilteredUsers(sortUsers(filterUsers(users, searchText)));
  }, [searchText, users]);

  return (
    <SafeAreaView className="flex-1 bg-background w-full">
      <TitleBar
        searchText={searchText}
        setSearchText={setSearchText}
        title="IOU"
      >
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/stack/user/userform",
              params: { mode: "insert" },
            })
          }
          className="ml-6"
        >
          <AntDesign name="adduser" size={24} color={COLORS.foreground} />
        </TouchableOpacity>
      </TitleBar>

      <ScrollView
        className="flex-1"
      >
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => <UserTab key={user.id} user={user} />)
        ) : (
          <Text className="text-muted-foreground text-center p-4">
            {users.length === 0
              ? "No users found. Add your first user!"
              : "No matching users found."}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
