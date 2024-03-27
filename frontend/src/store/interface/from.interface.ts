interface dataitem1 {
  [key:string]:any
}

interface dataitem2 {
  LineName: string;
  Shift: string;
  Data: dataitem1[];
}

export interface Prodform {
  data: dataitem2[];
  setdata: (newDataArray: dataitem2[]) => void;
}