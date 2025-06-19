import { connectionColors } from "./typeColors";

export const getConnectionColor = (status: string): string => {
  return connectionColors[status] || connectionColors.default;
};

export const getConnectionText = (status: string): string => {
  switch (status) {
    case "connected":
      return "LIVE";
    case "connecting":
      return "CONNECTING";
    case "failed":
      return "DISCONNECTED";
    default:
      return "UNKNOWN";
  }
};
