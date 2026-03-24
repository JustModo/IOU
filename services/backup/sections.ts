import * as FileSystem from "expo-file-system";
import {
  BackupData,
  BackupImageAsset,
  BackupSections,
} from "@/types/backup";

type BackupSectionHandler = {
  key: string;
  collect: (data: BackupData) => Promise<unknown>;
  applyOnRestore: (data: BackupData, sectionData: unknown) => Promise<BackupData>;
};

function extFromFileName(fileName: string): string {
  const clean = fileName.split("?")[0];
  const idx = clean.lastIndexOf(".");
  if (idx === -1) return "jpg";
  const ext = clean.slice(idx + 1).toLowerCase();
  return ext || "jpg";
}

function mimeTypeFromExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "jpeg":
    case "jpg":
    default:
      return "image/jpeg";
  }
}

async function buildProfilePictures(
  users: BackupData["users"]
): Promise<Record<string, BackupImageAsset>> {
  const profilePictures: Record<string, BackupImageAsset> = {};

  for (const user of users) {
    if (!user.pfp) continue;

    try {
      const info = await FileSystem.getInfoAsync(user.pfp);
      if (!info.exists) continue;

      const ext = extFromFileName(user.pfp);
      const dataBase64 = await FileSystem.readAsStringAsync(user.pfp, {
        encoding: FileSystem.EncodingType.Base64,
      });

      profilePictures[String(user.id)] = {
        fileName: `user_${user.id}.${ext}`,
        mimeType: mimeTypeFromExt(ext),
        dataBase64,
      };
    } catch {
      continue;
    }
  }

  return profilePictures;
}

async function restoreProfilePictures(
  users: BackupData["users"],
  profilePictures: Record<string, BackupImageAsset>
): Promise<BackupData["users"]> {
  if (!Object.keys(profilePictures).length) {
    return users;
  }

  const imagesDir = `${FileSystem.documentDirectory}images/`;
  await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });

  const restoredUsers = await Promise.all(
    users.map(async (user) => {
      const imageAsset = profilePictures[String(user.id)];
      if (!imageAsset?.dataBase64) return user;

      try {
        const ext = extFromFileName(imageAsset.fileName);
        const targetPath = `${imagesDir}restored_${user.id}_${Date.now()}.${ext}`;
        await FileSystem.writeAsStringAsync(targetPath, imageAsset.dataBase64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        return { ...user, pfp: targetPath };
      } catch {
        return user;
      }
    })
  );

  return restoredUsers;
}

function toProfilePicturesMap(
  sectionData: unknown
): Record<string, BackupImageAsset> {
  if (!sectionData || typeof sectionData !== "object") return {};
  return sectionData as Record<string, BackupImageAsset>;
}

const BACKUP_SECTION_HANDLERS: BackupSectionHandler[] = [
  {
    key: "profilePictures",
    collect: async (data) => buildProfilePictures(data.users),
    applyOnRestore: async (data, sectionData) => {
      const restoredUsers = await restoreProfilePictures(
        data.users,
        toProfilePicturesMap(sectionData)
      );
      return { ...data, users: restoredUsers };
    },
  },
];

export async function collectSections(data: BackupData): Promise<BackupSections> {
  const sections: BackupSections = {};
  for (const handler of BACKUP_SECTION_HANDLERS) {
    sections[handler.key] = await handler.collect(data);
  }
  return sections;
}

export async function applySectionsOnRestore(
  data: BackupData,
  sections: BackupSections
): Promise<BackupData> {
  let nextData = data;
  for (const handler of BACKUP_SECTION_HANDLERS) {
    nextData = await handler.applyOnRestore(nextData, sections[handler.key]);
  }
  return nextData;
}
