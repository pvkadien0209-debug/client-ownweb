import Lobby from "../../Lobby";
import { createArrayFromNumber } from "../utils/renderHelpers";

export default function ThucHanhSection({
  STTPractice,
  dataLearning,
  STTconnectFN,
  setSttRoom,
  id,
  currentIndex,
  setSTTPractice,
}) {
  return (
    <div
      id="div_01_prac_vaothuchanh"
      className="divlearnHub info-section"
      style={{
        flex: 0,
        width: "0",
        padding: "0",
        overflow: "hidden",
      }}
    >
      {STTPractice && dataLearning !== null ? (
        <Lobby
          STTconnectFN={STTconnectFN}
          setSttRoom={setSttRoom}
          fileName={id}
          objList={createArrayFromNumber(dataLearning.length - 1)}
          objListDefault={[currentIndex]}
          custom={true}
          id={id}
          currentIndex={currentIndex}
        />
      ) : (
        <div className="text-center py-5">
          <div className="info-card">
            <h3 className="mb-4">
              <i className="bi bi-play-circle text-primary me-2"></i>
              Sẵn sàng thực hành?
            </h3>
            <button
              onClick={() => {
                setSTTPractice(true);
              }}
              className="btn btn-modern btn-gradient-primary btn-lg"
            >
              <i className="bi bi-mic me-2"></i>
              Cùng thực hành
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
