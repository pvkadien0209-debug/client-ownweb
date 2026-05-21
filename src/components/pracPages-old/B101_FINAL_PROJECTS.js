import { useEffect, useState, useContext } from "react";
import "./B101_FINAL_PROJECTS.css";
import ReadMessage from "../../ulti/ReadMessage_2024";

import Dictaphone from "../../ulti/RegcognitionV2024-05-NG";
import TableTB from "./B101_FINAL_TABLE-TB";
import TableHD from "./B101_FINAL_TABLE-HD";
import TablePushAW from "./B101_FINAL_TABLE-PUSHAW";
import StartButton from "./B101_FINAL_StartButton";
import CountdownTimer from "./B101_FINAL_CounterTime";
import RegButton from "./B101_FINAL_BUTTON_REG";
import TableDisplay from "./B101_FINAL_TableDisplay";
import { ObjREADContext } from "../../App"; // Import ObjREADContext
import isImageUrl from "../../ulti/isImageUrl";
import useImagePreloader from "../useImagePreloader";
import helper_fn_localStorage from "../../ulti/helper_fn_localStorage";
const colors = ["red", "orange", "black", "green", "blue", "indigo", "violet"];
// console.log(ObjREADContext);

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
  const [TimeCountDown, setTimeCountDown] = useState(null);
  // const [OBJAfterReg, setOBJAfterReg] = useState(null);

  const [OnTable, setOnTable] = useState(
    helper_fn_localStorage.getNumberFromLocalStorage(roomCode) >= 0
      ? helper_fn_localStorage.getNumberFromLocalStorage(roomCode)
      : null
  );

  const [getSTTDictaphone, setGetSTTDictaphone] = useState(false);

  const ObjREAD = useContext(ObjREADContext);

  // Hàm kiểm tra và thêm phần tử vào mảng nếu chưa tồn tại
  const [styleMain, setStyles] = useState({
    opacity: 0,
    transition: "opacity 1s ease",
  });

  const addElementIfNotExist = (element) => {
    setPushAW((prevArray) => {
      if (!prevArray.includes(element)) {
        return [...prevArray, element];
      }
      return prevArray;
    });
  };

  useEffect(() => {
    setTimeout(() => {
      setStyles((prevStyles) => ({
        ...prevStyles,
        opacity: 1,
      }));
    }, 200);
  }, []);

  // Check screen size on mount and when window is resized
  useEffect(() => {
    helper_fn_localStorage.saveNumberToLocalStorage(roomCode, OnTable);
  }, [OnTable]);

  // Function to check screen size
  const checkScreenSize = () => {
    // console.log(window.innerWidth);
    setIsMobile(window.innerWidth <= 768);
  };

  // Check screen size on mount and when window is resized
  useEffect(() => {
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  useEffect(() => {
    if (IsPause) {
      setStyles((prevStyles) => ({
        ...prevStyles,
        opacity: 0,
      }));
      setTimeout(() => {
        setStartSTT(true);
      }, 1000);
    }
  }, [IsPause]);

  useEffect(() => {
    if (!IsPause) {
      if (numberBegin !== 0) {
        setStartSTT(false);
        setINDEXtoPlay(indexSets);
      }
    } else {
      setStyles((prevStyles) => ({
        ...prevStyles,
        opacity: 0,
      }));
      setTimeout(() => {
        setStartSTT(true);
      }, 1000);

      // handleIncrementReadyClick();
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
      // console.log(urls);
      setImageUrls(urls);
    }
  }, [DataPracticingOverRoll, IsMobile]);

  useImagePreloader(imageUrls);

  useEffect(() => {
    if (StartSTT) {
      setPlayData(null);
      setGetSTTDictaphone(false);
      if (INDEXtoPlay !== -1) {
        handleIncrementReadyClick();
      }
    } else {
      if (INDEXtoPlay >= 0) {
        try {
          setPlayData(
            AlldataToPractice[INDEXtoPlay % AlldataToPractice.length]
          );
        } catch (error) {}
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
      setTimeCountDown(null);
      setLang("en-GB");
      stt_justone_plus = false;
    } else {
      setTimeCountDown(
        playData.time !== undefined
          ? playData.time
          : TimeDefault !== null
          ? TimeDefault
          : 120
      );
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
          playData.fspSets
        );
      }

      console.log("outside", ObjREAD, playData.gender === "female" ? 1 : 0);
    }
  }, [playData, ObjREAD]);

  useEffect(() => {
    if (stt_justone_plus) {
      return;
    }
    if (Submit !== null && PushAW.length > 0) {
      let checkIndex = checkArrays(Submit, PushAW);
      if (checkIndex === 1) {
        stt_justone_plus = true;
        setStyles((prevStyles) => ({
          ...prevStyles,
          opacity: 0,
        }));
        setTimeout(() => {
          setStartSTT(true);
          setScore((D) => D + 1);
        }, 1000);
      } else if (checkIndex === 2) {
        setStyles((prevStyles) => ({
          ...prevStyles,
          opacity: 0,
        }));
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
      try {
        document.getElementById("div_01").style.flex = "2";
        document.getElementById("div_02").style.flex = "8";
      } catch (error) {}

      disableButtonFsp();
    } else {
      try {
        document.getElementById("div_01").style.flex = "8";
        document.getElementById("div_02").style.flex = "2";
      } catch (error) {}

      enableButtonFsp();
    }
  }, [getSTTDictaphone]);

  if (NumberOneByOneHost === 1) {
    try {
      return (
        <div>
          {" "}
          {TimeCountDown !== null ? (
            <CountdownTimer
              setSTT={setStartSTT}
              STT={true}
              TIME={TimeCountDown}
              setScore={setScore}
            />
          ) : null}
          {Clue && isImageUrl(Clue) ? (
            <img
              style={{ border: "4px solid blue", borderRadius: "10px" }}
              width={IsMobile ? "50px" : "150px"}
              src={Clue}
              loading="lazy"
            />
          ) : (
            <img
              width={IsMobile ? "50px" : "120px"}
              style={{ borderRadius: "5px" }}
              src={playData.img}
              loading="lazy"
            />
          )}
          <hr />
          {Clue && !isImageUrl(Clue) ? (
            <>
              <hr /> <b>Clue:</b> <h5 style={{ color: "blue" }}>{Clue}</h5>
            </>
          ) : null}
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
            className="btn btn-outline-primary"
            onClick={() => {
              setStyles((prevStyles) => ({
                ...prevStyles,
                opacity: 0,
              }));
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
    } catch (error) {}
  }
  if (NumberOneByOneHost === 2) {
    try {
      return (
        <div>
          {TimeCountDown !== null ? (
            <CountdownTimer
              setSTT={setStartSTT}
              STT={true}
              TIME={TimeCountDown}
              setScore={setScore}
            />
          ) : null}
          <br />

          {playData !== null ? (
            <div>
              <button
                className="btn btn-outline-primary"
                onClick={() => {
                  setStyles((prevStyles) => ({
                    ...prevStyles,
                    opacity: 0,
                  }));
                  setTimeout(() => {
                    setStartSTT(true);
                    setScore((D) => D - 1);
                  }, 1000);
                }}
              >
                NEXT
              </button>
              <div
                className={`transition-container ${
                  getSTTDictaphone ? "show-dictaphone" : "show-regbutton"
                }`}
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
          ) : null}
        </div>
      );
    } catch (error) {}
  }
  try {
    return (
      <div style={styleMain}>
        {/* <hr /> */}
        {StartSTT ? (
          <div>
            <StartButton
              setINDEXtoPlay={setINDEXtoPlay}
              INDEXtoPlay={INDEXtoPlay}
              setStartSTT={setStartSTT}
              Score={Score}
            />
          </div>
        ) : (
          <div className="row">
            <div
              style={{
                display: "flex",
                height: "90vh",
                width: "90wh",
                transition: "flex 1s ease",
              }}
            >
              <div
                id="div_01"
                style={{
                  flex: "8",
                  overflow: "auto",
                  transition: "flex 1s ease",
                }}
              >
                {" "}
                {tableView === "Normal" ? (
                  <div style={{ textAlign: "center" }}>
                    <button
                      style={{
                        width: "15%",
                        padding: "10px",
                        marginTop: "20px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "background-color 0.3s, transform 0.3s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.transform = "scale(1.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.transform = "scale(1)")
                      }
                      onClick={() => {
                        setOnTable(null);
                      }}
                    >
                      All
                    </button>
                    {DataPracticingOverRoll.map((e, i) => {
                      let start = Math.max(0, OnTable - 5);
                      let end = Math.min(
                        DataPracticingOverRoll.length,
                        OnTable + 5
                      );

                      // Điều chỉnh để luôn có 10 phần tử hiển thị nếu có đủ phần tử
                      if (end - start < 10) {
                        if (start === 0) {
                          end = Math.min(10, DataPracticingOverRoll.length);
                        } else if (end === DataPracticingOverRoll.length) {
                          start = Math.max(
                            0,
                            DataPracticingOverRoll.length - 10
                          );
                        }
                      }

                      if (i >= start && i < end) {
                        return (
                          <button
                            onClick={() => {
                              setOnTable(i);
                            }}
                            key={i}
                            style={{
                              minWidth: "50px",
                              padding: "10px",
                              marginTop: "20px",
                              marginLeft: "10px",
                              backgroundColor: OnTable === i ? "green" : "blue",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              textAlign: "center",
                            }}
                          >
                            {i + 1}
                          </button>
                        );
                      } else {
                        return null;
                      }
                    })}
                    {OnTable !== null ? (
                      <div>
                        <TableHD
                          data={DataPracticingOverRoll[OnTable]["HDTB"]["HD"]}
                          data_TB={
                            DataPracticingOverRoll[OnTable]["HDTB"]["TB"]
                          }
                          HINT={HINT}
                          fnOnclick={(e, cmd) => {
                            try {
                              if (cmd && cmd === "submit") {
                                addElementIfNotExist(e);
                              }
                            } catch (error) {}
                          }}
                        />
                      </div>
                    ) : (
                      <div>
                        <TableHD
                          data={fn_f_allTable_t_tableOfContent(
                            DataPracticingOverRoll
                          )}
                          data_TB={[]}
                          HINT={null}
                          fnOnclick={(e) => {
                            const match = e.match(/\((\d+)\)/);
                            if (match) {
                              // Extract the number, convert to integer, subtract 1
                              const number = parseInt(match[1], 10) - 1;
                              setOnTable(number);
                            }
                          }}
                        />
                      </div>
                    )}
                    {/* {OnTable !== null ? (
                      <div className="row">
                        <div className="col-9">
                          {DataPracticingOverRoll[OnTable]["HDTB"]["TB"].map(
                            (e, i) => (
                              <TableTB
                                key={i}
                                data={e}
                                addElementIfNotExist={addElementIfNotExist}
                                color={colors[i % 7]}
                                PushAW={PushAW}
                              />
                            )
                          )}
                        </div>

                        <div className="col-3">
                          <TablePushAW data={PushAW} />
                        </div>
                      </div>
                    ) : null} */}

                    <div style={{ height: "300px" }}></div>
                  </div>
                ) : null}
                {tableView.toLowerCase() === "tv" ? (
                  <div style={{ textAlign: "center" }}>
                    <button
                      style={{
                        width: "15%",
                        padding: "10px",
                        marginTop: "20px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "background-color 0.3s, transform 0.3s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.transform = "scale(1.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.transform = "scale(1)")
                      }
                      onClick={() => {
                        setOnTable(null);
                      }}
                    >
                      All
                    </button>
                    {DataPracticingOverRoll.map((e, i) => {
                      let start = Math.max(0, OnTable - 5);
                      let end = Math.min(
                        DataPracticingOverRoll.length,
                        OnTable + 5
                      );

                      // Điều chỉnh để luôn có 10 phần tử hiển thị nếu có đủ phần tử
                      if (end - start < 10) {
                        if (start === 0) {
                          end = Math.min(10, DataPracticingOverRoll.length);
                        } else if (end === DataPracticingOverRoll.length) {
                          start = Math.max(
                            0,
                            DataPracticingOverRoll.length - 10
                          );
                        }
                      }

                      if (i >= start && i < end) {
                        return (
                          <button
                            onClick={() => {
                              setOnTable(i);
                            }}
                            key={i}
                            style={{
                              minWidth: "50px",
                              padding: "10px",
                              marginTop: "20px",
                              marginLeft: "10px",
                              backgroundColor: OnTable === i ? "green" : "blue",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              textAlign: "center",
                            }}
                          >
                            {i + 1}
                          </button>
                        );
                      } else {
                        return null;
                      }
                    })}
                    {OnTable !== null ? (
                      <div>
                        <TableHD
                          data={DataPracticingOverRoll[OnTable]["HDTB"]["TV"]}
                          data_TB={
                            DataPracticingOverRoll[OnTable]["HDTB"]["TB"]
                          }
                          HINT={HINT}
                          fnOnclick={(e, cmd) => {
                            try {
                              if (cmd && cmd === "submit") {
                                addElementIfNotExist(e);
                              }
                            } catch (error) {}
                          }}
                        />
                      </div>
                    ) : (
                      <div>
                        <TableHD
                          data={fn_f_allTable_t_tableOfContent(
                            DataPracticingOverRoll
                          )}
                          data_TB={[]}
                          HINT={null}
                          fnOnclick={(e) => {
                            const match = e.match(/\((\d+)\)/);
                            if (match) {
                              // Extract the number, convert to integer, subtract 1
                              const number = parseInt(match[1], 10) - 1;
                              setOnTable(number);
                            }
                          }}
                        />
                      </div>
                    )}
                    {/* {OnTable !== null ? (
                      <div className="row">
                        <div className="col-9">
                          {DataPracticingOverRoll[OnTable]["HDTB"]["TB"].map(
                            (e, i) => (
                              <TableTB
                                key={i}
                                data={e}
                                addElementIfNotExist={addElementIfNotExist}
                                color={colors[i % 7]}
                                PushAW={PushAW}
                              />
                            )
                          )}
                        </div>

                        <div className="col-3">
                          <TablePushAW data={PushAW} />
                        </div>
                      </div>
                    ) : null} */}

                    <div style={{ height: "300px" }}></div>
                  </div>
                ) : null}
              </div>
              <div
                id="div_02"
                style={{
                  flex: "2",
                  transition: "flex 1s ease",
                  backgroundColor: "#f2e6ff",
                  border: "1px solid black",
                  borderRadius: "15px",
                }}
              >
                {" "}
                {TimeCountDown !== null ? (
                  <CountdownTimer
                    setSTT={setStartSTT}
                    STT={true}
                    TIME={TimeCountDown}
                    setScore={setScore}
                  />
                ) : null}
                {Clue && !isImageUrl(Clue) ? (
                  <>
                    <hr /> <b>Clue:</b>{" "}
                    <h5 style={{ color: "blue" }}>{Clue}</h5>
                  </>
                ) : null}
                <button
                  style={{ borderRadius: "5px" }}
                  id="btnBoQua"
                  onClick={() => {
                    try {
                      const buttonStopListen =
                        document.getElementById("stopListenBTN");
                      if (buttonStopListen) {
                        buttonStopListen.click();
                      }

                      const button = document.getElementById("btnBoQua");
                      if (button) {
                        button.style.opacity = 0; // Làm mờ nút dần
                      }
                      setStyles((prevStyles) => ({
                        ...prevStyles,
                        opacity: 0,
                      }));

                      setTimeout(() => {
                        setStartSTT(true);
                        setScore((D) => D - 1);
                      }, 1000);
                    } catch (error) {}
                  }}
                >
                  Bỏ qua
                </button>
                <br />{" "}
                {playData.hint ? (
                  isImageUrl(playData.hint) ? (
                    <img
                      style={{ border: "4px solid blue", borderRadius: "10px" }}
                      width={IsMobile ? "270px" : "270px"}
                      src={playData.hint}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      style={{
                        backgroundColor: "white",
                        padding: "15px",
                        borderRadius: "15px",
                      }}
                    >
                      <h5>Gợi ý:</h5>
                      {playData.hint.includes("zzzz") ? (
                        <div style={{ whiteSpace: "pre-line" }}>
                          {
                            playData.hint.split("zzzz")[
                              numberBegin % playData.hint.split("zzzz").length
                            ]
                          }
                        </div>
                      ) : (
                        <h4>{playData.hint}</h4>
                      )}{" "}
                    </div>
                  )
                ) : (
                  <img
                    width={IsMobile ? "50px" : "120px"}
                    style={{
                      borderRadius: "5px",
                      marginLeft: "5%",
                      marginTop: "1%",
                    }}
                    src={playData.img}
                    loading="lazy"
                  />
                )}
                {!getSTTDictaphone ? (
                  <button
                    id="BtnFsp"
                    style={{
                      marginTop: "10%",
                      marginLeft: "10%",
                      scale: IsMobile ? "1.0" : "1.5",
                    }}
                    className="btn btn-outline-primary"
                    onClick={() => {
                      try {
                        ReadMessage(
                          ObjREAD,
                          playData.fsp,
                          GENDER,
                          playData.fspSets
                        );

                        // if (playData.fspSets) {
                        //   playAudio(playData.fspSets[0].id);
                        // }
                      } catch (error) {}
                    }}
                  >
                    <i className="bi bi-chat-left-dots"></i>
                  </button>
                ) : null}
                {playData !== null ? (
                  <div>
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
                      <RegButton setGetSTTDictaphone={setGetSTTDictaphone} />
                    )}
                  </div>
                ) : null}
                <hr />
                {/* {playData.hint ? (
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      padding: "10px",
                    }}
                  >
                    *Gợi ý:
                    <br />
                    {isImageUrl(playData.hint) ? (
                      <img
                        src={playData.hint}
                        alt={`element-hint`}
                        style={imageStyle}
                      />
                    ) : (
                      playData.hint
                    )}
                  </div>
                ) : null} */}
                <hr />
                <TablePushAW data={PushAW} />
                <hr />
              </div>
            </div>
            <div className="col-3">
              {/* <h5>Score: {Score}</h5> */}
              <div> </div>
            </div>
            <div
              className="col-7"
              style={{
                // textAlign: "center",
                height: "200px",
                overflow: "hidden",
              }}
            >
              {" "}
            </div>
            <div className="col-2"></div>
            <button
              style={{ display: "none" }}
              id="setGetSTTDictaphone"
              onClick={() => {
                setGetSTTDictaphone(false);
              }}
            ></button>

            <div></div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    return null;
  }
}

export default FINAL_PROJECT;

function shuffleArray(array) {
  const arr = array.slice(); // Tạo một bản sao của mảng để tránh thay đổi mảng gốc
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Hoán đổi các phần tử arr[i] và arr[j]
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function checkArrays(array01, array02) {
  const allInArray02 = array01.every((element) => array02.includes(element));

  const elementsNotInArray01 = array02.filter(
    (element) => !array01.includes(element)
  );

  if (elementsNotInArray01.length >= 2) {
    return 2;
  }
  if (elementsNotInArray01.length > 0 && !allInArray02) {
    return 3;
  }
  if (allInArray02 && elementsNotInArray01.length < 2) {
    return 1;
  }
  return 0;
}

function enableButtonFsp() {
  const button = document.getElementById("BtnFsp");

  if (button) {
    button.disabled = false;
    button.style.cursor = "pointer"; // Optional: Change cursor style when enabled
    button.style.opacity = "1"; // Optional: Change opacity when enabled
  }
}

function disableButtonFsp() {
  const button = document.getElementById("BtnFsp");

  if (button) {
    button.disabled = true;
    button.style.cursor = "not-allowed"; // Optional: Change cursor style when disabled
    button.style.opacity = "0.1"; // Optional: Change opacity when disabled
  }
}

function fn_f_allTable_t_tableOfContent(input) {
  let resSets = [];
  input.forEach((e, i) => {
    if (i % 4 === 0) {
      resSets.push({});
    }
    resSets[resSets.length - 1]["id" + (i % 4)] =
      (e.HDTB.IF.IFname || e.HDTB.IF.Ifname) + " (" + (i + 1) + ")";
  });

  return resSets;
}

const imageStyle = {
  maxWidth: "250px",
  maxHeight: "250px",
  objectFit: "cover",
  borderRadius: "4px",
  border: "2px solid green",
};
