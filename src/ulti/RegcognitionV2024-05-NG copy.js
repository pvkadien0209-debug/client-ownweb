import React, { useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import stringSimilarity from "string-similarity";
import ReadMessage from "./ReadMessage_2024";
import LinkAPI from "./T0_linkApi";
// import { socket } from "../App";

let commands = [];

const Dictaphone = ({
  getSTTDictaphone,
  setGetSTTDictaphone,
  CMDlist,
  GENDER,
  setScore,
  addElementIfNotExist,
  ObjVoices,
  Lang,
  regRate,
  regRate_01,
  setStartSTT,
  setMessage,
}) => {
  console.log(CMDlist);
  const { interimTranscript, transcript, listening, resetTranscript } =
    useSpeechRecognition({ commands, continuous: true, interimResults: true });
  const [otherGetInterim, setotherGetInterim] = useState("");
  const [SttProcessing, setSttProcessing] = useState(false);
  // const idSocket = socket.id.slice(0, 4);

  const [styles, setStyles] = useState({
    opacity: 0,
    height: "100px",
    transition: "opacity 1s ease, height 1s ease, width 1s ease",

    position: "fixed",
    backgroundColor: "white",
    top: "50%",
    left: "50%",

    transform: "translate(-50%, -50%)",
    border: "1px solid black",
    borderRadius: "5px",
    cursor: "pointer",
    padding: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  });

  useEffect(() => {
    let cmd_get_f_CMDlist = [];
    let cmd_get_f_CMDlist_over50 = [];
    CMDlist.forEach((e0, i0) => {
      e0.qs.forEach((e1, i1) => {
        if (e1.length > 40) {
          cmd_get_f_CMDlist_over50.push(e1);
        } else {
          cmd_get_f_CMDlist.push(e1);
        }
      });
    });

    commands = [
      {
        command: cmd_get_f_CMDlist,
        callback: (command, n, i) => {
          try {
            setotherGetInterim(command);
          } catch (error) {}
        },
        isFuzzyMatch: true,
        fuzzyMatchingThreshold: regRate,
        bestMatchOnly: true,
      },
      {
        command: cmd_get_f_CMDlist_over50,
        callback: (command, n, i) => {
          try {
            setotherGetInterim(command);
          } catch (error) {}
        },
        isFuzzyMatch: true,
        fuzzyMatchingThreshold: regRate > 0.7 ? regRate : 0.7,
        bestMatchOnly: true,
      },
    ];
  }, [CMDlist]);

  useEffect(() => {
    setStyles((prevStyles) => ({
      ...prevStyles,
      opacity: 1,
      height: "600px",
    }));
  }, []);

  useEffect(() => {
    if (getSTTDictaphone) {
      startListening();
    }
  }, [getSTTDictaphone]);

  const startListening = () => {
    SpeechRecognition.startListening({
      continuous: true,
      language: Lang || "en-US",
    });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  // async function check(RegInput) {
  //   if (!RegInput) return;

  //   setMessage(RegInput);

  //   try {
  //     const requestBody = {
  //       RegInput,
  //       CMDlist,
  //       regRate_01,
  //     };

  //     setSttProcessing(true);

  //     const response = await fetch(LinkAPI + "reg-Analyze-in-prac", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(requestBody),
  //     });

  //     const json = await response.json();
  //     const objTR = json.success ? json.data : null;

  //     if (!objTR) {
  //       // If no result, respond with clarification prompt
  //       ReadMessage(
  //         ObjVoices,
  //         "Sorry, what did you say?",
  //         GENDER,
  //         GENDER === 1 ? [{ id: "sorryFemale" }] : [{ id: "sorryMale" }]
  //       );
  //     } else {
  //       // Respond with the answer
  //       const answer = objTR.aw ? getRandomElementFromArray(objTR.aw) : null;
  //       const voice = objTR.aw01 || undefined;

  //       if (answer) {
  //         ReadMessage(
  //           ObjVoices,
  //           answer,
  //           GENDER,
  //           voice ? [{ id: voice }] : undefined
  //         );
  //       }

  //       // Handle actions
  //       if (objTR.action?.[0] === "WRONG") {
  //         setScore((prev) => prev - 1.5);
  //       } else if (objTR.action?.[0]) {
  //         addElementIfNotExist(objTR.action[0]);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error during check():", error);
  //   } finally {
  //     setSttProcessing(false); // corrected: was mistakenly set to true in finally
  //     setGetSTTDictaphone(false);
  //   }
  // }

  function check(RegInput) {
    if (!RegInput) return;

    setMessage(RegInput);

    // Ưu tiên check objTR_00 trước (90% trường hợp)
    let objTR = findMostSimilarQuestion(RegInput, CMDlist, regRate_01);

    // Chỉ check objTR_01 nếu objTR_00 không tìm thấy (7% trường hợp)
    if (!objTR) {
      objTR = findMostSimilarQuestion(otherGetInterim, CMDlist, regRate_01);
    }

    // Cuối cùng mới check processedInput (1-3% trường hợp)
    if (!objTR) {
      const processedInput = removeDuplicates(RegInput);
      objTR = findMostSimilarQuestion(processedInput, CMDlist, regRate_01);
    }

    // Xử lý kết quả
    if (!objTR) {
      ReadMessage(
        ObjVoices,
        "Sorry, what did you say?",
        GENDER,
        GENDER === 1 ? [{ id: "sorryFemale" }] : [{ id: "sorryMale" }]
      );
    } else {
      // Xử lý câu trả lời
      const answer = objTR.aw?.[Math.floor(Math.random() * objTR.aw.length)];
      if (answer) {
        ReadMessage(
          ObjVoices,
          answer,
          GENDER,
          objTR.aw01 ? [{ id: objTR.aw01 }] : undefined
        );
      }

      // Xử lý action
      if (objTR.action?.[0]) {
        if (objTR.action[0] === "WRONG") {
          const btnBoQua = document.getElementById("btnBoQua");
          if (btnBoQua) {
            btnBoQua.click();
          } else {
            setScore((S) => S - 2);
          }
        } else {
          addElementIfNotExist(objTR.action[0]);
        }
      }
    }

    setGetSTTDictaphone(false);
  }

  return (
    <div className="container" id="div_of_dictaphone" style={{}}>
      {" "}
      <button
        // style={{ scale: "1.5", marginRight: "10x" }}
        className="btn btn-danger me-2"
        onClick={() => {
          resetTranscript();
        }}
      >
        Xóa nội dung vừa nói
      </button>{" "}
      {SttProcessing ? (
        <button className="btn btn-warning">Xử lý ...</button>
      ) : (
        <button
          // style={{ scale: "1.5" }}
          disabled={
            interimTranscript !== "" && otherGetInterim === "" ? true : false
          }
          className="btn btn-info me-2"
          onClick={() => {
            stopListening();
            check(transcript);

            // setRegInput(transcript);
          }}
        >
          {/* <i className="bi bi-mic-fill mr-1"></i> */}
          <i>
            {" "}
            {interimTranscript === "" && otherGetInterim === ""
              ? "Hãy nói ..."
              : interimTranscript !== "" && otherGetInterim === ""
              ? "Đang xử lý, chờ 3s."
              : "Sử dụng nội dung vừa nói (1) và (2)"}
          </i>
        </button>
      )}
      <button
        className="btn btn-danger "
        onClick={() => {
          stopListening();
          setGetSTTDictaphone(false);
        }}
      >
        Thoát
      </button>
      <h3> (1){transcript || <i>Hãy nói gì đó . . . </i>}</h3>
      <h5 style={{ color: "blue" }}>
        {" "}
        (2){" "}
        <i id="interimRes">
          {interimTranscript !== "" && otherGetInterim === ""
            ? "Đang xử lý, chờ 3s."
            : otherGetInterim}
        </i>
      </h5>{" "}
      {/* <br />
      <i>{interimTranscript}</i> */}
      {/* {otherGetInterim} */}
      <button
        id="stopListenBTN"
        style={{ display: "none" }}
        onClick={() => {
          stopListening();
        }}
      >
        StopListen
      </button>{" "}
      <hr />
      <i> Chỉ cần (1) hoặc (2) đúng là đã đủ chuẩn thực hành.</i>
      <br />
      ***
      <br />
      <i>
        - Đọc chuẩn (1) sẽ khó hơn, là cái chuẩn chúng ta hướng đến trong dài
        hạn, yêu cầu rèn luyện lâu dài.
      </i>{" "}
      <br />
      <b>- Tuy nhiên đọc chuẩn (2) đã đủ để thực hành.</b> <br />
      <i>
        - Thực hành xử lý 1 bài tổng thể nhanh chóng trong thời gian ngắn quan
        trọng hơn là chuẩn chỉnh 100% từng câu từng chữ.
      </i>
      <br />
      <i>
        - Rèn luyện là quá trình lâu dài, không cần phải hoàn hảo ngay từ đầu.
        Trong quá trình rèn luyện, chúng ta sẽ nhận phản hồi và chỉnh sửa dần
        dần.
      </i>{" "}
      <hr />
      Chúc các anh chị, các bạn được nhiều lợi lạc.
    </div>
  );
};

export default Dictaphone;

// Helper function to remove accents and convert to lowercase
function removeAccentsAndLowercase(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Removes accents
    .replace(/[.,?]/g, "") // Removes periods, commas, and question marks
    .toLowerCase();
}

// Function to get a random element from an array
function getRandomElementFromArray(array) {
  if (array.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

function findMostSimilarQuestion(statement, questions, similarityThreshold) {
  const normalizedStatement = removeAccentsAndLowercase(statement);

  let maxSimilarity = -1;
  let bestMatch = null;

  questions.forEach((questionObj) => {
    questionObj.qs.forEach((q) => {
      const normalizedQuestion = removeAccentsAndLowercase(q);
      const similarity = stringSimilarity.compareTwoStrings(
        normalizedStatement,
        normalizedQuestion
      );

      if (similarity >= similarityThreshold && similarity > maxSimilarity) {
        maxSimilarity = similarity;
        bestMatch = questionObj;
      }
    });
  });

  return bestMatch;
}

/**
 * Removes duplicate words from a sentence.
 * @param {string} sentence - Input sentence.
 * @returns {string} Cleaned sentence with unique words.
 */
function removeDuplicates(sentence) {
  const words = sentence.split(" ");
  const seen = new Set();
  const uniqueWords = [];

  for (const word of words) {
    if (!seen.has(word)) {
      uniqueWords.push(word);
      seen.add(word);
    }
  }

  return uniqueWords.join(" ");
}
