import BigNumber from "bignumber.js";
import BN from "bn.js";

const ten = new BigNumber(10);
export function toDecimalsBN(num: number | string, decimals: number | string) {
    return new BN(BigNumber(num).multipliedBy(ten.pow(decimals)).toFixed(0));
}
export function toDecimalsBalance(num: number | string, decimals: number | string, price: number | string) {
    return BigNumber(num).div(ten.pow(decimals)).multipliedBy(price).toFixed();
}
export function toDecimalsAmount(num: number | string, price: number | string, decimals: number | string) {
    return BigNumber(num).div(price).multipliedBy(ten.pow(decimals)).toFixed();
}

export function toDecimalsMulWithRoundingMode(
    num: number | string,
    num2: number | string,
    decimalPlaces: number | null = null,
    roundingMode: BigNumber.RoundingMode | null = null,
) {
    if (decimalPlaces && roundingMode) {
        return BigNumber(num).multipliedBy(num2).toFixed(decimalPlaces, roundingMode);
    }
    return BigNumber(num).multipliedBy(num2).toFixed();
}


export function toDecimalsPlus(num: number | string, num2: number | string, decimalPlaces: number | null = null) {
    if (decimalPlaces) {
        return BigNumber(num).plus(num2).toFixed(decimalPlaces);
    }
    return BigNumber(num).plus(num2).toFixed();
}
export function toDecimalsMinus(num: number | string, num2: number | string, decimalPlaces: number | null = null) {
    if (decimalPlaces) {
        return BigNumber(num).minus(num2).toFixed(decimalPlaces);
    }
    return BigNumber(num).minus(num2).toFixed();
}
export function toDecimalsMul(num: number | string, num2: number | string, decimalPlaces: number | null = null) {
    if (decimalPlaces) {
        return BigNumber(num).multipliedBy(num2).toFixed(decimalPlaces);
    }
    return BigNumber(num).multipliedBy(num2).toFixed();
}
export function toDecimalsDiv(num: number | string, num2: number | string, decimalPlaces: number | null = null) {
    if (decimalPlaces) {
        return BigNumber(num).div(num2).toFixed(decimalPlaces);
    }
    return BigNumber(num).div(num2).toFixed();
}