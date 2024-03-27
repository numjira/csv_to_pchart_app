import { create } from "zustand";
import { TB2form } from "./interface/forminterfacetb2";
export const TB2Store = create<TB2form>((...args) => {
  const [set, get] = args;
  return {
    value: [],
    settbdata2(newDataArray) {
      set({ value: newDataArray });
    },
  };
});
