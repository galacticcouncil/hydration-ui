import { PalletDemocracyReferendumInfo } from "@polkadot/types/lookup"
import { ReactComponent as LinkIcon } from "assets/icons/LinkPixeled.svg"
import { Separator } from "components/Separator/Separator"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { BN_0, BN_10, PARACHAIN_BLOCK_TIME } from "utils/constants"
import { SBar, SContainer, SHeader } from "./ReferendumCard.styled"
import { Icon } from "components/Icon/Icon"
import { useBestNumber } from "api/chain"
import { customFormatDuration } from "utils/formatting"

type Props = {
  id: string
  referendum: PalletDemocracyReferendumInfo
  type: "toast" | "staking"
  rpc: string
}

export const ReferendumCardRococo = ({ id, referendum, type, rpc }: Props) => {
  const { t } = useTranslation()

  const bestNumber = useBestNumber()

  const votes = useMemo(() => {
    if (!referendum.isOngoing)
      return { ayes: BN_0, nays: BN_0, percAyes: BN_0, percNays: BN_0 }

    const ayes = referendum.asOngoing.tally.ayes
      .toBigNumber()
      .div(BN_10.pow(12))
    const nays = referendum.asOngoing.tally.nays
      .toBigNumber()
      .div(BN_10.pow(12))

    const votesSum = ayes.plus(nays)

    let percAyes = BN_0
    let percNays = BN_0

    if (!votesSum.isZero()) {
      percAyes = ayes.div(votesSum).times(100)
      percNays = nays.div(votesSum).times(100)
    }

    return { ayes, nays, percAyes, percNays }
  }, [referendum])

  const isNoVotes = votes.percAyes.eq(0) && votes.percNays.eq(0)
  const diff = referendum.asOngoing.end
    .toBigNumber()
    .minus(bestNumber.data?.parachainBlockNumber.toBigNumber() ?? 0)
    .times(PARACHAIN_BLOCK_TIME)
    .toNumber()
  const endDate = customFormatDuration({ end: diff * 1000 })

  return (
    <SContainer
      type={type}
      href={`https://polkadot.js.org/apps/?rpc=wss%3A%2F%2F${rpc}#/democracy`}
      target="_blank"
      rel="noreferrer"
    >
      <SHeader>
        <div sx={{ flex: "row", align: "center", gap: 8 }}>
          <Text color="brightBlue200" fs={14} fw={500}>
            #{id.toString()}
          </Text>
          <Text color="brightBlue200" fs={12} fw={500}>
            {"//"}
          </Text>
          <Text color="basic500" fs={13} fw={500}>
            {endDate &&
              t(`duration.${endDate.isPositive ? "left" : "ago"}`, {
                duration: endDate.duration,
              })}
          </Text>
        </div>

        <Icon sx={{ color: "brightBlue300" }} icon={<LinkIcon />} />
      </SHeader>

      <Separator color="primaryA15Blue" opacity={0.35} sx={{ my: 16 }} />

      <Text color="basic100" fw={500}>
        For Rococo testnet, please participate in referenda through polkadot.js
        apps, please click on this tile
      </Text>

      <Spacer size={20} />

      <div sx={{ flex: "row", gap: 8 }}>
        {isNoVotes ? (
          <SBar variant="neutral" percentage={100} />
        ) : (
          <>
            {/*zero value of progress bar should be visible*/}
            <SBar
              variant="aye"
              percentage={votes.percAyes.eq(0) ? 2 : votes.percAyes.toNumber()}
            />
            <SBar
              variant="nay"
              percentage={votes.percNays.eq(0) ? 2 : votes.percNays.toNumber()}
            />
          </>
        )}
      </div>

      <Spacer size={4} />

      <div sx={{ flex: "row", justify: "space-between" }}>
        <Text
          color={votes.percAyes.eq(0) ? "darkBlue300" : "white"}
          fs={14}
          fw={600}
          tTransform="uppercase"
        >
          {t("toast.sidebar.referendums.aye")}
        </Text>
        <Text
          color={votes.percNays.eq(0) ? "darkBlue300" : "white"}
          fs={14}
          fw={600}
          tTransform="uppercase"
        >
          {t("toast.sidebar.referendums.nay")}
        </Text>
      </div>

      <Spacer size={4} />

      <div sx={{ flex: "row", justify: "space-between" }}>
        <Text color="darkBlue300" fs={11} fw={500}>
          {t("toast.sidebar.referendums.value", {
            value: votes.ayes,
            percent: votes.percAyes,
          })}
        </Text>
        <Text color="darkBlue300" fs={11} fw={500}>
          {t("toast.sidebar.referendums.value", {
            value: votes.nays,
            percent: votes.percNays,
          })}
        </Text>
      </div>
    </SContainer>
  )
}
