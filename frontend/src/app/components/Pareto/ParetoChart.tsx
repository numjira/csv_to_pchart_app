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
  Mode: string;
  Qty: number;
}

interface referenceData {
  dataDFM: A1[];
}

export const DualParetoChart: React.FC<referenceData> = ({ dataDFM }) => {
  //make line data y for limit data easy for useing
  const maxData = dataDFM.reduce(
    (max, current) => (current.Qty > max.Qty ? current : max),
    dataDFM[0]
  );
  const limitLine: number | null = maxData ? maxData.Qty : null;
  const maxLine =
    limitLine !== null
      ? parseFloat((limitLine + (25 / 100) * limitLine).toFixed(3))
      : null;

  // console.log("Entry with maximum Qty:", maxData);
  // console.log("Limit Line:", maxLine);

  const config: DualAxesConfig = {
    
    axis: {
      y: { line: true, lineLineWidth: 2, labelFontSize: 16 },
      x: { title: "Mode", titleFontSize: 18, titleStroke: "black" },
    },
    scale: { y: { nice: false } },
    data: {
      type: "inline",
      value: dataDFM,
      transform: [
        {
          type: "custom",
          callback: (data: any) => {
            const sum = data.reduce((r: any, curr: any) => r + curr.Qty, 0);
            return data
              .map((d: any) => ({
                ...d,
                percentage: d.Qty / sum,
              }))
              .reduce((r: any, curr: any) => {
                const v = r.length ? r[r.length - 1].accumulate : 0;
                const accumulate = v + curr.percentage;
                r.push({
                  ...curr,
                  accumulate,
                });
                return r;
              }, []);
          },
        },
      ],
    },
    xField: "Mode",
    children: [
      {
        type: "interval",
        yField: "Qty",
        scale: { x: { padding: 0.5 }, y: { domainMax: maxLine, tickCount: 5 } },
        style: {
          fill: (d: any) => (d.percentage ? "#F08080" : "default-color"),
        },
        axis: {
          x: {
            title: null,
            // titleFontSize: 18,
            // titleStroke: "black",
        
            labelStroke: "black",
            labelFontSize: 16,
            line: true,
            lineLineWidth: 2,
          },
          y: {
            title: "Defect Quantity (pcs)",
            
            labelFontSize: 16,
            titleFontSize: 18,
            labelStroke: "black",
            titleStroke: "black",
          },
        },
        labels: [
          {
            text: (d: any) => `${(d.percentage * 100).toFixed(1)}%`,
            textBaseline: "bottom",
            style: {
              fontSize: 40,
            },
          },
        ],
      },
      {
        type: "line",
        yField: "accumulate",
        style: { lineWidth: 4 },
        scale: { y: { domainMin: 0, tickCount: 5 } },
        axis: {
          y: {
            position: "right",
            title: "Cumulative Percentage",
            labelStroke: "black",
            titleStroke: "black",
            //labelFill:"black",
            labelFontSize: 16,
            line: true,
            lineLineWidth: 2,
            titleFontSize: 18,
            grid: null,
            labelFormatter: (d: any) => `${(d * 100).toFixed(0)}%`,
          },
        },
        tooltip: {
          items: [
            {
              channel: "y",
              valueFormatter: (d: any) => `${(d * 100).toFixed(2)}%`,
            },
          ],
        },
      },
      {
        type: "point",
        yField: "accumulate",
        shapeField: "point",
        //@ts-ignore
        sizeField: 8,
        scale: { y: { domainMin: 0 } },
        axis: { y: false },
        tooltip: false,
      },
    ],
    title: {
      title: "Pareto Chart (In-Line Defect)",
      style: {
        titleFontSize: 20,
        
      },
    },
  };

  return (
    <div>
      {dataDFM.length !== 0 ? (
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
