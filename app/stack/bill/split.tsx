import React, { useEffect, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Share } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useDB } from "@/context/DBContext";
import { AntDesign, Feather } from "@expo/vector-icons";
import { Bill } from "@/types/bill";

export default function SplitScreen() {
  const router = useRouter();
  const { billId } = useLocalSearchParams();
  const { bills, users, getBillTransactions } = useDB();
  
  const [bill, setBill] = useState<Bill | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (billId) {
      const foundBill = bills.find((b) => b.id === Number(billId));
      if (foundBill) {
        setBill(foundBill);
        const fetchTx = async () => {
            const txs = await getBillTransactions(Number(billId));
            setTransactions(txs);
            setLoading(false);
        };
        fetchTx();
      }
    }
  }, [billId, bills, getBillTransactions]);

  const splitResult = useMemo(() => {
    if (!bill || transactions.length === 0) return [];

    const balances: { [key: string]: number } = {};
    const billUsers = JSON.parse(bill.users) as number[];
    const userNames = billUsers.map(uid => users.find(u => u.id === uid)?.name).filter(Boolean) as string[];

    userNames.forEach(name => balances[name] = 0);

    let totalAmount = 0;
    transactions.forEach(tx => {
      totalAmount += tx.amount;
      balances[tx.user] = (balances[tx.user] || 0) + tx.amount;
    });

    const splitAmount = totalAmount / userNames.length;

    userNames.forEach(name => {
      balances[name] -= splitAmount;
    });

    const debtors: { name: string; amount: number }[] = [];
    const creditors: { name: string; amount: number }[] = [];

    Object.entries(balances).forEach(([name, amount]) => {
      if (amount < -0.01) debtors.push({ name, amount: -amount });
      if (amount > 0.01) creditors.push({ name, amount });
    });

    const results: { from: string; to: string; amount: string }[] = [];

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const amount = Math.min(debtor.amount, creditor.amount);
      
      results.push({
          from: debtor.name,
          to: creditor.name,
          amount: amount.toFixed(2)
      });

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    return results;
  }, [bill, transactions, users]);

  // Group results by 'from' user
  const groupedResults = useMemo(() => {
    const groups: { [key: string]: { to: string; amount: string }[] } = {};
    splitResult.forEach((res) => {
      if (!groups[res.from]) groups[res.from] = [];
      groups[res.from].push({ to: res.to, amount: res.amount });
    });
    return groups;
  }, [splitResult]);

  // Calculate contributions
  const contributions = useMemo(() => {
      const counts: {[key: string]: number} = {};
      transactions.forEach(tx => {
          counts[tx.user] = (counts[tx.user] || 0) + tx.amount;
      });
      return counts;
  }, [transactions]);

  const handleShare = async () => {
      if (!bill) return;
      
      let message = `*${bill.title} Settlement Plan*\n\n`;
      Object.entries(groupedResults).forEach(([debtor, payments]) => {
          message += `*${debtor}*\n`;
          payments.forEach(p => {
              message += `Pays ${p.to}: ${p.amount}\n`;
          });
          message += '\n';
      });

      try {
          await Share.share({
              message,
          });
      } catch (error) {
          console.error(error);
      }
  };

  if (loading || !bill) {
      return (
          <SafeAreaView className="flex-1 bg-black justify-center items-center">
              <Text className="text-white">Loading...</Text>
          </SafeAreaView>
      )
  }

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
        <TouchableOpacity onPress={handleShare}>
            <Feather name="share" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
       <Text className="text-white font-light text-right text-4xl py-4 pb-8">
            Settlement Plan
        </Text>
        
        {splitResult.length === 0 ? (
            <Text className="text-white text-center text-xl mt-10">All settled up!</Text>
        ) : (
            <View className="gap-8">
                {Object.entries(groupedResults).map(([debtor, payments], index) => (
                    <View key={index} className="gap-2">
                        <View className="flex-row justify-between items-end pl-2 pr-2">
                            <Text className="text-white text-2xl font-light">{debtor}</Text>
                            {contributions[debtor] ? (
                                <Text className="text-blue-400 text-sm">
                                    {contributions[debtor].toFixed(2)} Paid
                                </Text>
                            ) : null}
                        </View>
                        <View className="h-[1px] bg-[#333] w-full" />
                        {payments.map((payment, pIndex) => (
                            <View key={pIndex} className="flex-row justify-between items-center px-2 py-1">
                                <Text className="text-gray-400 text-lg">pays {payment.to}</Text>
                                <Text className="text-white text-xl font-light">{payment.amount}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
