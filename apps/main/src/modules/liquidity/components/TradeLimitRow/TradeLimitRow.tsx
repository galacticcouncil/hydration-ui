import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalHeader,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { preventDefault } from "@galacticcouncil/utils"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import * as z from "zod/v4"

import { useSaveFormOnChange } from "@/hooks/useSaveFormOnChange"
import { TradeSlippage } from "@/modules/trade/swap/components/SettingsModal/TradeSlippage"
import { liquidityLimitSchema, useTradeSettings } from "@/states/tradeSettings"

export enum TradeLimitType {
  Liquidity = "liquidity",
  Trade = "trade",
}

type TradeLimitRowProps = {
  type: TradeLimitType
  disabled?: boolean
}

export const TradeLimit = ({ type, disabled }: TradeLimitRowProps) => {
  const { t } = useTranslation(["liquidity", "trade"])
  const { update, ...tradeSettings } = useTradeSettings()

  const isLiquidity = type === TradeLimitType.Liquidity

  return (
    <TradeLimitEditor
      value={
        isLiquidity
          ? tradeSettings.liquidity.slippage
          : tradeSettings.swap.single.swapSlippage
      }
      onChange={(slippage) =>
        isLiquidity
          ? update({ ...tradeSettings, liquidity: { slippage } })
          : update({
              ...tradeSettings,
              swap: {
                ...tradeSettings.swap,
                single: { swapSlippage: slippage },
              },
            })
      }
      schema={liquidityLimitSchema}
      title={t("liquidity.tradeLimit.title")}
      helpTooltip={
        isLiquidity
          ? undefined
          : t("trade:swap.settings.modal.single.slippage.help")
      }
      description={
        isLiquidity ? t("liquidity.tradeLimit.description") : undefined
      }
      disabled={disabled}
    />
  )
}

type TradeLimitEditorProps = {
  value: number
  onChange: (slippage: number) => void
  schema: z.ZodType<{ slippage: number }, { slippage: number }>
  title: string
  options?: ReadonlyArray<number>
  helpTooltip?: string
  description?: string
  disabled?: boolean
}

/** A slippage value with an Edit button that opens the trade limit modal. */
export const TradeLimitEditor = ({
  value,
  onChange,
  schema,
  title,
  options,
  helpTooltip,
  description,
  disabled,
}: TradeLimitEditorProps) => {
  const { t } = useTranslation("common")
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm({
    mode: "onChange",
    defaultValues: { slippage: value },
    resolver: standardSchemaResolver(schema),
  })

  useSaveFormOnChange(form, ({ slippage }) => onChange(slippage))

  return (
    <>
      <Flex align="center" gap="s">
        <Text fs="p5" fw={500} color={getToken("text.high")}>
          {t("percent", { value })}
        </Text>
        <Button
          size="micro"
          uppercase
          outline
          variant="accent"
          onClick={() => setIsEditing(true)}
          disabled={disabled}
        >
          {t("edit")}
        </Button>
      </Flex>

      <Modal open={isEditing} onOpenChange={setIsEditing}>
        <ModalHeader title={title} />
        <ModalBody sx={{ minHeight: ["auto", 400], pt: 0 }}>
          <form onSubmit={preventDefault} sx={{ mt: "xxl" }}>
            <Controller
              control={form.control}
              name="slippage"
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <TradeSlippage
                  slippage={value}
                  options={options}
                  onSlippageChange={onChange}
                  helpTooltip={helpTooltip}
                  description={description}
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

export const TradeLimitRow = ({ type }: TradeLimitRowProps) => {
  const { t } = useTranslation(["common"])

  return (
    <SummaryRow label={t("tradeLimit")} content={<TradeLimit type={type} />} />
  )
}
