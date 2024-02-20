import { InterestRate } from "@aave/contract-helpers"
import ChevronDown from "assets/icons/ChevronDown.svg?react"
import CheckIcon from "assets/icons/CheckIcon.svg?react"
import LinkIcon from "assets/icons/LinkIcon.svg?react"
import { ButtonTransparent } from "components/Button/Button"
import { Dropdown } from "components/Dropdown/Dropdown"
import { Text } from "components/Typography/Text/Text"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { CustomMarket } from "sections/lending/ui-config/marketsConfig"

interface ListItemAPYButtonProps {
  stableBorrowRateEnabled: boolean
  borrowRateMode: string
  disabled: boolean
  onClick: () => void
  stableBorrowAPY: string
  variableBorrowAPY: string
  underlyingAsset: string
  currentMarket: CustomMarket
}

const PERCENTAGE_THRESHOLD = 0.01
const PercentageValue: FC<{ value: number }> = ({ value }) => {
  const { t } = useTranslation()
  const belowThreshold = value < PERCENTAGE_THRESHOLD
  return (
    <>
      {belowThreshold && <span sx={{ color: "basic300" }}>{"<"}</span>}
      {t("value.percentage", {
        value: belowThreshold ? PERCENTAGE_THRESHOLD : value,
      })}
    </>
  )
}

export const APYTypeButtonColumn = ({
  stableBorrowRateEnabled,
  borrowRateMode,
  disabled,
  onClick,
  stableBorrowAPY,
  variableBorrowAPY,
  underlyingAsset,
  currentMarket,
}: ListItemAPYButtonProps) => {
  const items = useMemo(() => {
    const items = disabled
      ? []
      : [
          {
            icon: <CheckIcon width={12} height={12} />,
            key: InterestRate.Variable,
            label: (
              <span>
                <span>APY, variable</span> -{" "}
                <PercentageValue value={Number(variableBorrowAPY) * 100} />
              </span>
            ),
          },
          {
            icon: <CheckIcon width={12} height={12} />,
            key: InterestRate.Stable,
            label: (
              <span>
                <span>APY, stable</span> -{" "}
                <PercentageValue value={Number(stableBorrowAPY) * 100} />
              </span>
            ),
          },
        ]

    return items.map((item) => ({
      ...item,
      icon:
        borrowRateMode === item.key ? (
          <CheckIcon width={12} height={12} />
        ) : (
          <span sx={{ width: 12, height: 12, display: "block" }} />
        ),
    }))
  }, [borrowRateMode, disabled, stableBorrowAPY, variableBorrowAPY])

  return (
    <div css={{ display: "inline-flex" }}>
      <Dropdown
        asChild
        onSelect={(key) => {
          if (key.key !== borrowRateMode) {
            onClick()
          }
        }}
        items={items}
        header={
          <Text
            fs={12}
            color="pink100"
            sx={{ p: 10 }}
            css={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            Select APY type to switch
          </Text>
        }
        footer={
          <Text fs={14} css={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <a
              target="_blank"
              href={ROUTES.reserveOverview(underlyingAsset, currentMarket)}
              rel="noreferrer"
              sx={{ p: 10, flex: "row", align: "center", gap: 4 }}
            >
              See charts <LinkIcon width={12} height={12} />
            </a>
          </Text>
        }
      >
        <ButtonTransparent
          disabled
          sx={{ color: disabled ? "basic500" : "white" }}
          css={{
            '&[data-state="open"] > svg': { rotate: "180deg" },
            border: disabled ? "none" : "1px solid rgba(255, 255, 255, 0.2)",
            cursor: disabled ? "auto" : "pointer!important",
            padding: disabled ? 0 : "2px 6px",
            borderRadius: 4,
          }}
        >
          {borrowRateMode}
          {stableBorrowRateEnabled && <ChevronDown width={20} height={20} />}
        </ButtonTransparent>
      </Dropdown>
    </div>
  )
}
