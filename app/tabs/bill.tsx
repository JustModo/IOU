import TitleBar from "@/components/TitleBar";
import { useDB } from "@/context/DBContext";
import { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import UserTab from "@/components/UserTab";
import { User } from "@/types/user";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

export default function Bill() {
  const { users } = useDB();
  const router = useRouter();

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
      <TitleBar
        searchText={searchText}
        setSearchText={setSearchText}
        title="BILL SPLIT"
      >
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/stack/bill/billform",
              params: { mode: "insert" },
            })
          }
          className="ml-6"
        >
          <AntDesign name="plus" size={24} color="white" />
        </TouchableOpacity>
      </TitleBar>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingVertical: 20 }}
      ></ScrollView>
    </SafeAreaView>
  );
}
