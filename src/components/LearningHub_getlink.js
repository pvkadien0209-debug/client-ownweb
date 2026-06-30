import { useState, useEffect } from "react";
export default function GetLink({ id, index, lessonSetLength = 10, typeSet }) {
  // Chuyển đổi các prop thành số nếu cần
  const numIndex = parseInt(index) || 0;
  const numLessonSetLength = parseInt(lessonSetLength) || 10;
  // Khởi tạo trạng thái - mặc định không chọn types và lessons nào
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [tableType, setTableType] = useState("normal"); // normal, vietnamese, empty
  const [r2Value, setR2Value] = useState(null); // r parameter (Tỷ lệ cho đúng 2)
  const [r1Value, setR1Value] = useState(null); // r01 parameter (Tỷ lệ cho đúng 1)
  const [isRandomEnabled, setIsRandomEnabled] = useState(false); // Trạng thái cho param random
  const [Note, setNote] = useState(""); // Trạng thái cho param random
  const [timeValue, setTimeValue] = useState(null); // t parameter (Thời gian)
  const [generatedLink, setGeneratedLink] = useState("");
  // Giá trị khả dụng cho r và r01
  const rValues = [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85];
  // Giá trị khả dụng cho time (từ 30 đến 600, bội số của 10)
  const timeValues = Array.from({ length: 58 }, (_, i) => (i + 3) * 10);
  // Nhóm typeSet thành các nhóm A, B, C để hiển thị
  const groupedTypes = {};
  if (Array.isArray(typeSet)) {
    typeSet.forEach((type) => {
      if (type && typeof type === "string") {
        const prefix = type.charAt(0);
        if (!groupedTypes[prefix]) {
          groupedTypes[prefix] = [];
        }
        groupedTypes[prefix].push(type);
      }
    });
  }
  // Tạo danh sách bài học từ 0 đến numLessonSetLength-1
  const availableLessons = Array.from(
    { length: numLessonSetLength },
    (_, i) => i,
  );
  // Cập nhật link khi có thay đổi
  useEffect(() => {
    const link = generateFullLink(
      id,
      numIndex,
      selectedTypes,
      selectedLessons,
      tableType,
      r2Value,
      r1Value,
      isRandomEnabled,
      Note,
      timeValue,
    );
    setGeneratedLink(link);
  }, [
    selectedTypes,
    selectedLessons,
    tableType,
    r2Value,
    r1Value,
    isRandomEnabled,
    id,
    numIndex,
    Note,
    timeValue,
  ]);
  // Xử lý khi chọn/bỏ chọn một type
  const handleTypeToggle = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };
  // Xử lý khi chọn/bỏ chọn một bài học
  const handleLessonToggle = (lesson) => {
    if (selectedLessons.includes(lesson)) {
      setSelectedLessons(selectedLessons.filter((l) => l !== lesson));
    } else {
      setSelectedLessons([...selectedLessons, lesson].sort((a, b) => a - b));
    }
  };
  // Xử lý khi chọn/bỏ chọn tất cả các type có cùng prefix
  const handleGroupToggle = (prefix) => {
    if (!Array.isArray(typeSet)) return;
    const groupTypes = typeSet.filter((t) => t && t.startsWith(prefix));
    const allSelected = groupTypes.every((t) => selectedTypes.includes(t));
    if (allSelected) {
      // Bỏ chọn tất cả các type trong nhóm
      setSelectedTypes(selectedTypes.filter((t) => !t.startsWith(prefix)));
    } else {
      // Chọn tất cả các type trong nhóm
      const newSelected = [...selectedTypes];
      groupTypes.forEach((t) => {
        if (!newSelected.includes(t)) {
          newSelected.push(t);
        }
      });
      setSelectedTypes(newSelected);
    }
  };
  // Xử lý khi chọn tất cả hoặc bỏ chọn tất cả các bài học
  const handleAllLessonToggle = () => {
    if (selectedLessons.length === availableLessons.length) {
      setSelectedLessons([]);
    } else {
      setSelectedLessons([...availableLessons]);
    }
  };
  // Xử lý thay đổi giá trị r2 (Tỷ lệ cho đúng 2)
  const handleR2Change = (value) => {
    setR2Value(value === r2Value ? null : value);
  };
  // Xử lý thay đổi giá trị r1 (Tỷ lệ cho đúng 1)
  const handleR1Change = (value) => {
    setR1Value(value === r1Value ? null : value);
  };
  // Xử lý thay đổi giá trị thời gian
  const handleTimeChange = (value) => {
    setTimeValue(value === timeValue ? null : value);
  };
  // Xử lý khi bấm nút mặc định (không có param)
  const handleDefaultR2 = () => {
    setR2Value(null);
  };
  // Xử lý khi bấm nút mặc định (không có param)
  const handleDefaultR1 = () => {
    setR1Value(null);
  };
  // Xử lý khi bấm nút mặc định cho thời gian
  const handleDefaultTime = () => {
    setTimeValue(null);
  };
  // Xử lý khi bật/tắt chế độ trộn lẫn (random)
  const handleRandomToggle = () => {
    setIsRandomEnabled(!isRandomEnabled);
  };
  // Xử lý khi bật/tắt chế độ trộn lẫn (random)
  const handleRandomDefault = () => {
    setIsRandomEnabled(false);
  };
  const handleChange = (e) => {
    const raw = e.target.value;
    const cleaned = cleanInput(raw.trimStart());
    setNote(cleaned);
  };
  function cleanInput(str) {
    return str
      .normalize("NFD") // Tách dấu
      .replace(/[\u0300-\u036f]/g, "") // Xoá dấu
      .replace(/[^a-zA-Z0-9 ]/g, "") // Xoá ký tự đặc biệt (giữ chữ, số, khoảng trắng)
      .replace(/\s+/g, " "); // Giảm nhiều khoảng trắng về 1
  }
  // Hàm tạo link từ các tham số
  function generateFullLink(
    id,
    index,
    selectedTypes,
    selectedLessons,
    tableType,
    r2Value,
    r1Value,
    isRandomEnabled,
    Note,
    timeValue,
  ) {
    if (!id || isNaN(index)) return "";
    // Tạo base link
    let link = `roomoffline/${id}/${index}`;
    // Thêm các tham số nếu cần
    const timeString = new Date().toLocaleString([], {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // Mã hóa thời gian
    const reversedTimestamp = String(Date.now()).split("").reverse().join("");
    const encodedTime = encodeURIComponent(reversedTimestamp + timeString);

    // Tạo các tham số
    const params = ["time=" + encodedTime];

    // Tham số a (bài học)
    if (selectedLessons.length > 0) {
      params.push(`a=${optimizeLessonList(selectedLessons)}`);
    }
    // Tham số b (type)
    if (selectedTypes.length > 0) {
      params.push(`b=${optimizeTypeList(selectedTypes)}`);
    }
    // Tham số note
    if (Note !== "") {
      params.push("note=" + Note.trim().toLowerCase().split(" ").join("-"));
    }
    // Tham số tb (loại bảng)
    if (tableType === "vietnamese") {
      params.push("tb=tv");
    } else if (tableType === "empty") {
      params.push("tb=null");
    }
    // Tham số r (Tỷ lệ cho đúng 2)
    if (r2Value !== null) {
      params.push(`r=${r2Value}`);
    }
    // Tham số r01 (Tỷ lệ cho đúng 1)
    if (r1Value !== null) {
      params.push(`r01=${r1Value}`);
    }
    // Tham số t (Thời gian)
    if (timeValue !== null) {
      params.push(`t=${timeValue}`);
    }
    // Tham số random (Trộn lẫn)
    if (isRandomEnabled) {
      params.push("random=true");
    }
    // Thêm các tham số vào link
    if (params.length > 0) {
      link += "?" + params.join("&&");
    }
    const linkLocation = window.location.origin;
    return linkLocation + "/" + link;
  }
  // Hàm tối ưu hóa danh sách bài học đã chọn
  function optimizeLessonList(selectedLessons) {
    if (!selectedLessons || selectedLessons.length === 0) {
      return "";
    }
    // Sắp xếp các số theo thứ tự tăng dần
    const sortedLessons = [...selectedLessons].sort((a, b) => a - b);
    // Nếu đã chọn tất cả các bài học, trả về "all"
    if (
      sortedLessons.length === numLessonSetLength &&
      sortedLessons.every((val, idx) => val === idx)
    ) {
      return "all";
    }
    // Tìm và tạo các dải số liên tục
    const ranges = [];
    let rangeStart = sortedLessons[0];
    let prev = rangeStart;
    for (let i = 1; i <= sortedLessons.length; i++) {
      const current = sortedLessons[i];
      // Nếu không còn liên tục hoặc đã đến cuối mảng
      if (current !== prev + 1 || i === sortedLessons.length) {
        // Kết thúc dải hiện tại
        if (rangeStart === prev) {
          ranges.push(`${rangeStart}`);
        } else if (prev - rangeStart === 1) {
          ranges.push(`${rangeStart}`, `${prev}`);
        } else {
          ranges.push(`${rangeStart}-${prev}`);
        }
        // Bắt đầu dải mới nếu chưa đến cuối
        if (i < sortedLessons.length) {
          rangeStart = current;
        }
      }
      prev = current;
    }
    return ranges.join("zz");
  }
  // Hàm tối ưu hóa danh sách type đã chọn
  function optimizeTypeList(selectedTypes) {
    if (!selectedTypes || selectedTypes.length === 0) {
      return "";
    }
    // Giữ nguyên tên type (A0001a, A0001b...), chỉ join bằng "zz"
    return [...selectedTypes].sort().join("zz");
  }
  // Hàm sao chép link vào clipboard
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(generatedLink)
      .then(() => {
        const copyBtn = document.getElementById("copyid");
        if (copyBtn) {
          const time = new Date().toLocaleTimeString();
          copyBtn.textContent = "Đã copy lúc " + time;
        }
      })
      .catch((err) => console.error("Lỗi khi sao chép: ", err));
  };
  return (
    <div className="p-4 max-w-4xl mx-auto border border-gray-300 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Custom link bài thực hành!</h1>
      {/* Phần chọn bài học */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center mb-2">
          <h2 className="text-lg font-semibold">Chọn bài học (a=)</h2>
          <button
            onClick={handleAllLessonToggle}
            className="btn btn-primary ml-2"
          >
            {selectedLessons.length === availableLessons.length
              ? "Bỏ chọn tất cả"
              : "Chọn tất cả"}
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
          {availableLessons.map((lesson) => (
            <button
              key={`lesson-${lesson}`}
              onClick={() => handleLessonToggle(lesson)}
              className={`p-2 rounded border ${
                selectedLessons.includes(lesson)
                  ? "btn btn-primary"
                  : "btn btn-light"
              }`}
            >
              Bài {lesson + 1}
            </button>
          ))}
        </div>
      </div>
      {/* Phần chọn type */}
      {Object.keys(groupedTypes).length > 0 && (
        <div className="row mb-6">
          <h2 className="text-xl font-bold mb-4">Bảng chọn Type (b=)</h2>
          {Object.keys(groupedTypes).map((prefix) => (
            <div key={prefix} className="col-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <h3 className="text-lg font-semibold">Nhóm {prefix}</h3>
                <button
                  onClick={() => handleGroupToggle(prefix)}
                  className="btn btn-primary ml-2"
                >
                  {groupedTypes[prefix].every((t) => selectedTypes.includes(t))
                    ? "Bỏ chọn tất cả"
                    : "Chọn tất cả"}
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
                {groupedTypes[prefix].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeToggle(type)}
                    className={`p-2 rounded border ${
                      selectedTypes.includes(type) ? "btn btn-primary" : "btn"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Phần chọn loại bảng */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Chọn loại bảng (tb=)</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setTableType("normal")}
            className={`px-4 py-2 rounded border ${
              tableType === "normal" ? "btn btn-primary" : "btn"
            }`}
          >
            Mặc định
          </button>
          <button
            onClick={() => setTableType("vietnamese")}
            className={`px-4 py-2 rounded border ${
              tableType === "vietnamese" ? "btn btn-primary" : "btn"
            }`}
          >
            Tiếng Việt (tb=tv)
          </button>
          <button
            onClick={() => setTableType("empty")}
            className={`px-4 py-2 rounded border ${
              tableType === "empty" ? "btn btn-primary" : "btn"
            }`}
          >
            Bảng trống (tb=null)
          </button>
        </div>
      </div>
      {/* Phần chọn thời gian */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Thời gian (t=)</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDefaultTime}
            className={`px-4 py-2 rounded border ${
              timeValue === null ? "btn btn-primary" : "btn"
            }`}
          >
            Mặc định
          </button>
          {timeValues.map((value) => (
            <button
              key={`time-${value}`}
              onClick={() => handleTimeChange(value)}
              className={`px-4 py-2 rounded border ${
                timeValue === value ? "btn btn-primary" : "btn"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="mt-2">
          <p className="text-red-600 font-bold bg-yellow-100 p-2 border-l-4 border-red-600">
            LƯU Ý: Thời gian được tính bằng giây.
          </p>
        </div>
      </div>
      {/* Phần chọn tỷ lệ cho đúng (2) */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Tỷ lệ cho đúng (2) (r=)</h2>
        <div className="flex flex-wrap space-x-2">
          <button
            onClick={handleDefaultR2}
            className={`px-4 py-2 rounded border ${
              r2Value === null ? "btn btn-primary" : "btn"
            }`}
          >
            Mặc định
          </button>
          {rValues.map((value) => (
            <button
              key={`r2-${value}`}
              onClick={() => handleR2Change(value)}
              className={`px-4 py-2 rounded border ${
                r2Value === value ? "btn btn-primary" : "btn"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      {/* Phần chọn tỷ lệ cho đúng (1) */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">
          Tỷ lệ cho đúng (1) (r01=)
        </h2>
        <div className="flex flex-wrap space-x-2">
          <button
            onClick={handleDefaultR1}
            className={`px-4 py-2 rounded border ${
              r1Value === null ? "btn btn-primary" : "btn"
            }`}
          >
            Mặc định
          </button>
          {rValues.map((value) => (
            <button
              key={`r1-${value}`}
              onClick={() => handleR1Change(value)}
              className={`px-4 py-2 rounded border ${
                r1Value === value ? "btn btn-primary" : "btn"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      {/* Phần chọn trộn lẫn */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Trộn lẫn (random=)</h2>
        <div className="flex space-x-4">
          {" "}
          <button
            onClick={handleRandomDefault}
            className={`px-4 py-2 rounded border ${
              isRandomEnabled ? "btn" : "btn btn-primary"
            }`}
          >
            Mặc định
          </button>
          <button
            onClick={handleRandomToggle}
            className={`px-4 py-2 rounded border ${
              isRandomEnabled ? "btn btn-primary" : "btn"
            }`}
          >
            Trộn lẫn
          </button>
        </div>
      </div>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">GHI CHÚ BÀI TẬP</h2>
        <input
          type="text"
          placeholder="Nhập ghi chú bài tập"
          value={Note}
          className="form-control"
          onChange={handleChange}
        />
      </div>
      {/* Phần hiển thị kết quả */}
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="text-lg font-semibold mb-2">
          Link đã tạo:{" "}
          {Note ? (
            <span className="text-green-600 font-medium">(Đã có ghi chú)</span>
          ) : (
            <span className="text-red-500 font-medium" style={{ color: "red" }}>
              (Chưa có ghi chú)
            </span>
          )}
        </h3>
        <div className="flex items-center">
          <div className="flex-grow p-2 bg-white border rounded overflow-x-auto">
            {generatedLink || "roomoffline/" + id + "/" + numIndex}
          </div>
          <button
            id="copyid"
            onClick={copyToClipboard}
            className="btn btn-primary"
          >
            Copy
          </button>
        </div>
        <div className="mt-4">
          <p className="mb-1">
            <strong>Bài học đã chọn:</strong> {selectedLessons.length} /{" "}
            {numLessonSetLength}
          </p>
          <p className="mb-1">
            <strong>Type đã chọn:</strong> {selectedTypes.length}
          </p>
          <p className="mb-1">
            <strong>Loại bảng:</strong>{" "}
            {tableType === "normal"
              ? "Bình thường"
              : tableType === "vietnamese"
                ? "Tiếng Việt"
                : "Bảng trống"}
          </p>
          {timeValue !== null && (
            <p className="mb-1">
              <strong>Thời gian:</strong> {timeValue} giây
            </p>
          )}
          {r2Value !== null && (
            <p className="mb-1">
              <strong>Tỷ lệ cho đúng (2):</strong> {r2Value}
            </p>
          )}
          {r1Value !== null && (
            <p className="mb-1">
              <strong>Tỷ lệ cho đúng (1):</strong> {r1Value}
            </p>
          )}
          {isRandomEnabled && (
            <p className="mb-1">
              <strong>Trộn lẫn:</strong> Có
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
