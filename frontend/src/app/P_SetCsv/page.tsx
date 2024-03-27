"use client";
import React, { useEffect, useState, useCallback } from "react";
import Papa from "papaparse";
import { Form, Button, DatePicker } from "antd";
import { ProdStore } from "@/store/formstore.store";
import axios from "axios";
import { DefectStore } from "@/store2_Defect/formstoredb.store";
import type { DatePickerProps } from "antd";
import FormItem from "antd/es/form/FormItem";

interface InputDataItem {
  Date: string;
  DefectQty: string;
  LineName: string;
  MachineSetup: string;
  ProductQty: string;
  QualityTest: string;
  Shift: string;
}

interface MappedDataItem {
  LineName: string;
  Shift: string;
  Data: Array<Partial<InputDataItem>>;
}

/////////////////////////////////////////////////////////////////////////////////
interface InputDataItem2 {
  LineName: string;
  Category: string;
  Shift: string;
  Date: string;
  Mode: string;
  Qty: string;
}

interface DefectDataItem {
  LineName: string;
  Category: string;
  Shift: string;
  Data: Array<Partial<InputDataItem2>>;
}

const App1: React.FC = () => {
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [mappedData, setMappedData] = useState<MappedDataItem[]>([]);
  const setdata = ProdStore((state) => state.setdata);
  const data = ProdStore((state1) => state1.data);
  ////////////////////////////////////////////////////////////////////////
  const [DefectdData, setDefectData] = useState<DefectDataItem[]>([]);
  const setdata2 = DefectStore((state) => state.setdata2);
  const data2 = DefectStore((state1) => state1.data2);

  const [monthPicker, setMonthPicker] = useState<any>([]);
  const [monthPicker2, setMonthPicker2] = useState<any>([]);
  useEffect(() => {}, []);

  useEffect(() => {
    console.log("Add ProdInfo to store", data);
  }, [data]);
  ///////////////////////////////////////////////////
  useEffect(() => {
    console.log("Add DefectMode to store", data2);
  }, [data2]);

  const consoleForm1 = () => {
    console.log(mappedData);
    //console.log(values);
  };
  /////////////////////////////////////////////////////
  const consoleForm2 = () => {
    console.log(DefectdData);
    //console.log(values);
  };

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>): void => {
    Papa.parse(event.target.files![0], {
      header: true,
      skipEmptyLines: true,
      complete: async function (results: Papa.ParseResult<InputDataItem>) {
        try {
          const groupedData: Record<string, MappedDataItem> =
            results.data.reduce((acc, item) => {
              const key = `${item.LineName}_${item.Shift}`;
              if (!acc[key]) {
                acc[key] = {
                  LineName: item.LineName,
                  Shift: item.Shift,
                  Data: [],
                };
              }
              acc[key].Data.push({
                Date: item.Date,
                DefectQty: item.DefectQty,
                MachineSetup: item.MachineSetup,
                ProductQty: item.ProductQty,
                QualityTest: item.QualityTest,
              } as Partial<InputDataItem>);
              return acc;
            }, {} as Record<string, MappedDataItem>);

          // const mappedResult = Object.values(groupedData);

          // ################################ add date_picker ##########################
          const mappedResult = Object.values(groupedData).map((item) => {
            const modifiedData = item.Data.map((innerItem) => ({
              ...innerItem,
              date_picker: monthPicker,
            }));

            return {
              ...item,
              //Data: modifiedData,
              date_picker: modifiedData.length
                ? modifiedData[0].date_picker
                : "", // Set to the first date_picker or empty string if no Data
            };
          });
          //#############################################################################

          setMappedData(mappedResult);
          setdata(mappedResult); // assuming setdata is not asynchronous
        } catch (error) {
          console.error("Error:", error);
        }
      },
    });
  };

  const changeHandler2 = (event: React.ChangeEvent<HTMLInputElement>): void => {
    Papa.parse(event.target.files![0], {
      header: true,
      skipEmptyLines: true,
      complete: async function (results: Papa.ParseResult<InputDataItem2>) {
        try {
          const groupedData2: Record<string, DefectDataItem> =
            results.data.reduce((acc, item) => {
              const key = `${item.LineName}_${item.Category}_${item.Shift}`;
              if (!acc[key]) {
                acc[key] = {
                  LineName: item.LineName,
                  Category: item.Category,
                  Shift: item.Shift,
                  Data: [],
                };
              }
              acc[key].Data.push({
                Date: item.Date,
                Qty: item.Qty,
                Mode: item.Mode,
              } as Partial<InputDataItem2>);
              return acc;
            }, {} as Record<string, DefectDataItem>);

          const mappedResult2 = Object.values(groupedData2).map((item) => {
            const modifiedData2 = item.Data.map((innerItem) => ({
              ...innerItem,
              date_picker: monthPicker2,
            }));

            return {
              ...item,
              //Data: modifiedData,
              date_picker: modifiedData2.length
                ? modifiedData2[0].date_picker
                : "", // Set to the first date_picker or empty string if no Data
            };
          });
          setDefectData(mappedResult2);
          setdata2(mappedResult2); // assuming setdata is not asynchronous
        } catch (error) {
          console.error("Error:", error);
        }
      },
    });
  };

  const onSend = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to send ProdInfo to the database?"
    );

    if (confirmed) {
      console.log("Transformed Data:", mappedData);
      const response = await axios.post(
        "http://localhost:8000/input",
        mappedData
      );
      //setMappedData(response.data);
      console.log("Response from Server:", response.data);
    }
  };
  ///////////////////////////////////////////////////////////

  const onSend2 = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to send DefectMode to the database?"
    );
    if (confirmed) {
      console.log("Transformed DefectData:", DefectdData);
      const response = await axios.post(
        "http://localhost:8000/input2",
        DefectdData
      );
      //setMappedData(response.data);
      console.log("Response from Server:", response.data);
    }
  };

  const changeMonth: DatePickerProps["onChange"] = (date, dateString) => {
    setMonthPicker(dateString);
    console.log("Prod changeMonth:", date, dateString);
  };

  const changeMonth2: DatePickerProps["onChange"] = (date, dateString) => {
    setMonthPicker2(dateString);
    console.log("Defect changeMonth:", date, dateString);
  };

  return (
    <div
      className="block_A"
      style={{
        // border: "2px solid red",
        flex: "1",
        display: "flex",
        gap: "4rem",
        alignItems: "center",
        padding: "4rem",
      }}
    >
      {/* File Uploader */}
      <div
        className="A"
        style={{
          boxShadow: "0 0 30px rgba(0, 0, 0, 0.2)",
          borderRadius: "20px",
          flex: "1",
          display: "flex",
          alignItems: "center",
          backgroundColor: "white",
          flexDirection: "column",
          width: "50rem",
          height: "45rem",
        }}
      >
        <h1 style={{ paddingTop: "10rem" }}>Upload Production Info</h1>
        <Form form={form}>
          <FormItem
            // name="Date"
            label={
              <span className="Date" style={{ fontSize: 30 }}>
                Date
              </span>
            }
            rules={[{ required: true, message: "DatePicker is required" }]}
          >
            <DatePicker onChange={changeMonth} picker="month"></DatePicker>
          </FormItem>

          <FormItem
            // name="Csv"
            label={
              <span className="Csv" style={{ fontSize: 30 }}>
                Choose csv
              </span>
            }
            rules={[{ required: true, message: "File is required" }]}
          >
            <input
              type="file"
              name="file"
              accept=".csv"
              onChange={changeHandler}
              multiple
              style={{ display: "block", paddingLeft: "1rem" }}
            />
          </FormItem>

          {/* <Form.Item>
          <Button type="primary" onClick={consoleForm1}>
            Clg from store
          </Button>
        </Form.Item> */}

          <Form.Item>
            <Button type="primary" htmlType="submit" onClick={onSend}>
              Send to database
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* --------------DefectMode---------------- */}

      <div
        className="bt"
        style={{
          //border: "2px solid black",
          borderRadius: "20px",
          boxShadow: "0 0 30px rgba(0, 0, 0, 0.2)",
          flex: "1",
          display: "flex",
          alignItems: "center",
          backgroundColor: "white",
          flexDirection: "column",
          width: "50rem",
          height: "45rem",
        }}
      >
        <h1 style={{ paddingTop: "10rem" }}>Upload Defect Mode</h1>
        <Form form={form1}>
          <FormItem
            // name="Date"
            label={
              <span className="Date" style={{ fontSize: 30 }}>
                Date
              </span>
            }
            rules={[{ required: true, message: "DatePicker is required" }]}
          >
            <DatePicker onChange={changeMonth2} picker="month"></DatePicker>
          </FormItem>

          <FormItem
            // name="Csv"
            label={
              <span className="Csv" style={{ fontSize: 30 }}>
                Choose csv
              </span>
            }
            rules={[{ required: true, message: "File is required" }]}
          >
            <input
              type="file"
              name="file"
              accept=".csv"
              onChange={changeHandler2}
              multiple
              style={{ display: "block", paddingLeft: "1rem" }}
            />
          </FormItem>

          <Form.Item>
            <Button type="primary" htmlType="submit" onClick={onSend2}>
              Send to database
            </Button>
          </Form.Item>
        </Form>

        {/* <Form.Item>
            <Button type="primary" onClick={consoleForm2}>
              Clg from store_defect
            </Button>
          </Form.Item> */}
      </div>
    </div>
  );
};

export default App1;
