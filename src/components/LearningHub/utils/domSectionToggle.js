// Utility Functions
export function handle_div(id) {
  if (!id) {
    id = "div_01_content_table_to_practice";
  }
  const divs = document.querySelectorAll(".divlearnHub");
  divs.forEach((div) => {
    div.style.flex = "0";
    div.style.opacity = "0";
    div.style.width = "0px";
    div.style.padding = "0px";
    div.style.pointerEvents = "none";
  });
  const targetDiv = document.getElementById(id);
  if (targetDiv) {
    targetDiv.style.opacity = "1";
    targetDiv.style.flex = "8";
    targetDiv.style.width = "80wh";
    targetDiv.style.padding = "20px";
    targetDiv.style.pointerEvents = "auto";
  } else {
    console.warn("No div found with the id:", id);
  }
}
