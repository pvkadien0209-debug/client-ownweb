// RoomofflineV2.js
//
// Bản "version 2" của Roomoffline.js — được tạo MỚI HOÀN TOÀN, đặt trong
// folder riêng (components/RoomofflineV2/), KHÔNG sửa bất kỳ dòng nào trong
// Roomoffline.js hay các file khác đang được Roomoffline.js dùng.
//
// Bước 2a (đã xong): thực hiện lại đầy đủ các bước LẤY DỮ LIỆU giống hệt
// Roomoffline.js (đọc :roomCode/:currentIndex, gọi fetchTitle → fetch JSON bài
// học → interleaveCharacters). Dữ liệu này được giữ nguyên logic cho các bước
// sau.
//
// Bước 2b (đã xong): thanh điểm trên cùng với Điểm đúng / Điểm sai TÁCH RIÊNG
// (đúng thì +1 điểm đúng, sai thì +1 điểm sai — không cộng/trừ chung 1
// "Score" như bản cũ), khối trung tâm 80%x80% cố định (không bị scroll ảnh
// hưởng) chứa khu vực Nói/Text. (Nút "Hiển thị" xem dữ liệu debug — dùng tạm
// ở bước 2a để kiểm tra — đã được bỏ đi theo yêu cầu, không cần nữa.)
//
// Bước hiện tại (2c): thêm hàng nút gọn phía trên khối trung tâm, dùng icon
// cho gọn, đúng bố cục:  [ [Nghe câu hỏi - Câu mới(Bắt đầu)] [Nói/Text] ]
//   - "Câu mới" (hiển thị "Bắt đầu" khi chưa có câu nào) → chọn 1 câu ngẫu
//     nhiên từ DataPracticingCharactor (đã lấy ở bước 2a) làm "câu hiện tại",
//     rồi đọc to câu đó lên — TÁI SỬ DỤNG nguyên hàm ReadMessage
//     (client/src/ulti/ReadMessage_2024.js) và ObjREADContext giống hệt cách
//     Roomoffline.js/B101_FINAL_PROJECTS.js đang dùng, không sửa 2 file đó.
//   - "Nghe lại" → đọc lại câu hiện tại, dùng lại đúng ReadMessage như trên.
//   - Nút Nói/Text (trước đặt trong RoomofflineV2InputPanel) chuyển lên hàng
//     này cho đúng bố cục — panel giờ nhận `mode` làm prop điều khiển từ đây.
//   - Giờ đã có "câu hiện tại" thật, nên câu trả lời gửi lên từ
//     RoomofflineV2InputPanel được so khớp với câu hỏi (so sánh độ giống chuỗi
//     bằng string-similarity, thư viện đã có sẵn trong client) để cộng điểm
//     đúng/sai tách riêng — thay cho 2 nút test tạm thời ở bước 2b.
//
// Bước hiện tại (2d): bảng thông tin tham khảo (trước đây luôn hiển thị một
// phần trong Roomoffline.js) giờ được ẩn sau nút "Tham khảo"; bấm vào mới mở
// ra (dạng overlay/modal, bấm ra ngoài hoặc nút đóng để tắt). Theo phản hồi,
// bảng này phải ĐẦY ĐỦ TẤT CẢ CÁC BẢNG (mọi bài học), giống hệt logic ở
// Roomoffline.js/B101_FINAL_PROJECTS.js: có mục lục "Tất cả" (tableOfContent)
// và thanh điều hướng theo số thứ tự bài (OnTable + navSlice) để xem từng
// bảng HD riêng — TÁI SỬ DỤNG nguyên component TableHD (client/src/components/
// pracPages/B101_FINAL_TABLE-HD.js — không sửa file này) và hàm dựng mục lục
// (đã copy thành buildTableOfContent trong roomofflineV2DataUtils.js), chỉ
// khác là hiển thị dạng chỉ-xem-để-tham-khảo (không dùng cơ chế click-chọn-
// đáp-án cũ, fnOnclick chỉ dùng để điều hướng giữa các bảng).
//
// Bước hiện tại (2e): logic hiển thị hint (playData.hint ở bản cũ — nay là
// currentItem.hint) được ẩn bớt: mặc định chỉ hiện một phần giới hạn ngay
// trong div, kèm nút "Xem thêm" để mở rộng ra toàn bộ hint (và "Thu gọn" để
// ẩn lại). Ảnh hint (isImageUrl — TÁI SỬ DỤNG nguyên client/src/ulti/
// isImageUrl.js, không sửa file này) vẫn hiển thị đầy đủ như bản cũ, không áp
// dụng rút gọn. Hint reset về trạng thái thu gọn mỗi khi có câu mới.
//
// Màn hình nhập thông tin trước khi lấy dữ liệu (DataPracticeComponent) được
// TÁI SỬ DỤNG (import) nguyên bản từ pracPages/C_RoomOffline_LAYDULIEUTH vì đây
// là màn hình cấu hình dùng chung, chưa nằm trong phạm vi cần đổi UI của V2.
//
// Bước "kiểm tra toàn diện" (audit so với Roomoffline.js/B101_FINAL_PROJECTS.js
// bản cũ) — 3 việc nhỏ/vừa đã xử lý:
//   1. Nút "Xóa" trong RoomofflineV2InputPanel.js (xem file đó).
//   2. Khi currentItem KHÔNG có hint, hiển thị currentItem.img làm ảnh minh
//      họa thay thế (thumbImg) — giống nhánh `playData?.img` ở bản cũ, tránh
//      để trống như trước.
//   3. Đồng bộ "tắt mic khi đang đọc": thêm state isReading + 2 nút ẩn
//      #readingTrue/#readingFalse để ReadMessage_2024.js (không sửa) tự bấm
//      khi bắt đầu/kết thúc đọc — TÁI HIỆN đúng cơ chế IsReading của
//      Roomoffline.js bản cũ. Nút "Nghe lại"/"Câu mới" và nút mic (trong
//      InputPanel) bị disable trong lúc đọc; nút ẩn #sttStopBTN (trong
//      InputPanel) được ReadMessage_2024.js tự bấm để tắt mic trước khi đọc.
// Việc lớn (bước riêng, ngay sau đây): chuyển cơ chế chấm điểm chính sang so
// khớp submit/data/aw ĐÚNG Y HỆT bản cũ, thay cho cách so toàn câu đơn giản
// (compareTwoStrings với currentItem.fsp) đã dùng tạm ở bước 2c:
//   - currentItem.submit = danh sách "tag" cần thu thập đủ để coi là xong câu.
//   - currentItem.data = danh sách {qs, aw, aw01, action} — câu trả lời (nói
//     hoặc gõ) được so với từng biến thể qs (findBest — sao chép nguyên logic
//     từ RegcognitionV2024-05-NG.js, xem roomofflineV2AnswerMatcher.js); khớp
//     thì đọc to 1 "aw" xác nhận (TÁI SỬ DỤNG ReadMessage) và đẩy action[0]
//     vào PushAW (action[0] === "WRONG" thì tính sai + bỏ qua câu này luôn,
//     giống nút "Bỏ qua" bản cũ).
//   - Mỗi khi PushAW đổi, checkArrays(submit, PushAW) (sao chép nguyên từ
//     B101_FINAL_PROJECTS.js) quyết định: đủ đúng → +1 điểm đúng rồi sang câu
//     mới; sai ≥2 tag → +1 điểm sai rồi sang câu mới; sai 1 tag nhưng chưa đủ
//     → +1 điểm sai nhưng VẪN Ở LẠI câu này để thử tiếp; chưa sai, chưa đủ →
//     chờ tiếp, không làm gì.
// Nếu currentItem KHÔNG có đủ submit/data (một số bài học cũ có thể thiếu
// field này), V2 tự động dùng lại cách so toàn câu (compareTwoStrings) làm
// phương án dự phòng, để không bị crash/vô dụng với dữ liệu thiếu.

import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { compareTwoStrings } from "string-similarity";
import "bootstrap/dist/css/bootstrap.min.css";
import { ObjREADContext } from "../../App";
import ReadMessage from "../../ulti/ReadMessage_2024";
import isImageUrl from "../../ulti/isImageUrl";
import helper_fn_localStorage from "../../ulti/helper_fn_localStorage";
import DataPracticeComponent from "../pracPages/C_RoomOffline_LAYDULIEUTH";
import TableHD from "../pracPages/B101_FINAL_TABLE-HD";
import {
  interleaveCharacters,
  parseStringToNumbers,
  buildTableOfContent,
} from "./roomofflineV2DataUtils";
import {
  findBest,
  checkArrays,
  bestSimilarityScore,
} from "./roomofflineV2AnswerMatcher";
import RoomofflineV2InputPanel from "./RoomofflineV2InputPanel";

// Ngưỡng độ giống (0..1) để tính là trả lời đúng — CHỈ dùng cho phương án dự
// phòng (khi currentItem thiếu submit/data) — có thể tinh chỉnh sau khi thử
// nghiệm thực tế với STT.
const ANSWER_MATCH_THRESHOLD = 0.7;

const RoomofflineV2 = ({ setSttRoom }) => {
  const { roomCode, currentIndex } = useParams();
  const locationSet = useLocation();
  const params = new URLSearchParams(locationSet.search);
  const ObjREAD = useContext(ObjREADContext);

  const [roomInfo] = useState({
    fileName: roomCode,
    objList: [0, 1, 2, 3, 4, 5, 6],
    reverse: 1,
  });
  const [StartToGetData, setStartToGetData] = useState(false);
  const [IndexSets, setIndexSets] = useState(null);
  const [DataPracticingCharactor, setDataPracticingCharactor] = useState(null);
  const [DataPracticingOverRoll, setDataPracticingOverRoll] = useState(null);
  const [AllHDTBIPA, setAllHDTBIPA] = useState(null);
  const [AllHDTBHD, setAllHDTBHD] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // ── Điểm (bước 2b): đúng/sai TÁCH RIÊNG, không dùng chung 1 "Score" ───────
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const handleMarkCorrect = () => setCorrectCount((n) => n + 1);
  const handleMarkWrong = () => setWrongCount((n) => n + 1);

  // Theo yêu cầu "mỗi câu nói check similarity thì có % đúng, lập thành biểu
  // đồ dạng cột": lưu lại độ giống (0..1) của TỪNG lần gửi câu trả lời (dù
  // đúng hay sai), để xếp vào các khoảng 0.5-0.6/0.6-0.7/... vẽ biểu đồ cột.
  // Không reset khi đổi câu/đóng mở — cộng dồn cho cả phiên luyện tập, giống
  // cách correctCount/wrongCount đang cộng dồn ở trên.
  const [simHistory, setSimHistory] = useState([]);
  const recordSim = (score) => {
    if (typeof score !== "number" || Number.isNaN(score)) return;
    setSimHistory((prev) => [...prev, score]);
  };


  // ── Bước 2d: bảng thông tin tham khảo, ẩn sau nút "Tham khảo" ────────────
  // Đầy đủ TẤT CẢ các bảng (mọi bài học), giống hệt logic ở Roomoffline.js/
  // B101_FINAL_PROJECTS.js: OnTable = null → xem mục lục "Tất cả"; OnTable = i
  // → xem bảng HD riêng của bài học thứ i.
  //
  // Luôn lưu lại đang xem đoạn/bài nào trong bảng tham khảo (yêu cầu mới) —
  // TÁI HIỆN đúng cơ chế lưu/khôi phục OnTable bằng localStorage của
  // B101_FINAL_PROJECTS.js bản cũ (helper_fn_localStorage — TÁI SỬ DỤNG
  // nguyên, không sửa file này, vì đây là tiện ích dùng chung, không phải hàm
  // nội bộ riêng của 1 component). Dùng key riêng "v2ref_<roomCode>" (khác
  // key "roomCode" mà bản cũ dùng) để KHÔNG chia sẻ/ảnh hưởng vị trí đã lưu
  // của Roomoffline.js — tránh mở trang cũ làm lệch vị trí đã lưu ở V2 (và
  // ngược lại). Ngoài ra lưu cả trường hợp "Tất cả" (sentinel -1) — bản cũ
  // không lưu được trường hợp này do saveNumberToLocalStorage yêu cầu number.
  //
  // LƯU Ý (sửa lỗi): nút "Tham khảo" trước đây tự gọi setOnTable(null) mỗi
  // lần mở modal, nên dù OnTable đã được khôi phục đúng từ localStorage, cứ
  // mở lại modal là bị ghi đè về "Tất cả". Đã bỏ dòng reset đó — giờ mở modal
  // chỉ setShowReference(true), giữ nguyên OnTable đang có (đúng ý: đóng rồi
  // mở lại vẫn ở đúng bài đang xem, ví dụ bài số 5).
  const ON_TABLE_STORAGE_KEY = `v2ref_${roomCode}`;
  const [showReference, setShowReference] = useState(false);
  // Theo yêu cầu "chuyển động mở tắt mượt hơn": giữ modal trong DOM sau lần
  // mở đầu tiên (thay vì mount/unmount ngay theo showReference) để CSS
  // transition (opacity/transform) chạy được cả lúc đóng, không chỉ lúc mở.
  const [hasOpenedReference, setHasOpenedReference] = useState(false);
  useEffect(() => {
    if (showReference) setHasOpenedReference(true);
  }, [showReference]);
  const [OnTable, setOnTable] = useState(() => {
    const saved = helper_fn_localStorage.getNumberFromLocalStorage(
      ON_TABLE_STORAGE_KEY,
    );
    return typeof saved === "number" && !isNaN(saved) && saved >= 0
      ? saved
      : null;
  });

  useEffect(() => {
    helper_fn_localStorage.saveNumberToLocalStorage(
      ON_TABLE_STORAGE_KEY,
      OnTable === null ? -1 : OnTable,
    );
  }, [OnTable]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // ── Bước 2c: "câu hiện tại" + Nói/Text (điều khiển từ đây) ───────────────
  const [currentQIndex, setCurrentQIndex] = useState(null); // null = chưa bắt đầu
  const [mode, setMode] = useState("noi"); // "noi" | "text" — dùng chung cho InputPanel
  const [lastCheck, setLastCheck] = useState(null);

  // ── Việc lớn: chấm điểm bằng submit/data/aw (giống hệt bản cũ) ───────────
  const [pushAW, setPushAW] = useState([]); // các "tag" đã thu thập được cho câu hiện tại
  const justOneRef = useRef(false); // chặn xử lý lặp khi đã hoàn tất 1 câu (giống stt_justone_plus)

  // Bước "kiểm tra toàn diện": bảo vệ fetchTitle (bên dưới) khỏi setState
  // sau khi component đã unmount — fetchTitle là async, nếu người dùng rời
  // trang (unmount RoomofflineV2) ngay trong lúc fetch còn đang chạy thì các
  // setState sau khi promise resolve/reject vẫn cứ chạy trên component đã
  // unmount (React cảnh báo "memory leak" + tham chiếu closure cũ vô nghĩa).
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Bước "kiểm tra toàn diện": đồng bộ hành vi "tắt mic khi đang đọc" giống
  // Roomoffline.js bản cũ. ReadMessage_2024.js (TÁI SỬ DỤNG nguyên, không sửa)
  // tự bấm 2 nút ẩn #readingTrue/#readingFalse khi bắt đầu/kết thúc đọc — bản
  // cũ dùng đúng cơ chế này để cập nhật IsReading, nên V2 chỉ cần có 2 nút ẩn
  // cùng id để nhận được sự kiện, không cần sửa gì ReadMessage_2024.js.
  const [isReading, setIsReading] = useState(false);

  const currentItem =
    currentQIndex !== null && DataPracticingCharactor
      ? DataPracticingCharactor[currentQIndex]
      : null;

  // Câu hiện tại có đủ submit + data để dùng cơ chế chấm điểm "giống hệt bản
  // cũ" không — nếu thiếu (dữ liệu bài học cũ chưa có field này) thì dùng
  // phương án dự phòng so toàn câu (compareTwoStrings) để không bị vô dụng.
  const hasCmdData =
    !!currentItem &&
    Array.isArray(currentItem.submit) &&
    Array.isArray(currentItem.data) &&
    currentItem.data.length > 0;

  // ── Bước "rút gọn ô gợi ý": thay vì hiện sẵn 1 khối gợi ý chiếm chỗ trong
  // div chính, giờ chỉ hiện 1 nút nhỏ gọn (chip) "💡 Gợi ý" — bấm vào mới mở
  // popup xem nội dung, để tiết kiệm không gian khối trung tâm. Popup dùng
  // đúng kiểu "mount 1 lần rồi toggle class open" như modal Tham khảo để
  // chuyển động đóng/mở mượt.
  const [showHintModal, setShowHintModal] = useState(false);
  const [hasOpenedHintModal, setHasOpenedHintModal] = useState(false);
  useEffect(() => {
    if (showHintModal) setHasOpenedHintModal(true);
  }, [showHintModal]);
  const hintRaw = currentItem?.hint || null;
  const hintIsImage = !!hintRaw && isImageUrl(hintRaw);
  const hintText =
    hintRaw && !hintIsImage
      ? hintRaw.includes("zzzz")
        ? hintRaw.split("zzzz")[0]
        : hintRaw
      : null;
  const hasHintContent = !!(hintText || hintIsImage);

  // Bước "kiểm tra toàn diện": khi câu hiện tại KHÔNG có hint (giống điều
  // kiện `playData?.hint ? ... : playData?.img ? ...` ở B101_FINAL_PROJECTS.js
  // bản cũ), hiển thị ảnh minh họa currentItem.img thay thế — TÁI HIỆN đúng
  // hành vi cũ (ảnh "fp-thumb-img"), không bỏ trống như trước.
  const thumbImg = !hasHintContent ? currentItem?.img || null : null;

  // Chọn 1 chỉ số ngẫu nhiên khác chỉ số hiện tại (nếu có nhiều hơn 1 câu)
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
      console.warn("Không đọc được câu hỏi (RoomofflineV2):", error);
    }
  };

  // "Câu mới" (hoặc "Bắt đầu" nếu chưa có câu nào) — logic lấy câu tương tự
  // bản cũ (chọn 1 phần tử từ DataPracticingCharactor rồi đọc to lên).
  const handleNextSentence = () => {
    const nextIndex = pickNextIndex();
    if (nextIndex === null) return;
    const item = DataPracticingCharactor[nextIndex];
    setCurrentQIndex(nextIndex);
    setLastCheck(null);
    setShowHintModal(false);
    setPushAW([]); // câu mới → thu thập lại từ đầu, giống PushAW=[] bản cũ
    justOneRef.current = false;
    readItemAloud(item);
  };

  // "Nghe lại" — đọc lại đúng câu hiện tại, tái sử dụng ReadMessage như trên.
  const handleListenAgain = () => {
    readItemAloud(currentItem);
  };

  // Theo phản hồi: khi 1 câu đã hoàn tất (đúng đủ / sai quá / bị đánh dấu
  // sai), KHÔNG tự động chuyển sang câu mới nữa — khôi phục lại về trạng thái
  // "chưa chọn câu" để người dùng phải tự bấm "Bắt đầu"/"Câu mới" mới có câu
  // tiếp theo (khác với handleNextSentence: hàm đó CHỌN LUÔN 1 câu mới).
  const resetToUnselected = () => {
    setCurrentQIndex(null);
    setLastCheck(null);
    setShowHintModal(false);
    setPushAW([]);
    justOneRef.current = false;
  };

  // ── Câu trả lời vừa gửi từ RoomofflineV2InputPanel (Nói hoặc Text) ────────
  // Việc lớn: nếu currentItem có đủ submit/data thì so khớp bằng findBest với
  // từng "qs" (ĐÚNG Y HỆT bản cũ) rồi đẩy action[0] vào PushAW; nếu thiếu thì
  // dùng phương án dự phòng so toàn câu bằng compareTwoStrings.
  const handleAnswerSubmit = (answerText) => {
    if (!currentItem) return;

    if (hasCmdData) {
      const matched = findBest(answerText, currentItem.data, 0.5);
      const gender = currentItem.gender === "female" ? 1 : 0;

      if (!matched || !matched.qs) {
        // Không khớp câu nào — giống bản cũ: đọc "Sorry, what did you say?",
        // không đẩy gì vào PushAW, không tính điểm, để người dùng thử lại.
        // Vẫn ghi lại độ giống cao nhất tìm được (dù dưới ngưỡng) vào biểu đồ.
        recordSim(bestSimilarityScore(answerText, currentItem.data));
        setLastCheck({ answerText, kind: "noMatch" });
        try {
          ReadMessage(
            ObjREAD,
            "Sorry, what did you say?",
            gender,
            gender === 1 ? [{ id: "sorryFemale" }] : [{ id: "sorryMale" }],
          );
        } catch (error) {
          console.warn("Không đọc được câu nhắc lại (RoomofflineV2):", error);
        }
        return;
      }

      // Khớp được 1 mục — đọc lại 1 "aw" xác nhận ngẫu nhiên, giống bản cũ.
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
          console.warn("Không đọc được câu xác nhận (RoomofflineV2):", error);
        }
      }

      // Ghi lại độ giống của lần khớp này vào biểu đồ (findBest đã tự tính
      // sẵn maxSim và gắn vào matched._sim khi tìm được 1 mục khớp).
      recordSim(
        typeof matched._sim === "number"
          ? matched._sim
          : bestSimilarityScore(answerText, currentItem.data),
      );

      const actionTag = matched.action?.[0];
      if (actionTag === "WRONG") {
        // Giống nút "Bỏ qua" bản cũ: tính sai rồi kết thúc câu này — theo yêu
        // cầu mới, KHÔNG tự chuyển sang câu khác, chỉ khôi phục về "chưa chọn
        // câu" để người dùng tự bấm chọn câu tiếp theo.
        handleMarkWrong();
        setLastCheck({ answerText, kind: "wrongSkip", youMean: matched.qs });
        setTimeout(() => {
          resetToUnselected();
        }, 900);
      } else if (actionTag) {
        setPushAW((prev) => (prev.includes(actionTag) ? prev : [...prev, actionTag]));
        setLastCheck({ answerText, kind: "collected", youMean: matched.qs, actionTag });
      }
      return;
    }

    // ── Phương án dự phòng (dữ liệu thiếu submit/data): so toàn câu ────────
    const target = (currentItem.fsp || "").toString().toLowerCase().trim();
    const guess = (answerText || "").toLowerCase().trim();
    const score = target ? compareTwoStrings(guess, target) : 0;
    const isCorrect = score >= ANSWER_MATCH_THRESHOLD;
    recordSim(score);
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
    // Phương án dự phòng: mỗi lần gửi là 1 câu coi như đã hoàn tất (không
    // tích lũy nhiều lượt như cơ chế submit/data) — theo yêu cầu, khôi phục
    // về "chưa chọn câu" sau khi xem xong kết quả, không tự chọn câu mới.
    setTimeout(() => {
      resetToUnselected();
    }, 1200);
  };

  // Mỗi khi PushAW đổi (hoặc chuyển câu), kiểm tra xem đã đủ đúng/sai theo
  // currentItem.submit chưa — TÁI HIỆN đúng useEffect [Submit, PushAW] ở
  // B101_FINAL_PROJECTS.js bản cũ (checkArrays).
  useEffect(() => {
    if (!hasCmdData) return;
    if (justOneRef.current || pushAW.length === 0) return;
    const checkIndex = checkArrays(currentItem.submit, pushAW);
    if (checkIndex === 1) {
      // Đủ đúng hết submit (tối đa 1 tag thừa) → +1 điểm đúng, câu này đã
      // xong — khôi phục về "chưa chọn câu" (KHÔNG tự chuyển sang câu mới).
      justOneRef.current = true;
      handleMarkCorrect();
      setTimeout(() => {
        resetToUnselected();
      }, 1000);
    } else if (checkIndex === 2) {
      // Sai từ 2 tag trở lên → +1 điểm sai, câu này đã xong — khôi phục về
      // "chưa chọn câu" (KHÔNG tự chuyển sang câu mới).
      justOneRef.current = true;
      handleMarkWrong();
      setTimeout(() => {
        resetToUnselected();
      }, 1000);
    } else if (checkIndex === 3) {
      // Có 1 tag sai nhưng chưa đủ hết submit → +1 điểm sai, VẪN Ở LẠI câu
      // này để người dùng thử tiếp (giống bản cũ: chỉ trừ điểm, không chuyển).
      handleMarkWrong();
    }
    // checkIndex === 0: chưa đủ, chưa sai → chờ tiếp, không làm gì.
  }, [pushAW, hasCmdData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof setSttRoom === "function") setSttRoom(true);
  }, []);

  // Theo yêu cầu: bấm "Enter" cũng được tính như bấm nút "Bắt đầu"/"Câu mới"
  // (handleNextSentence) — trừ khi đang gõ trong 1 ô nhập liệu (textarea/
  // input, ví dụ ô Text trong RoomofflineV2InputPanel — nơi Enter đã được
  // dùng riêng để "Gửi", xem RoomofflineV2InputPanel.js), đang mở bảng tham
  // khảo, hoặc đang đọc/không có dữ liệu (khớp đúng điều kiện disabled của
  // nút "Nghe câu hỏi - Câu mới(Bắt đầu)").
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== "Enter") return;
      const tag = e.target?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT" || e.target?.isContentEditable) {
        return;
      }
      if (showReference) return;
      if (isReading) return;
      if (!DataPracticingCharactor || DataPracticingCharactor.length === 0) {
        return;
      }
      e.preventDefault();
      handleNextSentence();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNextSentence, showReference, isReading, DataPracticingCharactor]);

  // ── Lấy dữ liệu (logic giữ nguyên như Roomoffline.js) ─────────────────────
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
          console.warn('Failed to parse "a" parameter (V2):', error.message);
        }
      }
      const random = params.get("random") === "true";

      const get_data = interleaveCharacters(
        data,
        firstList,
        params.get("b"),
        params.get("up"),
        random,
        params.get("fsp"),
      );
      setDataPracticingCharactor(get_data.interleaveCharacters_DATA);
      setIndexSets(get_data.IndexSets);
      setAllHDTBIPA(get_data.all_HDTB_IPA);
      setAllHDTBHD(get_data.all_HDTB_HD);
    } catch (error) {
      console.error("Error fetching data (RoomofflineV2):", error);
      if (isMountedRef.current) setFetchError(error.message);
    }
  };

  // ── Màn hình cấu hình / lấy dữ liệu (tái sử dụng component cũ) ────────────
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
            background: "#e6ccff",
            fontWeight: 700,
            color: "#5b21b6",
          }}
        >
          RoomofflineV2 — Bước 2a (kiểm tra lấy dữ liệu)
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

  // ── Bước 2b: khung giao diện thực hành mới ────────────────────────────────
  const totalCau = DataPracticingCharactor ? DataPracticingCharactor.length : 0;

  // Theo yêu cầu "biểu đồ nói đúng bao nhiêu % luôn hiển thị": tính % đúng
  // trên tổng số câu đã trả lời (đúng + sai) — luôn hiển thị ở thanh điểm
  // phía trên, không phụ thuộc đang chọn câu nào.
  const totalAnswered = correctCount + wrongCount;
  const correctPercent =
    totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  // Theo yêu cầu "biểu đồ dạng cột 0.5-0.6/0.6-0.7/...": xếp từng độ giống đã
  // ghi trong simHistory vào các khoảng cố định, màu chuyển dần đỏ → xanh lá
  // theo độ giống tăng dần, để trực quan hoá độ giống qua từng lần trả lời.
  const SIM_BUCKETS = [
    { label: "<.5", min: 0, max: 0.5, color: "#dc2626" },
    { label: ".5-.6", min: 0.5, max: 0.6, color: "#f97316" },
    { label: ".6-.7", min: 0.6, max: 0.7, color: "#f59e0b" },
    { label: ".7-.8", min: 0.7, max: 0.8, color: "#facc15" },
    { label: ".8-.9", min: 0.8, max: 0.9, color: "#a3e635" },
    { label: ".9-1", min: 0.9, max: 1.01, color: "#16a34a" },
  ];
  const simBucketCounts = SIM_BUCKETS.map(
    (b) => simHistory.filter((s) => s >= b.min && s < b.max).length,
  );
  const simBucketMax = Math.max(1, ...simBucketCounts);

  return (
    <div className="v2-root">
      <style>{`
        .v2-root {
          height: 100vh;
          overflow: hidden;
          background: #f5f6fa;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* ── Thanh điểm trên cùng — luôn cố định, tách riêng đúng/sai ── */
        .v2-topbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 56px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 16px;
          background: #e6ccff;
          border-bottom: 1px solid #d0aaff;
          z-index: 30;
          overflow-x: auto;
        }
        .v2-chip {
          padding: 5px 12px;
          border-radius: 20px;
          font-weight: 800;
          font-size: 0.85rem;
          white-space: nowrap;
        }
        .v2-chip-correct { background: rgba(22,163,74,0.15); color: #15803d; }
        .v2-chip-wrong   { background: rgba(220,38,38,0.15); color: #b91c1c; }
        .v2-chip-info    { background: rgba(100,116,139,0.15); color: #475569; }

        /* ── "Biểu đồ" % nói đúng — vòng tròn conic-gradient, luôn hiển thị ở
           thanh điểm phía trên để người làm nhìn thấy ngay, không cần bấm gì
           thêm (khác với các chip điểm/số câu vốn là dạng chữ). ── */
        .v2-percent-ring {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.3s ease;
        }
        .v2-percent-ring::before {
          content: "";
          position: absolute;
          inset: 4px;
          border-radius: 50%;
          background: #e6ccff;
        }
        .v2-percent-ring span {
          position: relative;
          z-index: 1;
          font-size: 0.68rem;
          font-weight: 800;
          color: #1e293b;
        }

        /* ── Biểu đồ cột độ giống — theo phản hồi mới nhất: đặt nổi ở GÓC
           TRÁI màn hình (dưới thanh điểm), CHỈ hiện trên màn hình rộng
           (desktop/window) — ẨN HẲN trên điện thoại (@media bên dưới) để
           không choán chỗ màn hình nhỏ. Không chiếm dải riêng nữa nên khối
           trung tâm (.v2-center-wrap) trở lại full chiều cao ngay dưới thanh
           điểm, giữ nội dung không bị scroll. ── */
        .v2-simchart {
          position: fixed;
          top: 64px;
          left: 12px;
          z-index: 40;
          display: flex;
          align-items: flex-end;
          gap: 6px;
          padding: 6px 8px 5px;
          background: rgba(255,255,255,0.94);
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(15,23,42,0.15);
          box-sizing: border-box;
        }
        @media (max-width: 699px) {
          .v2-simchart {
            display: none;
          }
        }
        .v2-simchart-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          gap: 1px;
          min-width: 24px;
          flex-shrink: 0;
        }
        .v2-simchart-count {
          font-size: 0.55rem;
          font-weight: 800;
          color: #475569;
          min-height: 9px;
        }
        .v2-simchart-bar {
          width: 10px;
          border-radius: 3px 3px 0 0;
          transition: height 0.3s ease, background 0.3s ease;
        }
        .v2-simchart-label {
          font-size: 0.5rem;
          color: #64748b;
          white-space: nowrap;
        }

        /* ── Khối trung tâm 80% x 80%, cố định, không bị ảnh hưởng scroll ── */
        .v2-center-wrap {
          position: fixed;
          top: 56px; left: 0; right: 0; bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          box-sizing: border-box;
        }
        .v2-center-box {
          width: 80%;
          height: 80%;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 20px rgba(15,23,42,0.12);
          display: flex;
          flex-direction: column;
          padding: 20px;
          box-sizing: border-box;
          overflow-y: auto;
        }

        /* ── Hàng nút gọn phía trên (bước 2c) ──
           [ [Nghe lại - Câu mới(Bắt đầu)] ... [Nói/Text] ]  ...  [Tham khảo]
           (nút "Hiển thị" debug data đã bỏ theo yêu cầu, không còn nữa) */
        .v2-toprow {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 12px;
        }
        .v2-toprow-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .v2-icon-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1px solid #d8d3ef;
          background: #f8f7fd;
          color: #5b21b6;
          font-weight: 700;
          font-size: 0.8rem;
          padding: 7px 12px;
          border-radius: 9px;
          cursor: pointer;
        }
        .v2-icon-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .v2-icon-btn-primary {
          background: #7c3aed;
          border-color: #7c3aed;
          color: #fff;
        }

        .v2-mode-slide {
          position: relative;
          display: flex;
          width: 160px;
          background: #ece9f7;
          border-radius: 999px;
          padding: 3px;
        }
        .v2-mode-btn {
          position: relative;
          z-index: 1;
          flex: 1;
          border: none;
          background: transparent;
          padding: 6px 0;
          font-weight: 700;
          font-size: 0.76rem;
          color: #5b21b6;
          cursor: pointer;
          border-radius: 999px;
        }
        .v2-mode-btn.active { color: #fff; }
        .v2-mode-thumb {
          position: absolute;
          top: 3px;
          bottom: 3px;
          left: 3px;
          width: calc(50% - 3px);
          background: #7c3aed;
          border-radius: 999px;
          transition: transform 0.2s ease;
        }
        .v2-mode-thumb.text { transform: translateX(100%); }

        .v2-reveal-btn {
          border: 1px solid #c4b5fd;
          background: #f5f3ff;
          color: #5b21b6;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.8rem;
        }

        /* ── "Mở tắt mượt hơn": các khối xuất hiện/biến mất theo câu hiện tại
           (placeholder, feedback, hint, ảnh minh họa, tiến độ) đều fade+trượt
           nhẹ vào khi mount, thay vì hiện ra đột ngột. ── */
        @keyframes v2-fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .v2-placeholder {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #94a3b8;
          font-size: 0.9rem;
          padding: 20px;
          animation: v2-fade-in 0.25s ease;
        }

        .v2-feedback {
          text-align: center;
          font-weight: 700;
          padding: 8px;
          border-radius: 8px;
          margin-top: 8px;
          font-size: 0.85rem;
          animation: v2-fade-in 0.25s ease;
        }
        .v2-feedback.correct { background: rgba(22,163,74,0.12); color: #15803d; }
        .v2-feedback.wrong   { background: rgba(220,38,38,0.12); color: #b91c1c; }

        /* ── Tiến độ thu thập tag (submit/data/aw) ── */
        .v2-progress {
          text-align: center;
          font-size: 0.78rem;
          font-weight: 700;
          color: #7c3aed;
          margin-bottom: 6px;
          animation: v2-fade-in 0.25s ease;
        }

        /* ── Hint (bước "rút gọn ô gợi ý"): chỉ 1 chip nhỏ gọn, bấm để mở
           popup xem gợi ý — không chiếm chỗ cố định trong khối trung tâm nữa
           như kiểu ô gợi ý hiện sẵn trước đây. ── */
        .v2-hint-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          align-self: center;
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
          font-weight: 700;
          font-size: 0.8rem;
          padding: 6px 14px;
          border-radius: 999px;
          cursor: pointer;
          margin-bottom: 12px;
          animation: v2-fade-in 0.25s ease;
        }
        .v2-hint-text {
          font-size: 0.95rem;
          color: #1e293b;
          white-space: pre-line;
          padding: 16px 18px;
        }
        .v2-hint-img {
          max-width: 100%;
          max-height: 60vh;
          border-radius: 8px;
          display: block;
          margin: 16px auto;
        }

        /* ── Popup gợi ý: modal nhỏ gọn hơn modal Tham khảo (không cần to bằng
           bảng dữ liệu), cùng kiểu mount-once + class "open" để mượt. ── */
        .v2-hint-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,0.55);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
        }
        .v2-hint-modal-backdrop.open {
          opacity: 1;
          pointer-events: auto;
        }
        .v2-hint-modal-panel {
          background: #fff;
          border-radius: 16px;
          width: min(480px, 92vw);
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(0,0,0,0.25);
          opacity: 0;
          transform: scale(0.94) translateY(10px);
          transition: opacity 0.25s ease, transform 0.25s ease;
        }
        .v2-hint-modal-backdrop.open .v2-hint-modal-panel {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
        .v2-hint-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          border-bottom: 1px solid #e2e8f0;
          color: #92400e;
        }

        /* ── Ảnh minh họa thay thế khi câu hiện tại không có hint ── */
        .v2-thumb-box {
          display: flex;
          justify-content: center;
          margin-bottom: 12px;
          animation: v2-fade-in 0.25s ease;
        }
        .v2-thumb-img {
          max-width: 100%;
          max-height: 160px;
          border-radius: 10px;
          display: block;
        }

        /* ── Modal: Bảng thông tin tham khảo (bước 2d) ──
           "Mở tắt mượt hơn": giữ trong DOM sau lần mở đầu (hasOpenedReference)
           và chuyển qua lại bằng class "open" để opacity/transform có thể
           transition mượt ở CẢ 2 chiều mở và đóng, thay vì mount/unmount đột
           ngột như trước. */
        .v2-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,0.55);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
        }
        .v2-modal-backdrop.open {
          opacity: 1;
          pointer-events: auto;
        }
        .v2-modal-panel {
          background: #fff;
          border-radius: 16px;
          width: 85vw;
          height: 85vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.25);
          opacity: 0;
          transform: scale(0.94) translateY(10px);
          transition: opacity 0.25s ease, transform 0.25s ease;
        }
        .v2-modal-backdrop.open .v2-modal-panel {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
        .v2-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          border-bottom: 1px solid #e2e8f0;
          color: #5b21b6;
          flex-shrink: 0;
        }
        .v2-modal-close {
          border: none;
          background: #f1f5f9;
          color: #475569;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
        }
        .v2-ref-navbar {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 10px 18px;
          border-bottom: 1px solid #e2e8f0;
          flex-shrink: 0;
        }
        .v2-ref-navbtn {
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #475569;
          font-weight: 700;
          font-size: 0.78rem;
          padding: 5px 10px;
          border-radius: 8px;
          cursor: pointer;
        }
        .v2-ref-navbtn.active {
          background: #7c3aed;
          border-color: #7c3aed;
          color: #fff;
        }
        .v2-modal-body {
          flex: 1;
          min-height: 0;
          padding: 14px 18px;
          overflow-y: auto;
        }
      `}</style>

      {/* ── 2 nút ẩn để ReadMessage_2024.js (không sửa) tự bấm khi bắt đầu/kết
          thúc đọc — TÁI HIỆN đúng cơ chế IsReading của Roomoffline.js bản cũ ── */}
      <div style={{ display: "none" }}>
        <button id="readingFalse" onClick={() => setIsReading(false)} />
        <button id="readingTrue" onClick={() => setIsReading(true)} />
      </div>

      {/* ── Thanh điểm ── */}
      <div className="v2-topbar">
        <div
          className="v2-percent-ring"
          style={{
            background: `conic-gradient(#16a34a ${correctPercent}%, #e2e8f0 ${correctPercent}% 100%)`,
          }}
          title={`Đã trả lời ${totalAnswered} câu — đúng ${correctPercent}%`}
        >
          <span>{correctPercent}%</span>
        </div>
        <span className="v2-chip v2-chip-correct">Điểm đúng: {correctCount}</span>
        <span className="v2-chip v2-chip-wrong">Điểm sai: {wrongCount}</span>
        <span className="v2-chip v2-chip-info">
          Câu: {currentQIndex !== null ? currentQIndex + 1 : 0}/{totalCau}
        </span>
      </div>

      {/* ── Biểu đồ cột độ giống (bước "biểu đồ 0.5-0.6/0.6-0.7/..."): luôn
          hiển thị, không cần bấm gì, để người thực hành quan sát trực quan
          phân bố độ giống của từng lần trả lời qua cả buổi luyện tập. ── */}
      <div className="v2-simchart" title="Phân bố độ giống của từng lần trả lời">
        {SIM_BUCKETS.map((b, i) => {
          const count = simBucketCounts[i];
          const heightPx = count > 0 ? Math.max(3, (count / simBucketMax) * 34) : 2;
          return (
            <div className="v2-simchart-col" key={b.label}>
              <span className="v2-simchart-count">{count > 0 ? count : ""}</span>
              <div
                className="v2-simchart-bar"
                style={{ height: `${heightPx}px`, background: b.color }}
              />
              <span className="v2-simchart-label">{b.label}</span>
            </div>
          );
        })}
      </div>

      {/* ── Khối trung tâm 80% x 80% ── */}
      <div className="v2-center-wrap">
        <div className="v2-center-box">
          {/* ── Hàng nút gọn: [Nghe lại | Câu mới(Bắt đầu)]  [Nói/Text]  [Tham khảo] ── */}
          <div className="v2-toprow">
            <div className="v2-toprow-group">
              <button
                type="button"
                className="v2-icon-btn"
                disabled={!currentItem || isReading}
                onClick={handleListenAgain}
                title="Nghe lại"
              >
                <i className="bi bi-volume-up-fill"></i>{" "}
                {isReading ? "Đang đọc…" : "Nghe lại"}
              </button>
              <button
                type="button"
                className="v2-icon-btn v2-icon-btn-primary"
                disabled={
                  !DataPracticingCharactor ||
                  DataPracticingCharactor.length === 0 ||
                  isReading
                }
                onClick={handleNextSentence}
                title={currentItem ? "Câu mới" : "Bắt đầu"}
              >
                <i className={`bi ${currentItem ? "bi-shuffle" : "bi-play-fill"}`}></i>
                {currentItem ? "Câu mới" : "Bắt đầu"}
              </button>
            </div>

            <div className="v2-toprow-group">
              <div className="v2-mode-slide">
                <button
                  type="button"
                  className={`v2-mode-btn ${mode === "noi" ? "active" : ""}`}
                  onClick={() => setMode("noi")}
                >
                  🎤 Nói
                </button>
                <button
                  type="button"
                  className={`v2-mode-btn ${mode === "text" ? "active" : ""}`}
                  onClick={() => setMode("text")}
                >
                  ⌨️ Text
                </button>
                <span className={`v2-mode-thumb ${mode === "text" ? "text" : ""}`} />
              </div>
              <button
                type="button"
                className="v2-reveal-btn"
                disabled={totalLessons === 0}
                onClick={() => setShowReference(true)}
                title="Bảng thông tin tham khảo"
              >
                <i className="bi bi-table"></i> Tham khảo
              </button>
            </div>
          </div>

          {fetchError && (
            <div style={{ color: "red", marginBottom: "12px" }}>
              Lỗi khi lấy dữ liệu: {fetchError}
            </div>
          )}

          {DataPracticingCharactor === null && !fetchError && (
            <p>Đang tải dữ liệu thực hành…</p>
          )}

          {currentItem ? (
            <>
              {!hasHintContent && thumbImg && (
                <div className="v2-thumb-box">
                  <img
                    src={thumbImg}
                    className="v2-thumb-img"
                    alt="minh họa"
                    loading="lazy"
                  />
                </div>
              )}

              {hasHintContent && (
                <button
                  type="button"
                  className="v2-hint-chip"
                  onClick={() => setShowHintModal(true)}
                  title="Xem gợi ý"
                >
                  💡 Gợi ý
                </button>
              )}

              {hasCmdData && (
                <div className="v2-progress">
                  Đã thu thập: {pushAW.length}/{currentItem.submit.length}
                </div>
              )}

              <RoomofflineV2InputPanel
                mode={mode}
                onSubmit={handleAnswerSubmit}
                isReading={isReading}
                // BUG PHÁT HIỆN KHI RÀ LẠI LOGIC: "Câu mới" (handleNextSentence)
                // chuyển thẳng currentQIndex từ câu A sang câu B (không đi qua
                // resetToUnselected → không có lúc nào currentItem là null) nên
                // InputPanel KHÔNG unmount/remount — cờ reset-khi-mount trong đó
                // (dành cho trường hợp đúng/sai/bỏ qua, có unmount qua
                // resetToUnselected) không chạy lại. Nếu mic đang bật liên tục
                // và bấm "Câu mới" thay vì "Gửi", transcript câu cũ dính sang
                // câu mới. Truyền currentQIndex xuống để InputPanel biết CHÍNH
                // XÁC khi nào đổi câu (dù có unmount hay không) và tự xoá
                // transcript đúng lúc đó.
                questionIndex={currentQIndex}
              />

              {lastCheck && lastCheck.kind === "similarity" && (
                <div
                  className={`v2-feedback ${lastCheck.isCorrect ? "correct" : "wrong"}`}
                >
                  {lastCheck.isCorrect ? "✅ Đúng" : "❌ Sai"} — độ giống{" "}
                  {(lastCheck.score * 100).toFixed(0)}% (câu đúng: “
                  {lastCheck.target}”)
                </div>
              )}
              {lastCheck && lastCheck.kind === "noMatch" && (
                <div className="v2-feedback wrong">
                  ❓ Không nhận ra câu trả lời — thử nói/gõ lại xem.
                </div>
              )}
              {lastCheck && lastCheck.kind === "wrongSkip" && (
                <div className="v2-feedback wrong">
                  ❌ Sai — chuyển sang câu khác…
                </div>
              )}
              {lastCheck && lastCheck.kind === "collected" && (
                <div className="v2-feedback correct">
                  ✅ Ghi nhận đúng 1 phần — tiếp tục trả lời cho đủ câu hỏi.
                </div>
              )}
            </>
          ) : (
            !fetchError &&
            DataPracticingCharactor !== null && (
              <div className="v2-placeholder">
                Bấm “Bắt đầu” ở trên (hoặc nhấn Enter) để lấy một câu để luyện tập.
              </div>
            )
          )}
        </div>
      </div>

      {/* ── Popup: Gợi ý (bước "rút gọn ô gợi ý") — bấm chip "💡 Gợi ý" mới mở,
          dùng đúng kiểu mount-once + class "open" như modal Tham khảo để đóng/
          mở mượt, thay vì chiếm sẵn chỗ trong khối trung tâm như trước. ── */}
      {hasOpenedHintModal && hasHintContent && (
        <div
          className={`v2-hint-modal-backdrop ${showHintModal ? "open" : ""}`}
          onClick={() => setShowHintModal(false)}
        >
          <div className="v2-hint-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="v2-hint-modal-header">
              <b>💡 Gợi ý</b>
              <button
                type="button"
                className="v2-modal-close"
                onClick={() => setShowHintModal(false)}
                title="Đóng"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            {hintIsImage ? (
              <img src={hintRaw} className="v2-hint-img" alt="hint" loading="lazy" />
            ) : (
              <div className="v2-hint-text">{hintText}</div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: Bảng thông tin tham khảo (bước 2d) — đầy đủ TẤT CẢ các bảng ── */}
      {hasOpenedReference && totalLessons > 0 && (
        <div
          className={`v2-modal-backdrop ${showReference ? "open" : ""}`}
          onClick={() => setShowReference(false)}
        >
          <div
            className="v2-modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="v2-modal-header">
              <b>
                <i className="bi bi-table me-2"></i>
                Bảng thông tin tham khảo
              </b>
              <button
                type="button"
                className="v2-modal-close"
                onClick={() => setShowReference(false)}
                title="Đóng"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Thanh điều hướng: Tất cả + số thứ tự từng bài (giống Roomoffline.js) */}
            <div className="v2-ref-navbar">
              <button
                type="button"
                className={`v2-ref-navbtn ${OnTable === null ? "active" : ""}`}
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
                    className={`v2-ref-navbtn ${OnTable === i ? "active" : ""}`}
                    onClick={() => setOnTable(i)}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="v2-modal-body">
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
                    OnTable !== null
                      ? DataPracticingOverRoll[OnTable].HDTB.TB
                      : []
                  }
                  HINT={null}
                  PushAW={[]}
                  fnOnclick={(value) => {
                    // Ở chế độ "Tất cả": bấm vào 1 ô sẽ nhảy tới bảng của bài
                    // học tương ứng (đọc số thứ tự trong nhãn "... (n)").
                    // Ở chế độ xem 1 bài: chỉ để tham khảo, không submit đáp án.
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

export default RoomofflineV2;
