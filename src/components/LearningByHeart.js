import React, { useEffect, useState, useContext } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { ObjREADContext } from "../App"; // Import ObjREADContext
import LoadingScreen from "./shared/LoadingScreen";
import ErrorScreen from "./shared/ErrorScreen";

const LearningByHeartHub = ({ STTconnectFN }) => {
  const { id, id01 } = useParams();
  const [dataLearning, setDataLearning] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ObjREAD = useContext(ObjREADContext);
  const [seconds, setSeconds] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [IsRead, setIsRead] = useState("null");
  const randomGender = () => {
    return Math.random() < 0.5 ? 1 : 2;
  };
  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const response = await fetch(`/jsonData/${id}.json`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setDataLearning(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTitle();
  }, [id]);

  useEffect(() => {
    if (currentIndex === -1) return;

    if (currentIndex < dataLearning[id01]["ListenList"].length) {
      ReadMessage(
        ObjREAD,
        dataLearning[id01]["ListenList"][currentIndex],
        randomGender(),
        setIsRead
      );
    } else {
      clearInterval(intervalId);
      setIntervalId(null);
      setCurrentIndex(-1);
    }
  }, [currentIndex]);

  useEffect(() => {
    try {
      if (IsRead !== null && !isPaused) {
        if (seconds % 5 === 0 && Date.now() - IsRead > 5000) {
          setCurrentIndex((prevIndex) => prevIndex + 1);
        }
      }
    } catch (error) {
      console.error("Error in useEffect:", error);
    }
  }, [seconds, isPaused, IsRead]);

  const startReading = () => {
    setCurrentIndex(0);
    setSeconds(1);
    const id = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds + 1);
    }, 1000);
    setIntervalId(id);
  };

  const pauseReading = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      const id = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
      setIntervalId(id);
    } else {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={`Đã xảy ra lỗi: ${error}`} />;
  }

  function arrayToString(array) {
    return array.join(", ");
  }

  return (
    <HelmetProvider>
      <div
        style={{
          border: "1px solid green",
          borderRadius: "10px",
          margin: "1% 10%",
          padding: "1% 10%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "40vh",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
          color: "#333",
          marginTop: "var(--app-header-h, 8vh)",
        }}
      >
        <Helmet>
          <title>
            {"Learning By Heart: " +
              (dataLearning[id01]?.["SEO"]["seo"].metaTitle ||
                "Learning By Heart")}
          </title>
          <meta
            name="description"
            content={dataLearning[id01]?.["SEO"]["seo"].metaDescription || ""}
          />
          <meta
            name="keywords"
            content={
              arrayToString(dataLearning[id01]?.["SEO"]["seo"].keywords) +
              ", " +
              id
            }
          />
        </Helmet>

        {STTconnectFN === 1 ? (
          <div>
            {" "}
            <hr />
            {currentIndex === -1 ? (
              <button
                onClick={startReading}
                className="btn btn-outline-primary"
              >
                Bắt đầu
              </button>
            ) : (
              <button
                onClick={pauseReading}
                className="btn btn-outline-secondary"
              >
                {isPaused ? "Tiếp tục" : "Tạm dừng"}
              </button>
            )}
            <div style={{ fontSize: "24px" }}>
              <h2>Learning by heart!</h2>
              <p style={{ color: "blue" }}>
                Khoảng 5 - 10 giây máy sẽ đọc 1 câu sử dụng trong bài thực hành
                nghe nói. Hãy nghe và ghi lại lên giấy nháp (có thể ghi tắt).
              </p>
              <h1> {formatTime(seconds)}</h1>
              <hr />
              {currentIndex > 0
                ? dataLearning[id01]["ListenList"][currentIndex - 1]
                : ""}
              <hr />
              {IsRead === null ? "Đang đọc" : null}
              <br />
              {/* {!isPaused ? <i>{JSON.stringify(ObjREAD)}</i> : null} */}
            </div>
          </div>
        ) : STTconnectFN === 2 ? (
          <div>
            <h1>Chưa kết nối được</h1>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          </div>
        ) : (
          <h1>Đang kết nối với server, vui lòng đợi giây lát . . .</h1>
        )}
      </div>
    </HelmetProvider>
  );
};

export default LearningByHeartHub;

// Format time as mm:ss
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

let imale, ifemale;

function countAndSplitSentences(text) {
  // Split the text based on sentence-ending punctuation marks
  const sentences = text.match(/[^?!.;]+[?!.;]*/g);

  // Return the sentences array or an array with the original text if no matches found
  return sentences || [text];
}

async function ReadMessage(ObjVoices, text, voiceNum, setIsRead) {
  // voiceNum: 1 for female, 0 for male
  console.log("read", ObjVoices, voiceNum, 0.85);

  if (text === "") {
    return;
  }

  imale = ObjVoices.imale;
  ifemale = ObjVoices.ifemale;

  try {
    if (imale === undefined || ifemale === undefined) {
      return;
    }

    let voiceIndex = voiceNum === 1 ? ifemale : imale;
    const sentences = countAndSplitSentences(text);
    console.log(sentences.length);
    // Function to recursively read each sentence
    const speakSentences = (index) => {
      if (index >= sentences.length) {
        setIsRead(Date.now());
        return;
      }

      let msg = new SpeechSynthesisUtterance();
      let voices = window.speechSynthesis.getVoices();
      msg.voice = voices[voiceIndex];
      msg.rate = 0.7;
      msg.text = sentences[index];

      msg.onstart = () => {
        setIsRead(null);
      };

      msg.onend = () => {
        speakSentences(index + 1);
      };

      msg.onerror = (error) => {
        console.error("Error in speech synthesis: ", error);
      };

      speechSynthesis.speak(msg);
    };

    speakSentences(0);
  } catch (error) {
    console.error("Error in ReadMessage function: ", error);
  }
}
