import React, { useEffect } from "react";
import useSpeechToText from "./useSpeechToText";

/**
 * Panel chi tiết bài học.
 * - position: fixed -> luôn nằm cố định 1 chỗ trên viewport, KHÔNG bị cuốn
 *   theo scroll của trang phía sau.
 * - Chỉ có 1 cách để đóng: bấm nút "Đóng" (X). Không đóng khi click ra
 *   ngoài, không đóng khi cuộn trang -> tránh cảm giác panel "chạy qua
 *   chạy lại" hoặc tự động biến mất ngoài ý muốn.
 * - Trên mobile: chiếm full màn hình (100dvw x 100dvh).
 * - Khi đóng panel: nếu mic đang ghi âm thì tự động gọi stop() trước.
 */
export default function LessonDetailPanel({ lesson, onClose }) {
  const { transcript, listening, start, stop, supported } =
    useSpeechToText("vi-VN");

  // Khoá scroll nền khi panel mở (chỉ ảnh hưởng trải nghiệm, không đóng panel)
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const handleClose = () => {
    if (listening) stop(); // luôn tắt mic trước khi đóng, không để chạy ngầm
    onClose();
  };

  const handleStopClick = () => {
    stop();
  };

  if (!lesson) return null;

  return (
    <>
      <style>{`
        .ls-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          z-index: 999999;
          display: flex;
          justify-content: flex-end;
        }
        .ls-panel {
          position: fixed;
          top: 0;
          right: 0;
          height: 100dvh;
          width: 420px;
          max-width: 100vw;
          background: #ffffff;
          box-shadow: -8px 0 24px rgba(15, 23, 42, 0.18);
          z-index: 99999;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        @media (max-width: 640px) {
          .ls-panel {
            width: 100vw;
            height: 100dvh;
          }
        }
      `}</style>

      <div className="ls-overlay">
        <div className="ls-panel">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid #e5e7eb",
              background: "#4f46e5",
              color: "#ffffff",
              flexShrink: 0,
            }}
          >
            <div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                Bài học {lesson.stt}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                {lesson.lesson}
              </div>
            </div>
            <button
              onClick={handleClose}
              aria-label="Đóng"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                color: "#fff",
                width: 36,
                height: 36,
                borderRadius: 8,
                fontSize: 18,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: 20, flex: 1 }}>
            <p style={{ color: "#334155", lineHeight: 1.6 }}>
              Nội dung chi tiết của <strong>{lesson.lesson}</strong> (ID:{" "}
              {lesson.id}) sẽ hiển thị ở đây — hội thoại mẫu, từ vựng, ghi
              chú luyện nói...
            </p>

            <div
              style={{
                marginTop: 24,
                padding: 16,
                borderRadius: 12,
                background: "#eef2ff",
                border: "1px solid #c7d2fe",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: "#3730a3",
                  marginBottom: 10,
                }}
              >
                Luyện nói (Speech to Text)
              </div>

              {!supported ? (
                <div style={{ color: "#b91c1c", fontSize: 14 }}>
                  Trình duyệt này không hỗ trợ nhận diện giọng nói.
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <button
                      onClick={start}
                      disabled={listening}
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "none",
                        background: listening ? "#a5b4fc" : "#4f46e5",
                        color: "#fff",
                        fontWeight: 600,
                        cursor: listening ? "not-allowed" : "pointer",
                      }}
                    >
                      🎤 {listening ? "Đang nghe..." : "Bắt đầu nói"}
                    </button>
                    <button
                      onClick={handleStopClick}
                      disabled={!listening}
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "1px solid #4f46e5",
                        background: "#fff",
                        color: "#4f46e5",
                        fontWeight: 600,
                        cursor: !listening ? "not-allowed" : "pointer",
                        opacity: !listening ? 0.5 : 1,
                      }}
                    >
                      ⏹ Dừng
                    </button>
                  </div>

                  <div
                    style={{
                      minHeight: 80,
                      background: "#fff",
                      border: "1px dashed #c7d2fe",
                      borderRadius: 8,
                      padding: 10,
                      fontSize: 14,
                      color: "#1e293b",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {transcript || "Văn bản nhận diện được sẽ hiện ở đây..."}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
