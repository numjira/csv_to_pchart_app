interface dataitem5 {
  [key: string]: any;
}

interface dataitem6 {
  LineName: string;
  Category:string;
  Shift: string;
  Data: dataitem5[];
}

export interface Defectform {
  data2: dataitem6[];
  setdata2: (newDataArray: dataitem6[]) => void;
}
