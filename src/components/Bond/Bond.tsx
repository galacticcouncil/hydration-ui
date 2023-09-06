import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { MouseEventHandler, ReactNode, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { SBond, SItem } from "./Bond.styled"
import { Icon } from "components/Icon/Icon"
import { useBestNumber } from "api/chain"
import { BLOCK_TIME } from "utils/constants"
import { addSeconds, intlFormatDistance } from "date-fns"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { SInfoIcon } from "sections/pools/pool/Pool.styled"
import { formatDate } from "utils/formatting"
import { SSeparator } from "components/Separator/Separator.styled"
import { theme } from "theme"

export type BondView = "card" | "list"

type Props = {
  view?: BondView
  icon: ReactNode
  name: string
  ticker: string
  maturity: string
  end: string
  start: string
  state: "active" | "upcoming"
  discount: string
  onDetailClick: MouseEventHandler<HTMLButtonElement>
}

export const Bond = ({
  view,
  icon,
  name,
  maturity,
  end,
  start,
  state,
  onDetailClick,
  discount,
  ticker,
}: Props) => {
  const { t } = useTranslation()
  const bestNumber = useBestNumber()

  const isActive = state === "active"

  const timestamp = useMemo(() => {
    if (!end || !start || !bestNumber.data) return undefined

    const currentBLockNumber =
      bestNumber.data?.relaychainBlockNumber.toNumber() ?? 0

    const diff = BLOCK_TIME.multipliedBy(
      Number(isActive ? end : start) - currentBLockNumber,
    ).toNumber()

    const date = addSeconds(new Date(), diff)
    const distance = intlFormatDistance(date, new Date())
    return { distance, date }
  }, [end, start, bestNumber.data, isActive])

  const headingFs = view === "card" ? ([19, 26] as const) : ([19, 21] as const)

  return (
    <SBond view={view ?? "list"}>
      <div
        sx={{
          flex: "row",
          align: "center",
          gap: 16,
          mb: view === "card" ? 12 : [12, 0],
        }}
      >
        <Icon icon={icon} size={32} />
        <div sx={{ flex: "column" }}>
          <Text
            fs={headingFs}
            lh={headingFs}
            sx={{ mt: 3 }}
            font="ChakraPetchSemiBold"
          >
            {ticker}
          </Text>
          <Text fs={13} sx={{ mt: 3 }} color={"whiteish500"}>
            {name}
          </Text>
        </div>
      </div>

      <div
        sx={{ flex: ["column", "row"], justify: "space-evenly" }}
        css={{ flex: "1 0 auto" }}
      >
        <SItem>
          <div sx={{ flex: "row", align: "center", gap: 6 }}>
            <Text color="basic400" fs={14}>
              {t(`bond.${isActive ? "endingIn" : "startingIn"}`)}
            </Text>
            {timestamp?.date && (
              <InfoTooltip
                text={formatDate(timestamp.date, "dd.MM.yyyy HH:mm")}
              >
                <SInfoIcon />
              </InfoTooltip>
            )}
          </div>
          <Text color="white">{timestamp?.distance}</Text>
        </SItem>
        <SSeparator
          orientation="vertical"
          css={{ background: `rgba(${theme.rgbColors.white}, 0.06)` }}
        />
        <SItem>
          <Text color="basic400" fs={14}>
            {t("bond.maturity")}
          </Text>
          <Text color="white">{maturity}</Text>
        </SItem>
        {isActive && (
          <>
            <SSeparator
              orientation="vertical"
              css={{ background: `rgba(${theme.rgbColors.white}, 0.06)` }}
            />
            <SItem>
              <Text color="basic400" fs={14}>
                {t("bond.discount")}
              </Text>
              <Text color="white">
                {t("value.percentage", { value: discount })}
              </Text>
            </SItem>
          </>
        )}
      </div>

      {isActive && (
        <Button
          fullWidth
          onClick={onDetailClick}
          sx={{ mt: view === "card" ? 12 : [12, 0], maxWidth: ["none", 150] }}
        >
          {t("bond.btn")}
        </Button>
      )}
    </SBond>
  )
}
