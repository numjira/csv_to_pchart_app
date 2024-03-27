"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import React from "react";


const Bt_page = () => {
  const router = useRouter();
  const [ClickBtCsv, setClickBtCsv] = useState(false);
  const [ClickBtChart, setClickBtChart] = useState(false);

  // useEffect(() => {
  //   setClickBtCsv(true);
  //   setClickBtChart(false);
  //   router.push("/P_SetCsv");
  // }, []);

  const routeToSetCsv = () => {
    router.push("/P_SetCsv");
    setClickBtCsv(true);
    setClickBtChart(false);
  };
  const routeToChart = () => {
    router.push("/P_Selector_Chart");
    setClickBtChart(true);
    setClickBtCsv(false);
  };

  return (
    <div
      className="bt"
      style={{
        backgroundColor: "white",
        flex: "1",
        display: "flex",
        gap: "8rem",
      }}
    >
      <div
        className="space"
        style={{
          paddingLeft: "2rem",
        }}
      ></div>
      <label
        onClick={routeToSetCsv}
        style={{
          cursor: "pointer",
          borderBottom: ClickBtCsv ? "6px solid blue" : "2px solid white",
          color: ClickBtCsv? "blue" : "black",
          padding: "1rem",
        }}
      >
        Upload
      </label>

      <label
        onClick={routeToChart}
        style={{
          cursor: "pointer",
          borderBottom: ClickBtChart ? "6px solid blue" : "2px solid white",
          color: ClickBtChart ? "blue" : "black",
          padding: "1rem",
        }}
      >
        Chart
      </label>
    </div>
  );
};

export default Bt_page;
