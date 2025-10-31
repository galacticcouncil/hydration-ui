import {
  Flex,
  MicroButton,
  Modal,
  ModalBody,
  ModalHeader,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { preventDefault } from "@galacticcouncil/utils"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useSaveFormOnChange } from "@/hooks/useSaveFormOnChange"
import { TradeSlippage } from "@/modules/trade/swap/components/SettingsModal/TradeSlippage"
import { liquidityLimitSchema, useTradeSettings } from "@/states/tradeSettings"

export enum TradeLimitType {
  Liquidity = "liquidity",
  Trade = "trade",
}

type TradeLimitRowProps = {
  type: TradeLimitType
}

export const TradeLimitRow = ({ type }: TradeLimitRowProps) => {
  const { t } = useTranslation(["common", "liquidity", "trade"])
  const [isEditing, setIsEditing] = useState(false)
  const { update, ...tradeSettings } = useTradeSettings()

  const isLiquidity = type === TradeLimitType.Liquidity

  const value = isLiquidity
    ? tradeSettings.liquidity.slippage
    : tradeSettings.swap.single.swapSlippage

  const form = useForm({
    mode: "onChange",
    defaultValues: { slippage: value },
    resolver: standardSchemaResolver(liquidityLimitSchema),
  })

  useSaveFormOnChange(form, ({ slippage }) => {
    if (isLiquidity) {
      update({ ...tradeSettings, liquidity: { slippage } })
    } else {
      update({
        ...tradeSettings,
        swap: { ...tradeSettings.swap, single: { swapSlippage: slippage } },
      })
    }
  })

  return (
    <>
      <SummaryRow
        label={t("tradeLimit")}
        content={
          <Flex align="center" gap={getTokenPx("containers.paddings.quint")}>
            <Text fs="p5" fw={500} color={getToken("text.high")}>
              {t("percent", { value })}
            </Text>
            <MicroButton variant="emphasis" onClick={() => setIsEditing(true)}>
              {t("edit")}
            </MicroButton>
          </Flex>
        }
      />

      <Modal open={isEditing} onOpenChange={setIsEditing}>
        <ModalHeader title={t("liquidity:liquidity.tradeLimit.title")} />
        <ModalBody sx={{ minHeight: ["auto", 400], pt: 0 }}>
          <form
            onSubmit={preventDefault}
            sx={{ mt: getTokenPx("containers.paddings.primary") }}
          >
            <Controller
              control={form.control}
              name="slippage"
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <TradeSlippage
                  slippage={value}
                  onSlippageChange={onChange}
                  helpTooltip={
                    isLiquidity
                      ? undefined
                      : t("trade:swap.settings.modal.single.slippage.help")
                  }
                  description={
                    isLiquidity
                      ? t("liquidity:liquidity.tradeLimit.description")
                      : t(
                          "trade:swap.settings.modal.single.slippage.description",
                        )
                  }
                  error={error?.message}
                />
              )}
            />
          </form>
        </ModalBody>
      </Modal>
    </>
  )
}
