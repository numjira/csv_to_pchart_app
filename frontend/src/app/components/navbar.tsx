import React from "react";
import Image from "next/image";
import denso from "@/app/assets/denso.png";
import Bt_page from "./Bt_page";

const Navbar = () => {
  return (
    <div
      style={{
        borderBottom: "5px solid lightgray",
        display: "flex",
      }}
    >
      <div
        className="image"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          src={denso}
          alt="denso"
          width={170}
          height={85}
          priority={true}
        ></Image>
        {""}
      </div>
      <div
        className="space"
        style={{
          display: "flex",
        }}
      ></div>
      <div
        className="bt"
        style={{
          backgroundColor: "white",
          flex: "1",
          display: "flex",
          gap: "6rem",
          alignItems: "center",
        }}
      >
        <Bt_page />
      </div>
    </div>
  );
};
export default Navbar;
