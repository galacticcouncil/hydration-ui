import { ArrowLeftRight } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  MicroButton,
  Skeleton,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Pencil, X } from "lucide-react"
import { FC, MouseEvent, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  SCustomPill,
  SInlineAssetLogo,
  SInvertDenominationButton,
  SMarketButton,
  SMarketPrice,
  SPercentSuffix,
  SPillActions,
  SPillInlineInput,
  SPillSeparator,
  SPillSliceButton,
  SPillTrigger,
  SPriceInput,
} from "@/modules/trade/swap/components/QuotedPriceField/QuotedPriceField.styled"
import { QuotedPriceBinding } from "@/modules/trade/swap/lib/quotedPrice.hook"

const PRESET_STEPS = [1, 5, 10] as const

type Props = {
  readonly binding: QuotedPriceBinding
  readonly baseAssetId?: string
  readonly baseSymbol: string
  readonly quoteSymbol: string
  readonly marketLabel: string
  readonly isMarketLoading?: boolean
}

export const QuotedPriceField: FC<Props> = ({
  binding,
  baseAssetId,
  baseSymbol,
  quoteSymbol,
  marketLabel,
  isMarketLoading = false,
}) => {
  const { t } = useTranslation(["trade", "common"])
  const { view, dispatch } = binding

  const [isEditingPill, setIsEditingPill] = useState(false)
  const [lastPillValue, setLastPillValue] = useState("")
  const pillInputRef = useRef<HTMLInputElement>(null)

  const startEditingPill = () => {
    setIsEditingPill(true)
    setTimeout(() => pillInputRef.current?.focus(), 0)
  }

  const commitPill = (value: string) => {
    setIsEditingPill(false)
    dispatch({ type: "pct", value })
    setLastPillValue(value.trim())
  }

  const resetToMarket = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    event.preventDefault()
    setIsEditingPill(false)
    setLastPillValue("")
    dispatch({ type: "resetToMarket" })
  }

  const deviationPct = view.deviationPct ?? 0
  const deviationDisplay = t("common:percent", {
    value: deviationPct,
    prefix: deviationPct > 0 ? "+" : "",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const showResetAction = view.canReset && !isEditingPill
  const presetSign = view.inverted ? -1 : 1

  return (
    <Flex direction="column" gap="xs" py="l" sx={{ minWidth: 0 }}>
      <Flex justify="space-between" align="center">
        <Text as="div" fw={500} lh={1} fs="p5" color={getToken("text.medium")}>
          {t("trade:limit.rateLabel")}
        </Text>
        <Flex align="center" gap="xs">
          {!isEditingPill && (
            <>
              <Text
                fs="p6"
                color={getToken("text.low")}
                whiteSpace="nowrap"
                mr="s"
                display={["none", "block"]}
              >
                {t("trade:limit.vsMarket")}
              </Text>
              {PRESET_STEPS.map((step) => {
                const signedStep = step * presetSign

                return (
                  <MicroButton
                    key={step}
                    disabled={view.deviationPct === null}
                    onClick={() => {
                      dispatch({ type: "pct", value: String(signedStep) })
                      setLastPillValue(String(signedStep))
                    }}
                  >
                    {t("common:percent", {
                      value: signedStep,
                      signDisplay: "always",
                    })}
                  </MicroButton>
                )
              })}
            </>
          )}
          <SCustomPill
            isActive={isEditingPill}
            tone={
              deviationPct > 0
                ? "positive"
                : deviationPct < 0
                  ? "negative"
                  : "neutral"
            }
          >
            {isEditingPill ? (
              <>
                <SPillInlineInput
                  getInputRef={pillInputRef}
                  defaultValue={lastPillValue}
                  placeholder={t("common:number", {
                    value: deviationPct,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  onFocus={(e) => e.target.select()}
                  onValueChange={({ value }) =>
                    dispatch({ type: "pct", value })
                  }
                  onBlur={(e) => commitPill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      commitPill((e.target as HTMLInputElement).value)
                    }
                    if (e.key === "Escape") setIsEditingPill(false)
                  }}
                />
                <SPercentSuffix>%</SPercentSuffix>
              </>
            ) : (
              <>
                <SPillTrigger
                  type="button"
                  onClick={startEditingPill}
                  aria-label={t("trade:limit.deviation.editAria")}
                >
                  {deviationDisplay}
                </SPillTrigger>
                <SPillActions>
                  <SPillSeparator aria-hidden />
                  {showResetAction ? (
                    <SPillSliceButton
                      type="button"
                      onClick={resetToMarket}
                      aria-label={t("trade:limit.deviation.resetAria")}
                    >
                      <X />
                    </SPillSliceButton>
                  ) : (
                    <SPillSliceButton
                      type="button"
                      tabIndex={-1}
                      aria-hidden
                      onClick={(e) => {
                        e.preventDefault()
                        startEditingPill()
                      }}
                    >
                      <Pencil />
                    </SPillSliceButton>
                  )}
                </SPillActions>
              </>
            )}
          </SCustomPill>
        </Flex>
      </Flex>

      <Flex
        align="center"
        gap={["s", "base"]}
        py={["l", "s"]}
        sx={{ minWidth: 0 }}
      >
        <Tooltip size="small" text={t("trade:limit.invert")} asChild>
          <SInvertDenominationButton
            variant="tertiary"
            size="medium"
            outline
            onClick={() => dispatch({ type: "flipDenomination" })}
            aria-label={t("trade:limit.invert")}
          >
            <Icon
              component={ArrowLeftRight}
              size="m"
              color={getToken("icons.onContainer")}
              sx={{
                transform: view.inverted ? "scaleX(1)" : "scaleX(-1)",
                transition: getToken("transitions.transform"),
              }}
            />
          </SInvertDenominationButton>
        </Tooltip>
        <Flex
          align="center"
          flex={1}
          gap="s"
          justify="flex-end"
          sx={{ minWidth: 0 }}
        >
          <Flex
            asChild
            align="center"
            gap="0.25em"
            sx={{ minWidth: 0, flexShrink: 1, overflow: "hidden" }}
          >
            <Text
              as="div"
              fw={500}
              fs="p4"
              whiteSpace="nowrap"
              sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {baseAssetId ? (
                <SInlineAssetLogo id={baseAssetId} size="extra-small" />
              ) : null}
              {t("trade:limit.priceUnit", { symbol: baseSymbol })}
            </Text>
          </Flex>
          <SPriceInput
            variant="embedded"
            customSize="small"
            value={view.display}
            valueIsNumericString
            allowNegative={false}
            suffix={quoteSymbol ? ` ${quoteSymbol}` : undefined}
            onValueChange={({ value }, { source }) => {
              if (source === "prop") return
              dispatch({ type: "typed", value })
            }}
            placeholder={t("trade:limit.pricePlaceholder")}
          />
        </Flex>
      </Flex>

      <Flex
        justify="space-between"
        align="center"
        gap="s"
        sx={{ minHeight: "1.2em" }}
      >
        <Text fs="p6" color={getToken("text.low")} whiteSpace="nowrap">
          {t("trade:limit.fillsAtRateOrBetter")}
        </Text>
        {(view.marketDisplay || isMarketLoading) &&
          (view.marketDisplay ? (
            <SMarketButton
              type="button"
              onClick={() => dispatch({ type: "resetToMarket" })}
            >
              {marketLabel} <SMarketPrice>{view.marketDisplay}</SMarketPrice>
            </SMarketButton>
          ) : (
            <SMarketButton type="button">
              <Skeleton sx={{ width: "2xl" }} height="1em" />
            </SMarketButton>
          ))}
      </Flex>
    </Flex>
  )
}
