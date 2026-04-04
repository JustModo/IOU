import notifee from "@notifee/react-native";

declare global {
  var __notifeeBackgroundHandlerRegistered: boolean | undefined;
}

if (!global.__notifeeBackgroundHandlerRegistered) {
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    // Intentionally keep this lightweight. This handler only exists so
    // Notifee can deliver background events without warning.
    if (__DEV__) {
      console.log("[notifee] background event", { type, hasPressAction: Boolean(detail.pressAction) });
    }
  });

  global.__notifeeBackgroundHandlerRegistered = true;
}

export {};
