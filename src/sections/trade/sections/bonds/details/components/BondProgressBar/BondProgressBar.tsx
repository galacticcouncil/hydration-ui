import { Trans, useTranslation } from "react-i18next"
import { ProgressBarContainer, SBar, SFill } from "./BondProgressBar.styled"
import { Text } from "components/Typography/Text/Text"
import BN from "bignumber.js"

export const BondProgreesBar = ({ sold, total }: { sold: BN; total: BN }) => {
  const { t } = useTranslation()

  const percentage = sold.div(total).multipliedBy(100)

  return (
    <ProgressBarContainer>
      <Text color="brightBlue300">
        <Trans
          t={t}
          i18nKey="bonds.details.progressBar.label"
          tOptions={{
            sold,
            total,
          }}
        >
          <span
            sx={{ color: "white", ml: 8 }}
            css={{ fontFamily: "FontOver" }}
          />
          <span
            sx={{ color: "darkBlue300" }}
            css={{ fontFamily: "FontOver" }}
          />
        </Trans>
      </Text>
      <SBar>
        <SFill percentage={percentage.toNumber()} />
      </SBar>
    </ProgressBarContainer>
  )
}
