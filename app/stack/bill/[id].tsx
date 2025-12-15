import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDB } from "@/context/DBContext";
import { AntDesign, Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Bill } from "@/types/bill";
import DropDownPicker from "react-native-dropdown-picker";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";

export default function BillScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { bills, users, insertBillTransaction, getBillTransactions } = useDB();

  const [bill, setBill] = useState<Bill | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [splitResult, setSplitResult] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [payer, setPayer] = useState(null);
  const [open, setOpen] = useState(false);

  const fetchTransactions = useCallback(async (billId: number) => {
    const txs = await getBillTransactions(billId);
    setTransactions(txs);
    setLoading(false);
  }, [getBillTransactions]);

  useEffect(() => {
    if (id) {
      const foundBill = bills.find((b) => b.id === Number(id));
      if (foundBill) {
        setBill(foundBill);
        fetchTransactions(foundBill.id);
      }
    }
  }, [id, bills, fetchTransactions]);

  const handleAddTransaction = async () => {
    if (!bill || !payer || !amount) return;
    
    const user = users.find((u) => u.id === payer)?.name;
    if (!user) return;

    const res = await insertBillTransaction(
      bill.id,
      user,
      note,
      Number(amount)
    );

    if (res) {
      fetchTransactions(bill.id);
      setModalVisible(false);
      setAmount("");
      setNote("");
      setPayer(null);
    }
  };

  const calculateSplit = () => {
    if (!bill || transactions.length === 0) return;

    // 1. Calculate Balances
    const balances: { [key: string]: number } = {};
    const billUsers = JSON.parse(bill.users) as number[];
    const userNames = billUsers.map(uid => users.find(u => u.id === uid)?.name).filter(Boolean) as string[];

    // Initialize with 0
    userNames.forEach(name => balances[name] = 0);

    let totalAmount = 0;
    transactions.forEach(tx => {
      totalAmount += tx.amount;
      balances[tx.user] = (balances[tx.user] || 0) + tx.amount;
    });

    const splitAmount = totalAmount / userNames.length;

    // Adjust balances: + means paid more than share (receive), - means paid less (owe)
    userNames.forEach(name => {
      balances[name] -= splitAmount;
    });

    // 2. Greedy Algorithm to Minimize Transactions
    const debtors: { name: string; amount: number }[] = [];
    const creditors: { name: string; amount: number }[] = [];

    Object.entries(balances).forEach(([name, amount]) => {
      if (amount < -0.01) debtors.push({ name, amount: -amount }); // Owe money
      if (amount > 0.01) creditors.push({ name, amount }); // Receive money
    });

    const results: string[] = [];

    let i = 0; // debtors index
    let j = 0; // creditors index

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const amount = Math.min(debtor.amount, creditor.amount);
      
      results.push(`${debtor.name} pays ${creditor.name} $${amount.toFixed(2)}`);

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    setSplitResult(results);
  };

  if (!bill) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <Text className="text-white">Loading...</Text>
      </SafeAreaView>
    );
  }

  const dropdownItems = JSON.parse(bill.users).map((uid: number) => {
    const user = users.find(u => u.id === uid);
    return { label: user?.name || "Unknown", value: uid };
  });

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="w-full h-16 bg-[#121317] flex-row items-center px-6 justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-2"
        >
          <AntDesign name="left" size={24} color="white" />
          <Text className="text-white font-semibold text-lg">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/stack/bill/billform",
              params: { mode: "update", bill: JSON.stringify(bill) },
            })
          }
        >
          <Feather name="edit-2" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Summary Section */}
      <View className="p-4 py-8 flex-row items-center justify-center">
         <View className="items-center">
          <Text className="text-gray-400 text-lg uppercase tracking-widest mb-2">Total Expenses</Text>
          <Text className="text-white text-5xl font-light">
            ${totalAmount.toFixed(2)}
          </Text>
          <Text className="text-white text-2xl mt-4 font-semibold">{bill.title}</Text>
        </View>
      </View>

      <View className="px-4 py-2">
        <Text className="text-white text-lg font-semibold">Transactions</Text>
      </View>

      {/* Transactions List */}
      <GestureHandlerRootView className="flex-1">
        <ScrollView className="flex-1">
          {transactions.slice().reverse().map((tx, index) => (
             <View key={index} className="flex-row items-center justify-between p-4 border-b border-[#222]">
              <View className="flex-row items-center gap-4">
                 <View className="w-10 h-10 rounded-full bg-[#121317] items-center justify-center">
                    <Text className="text-white font-bold">{tx.user.charAt(0)}</Text>
                 </View>
                 <View>
                    <Text className="text-white text-lg font-medium">{tx.user}</Text>
                    {tx.note ? <Text className="text-gray-500 text-sm">{tx.note}</Text> : null}
                 </View>
              </View>
              <Text className="text-white text-lg font-light">${tx.amount.toFixed(2)}</Text>
            </View>
          ))}
          {
            transactions.length === 0 && (
                <Text className="text-gray-500 text-center mt-10">No transactions recorded</Text>
            )
          }

          {/* Split Results Display */}
          {splitResult.length > 0 && (
            <View className="m-4 p-4 bg-[#1a1b20] rounded-xl border border-gray-800">
                <Text className="text-white text-xl font-bold mb-4 text-center">Settlement Plan</Text>
                {splitResult.map((res, index) => (
                <View key={index} className="flex-row items-center mb-3">
                    <View className="w-2 h-2 rounded-full bg-blue-500 mr-3" />
                    <Text className="text-gray-200 text-lg">{res}</Text>
                </View>
                ))}
            </View>
           )}
        </ScrollView>
      </GestureHandlerRootView>

      {/* Bottom Action Bar */}
      <View className="w-full bg-[#121317] flex-row justify-between overflow-visible h-14 items-end rounded-t-2xl px-4 pb-2 pt-2">
        <TouchableOpacity
          className="flex-1 h-full justify-center items-center bg-[#1e1f23] rounded-lg mr-2"
          onPress={() => setModalVisible(true)}
        >
             <Text className="text-white font-semibold">Add Expense</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="flex-1 h-full justify-center items-center bg-blue-600 rounded-lg ml-2"
          onPress={calculateSplit}
        >
             <Text className="text-white font-semibold">Split Bill</Text>
        </TouchableOpacity>
      </View>

      {/* Add Transaction Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end">
          <TouchableOpacity 
            className="flex-1 bg-black/50" 
            activeOpacity={1} 
            onPress={() => setModalVisible(false)}
          />
          <View className="bg-[#121317] p-6 rounded-t-3xl border-t border-gray-800">
            <Text className="text-white text-2xl font-bold mb-6 text-center">New Expense</Text>
            
            <Text className="text-gray-400 mb-2 ml-1">Paid By</Text>
            <View className="z-50 mb-4">
              <DropDownPicker
                open={open}
                value={payer}
                items={dropdownItems}
                setOpen={setOpen}
                setValue={setPayer}
                theme="DARK"
                style={{ backgroundColor: "black", borderColor: "#333" }}
                textStyle={{ color: "white" }}
                dropDownContainerStyle={{ backgroundColor: "#121317", borderColor: "#333" }}
                placeholder="Select Payer"
              />
            </View>

            <Text className="text-gray-400 mb-2 ml-1">Amount</Text>
            <TextInput
              className="bg-black text-white p-4 rounded-lg mb-4 text-xl border border-gray-800"
              placeholder="$0.00"
              placeholderTextColor="#555"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <Text className="text-gray-400 mb-2 ml-1">Note (Optional)</Text>
            <TextInput
              className="bg-black text-white p-4 rounded-lg mb-8 border border-gray-800"
              placeholder="What was this for?"
              placeholderTextColor="#555"
              value={note}
              onChangeText={setNote}
            />

            <TouchableOpacity 
              className="bg-blue-600 p-4 rounded-xl items-center"
              onPress={handleAddTransaction}
            >
              <Text className="text-white text-lg font-bold">Add Transaction</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
