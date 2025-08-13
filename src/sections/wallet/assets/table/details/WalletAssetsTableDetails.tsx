import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { ChainLogo } from "components/AssetIcon/AssetIcon"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { SContainer, SLocksContainer } from "./WalletAssetsTableDetails.styled"
import {
  AssetsTableData,
  useLockedNativeTokens,
  useUnlockableTokens,
  useUnlockTokens,
} from "sections/wallet/assets/table/data/WalletAssetsTableData.utils"
import BN from "bignumber.js"
import { Button } from "components/Button/Button"
import { Separator } from "components/Separator/Separator"
import { BN_NAN } from "utils/constants"
import { createToastMessages } from "state/toasts"
import Skeleton from "react-loading-skeleton"
import { AnyParachain } from "@galacticcouncil/xcm-core"
import { isAnyParachain } from "utils/helpers"
import { AssetTableName } from "components/AssetTableName/AssetTableName"
import { WalletAssetsTableActions } from "sections/wallet/assets/table/actions/WalletAssetsTableActions"
import { useMedia } from "react-use"
import { theme } from "theme"
import { useAssets } from "providers/assets"
import { TableData } from "components/Table/Table.styled"
import BigNumber from "bignumber.js"

const chains = Array.from(chainsMap.values())

const openGovIds = [
  {
    voteId: "92",
    classId: "0",
  },
  {
    voteId: "97",
    classId: "0",
  },
  {
    voteId: "101",
    classId: "0",
  },
  {
    voteId: "104",
    classId: "0",
  },
  {
    voteId: "105",
    classId: "0",
  },
  {
    voteId: "109",
    classId: "0",
  },
  {
    voteId: "119",
    classId: "0",
  },
  {
    voteId: "121",
    classId: "0",
  },
  {
    voteId: "125",
    classId: "0",
  },
  {
    voteId: "127",
    classId: "0",
  },
  {
    voteId: "133",
    classId: "0",
  },
  {
    voteId: "117",
    classId: "2",
  },
  {
    voteId: "123",
    classId: "4",
  },
  {
    voteId: "90",
    classId: "8",
  },
  {
    voteId: "98",
    classId: "8",
  },
  {
    voteId: "100",
    classId: "8",
  },
  {
    voteId: "102",
    classId: "8",
  },
  {
    voteId: "103",
    classId: "8",
  },
  {
    voteId: "128",
    classId: "8",
  },
  {
    voteId: "129",
    classId: "8",
  },
  {
    voteId: "130",
    classId: "8",
  },
  {
    voteId: "131",
    classId: "8",
  },
  {
    voteId: "94",
    classId: "6",
  },
  {
    voteId: "113",
    classId: "6",
  },
  {
    voteId: "114",
    classId: "6",
  },
  {
    voteId: "138",
    classId: "6",
  },
  {
    voteId: "95",
    classId: "5",
  },
  {
    voteId: "108",
    classId: "5",
  },
  {
    voteId: "112",
    classId: "5",
  },
  {
    voteId: "118",
    classId: "5",
  },
  {
    voteId: "124",
    classId: "5",
  },
  {
    voteId: "134",
    classId: "5",
  },
  {
    voteId: "135",
    classId: "5",
  },
  {
    voteId: "136",
    classId: "5",
  },
  {
    voteId: "87",
    classId: "7",
  },
  {
    voteId: "96",
    classId: "9",
  },
  {
    voteId: "89",
    classId: "1",
  },
  {
    voteId: "107",
    classId: "1",
  },
  {
    voteId: "110",
    classId: "1",
  },
  {
    voteId: "115",
    classId: "1",
  },
  {
    voteId: "120",
    classId: "1",
  },
  {
    voteId: "122",
    classId: "1",
  },
  {
    voteId: "126",
    classId: "1",
  },
  {
    voteId: "137",
    classId: "1",
  },
  {
    voteId: "139",
    classId: "1",
  },
  {
    voteId: "139",
    classId: "1",
  },
]

export const WalletAssetsTableDetails = ({
  reserved,
  reservedDisplay,
  id,
}: AssetsTableData) => {
  const { native } = useAssets()

  const isNativeAsset = id === native.id

  if (isNativeAsset)
    return (
      <NativeAssetDetails
        reserved={reserved}
        reservedDisplay={reservedDisplay}
      />
    )

  return (
    <AssetDetails
      reserved={reserved}
      reservedDisplay={reservedDisplay}
      id={id}
    />
  )
}

const NativeAssetDetails = ({
  reserved,
  reservedDisplay,
}: {
  reserved: string
  reservedDisplay?: string
}) => {
  const { t } = useTranslation()
  const lockedTokens = useLockedNativeTokens()
  const unlocable = useUnlockableTokens()

  const unlockedIdsAmount = unlocable.ids.length + openGovIds.length
  const isUnlockDisabled = !unlockedIdsAmount && unlocable.unlockedValue === "0"

  const toast = createToastMessages(
    `wallet.assets.table.details.${unlocable.unlockedValue === "0" ? "clear" : "unlock"}`,
    {
      t,
      tOptions: {
        amount: unlockedIdsAmount,
        value: BigNumber(unlocable.unlockedValue),
      },
    },
  )

  const unlock = useUnlockTokens({
    ids: unlocable.ids,
    openGovIds,
    toast,
  })

  const title = !unlockedIdsAmount
    ? t("wallet.assets.table.details.unlock")
    : t("wallet.assets.table.details.clear")

  return (
    <SContainer hasChain={false} isNativeAsset>
      <div>
        <Text fs={14} lh={14} fw={500} color="basic300">
          {t("wallet.assets.table.details.lockedStaking")}
        </Text>
        <Text fs={16} lh={18} fw={400} color="white" sx={{ mt: 4 }}>
          {lockedTokens.isLoading ? (
            <Skeleton height={14} width={30} />
          ) : (
            t("value.token", { value: lockedTokens.lockStaking })
          )}
        </Text>
        <Text fs={11} lh={14} fw={500} color="whiteish500">
          {lockedTokens.isLoading ? (
            <Skeleton height={10} width={20} />
          ) : (
            <DisplayValue value={lockedTokens.lockStakingDisplay} />
          )}
        </Text>
      </div>
      <div>
        <Text fs={14} lh={14} fw={500} color="basic300">
          {t("wallet.assets.table.details.lockedDemocracy")}
        </Text>
        <Text fs={16} lh={18} fw={400} color="white" sx={{ mt: 4 }}>
          {lockedTokens.isLoading ? (
            <Skeleton height={14} width={30} />
          ) : (
            t("value.token", { value: lockedTokens.lockDemocracy })
          )}
        </Text>
        <Text fs={11} lh={14} fw={500} color="whiteish500">
          {lockedTokens.isLoading ? (
            <Skeleton height={10} width={20} />
          ) : (
            <DisplayValue value={lockedTokens.lockDemocracyDisplay} />
          )}
        </Text>
        {unlocable.endDate ? (
          <SLocksContainer sx={{ width: "fit-content" }}>
            <Text fs={11} lh={15} color="darkBlue200">
              {t("wallet.assets.table.details.expiring", {
                duration: unlocable.endDate,
              })}
            </Text>
          </SLocksContainer>
        ) : null}
      </div>
      <div
        sx={{ flex: "row", justify: "space-between", align: "center", gap: 4 }}
      >
        <div>
          <Text fs={14} lh={14} fw={500} color="basic300">
            {t("wallet.assets.table.details.unlockable")}
          </Text>

          <Text fs={16} lh={18} fw={400} color="white" sx={{ mt: 4 }}>
            {unlocable.isLoading ? (
              <Skeleton height={14} width={30} />
            ) : (
              t("value.token", {
                value: BigNumber(unlocable.unlockedValue),
              })
            )}
          </Text>
          <Text fs={11} lh={14} fw={500} color="whiteish500">
            {unlocable.isLoading ? (
              <Skeleton height={10} width={20} />
            ) : (
              <DisplayValue value={BigNumber(unlocable.unlockedDisplayValue)} />
            )}
          </Text>
          {unlockedIdsAmount ? (
            <SLocksContainer>
              <Text fs={11} lh={15} color="darkBlue200">
                {t("wallet.assets.table.details.expired", {
                  count: unlockedIdsAmount,
                })}
              </Text>
            </SLocksContainer>
          ) : null}
        </div>

        <Button
          variant="primary"
          size="compact"
          disabled={isUnlockDisabled || unlock.isLoading}
          onClick={() => unlock.mutate()}
          isLoading={unlock.isLoading}
        >
          {title}
        </Button>
      </div>
      <div css={{ gridColumn: "1/4", height: 1 }}>
        <Separator color="alpha0" opacity={0.06}>
          <p />
        </Separator>
      </div>
      <div>
        <Text fs={14} lh={14} fw={500} color="basic300">
          {t("wallet.assets.table.details.lockedReferenda")}
        </Text>
        <Text fs={16} lh={18} fw={400} color="white" sx={{ mt: 4 }}>
          {t("value.token", { value: lockedTokens.lockOpenGov })}
        </Text>
        <Text fs={11} lh={14} fw={500} color="whiteish500">
          <DisplayValue value={lockedTokens.lockOpenGovDisplay} />
        </Text>
        {unlocable.openGovEndDate ? (
          <SLocksContainer sx={{ width: "fit-content" }}>
            <Text fs={11} lh={15} color="darkBlue200">
              {t("wallet.assets.table.details.expiring", {
                duration: unlocable.openGovEndDate,
              })}
            </Text>
          </SLocksContainer>
        ) : null}
      </div>
      <div>
        <Text fs={14} lh={14} fw={500} color="basic300">
          {t("wallet.assets.table.details.reserved")}
        </Text>
        <Text fs={16} lh={18} fw={400} color="white" sx={{ mt: 4 }}>
          {t("value.token", { value: BN(reserved) })}
        </Text>
        <Text fs={11} lh={14} fw={500} color="whiteish500">
          <DisplayValue value={BN(reservedDisplay ?? BN_NAN)} />
        </Text>
      </div>
      <div>
        <Text fs={14} lh={14} fw={500} color="basic300">
          {t("wallet.assets.table.details.lockedVesting")}
        </Text>
        <Text fs={16} lh={18} fw={400} color="white" sx={{ mt: 4 }}>
          {lockedTokens.isLoading ? (
            <Skeleton height={14} width={30} />
          ) : (
            t("value.token", { value: lockedTokens.lockVesting })
          )}
        </Text>
        <Text fs={11} lh={14} fw={500} color="whiteish500">
          {lockedTokens.isLoading ? (
            <Skeleton height={10} width={20} />
          ) : (
            <DisplayValue value={lockedTokens.lockVestingDisplay} />
          )}
        </Text>
      </div>
    </SContainer>
  )
}

const AssetDetails = ({
  reserved,
  reservedDisplay,
  id,
}: {
  reserved: string
  reservedDisplay?: string
  id: string
}) => {
  const { t } = useTranslation()
  const { getAsset } = useAssets()

  const origin = useMemo(() => {
    const assetDetails = getAsset(id)

    if (!assetDetails) return undefined

    const chain = chains.find(
      (chain) =>
        isAnyParachain(chain) &&
        chain.parachainId === Number(assetDetails.parachainId),
    ) as AnyParachain

    if (!chain) return undefined

    return {
      chain: chain.parachainId,
      name: chain.name,
      symbol: assetDetails.symbol,
    }
  }, [getAsset, id])

  return (
    <SContainer hasChain={!!origin} isNativeAsset={false}>
      {origin && (
        <div>
          <Text fs={14} lh={14} fw={500} color="basic300">
            {t("wallet.assets.table.details.origin")}
          </Text>
          <div sx={{ flex: "row", gap: 4, mt: 12 }}>
            <Icon size={18} icon={<ChainLogo id={origin.chain} />} />
            <Text fs={14} color="white">
              {origin.name}
            </Text>
          </div>
        </div>
      )}
      <div>
        <Text fs={14} lh={14} fw={500} color="basic300">
          {t("wallet.assets.table.details.reserved")}
        </Text>
        <Text fs={16} lh={18} fw={400} color="white">
          {t("value.token", { value: BN(reserved) })}
        </Text>
        <Text fs={11} lh={14} fw={500} color="whiteish500">
          <DisplayValue value={BN(reservedDisplay ?? BN_NAN)} />
        </Text>
      </div>
    </SContainer>
  )
}

export const ExternalAssetRow = ({
  row,
  type,
}: {
  row: AssetsTableData
  type: "unknown" | "changed"
}) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  return (
    <>
      <TableData colSpan={isDesktop ? 1 : 2}>
        <AssetTableName {...row} />
      </TableData>
      {isDesktop && (
        <TableData colSpan={2}>
          <>
            <Text
              fs={13}
              color={type === "changed" ? "warningOrange200" : "whiteish500"}
            >
              {type === "changed"
                ? t("wallet.assets.table.addToken.changed")
                : t("wallet.assets.table.addToken.unknown")}
            </Text>
          </>
        </TableData>
      )}
      {isDesktop && (
        <TableData>
          <WalletAssetsTableActions
            toggleExpanded={() => null}
            isExpanded={false}
            onTransferClick={() => null}
            asset={row}
          />
        </TableData>
      )}
    </>
  )
}
