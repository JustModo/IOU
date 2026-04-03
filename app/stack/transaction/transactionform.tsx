import React, { useEffect, useRef, useState } from "react";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import { useDB } from "@/context/DBContext";
import { TransactionType } from "@/types/utils";
import { IOUTransaction } from "@/types/transaction";
import ConfirmModal from "@/components/ConfirmModal";
import { TRANSACTION_TYPE_MAP, normalizeTransactionAmount } from "@/utils";
import { COLORS } from "@/constants";

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
    <SafeAreaView className="bg-background flex-1">
      {/* Header */}
      <View className="w-full h-16 bg-background border-b border-border flex-row items-center px-4 justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-2"
        >
          <AntDesign name="left" size={24} color={COLORS.foreground} />
          <Text className="text-foreground font-semibold text-[15px]">Back</Text>
        </TouchableOpacity>
        {mode === "update" && (
            <TouchableOpacity onPress={handleDelete} className="p-2">
            <Feather name="trash-2" size={20} color={COLORS.destructive} />
            </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1 bg-background"
          contentContainerStyle={{
            paddingTop: 32,
            paddingBottom: 24,
            paddingHorizontal: 16,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-foreground text-[28px] font-bold tracking-widest uppercase mb-12 text-center">
            {setting.title}
          </Text>

          <View className="w-full flex-row items-center justify-center border-b border-border pb-6 mb-6">
            <Text className="text-foreground text-6xl">₹</Text>
            <TextInput
              ref={amountInputRef}
              className="text-foreground text-center text-6xl bg-transparent min-w-[120px]"
              placeholderTextColor={COLORS.input}
              keyboardType="decimal-pad"
              placeholder="0"
              maxLength={6}
              autoFocus
              defaultValue={amountRef.current}
              onChangeText={(text) => {
                amountRef.current = text;
              }}
            />
          </View>

          {selectedType !== "repay" && selectedType !== "repaid" && (
            <View className="w-full mt-2 flex-row items-center border-b border-border py-2">
              <Text className="text-subtle font-bold tracking-widest uppercase text-xs w-20">Note</Text>
              <TextInput
                className="flex-1 text-foreground text-[16px] py-2"
                placeholder="What was this for?"
                placeholderTextColor={COLORS.subtle}
                value={note}
                onChangeText={setNote}
              />
            </View>
          )}

          {mode === "update" && (
            <View
              className="w-full mt-6"
              style={{ zIndex: 2000, marginBottom: open ? 180 : 0 }}
            >
              <Text className="text-subtle font-bold tracking-widest uppercase text-xs mb-3">
                Transaction Type
              </Text>
              <DropDownPicker
                open={open}
                value={selectedType}
                setOpen={setOpen}
                setValue={setSelectedType}
                items={[
                  { label: "Lend", value: "oweme" },
                  { label: "Borrow", value: "oweyou" },
                  { label: "Collect", value: "repay" },
                  { label: "Repay", value: "repaid" },
                ]}
                containerStyle={{ height: 50 }}
                style={{
                  backgroundColor: COLORS.background,
                  borderColor: COLORS.border,
                  borderWidth: 1,
                  borderRadius: 0,
                }}
                dropDownContainerStyle={{
                  backgroundColor: COLORS.background,
                  borderColor: COLORS.border,
                  borderWidth: 1,
                  borderRadius: 0,
                }}
                labelStyle={{ color: COLORS.foreground, fontSize: 15 }}
                textStyle={{ color: COLORS.foreground, fontSize: 15 }}
                listMode="SCROLLVIEW"
                placeholder="Select Transaction Type"
              />
            </View>
          )}

          <View className="w-full mt-10 pb-4" style={{ zIndex: 1 }}>
            <TouchableOpacity
              className="w-full py-4 border border-foreground items-center active:bg-muted"
              onPress={mode === "insert" ? handleInsert : handleUpdate}
            >
              <Text className="text-foreground text-[15px] text-center font-bold tracking-widest uppercase">
                {mode === "insert" ? "SAVE" : "UPDATE"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
