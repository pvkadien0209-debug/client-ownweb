import Getlink from "../../LearningHub_getlink";

export default function CustomLinkSection({ id, currentIndex, dataLearning }) {
  return (
    <div
      id="div_01_prac_bangnhap"
      className="divlearnHub info-section"
      style={{
        flex: 0,
        width: "0",
        padding: "0",
        overflow: "hidden",
      }}
    >
      <Getlink
        id={id}
        index={currentIndex}
        lessonSetLength={dataLearning.length}
        typeSet={dataLearning[currentIndex]?.typeSets || ["A1"]}
      />
    </div>
  );
}
