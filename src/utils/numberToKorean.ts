// 숫자 -> 한글 숫자 변환용
export const digitToKorean = (digit: number): string => {
  const koreanDigits = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
  return koreanDigits[digit];
};

// 천 단위 콤마 추가
export const addComma = (value: string | number): string => {
  if (!value) return "0";
  const number = typeof value === "string" ? parseInt(value.replace(/,/g, ""), 10) : value;
  return isNaN(number) ? "0" : number.toLocaleString("ko-KR");
};

// 숫자 → 한글로 변환 (예: 123456 → 십이만삼천사백오십육원 or 만원 단위일 경우 → 십이억 ...)
export const numberToKorean = (num: string | number): string => {
  if (!num || parseInt(num.toString(), 10) === 0) return "";

  const units = ["", "억", "조", "경"];
  const smallUnits = ["", "십", "백", "천"];
  const numString = parseInt(num.toString(), 10).toString();

  const chunks: string[] = [];
  for (let i = numString.length; i > 0; i -= 4) {
    chunks.unshift(numString.substring(Math.max(i - 4, 0), i));
  }

  const result = chunks
    .map((chunk, index) => {
      const reversed = chunk.split("").reverse();
      let part = "";
      for (let i = 0; i < reversed.length; i++) {
        const digit = parseInt(reversed[i], 10);
        if (digit !== 0) {
          part = digitToKorean(digit) + smallUnits[i] + part;
        }
      }
      return part ? part + units[chunks.length - 1 - index] : "";
    })
    .join("");

  const isHighUnit = result.endsWith("억") || result.endsWith("조") || result.endsWith("경");
  return isHighUnit ? result + "원" : result + "만원";
};
