import { Button, Grid, Separator } from "@galacticcouncil/ui/components"
import { useAccount, Web3ConnectButton } from "@galacticcouncil/web3-connect"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { TAccountVote } from "@/api/democracy"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { useUnstake } from "@/modules/staking/Stake.unstake"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly positionId: bigint
  readonly staked: string
  readonly votes: ReadonlyArray<TAccountVote>
  readonly votesSuccess: boolean
  readonly isLoading: boolean
  readonly onUnstake: () => void
}

export const UnstakeForm: FC<Props> = ({
  positionId,
  staked,
  votes,
  votesSuccess,
  isLoading,
  onUnstake,
}) => {
  const { t } = useTranslation(["common", "staking"])
  const { account } = useAccount()

  const { native } = useAssets()

  const unstakeMutation = useUnstake(positionId, votes, votesSuccess)

  const submitForm = () =>
    unstakeMutation.mutate(staked, {
      onSuccess: onUnstake,
    })

  return (
    <>
      <AssetSelect
        sx={{ px: "xl" }}
        label={t("staking:stake.unstake.amount")}
        assets={[]}
        selectedAsset={native}
        disabled
        value={staked}
        ignoreBalance
      />
      <Separator />
      {
        <Grid px="xl" py="xl">
          {account ? (
            <Button
              variant="secondary"
              size="large"
              disabled={isLoading}
              onClick={submitForm}
            >
              {t("staking:stake.unstake.cta")}
            </Button>
          ) : (
            <Web3ConnectButton variant="secondary" size="large" />
          )}
        </Grid>
      }
    </>
  )
}
