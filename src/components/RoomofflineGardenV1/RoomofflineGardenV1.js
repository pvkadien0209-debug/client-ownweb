// RoomofflineGardenV1.js
//
// File MỚI HOÀN TOÀN — chế độ chơi chung thứ 2 (sau RoomofflineV6), đặt
// trong folder riêng (components/RoomofflineGardenV1/), KHÔNG sửa bất kỳ
// dòng nào trong RoomofflineV6.js hay các file khác — đúng nguyên tắc
// "tránh ảnh hưởng logic cũ" (đã chọn "Phòng hoàn toàn mới, tách biệt" khi
// hỏi ý kiến).
//
// Ý TƯỞNG — "Vườn đảo": đề xuất khi được hỏi "1 hoặc vài chục người có thể
// cùng chơi, ĐỘC LẬP - KHÔNG ảnh hưởng đến nhau, vẫn có tính tương tác và
// thú vị, tránh nhàm chán chơi 1 mình". KHÁC HẲN RoomofflineV6 (cả phòng
// cùng đánh chung 1 Boss — kết quả của người này ảnh hưởng người khác):
//   - Mỗi người có 1 "đảo" riêng, lớn dần theo MỐC RÕ RÀNG (🌱→🌿→🌳→🌸) khi
//     luyện ĐÚNG câu — hoàn toàn theo năng lực từng người, không ai bị người
//     khác làm chậm/nhanh lại, không thắng/thua, KHÔNG xếp hạng (đúng các
//     lựa chọn đã chọn khi hỏi ý kiến).
//   - Tất cả các đảo xếp cạnh nhau thành 1 QUẦN ĐẢO luôn hiển thị chung
//     (RoomofflineGardenV1Scene.js) — để mọi người thấy nhau "đang cùng
//     luyện tập", tránh cảm giác chơi 1 mình.
//   - Tương tác xã hội DUY NHẤT: bấm vào đảo người khác để thả emoji cổ vũ
//     👏 (đúng lựa chọn "chỉ thả emoji cổ vũ" đã chọn) — không ảnh hưởng
//     gameplay của ai, chỉ để vui.
//   - Khi 1 đảo đạt mốc cao nhất (hoàn thành) → hiệu ứng ăn mừng hiện cho CẢ
//     PHÒNG cùng thấy (đúng lựa chọn đã chọn).
//   - KHÔNG có khái niệm "chủ phòng"/"bắt đầu trận"/tài nguyên để tiêu — ai
//     vào phòng là luyện tập ngay, không cần chờ ai, không có gì để "thua".
//
// VÒNG LẶP LUYỆN TẬP: TÁI HIỆN Y HỆT RoomofflineV2.js/RoomofflineV6.js (chọn
// 1 câu ngẫu nhiên từ DataPracticingCharactor → đọc to bằng ReadMessage →
// người chơi nói/gõ câu trả lời qua RoomofflineV2InputPanel — TÁI SỬ DỤNG
// nguyên component, không sửa — → chấm bằng ĐÚNG cơ chế so khớp của V2
// (findBest/checkArrays, compareTwoStrings làm phương án dự phòng — TÁI SỬ
// DỤNG nguyên roomofflineV2AnswerMatcher.js, không sửa). Câu SAI ở đây
// KHÔNG bị phạt gì cả (khác V6 trừ tài nguyên) — đúng tinh thần "thư giãn,
// đồng hành" đã chọn, không tạo áp lực.
//
// "Ô chơi" 90% x 90% viewport + chặn thiết bị di động/trình duyệt trong app:
// COPY nguyên kỹ thuật + lý do từ RoomofflineV6.js (PixiJS canvas + mic cần
// màn hình web thường mới ổn định) — xem isDesktopWebPlatform bên dưới.

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
import RoomofflineGardenV1Scene from "./RoomofflineGardenV1Scene";

// Nhận diện "không phải web máy tính thường" — COPY nguyên logic (không
// import, vì bản gốc là hàm nội bộ không export) từ RoomofflineV6.js (bản
// đó COPY từ detectInAppBrowser/detectBrowser trong
// pracPages/C_RoomOffline_LAYDULIEUTH.js) — giữ đúng lý do: canvas PixiJS +
// mic cần màn hình/trình duyệt web thường mới ổn định.
function isDesktopWebPlatform() {
  const ua = (typeof navigator !== "undefined" && navigator.userAgent) || "";
  const isMobileUA =
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
  const isInAppBrowser =
    /Zalo|FBAN|FBAV|FB_IAB|FBIOS|FBANDROID|Instagram|Line\//i.test(ua);
  return !isMobileUA && !isInAppBrowser;
}

// Sinh mã phòng ngẫu nhiên gợi ý — COPY nguyên cách RoomofflineV6.js đang
// làm (Lobby.js cũ dùng cùng công thức), không đáng tách file dùng chung chỉ
// vì 1 dòng tiện ích rất nhỏ.
function generateSuggestedRoomName() {
  return Math.random().toString(36).substring(2, 7);
}

// 4 mốc lớn dần — PHẢI khớp GROWTH_STAGE_THRESHOLDS trong ioGardenV1.js (2
// runtime tách biệt, không import chung được) VÀ STAGE_ICONS trong
// RoomofflineGardenV1Scene.js.
const STAGE_ICONS = ["🌱", "🌿", "🌳", "🌸"];
const STAGE_NAMES = ["Hạt giống", "Cây non", "Cây trưởng thành", "Đảo hoàn thiện"];
const MAX_STAGE_INDEX = STAGE_ICONS.length - 1;

// Số cột của quần đảo — CHỈ ảnh hưởng cách xếp hình ở client (không cần giữ
// khớp gì với server, xem ghi chú ở ioGardenV1.js: vị trí đảo không ảnh
// hưởng gameplay như tầm đánh ở V6 nên không cần "sự thật" từ server).
const GRID_COLS = 8;

// Ngưỡng độ giống (0..1) để tính là trả lời đúng — CHỈ dùng cho phương án dự
// phòng khi currentItem thiếu submit/data (ĐÚNG ngưỡng V2/V6 đang dùng).
const ANSWER_MATCH_THRESHOLD = 0.7;

// Emoji cổ vũ DUY NHẤT hiện tại (đúng lựa chọn "chỉ thả emoji cổ vũ" — đơn
// giản nhất là 1 click gửi ngay, không cần mở bảng chọn emoji riêng). Phải
// nằm trong CHEER_EMOJI_WHITELIST ở ioGardenV1.js.
const CHEER_EMOJI = "👏";

const RoomofflineGardenV1 = ({ setSttRoom }) => {
  const { roomCode, currentIndex, gameRoom } = useParams();
  const locationSet = useLocation();
  const params = new URLSearchParams(locationSet.search);
  const navigate = useNavigate();
  const ObjREAD = useContext(ObjREADContext);

  const [roomInfo] = useState({ fileName: roomCode });

  // ── Bước 0: chọn/vào phòng chơi chung — KHÔNG có bước "chọn nhân vật"
  // (không cần, vì icon đảo đã tự thể hiện tiến độ, không ảnh hưởng
  // gameplay như nhân vật ở V6) ─────────────────────────────────────────────
  const [gardenRoomName, setGardenRoomName] = useState(gameRoom || null);
  const [roomNameDraft, setRoomNameDraft] = useState(() =>
    generateSuggestedRoomName(),
  );

  const [StartToGetData, setStartToGetData] = useState(false);
  const [DataPracticingCharactor, setDataPracticingCharactor] = useState(null);
  const [DataPracticingOverRoll, setDataPracticingOverRoll] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const [gardenJoinState, setGardenJoinState] = useState("idle"); // idle | joining | joined | error
  const [gardenUsers, setGardenUsers] = useState([]);
  const [gardenError, setGardenError] = useState(null);

  // Emoji cổ vũ vừa bay tới đảo ai đó — CẢ PHÒNG cùng thấy (quần đảo là 1
  // cảnh chung, xem ghi chú ở ioGardenV1.js).
  const [cheerFx, setCheerFx] = useState(null);
  // Vừa có người hoàn thành đảo (mốc cao nhất) — CẢ PHÒNG cùng thấy hiệu
  // ứng ăn mừng (đúng lựa chọn đã chọn khi hỏi ý kiến).
  const [celebrateFx, setCelebrateFx] = useState(null);
  const [cheerHint, setCheerHint] = useState(null); // "Đã cổ vũ <tên>!" tự biến mất

  // ── Vòng lặp luyện tập — Y HỆT RoomofflineV2.js/RoomofflineV6.js (câu hỏi
  // độc lập, không đồng bộ với ai) ────────────────────────────────────────
  const [currentQIndex, setCurrentQIndex] = useState(null); // null = chưa chọn câu
  const [mode, setMode] = useState("noi"); // "noi" | "text"
  const [isReading, setIsReading] = useState(false);
  const [pushAW, setPushAW] = useState([]); // các "tag" đã thu thập cho câu hiện tại
  const justOneRef = useRef(false);
  const [lastCheck, setLastCheck] = useState(null);

  // ── "Bảng tham khảo" + "Gợi ý" (mang lại từ V2/V6) — Key localStorage
  // RIÊNG cho Garden ("vgarden1ref_") — không lẫn vị trí đã lưu với V2/V6.
  const ON_TABLE_STORAGE_KEY = `vgarden1ref_${roomCode}`;
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

  // Danh sách người chơi trong quần đảo (id, name, correctCount, stage,
  // completed) — cập nhật realtime, DO SERVER giữ (xem ghi chú ioGardenV1.js
  // — khác V6, ở đây người KHÁC cũng cần thấy đảo mình lớn lên nên không thể
  // chỉ giữ ở client).
  useEffect(() => {
    const handleGardenUpdateRoom = (data) => {
      if (!isMountedRef.current) return;
      if (!gardenRoomName || data.roomName !== gardenRoomName) return;
      setGardenUsers(data.users || []);
    };
    socket.on("gardenUpdateRoom", handleGardenUpdateRoom);
    return () => {
      socket.off("gardenUpdateRoom", handleGardenUpdateRoom);
    };
  }, [gardenRoomName]);

  // Có người vừa hoàn thành đảo (mốc cao nhất) — hiệu ứng ăn mừng cho CẢ
  // PHÒNG (đúng lựa chọn đã chọn khi hỏi ý kiến).
  useEffect(() => {
    const handleGardenCelebrate = (data) => {
      if (!isMountedRef.current) return;
      if (!gardenRoomName || data.roomName !== gardenRoomName) return;
      setCelebrateFx({ userId: data.userId, ts: Date.now() });
    };
    socket.on("gardenCelebrate", handleGardenCelebrate);
    return () => {
      socket.off("gardenCelebrate", handleGardenCelebrate);
    };
  }, [gardenRoomName]);

  // Có người vừa thả emoji cổ vũ vào 1 đảo nào đó — CẢ PHÒNG cùng thấy hiệu
  // ứng bay lên (xem ghi chú ở ioGardenV1.js/Scene).
  useEffect(() => {
    const handleGardenCheerFx = (data) => {
      if (!isMountedRef.current) return;
      if (!gardenRoomName || data.roomName !== gardenRoomName) return;
      setCheerFx({ targetUserId: data.targetUserId, emoji: data.emoji, ts: Date.now() });
    };
    socket.on("gardenCheerFx", handleGardenCheerFx);
    return () => {
      socket.off("gardenCheerFx", handleGardenCheerFx);
    };
  }, [gardenRoomName]);

  // ── Lấy dữ liệu bài học (Y HỆT V2/V6 — cùng 1 nguồn, cùng 1 định dạng
  // item: {submit, data, fsp, gender, fspSets, img, ...}) ─────────────────
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
          console.warn('Failed to parse "a" parameter (Garden):', error.message);
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
      console.error("Error fetching data (RoomofflineGardenV1):", error);
      if (isMountedRef.current) setFetchError(error.message);
    }
  };

  // Khi dữ liệu bài học đã tải xong VÀ đã có tên phòng → vào/tạo phòng chơi
  // chung qua socket. KHÔNG cần chờ "chọn nhân vật" như V6 — vào là chơi
  // ngay. Nếu là người TẠO phòng, sau khi vào thành công đổi lại URL để
  // thêm tên phòng — biến link hiện tại thành link chia sẻ được ngay.
  useEffect(() => {
    if (!DataPracticingCharactor || !gardenRoomName) return;
    if (gardenJoinState !== "idle") return;

    setGardenJoinState("joining");
    const displayName = localStorage.getItem("nameDinhDanh") || "Người chơi";

    socket.emit(
      "gardenCreateOrJoin",
      gardenRoomName,
      { name: displayName },
      (res) => {
        if (!isMountedRef.current) return;
        if (!res?.ok) {
          setGardenJoinState("error");
          setGardenError(res?.error || "Không vào được phòng chơi chung");
          return;
        }
        setGardenUsers(res.users || []);
        setGardenJoinState("joined");

        if (!gameRoom) {
          navigate(
            `/roomofflinegarden/${roomCode}/${currentIndex}/${gardenRoomName}${locationSet.search}`,
            { replace: true },
          );
        }
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DataPracticingCharactor, gardenRoomName]);

  const currentItem =
    currentQIndex !== null && DataPracticingCharactor
      ? DataPracticingCharactor[currentQIndex]
      : null;

  const hasCmdData =
    !!currentItem &&
    Array.isArray(currentItem.submit) &&
    Array.isArray(currentItem.data) &&
    currentItem.data.length > 0;

  // ── "Bảng tham khảo" (Y HỆT V2/V6): mục lục "Tất cả" + thanh điều hướng
  // theo số thứ tự bài, dùng nguyên TableHD để hiển thị.
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

  // ── "Gợi ý" (Y HỆT V2/V6): hiện chip nhỏ khi câu hiện tại có hint; nếu
  // không có hint thì hiện ảnh minh họa (currentItem.img) thay thế.
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

  // 1 câu ĐÚNG → báo server lớn thêm 1 mốc (server giữ correctCount/stage
  // thật, xem ghi chú ioGardenV1.js). 1 câu SAI → KHÔNG làm gì cả (đúng tinh
  // thần "thư giãn, đồng hành", không phạt như trừ tài nguyên ở V6).
  const handleMarkCorrect = () => {
    if (gardenRoomName) socket.emit("gardenGrow", gardenRoomName);
  };
  const handleMarkWrong = () => {};

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
      console.warn("Không đọc được câu hỏi (RoomofflineGardenV1):", error);
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
  // cơ chế chấm của RoomofflineV2.js/RoomofflineV6.js (findBest/checkArrays
  // với submit/data, compareTwoStrings làm phương án dự phòng), chỉ khác
  // chỗ ghi nhận kết quả: handleMarkCorrect/handleMarkWrong ở đây không có
  // khái niệm tài nguyên, chỉ có "lớn thêm hay không".
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
          console.warn("Không đọc được câu nhắc lại (Garden):", error);
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
          console.warn("Không đọc được câu xác nhận (Garden):", error);
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
  // — TÁI HIỆN đúng useEffect [Submit, PushAW] ở RoomofflineV2.js/V6.js.
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
      // Có tag sai nhưng chưa đủ hết submit — KHÔNG phạt gì (khác V6 trừ
      // tài nguyên), vẫn ở lại câu này để thử tiếp.
      handleMarkWrong();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pushAW, hasCmdData]);

  // Bấm vào đảo người khác (báo lên từ RoomofflineGardenV1Scene) → thả
  // emoji cổ vũ cố định. Chặn spam nhẹ ở client cho mượt UX (server tự
  // chặn chắc chắn bằng MIN_CHEER_INTERVAL_MS, xem ioGardenV1.js).
  const lastCheerSentAtRef = useRef(0);
  const handleIslandClick = (targetUserId, targetName) => {
    if (!gardenRoomName) return;
    const now = Date.now();
    if (now - lastCheerSentAtRef.current < 1200) return;
    lastCheerSentAtRef.current = now;
    socket.emit("gardenCheer", gardenRoomName, targetUserId, CHEER_EMOJI);
    setCheerHint(`Đã cổ vũ ${targetName || "bạn ấy"} ${CHEER_EMOJI}`);
    setTimeout(() => setCheerHint(null), 1800);
  };

  // ── Chặn ngay từ đầu nếu KHÔNG phải web máy tính thường (COPY lý do từ
  // RoomofflineV6.js — xem ghi chú đầu file) ────────────────────────────────
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

  // ── Màn hình 0: chưa có tên phòng trên URL → tự chọn tên phòng (KHÔNG cần
  // chọn nhân vật như V6 — vào phòng là chơi ngay) ─────────────────────────
  if (!gardenRoomName) {
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
          <div style={{ fontSize: "2.5rem" }}>🏝️</div>
          <h4 style={{ margin: "1rem 0 0.25rem", color: "#1e293b" }}>
            RoomofflineGardenV1 — Vườn đảo
          </h4>
          <p style={{ color: "#64748b", marginBottom: "1.25rem" }}>
            Đặt tên cho phòng chơi chung. Mỗi người tự luyện, đảo riêng của
            mình lớn dần — không ai ảnh hưởng ai, chỉ cùng ngắm quần đảo
            chung và cổ vũ nhau. Sau khi vào phòng, chia sẻ link trên thanh
            địa chỉ cho người khác để họ vào cùng.
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
              border: "2px solid #67e8f9",
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
              if (trimmed) setGardenRoomName(trimmed);
            }}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              border: "none",
              background: "#0ea5e9",
              color: "#fff",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Vào Vườn đảo
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
            background: "#e0f2fe",
            fontWeight: 700,
            color: "#075985",
          }}
        >
          Vườn đảo — Phòng: <b>{gardenRoomName}</b>
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

  if (gardenJoinState === "error") {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#b91c1c" }}>
        Lỗi vào phòng chơi chung: {gardenError}
      </div>
    );
  }

  if (gardenJoinState !== "joined") {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
        Đang vào phòng chơi chung…
      </div>
    );
  }

  // Danh sách cho quần đảo — GIỮ NGUYÊN thứ tự gardenUsers (thứ tự vào
  // phòng), để vị trí từng đảo không bị nhảy lung tung mỗi khi có ai đó
  // trả lời đúng thêm 1 câu.
  const islandPlayers = gardenUsers.map((u) => ({
    id: u.id,
    name: u.name,
    stage: u.stage || 0,
    isMe: u.id === socket.id,
  }));

  const myUser = gardenUsers.find((u) => u.id === socket.id);
  const myStage = Math.max(0, Math.min(MAX_STAGE_INDEX, myUser?.stage || 0));
  const myCorrectCount = myUser?.correctCount || 0;
  const nextThreshold =
    myStage < MAX_STAGE_INDEX
      ? [0, 5, 15, 30][myStage + 1]
      : null;

  // "Ô chơi" 90% x 90%, cố định, KHÔNG bị ảnh hưởng bởi cuộn trang — TÁI
  // HIỆN đúng kỹ thuật của RoomofflineV2.js/RoomofflineV6.js.
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
        .vg1-modal-backdrop, .vg1-hint-modal-backdrop {
          position: fixed; inset: 0; background: rgba(15,23,42,0.55); z-index: 50;
          display: flex; align-items: center; justify-content: center; padding: 16px;
          opacity: 0; pointer-events: none; transition: opacity 0.25s ease;
        }
        .vg1-modal-backdrop.open, .vg1-hint-modal-backdrop.open { opacity: 1; pointer-events: auto; }
        .vg1-modal-panel {
          background: #fff; border-radius: 16px; width: 85vw; height: 85vh;
          display: flex; flex-direction: column; overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.25);
          opacity: 0; transform: scale(0.94) translateY(10px);
          transition: opacity 0.25s ease, transform 0.25s ease;
        }
        .vg1-hint-modal-panel {
          background: #fff; border-radius: 16px; width: min(480px, 92vw); max-height: 80vh;
          overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.25);
          opacity: 0; transform: scale(0.94) translateY(10px);
          transition: opacity 0.25s ease, transform 0.25s ease;
        }
        .vg1-modal-backdrop.open .vg1-modal-panel,
        .vg1-hint-modal-backdrop.open .vg1-hint-modal-panel { opacity: 1; transform: scale(1) translateY(0); }
        .vg1-modal-header, .vg1-hint-modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #075985; flex-shrink: 0;
        }
        .vg1-modal-close {
          border: none; background: #f1f5f9; color: #475569; width: 32px; height: 32px;
          border-radius: 8px; cursor: pointer;
        }
        .vg1-ref-navbar {
          display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 18px;
          border-bottom: 1px solid #e2e8f0; flex-shrink: 0;
        }
        .vg1-ref-navbtn {
          border: 1px solid #e2e8f0; background: #f8fafc; color: #475569; font-weight: 700;
          font-size: 0.78rem; padding: 5px 10px; border-radius: 8px; cursor: pointer;
        }
        .vg1-ref-navbtn.active { background: #0ea5e9; border-color: #0ea5e9; color: #fff; }
        .vg1-modal-body { flex: 1; min-height: 0; padding: 14px 18px; overflow-y: auto; }
        .vg1-hint-text { font-size: 0.95rem; color: #1e293b; white-space: pre-line; padding: 16px 18px; }
        .vg1-hint-img { max-width: 100%; max-height: 60vh; border-radius: 8px; display: block; margin: 16px auto; }
        .vg1-hint-chip {
          display: inline-flex; align-items: center; gap: 6px; background: #fffbeb;
          border: 1px solid #fde68a; color: #92400e; font-weight: 700; font-size: 0.8rem;
          padding: 6px 14px; border-radius: 999px; cursor: pointer; margin-bottom: 10px;
        }
        .vg1-thumb-box { display: flex; justify-content: center; margin-bottom: 10px; }
        .vg1-thumb-img { max-width: 100%; max-height: 140px; border-radius: 10px; display: block; }
        .vg1-reveal-btn {
          border: 1px solid #67e8f9; background: #ecfeff; color: #075985; font-weight: 700;
          padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 0.8rem;
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
          {/* Nút ẩn — ReadMessage_2024.js (TÁI SỬ DỤNG, không sửa) tự bấm khi
              bắt đầu/kết thúc đọc, giống hệt cơ chế IsReading của V2/V6. */}
          <div style={{ display: "none" }}>
            <button id="readingFalse" onClick={() => setIsReading(false)} />
            <button id="readingTrue" onClick={() => setIsReading(true)} />
          </div>

          {/* ── Header gọn ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
              flexShrink: 0,
              flexWrap: "wrap",
              gap: "4px",
            }}
          >
            <span style={{ color: "#64748b", fontSize: "0.8rem" }}>
              Vườn đảo · Phòng <b>{gardenRoomName}</b> · {gardenUsers.length}{" "}
              người chơi
            </span>
            <span
              style={{
                fontWeight: 800,
                color: "#075985",
                background: "#e0f2fe",
                padding: "3px 10px",
                borderRadius: 999,
                fontSize: "0.85rem",
              }}
            >
              {STAGE_ICONS[myStage]} {STAGE_NAMES[myStage]}
              {nextThreshold !== null
                ? ` (${myCorrectCount}/${nextThreshold})`
                : " ✓"}
            </span>
          </div>

          {cheerHint && (
            <div
              style={{
                fontSize: "0.75rem",
                color: "#0ea5e9",
                fontWeight: 700,
                marginBottom: "0.3rem",
                flexShrink: 0,
              }}
            >
              {cheerHint}
            </div>
          )}

          {/* ── Thân bài 2 CỘT: cột trái là QUẦN ĐẢO (ưu tiên hiển thị, chiếm
              phần lớn không gian — cùng tinh thần "ưu tiên hiển thị bản đồ"
              đã áp dụng cho RoomofflineV6, để hấp dẫn người chơi); cột phải
              là vòng lặp luyện tập (Y HỆT V2, độc lập với mọi người khác). ── */}
          <div style={{ flex: 1, minHeight: 0, display: "flex", gap: "0.75rem" }}>
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
                overflow: "auto",
              }}
            >
              <p style={{ color: "#64748b", fontSize: "0.72rem", margin: "0 0 6px" }}>
                👆 Bấm vào đảo người khác để cổ vũ {CHEER_EMOJI} — đảo của bạn
                (viền tím) tự lớn khi bạn trả lời đúng, không ai làm ảnh
                hưởng ai.
              </p>
              <RoomofflineGardenV1Scene
                players={islandPlayers}
                gridCols={GRID_COLS}
                cheerFx={cheerFx}
                celebrate={celebrateFx}
                onIslandClick={handleIslandClick}
              />
            </div>

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
                      background: "#0ea5e9",
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
                      border: mode === "noi" ? "2px solid #0ea5e9" : "1px solid #cbd5e1",
                      background: mode === "noi" ? "#ecfeff" : "#fff",
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
                      border: mode === "text" ? "2px solid #0ea5e9" : "1px solid #cbd5e1",
                      background: mode === "text" ? "#ecfeff" : "#fff",
                      fontSize: "0.78rem",
                      cursor: "pointer",
                    }}
                  >
                    ⌨️ Text
                  </button>
                  <button
                    type="button"
                    className="vg1-reveal-btn"
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
                      <div className="vg1-thumb-box" style={{ marginBottom: 6 }}>
                        <img
                          src={thumbImg}
                          className="vg1-thumb-img"
                          alt="minh họa"
                          loading="lazy"
                          style={{ maxHeight: 90 }}
                        />
                      </div>
                    )}

                    {hasHintContent && (
                      <button
                        type="button"
                        className="vg1-hint-chip"
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
                          color: lastCheck.isCorrect ? "#16a34a" : "#64748b",
                          marginTop: "0.4rem",
                        }}
                      >
                        {lastCheck.isCorrect
                          ? `✅ Đúng! Đảo của bạn lớn thêm 1 chút.`
                          : `➖ Chưa đúng — không sao, thử câu khác nhé.`} — độ
                        giống {(lastCheck.score * 100).toFixed(0)}% (câu đúng:
                        "{lastCheck.target}")
                      </p>
                    )}
                    {lastCheck && lastCheck.kind === "noMatch" && (
                      <p style={{ textAlign: "center", fontWeight: 700, fontSize: "0.78rem", color: "#64748b", marginTop: "0.4rem" }}>
                        ❓ Không nhận ra câu trả lời — thử nói/gõ lại xem.
                      </p>
                    )}
                    {lastCheck && lastCheck.kind === "wrongSkip" && (
                      <p style={{ textAlign: "center", fontWeight: 700, fontSize: "0.78rem", color: "#64748b", marginTop: "0.4rem" }}>
                        ➖ Chưa đúng — chuyển sang câu khác…
                      </p>
                    )}
                    {lastCheck && lastCheck.kind === "collected" && (
                      <p style={{ textAlign: "center", fontWeight: 700, fontSize: "0.78rem", color: "#16a34a", marginTop: "0.4rem" }}>
                        ✅ Ghi nhận đúng 1 phần — tiếp tục trả lời cho đủ câu
                        hỏi.
                      </p>
                    )}
                  </>
                ) : (
                  <p style={{ color: "#64748b", textAlign: "center", fontSize: "0.82rem" }}>
                    Bấm "Bắt đầu" để nhận câu hỏi đầu tiên. Mỗi câu ĐÚNG giúp
                    đảo của bạn lớn thêm 1 chút — câu sai không sao cả, cứ thử
                    tiếp!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Popup: Bảng tham khảo (Y HỆT V2/V6 — TÁI SỬ DỤNG nguyên TableHD) ── */}
      {hasOpenedReference && (
        <div
          className={`vg1-modal-backdrop ${showReference ? "open" : ""}`}
          onClick={() => setShowReference(false)}
        >
          <div className="vg1-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="vg1-modal-header">
              <b>
                <i className="bi bi-table me-2"></i>
                Bảng tham khảo
              </b>
              <button
                type="button"
                className="vg1-modal-close"
                onClick={() => setShowReference(false)}
                title="Đóng"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="vg1-ref-navbar">
              {Array.from(
                { length: navSlice.end - navSlice.start },
                (_, i) => navSlice.start + i,
              ).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`vg1-ref-navbtn ${OnTable === n ? "active" : ""}`}
                  onClick={() => setOnTable(n)}
                >
                  {n + 1}
                </button>
              ))}
            </div>
            <div className="vg1-modal-body">
              <TableHD
                data={tableOfContent}
                currentIndex={OnTable}
                setCurrentIndex={setOnTable}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Popup: Gợi ý (Y HỆT V2/V6) ── */}
      {hasOpenedHintModal && (
        <div
          className={`vg1-hint-modal-backdrop ${showHintModal ? "open" : ""}`}
          onClick={() => setShowHintModal(false)}
        >
          <div className="vg1-hint-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="vg1-hint-modal-header">
              <b>
                <i className="bi bi-lightbulb me-2"></i>
                Gợi ý
              </b>
              <button
                type="button"
                className="vg1-modal-close"
                onClick={() => setShowHintModal(false)}
                title="Đóng"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            {hintIsImage ? (
              <img src={hintRaw} className="vg1-hint-img" alt="gợi ý" />
            ) : (
              <div className="vg1-hint-text">{hintText}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomofflineGardenV1;
