import {
  Box,
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
import { Trans, useTranslation } from "react-i18next"

import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { SLockedBalanceButton } from "@/modules/staking/components/VoteModal/VoteModal.styled"
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
  isGigaStaking?: boolean
}

export const VoteModal = ({
  open,
  onClose,
  referendumId,
  isGigaStaking,
}: VoteFormProps) => {
  const { t } = useTranslation("staking")

  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalHeader
        title={t("referenda.vote.modal.title")}
        description={t("referenda.vote.modal.description")}
        align="center"
      />
      <VoteForm
        referendumId={referendumId}
        onClose={onClose}
        isGigaStaking={isGigaStaking}
      />
    </Modal>
  )
}

const VoteForm = ({
  referendumId,
  onClose,
  isGigaStaking,
}: Pick<VoteFormProps, "referendumId" | "onClose" | "isGigaStaking">) => {
  const { t } = useTranslation(["common", "staking"])
  const { native } = useAssets()
  const {
    form,
    maxBalanceWithFee,
    lockedDays,
    totaVotes,
    onSubmit,
    governanceLocksHuman,
    allLocksHuman,
  } = useVoteModal(referendumId, onClose, isGigaStaking)

  const [voteType, multiplier] = form.watch(["voteType", "multiplier"])
  const isSingleInputField = voteType === "aye" || voteType === "nay"

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

            {!isSingleInputField && (
              <Box>
                <Flex
                  justify="space-between"
                  align="center"
                  pb={getToken("scales.paddings.base")}
                >
                  <Text fs="p5" fw={500} color={getToken("text.medium")}>
                    {t("staking:referenda.vote.modal.totalBalance")}
                  </Text>
                  <Text fs="p5" fw={500} color={getToken("text.low")}>
                    {t("currency", {
                      value: maxBalanceWithFee,
                      symbol: native.symbol,
                    })}
                  </Text>
                </Flex>
                <ModalContentDivider />
              </Box>
            )}

            <AmountFields
              voteType={voteType}
              maxBalanceWithFee={maxBalanceWithFee}
            />

            {isSingleInputField && (
              <>
                <Box>
                  <ModalContentDivider />
                  <Flex gap="base" justify="end" py="base">
                    <SLockedBalanceButton
                      variant="muted"
                      onClick={() =>
                        form.setValue("amount", governanceLocksHuman, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <Text fs="p6" fw={400} color={getToken("text.medium")}>
                        <Trans
                          t={t}
                          i18nKey="staking:referenda.vote.modal.reuseGovernanceLock"
                          values={{
                            value: governanceLocksHuman,
                            currency: native.symbol,
                          }}
                        >
                          <Text
                            as="span"
                            fw={500}
                            color={getToken("text.high")}
                          />
                        </Trans>
                      </Text>
                    </SLockedBalanceButton>
                    <SLockedBalanceButton
                      variant="muted"
                      onClick={() =>
                        form.setValue("amount", allLocksHuman, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <Text fs="p6" fw={400} color={getToken("text.medium")}>
                        <Trans
                          t={t}
                          i18nKey="staking:referenda.vote.modal.reuseAllLocks"
                          values={{
                            value: allLocksHuman,
                            currency: native.symbol,
                          }}
                        >
                          <Text
                            as="span"
                            fw={500}
                            color={getToken("text.high")}
                          />
                        </Trans>
                      </Text>
                    </SLockedBalanceButton>
                  </Flex>
                  <ModalContentDivider />
                </Box>

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
              </>
            )}
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
                      value: isSingleInputField ? lockedDays : 0,
                    },
                  ),
                },
              ]}
            />
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
  maxBalanceWithFee,
}: {
  voteType: VoteType
  maxBalanceWithFee: string
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
          ignoreBalance
          hideMaxBalanceAction
          sx={{ p: 0 }}
        />
        <AssetSelectFormField<VoteModalFormValues>
          assetFieldName="asset"
          amountFieldName="nay"
          label={t("referenda.item.nay")}
          assets={[]}
          disabledAssetSelector
          ignoreBalance
          hideMaxBalanceAction
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
          ignoreBalance
          hideMaxBalanceAction
          sx={{ p: 0 }}
        />
        <AssetSelectFormField<VoteModalFormValues>
          assetFieldName="asset"
          amountFieldName="nay"
          label={t("referenda.item.nay")}
          assets={[]}
          disabledAssetSelector
          ignoreBalance
          hideMaxBalanceAction
          sx={{ p: 0 }}
        />
        <AssetSelectFormField<VoteModalFormValues>
          assetFieldName="asset"
          amountFieldName="abstain"
          label={t("referenda.item.abstain")}
          assets={[]}
          disabledAssetSelector
          ignoreBalance
          hideMaxBalanceAction
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
      maxBalance={maxBalanceWithFee}
      sx={{ p: 0 }}
    />
  )
}
