export function createArrayFromNumber(n) {
  return Array.from({ length: n + 1 }, (_, index) => index);
}
export function renderContent(dataLearning, currentIndex) {
  try {
    if (!dataLearning[currentIndex]) return null;
    const { cssStyles, contentArray } = dataLearning[currentIndex].SEO;
    return contentArray.map((item, index) => {
      const Tag = item.tag || "div";
      const style = cssStyles[item.cssClass] || {};
      return (
        <Tag key={index} style={style}>
          {item.content}
        </Tag>
      );
    });
  } catch (error) {
    return null;
  }
}
export function arrayToString(array) {
  if (!Array.isArray(array)) return "";
  return array.join(", ");
}
export function convertToRoman(num) {
  const romanNumerals = [
    { value: 1000, symbol: "M" },
    { value: 900, symbol: "CM" },
    { value: 500, symbol: "D" },
    { value: 400, symbol: "CD" },
    { value: 100, symbol: "C" },
    { value: 90, symbol: "XC" },
    { value: 50, symbol: "L" },
    { value: 40, symbol: "XL" },
    { value: 10, symbol: "X" },
    { value: 9, symbol: "IX" },
    { value: 5, symbol: "V" },
    { value: 4, symbol: "IV" },
    { value: 1, symbol: "I" },
  ];
  let roman = "";
  for (const numeral of romanNumerals) {
    while (num >= numeral.value) {
      roman += numeral.symbol;
      num -= numeral.value;
    }
  }
  return roman;
}
