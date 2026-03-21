import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

export async function pickAndSaveImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== "granted") {
    throw new Error("Permission to access gallery is required!");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images",
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const sourceUri = result.assets[0].uri;
  const imagesDir = `${FileSystem.documentDirectory}images/`;
  await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });

  const newPath = `${imagesDir}${Date.now()}.jpg`;
  await FileSystem.moveAsync({ from: sourceUri, to: newPath });

  return newPath;
}
