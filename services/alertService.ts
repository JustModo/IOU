import { AlertButton, Alert } from "react-native";

type AlertFnType = (title: string, message?: string, buttons?: AlertButton[]) => void;

let globalAlertRef: AlertFnType | null = null;

export const setGlobalAlert = (fn: AlertFnType) => {
  globalAlertRef = fn;
};

export const appAlert: AlertFnType = (title, message, buttons) => {
  if (globalAlertRef) {
    globalAlertRef(title, message, buttons);
  } else {
    // Fallback if provider isn't mounted yet
    Alert.alert(title, message, buttons);
  }
};
