import React, { useState, useEffect } from "react";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import { useDB } from "@/context/DBContext";
import { Bill } from "@/types/bill";

export default function BillForm() {
  const router = useRouter();
  const { users, insertBill, updateBill } = useDB();
  const { mode, bill } = useLocalSearchParams();

  const isUpdate = mode === "update";
  const billData: Bill | null = bill ? JSON.parse(bill as string) : null;

  const [billName, setBillName] = useState(isUpdate ? billData?.title || "" : "");
  const [selectedUsers, setSelectedUsers] = useState<number[]>(
    isUpdate && billData ? JSON.parse(billData.users) : []
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isUpdate && billData) {
      setBillName(billData.title);
      setSelectedUsers(JSON.parse(billData.users));
    }
  }, [mode, bill]);

  const handleSave = async () => {
    if (!billName || selectedUsers.length === 0) return;
    
    const userstring = JSON.stringify(selectedUsers);
    let res = false;

    if (isUpdate && billData) {
      res = await updateBill(billData.id, billName, userstring);
    } else {
      res = await insertBill(billName, userstring);
    }

    if (res) router.back();
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (open) setOpen(false);
      }}
    >
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
        </View>

        <View className="flex-1 bg-black items-center justify-center px-8 gap-12">
          <Text className="text-white font-light text-6xl text-center">
            {isUpdate ? "Edit Bill" : "Create Bill"}
          </Text>

          {/* Input Section */}
          <View className="w-full flex gap-4">
            {/* Bill Name */}
            <View className="w-full">
              <Text className="text-white font-semibold mb-2 px-2">
                Bill Name
              </Text>
              <TextInput
                className="w-full p-4 bg-[#121317] text-white rounded-lg text-lg"
                placeholder="Enter bill name"
                placeholderTextColor="gray"
                value={billName}
                onChangeText={setBillName}
              />
            </View>

            {/* Multi-Select Users */}
            <View className="w-full">
              <Text className="text-white font-semibold mb-2 px-2">
                Select Users
              </Text>
              <DropDownPicker
                open={open}
                value={selectedUsers}
                setOpen={setOpen}
                setValue={setSelectedUsers}
                multiple={true}
                min={1}
                items={
                  users?.map((user) => ({
                    label: user.name,
                    value: user.id,
                  })) || []
                }
                containerStyle={{ height: 50 }}
                style={{ backgroundColor: "#121317", borderWidth: 0 }}
                dropDownContainerStyle={{
                  backgroundColor: "#121317",
                  borderWidth: 0,
                }}
                labelStyle={{ color: "#fff" }}
                textStyle={{ color: "#fff" }}
                theme="DARK"
                TickIconComponent={() => (
                  <Feather name="check" size={20} color="white" />
                )}
                placeholder="Select Users"
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className="w-full p-4 bg-[#121317] rounded-lg"
            onPress={handleSave}
          >
            <Text className="text-white text-xl text-center font-semibold">
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
