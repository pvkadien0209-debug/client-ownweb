import React, { useEffect, useState } from "react";
import LinkAPI from "../ulti/T0_linkApi";
import ReasonUsage from "./A1_Home_reasonslideshow";
import MethodUsage from "./A1_Home_methodslideshow";
import TrustSection from "./A1_Home_trustslideshow";
import Register from "./A1_Home_thamgia";
import ModernLandingPage from "./A1_Know_Ghepam";
const PLAYLIST_ID = "PLC0acE0qMKOkXtgSnKc9uhj6Ekj-8VDo5";

const PLAYLIST_ID_HD = "PLC0acE0qMKOkBpb7YJl4sgVhP2OGJmzQS";
// Component slideshow video YouTube
const VideoSlideshow = ({ ID }) => {
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const API_KEY = "AIzaSyBWBxqpLe4z7BFwmuDegv82QH7ZTofrO-o";

  useEffect(() => {
    const fetchPlaylistVideos = async () => {
      try {
        const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${API_KEY}&playlistId=${ID}&part=snippet&maxResults=50`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        setVideos(data.items || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách phát:", error);
      }
    };
    fetchPlaylistVideos();
  }, []);

  const nextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
  };

  const prevVideo = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  if (videos.length === 0)
    return (
      <div className="text-center py-5 text-muted">
        <div className="spinner-border spinner-border-sm me-2" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        Đang tải video…
      </div>
    );

  return (
    <div className="position-relative">
      <div className="video-frame mb-3">
        <iframe
          src={`https://www.youtube.com/embed/${videos[currentVideoIndex]?.snippet?.resourceId?.videoId}`}
          title={videos[currentVideoIndex]?.snippet?.title}
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <button className="btn btn-video-nav" onClick={prevVideo}>
          <i className="bi bi-chevron-left"></i>
          <span className="d-none d-sm-inline ms-1">Trước</span>
        </button>
        <span className="video-counter">
          {currentVideoIndex + 1} / {videos.length}
        </span>
        <button className="btn btn-video-nav" onClick={nextVideo}>
          <span className="d-none d-sm-inline me-1">Sau</span>
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>

      <h6 className="mt-3 text-center video-title">
        {videos[currentVideoIndex]?.snippet?.title}
      </h6>
    </div>
  );
};

// Component form đăng ký
const RegistrationForm = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const formatTime = (date) => {
    return date.toLocaleString("vi-VN");
  };

  const handleSubmit = async () => {
    if (!phoneNumber.trim()) {
      alert("Vui lòng nhập số điện thoại");
      return;
    }

    if (!phoneNumber.match(/^[0-9]{10,11}$/)) {
      alert("Số điện thoại không hợp lệ");
      return;
    }

    setIsSubmitting(true);

    try {
      const requestBody = {
        subjectText: `Đăng ký khóa học tiếng Anh | SĐT: ${phoneNumber} | ${formatTime(
          new Date(),
        )}`,
        contentText: `Khách hàng đăng ký với số điện thoại: ${phoneNumber}\nThời gian: ${formatTime(
          new Date(),
        )}\nLink: ${window.location.href}`,
        toEmail: "pvkadien0209@gmail.com",
      };

      // Thay thế LinkAPI bằng URL API thực tế
      const response = await fetch(LinkAPI + "mail-homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const json = await response.json();

      if (json.success) {
        setSubmitted(true);
        setPhoneNumber("");
      } else {
        alert("Đăng ký không thành công, vui lòng thử lại");
      }
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
      // Mô phỏng thành công cho demo
      setSubmitted(true);
      setPhoneNumber("");
    }

    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="text-center py-5">
        <div
          className="card border-0 shadow-lg mx-auto"
          style={{ maxWidth: "500px", borderRadius: 16 }}
        >
          <div className="card-body p-5">
            <i
              className="bi bi-check-circle-fill text-success"
              style={{ fontSize: "4rem" }}
            ></i>
            <h3 className="mt-3 text-success">Đăng ký thành công!</h3>
            <p className="text-muted">
              Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để tư vấn về
              khóa học.
            </p>
            <button
              className="btn btn-outline-primary mt-3"
              onClick={() => setSubmitted(false)}
            >
              Đăng ký thêm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-5">
      <div
        className="card border-0 shadow-lg mx-auto"
        style={{ maxWidth: "500px", borderRadius: 16 }}
      >
        <div className="card-body p-5">
          <i
            className="bi bi-telephone-fill text-primary"
            style={{ fontSize: "3rem" }}
          ></i>
          <h3 className="mt-3 mb-4 text-dark">Đăng ký tư vấn</h3>

          <div>
            <div className="mb-3">
              <input
                type="tel"
                className="form-control form-control-lg text-center"
                placeholder="Nhập số điện thoại của bạn"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {phoneNumber && (
              <div className="mb-3 p-3 bg-light rounded">
                <small className="text-muted">Xác nhận số điện thoại:</small>
                <div className="fw-bold text-primary">{phoneNumber}</div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              className="btn btn-primary btn-lg w-100"
              disabled={!phoneNumber.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Đang gửi...
                </>
              ) : (
                "Gửi thông tin đăng ký"
              )}
            </button>
          </div>

          <p className="text-muted mt-3 small">
            Chúng tôi cam kết bảo mật thông tin cá nhân của bạn
          </p>
        </div>
      </div>
    </div>
  );
};

// Đối tượng phù hợp với khóa học — hiển thị dạng card thay vì các dòng h3
const audiences = [
  {
    icon: "bi-mortarboard",
    text: "Sinh viên, học sinh kém tự tin hoặc không có khả năng nghe nói.",
  },
  {
    icon: "bi-briefcase",
    text: "Người đi làm cần nghe nói cơ bản.",
  },
  {
    icon: "bi-airplane",
    text: "Người chuẩn bị sang nước ngoài định cư, xuất khẩu lao động.",
  },
  {
    icon: "bi-journal-bookmark",
    text: "Sinh viên, học sinh muốn luyện 1000 hoặc 3000 từ vựng căn bản để vững chắc nền tảng.",
  },
];

// Component chính
const EnglishLandingPage = () => {
  return (
    <div className="min-vh-100 home-page">
      <div style={{ height: "8vh" }}></div>
      {/* Bootstrap CSS */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
        rel="stylesheet"
      />
      <style>{`
        .home-page {
          background: #f6f7fb;
          color: #1e293b;
        }
        /* ====== Hero ====== */
        .home-hero {
          background:
            radial-gradient(1100px 500px at 85% -10%, rgba(255,255,255,0.14), transparent 60%),
            linear-gradient(150deg, #312e81 0%, #4f46e5 100%);
          color: #fff;
          padding: 4.5rem 0 5.5rem;
          position: relative;
          overflow: hidden;
        }
        .home-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 999px;
          padding: 0.4rem 1rem;
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 1.25rem;
        }
        .home-hero h1 {
          font-weight: 800;
          letter-spacing: -0.02em;
          font-size: clamp(1.9rem, 5vw, 3.2rem);
          line-height: 1.2;
          margin-bottom: 1rem;
        }
        .home-hero .hero-sub {
          color: rgba(255, 255, 255, 0.85);
          font-size: 1.1rem;
          max-width: 640px;
          margin: 0 auto 2.25rem;
        }
        .audience-card {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 1.1rem 1.25rem;
          height: 100%;
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          text-align: left;
          backdrop-filter: blur(6px);
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .audience-card:hover {
          background: rgba(255, 255, 255, 0.16);
          transform: translateY(-2px);
        }
        .audience-card i {
          font-size: 1.4rem;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.18);
          width: 2.6rem;
          height: 2.6rem;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .audience-card p {
          margin: 0;
          font-size: 0.98rem;
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.95);
        }
        .hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #fff;
          color: #3730a3;
          font-weight: 700;
          border: none;
          border-radius: 14px;
          padding: 0.85rem 1.75rem;
          text-decoration: none;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .hero-cta:hover {
          color: #3730a3;
          transform: translateY(-2px);
          box-shadow: 0 14px 36px rgba(0, 0, 0, 0.25);
        }
        /* ====== Section chung ====== */
        .home-section-title {
          font-weight: 800;
          letter-spacing: -0.01em;
          color: #1e293b;
          text-align: center;
          font-size: clamp(1.5rem, 4vw, 2.1rem);
          margin-bottom: 0.75rem;
        }
        .home-section-sub {
          color: #64748b;
          text-align: center;
          max-width: 560px;
          margin: 0 auto 2.25rem;
        }
        .home-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06),
            0 6px 18px rgba(15, 23, 42, 0.05);
          padding: 1.75rem;
        }
        /* ====== Video ====== */
        .video-frame {
          position: relative;
          width: 100%;
          padding-top: 56.25%;
          border-radius: 16px;
          overflow: hidden;
          background: #0f172a;
          box-shadow: 0 10px 40px rgba(15, 23, 42, 0.15);
        }
        .video-frame iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }
        .btn-video-nav {
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          color: #4f46e5;
          font-weight: 600;
          padding: 0.5rem 1rem;
          min-height: 44px;
          background: #fff;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .btn-video-nav:hover {
          background: #eef2ff;
          border-color: #c7d2fe;
          color: #3730a3;
        }
        .video-counter {
          color: #64748b;
          font-variant-numeric: tabular-nums;
          font-weight: 500;
        }
        .video-title {
          color: #1e293b;
          font-weight: 600;
        }
        .home-footer {
          background: #0f172a;
          color: rgba(255, 255, 255, 0.7);
          padding: 2rem 0;
          text-align: center;
        }
        @media (max-width: 576px) {
          .home-hero {
            padding: 3rem 0 3.5rem;
          }
          .home-card {
            padding: 1.25rem;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .audience-card,
          .hero-cta {
            transition: none;
          }
        }
      `}</style>

      {/* Hero Section */}

      {/* <Register /> */}
      <section className="home-hero text-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <span className="home-hero-badge">
                <i className="bi bi-soundwave"></i>
                Rèn tiếng Anh nghe nói
              </span>
              <h1>
                Chúng ta không thiếu nơi để "HỌC"
                <br />
                Chúng ta thực cần tìm "NƠI RÈN LUYỆN"
              </h1>
              <p className="hero-sub">
                Khóa rèn luyện dành cho người từ mất gốc hoặc chỉ cần giao tiếp
                cơ bản đến cần lấy chứng chỉ— Ứng dụng công nghệ AI.
              </p>
              <h1>HỌC 2 - RÈN 8</h1>
              <h3>Rèn kỹ năng – Dựng tự tin.</h3>

              <div className="row g-3 mb-4">
                {audiences.map((a, i) => (
                  <div className="col-md-6" key={i}>
                    <div className="audience-card">
                      <i className={`bi ${a.icon}`}></i>
                      <p>{a.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a href="#video-ketqua" className="hero-cta">
                <i className="bi bi-play-circle"></i>
                Xem kết quả học viên
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-5" id="video-ketqua">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h2 className="home-section-title">
                Kết quả trực quan trong thời gian ngắn
              </h2>
              <p className="home-section-sub">
                Học viên thực hành thật — kết quả ghi nhận thật.
              </p>
              <div className="home-card">
                <VideoSlideshow ID={PLAYLIST_ID} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <ReasonUsage />
      {/* Video Section */}
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h2 className="home-section-title">
                Hướng dẫn ghép âm chi tiết, tận tâm
              </h2>
              <p className="home-section-sub">
                Video hướng dẫn từng bước cho người mới bắt đầu.
              </p>
              <div className="home-card">
                <VideoSlideshow ID={PLAYLIST_ID_HD} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <MethodUsage />

      {/* <TrustSection /> */}

      {/* <Register /> */}

      <section className="py-5">
        <div className="container">
          {/* <h1 className="text-center text-white mb-5 display-5 fw-bold">
            Để lại số điện thoại, chúng tôi sẽ liên hệ bạn
          </h1>
          <RegistrationForm /> */}
        </div>
      </section>
      <ModernLandingPage />
      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <p className="mb-0">
            © 2025 Khóa học tiếng Anh hiệu quả — Liên hệ ngay để được tư vấn
            miễn phí
          </p>
        </div>
      </footer>
    </div>
  );
};

export default EnglishLandingPage;
