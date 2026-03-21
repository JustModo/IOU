import { Linking } from "react-native";
import { APP_VERSION, APP_NAME, GITHUB_API_LATEST_RELEASE, GITHUB_RELEASE_URL_BASE } from "@/constants";
import { appAlert } from "@/services/alertService";

export const checkForUpdates = async (silent = true) => {
  try {
    const res = await fetch(GITHUB_API_LATEST_RELEASE);
    
    if (!res.ok) {
        if (!silent) appAlert("Error", "Failed to check for updates.");
        return false;
    }

    const data = await res.json();
    
    if (data.name || data.tag_name) {
      const latestVersion = data.tag_name?.replace('v', '');
      const currentVersion = APP_VERSION.replace('v', '');
      
      const isNewer = () => {
        if (!latestVersion) return false;
        const lParts = latestVersion.split('.').map(Number);
        const cParts = currentVersion.split('.').map(Number);
        for (let i = 0; i < Math.max(lParts.length, cParts.length); i++) {
          const l = lParts[i] || 0;
          const c = cParts[i] || 0;
          if (l > c) return true;
          if (l < c) return false;
        }
        return false;
      };

      if (isNewer()) {
        appAlert(
          "Update Available",
          `A newer version of ${APP_NAME} is now available.\n\nCurrent Version: ${currentVersion}\nLatest Version: ${latestVersion}\n\nWould you like to download the update?`,
          [
            { text: "Later", style: "cancel" },
            { 
              text: "Download", 
              onPress: () => Linking.openURL(`${GITHUB_RELEASE_URL_BASE}${data.tag_name}`)
            }
          ]
        );
        return true;
      } else if (!silent) {
        appAlert("Up to Date", "You are already on the latest version.");
      }
    }
  } catch (e) {
    if (!silent) {
      appAlert("Error", "Failed to check for updates.");
    }
    console.error("Update check failed", e);
  }
  return false;
};
