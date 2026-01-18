"use client"; // Wajib pakai ini karena Toaster butuh browser API

import { Toaster } from "react-hot-toast";

export default function ToasterContext() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        // Opsi global (opsional)
        duration: 3000,
        style: {
          background: "#333",
          color: "#fff",
        },
      }}
    />
  );
}
