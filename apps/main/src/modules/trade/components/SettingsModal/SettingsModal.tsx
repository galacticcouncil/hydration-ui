import {
  Collapsible,
  Flex,
  FormError,
  Input,
  Modal,
  ModalBody,
  Separator,
  SliderTabs,
  Text,
} from "@galacticcouncil/ui/components"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useTradeSettings } from "@/states/tradeSettings"

import { useSettingsValidation } from "./SettingsModal.utils"

type SettingsModalProps = {
  onOpenChange: (value: boolean) => void
}

type FormValues = {
  swap: string
  twap: string
}

const options = [
  { id: "0.5", label: "0.5%" },
  { id: "1", label: "1%" },
  { id: "3", label: "3%" },
]

export const SettingsModal = ({ onOpenChange }: SettingsModalProps) => {
  const { t } = useTranslation(["common", "wallet"])
  const { slippage, slippageTwap, setValue } = useTradeSettings()

  const {
    formState: { isDirty, isValid },
    getValues,
    control,
  } = useForm<FormValues>({
    defaultValues: { swap: slippage, twap: slippageTwap },
    mode: "onChange",
    resolver: zodResolver(useSettingsValidation()),
  })

  const handleClose = () => {
    const values = getValues()

    if (isDirty && isValid) {
      setValue("slippage", values.swap)
      setValue("slippageTwap", values.twap)
    }
  }

  return (
    <Modal
      open
      title={t("wallet:swap.settings.modal.title")}
      description={t("wallet:swap.settings.modal.description")}
      onOpenChange={(open) => {
        handleClose()
        onOpenChange(open)
      }}
    >
      <ModalBody sx={{ minHeight: ["auto", 400], pt: 0 }}>
        <Controller
          name="swap"
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <Collapsible
              label={t("wallet:swap.settings.modal.option.single")}
              trigger={t("hide")}
            >
              <Flex justify="space-between" align="start" py={4}>
                <Text fw={500} fs="p5" sx={{ mt: 10 }}>
                  {t("slippage")}
                </Text>

                <Flex align="start" gap={8}>
                  <SliderTabs
                    options={options}
                    selected={options.find((option) => option.id === value)?.id}
                    onSelect={(option) => onChange(option.id)}
                  />

                  <Input
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value

                      if (!isNaN(Number(value))) {
                        onChange(value)
                      }
                    }}
                    sx={{ width: 65 }}
                  />
                </Flex>
              </Flex>
              {error && (
                <FormError sx={{ textAlign: "end" }}>{error.message}</FormError>
              )}
            </Collapsible>
          )}
        />
        <Separator mx={-20} />
        <Controller
          name="twap"
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <Collapsible
              label={t("wallet:swap.settings.modal.option.split")}
              trigger={t("hide")}
            >
              <Flex justify="space-between" align="start" py={4}>
                <Text fw={500} fs="p5" sx={{ mt: 10 }}>
                  {t("slippage")}
                </Text>

                <Flex align="start" gap={8}>
                  <SliderTabs
                    options={options}
                    selected={options.find((option) => option.id === value)?.id}
                    onSelect={(option) => {
                      onChange(option.id)
                    }}
                  />

                  <Input
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value

                      if (!isNaN(Number(value))) {
                        onChange(value)
                      }
                    }}
                    sx={{ width: 65 }}
                  />
                </Flex>
              </Flex>
              {error && (
                <FormError sx={{ textAlign: "end" }}>{error.message}</FormError>
              )}
            </Collapsible>
          )}
        />
      </ModalBody>
    </Modal>
  )
}
