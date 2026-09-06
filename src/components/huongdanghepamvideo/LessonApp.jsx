import React, { useEffect, useState } from "react";
import LessonDetailPanel from "./LessonDetailPanel";
import lesondata from "./lessons.json"; // Giả sử bạn có file JSON chứa dữ liệu bài học
/**
 * LessonApp
 * - Lấy dữ liệu bài học từ file JSON giả định dạng [{ stt, id, lesson }].
 * - Hiển thị danh sách "Bài học 1", "Bài học 2"...
 * - Bấm vào 1 bài -> mở LessonDetailPanel (panel cố định, xem file đó).
 */
export default function LessonApp() {
  const [lessons, setLessons] = useState(lesondata || []);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "24px 16px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b" }}>
        Danh sách bài học
      </h1>

      {loading && <p style={{ color: "#64748b" }}>Đang tải bài học...</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {lessons.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelected(item)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              textAlign: "left",
              padding: "14px 16px",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              background: "#fff",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#4f46e5",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {item.stt}
            </span>
            <span style={{ fontSize: 15, color: "#1e293b", fontWeight: 500 }}>
              Bài học {item.stt}: {item.lesson}
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <LessonDetailPanel
          lesson={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
