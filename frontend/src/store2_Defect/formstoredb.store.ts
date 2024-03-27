import { create } from "zustand";
import { Defectform } from "./interface/from.interfacedb";
export const DefectStore = create<Defectform>((...args) => {
  const [set, get] = args;
  return {
    data2: [],
    setdata2(newDataArray) {
      set({ data2: newDataArray });
    },
  };
});
