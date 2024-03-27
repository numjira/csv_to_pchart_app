interface datatb3 {
  Mode: string;
  Qty: any;
}

export interface TB2form {
  value: datatb3[];
  settbdata2: (newDataArray: datatb3[]) => void;
}