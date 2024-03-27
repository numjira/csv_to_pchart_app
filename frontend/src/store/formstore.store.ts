import { create } from "zustand";
import { Prodform } from "./interface/from.interface";
export const ProdStore = create<Prodform>((...args) => {
  const [set, get] = args;
  return {
    data: [],
    setdata(newDataArray) {
      set({ data: newDataArray });
    },
  };
});
