import * as Types from '@/squid/__generated__/operations';

import { GraphQLClient, RequestOptions } from 'graphql-request';
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
export const SupplyFragmentDoc = `
    fragment Supply on MmSupply {
  asset {
    assetRegistryId
  }
  amount
}
    `;
export const WithdrawFragmentDoc = `
    fragment Withdraw on MmWithdraw {
  asset {
    assetRegistryId
  }
  amount
}
    `;
export const BorrowFragmentDoc = `
    fragment Borrow on MmBorrow {
  asset {
    assetRegistryId
  }
  amount
}
    `;
export const RepayFragmentDoc = `
    fragment Repay on MmRepay {
  asset {
    assetRegistryId
  }
  amount
}
    `;
export const CollateralEnabledFragmentDoc = `
    fragment CollateralEnabled on MmReserveUsedAsCollateralEnabledEvent {
  asset {
    assetRegistryId
  }
}
    `;
export const CollateralDisabledFragmentDoc = `
    fragment CollateralDisabled on MmReserveUsedAsCollateralDisabledEvent {
  asset {
    assetRegistryId
  }
}
    `;
export const LiquidationCallFragmentDoc = `
    fragment LiquidationCall on MmLiquidationCall {
  asset: collateralAsset {
    assetRegistryId
  }
  amount: liquidatedCollateralAmount
}
    `;
export const UserEModeFragmentDoc = `
    fragment UserEMode on MmUserEModeSet {
  categoryId
}
    `;
export const EventDataFragmentDoc = `
    fragment EventData on MoneyMarketEvent {
  supply {
    ...Supply
  }
  withdraw {
    ...Withdraw
  }
  borrow {
    ...Borrow
  }
  repay {
    ...Repay
  }
  reserveUsedAsCollateralEnabled {
    ...CollateralEnabled
  }
  reserveUsedAsCollateralDisabled {
    ...CollateralDisabled
  }
  liquidationCall {
    ...LiquidationCall
  }
  userEModeSet {
    ...UserEMode
  }
}
    ${SupplyFragmentDoc}
${WithdrawFragmentDoc}
${BorrowFragmentDoc}
${RepayFragmentDoc}
${CollateralEnabledFragmentDoc}
${CollateralDisabledFragmentDoc}
${LiquidationCallFragmentDoc}
${UserEModeFragmentDoc}`;
export const MoneyMarketEventFragmentDoc = `
    fragment MoneyMarketEvent on MoneyMarketEvent {
  ...EventData
  eventName
  event {
    block {
      timestamp
    }
  }
}
    ${EventDataFragmentDoc}`;
export const DcaScheduleStatusFragmentDoc = `
    fragment DcaScheduleStatus on DcaSchedule {
  status
  dcaScheduleExecutionsByScheduleId(first: 1, orderBy: ID_DESC) {
    nodes {
      dcaScheduleExecutionEventsByScheduleExecutionId(
        first: 1
        orderBy: PARA_BLOCK_HEIGHT_DESC
      ) {
        nodes {
          eventName
        }
      }
    }
  }
}
    `;
export const SwapDcaScheduleFragmentDoc = `
    fragment SwapDcaSchedule on DcaSchedule {
  id
  assetInId
  budgetAmountIn: totalAmount
  totalExecutedAmountIn
  ...DcaScheduleStatus
}
    ${DcaScheduleStatusFragmentDoc}`;
export const SwapFragmentDoc = `
    fragment Swap on Swap {
  paraTimestamp
  operationType
  swapperId
  event {
    paraBlockHeight
    indexInBlock
  }
  swapInputs {
    nodes {
      asset {
        assetRegistryId
      }
      amount
    }
  }
  swapOutputs {
    nodes {
      asset {
        assetRegistryId
      }
      amount
    }
  }
  dcaScheduleExecutionEvent {
    scheduleExecution {
      schedule {
        ...SwapDcaSchedule
      }
      status
    }
  }
}
    ${SwapDcaScheduleFragmentDoc}`;
export const RoutedTradeSwapFragmentDoc = `
    fragment RoutedTradeSwap on Swap {
  dcaScheduleExecutionEvent {
    scheduleExecution {
      schedule {
        ...SwapDcaSchedule
      }
    }
  }
}
    ${SwapDcaScheduleFragmentDoc}`;
export const AccountTotalBalancesByPeriodDocument = `
    query AccountTotalBalancesByPeriod($accountId: String!, $startTimestamp: String, $endTimestamp: String, $bucketSize: TimeSeriesBucketTimeRange) {
  accountTotalBalancesByPeriod(
    filter: {accountId: $accountId, startTimestamp: $startTimestamp, endTimestamp: $endTimestamp, bucketSize: $bucketSize}
  ) {
    nodes {
      referenceAssetId
      buckets {
        transferableNorm
        lockedNorm
        timestamp
      }
    }
  }
}
    `;
export const LatestAccountsBalancesDocument = `
    query LatestAccountsBalances($accountId: String) {
  accountTotalBalanceHistoricalData(
    filter: {accountId: {equalTo: $accountId}}
    orderBy: PARA_BLOCK_HEIGHT_DESC
    first: 1
  ) {
    nodes {
      totalTransferableNorm
      totalLockedNorm
    }
  }
}
    `;
export const LatestBlockHeightQueryDocument = `
    query LatestBlockHeightQuery {
  blocks(last: 1) {
    edges {
      node {
        height
      }
    }
  }
}
    `;
export const MoneyMarketEventsDocument = `
    query MoneyMarketEvents($filter: MoneyMarketEventFilter, $first: Int, $offset: Int) {
  moneyMarketEvents(
    first: $first
    offset: $offset
    filter: $filter
    orderBy: [EVENT_ID_DESC]
  ) {
    totalCount
    nodes {
      ...MoneyMarketEvent
    }
  }
}
    ${MoneyMarketEventFragmentDoc}`;
export const PlatformTotalDocument = `
    query PlatformTotal {
  platformTotalTvl {
    nodes {
      omnipoolTvlNorm
      stablepoolsTvlNorm
    }
  }
  platformTotalVolumesByPeriod(filter: {period: _24H_}) {
    nodes {
      omnipoolVolNorm
      stableswapVolNorm
    }
  }
}
    `;
export const OmnipoolYieldMetricsDocument = `
    query OmnipoolYieldMetrics {
  omnipoolAssetsYieldMetrics {
    nodes {
      assetId
      assetRegistryId
      projectedAprPerc
    }
  }
}
    `;
export const StableswapYieldMetricsDocument = `
    query StableswapYieldMetrics {
  stableswapYieldMetrics {
    nodes {
      poolId
      projectedAprPerc
      projectedApyPerc
    }
  }
}
    `;
export const UserSwapsDocument = `
    query UserSwaps($swapperIdFilter: StringFilter, $orFilter: [SwapFilter!], $offset: Int!, $pageSize: Int!) {
  swaps(
    filter: {swapperId: $swapperIdFilter, operationType: {in: ["ExactIn", "ExactOut"]}, or: $orFilter}
    offset: $offset
    first: $pageSize
    orderBy: ID_DESC
  ) {
    totalCount
    nodes {
      ...Swap
    }
  }
}
    ${SwapFragmentDoc}`;
export const UserOrdersDocument = `
    query UserOrders($address: String!, $assetInId: StringFilter, $assetOutId: StringFilter, $offset: Int, $pageSize: Int, $status: [String!]!) {
  dcaSchedules(
    condition: {ownerId: $address}
    filter: {status: {in: $status}, assetInId: $assetInId, assetOutId: $assetOutId}
    offset: $offset
    first: $pageSize
    orderBy: PARA_BLOCK_HEIGHT_DESC
  ) {
    totalCount
    nodes {
      id
      orderType
      assetIn {
        assetRegistryId
        underlyingAssetId
      }
      totalExecutedAmountIn
      budgetAmountIn: totalAmount
      singleTradeSize: amountIn
      assetOut {
        assetRegistryId
      }
      totalExecutedAmountOut
      period
      ...DcaScheduleStatus
    }
  }
}
    ${DcaScheduleStatusFragmentDoc}`;
export const UserOpenOrdersCountDocument = `
    query UserOpenOrdersCount($address: String!, $assetFilter: DcaScheduleFilter) {
  dcaSchedules(
    condition: {status: "Created", ownerId: $address}
    filter: $assetFilter
  ) {
    totalCount
  }
}
    `;
export const DcaScheduleExecutionsDocument = `
    query DcaScheduleExecutions($scheduleId: String!) {
  dcaSchedule(id: $scheduleId) {
    id
    assetIn {
      assetRegistryId
    }
    assetOut {
      assetRegistryId
    }
    dcaScheduleExecutionsByScheduleId(
      filter: {status: {in: ["Executed", "Failed"]}}
    ) {
      nodes {
        id
        status
        amountIn
        amountOut
        dcaScheduleExecutionEventsByScheduleExecutionId(
          first: 1
          filter: {eventName: {in: ["Executed", "Failed"]}}
          orderBy: PARA_BLOCK_HEIGHT_ASC
        ) {
          nodes {
            event {
              paraBlockHeight
              indexInBlock
              block {
                timestamp
              }
            }
            errorState
          }
        }
      }
    }
  }
}
    `;
export const RoutedTradesDocument = `
    query RoutedTrades($address: String!, $inputAssetRegistryIds: StringListFilter, $outputAssetRegistryIds: StringListFilter, $offset: Int!, $pageSize: Int!) {
  routedTrades(
    filter: {participantSwappers: {contains: [$address]}, inputAssetRegistryIds: $inputAssetRegistryIds, outputAssetRegistryIds: $outputAssetRegistryIds}
    offset: $offset
    first: $pageSize
    orderBy: PARA_BLOCK_HEIGHT_DESC
  ) {
    totalCount
    nodes {
      block {
        timestamp
      }
      routeTradeInputs {
        nodes {
          asset {
            assetRegistryId
          }
          amount
        }
      }
      routeTradeOutputs {
        nodes {
          asset {
            assetRegistryId
          }
          amount
        }
      }
      swaps(first: 1) {
        nodes {
          ...RoutedTradeSwap
        }
      }
    }
  }
}
    ${RoutedTradeSwapFragmentDoc}`;
export const TradePricesDocument = `
    query TradePrices($assetInId: String!, $assetOutId: String!, $startTimestamp: String, $endTimestamp: String, $bucketSize: TimeSeriesBucketTimeRange) {
  assetPairPricesAndVolumesByPeriod(
    filter: {assetInRegistryId: $assetInId, assetOutRegistryId: $assetOutId, startTimestamp: $startTimestamp, endTimestamp: $endTimestamp, bucketSize: $bucketSize}
  ) {
    nodes {
      buckets {
        timestamp
        priceAvrgNorm
        referenceAssetVolNorm
      }
    }
  }
}
    `;
export const XykVolumeDocument = `
    query XykVolume($filter: XykpoolVolumeHistoricalDataByPeriodFilter!) {
  xykpoolVolumeHistoricalDataByPeriod(filter: $filter) {
    nodes {
      assetAAssetRegistryId
      assetAId
      assetAVol
      assetAVolNorm
      assetBAssetRegistryId
      assetBId
      assetBVol
      assetBVolNorm
      poolId
    }
  }
}
    `;
export const OmnipoolVolumeDocument = `
    query OmnipoolVolume($filter: OmnipoolAssetVolumeHistoricalDataByPeriodFilter!) {
  omnipoolAssetVolumeHistoricalDataByPeriod(filter: $filter) {
    nodes {
      assetId
      assetRegistryId
      assetVol
      assetVolNormalized
    }
  }
}
    `;
export const StablepoolVolumeDocument = `
    query StablepoolVolume($filter: StableswapVolumeHistoricalDataByPeriodFilter!) {
  stableswapVolumeHistoricalDataByPeriod(filter: $filter) {
    nodes {
      poolId
      poolVolNorm
      assetVolumes {
        assetRegistryId
        assetId
        assetVol
        assetVolNorm
      }
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    AccountTotalBalancesByPeriod(variables: Types.AccountTotalBalancesByPeriodQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.AccountTotalBalancesByPeriodQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.AccountTotalBalancesByPeriodQuery>({ document: AccountTotalBalancesByPeriodDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AccountTotalBalancesByPeriod', 'query', variables);
    },
    LatestAccountsBalances(variables?: Types.LatestAccountsBalancesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.LatestAccountsBalancesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.LatestAccountsBalancesQuery>({ document: LatestAccountsBalancesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'LatestAccountsBalances', 'query', variables);
    },
    LatestBlockHeightQuery(variables?: Types.LatestBlockHeightQueryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.LatestBlockHeightQueryQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.LatestBlockHeightQueryQuery>({ document: LatestBlockHeightQueryDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'LatestBlockHeightQuery', 'query', variables);
    },
    MoneyMarketEvents(variables?: Types.MoneyMarketEventsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.MoneyMarketEventsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.MoneyMarketEventsQuery>({ document: MoneyMarketEventsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'MoneyMarketEvents', 'query', variables);
    },
    PlatformTotal(variables?: Types.PlatformTotalQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.PlatformTotalQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.PlatformTotalQuery>({ document: PlatformTotalDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'PlatformTotal', 'query', variables);
    },
    OmnipoolYieldMetrics(variables?: Types.OmnipoolYieldMetricsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.OmnipoolYieldMetricsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.OmnipoolYieldMetricsQuery>({ document: OmnipoolYieldMetricsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'OmnipoolYieldMetrics', 'query', variables);
    },
    StableswapYieldMetrics(variables?: Types.StableswapYieldMetricsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.StableswapYieldMetricsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.StableswapYieldMetricsQuery>({ document: StableswapYieldMetricsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'StableswapYieldMetrics', 'query', variables);
    },
    UserSwaps(variables: Types.UserSwapsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.UserSwapsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.UserSwapsQuery>({ document: UserSwapsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UserSwaps', 'query', variables);
    },
    UserOrders(variables: Types.UserOrdersQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.UserOrdersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.UserOrdersQuery>({ document: UserOrdersDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UserOrders', 'query', variables);
    },
    UserOpenOrdersCount(variables: Types.UserOpenOrdersCountQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.UserOpenOrdersCountQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.UserOpenOrdersCountQuery>({ document: UserOpenOrdersCountDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UserOpenOrdersCount', 'query', variables);
    },
    DcaScheduleExecutions(variables: Types.DcaScheduleExecutionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.DcaScheduleExecutionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.DcaScheduleExecutionsQuery>({ document: DcaScheduleExecutionsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DcaScheduleExecutions', 'query', variables);
    },
    RoutedTrades(variables: Types.RoutedTradesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.RoutedTradesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.RoutedTradesQuery>({ document: RoutedTradesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RoutedTrades', 'query', variables);
    },
    TradePrices(variables: Types.TradePricesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.TradePricesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.TradePricesQuery>({ document: TradePricesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'TradePrices', 'query', variables);
    },
    XykVolume(variables: Types.XykVolumeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.XykVolumeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.XykVolumeQuery>({ document: XykVolumeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'XykVolume', 'query', variables);
    },
    OmnipoolVolume(variables: Types.OmnipoolVolumeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.OmnipoolVolumeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.OmnipoolVolumeQuery>({ document: OmnipoolVolumeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'OmnipoolVolume', 'query', variables);
    },
    StablepoolVolume(variables: Types.StablepoolVolumeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.StablepoolVolumeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.StablepoolVolumeQuery>({ document: StablepoolVolumeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'StablepoolVolume', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;