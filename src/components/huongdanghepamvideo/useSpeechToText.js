import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useSpeechToText
 * Bọc Web Speech API (SpeechRecognition) thành 1 hook đơn giản.
 * - Không cần cài thêm thư viện ngoài (native browser API).
 * - Nếu dự án đã dùng "react-speech-recognition" (như FocusSpeaking),
 *   có thể thay thế phần bên trong hook này bằng thư viện đó mà
 *   không cần đổi API bên ngoài (start/stop/transcript/listening).
 */
export default function useSpeechToText(lang = "vi-VN") {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += chunk + " ";
        else interimText += chunk;
      }
      setTranscript((finalText + interimText).trim());
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    // Dọn dẹp khi unmount: luôn dừng mic, không để chạy ngầm.
    return () => {
      try {
        recognition.stop();
      } catch (e) {
        /* no-op */
      }
    };
  }, [lang]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript("");
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (e) {
      // start() gọi 2 lần liên tiếp sẽ throw -> bỏ qua an toàn
    }
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {
      /* no-op */
    }
    setListening(false);
  }, []);

  return { transcript, listening, start, stop, supported };
}
