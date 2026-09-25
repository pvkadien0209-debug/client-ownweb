// roomofflineV2DataUtils.js
//
// File MỚI, tách riêng cho RoomofflineV2 — KHÔNG import/sửa gì từ Roomoffline.js.
// Nội dung các hàm dưới đây được sao chép (giữ nguyên logic) từ các hàm nội bộ
// (không export) trong Roomoffline.js: interleaveCharacters, filer_type_o_charactor,
// generateRandomArray, getArrayElements, parseStringToNumbers.
//
// Lý do phải copy thay vì import: các hàm gốc trong Roomoffline.js không được
// export, và mục tiêu là "các file đều tạo mới dù có dùng lại logic để dễ sửa
// đổi" — nên bản V2 có bản sao riêng, sửa ở đây sẽ không ảnh hưởng gì tới
// Roomoffline.js (bản gốc).
//
// buildTableOfContent (bước 2d — bổ sung): sao chép nguyên logic từ hàm nội bộ
// fn_f_allTable_t_tableOfContent trong
// client/src/components/pracPages/B101_FINAL_PROJECTS.js — dùng để dựng bảng
// "Tất cả" (mục lục toàn bộ bài học) cho modal Tham khảo, giống hệt cách bản
// cũ hiển thị đầy đủ tất cả các bảng thay vì chỉ 1 bài.

import shuffleArray from "../../ulti/shuffleArray";

export function interleaveCharacters(
  data_all,
  index_sets_t_get_pracData,
  filerSets,
  upCode,
  random,
  fsp,
) {
  const numberGetPerOne = Math.floor(200 / index_sets_t_get_pracData.length);

  // Chọn ngẫu nhiên một trong ba giá trị: Math.floor(numberGetPerOne / 2), numberGetPerOne, hoặc 0
  const randomIndex = Math.floor(Math.random() * 3);
  const numberCut = [Math.floor(numberGetPerOne / 2), numberGetPerOne, 0][
    randomIndex
  ];
  let arrRes_gd_1 = [];
  index_sets_t_get_pracData.forEach((e) => {
    let getUpCode = "charactor";
    if (upCode && data_all[e]["charactor" + upCode]) {
      getUpCode = "charactor" + upCode;
    }
    let resTemp = getArrayElements(
      filer_type_o_charactor(data_all[e][getUpCode], filerSets, fsp),
      numberCut,
      numberGetPerOne,
    );
    arrRes_gd_1.push(resTemp);
  });

  let arrRes = [];

  for (let i = 0; i < numberGetPerOne; i++) {
    arrRes_gd_1.forEach((e) => {
      if (e[i]) {
        arrRes.push(e[i]);
      }
    });
  }

  const all_HDTB_IPA = (Array.isArray(data_all) ? data_all : []).flatMap((e) =>
    Array.isArray(e?.HDTB?.IP) ? e.HDTB.IP : [],
  );
  const all_HDTB_HD = (Array.isArray(data_all) ? data_all : []).flatMap((e) =>
    Array.isArray(e?.HDTB?.HD) ? e.HDTB.HD : [],
  );
  let getdata_indexSet = [];
  if (random === "true") {
    getdata_indexSet = generateRandomArray(arrRes.length, true);
  } else {
    getdata_indexSet = generateRandomArray(arrRes.length, false);
  }
  return {
    interleaveCharacters_DATA: arrRes,
    indexSet_DATA: getdata_indexSet,
    all_HDTB_IPA,
    all_HDTB_HD,
  };
}

export function filer_type_o_charactor(
  charactorSets,
  filerTypeSetsStringValue,
  fsp,
) {
  try {
    if (!filerTypeSetsStringValue || !Array.isArray(charactorSets)) {
      return charactorSets;
    }

    let filerTypeSetsArrayValue = filerTypeSetsStringValue.split("zz");

    let res_after_filer = [];
    let filerTypeSetsArrayValueAll = [];
    let filerTypeSetsArrayValueSpecific = [];
    let rangeFilters = [];

    filerTypeSetsArrayValue.forEach((e) => {
      if (e.includes("*")) {
        filerTypeSetsArrayValueAll.push(e.replace("*", ""));
      } else if (e.includes("-")) {
        rangeFilters.push(e);
      } else {
        filerTypeSetsArrayValueSpecific.push(e);
      }
    });

    charactorSets.forEach((e) => {
      let isTypeMatch = false;

      if (filerTypeSetsArrayValueSpecific.includes(e?.type)) {
        isTypeMatch = true;
      } else {
        for (let prefix of filerTypeSetsArrayValueAll) {
          if (e?.type && e.type.startsWith(prefix)) {
            isTypeMatch = true;
            break;
          }
        }

        if (!isTypeMatch && e?.type) {
          for (let rangeFilter of rangeFilters) {
            const matches = rangeFilter.match(/([A-Za-z]*)(\d+)-(\d+)/);
            if (matches) {
              const prefix = matches[1];
              const start = parseInt(matches[2]);
              const end = parseInt(matches[3]);

              const typeMatches = e.type.match(new RegExp(`^${prefix}(\\d+)$`));
              if (typeMatches) {
                const typeNumber = parseInt(typeMatches[1]);
                if (typeNumber >= start && typeNumber <= end) {
                  isTypeMatch = true;
                  break;
                }
              }
            }
          }
        }
      }

      const eFspStr = (e?.fsp || "").toLowerCase();
      const fspStr = (fsp || "").toLowerCase();
      const isFspMatch = fsp ? eFspStr.includes(fspStr) : true;

      if (isTypeMatch && isFspMatch) {
        res_after_filer.push(e);
      }
    });

    return res_after_filer.length > 0 ? res_after_filer : [];
  } catch (error) {
    console.error("Lỗi trong filer_type_o_charactor (V2):", error);
    return charactorSets;
  }
}

export function generateRandomArray(m, stt_random) {
  let randomArray = [];
  for (let i = 0; i < m; i++) {
    randomArray.push(i);
  }
  if (stt_random) {
    return shuffleArray(randomArray);
  }
  return randomArray;
}

export function getArrayElements(arr, m, n) {
  const startIndex = m % arr.length;
  const rotatedArr = arr.slice(startIndex).concat(arr.slice(0, startIndex));

  if (n >= arr.length) {
    return rotatedArr;
  }

  return rotatedArr.slice(0, n);
}

export function parseStringToNumbers(input) {
  try {
    const normalizedInput = input
      .replace(/zz/g, "a")
      .replace(/-/g, "b");

    const parts = normalizedInput.split(/([ab])/);
    let result = [];
    let currentNumber = null;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();

      if (!part) continue;

      if (part === "a") {
        continue;
      } else if (part === "b") {
        if (currentNumber !== null && i + 1 < parts.length) {
          const nextPart = parts[i + 1].trim();
          if (nextPart && !isNaN(nextPart)) {
            const end = parseInt(nextPart);
            for (let j = currentNumber + 1; j <= end; j++) {
              result.push(j);
            }
            i++;
          }
        }
      } else if (!isNaN(part)) {
        currentNumber = parseInt(part);
        result.push(currentNumber);
      }
    }

    return result.length > 0 ? result : null;
  } catch (error) {
    console.error("Error parsing string (V2):", error);
    return null;
  }
}

// Dựng mục lục "Tất cả" từ toàn bộ danh sách bài học (DataPracticingOverRoll) —
// mỗi hàng gộp 4 bài, nhãn "<tên bài> (<số thứ tự>)" giống hệt bản gốc.
export function buildTableOfContent(input) {
  const resSets = [];
  (Array.isArray(input) ? input : []).forEach((e, i) => {
    if (i % 4 === 0) resSets.push({});
    resSets[resSets.length - 1]["id" + (i % 4)] =
      (e?.HDTB?.IF?.IFname || e?.HDTB?.IF?.Ifname || "") + " (" + (i + 1) + ")";
  });
  return resSets;
}
