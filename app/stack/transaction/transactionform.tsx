import React, { useEffect, useRef, useState } from "react";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import { useDB } from "@/context/DBContext";
import { TransactionType } from "@/types/utils";
import { IOUTransaction } from "@/types/transaction";
import ConfirmModal from "@/components/ConfirmModal";

export default function AddTransaction() {
  const router = useRouter();
  const { id, mode, type, transaction } = useLocalSearchParams() as {
    id: string;
    type: TransactionType;
    mode: "insert" | "update";
    transaction?: string;
  };

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [selectedType, setSelectedType] = useState<TransactionType>("repay");
  const [open, setOpen] = useState(false);
  const [transactionId, setTransactionId] = useState(0);
  const amountInputRef = useRef<TextInput | null>(null);
  
  // Confirm Modal State
  const [confirmVisible, setConfirmVisible] = useState(false);

  const { insertIouTransaction, updateIouTransaction, deleteIouTransaction } =
    useDB();

  useEffect(() => {
    if (mode === "update" && transaction) {
      const parsedTransaction: IOUTransaction = JSON.parse(transaction);
      setAmount(Math.abs(parsedTransaction.amount).toString());
      setTransactionId(parsedTransaction.id);
      setNote(parsedTransaction.note);
      setSelectedType(parsedTransaction.type as TransactionType);
      if (parsedTransaction.type === "repay") setNote("Repaid");
    } else {
      setSelectedType(type);
    }
  }, [mode, transaction, id, type]);

  const mapping: Record<TransactionType, { title: string; mul: number }> = {
    oweme: { title: "You Owe Me", mul: 1 },
    oweyou: { title: "I Owe You", mul: -1 },
    repay: { title: "Repay", mul: -1 },
  };

  const setting = mapping[selectedType];

  const handleInsert = async () => {
    if (!id || Array.isArray(id)) {
      return;
    }
    const parsedID = parseInt(id, 10);
    const parsedAmount = amount.trim() === "" ? 0 : parseFloat(amount);
    const updatedNote = selectedType === "repay" ? "Repaid" : note;
    const res = await insertIouTransaction(
      parsedID,
      updatedNote,
      parsedAmount * setting.mul,
      selectedType
    );
    if (res) router.back();
  };

  const handleUpdate = async () => {
    if (!id || Array.isArray(id)) {
      return;
    }
    const parsedAmount = amount.trim() === "" ? 0 : parseFloat(amount);
    const normalAmount = parsedAmount * setting.mul;
    const updatedNote = selectedType === "repay" ? "Repaid" : note;
    const res = await updateIouTransaction(
      transactionId,
      updatedNote,
      normalAmount,
      selectedType
    );
    if (res) router.back();
  };

  const handleDelete = () => {
    setConfirmVisible(true);
  };

  const confirmDelete = async () => {
      const res = await deleteIouTransaction(transactionId);
      if (res) router.back();
      setConfirmVisible(false);
  };

  return (
    <SafeAreaView className="bg-black flex-1">
      {/* Header */}
      <View className="w-full h-16 bg-[#121317] flex-row items-center px-6 justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-2"
        >
          <AntDesign name="left" size={24} color="white" />
          <Text className="text-white font-semibold text-lg">Back</Text>
        </TouchableOpacity>
        {mode === "update" && (
            <TouchableOpacity onPress={handleDelete}>
            <Feather name="trash-2" size={24} color="red" />
            </TouchableOpacity>
        )}
      </View>

      <View className="flex-1 bg-black items-center justify-center px-8 gap-12">
        <Text className="text-white font-light text-6xl text-center">
          {setting.title}
        </Text>

        {/* Input Section */}
        <View className="w-full flex gap-4">
          <View className="w-full flex-row items-center justify-center">
            <Text className="text-white text-7xl">₹</Text>
            <TextInput
              ref={amountInputRef}
              className="p-4 text-white rounded-lg text-center text-7xl bg-transparent min-w-[100]"
              placeholderTextColor="gray"
              keyboardType="numeric"
              placeholder="0"
              maxLength={6}
              autoFocus
              onChangeText={(text) => {
                if (/^\d*\.?\d{0,5}$/.test(text) && !/^0\d/.test(text)) {
                  setAmount(text);
                }
              }}
              value={amount}
            />
          </View>

          {selectedType !== "repay" && (
            <View className="w-full">
              <Text className="text-white font-semibold mb-2 px-2">Notes</Text>
              <TextInput
                className="w-full p-4 bg-[#121317] text-white rounded-lg text-lg"
                placeholder="Enter notes"
                placeholderTextColor="gray"
                value={note}
                onChangeText={setNote}
              />
            </View>
          )}

          {/* Transaction Type Dropdown (Only in Update Mode) */}
          {mode === "update" && (
            <View className="w-full">
              <Text className="text-white font-semibold mb-2 px-2">
                Transaction Type
              </Text>
              <DropDownPicker
                open={open}
                value={selectedType}
                setOpen={setOpen}
                setValue={setSelectedType}
                items={[
                  { label: "You Owe Me", value: "oweme" },
                  { label: "I Owe You", value: "oweyou" },
                  { label: "Repay", value: "repay" },
                ]}
                containerStyle={{ height: 50 }}
                style={{ backgroundColor: "#121317", borderWidth: 0 }}
                dropDownContainerStyle={{
                  backgroundColor: "#121317",
                  borderWidth: 0,
                }}
                labelStyle={{ color: "#fff" }}
                textStyle={{ color: "#fff" }}
                placeholder="Select Transaction Type"
              />
            </View>
          )}
        </View>

        {/* Save / Update Button */}
        <TouchableOpacity
          className="w-full p-4 bg-[#121317] rounded-lg"
          onPress={mode === "insert" ? handleInsert : handleUpdate}
        >
          <Text className="text-white text-xl text-center font-semibold">
            {mode === "insert" ? "Save" : "Update"}
          </Text>
        </TouchableOpacity>
      </View>

      <ConfirmModal
        visible={confirmVisible}
        title="Delete Transaction"
        message="Are you sure you want to delete this IOU transaction?"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmVisible(false)}
        confirmText="Delete"
        variant="danger"
      />
    </SafeAreaView>
  );
}
