import React, { useState } from "react";
import LinkAPI from "../../ulti/T0_linkApi";
import BrowserSupportTTSDemo from "./BrowserSupportChecker";
function TTSStartButton() {
  const controller = new AbortController(); // Create AbortController

  const handleStart = async () => {
    try {
      const response = await fetch(LinkAPI + "ttslist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sttStart: true }),
        signal: controller.signal, // use controller
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Response:", data);
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Error:", error);
      }
    }
  };

  const handleStartTV = async () => {
    try {
      const response = await fetch(LinkAPI + "ttslistTV", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sttStart: true }),
        signal: controller.signal, // use controller
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Response:", data);
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Error:", error);
      }
    }
  };

  const handleTESTFffmeg = async () => {
    try {
      const response = await fetch(LinkAPI + "test-ffmpeg", {
        method: "GET",
        headers: { "Content-Type": "application/json" },

        signal: controller.signal, // use controller
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Response:", data);
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Error:", error);
      }
    }
  };

  const handleTESTCutMp3 = async () => {
    try {
      const response = await fetch(LinkAPI + "split-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        signal: controller.signal, // use controller
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Response:", data);
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Error:", error);
      }
    }
  };
  return (
    <div style={{ margin: "10%", padding: "50px", backgroundColor: "grey" }}>
      <button onClick={() => handleStart()}>START TO TTSLIST</button>

      <button onClick={() => handleStartTV()}>START TO TTSLISTTV</button>

      <button onClick={() => handleTESTFffmeg()}>TEST FFMPEG</button>

      <button onClick={() => handleTESTCutMp3()}>handleTESTCutMp3</button>

      {/* <BrowserSupportTTSDemo /> */}
    </div>
  );
}

export default TTSStartButton;
