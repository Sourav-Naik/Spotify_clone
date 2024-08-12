import { atom } from "recoil";

export const alertState = atom({
  key: "alertState",
  default: { show: false, msg: "", type: "" },
});
