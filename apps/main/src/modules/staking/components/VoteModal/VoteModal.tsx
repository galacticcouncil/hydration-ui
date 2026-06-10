import { Rocket } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Button,
  Flex,
  Icon,
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
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { CSSProperties } from "react"
import { Controller, FormProvider } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"

import {
  claimableVotingRewardsQuery,
  gigaAccountStakesQuery,
  useGigaStakeExchangeRate,
} from "@/api/gigaStake"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import {
  SClaimYieldPrompt,
  SLockedBalanceButton,
  SRewardMultiplierCard,
} from "@/modules/staking/components/VoteModal/VoteModal.styled"
import { useClaimAndCompound } from "@/modules/staking/gigaStaking/GigaHDXPosition.utils"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

import {
  useVoteModal,
  VOTE_TYPE_OPTIONS,
  VoteModalFormValues,
  VoteType,
} from "./VoteModal.utils"

const MULTIPLIER_LABELS = ["0.1x", "1x", "2x", "3x", "4x", "5x", "6x"]

const getMultiplierLabel = (multiplier: number) => `${multiplier || 0.1}x`
const getMultiplierProgress = (multiplier: number) =>
  Math.min(Math.max(multiplier / 6, 0), 1)

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
    totalHdxBalanceHuman,
    lockedDays,
    totalVotesWithMultiplier,
    onSubmit,
    governanceLocksHuman,
    allLocksHuman,
  } = useVoteModal(referendumId, onClose, isGigaStaking)

  const [voteType, multiplier] = form.watch(["voteType", "multiplier"])
  const isSingleInputField = voteType === "aye" || voteType === "nay"

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ModalBody scrollable={false} asChild>
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
                      value: totalHdxBalanceHuman,
                      symbol: native.symbol,
                    })}
                  </Text>
                </Flex>
                <ModalContentDivider />
              </Box>
            )}

            <AmountFields
              voteType={voteType}
              totalHdxBalanceHuman={totalHdxBalanceHuman}
            />

            <ClaimYieldPrompt />

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
                            {getMultiplierLabel(multiplier)}
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
                        min={0}
                        max={6}
                        step={1}
                        dashCount={12}
                        variant="accent"
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

                      <RewardMultiplierCard multiplier={multiplier} />
                    </Stack>
                  )}
                />
              </>
            )}
            <ModalContentDivider />
            <Summary
              separator={<ModalContentDivider />}
              sx={{
                ".vote-lock-duration-row > p:last-of-type": {
                  width: "75px",
                  textAlign: "right",
                },
              }}
              rows={[
                {
                  label: t("staking:referenda.vote.modal.totalVotes"),
                  content: t("currency", {
                    value: totalVotesWithMultiplier,
                    symbol: native.symbol,
                  }),
                },
                {
                  className: "vote-lock-duration-row",
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

const ClaimYieldPrompt = () => {
  const { t } = useTranslation(["staking", "common"])
  const { account } = useAccount()
  const rpc = useRpcProvider()
  const { native } = useAssets()
  const { data: exchangeRate } = useGigaStakeExchangeRate()
  const { data: accountStake } = useQuery(
    gigaAccountStakesQuery(rpc, account?.address ?? ""),
  )
  const { data: claimableRewards } = useQuery(
    claimableVotingRewardsQuery(rpc, account?.address ?? ""),
  )
  const claimMutation = useClaimAndCompound()

  if (!account?.address || !accountStake || !exchangeRate) {
    return null
  }

  const gigaHdxHuman = scaleHuman(accountStake.gigahdx, native.decimals)
  const stakedHdxHuman = Big(gigaHdxHuman).times(exchangeRate.toString())
  const principalHdxHuman = scaleHuman(accountStake.hdx, native.decimals)
  const accruedHdx = Big.max(stakedHdxHuman.minus(principalHdxHuman), 0)

  if (accruedHdx.lte("0.000001")) {
    return null
  }

  const pendingHdx = claimableRewards
    ? Big(scaleHuman(claimableRewards.pendingHdx, native.decimals))
    : Big(0)
  const allocReadyHdx = claimableRewards
    ? Big(scaleHuman(claimableRewards.allocReadyHdx, native.decimals))
    : Big(0)
  const claimableVotingRewards = pendingHdx.plus(allocReadyHdx)

  const onClaim = () => {
    // `useClaimAndCompound` fetches its own `unlockClasses` via
    // `accountUnlockClassesQuery` — no need to pass them in.
    claimMutation.mutate({
      allocReadyVotes: claimableRewards?.allocReadyVotes ?? [],
      accountAddress: account?.address ?? "",
      hasAccruedYield: true,
      hasClaimableRewards: claimableVotingRewards.gt("0.000001"),
    })
  }

  return (
    <SClaimYieldPrompt>
      <Text fs="p6" fw={400} color={getToken("text.medium")}>
        <Trans
          t={t}
          i18nKey="staking:referenda.vote.modal.claimYieldPrompt"
          values={{
            value: accruedHdx.toString(),
            symbol: native.symbol,
          }}
        >
          <Text as="span" fw={500} color={getToken("text.high")} />
        </Trans>
      </Text>

      <Button
        size="small"
        variant="secondary"
        disabled={claimMutation.isPending}
        onClick={onClaim}
      >
        {t("staking:referenda.vote.modal.claimYieldCta")}
      </Button>
    </SClaimYieldPrompt>
  )
}

const RewardMultiplierCard = ({ multiplier }: { multiplier: number }) => {
  const { t } = useTranslation("staking")
  const progress = getMultiplierProgress(multiplier)
  const motionIntensity = progress ** 1.6
  const electricDurationSeconds = Math.max(1.45, 6 - motionIntensity * 4.15)
  const displacementOffsetY = motionIntensity * -2.5
  const multiplierMotionStyle = {
    "--electric-progress": `${Math.round(progress * 100)}%`,
    "--electric-progress-number": progress,
    "--electric-duration": `${electricDurationSeconds}s`,
    "--electric-shake-duration": `${Math.max(
      0.32,
      1.2 - motionIntensity * 0.78,
    )}s`,
    "--electric-shake-distance": `${motionIntensity * 0.85}px`,
  } as CSSProperties

  return (
    <SRewardMultiplierCard
      align="center"
      justify="space-between"
      px="l"
      py="l"
      mt="m"
      style={multiplierMotionStyle}
    >
      <svg className="eb-svg" aria-hidden focusable="false">
        <defs>
          <filter
            id="vote-reward-turbulent-displace"
            colorInterpolationFilters="sRGB"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feTurbulence
              type="turbulence"
              baseFrequency="0.015"
              numOctaves="6"
              result="noise1"
              seed="1"
            />
            <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
              <animate
                attributeName="dy"
                values="700; 0"
                dur={`${electricDurationSeconds}s`}
                repeatCount="indefinite"
                calcMode="linear"
              />
            </feOffset>

            <feTurbulence
              type="turbulence"
              baseFrequency="0.015"
              numOctaves="6"
              result="noise2"
              seed="1"
            />
            <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
              <animate
                attributeName="dy"
                values="0; -700"
                dur={`${electricDurationSeconds}s`}
                repeatCount="indefinite"
                calcMode="linear"
              />
            </feOffset>

            <feTurbulence
              type="turbulence"
              baseFrequency="0.015"
              numOctaves="6"
              result="noise3"
              seed="2"
            />
            <feOffset in="noise3" dx="0" dy="0" result="offsetNoise3">
              <animate
                attributeName="dx"
                values="490; 0"
                dur={`${electricDurationSeconds}s`}
                repeatCount="indefinite"
                calcMode="linear"
              />
            </feOffset>

            <feTurbulence
              type="turbulence"
              baseFrequency="0.015"
              numOctaves="6"
              result="noise4"
              seed="2"
            />
            <feOffset in="noise4" dx="0" dy="0" result="offsetNoise4">
              <animate
                attributeName="dx"
                values="0; -490"
                dur={`${electricDurationSeconds}s`}
                repeatCount="indefinite"
                calcMode="linear"
              />
            </feOffset>

            <feComposite in="offsetNoise1" in2="offsetNoise2" result="part1" />
            <feComposite in="offsetNoise3" in2="offsetNoise4" result="part2" />
            <feBlend
              in="part1"
              in2="part2"
              mode="color-dodge"
              result="combinedNoise"
            />
            <feOffset
              in="SourceGraphic"
              dx="0"
              dy={displacementOffsetY}
              result="alignedBorder"
            />
            <feDisplacementMap
              in="alignedBorder"
              in2="combinedNoise"
              scale={2 + motionIntensity * 12}
              xChannelSelector="R"
              yChannelSelector="B"
            />
          </filter>
        </defs>
      </svg>

      <div className="eb-layers" aria-hidden>
        <div className="eb-border-outer">
          <div className="eb-main-border" />
        </div>
        <div className="eb-glow-1" />
        <div className="eb-glow-2" />
        <div className="eb-overlay-1" />
        <div className="eb-overlay-2" />
        <div className="eb-background-glow" />
      </div>

      <Flex className="eb-content" align="center" justify="space-between">
        <Text fs="p3" fw={500} color={getToken("text.high")}>
          {t("referenda.vote.modal.rewardMultiplier")}
        </Text>
        <Flex align="center" gap="s">
          <Text
            font="primary"
            fs="h6"
            fw={500}
            lh={1}
            color="var(--electric-border-color)"
          >
            {getMultiplierLabel(multiplier)}
          </Text>
          <span className="reward-rocket" aria-hidden>
            <Icon component={Rocket} size="l" />
          </span>
        </Flex>
      </Flex>
    </SRewardMultiplierCard>
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
      maxBalance={totalHdxBalanceHuman}
      sx={{ p: 0 }}
    />
  )
}
