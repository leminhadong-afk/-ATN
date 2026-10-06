export function formatNumberWithDecimal(number) {
  if (number) {
    const [integerPart, decimalPart] = String(number).split(".");

    const formattedIntegerPart =
      parseFloat(integerPart).toLocaleString("vi-VN");

    if (decimalPart === undefined || parseInt(decimalPart) === 0) {
      return formattedIntegerPart;
    }

    const formattedNumber = `${formattedIntegerPart},${decimalPart}`;

    return formattedNumber;
  }
  return "";
}

export function formatNumberWithDecimalUSD(number) {
  if (number) {
    const [integerPart, decimalPart] = String(number).split(".");

    const formattedIntegerPart = parseFloat(integerPart).toLocaleString("vi-VN");

    if (decimalPart === undefined || parseInt(decimalPart) === 0) {
      return formattedIntegerPart;
    }

    const truncatedDecimalPart = decimalPart.slice(0, 2);

    const formattedNumber = `${formattedIntegerPart},${truncatedDecimalPart}`;

    return formattedNumber;
  }
  return "";
}

export function formatNumberWithDecimalVND(number) {
  if (number) {
    const [integerPart] = String(number).split(".");

    const formattedIntegerPart = parseFloat(integerPart).toLocaleString("vi-VN");

    return formattedIntegerPart;
  }
  return "";
}
