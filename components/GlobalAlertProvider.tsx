import React, { useEffect, useState } from "react";
import ConfirmModal from "./ConfirmModal";
import { setGlobalAlert } from "@/services/alertService";
import { AlertButton } from "react-native";

export function GlobalAlertProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<any>({
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "OK",
    variant: "default",
    isAlert: true,
  });

  const showAlert = (title: string, message: string = "", buttons?: AlertButton[]) => {
    let confirmText = "OK";
    let cancelText = undefined;
    let onConfirm = () => setVisible(false);
    let onCancel: (() => void) | undefined = undefined;
    let variant = "default";
    let isAlert = true;

    if (buttons && buttons.length > 0) {
      if (buttons.length === 1) {
        confirmText = buttons[0].text || "OK";
        onConfirm = () => {
          buttons[0].onPress?.();
          setVisible(false);
        };
        if (buttons[0].style === "destructive") variant = "danger";
      } else if (buttons.length >= 2) {
        isAlert = false;
        const cancelBtn = buttons.find((b) => b.style === "cancel") || buttons[0];
        const confirmBtn = buttons.find((b) => b !== cancelBtn) || buttons[1];

        cancelText = cancelBtn.text;
        onCancel = () => {
          cancelBtn.onPress?.();
          setVisible(false);
        };

        confirmText = confirmBtn.text || "Confirm";
        onConfirm = () => {
          confirmBtn.onPress?.();
          setVisible(false);
        };
        if (confirmBtn.style === "destructive") variant = "danger";
      }
    }

    setConfig({
      title,
      message,
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
      variant,
      isAlert,
    });
    setVisible(true);
  };

  useEffect(() => {
    setGlobalAlert(showAlert);
  }, []);

  return (
    <>
      {children}
      <ConfirmModal
        visible={visible}
        title={config.title}
        message={config.message}
        onConfirm={config.onConfirm}
        onCancel={config.onCancel || (() => setVisible(false))}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        variant={config.variant}
        isAlert={config.isAlert}
      />
    </>
  );
}
