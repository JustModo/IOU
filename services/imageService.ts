import * as ImagePicker from "expo-image-picker";
import { File, Directory, Paths } from "expo-file-system";

export async function pickAndSaveImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== "granted") {
    throw new Error("Permission to access gallery is required!");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const sourceUri = result.assets[0].uri;
  const imagesDir = new Directory(Paths.document, "images");
  imagesDir.create({ intermediates: true, idempotent: true });

  const newFile = new File(imagesDir, `${Date.now()}.jpg`);
  const sourceFile = new File(sourceUri);
  sourceFile.move(newFile);

  return newFile.uri;
}
