export interface DivisionStep {
  stepIndex: number;
  description: string;
  currentNumber: number; // số đem chia ở lượt này (ví dụ 51, 130, 161, 99)
  digitBroughtDown?: string; // chữ số vừa hạ (ví dụ '0', '1', '9')
  quotientDigit: number; // chữ số thương tìm được ở lượt này (ví dụ 2, 6, 8, 5)
  multiplyResult: number; // tích của thương với số chia (ví dụ 38, 114, 152, 95)
  remainder: number; // số dư của lượt chia này (ví dụ 13, 16, 9, 4)
  explanation: string;
}

export interface DivisionResult {
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
  steps: DivisionStep[];
  isExact: boolean;
}

/**
 * Thuật toán mô phỏng chính xác phương pháp Đặt tính rồi tính phép chia
 * theo chương trình Toán Tiểu học Việt Nam (Lớp 4 - Lớp 5).
 */
export function calculateLongDivision(dividend: number, divisor: number): DivisionResult {
  if (divisor <= 0 || dividend < 0) {
    throw new Error('Số chia phải lớn hơn 0 và số bị chia không âm');
  }

  const dividendStr = dividend.toString();
  const steps: DivisionStep[] = [];
  let quotientStr = '';
  let currentIdx = 0;
  let currentVal = 0;

  // Lần chia đầu tiên: lấy số chữ số từ trái sang phải sao cho >= divisor
  while (currentVal < divisor && currentIdx < dividendStr.length) {
    currentVal = currentVal * 10 + parseInt(dividendStr[currentIdx], 10);
    currentIdx++;
  }

  // Trường hợp đặc biệt nếu số bị chia nhỏ hơn số chia
  if (currentVal < divisor) {
    return {
      dividend,
      divisor,
      quotient: 0,
      remainder: dividend,
      steps: [
        {
          stepIndex: 1,
          description: `Lấy ${dividend} chia ${divisor} được 0, dư ${dividend}`,
          currentNumber: dividend,
          quotientDigit: 0,
          multiplyResult: 0,
          remainder: dividend,
          explanation: `Vì ${dividend} nhỏ hơn ${divisor} nên thương bằng 0, số dư là ${dividend}.`,
        },
      ],
      isExact: false,
    };
  }

  let stepCount = 1;
  const firstQuotientDigit = Math.floor(currentVal / divisor);
  const firstMultiply = firstQuotientDigit * divisor;
  const firstRemainder = currentVal - firstMultiply;
  quotientStr += firstQuotientDigit.toString();

  steps.push({
    stepIndex: stepCount,
    description: `Lần ${stepCount}: Lấy ${currentVal} chia cho ${divisor}`,
    currentNumber: currentVal,
    quotientDigit: firstQuotientDigit,
    multiplyResult: firstMultiply,
    remainder: firstRemainder,
    explanation: `• Lấy ${currentVal} chia ${divisor} được ${firstQuotientDigit}, viết ${firstQuotientDigit} vào thương.\n• Nhân ngược lại: ${firstQuotientDigit} × ${divisor} = ${firstMultiply}.\n• Trừ: ${currentVal} − ${firstMultiply} = ${firstRemainder} (số dư ${firstRemainder} nhỏ hơn ${divisor}, phép tính đúng).`,
  });

  currentVal = firstRemainder;

  // Các lần chia tiếp theo: hạ từng chữ số còn lại
  while (currentIdx < dividendStr.length) {
    stepCount++;
    const nextDigit = dividendStr[currentIdx];
    currentIdx++;
    currentVal = currentVal * 10 + parseInt(nextDigit, 10);

    const qDigit = Math.floor(currentVal / divisor);
    const multiply = qDigit * divisor;
    const remainder = currentVal - multiply;
    quotientStr += qDigit.toString();

    steps.push({
      stepIndex: stepCount,
      description: `Lần ${stepCount}: Hạ ${nextDigit}, được ${currentVal}`,
      currentNumber: currentVal,
      digitBroughtDown: nextDigit,
      quotientDigit: qDigit,
      multiplyResult: multiply,
      remainder: remainder,
      explanation: `• Hạ ${nextDigit} xuống cạnh số dư trước đó, được ${currentVal}.\n• Lấy ${currentVal} chia ${divisor} được ${qDigit}, viết ${qDigit} vào thương.\n• Nhân ngược lại: ${qDigit} × ${divisor} = ${multiply}.\n• Trừ: ${currentVal} − ${multiply} = ${remainder}.`,
    });

    currentVal = remainder;
  }

  const finalQuotient = parseInt(quotientStr, 10) || 0;
  const finalRemainder = currentVal;

  return {
    dividend,
    divisor,
    quotient: finalQuotient,
    remainder: finalRemainder,
    steps,
    isExact: finalRemainder === 0,
  };
}
