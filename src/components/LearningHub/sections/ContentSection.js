import TableHD from "../../pracPages/B101_FINAL_TABLE-HD";
import { renderContent } from "../utils/renderHelpers";

export default function ContentSection({ dataLearning, currentIndex }) {
  return (
    <div
      id="div_01_content_to_learn"
      className="divlearnHub content-section"
      style={{
        flex: 0,
        width: "0",
        padding: "0",
      }}
    >
      <div
        style={{
          fontSize: "1.35rem",
          fontWeight: "400",
          lineHeight: 1.6,
          whiteSpace: "pre-line",
        }}
      >
        {" "}
        {dataLearning[currentIndex]?.HDTB?.IF?.IFdes}
        <TableHD
          data={dataLearning[currentIndex]?.HDTB?.HT}
          data_TB={[]}
          HINT={"HINT"}
          fnOnclick={(e) => {}}
        />
        {dataLearning[currentIndex] ? (
          <div>{renderContent(dataLearning, currentIndex)}</div>
        ) : null}
      </div>
    </div>
  );
}
