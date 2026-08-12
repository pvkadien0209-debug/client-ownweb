import React, { useEffect, useState, createContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Header from "./components/A1_Header";
import Lobby from "./components/Lobby";
import NameDiv from "./components/A1_Name";
import RoomN from "./components/RoomN";
import Room from "./components/Room";
import RoomOffline from "./components/Roomoffline";
import NotExist from "./components/NotExist";
import LinkToday from "./components/LinkToday";
import LearningHub from "./components/LearningHub";
import LearningByHeartHub from "./components/LearningByHeart";
import Settings from "./components/setting";
import ChatWidget from "./components/ChatWidget";
import io from "socket.io-client";
import initializeVoicesAndPlatform from "./ulti/initializeVoicesAndPlatform";
import "bootstrap-icons/font/bootstrap-icons.css";
import HomeView from "./components/A1_Home";
// import LinkAPI from "./ulti/T0_linkApi";
import KnowGhepAm from "./components/A1_Know_Ghepam";
import GHEPAM3000WORDS from "./components/A1_IPA_GHEPAM_3000Words";
import LearningHub_prac_st_only from "./components/LearningHub_prac_st_only";
import PixiCanvas from "./components/prac_componets/inside_01_components/PixiJS";
// import RootPrac from "./components/prac_componets/B1_RootPrac";
import TTSStartButton from "./components/serverStart/serverStartTtsList";

// import JointPharmaWebsite from "./components/A1_JMC";
const LinkAPI =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://seo-onlineplay-new2024-server-428bb40ca879.herokuapp.com/";

const socket = io(LinkAPI, {
  transports: ["websocket", "polling", "flashsocket"],
});

export const ObjREADContext = createContext(null);

const App = () => {
  const [sttRoom, setSttRoom] = useState(false);
  const [STTconnect01, setSTTconnect01] = useState(false);
  const [STTconnect02, setSTTconnect02] = useState(false);
  const [STTconnectFN, setSTTconnectFN] = useState(0);
  const [ObjREAD, setObjREAD] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await initializeVoicesAndPlatform();
      console.log(data);
      setObjREAD(data);
      // console.log(JSON.stringify(data));
      if (data.imale === null || data.ifemale === null) {
        setTimeout(() => {
          fetchData();
        }, 1000);
        // setSTTconnectFN(2);
      } else {
        setSTTconnect01(true);
      }
    };
    if (ObjREAD === null) {
      fetchData();
    }
  }, []);

  useEffect(() => {
    // Check socket connection status
    const handleSocketConnection = () => {
      localStorage.getItem("dinhDanh") ||
        localStorage.setItem("dinhDanh", socket.id);
      setSTTconnect02(socket.connected);
    };

    // Listen to socket connection events
    socket.on("connect", handleSocketConnection);
    socket.on("disconnect", handleSocketConnection);

    // Clean up socket event listeners
    return () => {
      socket.off("connect", handleSocketConnection);
      socket.off("disconnect", handleSocketConnection);
    };
  }, [sttRoom]);

  useEffect(() => {
    if (STTconnect01 === true && STTconnect02) {
      setSTTconnectFN(1);
    }
  }, [STTconnect01, STTconnect02]);
  useEffect(() => {
    cleanExpiredScoresAndOldItems();
  }, []);
  return (
    <HelmetProvider>
      <ObjREADContext.Provider value={ObjREAD}>
        <Router>
          {/* <div style={{ height: "8vh" }}></div> */}
          <div className="chat-app">
            <ChatWidget />
            <Routes>
              <Route
                path="/room/:roomCode"
                element={<Room setSttRoom={setSttRoom} />}
              />
              <Route
                path="/roomn/:roomCode/:currentIndex"
                element={<RoomN setSttRoom={setSttRoom} />}
              />
              <Route
                path="/roomoffline/:roomCode/:currentIndex"
                element={<RoomOffline setSttRoom={setSttRoom} />}
              />
              <Route path="/" element={<HomeView />} />
              <Route
                path="/coreknowledge/ghep-tach-am"
                element={<KnowGhepAm />}
              />
              <Route path="/noexist" element={<NotExist />} />
              <Route path="/link" element={<LinkToday />} />
              <Route
                path="/learninghub/:id"
                element={
                  <LearningHub
                    setSttRoom={setSttRoom}
                    STTconnectFN={STTconnectFN}
                  />
                }
              />
              <Route
                path="/learningbyheart/:id/:id01"
                element={<LearningByHeartHub STTconnectFN={STTconnectFN} />}
              />
              <Route path="/setting" element={<Settings />} />
              <Route path="/name" element={<NameDiv />} />
              <Route path="/pracst" element={<LearningHub_prac_st_only />} />
              <Route path="/game" element={<PixiCanvas />} />{" "}
              <Route path="/rhyming" element={<GHEPAM3000WORDS />} />{" "}
              <Route path="/ttslist" element={<TTSStartButton />} />
              {/* <Route path="/jmc" element={<JointPharmaWebsite />} /> */}
              <Route
                path="*"
                element={
                  <main
                    style={{
                      minHeight: "100vh",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--brand-bg, #f6f7fb)",
                      padding: "1rem",
                    }}
                  >
                    <div
                      style={{
                        textAlign: "center",
                        background: "#fff",
                        borderRadius: 16,
                        padding: "2.5rem 2rem",
                        maxWidth: 420,
                        width: "100%",
                        boxShadow:
                          "0 1px 3px rgba(15,23,42,.06), 0 6px 18px rgba(15,23,42,.05)",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <i
                        className="bi bi-compass"
                        style={{ fontSize: "3rem", color: "#4f46e5" }}
                      ></i>
                      <h4 style={{ margin: "1rem 0 .5rem", color: "#1e293b" }}>
                        Không tìm thấy trang
                      </h4>
                      <p style={{ color: "#64748b", marginBottom: "1.25rem" }}>
                        Đường dẫn này không tồn tại hoặc đã được di chuyển.
                      </p>
                      <Link
                        to="/"
                        style={{
                          display: "inline-block",
                          background: "#4f46e5",
                          color: "#fff",
                          textDecoration: "none",
                          fontWeight: 600,
                          padding: ".7rem 1.5rem",
                          borderRadius: 12,
                        }}
                      >
                        Về trang chủ
                      </Link>
                    </div>
                  </main>
                }
              />
            </Routes>
            <Header sttRoom={sttRoom} STTconnectFN={STTconnectFN} />
          </div>
        </Router>
      </ObjREADContext.Provider>
    </HelmetProvider>
  );
};

export default App;
export { socket };

// <Lobby
// STTconnectFN={STTconnectFN}
// setSttRoom={setSttRoom}
// fileName={"elementary-a1-lesson-plan"}
// objList={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
// objListDefault={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
// custom={false}
// />
function cleanExpiredScoresAndOldItems() {
  const now = Date.now();
  const FOUR_HOURS = 4 * 60 * 60 * 1000;
  const TEN_HOURS = 10 * 60 * 60 * 1000;

  const skipKeys = [
    "ReadMessage",
    "dinhDanh",
    "nameDinhDanh",
    "speechly-auth-token",
    "speechly-device-id",
    "groupChat",
  ];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    try {
      const raw = localStorage.getItem(key);
      const item = JSON.parse(raw);
      const expires = item?.expires;
      const createdAt = item?.createdAt;

      const isScoreKey = key.includes("score");
      const isExpired = expires && now > expires;
      const isTooOld4h = createdAt && now - createdAt > FOUR_HOURS;
      const hasNoTimeInfo = !expires && !createdAt;

      const isTooOld10h = createdAt && now - createdAt > TEN_HOURS;
      const isInSkipList = skipKeys.includes(key);

      // 1. Xử lý key chứa 'score'
      if (isScoreKey && (isExpired || isTooOld4h || hasNoTimeInfo)) {
        localStorage.removeItem(key);
        i--;
        continue;
      }

      // 2. Nếu key không nằm trong danh sách loại trừ:
      if (!isInSkipList) {
        // Xóa nếu quá 10 tiếng hoặc không có createdAt
        // if (isTooOld10h || !createdAt) {
        //   localStorage.removeItem(key);
        //   i--;
        //   continue;
        // }
        if (isTooOld10h) {
          localStorage.removeItem(key);
          i--;
          continue;
        }
      }
    } catch (e) {
      // Nếu không parse được JSON → xóa trừ khi nằm trong danh sách loại trừ
      if (!skipKeys.includes(key)) {
        localStorage.removeItem(key);
        i--;
      }
    }
  }
}
