import { atom } from "recoil";

const limitState = atom({
  key: "limit",
  default: (() => {
    if (typeof window !== "undefined") {
      const containerWidth = window.innerWidth;
      const minColumns = 1;
      const minWidth = 260;
      const additionalColumnWidth = 260;
      if (containerWidth <= 420) return 2;
      if (containerWidth <= minWidth) return minColumns;
      return (
        minColumns +
        Math.floor((containerWidth - minWidth) / additionalColumnWidth)
      );
    }
    return 4; // Fallback value if window is not available
  })(),
});

export default limitState;
