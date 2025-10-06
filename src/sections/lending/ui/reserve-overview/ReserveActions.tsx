import { InterestRate } from "@aave/contract-helpers"
import {
  BigNumberValue,
  USD_DECIMALS,
  valueToBigNumber,
} from "@aave/math-utils"
import WalletIcon from "assets/icons/WalletIcon.svg?react"
import BigNumber from "bignumber.js"
import { Alert } from "components/Alert"
import { Button } from "components/Button/Button"
import { DataValue } from "components/DataValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useShallow } from "hooks/useShallow"
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import {
  ComputedReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useWalletBalances } from "sections/lending/hooks/app-data-provider/useWalletBalances"
import { useModalContext } from "sections/lending/hooks/useModal"
import { usePermissions } from "sections/lending/hooks/usePermissions"
import { useReserveActionState } from "sections/lending/hooks/useReserveActionState"
import { useWeb3Context } from "sections/lending/libs/hooks/useWeb3Context"
import { ReserveActionsSkeleton } from "sections/lending/skeleton/LendingReserveOverviewSkeleton"
import { useRootStore } from "sections/lending/store/root"
import {
  CustomMarket,
  MarketDataType,
  marketsData,
} from "sections/lending/ui-config/marketsConfig"
import {
  BaseNetworkConfig,
  networkConfigs,
} from "sections/lending/ui-config/networksConfig"
import {
  getMaxAmountAvailableToBorrow,
  getMaxGhoMintAmount,
} from "sections/lending/utils/getMaxAmountAvailableToBorrow"
import { getMaxAmountAvailableToSupply } from "sections/lending/utils/getMaxAmountAvailableToSupply"
import { amountToUsd } from "sections/lending/utils/utils"
import { Web3ConnectModalButton } from "sections/web3-connect/modal/Web3ConnectModalButton"
import { theme } from "theme"

export const getMarketInfoById = (marketId: CustomMarket) => {
  const market: MarketDataType = marketsData[marketId as CustomMarket]
  const network: BaseNetworkConfig = networkConfigs[market.chainId]

  return { market, network }
}

const amountToUSD = (
  amount: BigNumberValue,
  formattedPriceInMarketReferenceCurrency: string,
  marketReferencePriceInUsd: string,
) => {
  return valueToBigNumber(amount)
    .multipliedBy(formattedPriceInMarketReferenceCurrency)
    .multipliedBy(marketReferencePriceInUsd)
    .shiftedBy(-USD_DECIMALS)
    .toString()
}

interface ReserveActionsProps {
  reserve: ComputedReserveData
}

export const ReserveActions = ({ reserve }: ReserveActionsProps) => {
  const selectedAsset = reserve.symbol

  const { currentAccount } = useWeb3Context()
  const { isPermissionsLoading } = usePermissions()
  const { openBorrow, openSupply } = useModalContext()
  const currentMarket = useRootStore((store) => store.currentMarket)

  const currentMarketData = useRootStore((store) => store.currentMarketData)
  const {
    ghoReserveData,
    user,
    loading: loadingReserves,
    marketReferencePriceInUsd,
  } = useAppDataContext()
  const { walletBalances, loading: loadingWalletBalance } =
    useWalletBalances(currentMarketData)

  const [minRemainingBaseTokenBalance, displayGho] = useRootStore(
    useShallow((store) => [
      store.poolComputed.minRemainingBaseTokenBalance,
      store.displayGho,
    ]),
  )
  let balance = walletBalances[reserve.underlyingAsset]

  let maxAmountToBorrow = "0"
  let maxAmountToSupply = "0"
  const isGho = displayGho({ symbol: reserve.symbol, currentMarket })

  if (isGho) {
    const maxMintAmount = getMaxGhoMintAmount(user, reserve)
    maxAmountToBorrow = BigNumber.min(
      maxMintAmount,
      valueToBigNumber(ghoReserveData.aaveFacilitatorRemainingCapacity),
    ).toString()
    maxAmountToSupply = "0"
  } else {
    maxAmountToBorrow = getMaxAmountAvailableToBorrow(
      reserve,
      user,
      InterestRate.Variable,
    ).toString()

    maxAmountToSupply = getMaxAmountAvailableToSupply(
      balance?.amount || "0",
      reserve,
      reserve.underlyingAsset,
      minRemainingBaseTokenBalance,
    ).toString()
  }

  const maxAmountToBorrowUsd = amountToUsd(
    maxAmountToBorrow,
    reserve.formattedPriceInMarketReferenceCurrency,
    marketReferencePriceInUsd,
  ).toString()

  const maxAmountToSupplyUsd = amountToUSD(
    maxAmountToSupply,
    reserve.formattedPriceInMarketReferenceCurrency,
    marketReferencePriceInUsd,
  ).toString()

  const { disableSupplyButton, disableBorrowButton, alerts } =
    useReserveActionState({
      balance: balance?.amount || "0",
      maxAmountToSupply: maxAmountToSupply.toString(),
      maxAmountToBorrow: maxAmountToBorrow.toString(),
      reserve,
    })

  if (!currentAccount && !isPermissionsLoading) {
    return <ConnectWallet />
  }

  if (loadingReserves || loadingWalletBalance) {
    return <ReserveActionsSkeleton />
  }

  const onSupplyClicked = () => {
    openSupply(reserve.underlyingAsset)
  }

  const { market } = getMarketInfoById(currentMarket)

  return (
    <PaperWrapper>
      <WalletBalance
        balance={balance.amount}
        symbol={selectedAsset}
        marketTitle={market.marketTitle}
      />
      {reserve.isFrozen || reserve.isPaused ? (
        <div sx={{ mt: 12 }}>
          {reserve.isPaused ? <PauseWarning /> : <FrozenWarning />}
        </div>
      ) : (
        <>
          <div sx={{ flex: "column", gap: 20 }}>
            {!isGho && (
              <SupplyAction
                reserve={reserve}
                value={maxAmountToSupply.toString()}
                usdValue={maxAmountToSupplyUsd}
                symbol={selectedAsset}
                disable={disableSupplyButton}
                onActionClicked={onSupplyClicked}
              />
            )}
            {reserve.borrowingEnabled && (
              <>
                <Spacer
                  size={1}
                  sx={{ bg: "darkBlue401", width: "100%" }}
                  axis="horizontal"
                />
                <BorrowAction
                  reserve={reserve}
                  value={maxAmountToBorrow.toString()}
                  usdValue={maxAmountToBorrowUsd}
                  symbol={selectedAsset}
                  disable={disableBorrowButton}
                  onActionClicked={() => {
                    openBorrow(reserve.underlyingAsset)
                  }}
                />
              </>
            )}
          </div>
          {alerts}
        </>
      )}
    </PaperWrapper>
  )
}

const PauseWarning = () => {
  const { t } = useTranslation()
  return (
    <Alert sx={{ mb: 0 }} variant="error">
      {t("lending.reserve.paused")}
    </Alert>
  )
}

const FrozenWarning = () => {
  const { t } = useTranslation()
  return (
    <Alert sx={{ mb: 0 }} variant="error">
      {t("lending.reserve.frozen")}
    </Alert>
  )
}

const PaperWrapper = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation()
  return (
    <div sx={{ color: "white" }}>
      <Text fs={15} sx={{ mb: 20 }} font="Geist">
        {t("lending.reserve.yourInfo")}
      </Text>
      {children}
    </div>
  )
}

const ConnectWallet = () => {
  const { t } = useTranslation()
  return (
    <PaperWrapper>
      <Text fs={14} lh={18} sx={{ mb: 24 }} color="basic300">
        {t("lending.wallet.connect.description")}
      </Text>
      <Web3ConnectModalButton />
    </PaperWrapper>
  )
}

interface ActionProps {
  value: string
  usdValue: string
  symbol: string
  disable: boolean
  onActionClicked: () => void
  reserve: ComputedReserveData
}

const SupplyAction = ({
  value,
  usdValue,
  symbol,
  disable,
  onActionClicked,
}: ActionProps) => {
  const { t } = useTranslation()
  return (
    <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
      <DataValue
        label={t("lending.supply.available")}
        labelColor="basic400"
        font="GeistSemiBold"
        size="small"
        tooltip={t("lending.tooltip.supplyAvailable")}
      >
        {t("value.token", { value: Number(value) })} {symbol}
        <Text fs={12} lh={20} color="basic500">
          <DisplayValue value={+usdValue} isUSD compact />
        </Text>
      </DataValue>
      <div css={{ minWidth: 80 }}>
        <Button
          fullWidth
          size="micro"
          onClick={onActionClicked}
          disabled={disable}
          sx={{ py: 6 }}
        >
          {t("lending.supply")}
        </Button>
      </div>
    </div>
  )
}

const BorrowAction = ({
  value,
  usdValue,
  symbol,
  disable,
  onActionClicked,
}: ActionProps) => {
  const { t } = useTranslation()
  return (
    <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
      <DataValue
        label={t("lending.borrow.available")}
        labelColor="basic400"
        font="GeistSemiBold"
        size="small"
        tooltip={t("lending.tooltip.borrowAvailable")}
      >
        {t("value.token", { value: Number(value) })} {symbol}
        <Text fs={12} lh={20} color="basic500">
          <DisplayValue value={+usdValue} isUSD compact />
        </Text>
      </DataValue>
      <div css={{ minWidth: 80 }}>
        <Button
          fullWidth
          size="micro"
          onClick={onActionClicked}
          disabled={disable}
          sx={{ py: 6 }}
        >
          {t("lending.borrow")}
        </Button>
      </div>
    </div>
  )
}

interface WalletBalanceProps {
  balance: string
  symbol: string
  marketTitle: string
}
const WalletBalance = ({ balance, symbol }: WalletBalanceProps) => {
  const { t } = useTranslation()

  return (
    <div
      sx={{ flex: "row", gap: 12, align: "center", p: 16, mb: 20 }}
      css={{
        background: `rgba(${theme.rgbColors.alpha0}, 0.06)`,
        borderRadius: theme.borderRadius.medium,
        border: `1px solid rgba(${theme.rgbColors.primaryA0}, 0.35)`,
      }}
    >
      <WalletIcon width={24} height={24} />
      <div>
        <DataValue
          label="Wallet Balance"
          font="GeistSemiBold"
          size="small"
          labelColor="basic400"
        >
          {t("value.token", { value: Number(balance) })} {symbol}
        </DataValue>
      </div>
    </div>
  )
}
