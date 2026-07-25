import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Clean Car Estética Automotiva";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #03071e 0%, #0d1a7d 100%)",
          color: "#eef0f3",
        }}
      >
        <div style={{ display: "flex", fontSize: 88, fontWeight: 800, letterSpacing: -2 }}>
          <span>CLEAN</span>
          <span style={{ color: "#67e8f9", marginLeft: 24 }}>CAR</span>
        </div>
        <div style={{ display: "flex", fontSize: 34, marginTop: 24, color: "#9aa0ab" }}>
          Estética Automotiva · Mogi das Cruzes
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 22,
            padding: "10px 28px",
            borderRadius: 999,
            border: "2px solid #f2b544",
            color: "#f2b544",
          }}
        >
          Produtos Vonixx · Química Premium
        </div>
      </div>
    ),
    { ...size }
  );
}
