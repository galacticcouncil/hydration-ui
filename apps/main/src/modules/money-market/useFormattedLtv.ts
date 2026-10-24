import { useTheme } from "@galacticcouncil/ui/theme"

export const useFormattedLtv = (
  loanToValue: string,
  currentLoanToValue: string,
  currentLiquidationThreshold: string,
) => {
  const { getToken } = useTheme()

  let ltvColor: string = getToken("accents.success.emphasis")
  const ltvPercent = Number(loanToValue) * 100
  const currentLtvPercent = Number(currentLoanToValue) * 100
  const liquidationThresholdPercent = Number(currentLiquidationThreshold) * 100
  if (ltvPercent >= Math.min(currentLtvPercent, liquidationThresholdPercent)) {
    ltvColor = getToken("accents.danger.emphasis")
  } else if (
    ltvPercent > currentLtvPercent / 2 &&
    ltvPercent < currentLtvPercent
  ) {
    ltvColor = getToken("accents.alert.primary")
  }

  return {
    ltvColor,
    ltvPercent,
    currentLtvPercent,
    liquidationThresholdPercent,
  }
}
