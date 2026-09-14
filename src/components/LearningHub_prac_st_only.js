import React from "react";
import { useLocation } from "react-router-dom";
import Dictaphone from "../ulti/RegcognitionV2024-05-NG_FOR_TEACHING";

const LearningHub_prac_st_only = () => {
  const locationSet = useLocation();
  const params = new URLSearchParams(locationSet.search);
  const readableSt = params.get("st")?.split("-").join(" ") || "";
  const rawNote = params.get("note");

  let readNote = "";
  if (rawNote) {
    try {
      readNote = decodeURIComponent(rawNote);
    } catch (e) {
      console.error("Lỗi giải mã URI:", e);
      readNote = "[Lỗi định dạng dữ liệu]";
    }
  }

  return (
    <>
      <style jsx>{`
        .practice-container {
          margin-top: var(--app-header-h, 8vh);
          padding: 5%;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .practice-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
          position: relative;
          overflow: hidden;
        }

        .practice-header::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .practice-header-content {
          position: relative;
          z-index: 2;
        }

        .practice-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .practice-subtitle {
          font-size: 1.2rem;
          opacity: 0.9;
          text-align: center;
          margin: 0;
        }

        .dictaphone-section {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid #e9ecef;
          position: relative;
        }

        .dictaphone-header {
          text-align: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f8f9fa;
        }

        .dictaphone-title {
          color: #667eea;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .notes-section {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid #e9ecef;
        }

        .notes-header {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          border-radius: 12px;
          padding: 1rem 1.5rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 4px 12px rgba(17, 153, 142, 0.3);
        }

        .notes-content {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #495057;
        }

        .note-item {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          border-left: 4px solid #667eea;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          position: relative;
        }

        .note-item:hover {
          transform: translateX(5px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.15);
          border-left-color: #764ba2;
        }

        .note-item::before {
          content: counter(note-counter);
          counter-increment: note-counter;
          position: absolute;
          left: -2px;
          top: -10px;
          background: #667eea;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: bold;
        }

        .notes-list {
          counter-reset: note-counter;
        }

        .floating-shapes {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }

        .shape {
          position: absolute;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: float 8s ease-in-out infinite;
        }

        .shape:nth-child(1) {
          width: 80px;
          height: 80px;
          top: 10%;
          right: 10%;
          animation-delay: 0s;
        }

        .shape:nth-child(2) {
          width: 60px;
          height: 60px;
          bottom: 20%;
          left: 15%;
          animation-delay: 3s;
        }

        .shape:nth-child(3) {
          width: 40px;
          height: 40px;
          top: 60%;
          right: 20%;
          animation-delay: 6s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 1;
          }
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          color: #6c757d;
        }

        .empty-state-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .badge-info {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .practice-container {
            padding: 3%;
            margin-top: 30px;
          }

          .practice-title {
            font-size: 1.8rem;
            flex-direction: column;
            gap: 0.5rem;
          }

          .practice-header,
          .dictaphone-section,
          .notes-section {
            padding: 1.5rem;
          }

          .note-item {
            padding: 1rem;
          }

          .notes-content {
            font-size: 1rem;
          }
        }

        @media (max-width: 576px) {
          .practice-container {
            padding: 2%;
          }

          .practice-title {
            font-size: 1.5rem;
          }

          .practice-header,
          .dictaphone-section,
          .notes-section {
            padding: 1rem;
          }
        }
      `}</style>

      <div className="practice-container">
        {/* Practice Header */}

        {/* Dictaphone Section */}
        <div className="dictaphone-section">
          <div className="dictaphone-header">
            <h2 className="dictaphone-title">
              <i className="bi bi-headphones"></i>
              Bắt đầu luyện tập
            </h2>
            <div className="badge-info">
              <i className="bi bi-info-circle me-1"></i>
              Hãy nói to và rõ ràng
            </div>
          </div>

          <Dictaphone CMDlist={readableSt} />
        </div>
        <div className="practice-header">
          <div className="floating-shapes">
            <div className="shape"></div>
            <div className="shape"></div>
            <div className="shape"></div>
          </div>

          <div className="practice-header-content">
            <h1 className="practice-title">
              <i className="bi bi-mic-fill"></i>
              Thực hành phát âm
            </h1>
            <p className="practice-subtitle">
              <i className="bi bi-chat-quote me-2"></i>
              Luyện tập câu: "{readableSt}"
            </p>
          </div>
        </div>
        {/* Notes Section */}
        {readNote ? (
          <div className="notes-section">
            <div className="notes-header">
              <i className="bi bi-journal-text"></i>
              <div>
                <h3 className="mb-0">Ghi chú tham khảo</h3>
                <small style={{ opacity: 0.9 }}>
                  Thông tin hỗ trợ cho việc luyện tập
                </small>
              </div>
            </div>

            <div className="notes-content">
              {readNote === "[Lỗi định dạng dữ liệu]" ? (
                <div className="alert alert-warning" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {readNote}
                </div>
              ) : (
                <div className="notes-list">
                  {readNote.split("zzz").map((note, index) => (
                    <div key={index} className="note-item">
                      {note.trim() || "Không có nội dung"}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="notes-section">
            <div className="empty-state">
              <i className="bi bi-journal empty-state-icon"></i>
              <h4>Không có ghi chú</h4>
              <p className="mb-0">Chưa có thông tin tham khảo cho câu này</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LearningHub_prac_st_only;
