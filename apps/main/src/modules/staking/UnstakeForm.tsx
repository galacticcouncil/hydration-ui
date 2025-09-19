import { Button, Grid, Separator } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
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
}

export const UnstakeForm: FC<Props> = ({
  positionId,
  staked,
  votes,
  votesSuccess,
  isLoading,
}) => {
  const { t } = useTranslation(["common", "staking"])
  const { account } = useAccount()

  const { native } = useAssets()

  const unstakeMutation = useUnstake(positionId, votes, votesSuccess)

  const submitForm = () => unstakeMutation.mutate(staked)

  return (
    <>
      <AssetSelect
        sx={{ px: getTokenPx("containers.paddings.primary") }}
        label={t("staking:stake.unstake.amount")}
        assets={[]}
        selectedAsset={native}
        disabled
        value={staked}
        ignoreBalance
      />
      <Separator />
      {
        <Grid
          px={getTokenPx("containers.paddings.primary")}
          py={getTokenPx("containers.paddings.primary")}
        >
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
            <Web3ConnectButton variant="sliderTabActive" size="large" />
          )}
        </Grid>
      }
    </>
  )
}
