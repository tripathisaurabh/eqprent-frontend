"use client";
import { useEffect, useState } from "react";

export default function ApiTest() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5001/api/equipments?limit=3")
      .then(res => res.json())
      .then(data => {
        console.log("API Test Response:", data);
        setData(data);
      })
      .catch(err => console.error("API Test Error:", err));
  }, []);

  return (
    <div style={{ padding: "20px", background: "#f0f0f0", margin: "20px" }}>
      <h3>API Test Component</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}