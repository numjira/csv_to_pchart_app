"use client";
import React from "react";
import dynamic from "next/dynamic";
const DualAxes = dynamic(
  () => import("@ant-design/plots/es").then((mod) => mod.DualAxes),
  { ssr: false }
);
import type { DualAxesConfig } from "@ant-design/plots/es/components/dual-axes";
import { Empty } from "antd";

interface A1 {
  date: string;
  type: any;
  value: number;
}
interface UCL_ {
  data1: A1[];
}

interface A2 {
  date: string;
  type: any;
  value: number;
}
interface Pbar_ {
  data2: A2[];
}

interface A3 {
  date: string;
  type: any;
  value: number;
}
interface DefectRatio_ {
  data2: A3[];
}

interface referenceData {
  data1: UCL_[];
  data2: Pbar_[];
  data3: DefectRatio_[];
}

export const DualPchart: React.FC<referenceData> = ({
  data1,
  data2,
  data3,
}) => {

// console.log("data1:", data1);
// console.log("data2:", data2);
// console.log("data3:", data3);

  const config: DualAxesConfig = {
    tooltip: {
      title: 'date',
      items: [{ channel: 'y' }],
    },
    xField: "date",
    axis: {
      x: {
        title: "Date",
        line: true,
        // lineStroke: "black", //"#000000"
        labelStroke: "#000",
        //labelFill:"black",
        lineLineWidth: 2,
        labelFontSize: 16,
        titleFontSize: 18,
        titleStroke:"black",
        
      },
      // y:{title: "Defect Ratio (%)",}
    },

    scale: {
      color: { range: ["#F08080", "#FFFFFF", "#90EE90", "#1E90FF"] }, //UCL , Baseline , Pbar , Defectratio
    },

    legend: false,

    title: {
      title: "P-Chart (In-Line Defect)",
      style: {
        titleFontSize: 20,
        
      },
    },
    children: [
      {
        //UCL
        data: data1,
        type: "point", //point
        yField: "value", //value
        colorField: "type",
        // @ts-ignore
        sizeField: 10,
        shapeField: "hyphen", //line

        axis: {
          y: {
            position: "right",
            title: "UCL (%)",
            labelFontSize: 16,
            titleFontSize: 18,
            labelStroke: "black",
            titleStroke:"black",
            line: true ,lineLineWidth:2,
            labelFormatter: (d: any) => `${(d).toFixed(1)}`,
            grid:null
          }, //, 
        },
        style: { lineWidth: 6 },
      },
      {
        //Pbar
        data: data2,
        type: "line",
        yField: "value",
        colorField: "type",
        //shapeField: 'line',
        axis: { y: false },
        // style: { lineWidth: 8,},
        //shapeField: "vh" ,
        style: { lineWidth: 6, lineDash: [30, 30] },
      },
      {
        //Defectratio
        data: data3,
        type: "line",
        yField: "value",
        colorField: "type",
        //shapeField: 'line',
        // axis: { y: false},

        style: { lineWidth: 4 },
        axis: {
          y: {
            title: "Defect Ratio (%)",
            line: true,
            lineLineWidth: 2,
            lineStroke: "#000000",
            labelStroke: "#000000",
            titleStroke:"black",
            labelFontSize: 16,
            titleFontSize: 18,
            labelFormatter: (d: any) => `${(d).toFixed(1)}`,
          },
        },
      },
      {
      //   //Defectratio
        data: data3,
        type: "point",
        yField: "value",
        colorField: "type",

        //@ts-ignore
        sizeField: 6,
        shapeField: "point", //line
        axis: { y: false},
      },
      {
        data:data3,
        type: 'interval',
        yField: 'value',
        colorField: "type",
      },
    

    ],
  };

  return (
    <div>
      {data1.length !== 0 ? (
        <DualAxes {...config} />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={"Plese select the data and summit"}
        />
      )}
    </div>
  );
};
