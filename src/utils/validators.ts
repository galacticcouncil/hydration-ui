import BigNumber from "bignumber.js"
import i18n from "i18next"

export const validNumber = (value: string) => {
  if (!new BigNumber(value).isNaN()) {
    return true
  }

  return i18n.t("error.validNumber")
}

export const positive = (value: string) =>
  new BigNumber(value).lt(0) ? i18n.t("error.positive") : undefined
