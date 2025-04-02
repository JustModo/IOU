import TitleBar from "@/components/TitleBar";
import { useDB } from "@/context/DBContext";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import BillTab from "@/components/BillTab";

export default function BillHome() {
  const { bills } = useDB();
  const router = useRouter();
  const [searchText, setSearchText] = useState("");

  const filteredBills = useMemo(() => {
    return bills
      .filter((bill) =>
        bill.title.toLowerCase().includes(searchText.toLowerCase())
      )
      .sort(
        (a, b) =>
          (b.amount !== 0 ? b.amount : -Infinity) -
          (a.amount !== 0 ? a.amount : -Infinity)
      );
  }, [bills, searchText]);

  const handleAddBill = useCallback(() => {
    router.push({
      pathname: "/stack/bill/billform",
      params: { mode: "insert" },
    });
  }, [router]);

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-black">
      <TitleBar
        searchText={searchText}
        setSearchText={setSearchText}
        title="BILL SPLIT"
      >
        <TouchableOpacity onPress={handleAddBill} className="ml-6">
          <AntDesign name="plus" size={24} color="white" />
        </TouchableOpacity>
      </TitleBar>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingVertical: 20 }}
      >
        {filteredBills.length > 0 ? (
          filteredBills.map((bill) => <BillTab key={bill.id} bill={bill} />)
        ) : (
          <Text className="text-gray-400 text-center p-4">
            {bills.length === 0
              ? "No bills found. Add your first bill!"
              : "No matching bills found."}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
