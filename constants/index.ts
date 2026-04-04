import Constants from "expo-constants";

export const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";
export const APP_NAME = "IOU";
export const DEVELOPER_NAME = "JustModo";
export const GITHUB_REPO_NAME = "JustModo/IOU";
export const GITHUB_URL = `https://github.com/${GITHUB_REPO_NAME}`;
export const GITHUB_API_LATEST_RELEASE = `https://api.github.com/repos/${GITHUB_REPO_NAME}/releases/latest`;
export const GITHUB_RELEASE_URL_BASE = `https://github.com/${GITHUB_REPO_NAME}/releases/tag/`;

export { COLORS } from "./colors";
