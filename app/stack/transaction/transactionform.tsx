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
import { TRANSACTION_TYPE_MAP, normalizeTransactionAmount } from "@/utils";

export default function AddTransaction() {
  const router = useRouter();
  const { id, mode, type, transaction } = useLocalSearchParams() as {
    id: string;
    type: TransactionType;
    mode: "insert" | "update";
    transaction?: string;
  };

  const amountRef = useRef("");
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
      amountRef.current = Math.abs(parsedTransaction.amount).toString();
      setTransactionId(parsedTransaction.id);
      setNote(parsedTransaction.note);
      setSelectedType(parsedTransaction.type as TransactionType);
      if (parsedTransaction.type === "repay" || parsedTransaction.type === "repaid") setNote("Repaid");
    } else {
      setSelectedType(type);
    }
  }, [mode, transaction, id, type]);

  const setting = TRANSACTION_TYPE_MAP[selectedType];

  const handleInsert = async () => {
    if (!id || Array.isArray(id)) {
      return;
    }
    const parsedID = parseInt(id, 10);
    const parsedAmount = amountRef.current.trim() === "" ? 0 : parseFloat(amountRef.current);
    const updatedNote = selectedType === "repay" || selectedType === "repaid" ? "Repaid" : note;
    const res = await insertIouTransaction(
      parsedID,
      updatedNote,
      normalizeTransactionAmount(parsedAmount, selectedType),
      selectedType
    );
    if (res) router.back();
  };

  const handleUpdate = async () => {
    if (!id || Array.isArray(id)) {
      return;
    }
    const parsedAmount = amountRef.current.trim() === "" ? 0 : parseFloat(amountRef.current);
    const normalAmount = normalizeTransactionAmount(parsedAmount, selectedType);
    const updatedNote = selectedType === "repay" || selectedType === "repaid" ? "Repaid" : note;
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
      <View className="w-full h-16 bg-black border-b border-[#222] flex-row items-center px-4 justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-2"
        >
          <AntDesign name="left" size={24} color="white" />
          <Text className="text-white font-semibold text-[15px]">Back</Text>
        </TouchableOpacity>
        {mode === "update" && (
            <TouchableOpacity onPress={handleDelete} className="p-2">
            <Feather name="trash-2" size={20} color="#ff4444" />
            </TouchableOpacity>
        )}
      </View>

      <View className="flex-1 bg-black items-center justify-start pt-8 pb-4 px-4">
        <Text className="text-white text-[28px] font-bold tracking-widest uppercase mb-12">
          {setting.title}
        </Text>

        {/* Input Section */}
        <View className="w-full flex-1">
          <View className="w-full flex-row items-center justify-center border-b border-[#222] pb-6 mb-6">
            <Text className="text-white text-6xl">₹</Text>
            <TextInput
              ref={amountInputRef}
              className="text-white text-center text-6xl bg-transparent min-w-[120px]"
              placeholderTextColor="#333"
              keyboardType="decimal-pad"
              placeholder="0"
              maxLength={6}
              autoFocus
              defaultValue={amountRef.current}
              onChangeText={(text) => { amountRef.current = text; }}
            />
          </View>

          {selectedType !== "repay" && selectedType !== "repaid" && (
            <View className="w-full mt-2 flex-row items-center border-b border-[#222] py-2">
              <Text className="text-gray-500 font-bold tracking-widest uppercase text-xs w-20">Note</Text>
              <TextInput
                className="flex-1 text-white text-[16px] py-2"
                placeholder="What was this for?"
                placeholderTextColor="#666"
                value={note}
                onChangeText={setNote}
              />
            </View>
          )}

          {/* Transaction Type Dropdown (Only in Update Mode) */}
          {mode === "update" && (
            <View className="w-full mt-6">
              <Text className="text-gray-500 font-bold tracking-widest uppercase text-xs mb-3">
                Transaction Type
              </Text>
              <DropDownPicker
                open={open}
                value={selectedType}
                setOpen={setOpen}
                setValue={setSelectedType}
                items={[
                  { label: "Lent", value: "oweme" },
                  { label: "Borrowed", value: "oweyou" },
                  { label: "Got Back", value: "repay" },
                  { label: "Paid Back", value: "repaid" },
                ]}
                containerStyle={{ height: 50 }}
                style={{ backgroundColor: "black", borderColor: "#222", borderWidth: 1, borderRadius: 0 }}
                dropDownContainerStyle={{
                  backgroundColor: "black",
                  borderColor: "#222",
                  borderWidth: 1,
                  borderRadius: 0,
                }}
                labelStyle={{ color: "#fff", fontSize: 15 }}
                textStyle={{ color: "#fff", fontSize: 15 }}
                placeholder="Select Transaction Type"
              />
            </View>
          )}

          <View className="flex-1 justify-end pb-8">
            <TouchableOpacity
              className="w-full py-4 border border-white items-center active:bg-[#111]"
              onPress={mode === "insert" ? handleInsert : handleUpdate}
            >
              <Text className="text-white text-[15px] text-center font-bold tracking-widest uppercase">
                {mode === "insert" ? "SAVE" : "UPDATE"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
