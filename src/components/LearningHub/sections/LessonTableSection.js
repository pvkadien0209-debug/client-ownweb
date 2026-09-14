import TableHD from "../../pracPages/B101_FINAL_TABLE-HD";
import { rShowLessonTABLE } from "../utils/lessonTable";
import { buildGhepAmUrl } from "../utils/ghepAmUrl";

export default function LessonTableSection({
  dataLearning,
  currentIndex,
  setCurrentIndex,
  navigate,
  id,
}) {
  return (
    <div
      id="div_01_content_table_to_practice"
      className="divlearnHub"
      style={{
        flex: 8,
        padding: "1.5rem",
      }}
    >
      {rShowLessonTABLE(dataLearning, currentIndex, setCurrentIndex, navigate, id)}
      <TableHD
        data={dataLearning[currentIndex]?.HDTB?.H0}
        data_TB={[]}
        HINT={"HINT"}
        fnOnclick={(e) => {
          try {
            navigate(buildGhepAmUrl(id, currentIndex, e));
          } catch (error) {}
        }}
      />
      <TableHD
        data={dataLearning[currentIndex]?.HDTB?.HD}
        data_TB={[]}
        HINT={"HINT"}
        fnOnclick={(e) => {
          try {
            navigate(buildGhepAmUrl(id, currentIndex, e));
          } catch (error) {}
        }}
      />
      <TableHD
        data={dataLearning[currentIndex]?.HDTB?.TV}
        data_TB={[]}
        HINT={"HINT"}
        fnOnclick={(e) => {
          try {
            navigate(buildGhepAmUrl(id, currentIndex, e));
          } catch (error) {}
        }}
      />
    </div>
  );
}
