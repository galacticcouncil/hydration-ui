import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Slider,
  SliderTabs,
  Stack,
  Summary,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { useAssets } from "@/providers/assetsProvider"

import {
  useVoteModal,
  VOTE_TYPE_OPTIONS,
  VoteModalFormValues,
  VoteType,
} from "./VoteModal.utils"

const MULTIPLIER_LABELS = ["0.1x", "1x", "2x", "3x", "4x", "5x", "6x"]

type VoteFormProps = {
  referendumId: number
  open: boolean
  onClose: () => void
}

export const VoteModal = ({ open, onClose, referendumId }: VoteFormProps) => {
  const { t } = useTranslation("staking")

  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalHeader
        title={t("referenda.vote.modal.title")}
        description={t("referenda.vote.modal.description")}
        align="center"
      />
      <VoteForm referendumId={referendumId} />
    </Modal>
  )
}

const VoteForm = ({ referendumId }: Pick<VoteFormProps, "referendumId">) => {
  const { t } = useTranslation(["common", "staking"])
  const { native } = useAssets()
  const { form, totalHdxBalanceHuman, lockedDays, totaVotes, onSubmit } =
    useVoteModal(referendumId)

  const [voteType, multiplier] = form.watch(["voteType", "multiplier"])
  const showConvictionSlider = voteType === "aye" || voteType === "nay"

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ModalBody asChild>
          <Stack direction="column" gap="l">
            <Controller
              control={form.control}
              name="voteType"
              render={({ field: { value, onChange, disabled } }) => (
                <SliderTabs
                  options={VOTE_TYPE_OPTIONS}
                  selected={value}
                  onSelect={(option) => onChange(option.id)}
                  sx={{ flex: 1 }}
                  disabled={disabled}
                />
              )}
            />

            <ModalContentDivider />

            <AmountFields
              voteType={voteType}
              totalHdxBalanceHuman={totalHdxBalanceHuman}
            />

            {showConvictionSlider && (
              <>
                <ModalContentDivider />
                <Controller
                  control={form.control}
                  name="multiplier"
                  render={({ field }) => (
                    <Stack gap="m">
                      <Flex align="center" gap="xs" justify="space-between">
                        <Text
                          fs="p3"
                          fw={500}
                          lh={1}
                          color={getToken("text.high")}
                        >
                          {t("staking:referenda.vote.modal.multiplier")}
                        </Text>

                        <Flex align="center" gap="xs">
                          <Text fs="p5" fw={500}>
                            {multiplier || 0.1}x
                          </Text>

                          <Tooltip
                            asChild
                            text={t(
                              "staking:referenda.vote.modal.multiplier.tooltip",
                            )}
                          />
                        </Flex>
                      </Flex>

                      <Slider
                        min={0.1}
                        max={6}
                        step={1}
                        value={field.value}
                        onChange={field.onChange}
                      />

                      <Flex justify="space-between">
                        {MULTIPLIER_LABELS.map((label) => (
                          <Text
                            key={label}
                            fs="p6"
                            color={getToken("text.medium")}
                          >
                            {label}
                          </Text>
                        ))}
                      </Flex>
                    </Stack>
                  )}
                />
                <ModalContentDivider />
                <Summary
                  separator={<ModalContentDivider />}
                  rows={[
                    {
                      label: t("staking:referenda.vote.modal.totalVotes"),
                      content: t("currency", {
                        value: totaVotes,
                        symbol: native.symbol,
                      }),
                    },
                    {
                      label: t("staking:referenda.vote.modal.lockDuration"),
                      description: t(
                        "staking:referenda.vote.modal.lockDuration.description",
                      ),
                      content: t(
                        "staking:referenda.vote.modal.lockDuration.value",
                        {
                          value: lockedDays,
                        },
                      ),
                    },
                  ]}
                />
              </>
            )}
          </Stack>
        </ModalBody>

        <ModalContentDivider />

        <ModalFooter>
          <Button
            type="submit"
            size="large"
            width="100%"
            disabled={!form.formState.isValid}
          >
            {t("confirm")}
          </Button>
        </ModalFooter>
      </form>
    </FormProvider>
  )
}

const AmountFields = ({
  voteType,
  totalHdxBalanceHuman,
}: {
  voteType: VoteType
  totalHdxBalanceHuman: string
}) => {
  const { t } = useTranslation("staking")

  if (voteType === "split") {
    return (
      <Stack
        direction="column"
        gap="m"
        separated
        separator={<ModalContentDivider />}
      >
        <AssetSelectFormField<VoteModalFormValues>
          assetFieldName="asset"
          amountFieldName="aye"
          label={t("referenda.item.aye")}
          assets={[]}
          disabledAssetSelector
          maxBalance={totalHdxBalanceHuman}
          sx={{ p: 0 }}
        />
        <AssetSelectFormField<VoteModalFormValues>
          assetFieldName="asset"
          amountFieldName="nay"
          label={t("referenda.item.nay")}
          assets={[]}
          disabledAssetSelector
          maxBalance={totalHdxBalanceHuman}
          sx={{ p: 0 }}
        />
      </Stack>
    )
  }

  if (voteType === "abstain") {
    return (
      <Stack
        direction="column"
        gap="m"
        separated
        separator={<ModalContentDivider />}
      >
        <AssetSelectFormField<VoteModalFormValues>
          assetFieldName="asset"
          amountFieldName="aye"
          label={t("referenda.item.aye")}
          assets={[]}
          disabledAssetSelector
          maxBalance={totalHdxBalanceHuman}
          sx={{ p: 0 }}
        />
        <AssetSelectFormField<VoteModalFormValues>
          assetFieldName="asset"
          amountFieldName="nay"
          label={t("referenda.item.nay")}
          assets={[]}
          disabledAssetSelector
          maxBalance={totalHdxBalanceHuman}
          sx={{ p: 0 }}
        />
        <AssetSelectFormField<VoteModalFormValues>
          assetFieldName="asset"
          amountFieldName="abstain"
          label={t("referenda.item.abstain")}
          assets={[]}
          disabledAssetSelector
          maxBalance={totalHdxBalanceHuman}
          sx={{ p: 0 }}
        />
      </Stack>
    )
  }

  return (
    <AssetSelectFormField<VoteModalFormValues>
      assetFieldName="asset"
      amountFieldName="amount"
      label={
        voteType === "aye" ? t("referenda.item.aye") : t("referenda.item.nay")
      }
      assets={[]}
      disabledAssetSelector
      maxBalance={totalHdxBalanceHuman}
      sx={{ p: 0 }}
    />
  )
}
