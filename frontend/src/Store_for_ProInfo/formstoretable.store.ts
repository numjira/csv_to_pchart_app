import { create } from "zustand";
import { TBform } from "./interface/forminterfacetb";
export const TBStore = create<TBform>((...args) => {
  const [set, get] = args;
  return {
    value: [],
    settbdata(newDataArray) {
      set({ value: newDataArray });
    },
  };
});
