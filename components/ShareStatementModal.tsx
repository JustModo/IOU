import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { User } from "@/types/user";
import { IOUTransaction } from "@/types/transaction";
import { COLORS } from "@/constants";
import { formatAmount, getAmountStatus } from "@/utils";

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatShortDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function labelForType(type: string): string {
  switch (type) {
    case "oweme": return "Lent";
    case "oweyou": return "Borrowed";
    case "repay": return "Collected";
    case "repaid": return "Repaid";
    default: return type;
  }
}

// ─── types ────────────────────────────────────────────────────────────────────

type Props = {
  visible: boolean;
  user: User;
  transactions: IOUTransaction[];
  onClose: () => void;
};

// ─── card ────────────────────────────────────────────────────────────────────
// NOTE: The StatementCard is captured by react-native-view-shot as an image.
// NativeWind className works fine here — the styles are compiled to native
// StyleSheet calls which view-shot reads from the native layer directly.
// Only truly dynamic runtime colors (amount positive/negative) stay as inline style.

function StatementCard({
  user,
  transactions,
  cardRef,
}: {
  user: User;
  transactions: IOUTransaction[];
  cardRef: React.RefObject<View | null>;
}) {
  const status = getAmountStatus(user.amount);
  const { display } = formatAmount(user.amount);

  const amountColor =
    status === "positive"
      ? COLORS.success
      : status === "negative"
        ? COLORS.destructiveStrong
        : COLORS.mutedForeground;

  const amountLabel =
    status === "positive"
      ? `${user.name} owes you`
      : status === "negative"
        ? `You owe ${user.name}`
        : "Settled up";

  // Find the minimal set of most-recent transactions that sum to the current balance.
  // Walk newest-first; stop as soon as the running sum matches the total (with a
  // floating-point tolerance). This way a full repayment "wipes out" older entries
  // and the statement only shows what is genuinely still open.
  const buildRelevantRows = (): IOUTransaction[] => {
    const total = parseFloat(user.amount.toFixed(2));
    const newestFirst = [...transactions].reverse();
    const result: IOUTransaction[] = [];
    let running = 0;

    for (const tx of newestFirst) {
      result.push(tx);
      running = parseFloat((running + tx.amount).toFixed(2));
      if (Math.abs(running - total) < 0.005) break;
    }
    return result;
  };

  const rows = buildRelevantRows();

  return (
    <View
      ref={cardRef}
      collapsable={false}
      className="bg-background border border-border w-full max-w-[360px]"
    >
      {/* Card header */}
      <View className="bg-muted px-5 py-4 border-b border-border flex-row items-center justify-between">
        <View>
          <Text className="text-muted-foreground text-[10px] tracking-widest uppercase">
            IOU Statement
          </Text>
          <Text className="text-foreground text-[22px] font-bold mt-0.5" numberOfLines={1}>
            {user.name}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-subtle text-[11px]">{amountLabel}</Text>
          <Text className="text-[24px] font-light mt-0.5" style={{ color: amountColor }}>
            {display}
          </Text>
        </View>
      </View>

      {/* Transaction rows */}
      {rows.map((tx, i) => {
        const txStatus = getAmountStatus(tx.amount);
        const txColor =
          txStatus === "positive"
            ? COLORS.success
            : txStatus === "negative"
              ? COLORS.destructiveStrong
              : COLORS.mutedForeground;
        const { display: txDisplay } = formatAmount(tx.amount);

        return (
          <View
            key={tx.id}
            className="flex-row items-center justify-between px-5 py-3 border-b border-border"
            style={{ backgroundColor: i % 2 === 0 ? COLORS.background : COLORS.muted }}
          >
            <View className="flex-1 mr-3">
              <Text className="text-foreground text-[13px] font-medium" numberOfLines={1}>
                {tx.note !== "" ? tx.note : "No Note"}
              </Text>
              <Text className="text-subtle text-[11px] mt-0.5">
                {labelForType(tx.type)} · {formatShortDate(tx.date)}
              </Text>
            </View>
            <Text className="text-[14px] font-semibold" style={{ color: txColor }}>
              {txDisplay}
            </Text>
          </View>
        );
      })}

      {/* Card footer */}
      <View className="px-5 py-3 flex-row items-center justify-between">
        <Text className="text-subtle text-[10px] tracking-widest uppercase">
          Generated with IOU
        </Text>
        <Text className="text-border text-[10px]">
          {new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
      </View>
    </View>
  );
}

// ─── modal ───────────────────────────────────────────────────────────────────

export default function ShareStatementModal({
  visible,
  user,
  transactions,
  onClose,
}: Props) {
  const cardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      setSharing(true);
      const uri = await captureRef(cardRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: `IOU Statement – ${user.name}`,
      });
    } catch (err) {
      console.error("Share failed:", err);
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-background">
        {/* Modal header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-border">
          <Text className="text-foreground text-[17px] font-semibold">
            Statement Preview
          </Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <Ionicons name="close" size={24} color={COLORS.foreground} />
          </Pressable>
        </View>

        {/* Scrollable preview */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingVertical: 24, paddingHorizontal: 16 }}
        >
          <View className="items-center">
            <StatementCard
              user={user}
              transactions={transactions}
              cardRef={cardRef}
            />
          </View>
        </ScrollView>

        {/* Share button */}
        <View className="p-4 border-t border-border bg-background">
          <Pressable
            onPress={handleShare}
            disabled={sharing}
            className="w-full p-4 bg-card rounded-lg active:bg-muted"
            style={({ pressed }) => ({ opacity: pressed || sharing ? 0.6 : 1 })}
          >
            <View className="flex-row items-center justify-center gap-4">
              {sharing ? (
                <ActivityIndicator color={COLORS.foreground} size="small" />
              ) : (
                <Feather name="share" size={18} color={COLORS.foreground} />
              )}
              <Text className="text-foreground text-xl text-center font-semibold">
                {sharing ? "Preparing…" : "Share as Image"}
              </Text>
            </View>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
