
interface datatb {
  [key: string]: any;
}

interface datatb1 {
  value:any;
  Date:any;
  DefectQty:string;
  ProductQty:string;
  QualityTest:string;
  MachineSetup:string;
 
}

export interface TBform {
  value: datatb1[];
  settbdata: (newDataArray: datatb1[]) => void;
}