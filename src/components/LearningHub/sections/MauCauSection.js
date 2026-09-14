import TableHD from "../../pracPages/B101_FINAL_TABLE-HD";
import { buildGhepAmUrl } from "../utils/ghepAmUrl";

export default function MauCauSection({
  dataLearning,
  currentIndex,
  navigate,
  id,
}) {
  return (
    <div
      id="div_01_prac_hoc_thuoc"
      className="divlearnHub info-section"
      style={{
        flex: 0,
        width: "0",
        padding: "0",
        overflow: "hidden",
      }}
    >
      <div className="text-center">
        <h1 className="lesson-title">Rèn luyện kỹ năng đặt câu!</h1>
        <TableHD
          data={dataLearning[currentIndex]?.HDTB?.MC}
          data_TB={[]}
          HINT={"HINT"}
          fnOnclick={(e) => {
            try {
              navigate(buildGhepAmUrl(id, currentIndex, e));
            } catch (error) {}
          }}
        />
      </div>
    </div>
  );
}
