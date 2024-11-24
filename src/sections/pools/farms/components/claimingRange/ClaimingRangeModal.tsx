import { Modal } from "components/Modal/Modal"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { DEFAULT_VALUE, useClaimingRange } from "./claimingRange.utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import BN from "bignumber.js"
import { Input } from "components/Input/Input"
import { SErrorMessage } from "components/AddressInput/AddressInput.styled"
import { Button } from "components/Button/Button"
import { required } from "utils/validators"
import { z } from "zod"
import { SInputContainer } from "./ClaimingRangeModal.styled"
import { BoxSwitch } from "components/BoxSwitch/BoxSwitch"

type ClaimingRangeModalProps = {
  onClose: () => void
}

const MIN_VALUE = 1
const MAX_VALUE = 99

export const ClaimingRangeModal = ({ onClose }: ClaimingRangeModalProps) => {
  const { t } = useTranslation()
  const { range, update } = useClaimingRange()

  const form = useForm<{
    value: string
  }>({
    mode: "onChange",
    defaultValues: { value: BN(range).times(100).toString() },
    resolver: zodResolver(
      z.object({
        value: required
          .refine((value) => BN(value).lte(MAX_VALUE), {
            message: t("claimingRange.modal.validation.max", {
              value: MAX_VALUE,
            }),
          })
          .refine((value) => BN(value).gte(MIN_VALUE), {
            message: t("claimingRange.modal.validation.min", {
              value: MIN_VALUE,
            }),
          }),
      }),
    ),
  })

  return (
    <Modal
      open
      onClose={onClose}
      title={t("claimingRange.modal.title")}
      description={t("claimingRange.modal.description")}
    >
      <form
        onSubmit={form.handleSubmit(({ value }) => {
          update(BN(value).div(100).toString())
          onClose()
        })}
        sx={{ flex: "column", justify: "space-between", gap: 20 }}
        autoComplete="off"
      >
        <Controller
          name="value"
          control={form.control}
          render={({
            field: { name, value, onChange },
            fieldState: { error },
          }) => (
            <SInputContainer>
              <Text color="whiteish500" tTransform="uppercase" fs={12}>
                {t("claimingRange.modal.input.label")}
              </Text>
              <div sx={{ flex: "row", gap: 6 }} css={{ position: "relative" }}>
                <BoxSwitch
                  options={[
                    {
                      label: t("claimingRange.modal.input.value", {
                        value: DEFAULT_VALUE,
                      }),
                      value: DEFAULT_VALUE,
                    },
                  ]}
                  selected={Number(value)}
                  onSelect={(value) => onChange(value.toString())}
                  css={{ "--btn-width": "150px" }}
                />
                <div sx={{ flexGrow: 1 }}>
                  <Input
                    value={value}
                    onChange={onChange}
                    name={name}
                    label={t("custom")}
                    placeholder={t("custom")}
                    unit="%"
                  />
                </div>
              </div>
              {error && (
                <SErrorMessage css={{ textAlign: "end", marginTop: -4 }}>
                  {error.message}
                </SErrorMessage>
              )}
            </SInputContainer>
          )}
        />

        <Text fs={14} color="basic400">
          {t("claimingRange.modal.description1")}
        </Text>

        <Text fs={14} color="basic400">
          {t("claimingRange.modal.description2")}
        </Text>

        <div
          sx={{
            flex: "row",
            justify: "space-between",
            gap: 20,
            mt: 16,
          }}
        >
          <Button variant="secondary" type="button" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            disabled={
              !!form.formState.errors.value || !form.formState.dirtyFields.value
            }
          >
            {t("claimingRange.modal.button")}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
