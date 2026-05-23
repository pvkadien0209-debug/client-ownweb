import { useEffect, useState, useContext } from "react";
import "./B101_FINAL_PROJECTS.css";
import ReadMessage from "../../ulti/ReadMessage_2024";
import Dictaphone from "../../ulti/RegcognitionV2024-05-NG";
import TableTB from "./B101_FINAL_TABLE-TB";
import TableHD from "./B101_FINAL_TABLE-HD";
import TablePushAW from "./B101_FINAL_TABLE-PUSHAW";
import StartButton from "./B101_FINAL_StartButton";
import RegButton from "./B101_FINAL_BUTTON_REG";
import TableDisplay from "./B101_FINAL_TableDisplay";
import { ObjREADContext } from "../../App";
import isImageUrl from "../../ulti/isImageUrl";
import useImagePreloader from "../useImagePreloader";
import helper_fn_localStorage from "../../ulti/helper_fn_localStorage";
const colors = ["red", "orange", "black", "green", "blue", "indigo", "violet"];
let stt_justone_plus = false;
function FINAL_PROJECT({
  DataPracticingOverRoll,
  DataPracticingCharactor,
  Score,
  setScore,
  numberBegin,
  indexSets,
  TimeDefault,
  regRate,
  regRate_01,
  handleIncrementReadyClick,
  IsPause,
  NumberOneByOneHost,
  tableView,
  setMessage,
  roomCode,
}) {
  const [StartSTT, setStartSTT] = useState(true);
  const [INDEXtoPlay, setINDEXtoPlay] = useState(-1);
  const [imageUrls, setImageUrls] = useState([]);
  const [IsMobile, setIsMobile] = useState(false);
  const [AlldataToPractice] = useState(DataPracticingCharactor);
  const [playData, setPlayData] = useState(null);
  const [HINT, setHINT] = useState(null);
  const [Submit, setSubmit] = useState(null);
  const [CMD, setCMD] = useState(null);
  const [GENDER, setGENDER] = useState(null);
  const [PushAW, setPushAW] = useState([]);
  const [Lang, setLang] = useState("en-GB");
  const [Clue, setClue] = useState(null);
  const [OnTable, setOnTable] = useState(
    helper_fn_localStorage.getNumberFromLocalStorage(roomCode) >= 0
      ? helper_fn_localStorage.getNumberFromLocalStorage(roomCode)
      : null,
  );
  const [getSTTDictaphone, setGetSTTDictaphone] = useState(false);
  const [bottomOpen, setBottomOpen] = useState(false);
  const ObjREAD = useContext(ObjREADContext);
  const [styleMain, setStyles] = useState({
    opacity: 0,
    transition: "opacity 1s ease",
  });
  const addElementIfNotExist = (element) => {
    setPushAW((prevArray) => {
      if (!prevArray.includes(element)) return [...prevArray, element];
      return prevArray;
    });
  };
  useEffect(() => {
    setTimeout(() => setStyles((p) => ({ ...p, opacity: 1 })), 200);
  }, []);
  useEffect(() => {
    helper_fn_localStorage.saveNumberToLocalStorage(roomCode, OnTable);
  }, [OnTable]);
  const checkScreenSize = () => {
    const mobile = window.innerWidth <= 768;
    setIsMobile(mobile);
    if (!mobile) setBottomOpen(true);
  };
  useEffect(() => {
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);
  useEffect(() => {
    if (IsPause) {
      setStyles((p) => ({ ...p, opacity: 0 }));
      setTimeout(() => setStartSTT(true), 1000);
    }
  }, [IsPause]);
  useEffect(() => {
    if (!IsPause) {
      if (numberBegin !== 0) {
        setStartSTT(false);
        setINDEXtoPlay(indexSets);
      }
    } else {
      setStyles((p) => ({ ...p, opacity: 0 }));
      setTimeout(() => setStartSTT(true), 1000);
    }
  }, [numberBegin]);
  useEffect(() => {
    if (!IsMobile) {
      let urls = [];
      DataPracticingOverRoll.forEach((e) => {
        e.HDTB.TB.forEach((url) => {
          urls = urls.concat(url);
        });
      });
      setImageUrls(urls);
    }
  }, [DataPracticingOverRoll, IsMobile]);
  useImagePreloader(imageUrls);
  useEffect(() => {
    if (StartSTT) {
      setPlayData(null);
      setGetSTTDictaphone(false);
      if (INDEXtoPlay !== -1) handleIncrementReadyClick();
    } else {
      if (INDEXtoPlay >= 0) {
        try {
          setPlayData(
            AlldataToPractice[INDEXtoPlay % AlldataToPractice.length],
          );
        } catch {}
      }
    }
  }, [StartSTT, INDEXtoPlay, AlldataToPractice]);
  useEffect(() => {
    if (playData === null) {
      setHINT(null);
      setSubmit(null);
      setCMD(null);
      setGENDER(null);
      setPushAW([]);
      setClue(null);
      setLang("en-GB");
      stt_justone_plus = false;
    } else {
      setHINT(playData.hint);
      setSubmit(playData.submit);
      setClue(playData.clue);
      setCMD(playData.data);
      setGENDER(playData.gender === "female" ? 1 : 0);
      setLang(playData.lang === "VN" ? "vi-VN" : "en-US");
      if ((!IsMobile && NumberOneByOneHost === 0) || playData.fspSets) {
        ReadMessage(
          ObjREAD,
          playData.fsp,
          playData.gender === "female" ? 1 : 0,
          playData.fspSets,
        );
      }
    }
  }, [playData, ObjREAD]);
  useEffect(() => {
    if (stt_justone_plus) return;
    if (Submit !== null && PushAW.length > 0) {
      const checkIndex = checkArrays(Submit, PushAW);
      if (checkIndex === 1) {
        stt_justone_plus = true;
        setStyles((p) => ({ ...p, opacity: 0 }));
        setTimeout(() => {
          setStartSTT(true);
          setScore((D) => D + 1);
        }, 1000);
      } else if (checkIndex === 2) {
        setStyles((p) => ({ ...p, opacity: 0 }));
        setTimeout(() => {
          setStartSTT(true);
          setScore((D) => D - 1);
        }, 1000);
      } else if (checkIndex === 3) {
        setScore((D) => D - 1);
      }
    }
  }, [Submit, PushAW]);
  useEffect(() => {
    if (getSTTDictaphone) {
      disableButtonFsp();
    } else {
      enableButtonFsp();
      setBottomOpen(true);
    }
  }, [getSTTDictaphone]);
  // ─── Mode 1 ───────────────────────────────────────────────────────
  if (NumberOneByOneHost === 1) {
    try {
      return (
        <div style={{ padding: "12px" }}>
          {Clue && isImageUrl(Clue) ? (
            <img
              style={{ border: "4px solid blue", borderRadius: "10px" }}
              width={IsMobile ? "80px" : "150px"}
              src={Clue}
              loading="lazy"
            />
          ) : (
            <img
              width={IsMobile ? "80px" : "120px"}
              style={{ borderRadius: "5px" }}
              src={playData.img}
              loading="lazy"
            />
          )}
          <hr />
          {Clue && !isImageUrl(Clue) && (
            <>
              <hr />
              <b>Clue:</b>
              <h5 style={{ color: "blue" }}>{Clue}</h5>
            </>
          )}
          <hr />
          <b>{playData.fsp}</b>
          <br />
          {playData.data.map((e, i) => (
            <div key={i}>
              <b>{e.aw}</b>
            </div>
          ))}
          <br />
          <button
            className="btn btn-outline-primary fp-btn-lg"
            onClick={() => {
              setStyles((p) => ({ ...p, opacity: 0 }));
              setTimeout(() => {
                setStartSTT(true);
                setScore((D) => D + 1);
              }, 1000);
            }}
          >
            Done
          </button>
        </div>
      );
    } catch {}
  }
  // ─── Mode 2 ───────────────────────────────────────────────────────
  if (NumberOneByOneHost === 2) {
    try {
      return (
        <div style={{ padding: "12px" }}>
          {playData !== null && (
            <div>
              <button
                className="btn btn-outline-primary fp-btn-lg"
                onClick={() => {
                  setStyles((p) => ({ ...p, opacity: 0 }));
                  setTimeout(() => {
                    setStartSTT(true);
                    setScore((D) => D - 1);
                  }, 1000);
                }}
              >
                NEXT
              </button>
              <div
                className={`transition-container ${getSTTDictaphone ? "show-dictaphone" : "show-regbutton"}`}
              >
                {getSTTDictaphone ? (
                  <Dictaphone
                    getSTTDictaphone={setGetSTTDictaphone}
                    setGetSTTDictaphone={setGetSTTDictaphone}
                    CMDlist={CMD}
                    GENDER={GENDER}
                    setScore={setScore}
                    addElementIfNotExist={addElementIfNotExist}
                    ObjVoices={ObjREAD}
                    Lang={Lang}
                    regRate={regRate}
                    regRate_01={regRate_01}
                    setStartSTT={setStartSTT}
                    setMessage={setMessage}
                  />
                ) : (
                  <RegButton setGetSTTDictaphone={setGetSTTDictaphone} />
                )}
              </div>
            </div>
          )}
        </div>
      );
    } catch {}
  }
  // ─── Main mode ────────────────────────────────────────────────────
  try {
    return (
      <div
        style={{
          ...styleMain,
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          overflow: "hidden",
        }}
      >
        {StartSTT ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <StartButton
              setINDEXtoPlay={setINDEXtoPlay}
              INDEXtoPlay={INDEXtoPlay}
              setStartSTT={setStartSTT}
              Score={Score}
            />
          </div>
        ) : (
          <>
            {/* ── TOP: Table area ── */}
            <div className="fp-table-area">
              <div className="fp-nav-bar">
                <button
                  className={`fp-nav-btn fp-nav-all ${OnTable === null ? "active" : ""}`}
                  onClick={() => setOnTable(null)}
                >
                  All
                </button>
                {DataPracticingOverRoll.map((e, i) => {
                  let start = Math.max(0, (OnTable ?? 0) - 4);
                  let end = Math.min(
                    DataPracticingOverRoll.length,
                    (OnTable ?? 0) + 5,
                  );
                  if (end - start < 9) {
                    if (start === 0)
                      end = Math.min(9, DataPracticingOverRoll.length);
                    else if (end === DataPracticingOverRoll.length)
                      start = Math.max(0, DataPracticingOverRoll.length - 9);
                  }
                  if (i < start || i >= end) return null;
                  return (
                    <button
                      key={i}
                      className={`fp-nav-btn ${OnTable === i ? "active" : ""}`}
                      onClick={() => setOnTable(i)}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              {PushAW.length > 0 && (
                <div className="fp-pushaw-strip">
                  <span className="fp-pushaw-label">✓ Đã chọn:</span>
                  {PushAW.map((item, i) =>
                    isImageUrl(item) ? (
                      <img
                        key={i}
                        src={item}
                        className="fp-pushaw-chip-img"
                        alt={`aw-${i}`}
                      />
                    ) : (
                      <span key={i} className="fp-pushaw-chip">
                        {item.length > 12 ? item.slice(0, 10) + "…" : item}
                      </span>
                    ),
                  )}
                </div>
              )}
              <div className="fp-table-scroll">
                {tableView === "Normal" &&
                  (OnTable !== null ? (
                    <TableHD
                      data={DataPracticingOverRoll[OnTable]["HDTB"]["HD"]}
                      data_TB={DataPracticingOverRoll[OnTable]["HDTB"]["TB"]}
                      HINT={HINT}
                      PushAW={PushAW}
                      fnOnclick={(e, cmd) => {
                        try {
                          if (cmd === "submit") addElementIfNotExist(e);
                        } catch {}
                      }}
                    />
                  ) : (
                    <TableHD
                      data={fn_f_allTable_t_tableOfContent(
                        DataPracticingOverRoll,
                      )}
                      data_TB={[]}
                      HINT={null}
                      PushAW={[]}
                      fnOnclick={(e) => {
                        const m = e.match(/\((\d+)\)/);
                        if (m) setOnTable(parseInt(m[1], 10) - 1);
                      }}
                    />
                  ))}
                {tableView.toLowerCase() === "tv" &&
                  (OnTable !== null ? (
                    <TableHD
                      data={DataPracticingOverRoll[OnTable]["HDTB"]["TV"]}
                      data_TB={DataPracticingOverRoll[OnTable]["HDTB"]["TB"]}
                      HINT={HINT}
                      PushAW={PushAW}
                      fnOnclick={(e, cmd) => {
                        try {
                          if (cmd === "submit") addElementIfNotExist(e);
                        } catch {}
                      }}
                    />
                  ) : (
                    <TableHD
                      data={fn_f_allTable_t_tableOfContent(
                        DataPracticingOverRoll,
                      )}
                      data_TB={[]}
                      HINT={null}
                      PushAW={[]}
                      fnOnclick={(e) => {
                        const m = e.match(/\((\d+)\)/);
                        if (m) setOnTable(parseInt(m[1], 10) - 1);
                      }}
                    />
                  ))}
                <div style={{ height: "16px" }} />
              </div>
            </div>

            {/* ── BOTTOM: Speech panel ── */}
            {/*
              Layout (top → bottom):
                [1] fp-panel-body   — speech in/out (Dictaphone) hoặc clue/hint  ← TOP
                [2] fp-panel-header — bar "Thu gọn" cố định                      ← BOTTOM
            */}
            <div
              className={`fp-bottom-panel ${getSTTDictaphone ? "speaking" : bottomOpen ? "open" : "closed"}`}
            >
              {/* ── [1] Body: speech content (rendered when open/speaking) ── */}
              {(bottomOpen || getSTTDictaphone) && (
                <div className="fp-panel-body">
                  {/* c/ Speech in/out — LUÔN Ở TRÊN CÙNG */}
                  {playData !== null && (
                    <div className="fp-speech-area">
                      {getSTTDictaphone ? (
                        <Dictaphone
                          getSTTDictaphone={setGetSTTDictaphone}
                          setGetSTTDictaphone={setGetSTTDictaphone}
                          CMDlist={CMD}
                          GENDER={GENDER}
                          setScore={setScore}
                          addElementIfNotExist={addElementIfNotExist}
                          ObjVoices={ObjREAD}
                          Lang={Lang}
                          regRate={regRate}
                          regRate_01={regRate_01}
                          setMessage={setMessage}
                        />
                      ) : (
                        /* b/ Avatar "Bắt đầu nói" — nằm trên bar */
                        <div className="fp-reg-prompt">
                          <RegButton
                            setGetSTTDictaphone={(v) =>
                              setGetSTTDictaphone(v)
                            }
                          />
                          <span className="fp-reg-hint">
                            Nhấn để bắt đầu nói
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Clue box */}
                  {Clue && !isImageUrl(Clue) && (
                    <div className="fp-clue-box">
                      <span>📌</span>
                      <b>Gợi ý: </b>
                      <span style={{ color: "#1a56db" }}>{Clue}</span>
                    </div>
                  )}

                  {/* Hint image / text / thumb */}
                  {playData?.hint ? (
                    isImageUrl(playData.hint) ? (
                      <img
                        className="fp-hint-img"
                        src={playData.hint}
                        loading="lazy"
                        alt="hint"
                      />
                    ) : (
                      <div className="fp-hint-text">
                        <div className="fp-hint-title">💡 Gợi ý</div>
                        {playData.hint.includes("zzzz") ? (
                          <div style={{ whiteSpace: "pre-line" }}>
                            {
                              playData.hint.split("zzzz")[
                                numberBegin %
                                  playData.hint.split("zzzz").length
                              ]
                            }
                          </div>
                        ) : (
                          <div>{playData.hint}</div>
                        )}
                      </div>
                    )
                  ) : playData?.img ? (
                    <img
                      className="fp-thumb-img"
                      src={playData.img}
                      loading="lazy"
                      alt="thumb"
                    />
                  ) : null}
                </div>
              )}

              {/* ── [2] Header bar — CỐ ĐỊNH Ở DƯỚI CÙNG ── */}
              <div className="fp-panel-header">
                {/* a/ Bar "Thu gọn" */}
                <button
                  className="fp-toggle-btn"
                  onClick={() => {
                    if (getSTTDictaphone) {
                      window.dispatchEvent(new CustomEvent("dtph-soft-exit"));
                      setTimeout(() => setBottomOpen(false), 320);
                    } else {
                      setBottomOpen((b) => !b);
                    }
                  }}
                >
                  <span className="fp-toggle-arrow">
                    {bottomOpen || getSTTDictaphone ? "▼" : "▲"}
                  </span>
                  <span className="fp-toggle-label">
                    {bottomOpen || getSTTDictaphone
                      ? "Thu gọn"
                      : "🎙 Luyện nói"}
                  </span>
                </button>
                {!bottomOpen && Clue && !isImageUrl(Clue) && (
                  <span className="fp-collapsed-clue">
                    📌 {String(Clue).slice(0, 24)}
                    {Clue.length > 24 ? "…" : ""}
                  </span>
                )}
                <div className="fp-panel-actions">
                  {!getSTTDictaphone && (
                    <button
                      id="BtnFsp"
                      className="fp-icon-btn fp-speak-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        try {
                          ReadMessage(
                            ObjREAD,
                            playData.fsp,
                            GENDER,
                            playData.fspSets,
                          );
                        } catch {}
                      }}
                      title="Nghe mẫu"
                    >
                      <i className="bi bi-chat-left-dots" />
                    </button>
                  )}
                  <button
                    className="fp-icon-btn fp-mic-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGetSTTDictaphone(true);
                      setBottomOpen(true);
                    }}
                    title="Bắt đầu nói"
                  >
                    <i className="bi bi-mic-fill" />
                  </button>
                  <button
                    id="btnBoQua"
                    className="fp-icon-btn fp-skip-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      try {
                        const stopBtn =
                          document.getElementById("stopListenBTN");
                        if (stopBtn) stopBtn.click();
                        setStyles((p) => ({ ...p, opacity: 0 }));
                        setTimeout(() => {
                          setStartSTT(true);
                          setScore((D) => D - 1);
                        }, 1000);
                      } catch {}
                    }}
                    title="Bỏ qua"
                  >
                    ⏭
                  </button>
                </div>
              </div>
            </div>

            <button
              style={{ display: "none" }}
              id="setGetSTTDictaphone"
              onClick={() => setGetSTTDictaphone(false)}
            />
          </>
        )}
      </div>
    );
  } catch {
    return null;
  }
}
export default FINAL_PROJECT;
function checkArrays(array01, array02) {
  const allInArray02 = array01.every((e) => array02.includes(e));
  const extra = array02.filter((e) => !array01.includes(e));
  if (extra.length >= 2) return 2;
  if (extra.length > 0 && !allInArray02) return 3;
  if (allInArray02 && extra.length < 2) return 1;
  return 0;
}
function enableButtonFsp() {
  const b = document.getElementById("BtnFsp");
  if (b) {
    b.disabled = false;
    b.style.cursor = "pointer";
    b.style.opacity = "1";
  }
}
function disableButtonFsp() {
  const b = document.getElementById("BtnFsp");
  if (b) {
    b.disabled = true;
    b.style.cursor = "not-allowed";
    b.style.opacity = "0.2";
  }
}
function fn_f_allTable_t_tableOfContent(input) {
  let resSets = [];
  input.forEach((e, i) => {
    if (i % 4 === 0) resSets.push({});
    resSets[resSets.length - 1]["id" + (i % 4)] =
      (e.HDTB.IF.IFname || e.HDTB.IF.Ifname) + " (" + (i + 1) + ")";
  });
  return resSets;
}