export function formatDecimalInput(input: string): string {
    input = input.replace(/[^0-9.]/g, "");
    const parts = input.split(".");
    if (parts.length > 2) {
        input = parts[0] + "." + parts.slice(1).join("");
    }
    const [integerPart, decimalPart] = input.split(".");
    let formattedValue = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (decimalPart !== undefined) {
        formattedValue += "." + decimalPart;
    }
    return formattedValue;
}
