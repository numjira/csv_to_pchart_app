"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button, Form, Select, Table, DatePicker } from "antd";
import FormItem from "antd/es/form/FormItem";
import { TBStore } from "@/Store_for_ProInfo/formstoretable.store";
import { TB2Store } from "@/Store_for_DefectMode/formstoretable2.store";
import type { DatePickerProps } from "antd";
import { DualPchart } from "../components/PChart/DualAxesChart";
import html2canvas from "html2canvas";
import { DualParetoChart } from "../components/Pareto/ParetoChart";

const App = () => {
  const handleChange = async (value: string) => {
    const line_name = form.getFieldValue("LineName");
    const shift = form.getFieldValue("Shift");
    const responseCategory = await axios.get(
      "http://localhost:8000/get_resultCategory",
      {
        params: {
          line_name: line_name,
          shift: shift,
        },
      }
    );
    if (responseCategory.status === 200) {
      setResultCategory(responseCategory.data);
      console.log("ResultCategory", resultCategory);
    }
    console.log(`selected ${value}`);
  };

  //  ------------------set state and store----------------------------
  const [form] = Form.useForm();
  const [linename, setlinename] = useState<any>([]);
  const [Category, setCategory] = useState<any>([]);
  const [resultCategory, setResultCategory] = useState<any>([]);

  const [data1, setdata1] = useState<any>([]);
  const setTBStore = TBStore((state) => state.settbdata);
  const dataTB = TBStore((state) => state.value);

  const setTB2Store = TB2Store((state) => state.settbdata2);
  const dataTB2 = TB2Store((state) => state.value);
  const [dataDF, setdata2] = useState<any>([]);

  const [monthPicker, setMonthPicker] = useState<any>([]);

  const chartRef = useRef<HTMLDivElement>(null);
  const ParetoRef = useRef<HTMLDivElement>(null);

  const [sum_n, setN] = useState<number>(0);
  const [sum_np, setNP] = useState<number>(0);
  const P_bar = parseFloat(((sum_np / sum_n) * 100).toFixed(3));
  const P_bar1 = isNaN(P_bar) ? 0 : P_bar;
  const [n, setn] = useState<number[]>([]);
  const [np, setnp] = useState<number[]>([]);
  const [date1, setdate1] = useState<any>([]);

  const changeMonth: DatePickerProps["onChange"] = (date, dateString) => {
    console.log(date, dateString);
    if (date) {
      setMonthPicker(dateString);
    }
  };

  if (dataTB && Array.isArray(dataTB) && dataTB.length > 0 && dataTB[0].value) {
    const sortedData = dataTB[0].value.sort(
      (a: any, b: any) =>
        new Date(a.Date).getTime() - new Date(b.Date).getTime()
    );
    // Update the original data with the sorted values
    dataTB[0].value = sortedData;
  }

  //เพิ่ม column ใหม่
  const dataWithKeys = dataTB.map((item) => {
    const modifiedValue = item.value.map((innerItem: any, index: any) => ({
      key: (index + 1).toString(),
      ...innerItem,
    }));
    return {
      ...item,
      value: modifiedValue,
    };
  });

  // useEffect(() => {
  //   console.log(dataTB);
  // }, [dataTB]);

  //##################################################################################
  //  ------------------CAL Defect Ratio----------------------------
  const calRatio = n.map((nValue, index) => {
    const result = nValue !== 0 ? (np[index] / nValue) * 100 : 0; // Added a dot before toFixed(1)
    return isNaN(result) ? 0 : parseFloat(result.toFixed(3));
  });
  const sumCalRatio = parseFloat(
    calRatio.reduce((sum, ratio) => sum + ratio, 0).toFixed(3)
  );
  const averageCalDRatio = parseFloat(
    (sumCalRatio / calRatio.length).toFixed(3)
  );

  //##################################################################################
  //  ------------------CAL UCL------------------------------------
  const calUCL = n.map((nValue, index) => {
    const P_bar = ((sum_np / sum_n) * 100).toFixed(3);
    let k =
      3 * Math.sqrt((parseFloat(P_bar) * (100 - parseFloat(P_bar))) / nValue);
    if (k === Infinity) {
      k = 0;
    }
    const result = parseFloat((parseFloat(P_bar) + k).toFixed(3));
    return isNaN(result) ? 0 : result;
  });

  const sumCalUCL = calUCL.reduce((acc, value) => acc + value, 0);
  const averageCalUCL = parseFloat((sumCalUCL / calUCL.length).toFixed(3));

  //##################################################################################

  //##################################################################################
  //---------------Get data from state to chart-----and sort date data----------------

  const UCL = date1.map((time: any, index: any) => {
    const formattedDate = new Date(time)
      .toLocaleDateString("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/\//g, "-");

    return {
      date: formattedDate,
      type: "UCL",
      value: calUCL[index % calUCL.length],
    };
  });
  const sortedUCL = UCL.slice().sort((a: any, b: any) => {
    const dayA = new Date(a.date).getDate(); //replace date to time
    const dayB = new Date(b.date).getDate();
    return dayA - dayB;
  });

  //---------------------------------------------------------------------------------

  const Pbar = date1.map((time: any, index: any) => {
    const formattedDate = new Date(time)
      .toLocaleDateString("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/\//g, "-");

    return {
      date: formattedDate,
      type: "Pbar",
      value: P_bar,
    };
  });
  const sortedPbar = Pbar.slice().sort((a: any, b: any) => {
    const dayA = new Date(a.date).getDate(); //replace date to time
    const dayB = new Date(b.date).getDate();
    return dayA - dayB;
  });

  const DefectRatio = date1.map((time: any, index: any) => {
    const formattedDate = new Date(time)
      .toLocaleDateString("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/\//g, "-");

    return {
      date: formattedDate,
      type: "DefectRatio",
      value: calRatio[index % calRatio.length],
    };
  });

  const sortedDefectRatio = DefectRatio.slice().sort((a: any, b: any) => {
    const dayA = new Date(a.date).getDate(); //replace date to time
    const dayB = new Date(b.date).getDate();
    return dayA - dayB;
  });

  const defectRatioInColumn = sortedDefectRatio.map((item: any) => item.value);

  const combinedReferenceData = [
    ...sortedDefectRatio.map((item: any) => ({ ...item, type: "DefectRatio" })),
    ...sortedPbar.map((item: any) => ({ ...item, type: "Pbar" })),
    ...sortedUCL.map((item: any) => ({ ...item, type: "UCL" })), //type replace to name
  ];

  //  make BaseLine for control chart แก้บัค////////////////////////////////////////////////////////
  const max = combinedReferenceData.reduce(
    (prev, current) => (prev.value > current.value ? prev : current),
    0
  );
  const maxV: number | null = max ? max.value : null;
  const maxValue =
    maxV !== null ? parseFloat((maxV + (25 / 100) * maxV).toFixed(3)) : null;

  const BaseLine = date1.map((time: any, index: any) => {
    const formattedDate = new Date(time)
      .toLocaleDateString("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/\//g, "-");

    return {
      date: formattedDate,
      type: "BaseLine",
      value: maxValue,
    };
  });
  const sortedBaseLine = BaseLine.slice().sort((a: any, b: any) => {
    const dayA = new Date(a.date).getDate(); //replace date to time
    const dayB = new Date(b.date).getDate();
    return dayA - dayB;
  });

  const combinedReferenceData1 = [
    ...sortedUCL.map((item: any) => ({ ...item, type: "UCL" })), //type replace to name
    ...sortedBaseLine.map((item: any) => ({ ...item, type: "1_BaseLine" })),
  ];
  const sortedCombinedReferenceData1 = combinedReferenceData1.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const combinedReferenceData2 = [
    ...sortedPbar.map((item: any) => ({ ...item, type: "Pbar" })),
    ...sortedBaseLine.map((item: any) => ({ ...item, type: "1_BaseLine" })),
  ];
  const sortedCombinedReferenceData2 = combinedReferenceData2.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const combinedReferenceData3 = [
    ...sortedDefectRatio.map((item: any) => ({ ...item, type: "DefectRatio" })),
    ...sortedBaseLine.map((item: any) => ({ ...item, type: "1_BaseLine" })),
  ];
  const sortedCombinedReferenceData3 = combinedReferenceData3.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  //##################################################################################

  const savecharttoclipboard = async () => {
    if (chartRef.current) {
      try {
        // Capture the content of the chart using html2canvas
        const canvas = await html2canvas(chartRef.current);
        // Convert the canvas data to a data URL (JPEG format in this case)
        const dataUrl = canvas.toDataURL("image/jpeg");
        // // Create an anchor element to trigger the download
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "chart_image.jpg";
        link.click();
        await navigator.clipboard.writeText(dataUrl);
        console.log("Chart saved as JPEG!");
        // alert("Chart saved as JPEG!");
      } catch (error) {
        console.error("Error saving chart:", error);
      }
    }
  };
  // ##########################################################################

  const saveParetotoclipboard = async () => {
    if (ParetoRef.current) {
      try {
        // Capture the content of the chart using html2canvas
        const canvas = await html2canvas(ParetoRef.current);
        // Convert the canvas data to a data URL (JPEG format in this case)
        const dataUrl = canvas.toDataURL("image/jpeg");
        // // Create an anchor element to trigger the download
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "chart_image.jpg";
        link.click();
        await navigator.clipboard.writeText(dataUrl);
        console.log("Chart saved as JPEG!");
        // alert("Chart saved as JPEG!");
      } catch (error) {
        console.error("Error saving chart:", error);
      }
    }
  };

  useEffect(() => {
    (async () => {
      const response = await axios.get("http://localhost:8000/get_linename");
      if (response.status === 200) {
        setlinename(response.data);
        console.log("Get linename sucess");
      }
    })();
  }, []);

  useEffect(() => {
    console.log(linename);
  }, []);

  ////////////////////////////////////////////////////////////

  useEffect(() => {
    (async () => {
      const response = await axios.get("http://localhost:8000/get_category");
      if (response.status === 200) {
        setCategory(response.data);
        console.log("Get category sucess");
      }
    })();
  }, []);

  useEffect(() => {
    console.log(Category);
  }, []);

  ///////////////////////////////////////////////////////////////////////////////////

  interface ModeData {
    Mode: string;
    Qty: any;
  }

  const transformData = (data: any): ModeData[] => {
    if (data && Array.isArray(data) && data.length > 0 && data[0].value) {
      const sortedData = data[0].value.sort((a: any, b: any) =>
        a.Mode.localeCompare(b.Mode)
      );

      const groupedData: { [key: string]: number } = {};

      sortedData.forEach((item: any) => {
        const mode = item.Mode;
        groupedData[mode] = (groupedData[mode] || 0) + parseInt(item.Qty, 10);
      });

      const resultArray: ModeData[] = Object.keys(groupedData).map((mode) => ({
        Mode: mode,
        Qty: groupedData[mode],
      }));

      return resultArray;
    } else {
      // Handle the case where dataTB is not in the expected format
      // console.error("dataTB is not in the expected format");
      console.log("dataTB is not in the expected format");
      return [];
    }
  };

  interface CategoryItem {
    value: string;
  }
  function removeDuplicates(data: CategoryItem[]): CategoryItem[] {
    const uniqueData: CategoryItem[] = [];
    const uniqueValues = new Set<string>();
    for (const item of data) {
      if (!uniqueValues.has(item.value)) {
        uniqueValues.add(item.value);
        uniqueData.push(item);
      }
    }
    return uniqueData;
  }
  const uniqueCategory = removeDuplicates(Category);
  const uniqueLineName = removeDuplicates(linename);

  const Submitform = async () => {
    const line_name = form.getFieldValue("LineName");
    const shift = form.getFieldValue("Shift");
    const category = form.getFieldValue("Category");
    // const date_picker=form.getFieldValue("date_picker"); //addd

    const responsedata = await axios.get(
      "http://localhost:8000/get_resultdata",
      {
        params: {
          line_name: line_name,
          shift: shift,
          date_picker: monthPicker, //addd   date_picker
        },
      }
    );

    const responsedata1 = await axios.get(
      "http://localhost:8000/get_resultdata2",
      {
        params: {
          line_name: line_name,
          shift: shift,
          category: category,
          date_picker: monthPicker,
        },
      }
    );

    if (responsedata.status === 200) {
      setdata1(responsedata.data);
      setTBStore(responsedata.data);

      // setTBStore(sortedDataTB);
      // console.log("data1 :", data1);
      console.log("res_ProInfo :", responsedata.data);
      // console.log("dataTB :", dataTB);

      const DateArray =
        responsedata.data?.[0]?.value?.map((item: any) => String(item.Date)) ||
        [];
      setdate1(DateArray);

      const ProductQtyArray =
        responsedata.data?.[0]?.value?.map((item: any) =>
          Number(item.ProductQty)
        ) || [];
      setn(ProductQtyArray.map(Number));

      const sumProductQty = ProductQtyArray.reduce(
        (sum: number, productQty: number) => sum + productQty,
        0
      );
      setN(sumProductQty);

      const DefectQtyArray =
        responsedata.data?.[0]?.value?.map((item: any) =>
          Number(item.DefectQty)
        ) || [];
      setnp(DefectQtyArray);
      const sumDefectQty = DefectQtyArray.reduce(
        (sum: number, defectQty: number) => sum + defectQty,
        0
      );
      setNP(sumDefectQty);

      // console.log("Date Array:", DateArray);
      // console.log("DefectQty Array:", DefectQtyArray);
      // console.log("ProductQty Array:", ProductQtyArray);
      // console.log("calUCL:", calUCL);
      // console.log("cal_defectratio:", calRatio);
      // console.log("sortUCL:", sortedUCL);
      // console.log("sortPbar:", sortedPbar);
      // console.log("sortDefect:", sortedDefectRatio);
      //console.log("dataWithKeys:", dataWithKeys);
      // console.log("Sum of Defect Ratio:", sumCalRatio);
      //console.log("dataTB", dataTB);
      // console.log("max:", maxValue);
      // console.log("defectRatioInColumn",defectRatioInColumn);
      // console.log("averageCalUCL",averageCalUCL);
      // console.log("averageCalDefectRatio",averageCalDRatio);
      // console.log("TestDateDefect:", DefectRatio);
      console.log("data1",sortedCombinedReferenceData1)
      console.log("data2",sortedCombinedReferenceData2)
      console.log("data3",sortedCombinedReferenceData3)
    }

    if (responsedata1.status === 200) {
      const sortDefectMode = transformData(responsedata1.data);
      const arrangeDefectData = sortDefectMode.sort((a, b) => b.Qty - a.Qty);
      setTB2Store(arrangeDefectData);
      setdata2(arrangeDefectData);
      console.log("res1_DefectMode", responsedata1.data);
      // console.log("transformedData", sortDefectMode);
      console.log("Arrange DefectMode Data", arrangeDefectData);

      // console.log("Category", Category);
      // console.log("uniqueCategory", uniqueCategory);
      // console.log("dataTB2", dataTB2);
    }
  };

  const columns = [
    // {
    //   title: "key",
    //   dataIndex: "key",
    //   key: "key",
    //   render: (text: any, record: any) =>
    //     record.value.map((item: any, index: any) => (
    //       <p key={index}>{parseInt(item.key)}</p>
    //     )),
    // },
    {
      title: "Date",
      dataIndex: "Date",
      key: "Date",
      render: (text: any, record: any) =>
        record.value.map((item: any, index: any) => (
          <p key={index} style={{ fontSize: "16px" }}>
            {new Date(item.Date)
              .toLocaleDateString("en-US", {
                //weekday: "short",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
              .replace(/,/g, "-")}
          </p>
        )),
    },
    {
      title: "Product Qty",
      dataIndex: "ProductQty",
      key: "ProductQty",
      render: (text: any, record: any) =>
        record.value.map((item: any, index: any) => (
          <p key={index} style={{ fontSize: "16px" }}>
            {parseInt(item.ProductQty).toLocaleString("en-US")}
          </p>
        )),
    },
    {
      title: "Defect Qty",
      dataIndex: "DefectQty",
      key: "DefectQty",
      render: (text: any, record: any) =>
        record.value.map((item: any, index: any) => (
          <p key={index} style={{ fontSize: "16px" }}>
            {parseInt(item.DefectQty).toLocaleString("en-US")}
          </p>
        )),
    },
    {
      title: "Defect Ratio",
      dataIndex: "DefectRatio",
      key: "DefectRatio",
      render: (text: any, record: any) =>
        defectRatioInColumn.map((value: any, index: any) => (
          <p key={index} style={{ fontSize: "16px" }}>
            {value}
          </p>
        )),
    },
    // {
    //   title: "Quality Test",
    //   dataIndex: "QualityTest",
    //   key: "QualityTest",
    //   render: (text: any, record: any) =>
    //     record.value.map((item: any, index: any) => (
    //       <p key={index}>{parseInt(item.QualityTest).toLocaleString("en-US")}</p>
    //     )),
    // },
    // {
    //   title: "Machine Setup",
    //   dataIndex: "MachineSetup",
    //   key: "MachineSetup",
    //   render: (text: any, record: any) =>
    //     record.value.map((item: any, index: any) => (
    //       <p key={index}>{parseInt(item.MachineSetup).toLocaleString("en-US")}</p>
    //     )),
    // },
  ];

  const testBt = () => {
    console.log(dataTB2);
  };

  return (
    <div>
      <div
        className="space"
        style={{
          display: "flex",
          paddingTop: "1rem",
        }}
      ></div>

      <div>
        <div
          style={{
            padding: "2rem",
            display: "flex",
            flex: "1",
            gap: "2rem",
          }}
        >
          <div
            className="select"
            style={{
              //border: "2px solid black",
              borderRadius: "20px",
              boxShadow: "0 0 30px rgba(0, 0, 0, 0.1)",
              flex: "0.5",
              display: "flex",
              flexDirection: "column",
              //paddingLeft:"0.5rem"
              backgroundColor: "white",
              alignItems: "center",
              justifyContent: "center",
              //width: 550,
              //paddingRight:"15rem"
            }}
          >
            <h1>Product Information</h1>

            <Form form={form} onFinish={(x) => console.log(x)}>
              <Form.Item
                name="LineName"
                rules={[{ required: true, message: "LineName is required" }]}
                label={
                  <span className="custom-label" style={{ fontSize: 25 }}>
                    Line name
                  </span>
                }
              >
                <Select
                  showSearch
                  placeholder="Select a line name"
                  style={{ width: 250 }}
                  //options={linename.slice().sort((a:any, b:any) => a.label.localeCompare(b.label))}
                  options={uniqueLineName}
                  //onChange={handleChange}
                />
              </Form.Item>
              <Form.Item
                name="Shift"
                rules={[{ required: true, message: "Shift is required" }]}
                label={
                  <span className="custom-label " style={{ fontSize: 25 }}>
                    Shift
                  </span>
                }
              >
                <Select
                  placeholder="Select a shift"
                  style={{ width: 250 }}
                  onChange={handleChange}
                  options={[
                    { value: "A", label: "A" },
                    { value: "B", label: "B" },
                    { value: "N", label: "N" },
                  ]}
                />
              </Form.Item>

              {/* -----------------------add category naja ------------------*/}
              <Form.Item
                name="Category"
                rules={[{ required: true, message: "Category is required" }]}
                label={
                  <span className="custom-label " style={{ fontSize: 25 }}>
                    Category
                  </span>
                }
              >
                <Select
                  showSearch
                  placeholder="Select a category"
                  style={{ width: 250 }}
                  onChange={handleChange}
                  // options={[
                  //   {
                  //     value: "Finishing & Repeat",
                  //     label: "Finishing & Repeat",
                  //   },
                  //   { value: "Mode Scrap", label: "Mode Scrap" },
                  //   {
                  //     value: "Mode Scrap [Rework]",
                  //     label: "Mode Scrap [Rework]",
                  //   },
                  // ]}

                  options={
                    resultCategory.length > 0
                      ? resultCategory
                      : [{ value: "none", label: "-" }]
                  }

                  //  options={uniqueCategory}
                />
              </Form.Item>
              {/* ----------------------------------------------------------- */}

              <Form.Item
                name="Year,Month"
                rules={[{ required: true, message: "Year,Month is required" }]}
                label={
                  <span className="custom-label " style={{ fontSize: 25 }}>
                    Year,Month
                  </span>
                }
              >
                {/* <div style={{ fontSize: 25 }}>
                Year,Month: */}
                <DatePicker onChange={changeMonth} picker="month"></DatePicker>
                {/* </div> */}
              </Form.Item>

              <div
                className="space"
                style={{
                  display: "flex",
                  paddingTop: "0.5rem",
                }}
              ></div>
              <FormItem
                style={{
                  display: "flex",
                  alignItems: "right",
                  justifyContent: "right",
                }}
              >
                <Button
                  onClick={Submitform}
                  htmlType="submit"
                  style={{
                    fontSize: 15,
                    backgroundColor: "blue",
                    color: "white",
                  }}
                >
                  Submit
                </Button>
              </FormItem>
            </Form>
          </div>
          <div
            className="space"
            style={{
              display: "flex",
              paddingLeft: "0.5rem",
            }}
          ></div>
          <div
            className="howtocal"
            style={{
              //border: "2px solid blue",
              flex: "1",
              display: "flex",
              gap: "0.5rem",
            }}
          >
            <div
              className="solution"
              style={{
                flex: "1",
                display: "flex",
              }}
            >
              <div
                className="block1"
                style={{
                  borderRadius: "20px",
                  display: "flex",
                  flexDirection: "column",
                  flex: "1",
                }}
              >
                <div
                  className="block1A sum_np"
                  style={{
                    // border: "2px solid black",
                    boxShadow: "0 0 30px rgba(0, 0, 0, 0.1)",
                    borderRadius: "20px",
                    backgroundColor: "white",
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ fontWeight: "bold", fontSize: 20 }}>
                    Sum of DefectQty
                  </div>

                  <div>
                    {data1.length ? (
                      <div
                        style={{
                          color: "blue",
                          fontWeight: "bold",
                          fontSize: 45,
                          paddingTop: "1rem",
                        }}
                        onChange={Submitform}
                      >
                        {sum_np.toLocaleString("en-US")}
                      </div>
                    ) : (
                      <div
                        style={{
                          color: "gainsboro",
                          paddingTop: "1rem",
                          fontSize: 25,
                        }}
                      >
                        Please select the data
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: 18,
                      paddingBottom: "0.5rem",
                    }}
                  >
                    pcs
                  </div>
                </div>
                <div
                  className="space"
                  style={{
                    padding: "0.5rem",
                    // backgroundColor: "lightgray"
                  }}
                ></div>
                <div
                  className="block1B sum_n"
                  style={{
                    // border: "2px solid black",
                    boxShadow: "0 0 30px rgba(0, 0, 0, 0.1)",
                    borderRadius: "20px",
                    backgroundColor: "white",
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ fontWeight: "bold", fontSize: 20 }}>
                    Sum of ProductQty
                    {/* sum_n */}
                  </div>

                  <div>
                    {data1.length ? (
                      <div
                        style={{
                          color: "blue",
                          fontWeight: "bold",
                          fontSize: 45,
                          paddingTop: "1rem",
                        }}
                        onChange={Submitform}
                      >
                        {sum_n.toLocaleString("en-US")}
                      </div>
                    ) : (
                      <div
                        style={{
                          color: "gainsboro",
                          //fontWeight: "bold",
                          fontSize: 25,
                          paddingTop: "1rem",
                        }}
                      >
                        Please select the data
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      color: "black",

                      fontSize: 18,
                      paddingBottom: "0.5rem",
                    }}
                  >
                    pcs
                  </div>
                </div>
              </div>
              <div
                className="space"
                style={{
                  padding: "0.5rem",
                  // backgroundColor: "lightgray"
                }}
              ></div>
              <div
                className="block2"
                style={{
                  //border: "2px solid blue",
                  display: "flex",
                  flexDirection: "column",
                  flex: "1",
                }}
              >
                <div
                  className="blok2A DefectRatio"
                  style={{
                    // border: "2px solid black",
                    boxShadow: "0 0 30px rgba(0, 0, 0, 0.1)",
                    borderRadius: "20px",
                    backgroundColor: "white",
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ fontWeight: "bold", fontSize: 20 }}>P-bar</div>

                  <div>
                    {data1.length ? (
                      <div
                        style={{
                          color: "blue",
                          fontWeight: "bold",
                          fontSize: 45,
                          paddingTop: "1rem",
                        }}
                        onChange={Submitform}
                      >
                        {P_bar1.toLocaleString("en-US")}
                      </div>
                    ) : (
                      <div
                        style={{
                          color: "gainsboro",
                          //fontWeight: "bold",
                          fontSize: 25,
                          paddingTop: "1rem",
                        }}
                      >
                        Please select the data
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      color: "black",

                      fontSize: 18,
                      paddingBottom: "0.5rem",
                    }}
                  >
                    %
                  </div>
                </div>
                <div
                  className="space"
                  style={{
                    padding: "0.5rem",
                    // backgroundColor: "lightgray"
                  }}
                ></div>
                <div
                  className="block2B P-bar"
                  style={{
                    // border: "2px solid black",
                    boxShadow: "0 0 30px rgba(0, 0, 0, 0.1)",
                    borderRadius: "20px",
                    backgroundColor: "white",
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ fontWeight: "bold", fontSize: 20 }}>
                    Average of UCL
                  </div>

                  <div>
                    {data1.length ? (
                      <div
                        style={{
                          color: "blue",
                          fontWeight: "bold",
                          fontSize: 45,
                          paddingTop: "1rem",
                        }}
                        onChange={Submitform}
                      >
                        {averageCalUCL.toLocaleString("en-US")}
                      </div>
                    ) : (
                      <div
                        style={{
                          color: "gainsboro",
                          //fontWeight: "bold",
                          fontSize: 25,
                          paddingTop: "1rem",
                        }}
                      >
                        Please select the data
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      color: "black",

                      fontSize: 18,
                      paddingBottom: "0.5rem",
                    }}
                  >
                    %
                  </div>
                </div>
              </div>
              <div
                className="space"
                style={{
                  padding: "0.5rem",
                  // backgroundColor: "lightgray"
                }}
              ></div>
              <div
                className="block3"
                style={{
                  // border: "2px solid blue",
                  display: "flex",
                  flexDirection: "column",
                  flex: "1",
                }}
              >
                <div
                  className="blok3A"
                  style={{
                    // border: "2px solid black",
                    boxShadow: "0 0 30px rgba(0, 0, 0, 0.1)",
                    borderRadius: "20px",
                    backgroundColor: "white",
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ fontWeight: "bold", fontSize: 20 }}>
                    Sum of Defect Ratio
                  </div>

                  <div>
                    {data1.length ? (
                      <div
                        style={{
                          color: "blue",
                          fontWeight: "bold",
                          fontSize: 45,
                          paddingTop: "1rem",
                        }}
                        onChange={Submitform}
                      >
                        {sumCalRatio.toLocaleString("en-US")}
                      </div>
                    ) : (
                      <div
                        style={{
                          color: "gainsboro",
                          //fontWeight: "bold",
                          fontSize: 25,
                          paddingTop: "1rem",
                        }}
                      >
                        Please select the data
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      color: "black",

                      fontSize: 18,
                      paddingBottom: "0.5rem",
                    }}
                  >
                    %
                  </div>
                </div>
                <div
                  className="space"
                  style={{
                    padding: "0.5rem",
                    // backgroundColor: "lightgray"
                  }}
                ></div>
                <div
                  className="block3B"
                  style={{
                    // border: "2px solid black",
                    boxShadow: "0 0 30px rgba(0, 0, 0, 0.1)",
                    borderRadius: "20px",
                    backgroundColor: "white",
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ fontWeight: "bold", fontSize: 20 }}>
                    Average of Defect Ratio
                  </div>

                  <div>
                    {data1.length ? (
                      <div
                        style={{
                          color: "blue",
                          fontWeight: "bold",
                          fontSize: 45,
                          paddingTop: "1rem",
                        }}
                        onChange={Submitform}
                      >
                        {averageCalDRatio.toLocaleString("en-US")}
                      </div>
                    ) : (
                      <div
                        style={{
                          color: "gainsboro",
                          //fontWeight: "bold",
                          paddingTop: "1rem",
                          fontSize: 25,
                        }}
                      >
                        Please select the data
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      color: "black",

                      fontSize: 18,
                      paddingBottom: "0.5rem",
                    }}
                  >
                    %
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            //border: "2px solid black",
            // borderLeft: "2px solid black",
            // borderRight: "2px solid black",
            paddingBottom: "0.5rem",
            paddingLeft: "0.5rem",
            paddingRight: "0.5rem",
            backgroundColor: "white",
            flex: "1",
            //height:600,
          }}
        >
          <h1>P-Chart</h1>
          <div
            style={{
              // border: "2px solid black",
              padding: "0.5rem",
              borderRadius: "20px",
              backgroundColor: "white",
              boxShadow: "0 0 30px rgba(0, 0, 0, 0.1)",
              //height:600,
            }}
          >
            <div ref={chartRef}>
              <div
                style={{
                  flex: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight:"6rem"
                }}
              >
                <span style={{ color: "#F08080"}}>UCL</span>
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    backgroundColor: "#F08080",
                    borderRadius: "50%",
                    margin: "0 5px",
                    display: "inline-block",     
                  }}
                />
                <span style={{ color: "#90EE90" ,paddingLeft:"1rem"}}>P-bar</span>
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    backgroundColor: "#90EE90",
                    borderRadius: "50%",
                    margin: "0 5px",
                    display: "inline-block",
                  }}
                />
                <span style={{ color: "#1E90FF" ,paddingLeft:"1rem"}}>Defect Ratio</span>
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    backgroundColor: "#1E90FF",
                    borderRadius: "50%",
                    margin: "0 5px",
                    display: "inline-block",
                  }}
                />
              </div>
              <DualPchart
                data1={sortedCombinedReferenceData1}
                data2={sortedCombinedReferenceData2}
                data3={sortedCombinedReferenceData3}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "right",
                justifyContent: "right",
                padding: "0.5rem",
              }}
            >
              <Button
                onClick={savecharttoclipboard}
                style={{ backgroundColor: "blue", color: "white" }}
              >
                Download
              </Button>
            </div>
          </div>
        </div>

        <div
          style={{
            //border: "2px solid black",
            // borderLeft: "2px solid black",
            // borderRight: "2px solid black",
            paddingBottom: "0.5rem",
            paddingLeft: "0.5rem",
            paddingRight: "0.5rem",
            backgroundColor: "white",
            flex: "1",
            //height:600,
          }}
        >
          <h1>Pareto Chart</h1>
          <div
            style={{
              // border: "2px solid black",
              padding: "0.5rem",
              borderRadius: "20px",
              backgroundColor: "white",
              boxShadow: "0 0 30px rgba(0, 0, 0, 0.1)",
              //height:600,
            }}
          >
            <div ref={ParetoRef}>
            <div
                style={{
                  flex: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight:"6rem"
                }}
              >
                <span style={{ color: "#F08080"}}>Defect Quantity</span>
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    backgroundColor: "#F08080",
                    borderRadius: "50%",
                    margin: "0 5px",
                    display: "inline-block",
                  }}
                />
                <span style={{ color: "#1E90FF" ,paddingLeft:"1rem"}}>Cumulative Percentage</span>
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    backgroundColor: "#1E90FF",
                    borderRadius: "50%",
                    margin: "0 5px",
                    display: "inline-block",
                  }}
                />
              </div>
              <DualParetoChart
                // dataDFM={dataTB2}
                dataDFM={dataDF}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "right",
                justifyContent: "right",
                padding: "0.5rem",
              }}
            >
              <Button
                onClick={saveParetotoclipboard}
                style={{ backgroundColor: "blue", color: "white" }}
              >
                Download
              </Button>
            </div>
          </div>
        </div>

        <div
          style={{
            // border: "2px solid black",
            padding: "0.5rem",
          }}
        >
          <div>
            <h1>Data Table</h1>
          </div>
          <div>
            <Table
              style={{ border: "1px solid black" }}
              columns={columns}
              size="large"
              bordered={true}
              dataSource={dataWithKeys}
              rowKey={(record) => record.value.at(0).key} //ใส่ key ให้มัน กัน error
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
