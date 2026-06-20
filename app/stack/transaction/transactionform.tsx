import React, { useEffect, useRef, useState } from "react";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  Pressable,
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

  const [amountText, setAmountText] = useState("");
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
      setAmountText(Math.abs(parsedTransaction.amount).toString());
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
    const parsedAmount = amountText.trim() === "" ? 0 : parseFloat(amountText);
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
    const parsedAmount = amountText.trim() === "" ? 0 : parseFloat(amountText);
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
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-2 active:bg-muted"
        >
          <AntDesign name="left" size={24} color={COLORS.foreground} />
          <Text className="text-foreground font-semibold text-[15px]">Back</Text>
        </Pressable>
        {mode === "update" && (
            <Pressable onPress={handleDelete} className="p-2 active:bg-muted">
            <Feather name="trash-2" size={20} color={COLORS.destructive} />
            </Pressable>
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

          <View className="w-full h-[100px] flex-row items-center justify-center border-b border-border pb-6 mb-6">
            <Text className="text-foreground font-light text-4xl mr-2 mb-1">₹</Text>
            <TextInput
              ref={amountInputRef}
              className="text-foreground font-bold text-6xl bg-transparent min-w-[50%] text-center"
              style={{ paddingVertical: 0, margin: 0, includeFontPadding: false }}
              placeholderTextColor={COLORS.input}
              keyboardType="decimal-pad"
              placeholder="0"
              maxLength={amountText.includes(".") ? amountText.indexOf(".") + 3 : 10}
              autoFocus
              value={amountText}
              onChangeText={(text) => {
                // Remove anything that is not a number or dot
                let cleaned = text.replace(/[^0-9.]/g, "");
                
                // Prevent multiple dots
                const parts = cleaned.split(".");
                if (parts.length > 2) {
                  cleaned = parts[0] + "." + parts.slice(1).join("");
                }
                
                // Limit to 2 decimal places
                const newParts = cleaned.split(".");
                if (newParts[1] && newParts[1].length > 2) {
                  cleaned = `${newParts[0]}.${newParts[1].slice(0, 2)}`;
                }
                
                setAmountText(cleaned);
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
        </ScrollView>

        {/* Save Button */}
        <View className="p-4 border-t border-border bg-background">
          <Pressable
            className="w-full p-4 bg-card rounded-lg active:bg-muted"
            onPress={mode === "insert" ? handleInsert : handleUpdate}
            disabled={amountText.trim() === "" || parseFloat(amountText) === 0}
          >
            <Text
              className="text-foreground text-xl text-center font-semibold"
              style={{
                color:
                  amountText.trim() !== "" && parseFloat(amountText) > 0
                    ? COLORS.foreground
                    : COLORS.mutedForeground,
              }}
            >
              {mode === "insert" ? "Save" : "Update"}
            </Text>
          </Pressable>
        </View>
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
