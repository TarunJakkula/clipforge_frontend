import React from "react";
import Header from "./components/Header";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-center items-center w-screen">
      <Header />
      {children}
    </div>
  );
}
