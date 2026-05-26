function playAudio(filename, disableButton, enableButton) {
  let link = "/audio/";
  if (filename.includes("_")) {
    link += filename.split("_")[0] + "/";
  } else if (filename.startsWith("B")) {
    link += "T1A1/";
  }
  const audio = new Audio(`${link}${filename}.mp3`);
  audio.addEventListener("play", disableButton);
  audio.addEventListener("ended", () => {
    enableButton();
    audio.remove();
  });
  audio.addEventListener("error", () => {
    enableButton();
    audio.remove();
  });
  audio.play().catch(enableButton);
}

function setButtonState(id, on) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled = !on;
  btn.style.cursor = on ? "pointer" : "not-allowed";
  btn.style.opacity = on ? "1" : "0.1";
}

function enableButton() {
  setButtonState("RegButton", true);
  setButtonState("BtnFsp", true);
}
function disableButton() {
  setButtonState("RegButton", false);
  setButtonState("BtnFsp", false);
  try {
    document.getElementById("setGetSTTDictaphone").click();
  } catch {}
}

export default function ReadMessageMp3(audio) {
  if (!Array.isArray(audio) || !audio.length) return;
  const id = audio[Math.floor(Math.random() * audio.length)].id;
  playAudio(id, disableButton, enableButton);
}
