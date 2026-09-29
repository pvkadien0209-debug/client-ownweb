// RoomofflineV6.js
//
// File MỚI HOÀN TOÀN — bài thực hành thứ 6, ĐẦU TIÊN có chơi CHUNG nhiều
// người (2, 5, 10... người cùng phòng), đặt trong folder riêng
// (components/RoomofflineV6/), KHÔNG sửa bất kỳ dòng nào trong
// Roomoffline.js, RoomofflineV2-V5.js, Room.js hay các file khác.
//
// NGUYÊN TẮC (theo yêu cầu): việc TẠO PHÒNG diễn ra ngay trong V này — vào
// đúng link có tên phòng ở cuối là được vào chơi chung ngay.
//
// BƯỚC 1 (đã xong): khung sườn "vào phòng chung" — tự chọn/tạo tên phòng,
// URL tự thêm tên phòng sau khi tạo để chia sẻ, hiện danh sách người chơi
// đồng bộ qua socket (server: server/router/ioArenaV6.js, KHÔNG đụng
// router/io.js cũ).
//
// BƯỚC "chọn nhân vật" — mỗi nhân vật có 1 hệ số nhân sát thương riêng,
// server là nơi giữ và áp dụng hệ số thật (xem CHARACTERS bên dưới +
// CHARACTER_DAMAGE_MULTIPLIER trong ioArenaV6.js). Từ BƯỚC 7 trở đi, bước
// này CHỈ còn áp dụng cho người VÀO qua link chia sẻ (học sinh) — người TẠO
// phòng giờ luôn là Boss, không cần chọn nhân vật (xem BƯỚC 7 bên dưới).
//
// BƯỚC 2 — HỎI-ĐÁP ĐỘC LẬP TRÊN TỪNG MÁY (không đồng bộ vòng chơi chung):
//   Mỗi người tự luyện — TÁI HIỆN Y HỆT vòng lặp của RoomofflineV2.js (chọn 1
//   câu ngẫu nhiên từ DataPracticingCharactor → đọc to bằng ReadMessage →
//   người chơi nói/gõ câu trả lời qua RoomofflineV2InputPanel (TÁI SỬ DỤNG
//   nguyên component, không sửa) → chấm bằng ĐÚNG cơ chế so khớp của V2
//   (findBest/checkArrays với currentItem.submit/data, hoặc compareTwoStrings
//   làm phương án dự phòng khi bài thiếu submit/data — TÁI SỬ DỤNG nguyên
//   roomofflineV2AnswerMatcher.js, không sửa). Ai làm nhanh, làm đúng nhiều
//   thì có lợi thế nhanh hơn — hoàn toàn theo năng lực từng người, KHÔNG bị
//   tốc độ người khác ảnh hưởng.
//
// BƯỚC "3 yêu cầu bổ sung":
//   1. CHỈ CHO CHƠI TRÊN WEB (trình duyệt máy tính thường) — chặn ngay từ
//      đầu nếu phát hiện thiết bị di động hoặc trình duyệt trong app (Zalo/
//      Messenger/Instagram — copy cách nhận diện từ detectInAppBrowser trong
//      pracPages/C_RoomOffline_LAYDULIEUTH.js, không sửa file đó).
//   2. "Ô chơi" (khối chứa toàn bộ giao diện chơi) CỐ ĐỊNH 90% x 90%
//      viewport, KHÔNG bị ảnh hưởng bởi cuộn trang — TÁI HIỆN ĐÚNG kỹ thuật
//      đã dùng ở RoomofflineV2.js.
//   3. "Bảng tham khảo" + "Gợi ý" của V2 — TÁI SỬ DỤNG nguyên TableHD,
//      buildTableOfContent, helper_fn_localStorage, isImageUrl.
//
// BƯỚC 5/6 (LỊCH SỬ — đã bị BƯỚC 7 thay thế hoàn toàn, ghi lại để biết vì
// sao có 1 số comment/tên biến cũ còn thấy trong ioArenaV6.js cũ): bàn cờ
// 10x10, Boss là AI tự đuổi/tự đánh theo nhịp riêng, "điểm yếu" bật/tắt theo
// chu kỳ, tài nguyên ⚡ CHỈ lưu ở client (server không giữ sổ riêng).
//
// BƯỚC 7 — "Chủ phòng LUÔN là Boss" + hệ Máu/Mana/Đơn vị tiêu dùng (MỚI
// NHẤT, THAY ĐỔI LỚN — đọc kỹ server/router/ioArenaV6.js trước khi sửa
// tiếp, vì gần như toàn bộ BƯỚC 5/6 đã bị THAY THẾ):
//   1. NGƯỜI TẠO PHÒNG LUÔN LÀ BOSS (thường là giáo viên) — KHÔNG còn màn
//      hình chọn nhân vật cho người này (Boss không có "nhân vật"), thay
//      bằng 1 màn hình giới thiệu ngắn + đặt tên phòng. Người VÀO qua link
//      chia sẻ (gameRoom có trên URL) VẪN phải chọn nhân vật như cũ — họ
//      luôn là học sinh.
//   2. BOSS TỰ ĐIỀU KHIỂN — dùng CHUNG D-pad di chuyển với học sinh (Boss
//      giờ chỉ là 1 "người chơi" như mọi người, có pos trên bàn cờ), và có
//      thêm 2 nút riêng: "Tấn công mục tiêu" (phải BẤM CHỌN 1 học sinh trên
//      bản đồ trước — ĐÚNG lựa chọn đã chọn) + "Kỹ năng AOE" (đòn diện rộng,
//      trúng nhiều học sinh quanh Boss cùng lúc, có thời gian hồi riêng).
//   3. HỆ MÁU/MANA/ĐƠN VỊ TIÊU DÙNG — server giữ SỔ THẬT cho cả 3 (khác hẳn
//      tài nguyên ⚡ chỉ lưu client của BƯỚC 5/6, vì giờ chúng gate hành động
//      thật + quyết định thắng/loại):
//        - Di chuyển tốn Mana (ĐÚNG yêu cầu "di chuyển cũng tốn năng lượng").
//        - Trả lời ĐÚNG hồi Mana, SAI trừ Mana (ĐÚNG yêu cầu "đọc đúng +,
//          sai -", để cổ vũ làm bài tập).
//        - Vào phòng được tặng ngay 100 Đơn vị tiêu dùng (ĐÚNG yêu cầu "kích
//          thích được chơi trước") — dùng để mua đồ ở Cửa hàng (Khiên chắn/
//          Bình hồi Mana/Thẻ hồi sinh), KHÔNG liên quan Máu/Mana.
//        - Máu về 0: học sinh bị loại (mua Thẻ hồi sinh để vào lại); Boss về
//          0: cả đội THẮNG.
//   4. CHỦ PHÒNG RỜI GIỮA TRẬN → trận "tạm dừng" (server giữ nguyên chỉ số
//      của Boss, KHÔNG chuyển quyền cho ai khác), học sinh vẫn luyện tập
//      chờ; chủ phòng vào lại đúng tên sẽ tự nhận lại ghế Boss.
//
// LƯU Ý (rút kinh nghiệm từ lỗi đã gặp ở RoomofflineV2.js/V3.js): app đang
// bật React.StrictMode — effect bảo vệ setState-sau-unmount phải đặt lại
// isMountedRef.current = true NGAY TRONG phần setup, không chỉ dựa vào giá
// trị khởi tạo useRef(true).

import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { compareTwoStrings } from "string-similarity";
import { socket, ObjREADContext } from "../../App";
import ReadMessage from "../../ulti/ReadMessage_2024";
import isImageUrl from "../../ulti/isImageUrl";
import helper_fn_localStorage from "../../ulti/helper_fn_localStorage";
import DataPracticeComponent from "../pracPages/C_RoomOffline_LAYDULIEUTH";
import TableHD from "../pracPages/B101_FINAL_TABLE-HD";
import {
  interleaveCharacters,
  parseStringToNumbers,
  buildTableOfContent,
} from "../RoomofflineV2/roomofflineV2DataUtils";
import {
  findBest,
  checkArrays,
} from "../RoomofflineV2/roomofflineV2AnswerMatcher";
import RoomofflineV2InputPanel from "../RoomofflineV2/RoomofflineV2InputPanel";
import RoomofflineV6BattleScene from "./RoomofflineV6BattleScene";

// Nhận diện "không phải web máy tính thường" (điện thoại/tablet, hoặc trình
// duyệt trong app như Zalo/Messenger/Instagram) — COPY logic (không import,
// vì bản gốc là hàm nội bộ không export) từ detectInAppBrowser +
// detectBrowser trong pracPages/C_RoomOffline_LAYDULIEUTH.js, gộp lại thành
// 1 điều kiện chặn duy nhất cho V6.
function isDesktopWebPlatform() {
  const ua = (typeof navigator !== "undefined" && navigator.userAgent) || "";
  const isMobileUA =
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
  const isInAppBrowser =
    /Zalo|FBAN|FBAV|FB_IAB|FBIOS|FBANDROID|Instagram|Line\//i.test(ua);
  return !isMobileUA && !isInAppBrowser;
}

// Sinh mã phòng ngẫu nhiên gợi ý — COPY nguyên cách Lobby.js cũ đang sinh
// roomName (Math.random().toString(36).substring(2, 7)), không import vì
// đây chỉ là 1 dòng tiện ích rất nhỏ, không đáng tách file dùng chung.
function generateSuggestedRoomName() {
  return Math.random().toString(36).substring(2, 7);
}

// Bàn cờ 10x10 — PHẢI giữ đúng GRID_SIZE như GRID_SIZE trong ioArenaV6.js (2
// runtime tách biệt, không import chung được). Vị trí MỌI NGƯỜI (kể cả Boss)
// đều do SERVER giữ và gửi về qua arenaUsers[].pos — KHÔNG tự bịa ở client.
const GRID_SIZE = 10;

// Chọn nhân vật (CHỈ áp dụng cho học sinh — Boss không có nhân vật, xem BƯỚC
// 7 đầu file) — ẢNH HƯỞNG GAMEPLAY: mỗi nhân vật có 1 hệ số nhân sát thương
// riêng + 1 tầm đánh riêng — "range" tính theo khoảng cách Chebyshev tới vị
// trí Boss hiện tại. Server (ioArenaV6.js) là nơi DUY NHẤT áp dụng hệ số/tầm
// đánh thật khi cộng dồn sát thương lên Boss — PHẢI giữ đúng cùng bộ id/hệ
// số/tầm đánh ở cả 2 nơi (client/server là 2 runtime tách biệt).
const CHARACTERS = [
  {
    id: "warrior",
    name: "Chiến Binh",
    icon: "🗡️",
    dmgMultiplier: 1.0,
    attackStyle: "melee",
    range: 1,
    desc: "Sát thương ổn định — cận chiến, phải đứng sát Boss mới đánh được",
  },
  {
    id: "mage",
    name: "Pháp Sư",
    icon: "🧙",
    dmgMultiplier: 1.3,
    attackStyle: "ranged",
    range: GRID_SIZE,
    desc: "Sát thương mạnh nhất — tấn công từ xa, không cần lại gần Boss",
  },
  {
    id: "archer",
    name: "Xạ Thủ",
    icon: "🏹",
    dmgMultiplier: 1.15,
    attackStyle: "ranged",
    range: GRID_SIZE,
    desc: "Sát thương khá — tấn công từ xa, cân bằng",
  },
  {
    id: "knight",
    name: "Hiệp Sĩ",
    icon: "🛡️",
    dmgMultiplier: 0.9,
    attackStyle: "melee",
    range: 1,
    desc: "Sát thương nhẹ hơn — cận chiến, an toàn hơn",
  },
];

function getCharacterById(id) {
  return CHARACTERS.find((c) => c.id === id) || null;
}

// ── Hệ Máu/Mana/Đơn vị tiêu dùng (BƯỚC 7) — CHỈ DÙNG ĐỂ HIỂN THỊ/GỢI Ý ở
// client (disable nút cho tiện UX); server (ioArenaV6.js) mới là nơi THẬT SỰ
// trừ/kiểm tra — PHẢI giữ đúng cùng giá trị ở cả 2 nơi (2 runtime tách biệt,
// không import chung được).
const MOVE_MANA_COST = 3;
const STUDENT_ATTACK_MANA_COST = 20;
const BOSS_ATTACK_MANA_COST = 15;
const BOSS_ATTACK_RANGE = 1;
const BOSS_AOE_MANA_COST = 40;
const BOSS_AOE_RANGE = 2;
const BOSS_AOE_COOLDOWN_MS = 3000; // chỉ để disable nút tạm ở client cho gọn UX
const SHIELD_COST_UNITS = 30;
const MANA_POTION_COST_UNITS = 25;
const MANA_POTION_RESTORE = 30;
const REVIVAL_COST_UNITS = 40;
const MANA_PER_CORRECT = 10; // chỉ để hiện chữ "+10 Mana" khi trả lời đúng
const MANA_PER_WRONG = 5; // chỉ để hiện chữ "-5 Mana" khi trả lời sai

// Ngưỡng độ giống (0..1) để tính là trả lời đúng — CHỈ dùng cho phương án dự
// phòng khi currentItem thiếu submit/data (ĐÚNG ngưỡng V2 đang dùng).
const ANSWER_MATCH_THRESHOLD = 0.7;

const RoomofflineV6 = ({ setSttRoom }) => {
  const { roomCode, currentIndex, gameRoom } = useParams();
  const locationSet = useLocation();
  const params = new URLSearchParams(locationSet.search);
  const navigate = useNavigate();
  const ObjREAD = useContext(ObjREADContext);

  const [roomInfo] = useState({ fileName: roomCode });

  // ── Bước 0/1: chọn/vào phòng chơi chung + chọn nhân vật (học sinh) ─────────
  const [arenaRoomName, setArenaRoomName] = useState(gameRoom || null);
  const [roomNameDraft, setRoomNameDraft] = useState(() =>
    generateSuggestedRoomName(),
  );
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  // Người vào phòng qua LINK CHIA SẺ (gameRoom !== undefined) LUÔN là học
  // sinh, phải chọn nhân vật; người TẠO phòng (gameRoom rỗng) LUÔN là Boss
  // (BƯỚC 7), không cần chọn nhân vật — chỉ cần xác nhận màn hình giới
  // thiệu bên dưới.
  const [characterConfirmed, setCharacterConfirmed] = useState(false);

  const [StartToGetData, setStartToGetData] = useState(false);
  const [DataPracticingCharactor, setDataPracticingCharactor] = useState(null);
  const [DataPracticingOverRoll, setDataPracticingOverRoll] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const [arenaJoinState, setArenaJoinState] = useState("idle"); // idle | joining | joined | error
  const [arenaUsers, setArenaUsers] = useState([]);
  const [arenaError, setArenaError] = useState(null);
  const [hostId, setHostId] = useState(null);

  // ── Trận đánh Boss dùng chung (server giữ, client chỉ nhận + hiển thị) ─────
  // Từ BƯỚC 7: battle CHỈ còn {status, contributions} — máu/mana/vị trí Boss
  // giờ nằm ngay trên record trong arenaUsers có isHost:true (xem hostUser).
  const [battle, setBattle] = useState(null);
  const [bossFlash, setBossFlash] = useState(false);
  const prevBossHPRef = useRef(null);

  // Popup "Đội hình" — trạng thái thắng/chờ + nút triệu hồi của chủ phòng +
  // đóng góp cả đội. Lazy-mount giống hệt cách hasOpenedReference/
  // hasOpenedHintModal đã làm.
  const [showBattleModal, setShowBattleModal] = useState(false);
  const [hasOpenedBattleModal, setHasOpenedBattleModal] = useState(false);
  useEffect(() => {
    if (showBattleModal) setHasOpenedBattleModal(true);
  }, [showBattleModal]);

  // Popup "Cửa hàng" (dùng Đơn vị tiêu dùng, CHỈ dành cho học sinh — Boss có
  // Kỹ năng AOE riêng, không cần mua gì): Khiên chắn/Bình hồi Mana/Thẻ hồi
  // sinh (BƯỚC 7, xem handleBuyShield/handleBuyManaPotion/handleBuyRevival).
  const [showShopModal, setShowShopModal] = useState(false);
  const [hasOpenedShopModal, setHasOpenedShopModal] = useState(false);
  useEffect(() => {
    if (showShopModal) setHasOpenedShopModal(true);
  }, [showShopModal]);

  // Mục tiêu Boss đang chọn để tấn công (BƯỚC 7, CHỈ có ý nghĩa khi isHost) —
  // bấm vào 1 học sinh trên bản đồ (RoomofflineV6BattleScene → onPlayerClick)
  // để chọn/bỏ chọn.
  const [selectedTargetId, setSelectedTargetId] = useState(null);

  // Hiệu ứng "vừa có người bị Boss đánh trúng" (BƯỚC 7, gộp chung tấn công
  // đơn + kỹ năng AOE) — {hits:[{id,blocked}], ts} | null, CẢ PHÒNG cùng
  // thấy qua RoomofflineV6BattleScene. Server là nơi DUY NHẤT quyết định máu/
  // bị loại (arenaUpdateRoom) — state này CHỈ để vẽ hiệu ứng, không tự trừ gì.
  const [hitFx, setHitFx] = useState(null);

  // Chỉ để disable tạm nút "Kỹ năng AOE" ở client cho gọn UX trong lúc đang
  // hồi chiêu — server vẫn là nơi chặn thật (MIN_AOE_INTERVAL_MS).
  const [aoeCooldownUntil, setAoeCooldownUntil] = useState(0);
  const [aoeCoolingDown, setAoeCoolingDown] = useState(false);
  useEffect(() => {
    if (!aoeCooldownUntil) return;
    setAoeCoolingDown(true);
    const remain = aoeCooldownUntil - Date.now();
    if (remain <= 0) {
      setAoeCoolingDown(false);
      return;
    }
    const t = setTimeout(() => setAoeCoolingDown(false), remain);
    return () => clearTimeout(t);
  }, [aoeCooldownUntil]);

  // Gợi ý ngắn khi bấm "Tấn công" mà chưa đủ điều kiện (ví dụ cận chiến
  // nhưng chưa đứng sát Boss, hoặc chưa chọn mục tiêu) — tự biến mất sau vài
  // giây.
  const [attackHint, setAttackHint] = useState(null);

  // Tăng dần mỗi lần MÌNH bấm tấn công — CHỈ để cảnh chiến đấu 2D
  // (RoomofflineV6BattleScene) biết khi nào "nảy" nhân vật của MÌNH lên,
  // không gửi lên server, không ảnh hưởng logic sát thương thật.
  const [attackPulse, setAttackPulse] = useState(0);

  // ── Vòng lặp luyện tập — Y HỆT RoomofflineV2.js (câu hỏi độc lập, không
  // đồng bộ với ai) ───────────────────────────────────────────────────────
  const [currentQIndex, setCurrentQIndex] = useState(null); // null = chưa chọn câu
  const [mode, setMode] = useState("noi"); // "noi" | "text"
  const [isReading, setIsReading] = useState(false);
  const [pushAW, setPushAW] = useState([]); // các "tag" đã thu thập cho câu hiện tại
  const justOneRef = useRef(false);
  const [lastCheck, setLastCheck] = useState(null);

  // ── "Bảng tham khảo" + "Gợi ý" (mang lại từ V2, xem ghi chú đầu file) ─────
  // Key localStorage RIÊNG cho V6 ("v6ref_") — không lẫn vị trí đã lưu với
  // V2 ("v2ref_") hay bản gốc Roomoffline.js ("roomCode").
  const ON_TABLE_STORAGE_KEY = `v6ref_${roomCode}`;
  const [showReference, setShowReference] = useState(false);
  const [hasOpenedReference, setHasOpenedReference] = useState(false);
  useEffect(() => {
    if (showReference) setHasOpenedReference(true);
  }, [showReference]);
  const [OnTable, setOnTable] = useState(() => {
    const saved =
      helper_fn_localStorage.getNumberFromLocalStorage(ON_TABLE_STORAGE_KEY);
    return typeof saved === "number" && !isNaN(saved) && saved >= 0
      ? saved
      : null;
  });
  useEffect(() => {
    helper_fn_localStorage.saveNumberToLocalStorage(
      ON_TABLE_STORAGE_KEY,
      OnTable === null ? -1 : OnTable,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [OnTable]);

  const [showHintModal, setShowHintModal] = useState(false);
  const [hasOpenedHintModal, setHasOpenedHintModal] = useState(false);
  useEffect(() => {
    if (showHintModal) setHasOpenedHintModal(true);
  }, [showHintModal]);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (typeof setSttRoom === "function") setSttRoom(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Danh sách người chơi + ai đang là chủ phòng — cập nhật realtime. Từ BƯỚC
  // 7, mỗi phần tử arenaUsers[] còn mang cả hp/maxHp/mana/maxMana/units/
  // shielded/eliminated/isHost/connected (xem makeUser trong ioArenaV6.js).
  useEffect(() => {
    const handleArenaUpdateRoom = (data) => {
      if (!isMountedRef.current) return;
      if (!arenaRoomName || data.roomName !== arenaRoomName) return;
      setArenaUsers(data.users || []);
      if (data.hostId) setHostId(data.hostId);
    };
    socket.on("arenaUpdateRoom", handleArenaUpdateRoom);
    return () => {
      socket.off("arenaUpdateRoom", handleArenaUpdateRoom);
    };
  }, [arenaRoomName]);

  // Trạng thái trận (thắng/đang diễn ra) + đóng góp — DO SERVER làm chủ.
  useEffect(() => {
    const handleArenaBattleUpdate = (data) => {
      if (!isMountedRef.current) return;
      if (!arenaRoomName || data.roomName !== arenaRoomName) return;
      setBattle(data.battle);
    };
    socket.on("arenaBattleUpdate", handleArenaBattleUpdate);
    return () => {
      socket.off("arenaBattleUpdate", handleArenaBattleUpdate);
    };
  }, [arenaRoomName]);

  // Boss (chủ phòng) hoặc kỹ năng AOE vừa đánh trúng ai đó (BƯỚC 7) — CHỈ
  // dùng để vẽ hiệu ứng ở RoomofflineV6BattleScene cho CẢ PHÒNG cùng thấy.
  // Máu/trạng thái "bị loại" thật đã được server cập nhật sẵn trong
  // arenaUpdateRoom (không cần client tự quyết định gì nữa, khác hẳn BƯỚC
  // 5/6 khi tài nguyên chỉ lưu ở client).
  useEffect(() => {
    const handleArenaBossAttackFx = (data) => {
      if (!isMountedRef.current) return;
      if (!arenaRoomName || data.roomName !== arenaRoomName) return;
      setHitFx({ hits: data.hits || [], ts: data.ts || Date.now() });
    };
    socket.on("arenaBossAttackFx", handleArenaBossAttackFx);
    return () => {
      socket.off("arenaBossAttackFx", handleArenaBossAttackFx);
    };
  }, [arenaRoomName]);

  // Chớp/rung Boss khi máu vừa giảm — thuần hiệu ứng, không ảnh hưởng logic.
  // Từ BƯỚC 7, máu Boss đọc từ record isHost:true trong arenaUsers.
  useEffect(() => {
    const hostUserNow = arenaUsers.find((u) => u.isHost);
    if (!hostUserNow) return;
    if (
      prevBossHPRef.current !== null &&
      hostUserNow.hp < prevBossHPRef.current
    ) {
      setBossFlash(true);
      const t = setTimeout(() => setBossFlash(false), 300);
      prevBossHPRef.current = hostUserNow.hp;
      return () => clearTimeout(t);
    }
    prevBossHPRef.current = hostUserNow.hp;
  }, [arenaUsers]);

  // ── Lấy dữ liệu bài học (Y HỆT V2 — cùng 1 nguồn, cùng 1 định dạng item:
  // {submit, data, fsp, gender, fspSets, img, ...}) — CỐ ĐỊNH random=false
  // (không bắt buộc phải giống nhau giữa các máy nữa vì câu hỏi giờ ĐỘC LẬP
  // từng người, nhưng vẫn giữ false để hành vi ổn định/dễ tái hiện khi debug).
  const fetchTitle = async () => {
    try {
      let response;
      if (roomInfo.fileName.charAt(1) === "z") {
        response = await fetch(`/jsonData/forseo/${roomInfo.fileName}.json`);
      } else {
        response = await fetch(`/jsonData/${roomInfo.fileName}.json`);
      }
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      if (!isMountedRef.current) return;
      setDataPracticingOverRoll(data);

      let firstList = [currentIndex || 0];
      const aParam = params.get("a");
      if (aParam === "all") {
        firstList = Array.from({ length: data.length }, (_, i) => i);
      } else if (aParam) {
        try {
          const newList = parseStringToNumbers(aParam);
          if (newList && newList.length > 0) firstList = newList;
        } catch (error) {
          console.warn('Failed to parse "a" parameter (V6):', error.message);
        }
      }

      const get_data = interleaveCharacters(
        data,
        firstList,
        params.get("b"),
        params.get("up"),
        false,
        params.get("fsp"),
      );
      if (!isMountedRef.current) return;
      setDataPracticingCharactor(get_data.interleaveCharacters_DATA);
    } catch (error) {
      console.error("Error fetching data (RoomofflineV6):", error);
      if (isMountedRef.current) setFetchError(error.message);
    }
  };

  // Khi dữ liệu bài học đã tải xong VÀ đã có tên phòng → vào/tạo phòng chơi
  // chung qua socket (kèm nhân vật đã chọn — null nếu là Boss). Nếu là người
  // TẠO phòng, sau khi vào thành công thì đổi lại URL để thêm tên phòng —
  // biến link hiện tại thành link chia sẻ được ngay.
  useEffect(() => {
    if (!DataPracticingCharactor || !arenaRoomName) return;
    if (arenaJoinState !== "idle") return;

    setArenaJoinState("joining");
    const displayName = localStorage.getItem("nameDinhDanh") || "Người chơi";

    socket.emit(
      "arenaCreateOrJoin",
      arenaRoomName,
      { name: displayName, characterId: selectedCharacterId },
      (res) => {
        if (!isMountedRef.current) return;
        if (!res?.ok) {
          setArenaJoinState("error");
          setArenaError(res?.error || "Không vào được phòng chơi chung");
          return;
        }
        setArenaUsers(res.users || []);
        setHostId(res.hostId || null);
        if (res.battle) setBattle(res.battle);
        setArenaJoinState("joined");

        if (!gameRoom) {
          navigate(
            `/roomofflineV6/${roomCode}/${currentIndex}/${arenaRoomName}${locationSet.search}`,
            { replace: true },
          );
        }
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DataPracticingCharactor, arenaRoomName]);

  const isHost = !!hostId && hostId === socket.id;
  const myCharacter = getCharacterById(selectedCharacterId);

  const currentItem =
    currentQIndex !== null && DataPracticingCharactor
      ? DataPracticingCharactor[currentQIndex]
      : null;

  const hasCmdData =
    !!currentItem &&
    Array.isArray(currentItem.submit) &&
    Array.isArray(currentItem.data) &&
    currentItem.data.length > 0;

  // ── "Bảng tham khảo" (Y HỆT V2): mục lục "Tất cả" + thanh điều hướng theo
  // số thứ tự bài, dùng nguyên TableHD để hiển thị.
  const totalLessons = Array.isArray(DataPracticingOverRoll)
    ? DataPracticingOverRoll.length
    : 0;
  const tableOfContent = useMemo(
    () => buildTableOfContent(DataPracticingOverRoll),
    [DataPracticingOverRoll],
  );
  const navSlice = useMemo(() => {
    const cur = OnTable ?? 0;
    const total = totalLessons;
    let start = Math.max(0, cur - 4);
    let end = Math.min(total, cur + 5);
    if (end - start < 9) {
      if (start === 0) end = Math.min(9, total);
      else start = Math.max(0, total - 9);
    }
    return { start, end };
  }, [OnTable, totalLessons]);

  // ── "Gợi ý" (Y HỆT V2): hiện chip nhỏ khi câu hiện tại có hint; nếu không
  // có hint thì hiện ảnh minh họa (currentItem.img) thay thế.
  const hintRaw = currentItem?.hint || null;
  const hintIsImage = !!hintRaw && isImageUrl(hintRaw);
  const hintText =
    hintRaw && !hintIsImage
      ? hintRaw.includes("zzzz")
        ? hintRaw.split("zzzz")[0]
        : hintRaw
      : null;
  const hasHintContent = !!(hintText || hintIsImage);
  const thumbImg = !hasHintContent ? currentItem?.img || null : null;

  // Trả lời ĐÚNG/SAI → báo server hồi/trừ Mana thật (BƯỚC 7 — Mana giờ gate
  // hành động thật nên KHÔNG thể chỉ giữ ở client như tài nguyên ⚡ cũ). GIỮ
  // NGUYÊN tên hàm handleMarkCorrect/handleMarkWrong để phần so khớp câu trả
  // lời bên dưới (Y HỆT V2) không cần đổi gì thêm.
  const handleMarkCorrect = () => {
    if (arenaRoomName) socket.emit("arenaAnswerResult", arenaRoomName, true);
  };
  const handleMarkWrong = () => {
    if (arenaRoomName) socket.emit("arenaAnswerResult", arenaRoomName, false);
  };

  const pickNextIndex = () => {
    const total = DataPracticingCharactor ? DataPracticingCharactor.length : 0;
    if (total === 0) return null;
    if (total === 1) return 0;
    let next = currentQIndex;
    while (next === currentQIndex) {
      next = Math.floor(Math.random() * total);
    }
    return next;
  };

  const readItemAloud = (item) => {
    if (!item) return;
    try {
      ReadMessage(
        ObjREAD,
        item.fsp,
        item.gender === "female" ? 1 : 0,
        item.fspSets,
      );
    } catch (error) {
      console.warn("Không đọc được câu hỏi (RoomofflineV6):", error);
    }
  };

  const handleNextSentence = () => {
    const nextIndex = pickNextIndex();
    if (nextIndex === null) return;
    const item = DataPracticingCharactor[nextIndex];
    setCurrentQIndex(nextIndex);
    setLastCheck(null);
    setPushAW([]);
    justOneRef.current = false;
    readItemAloud(item);
  };

  const handleListenAgain = () => {
    readItemAloud(currentItem);
  };

  const resetToUnselected = () => {
    setCurrentQIndex(null);
    setLastCheck(null);
    setPushAW([]);
    justOneRef.current = false;
  };

  // Câu trả lời vừa gửi từ RoomofflineV2InputPanel (Nói hoặc Text) — Y HỆT
  // cơ chế chấm của RoomofflineV2.js (findBest/checkArrays với submit/data,
  // compareTwoStrings làm phương án dự phòng), chỉ khác chỗ ghi điểm: gọi
  // handleMarkCorrect/handleMarkWrong (giờ báo server hồi/trừ Mana thật, xem
  // BƯỚC 7 ở trên).
  const handleAnswerSubmit = (answerText) => {
    if (!currentItem) return;

    if (hasCmdData) {
      const matched = findBest(answerText, currentItem.data, 0.5);
      const gender = currentItem.gender === "female" ? 1 : 0;

      if (!matched || !matched.qs) {
        setLastCheck({ answerText, kind: "noMatch" });
        try {
          ReadMessage(
            ObjREAD,
            "Sorry, what did you say?",
            gender,
            gender === 1 ? [{ id: "sorryFemale" }] : [{ id: "sorryMale" }],
          );
        } catch (error) {
          console.warn("Không đọc được câu nhắc lại (RoomofflineV6):", error);
        }
        return;
      }

      const awArr = matched.aw || [];
      const aw01Arr = matched.aw01 || [];
      const idx = Math.floor(Math.random() * (awArr.length || 1));
      const answerConfirm = awArr[idx];
      const audio = aw01Arr[idx];
      if (answerConfirm) {
        try {
          ReadMessage(
            ObjREAD,
            answerConfirm,
            gender,
            audio?.id ? [{ id: audio.id, st: audio.st }] : undefined,
          );
        } catch (error) {
          console.warn("Không đọc được câu xác nhận (RoomofflineV6):", error);
        }
      }

      const actionTag = matched.action?.[0];
      if (actionTag === "WRONG") {
        handleMarkWrong();
        setLastCheck({ answerText, kind: "wrongSkip", youMean: matched.qs });
        setTimeout(() => {
          resetToUnselected();
        }, 900);
      } else if (actionTag) {
        setPushAW((prev) =>
          prev.includes(actionTag) ? prev : [...prev, actionTag],
        );
        setLastCheck({
          answerText,
          kind: "collected",
          youMean: matched.qs,
          actionTag,
        });
      }
      return;
    }

    // Phương án dự phòng (bài thiếu submit/data): so toàn câu.
    const target = (currentItem.fsp || "").toString().toLowerCase().trim();
    const guess = (answerText || "").toLowerCase().trim();
    const score = target ? compareTwoStrings(guess, target) : 0;
    const isCorrect = score >= ANSWER_MATCH_THRESHOLD;
    if (isCorrect) {
      handleMarkCorrect();
    } else {
      handleMarkWrong();
    }
    setLastCheck({
      kind: "similarity",
      answerText,
      target: currentItem.fsp,
      score,
      isCorrect,
    });
    setTimeout(() => {
      resetToUnselected();
    }, 1200);
  };

  // Mỗi khi pushAW đổi, kiểm tra đã đủ đúng/sai theo currentItem.submit chưa
  // — TÁI HIỆN đúng useEffect [Submit, PushAW] ở RoomofflineV2.js.
  useEffect(() => {
    if (!hasCmdData) return;
    if (justOneRef.current || pushAW.length === 0) return;
    const checkIndex = checkArrays(currentItem.submit, pushAW);
    if (checkIndex === 1) {
      justOneRef.current = true;
      handleMarkCorrect();
      setTimeout(() => {
        resetToUnselected();
      }, 1000);
    } else if (checkIndex === 2) {
      justOneRef.current = true;
      handleMarkWrong();
      setTimeout(() => {
        resetToUnselected();
      }, 1000);
    } else if (checkIndex === 3) {
      // Có tag sai nhưng chưa đủ hết submit — trừ Mana nhưng vẫn ở lại
      // câu này để thử tiếp (Y HỆT bản cũ).
      handleMarkWrong();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pushAW, hasCmdData]);

  // ── Chỉ số của MÌNH + của Boss (BƯỚC 7 — đọc trực tiếp từ arenaUsers, do
  // SERVER giữ sổ thật) ──────────────────────────────────────────────────
  const myUser = arenaUsers.find((u) => u.id === socket.id) || null;
  const hostUser = arenaUsers.find((u) => u.isHost) || null;

  // Vị trí của MÌNH trên bàn cờ + khoảng cách tới Boss (Chebyshev — ô xa
  // nhất theo 1 trong 2 trục, ĐÚNG cách server tính) — chỉ để client tự
  // disable nút/gợi ý cho tiện, KHÔNG phải nguồn xác nhận thật (server tự
  // kiểm tra lại trong arenaBossHit, xem ioArenaV6.js).
  const myPos = myUser?.pos || { x: 0, y: 0 };
  const bossPosNow = hostUser?.pos || null;
  const distToBoss = bossPosNow
    ? Math.max(
        Math.abs(myPos.x - bossPosNow.x),
        Math.abs(myPos.y - bossPosNow.y),
      )
    : Infinity;
  const myRange = myCharacter?.range ?? 1;
  const inAttackRange = distToBoss <= myRange;

  // Trạng thái "bị loại khỏi vòng chiến" — DO SERVER giữ (đồng bộ qua
  // arenaUsers[].eliminated cho cả phòng cùng thấy).
  const myEliminated = myUser?.eliminated || false;

  // Di chuyển trên bàn cờ — DÙNG CHUNG cho cả Boss lẫn học sinh (server tự
  // chặn spam bằng mốc thời gian tối thiểu VÀ trừ Mana thật, xem
  // MIN_MOVE_INTERVAL_MS/MOVE_MANA_COST trong ioArenaV6.js); client chỉ cần
  // gửi hướng + tự tắt nút khi hết Mana/bị loại cho gọn UX.
  const canMove =
    !!arenaRoomName &&
    !myEliminated &&
    (myUser?.mana ?? 0) >= MOVE_MANA_COST;
  const handleMove = (dir) => {
    if (!canMove) return;
    socket.emit("arenaMove", arenaRoomName, dir);
  };

  // "Tấn công Boss" (học sinh) — tốn Mana, server tự tính sát thương theo
  // hệ số nhân vật VÀ tự kiểm tra khoảng cách theo tầm đánh thật (cận
  // chiến/tầm xa) — KHÔNG tin số/vị trí client tự gửi lên. Server giờ giữ sổ
  // Mana thật nên KHÔNG cần trừ lạc quan ở client nữa — cứ emit rồi chờ
  // arenaUpdateRoom cập nhật lại.
  const handleAttackBoss = () => {
    if (!battle || battle.status !== "ongoing") return;
    if (myEliminated) return;
    if ((myUser?.mana ?? 0) < STUDENT_ATTACK_MANA_COST) {
      setAttackHint("Không đủ Mana — hãy trả lời đúng vài câu để hồi Mana!");
      setTimeout(() => setAttackHint(null), 2500);
      return;
    }
    if (!inAttackRange) {
      setAttackHint("Cận chiến — hãy di chuyển lại gần Boss hơn để tấn công!");
      setTimeout(() => setAttackHint(null), 2500);
      return;
    }
    setAttackPulse((p) => p + 1);
    socket.emit("arenaBossHit", arenaRoomName, (res) => {
      if (res && res.ok === false) {
        if (res.reason === "outOfRange") {
          setAttackHint("Ngoài tầm đánh — hãy lại gần Boss hơn.");
        } else if (res.reason === "noMana") {
          setAttackHint("Không đủ Mana — hãy trả lời đúng vài câu để hồi Mana!");
        }
        setTimeout(() => setAttackHint(null), 2500);
      }
    });
  };

  // Boss chọn mục tiêu (BƯỚC 7) — bấm 1 học sinh trên bản đồ để chọn/bỏ
  // chọn; CHỈ chủ phòng mới gọi được (nút/canvas cũng chỉ hiện cho isHost).
  const handleSelectPlayer = (id) => {
    if (!isHost) return;
    setSelectedTargetId((prev) => (prev === id ? null : id));
  };

  // Boss tấn công mục tiêu ĐÃ CHỌN — server tự kiểm tra khoảng cách/Mana
  // thật (BOSS_ATTACK_RANGE/BOSS_ATTACK_MANA_COST trong ioArenaV6.js).
  const handleBossAttackTarget = () => {
    if (!isHost || !selectedTargetId) return;
    if (!battle || battle.status !== "ongoing") return;
    if ((hostUser?.mana ?? 0) < BOSS_ATTACK_MANA_COST) {
      setAttackHint("Không đủ Mana — hãy trả lời đúng vài câu để hồi Mana!");
      setTimeout(() => setAttackHint(null), 2500);
      return;
    }
    const target = arenaUsers.find((u) => u.id === selectedTargetId);
    if (target) {
      const dist = Math.max(
        Math.abs((hostUser?.pos?.x ?? 0) - (target.pos?.x ?? 0)),
        Math.abs((hostUser?.pos?.y ?? 0) - (target.pos?.y ?? 0)),
      );
      if (dist > BOSS_ATTACK_RANGE) {
        setAttackHint("Hãy di chuyển lại sát mục tiêu trước khi tấn công.");
        setTimeout(() => setAttackHint(null), 2500);
        return;
      }
    }
    socket.emit("arenaBossAttackTarget", arenaRoomName, selectedTargetId);
  };

  // Kỹ năng AOE của Boss (BƯỚC 7, MỚI) — trúng nhiều học sinh quanh Boss
  // cùng lúc, có thời gian hồi riêng (server: MIN_AOE_INTERVAL_MS).
  const handleBossAoeSkill = () => {
    if (!isHost || aoeCoolingDown) return;
    if (!battle || battle.status !== "ongoing") return;
    if ((hostUser?.mana ?? 0) < BOSS_AOE_MANA_COST) {
      setAttackHint("Không đủ Mana — hãy trả lời đúng vài câu để hồi Mana!");
      setTimeout(() => setAttackHint(null), 2500);
      return;
    }
    socket.emit("arenaBossAoeSkill", arenaRoomName);
    setAoeCooldownUntil(Date.now() + BOSS_AOE_COOLDOWN_MS);
  };

  // ── Cửa hàng (Đơn vị tiêu dùng, BƯỚC 7 — CHỈ dành cho học sinh) ────────────
  const handleBuyShield = () => {
    if (isHost || myUser?.shielded) return;
    if ((myUser?.units ?? 0) < SHIELD_COST_UNITS) return;
    socket.emit("arenaBuyShield", arenaRoomName);
  };
  const handleBuyManaPotion = () => {
    if (isHost) return;
    if ((myUser?.units ?? 0) < MANA_POTION_COST_UNITS) return;
    socket.emit("arenaBuyManaPotion", arenaRoomName);
  };
  const handleBuyRevival = () => {
    if (!myEliminated) return;
    if ((myUser?.units ?? 0) < REVIVAL_COST_UNITS) return;
    socket.emit("arenaRevive", arenaRoomName);
  };

  // Chủ phòng triệu hồi boss (lần đầu, hoặc triệu hồi lại sau khi hạ được
  // con trước) — server tự tính máu boss theo SỐ NGƯỜI đang có trong phòng,
  // ĐỒNG THỜI cho mọi người "hồi sinh" lại từ đầu (xem ioArenaV6.js) — 1
  // trận mới thì ai cũng được vào lại, không cần mua Thẻ hồi sinh nữa. Mana/
  // Đơn vị tiêu dùng GIỮ NGUYÊN qua các trận (BƯỚC 7).
  const handleStartBattle = () => {
    if (!isHost) return;
    socket.emit("arenaStartBattle", arenaRoomName);
  };

  // ── Chặn ngay từ đầu nếu KHÔNG phải web máy tính thường (theo yêu cầu) ────
  if (!isDesktopWebPlatform()) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "2rem 1.5rem",
          backgroundColor: "#f9f9f9",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>💻</div>
        <h4 style={{ color: "#1e293b", marginBottom: "0.5rem" }}>
          Trò chơi chỉ chơi được trên web (máy tính)
        </h4>
        <p style={{ color: "#64748b", maxWidth: 420 }}>
          Trang này cần trình duyệt web thường trên máy tính (không phải điện
          thoại/tablet, cũng không phải trình duyệt trong app như Zalo/
          Messenger/Instagram) để hiển thị và chơi ổn định. Hãy mở link này
          trên máy tính để tham gia.
        </p>
      </div>
    );
  }

  // ── Màn hình 0: chưa có tên phòng trên URL → tạo phòng (thành Boss) hoặc
  // chọn nhân vật (vào qua link chia sẻ, thành học sinh) ─────────────────────
  if (!arenaRoomName || !characterConfirmed) {
    // Có sẵn tên phòng trên URL (vào qua link chia sẻ) → LUÔN là học sinh,
    // phải chọn nhân vật. KHÔNG có tên phòng trên URL → LUÔN là người tạo
    // phòng, LUÔN là Boss (BƯỚC 7) — không cần chọn nhân vật.
    const isJoiningExistingRoom = !!gameRoom;

    if (!isJoiningExistingRoom) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            backgroundColor: "#f9f9f9",
            padding: "2rem 1rem",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              background: "#fff",
              borderRadius: 16,
              padding: "2rem 1.5rem",
              boxShadow: "0 1px 3px rgba(15,23,42,.06), 0 6px 18px rgba(15,23,42,.05)",
              border: "1px solid #e2e8f0",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "2.5rem" }}>👑</div>
            <h4 style={{ margin: "1rem 0 0.25rem", color: "#1e293b" }}>
              Bạn sẽ là Boss (giáo viên)
            </h4>
            <p style={{ color: "#64748b", marginBottom: "1.25rem" }}>
              Bạn đang tạo phòng chơi chung nên sẽ luôn là Boss — tự di
              chuyển + tấn công học sinh, không cần chọn nhân vật. Sau khi
              tạo phòng, hãy chia sẻ link trên thanh địa chỉ cho học sinh —
              ai mở đúng link đó sẽ vào chơi làm học sinh ngay.
            </p>
            <input
              type="text"
              value={roomNameDraft}
              onChange={(e) => setRoomNameDraft(e.target.value)}
              maxLength={24}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "2px solid #c4b5fd",
                fontSize: "1.05rem",
                fontWeight: 600,
                textAlign: "center",
                marginBottom: "1.25rem",
                boxSizing: "border-box",
              }}
            />
            <button
              type="button"
              onClick={() => {
                const trimmed = roomNameDraft.trim();
                if (trimmed) {
                  setArenaRoomName(trimmed);
                  setCharacterConfirmed(true);
                }
              }}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 10,
                border: "none",
                background: "#7c3aed",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              Tạo phòng, vào làm Boss
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f9f9f9",
          padding: "2rem 1rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            background: "#fff",
            borderRadius: 16,
            padding: "2rem 1.5rem",
            boxShadow: "0 1px 3px rgba(15,23,42,.06), 0 6px 18px rgba(15,23,42,.05)",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <i
            className="bi bi-controller"
            style={{ fontSize: "2.5rem", color: "#7c3aed" }}
          ></i>
          <h4 style={{ margin: "1rem 0 0.25rem", color: "#1e293b" }}>
            RoomofflineV6 — Cùng đánh Boss
          </h4>
          <p style={{ color: "#64748b", marginBottom: "1.25rem" }}>
            Vào phòng <b>{arenaRoomName}</b> — chọn nhân vật trước khi tham
            gia.
          </p>

          <p
            style={{
              color: "#334155",
              fontWeight: 700,
              textAlign: "left",
              marginBottom: "0.5rem",
            }}
          >
            Chọn nhân vật (ảnh hưởng sát thương khi đánh boss):
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              marginBottom: "1.25rem",
            }}
          >
            {CHARACTERS.map((c) => {
              const isSelected = selectedCharacterId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCharacterId(c.id)}
                  style={{
                    padding: "10px 8px",
                    borderRadius: 10,
                    border: isSelected
                      ? "2px solid #7c3aed"
                      : "2px solid #e2e8f0",
                    background: isSelected ? "#f5f3ff" : "#fff",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: "1.5rem" }}>{c.icon}</div>
                  <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
                    {c.name}
                  </div>
                  <div style={{ color: "#64748b", fontSize: "0.72rem" }}>
                    {c.desc}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!selectedCharacterId}
            onClick={() => {
              if (!selectedCharacterId) return;
              setCharacterConfirmed(true);
            }}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              border: "none",
              background: selectedCharacterId ? "#7c3aed" : "#c4b5fd",
              color: "#fff",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: selectedCharacterId ? "pointer" : "not-allowed",
            }}
          >
            {selectedCharacterId
              ? "Xác nhận nhân vật, vào phòng"
              : "Hãy chọn 1 nhân vật ở trên"}
          </button>
        </div>
      </div>
    );
  }

  // ── Màn hình 1: nhập tên / lấy dữ liệu (tái sử dụng nguyên component cũ) ──
  if (!StartToGetData) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f9f9f9",
        }}
      >
        <div
          style={{
            width: "100%",
            textAlign: "center",
            padding: "8px 0",
            background: "#ede9fe",
            fontWeight: 700,
            color: "#5b21b6",
          }}
        >
          RoomofflineV6 — Phòng: <b>{arenaRoomName}</b>
        </div>
        <DataPracticeComponent
          roomCode={roomCode}
          currentIndex={currentIndex}
          setStartToGetData={setStartToGetData}
          fetchTitle={fetchTitle}
        />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#b91c1c" }}>
        Lỗi tải dữ liệu bài học: {fetchError}
      </div>
    );
  }

  if (!DataPracticingCharactor) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
        Đang tải dữ liệu bài học…
      </div>
    );
  }

  if (arenaJoinState === "error") {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#b91c1c" }}>
        Lỗi vào phòng chơi chung: {arenaError}
      </div>
    );
  }

  if (arenaJoinState !== "joined") {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
        Đang vào phòng chơi chung…
      </div>
    );
  }

  const contributionList = battle
    ? [...arenaUsers]
        .filter((u) => !u.isHost)
        .map((u) => ({
          ...u,
          hits: battle.contributions?.[u.id] || 0,
          character: getCharacterById(u.characterId),
        }))
        .sort((a, b) => b.hits - a.hits)
    : [];

  // Danh sách cho cảnh chiến đấu 2D — GIỮ NGUYÊN thứ tự arenaUsers (không
  // sắp theo số đòn trúng như contributionList), để vị trí từng người trong
  // canvas không bị nhảy lung tung mỗi khi có ai đó ghi thêm 1 đòn trúng.
  const battleScenePlayers = arenaUsers.map((u) => ({
    id: u.id,
    name: u.name,
    icon: u.isHost ? null : getCharacterById(u.characterId)?.icon,
    isMe: u.id === socket.id,
    isBoss: !!u.isHost,
    pos: u.pos || { x: 0, y: 0 },
    hp: u.hp,
    maxHp: u.maxHp,
    shielded: !!u.shielded,
    eliminated: !!u.eliminated,
  }));

  const bossPct =
    hostUser && hostUser.maxHp
      ? Math.round((hostUser.hp / hostUser.maxHp) * 100)
      : 0;
  let bossBarColor = "#16a34a";
  if (bossPct <= 60) bossBarColor = "#f59e0b";
  if (bossPct <= 25) bossBarColor = "#dc2626";
  const topContributor = contributionList[0];

  const selectedTarget = selectedTargetId
    ? arenaUsers.find((u) => u.id === selectedTargetId)
    : null;

  // Style dùng chung cho 4 nút mũi tên di chuyển trên bàn cờ.
  const dpadBtnStyle = {
    width: 40,
    height: 36,
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "#fff",
    cursor: "pointer",
    fontSize: "0.9rem",
  };

  // "Ô chơi" 90% x 90%, cố định, KHÔNG bị ảnh hưởng bởi cuộn trang — TÁI HIỆN
  // đúng kỹ thuật của RoomofflineV2.js (.v2-root height:100vh + overflow:hidden,
  // .v2-center-wrap position:fixed, hộp trong cùng tự overflow-y:auto).
  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        background: "#f5f6fa",
        fontFamily: "sans-serif",
      }}
    >
      <style>{`
        .v6-modal-backdrop, .v6-hint-modal-backdrop {
          position: fixed; inset: 0; background: rgba(15,23,42,0.55); z-index: 50;
          display: flex; align-items: center; justify-content: center; padding: 16px;
          opacity: 0; pointer-events: none; transition: opacity 0.25s ease;
        }
        .v6-modal-backdrop.open, .v6-hint-modal-backdrop.open { opacity: 1; pointer-events: auto; }
        .v6-modal-panel {
          background: #fff; border-radius: 16px; width: 85vw; height: 85vh;
          display: flex; flex-direction: column; overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.25);
          opacity: 0; transform: scale(0.94) translateY(10px);
          transition: opacity 0.25s ease, transform 0.25s ease;
        }
        .v6-hint-modal-panel {
          background: #fff; border-radius: 16px; width: min(480px, 92vw); max-height: 80vh;
          overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.25);
          opacity: 0; transform: scale(0.94) translateY(10px);
          transition: opacity 0.25s ease, transform 0.25s ease;
        }
        .v6-modal-backdrop.open .v6-modal-panel,
        .v6-hint-modal-backdrop.open .v6-hint-modal-panel { opacity: 1; transform: scale(1) translateY(0); }
        .v6-modal-header, .v6-hint-modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #5b21b6; flex-shrink: 0;
        }
        .v6-modal-close {
          border: none; background: #f1f5f9; color: #475569; width: 32px; height: 32px;
          border-radius: 8px; cursor: pointer;
        }
        .v6-ref-navbar {
          display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 18px;
          border-bottom: 1px solid #e2e8f0; flex-shrink: 0;
        }
        .v6-ref-navbtn {
          border: 1px solid #e2e8f0; background: #f8fafc; color: #475569; font-weight: 700;
          font-size: 0.78rem; padding: 5px 10px; border-radius: 8px; cursor: pointer;
        }
        .v6-ref-navbtn.active { background: #7c3aed; border-color: #7c3aed; color: #fff; }
        .v6-modal-body { flex: 1; min-height: 0; padding: 14px 18px; overflow-y: auto; }
        .v6-hint-text { font-size: 0.95rem; color: #1e293b; white-space: pre-line; padding: 16px 18px; }
        .v6-hint-img { max-width: 100%; max-height: 60vh; border-radius: 8px; display: block; margin: 16px auto; }
        .v6-hint-chip {
          display: inline-flex; align-items: center; gap: 6px; background: #fffbeb;
          border: 1px solid #fde68a; color: #92400e; font-weight: 700; font-size: 0.8rem;
          padding: 6px 14px; border-radius: 999px; cursor: pointer; margin-bottom: 10px;
        }
        .v6-thumb-box { display: flex; justify-content: center; margin-bottom: 10px; }
        .v6-thumb-img { max-width: 100%; max-height: 140px; border-radius: 10px; display: block; }
        .v6-reveal-btn {
          border: 1px solid #c4b5fd; background: #f5f3ff; color: #5b21b6; font-weight: 700;
          padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 0.8rem;
        }
        .v6-stat-badge {
          font-weight: 800; padding: 3px 9px; border-radius: 999px; font-size: 0.78rem;
          display: inline-flex; align-items: center; gap: 3px;
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "90%",
            height: "90%",
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 4px 20px rgba(15,23,42,0.12)",
            padding: "0.85rem 1rem",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
      {/* Nút ẩn — ReadMessage_2024.js (TÁI SỬ DỤNG, không sửa) tự bấm khi bắt
          đầu/kết thúc đọc, giống hệt cơ chế IsReading của RoomofflineV2.js */}
      <div style={{ display: "none" }}>
        <button id="readingFalse" onClick={() => setIsReading(false)} />
        <button id="readingTrue" onClick={() => setIsReading(true)} />
      </div>

      {/* ── Header gọn — BƯỚC 7: thay ⚡ tài nguyên chung bằng 3 chỉ số riêng
          (Máu/Mana/Đơn vị tiêu dùng — Boss không có Đơn vị tiêu dùng vì
          không cần mua gì ở Cửa hàng). ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.5rem",
          flexShrink: 0,
          flexWrap: "wrap",
          gap: "6px",
        }}
      >
        <span style={{ color: "#64748b", fontSize: "0.8rem" }}>
          Phòng <b>{arenaRoomName}</b> · {arenaUsers.length} người chơi ·{" "}
          {isHost
            ? "👑 Boss (bạn)"
            : myCharacter
              ? `${myCharacter.icon} ${myCharacter.name}`
              : ""}
        </span>
        <span style={{ display: "flex", gap: "6px" }}>
          <span
            className="v6-stat-badge"
            style={{ color: "#b91c1c", background: "#fef2f2" }}
          >
            ❤️ {myUser?.hp ?? 0}/{myUser?.maxHp ?? 0}
          </span>
          <span
            className="v6-stat-badge"
            style={{ color: "#1d4ed8", background: "#eff6ff" }}
          >
            🔷 {myUser?.mana ?? 0}/{myUser?.maxMana ?? 0}
          </span>
          {!isHost && (
            <span
              className="v6-stat-badge"
              style={{ color: "#7c3aed", background: "#f5f3ff" }}
            >
              💰 {myUser?.units ?? 0}
            </span>
          )}
        </span>
      </div>

      {/* ── Thanh nút mở popup: Cửa hàng (chỉ học sinh) + Đội hình. "Gợi ý"/
          "Tham khảo" vẫn nằm trong toolbar luyện tập bên phải như cũ. ── */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "0.5rem", flexShrink: 0, flexWrap: "wrap" }}>
        {!isHost && (
          <button
            type="button"
            onClick={() => setShowShopModal(true)}
            style={{
              padding: "5px 12px",
              borderRadius: 8,
              border: "1px solid #c4b5fd",
              background: "#f5f3ff",
              color: "#5b21b6",
              fontWeight: 700,
              fontSize: "0.76rem",
              cursor: "pointer",
            }}
          >
            🛒 Cửa hàng
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowBattleModal(true)}
          style={{
            padding: "5px 12px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            background: "#fff",
            color: "#475569",
            fontWeight: 700,
            fontSize: "0.76rem",
            cursor: "pointer",
          }}
        >
          🏆 Đội hình
        </button>
        {myEliminated && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 10px",
              borderRadius: 999,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              fontWeight: 700,
              fontSize: "0.74rem",
            }}
          >
            💀 Đã bị loại
          </span>
        )}
      </div>

      {/* ── Thân bài 2 CỘT: cột trái là BẢN ĐỒ trận chiến THẬT (bàn cờ 10x10
          + di chuyển + tấn công) hiện TRỰC TIẾP trên màn hình chính; cột
          phải (luyện tập) thu hẹp lại tương ứng. Cửa hàng/Đội hình/Gợi ý/
          Tham khảo đều popup để không choán chỗ bản đồ. ── */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          gap: "0.75rem",
        }}
      >
        {/* ── Cột trái: BẢN ĐỒ trận chiến (ƯU TIÊN hiển thị) ── */}
        <div
          style={{
            width: "58%",
            minWidth: 320,
            flexShrink: 0,
            border: "1px solid #e2e8f0",
            borderRadius: 14,
            padding: "0.65rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            overflow: "hidden",
          }}
        >
          {isHost && battle?.status === "ongoing" && (
            <div
              style={{
                background: selectedTarget ? "#f5f3ff" : "#f1f5f9",
                border: `1px solid ${selectedTarget ? "#c4b5fd" : "#e2e8f0"}`,
                color: selectedTarget ? "#5b21b6" : "#64748b",
                fontWeight: 700,
                fontSize: "0.75rem",
                padding: "3px 10px",
                borderRadius: 999,
                marginBottom: 4,
              }}
            >
              {selectedTarget
                ? `🎯 Đang nhắm: ${selectedTarget.name}`
                : "Bấm 1 học sinh trên bản đồ để chọn mục tiêu"}
            </div>
          )}

          <RoomofflineV6BattleScene
            players={battleScenePlayers}
            gridSize={GRID_SIZE}
            battleStatus={battle?.status || "none"}
            bossFlash={bossFlash}
            attackPulse={attackPulse}
            hitFx={hitFx}
            selectedTargetId={selectedTargetId}
            isBossView={isHost}
            onPlayerClick={handleSelectPlayer}
          />

          {hostUser && (
            <>
              <div
                style={{
                  width: "100%",
                  maxWidth: 320,
                  height: 12,
                  borderRadius: 999,
                  background: "#e2e8f0",
                  overflow: "hidden",
                  margin: "6px 0 3px",
                }}
              >
                <div
                  style={{
                    width: `${bossPct}%`,
                    height: "100%",
                    background: bossBarColor,
                    transition: "width 0.3s ease, background 0.3s ease",
                  }}
                />
              </div>
              <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                Máu boss: {hostUser.hp}/{hostUser.maxHp} ({bossPct}%)
              </span>
            </>
          )}

          {!battle && (
            <p style={{ color: "#94a3b8", fontSize: "0.75rem", margin: "0.4rem 0" }}>
              Chưa có trận — di chuyển thử hoặc luyện tập lấy Mana trước
              cũng được!
            </p>
          )}

          {isHost ? (
            <div style={{ marginTop: "0.5rem", width: "100%" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 38px)",
                  gridTemplateRows: "repeat(3, 34px)",
                  gap: 4,
                  justifyContent: "center",
                  margin: "0 auto 6px",
                }}
              >
                <div />
                <button type="button" onClick={() => handleMove("up")} disabled={!canMove} style={dpadBtnStyle}>
                  ▲
                </button>
                <div />
                <button type="button" onClick={() => handleMove("left")} disabled={!canMove} style={dpadBtnStyle}>
                  ◀
                </button>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                  }}
                >
                  👑
                </div>
                <button type="button" onClick={() => handleMove("right")} disabled={!canMove} style={dpadBtnStyle}>
                  ▶
                </button>
                <div />
                <button type="button" onClick={() => handleMove("down")} disabled={!canMove} style={dpadBtnStyle}>
                  ▼
                </button>
                <div />
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={handleBossAttackTarget}
                  disabled={
                    !battle ||
                    battle.status !== "ongoing" ||
                    !selectedTargetId ||
                    (hostUser?.mana ?? 0) < BOSS_ATTACK_MANA_COST
                  }
                  style={{
                    padding: "9px 14px",
                    borderRadius: 10,
                    border: "none",
                    background:
                      battle &&
                      battle.status === "ongoing" &&
                      selectedTargetId &&
                      (hostUser?.mana ?? 0) >= BOSS_ATTACK_MANA_COST
                        ? "#dc2626"
                        : "#cbd5e1",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  ⚔️ Tấn công mục tiêu (tốn {BOSS_ATTACK_MANA_COST}🔷)
                </button>
                <button
                  type="button"
                  onClick={handleBossAoeSkill}
                  disabled={
                    !battle ||
                    battle.status !== "ongoing" ||
                    aoeCoolingDown ||
                    (hostUser?.mana ?? 0) < BOSS_AOE_MANA_COST
                  }
                  style={{
                    padding: "9px 14px",
                    borderRadius: 10,
                    border: "none",
                    background:
                      battle &&
                      battle.status === "ongoing" &&
                      !aoeCoolingDown &&
                      (hostUser?.mana ?? 0) >= BOSS_AOE_MANA_COST
                        ? "#7c3aed"
                        : "#cbd5e1",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  🌪️ Kỹ năng AOE (tốn {BOSS_AOE_MANA_COST}🔷)
                </button>
              </div>
              {attackHint && (
                <p style={{ color: "#dc2626", fontSize: "0.72rem", margin: "4px 0 0" }}>
                  {attackHint}
                </p>
              )}
            </div>
          ) : myEliminated ? (
            <div
              style={{
                marginTop: "0.5rem",
                width: "100%",
                padding: "0.5rem",
                borderRadius: 10,
                background: "#fef2f2",
                border: "1px solid #fecaca",
              }}
            >
              <p style={{ color: "#b91c1c", fontWeight: 700, fontSize: "0.78rem", margin: "0 0 6px" }}>
                💀 Bạn đã bị loại khỏi vòng chiến!
              </p>
              <button
                type="button"
                onClick={handleBuyRevival}
                disabled={(myUser?.units ?? 0) < REVIVAL_COST_UNITS}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: "none",
                  background:
                    (myUser?.units ?? 0) >= REVIVAL_COST_UNITS ? "#16a34a" : "#cbd5e1",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.76rem",
                  cursor:
                    (myUser?.units ?? 0) >= REVIVAL_COST_UNITS ? "pointer" : "not-allowed",
                }}
              >
                🛒 Mua Thẻ hồi sinh (tốn {REVIVAL_COST_UNITS}💰)
              </button>
              <p style={{ color: "#94a3b8", fontSize: "0.68rem", margin: "6px 0 0" }}>
                Vẫn luyện tập bình thường để có thêm Mana/Đơn vị tiêu dùng.
              </p>
            </div>
          ) : (
            <div style={{ marginTop: "0.5rem", width: "100%" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 38px)",
                  gridTemplateRows: "repeat(3, 34px)",
                  gap: 4,
                  justifyContent: "center",
                  margin: "0 auto 6px",
                }}
              >
                <div />
                <button type="button" onClick={() => handleMove("up")} disabled={!canMove} style={dpadBtnStyle}>
                  ▲
                </button>
                <div />
                <button type="button" onClick={() => handleMove("left")} disabled={!canMove} style={dpadBtnStyle}>
                  ◀
                </button>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                  }}
                >
                  {myCharacter?.icon}
                </div>
                <button type="button" onClick={() => handleMove("right")} disabled={!canMove} style={dpadBtnStyle}>
                  ▶
                </button>
                <div />
                <button type="button" onClick={() => handleMove("down")} disabled={!canMove} style={dpadBtnStyle}>
                  ▼
                </button>
                <div />
              </div>

              <button
                type="button"
                onClick={handleAttackBoss}
                disabled={
                  !battle ||
                  battle.status !== "ongoing" ||
                  (myUser?.mana ?? 0) < STUDENT_ATTACK_MANA_COST ||
                  !inAttackRange
                }
                style={{
                  width: "100%",
                  maxWidth: 280,
                  padding: "9px",
                  borderRadius: 10,
                  border: "none",
                  background:
                    battle &&
                    battle.status === "ongoing" &&
                    (myUser?.mana ?? 0) >= STUDENT_ATTACK_MANA_COST &&
                    inAttackRange
                      ? "#dc2626"
                      : "#cbd5e1",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  cursor:
                    battle &&
                    battle.status === "ongoing" &&
                    (myUser?.mana ?? 0) >= STUDENT_ATTACK_MANA_COST &&
                    inAttackRange
                      ? "pointer"
                      : "not-allowed",
                }}
              >
                ⚔️ Tấn công (tốn {STUDENT_ATTACK_MANA_COST}🔷)
              </button>
              {attackHint && (
                <p style={{ color: "#dc2626", fontSize: "0.72rem", margin: "4px 0 0" }}>
                  {attackHint}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Cột phải: vòng lặp luyện tập (Y HỆT V2, độc lập với mọi người
            khác) ── */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            border: "1px solid #e2e8f0",
            borderRadius: 14,
            padding: "0.65rem 0.75rem",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "6px",
              marginBottom: "0.5rem",
              flexWrap: "wrap",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                onClick={handleListenAgain}
                disabled={!currentItem || isReading}
                style={{
                  padding: "5px 10px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  fontSize: "0.78rem",
                  cursor: !currentItem || isReading ? "not-allowed" : "pointer",
                }}
              >
                🔊 {isReading ? "Đang đọc…" : "Nghe lại"}
              </button>
              <button
                type="button"
                onClick={handleNextSentence}
                disabled={
                  !DataPracticingCharactor ||
                  DataPracticingCharactor.length === 0 ||
                  isReading
                }
                style={{
                  padding: "5px 10px",
                  borderRadius: 8,
                  border: "none",
                  background: "#7c3aed",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  cursor:
                    !DataPracticingCharactor ||
                    DataPracticingCharactor.length === 0 ||
                    isReading
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {currentItem ? "🔀 Câu mới" : "▶️ Bắt đầu"}
              </button>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                type="button"
                onClick={() => setMode("noi")}
                style={{
                  padding: "4px 9px",
                  borderRadius: 8,
                  border: mode === "noi" ? "2px solid #7c3aed" : "1px solid #cbd5e1",
                  background: mode === "noi" ? "#f5f3ff" : "#fff",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                }}
              >
                🎤 Nói
              </button>
              <button
                type="button"
                onClick={() => setMode("text")}
                style={{
                  padding: "4px 9px",
                  borderRadius: 8,
                  border: mode === "text" ? "2px solid #7c3aed" : "1px solid #cbd5e1",
                  background: mode === "text" ? "#f5f3ff" : "#fff",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                }}
              >
                ⌨️ Text
              </button>
              <button
                type="button"
                className="v6-reveal-btn"
                disabled={totalLessons === 0}
                onClick={() => setShowReference(true)}
                title="Bảng thông tin tham khảo"
                style={{ padding: "4px 9px", fontSize: "0.78rem" }}
              >
                <i className="bi bi-table"></i> Tham khảo
              </button>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: "2px" }}>
            {currentItem ? (
              <>
                {!hasHintContent && thumbImg && (
                  <div className="v6-thumb-box" style={{ marginBottom: 6 }}>
                    <img
                      src={thumbImg}
                      className="v6-thumb-img"
                      alt="minh họa"
                      loading="lazy"
                      style={{ maxHeight: 90 }}
                    />
                  </div>
                )}

                {hasHintContent && (
                  <button
                    type="button"
                    className="v6-hint-chip"
                    onClick={() => setShowHintModal(true)}
                    title="Xem gợi ý"
                    style={{ padding: "4px 10px", fontSize: "0.75rem", marginBottom: 6 }}
                  >
                    💡 Gợi ý
                  </button>
                )}

                {hasCmdData && (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: "0.75rem",
                      marginBottom: "0.35rem",
                    }}
                  >
                    Đã thu thập: {pushAW.length}/{currentItem.submit.length}
                  </div>
                )}

                <RoomofflineV2InputPanel
                  mode={mode}
                  onSubmit={handleAnswerSubmit}
                  isReading={isReading}
                  questionIndex={currentQIndex}
                />

                {lastCheck && lastCheck.kind === "similarity" && (
                  <p
                    style={{
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: "0.78rem",
                      color: lastCheck.isCorrect ? "#16a34a" : "#dc2626",
                      marginTop: "0.4rem",
                    }}
                  >
                    {lastCheck.isCorrect
                      ? `✅ Đúng (+${MANA_PER_CORRECT}🔷)`
                      : `❌ Sai (-${MANA_PER_WRONG}🔷)`} — độ giống{" "}
                    {(lastCheck.score * 100).toFixed(0)}% (câu đúng: "
                    {lastCheck.target}")
                  </p>
                )}
                {lastCheck && lastCheck.kind === "noMatch" && (
                  <p style={{ textAlign: "center", fontWeight: 700, fontSize: "0.78rem", color: "#dc2626", marginTop: "0.4rem" }}>
                    ❓ Không nhận ra câu trả lời — thử nói/gõ lại xem.
                  </p>
                )}
                {lastCheck && lastCheck.kind === "wrongSkip" && (
                  <p style={{ textAlign: "center", fontWeight: 700, fontSize: "0.78rem", color: "#dc2626", marginTop: "0.4rem" }}>
                    ❌ Sai (-{MANA_PER_WRONG}🔷) — chuyển sang câu khác…
                  </p>
                )}
                {lastCheck && lastCheck.kind === "collected" && (
                  <p style={{ textAlign: "center", fontWeight: 700, fontSize: "0.78rem", color: "#16a34a", marginTop: "0.4rem" }}>
                    ✅ Ghi nhận đúng 1 phần — tiếp tục trả lời cho đủ câu hỏi.
                  </p>
                )}
              </>
            ) : (
              <p style={{ color: "#64748b", textAlign: "center", fontSize: "0.82rem" }}>
                Bấm "Bắt đầu" để nhận câu hỏi đầu tiên. Mỗi câu ĐÚNG cộng{" "}
                {MANA_PER_CORRECT}🔷, mỗi câu SAI trừ {MANA_PER_WRONG}🔷 —
                dùng Mana để di chuyển/tấn công {isHost ? "học sinh" : "boss"}{" "}
                bên trái.
              </p>
            )}
          </div>
        </div>
      </div>
        </div>
      </div>

      {/* ── Popup: Đội hình — trạng thái thắng/chờ + nút triệu hồi của chủ
          phòng + đóng góp cả đội. Lazy-mount giống hệt 2 popup Gợi ý/Tham
          khảo bên dưới. BƯỚC 7: thêm dòng máu/mana của Boss ở đầu. ── */}
      {hasOpenedBattleModal && (
        <div
          className={`v6-modal-backdrop ${showBattleModal ? "open" : ""}`}
          onClick={() => setShowBattleModal(false)}
        >
          <div className="v6-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="v6-modal-header">
              <b>
                <i className="bi bi-people-fill me-2"></i>
                Đội hình & đóng góp
              </b>
              <button
                type="button"
                className="v6-modal-close"
                onClick={() => setShowBattleModal(false)}
                title="Đóng"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div
              className="v6-modal-body"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.85rem",
                textAlign: "center",
              }}
            >
              {hostUser && (
                <p style={{ color: "#475569", fontSize: "0.82rem", margin: 0 }}>
                  👑 <b>{hostUser.name}</b> (Boss) — ❤️ {hostUser.hp}/
                  {hostUser.maxHp} · 🔷 {hostUser.mana}/{hostUser.maxMana}
                </p>
              )}

              {battle && battle.status === "won" && (
                <p style={{ color: "#065f46", fontSize: "0.95rem", margin: 0 }}>
                  🎉 Cả đội đã hạ được Boss!
                  {topContributor && topContributor.hits > 0 && (
                    <>
                      {" "}
                      Đóng góp nhiều nhất:{" "}
                      <b>
                        {topContributor.character?.icon
                          ? `${topContributor.character.icon} `
                          : ""}
                        {topContributor.name}
                      </b>{" "}
                      ({topContributor.hits} đòn)
                    </>
                  )}
                </p>
              )}

              {!battle && (
                <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>
                  Chưa có trận đấu nào — cứ luyện tập lấy Mana trước cũng
                  được!
                </p>
              )}

              {isHost && (!battle || battle.status !== "ongoing") && (
                <button
                  type="button"
                  onClick={handleStartBattle}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 10,
                    border: "none",
                    background: "#7c3aed",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  🐉 {battle ? "Triệu hồi Boss mới" : "Triệu hồi Boss"}
                </button>
              )}
              {!isHost && (!battle || battle.status !== "ongoing") && (
                <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                  Đang chờ chủ phòng triệu hồi boss…
                </p>
              )}
              {(!battle || battle.status !== "ongoing") && (
                <p style={{ color: "#94a3b8", fontSize: "0.72rem", margin: 0 }}>
                  Triệu hồi trận mới cũng cho mọi người "hồi sinh" lại từ
                  đầu, không cần mua Thẻ hồi sinh nữa.
                </p>
              )}

              {/* Đóng góp cả đội (chỉ học sinh — Boss đã hiện riêng ở trên) */}
              <div style={{ width: "100%", borderTop: "1px solid #f1f5f9", paddingTop: "0.6rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, marginBottom: 8 }}>
                  HỌC SINH ({arenaUsers.filter((u) => !u.isHost).length} người)
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                  {(battle
                    ? contributionList
                    : arenaUsers
                        .filter((u) => !u.isHost)
                        .map((u) => ({ ...u, hits: 0, character: getCharacterById(u.characterId) }))
                  ).map((u) => (
                    <span
                      key={u.id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "4px 10px",
                        borderRadius: 999,
                        border: "1px solid #e2e8f0",
                        background: u.id === socket.id ? "#f5f3ff" : "#f8fafc",
                        fontSize: "0.75rem",
                        opacity: u.eliminated ? 0.55 : 1,
                      }}
                    >
                      {u.eliminated ? "💀 " : ""}
                      {u.character?.icon ? `${u.character.icon} ` : ""}
                      {u.name}
                      {u.id === socket.id ? " (bạn)" : ""}
                      {battle ? (
                        <>
                          {" "}
                          · <b style={{ color: "#16a34a" }}>{u.hits}</b>
                        </>
                      ) : null}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Popup: Cửa hàng (BƯỚC 7 — dùng Đơn vị tiêu dùng, CHỈ dành cho
          học sinh): Khiên chắn + Bình hồi Mana + Thẻ hồi sinh. Lazy-mount
          như các popup khác. ── */}
      {hasOpenedShopModal && (
        <div
          className={`v6-modal-backdrop ${showShopModal ? "open" : ""}`}
          onClick={() => setShowShopModal(false)}
        >
          <div className="v6-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="v6-modal-header">
              <b>
                <i className="bi bi-shop me-2"></i>
                Cửa hàng
              </b>
              <button
                type="button"
                className="v6-modal-close"
                onClick={() => setShowShopModal(false)}
                title="Đóng"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div
              className="v6-modal-body"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                justifyContent: "center",
                alignContent: "flex-start",
              }}
            >
              <div
                style={{
                  width: 200,
                  border: "1px solid #e2e8f0",
                  borderRadius: 14,
                  padding: "1rem",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2rem" }}>🛡️</div>
                <h6 style={{ margin: "0.5rem 0 0.25rem", color: "#1e293b" }}>Khiên chắn</h6>
                <p style={{ color: "#64748b", fontSize: "0.78rem", margin: "0 0 0.6rem" }}>
                  Đỡ NGUYÊN 1 đòn tiếp theo từ Boss (kể cả đòn diện rộng).
                </p>
                <div style={{ fontWeight: 800, color: "#7c3aed", marginBottom: "0.6rem" }}>
                  Giá: {SHIELD_COST_UNITS}💰
                </div>
                <button
                  type="button"
                  onClick={handleBuyShield}
                  disabled={!!myUser?.shielded || (myUser?.units ?? 0) < SHIELD_COST_UNITS}
                  style={{
                    width: "100%",
                    padding: "9px",
                    borderRadius: 10,
                    border: "none",
                    background:
                      !myUser?.shielded && (myUser?.units ?? 0) >= SHIELD_COST_UNITS
                        ? "#16a34a"
                        : "#cbd5e1",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor:
                      !myUser?.shielded && (myUser?.units ?? 0) >= SHIELD_COST_UNITS
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  {myUser?.shielded ? "Đang có khiên" : `Mua ngay (${SHIELD_COST_UNITS}💰)`}
                </button>
              </div>

              <div
                style={{
                  width: 200,
                  border: "1px solid #e2e8f0",
                  borderRadius: 14,
                  padding: "1rem",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2rem" }}>🔷</div>
                <h6 style={{ margin: "0.5rem 0 0.25rem", color: "#1e293b" }}>Bình hồi Mana</h6>
                <p style={{ color: "#64748b", fontSize: "0.78rem", margin: "0 0 0.6rem" }}>
                  Hồi ngay {MANA_POTION_RESTORE} Mana — dùng khi hết Mana giữa
                  chừng mà chưa kịp trả lời thêm câu nào.
                </p>
                <div style={{ fontWeight: 800, color: "#7c3aed", marginBottom: "0.6rem" }}>
                  Giá: {MANA_POTION_COST_UNITS}💰
                </div>
                <button
                  type="button"
                  onClick={handleBuyManaPotion}
                  disabled={(myUser?.units ?? 0) < MANA_POTION_COST_UNITS}
                  style={{
                    width: "100%",
                    padding: "9px",
                    borderRadius: 10,
                    border: "none",
                    background:
                      (myUser?.units ?? 0) >= MANA_POTION_COST_UNITS ? "#16a34a" : "#cbd5e1",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor:
                      (myUser?.units ?? 0) >= MANA_POTION_COST_UNITS ? "pointer" : "not-allowed",
                  }}
                >
                  Mua ngay ({MANA_POTION_COST_UNITS}💰)
                </button>
              </div>

              <div
                style={{
                  width: 200,
                  border: "1px solid #e2e8f0",
                  borderRadius: 14,
                  padding: "1rem",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2rem" }}>💊</div>
                <h6 style={{ margin: "0.5rem 0 0.25rem", color: "#1e293b" }}>Thẻ hồi sinh</h6>
                <p style={{ color: "#64748b", fontSize: "0.78rem", margin: "0 0 0.6rem" }}>
                  Dùng ngay khi bạn bị loại khỏi vòng chiến để quay lại trận.
                </p>
                <div style={{ fontWeight: 800, color: "#7c3aed", marginBottom: "0.6rem" }}>
                  Giá: {REVIVAL_COST_UNITS}💰
                </div>
                <button
                  type="button"
                  onClick={handleBuyRevival}
                  disabled={!myEliminated || (myUser?.units ?? 0) < REVIVAL_COST_UNITS}
                  style={{
                    width: "100%",
                    padding: "9px",
                    borderRadius: 10,
                    border: "none",
                    background:
                      myEliminated && (myUser?.units ?? 0) >= REVIVAL_COST_UNITS
                        ? "#16a34a"
                        : "#cbd5e1",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor:
                      myEliminated && (myUser?.units ?? 0) >= REVIVAL_COST_UNITS
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  {myEliminated ? `Mua ngay (${REVIVAL_COST_UNITS}💰)` : "Bạn chưa bị loại"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Popup: Gợi ý (Y HỆT V2) ── */}
      {hasOpenedHintModal && hasHintContent && (
        <div
          className={`v6-hint-modal-backdrop ${showHintModal ? "open" : ""}`}
          onClick={() => setShowHintModal(false)}
        >
          <div className="v6-hint-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="v6-hint-modal-header">
              <b>💡 Gợi ý</b>
              <button
                type="button"
                className="v6-modal-close"
                onClick={() => setShowHintModal(false)}
                title="Đóng"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            {hintIsImage ? (
              <img src={hintRaw} className="v6-hint-img" alt="hint" loading="lazy" />
            ) : (
              <div className="v6-hint-text">{hintText}</div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: Bảng thông tin tham khảo (Y HỆT V2) ── */}
      {hasOpenedReference && totalLessons > 0 && (
        <div
          className={`v6-modal-backdrop ${showReference ? "open" : ""}`}
          onClick={() => setShowReference(false)}
        >
          <div className="v6-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="v6-modal-header">
              <b>
                <i className="bi bi-table me-2"></i>
                Bảng thông tin tham khảo
              </b>
              <button
                type="button"
                className="v6-modal-close"
                onClick={() => setShowReference(false)}
                title="Đóng"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="v6-ref-navbar">
              <button
                type="button"
                className={`v6-ref-navbtn ${OnTable === null ? "active" : ""}`}
                onClick={() => setOnTable(null)}
              >
                Tất cả
              </button>
              {DataPracticingOverRoll.map((_, i) => {
                if (i < navSlice.start || i >= navSlice.end) return null;
                return (
                  <button
                    type="button"
                    key={i}
                    className={`v6-ref-navbtn ${OnTable === i ? "active" : ""}`}
                    onClick={() => setOnTable(i)}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="v6-modal-body">
              {OnTable !== null && !DataPracticingOverRoll[OnTable]?.HDTB?.HD ? (
                <p style={{ color: "#94a3b8" }}>
                  Bài học này chưa có dữ liệu bảng tham khảo.
                </p>
              ) : (
                <TableHD
                  data={
                    OnTable !== null
                      ? DataPracticingOverRoll[OnTable].HDTB.HD
                      : tableOfContent
                  }
                  data_TB={
                    OnTable !== null ? DataPracticingOverRoll[OnTable].HDTB.TB : []
                  }
                  HINT={null}
                  PushAW={[]}
                  fnOnclick={(value) => {
                    if (OnTable !== null) return;
                    const m =
                      typeof value === "string" ? value.match(/\((\d+)\)/) : null;
                    if (m) setOnTable(parseInt(m[1], 10) - 1);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomofflineV6;
