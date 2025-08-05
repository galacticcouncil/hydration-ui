import * as Types from '@/squid/__generated__/types';

export type AccountTotalBalancesByPeriodQueryVariables = Types.Exact<{
  accountId: Types.Scalars['String']['input'];
  startTimestamp?: Types.InputMaybe<Types.Scalars['String']['input']>;
  endTimestamp?: Types.InputMaybe<Types.Scalars['String']['input']>;
  bucketSize?: Types.InputMaybe<Types.TimeSeriesBucketTimeRange>;
}>;


export type AccountTotalBalancesByPeriodQuery = { __typename?: 'Query', accountTotalBalancesByPeriod: { __typename?: 'AccountTotalBalancesByPeriodResponse', nodes: Array<{ __typename?: 'AccountTotalBalanceSnapshot', referenceAssetId: string, buckets: Array<{ __typename?: 'AccountTotalBalanceBucket', transferableNorm: string, timestamp: string }> } | null> } };

export type LatestAccountsBalancesQueryVariables = Types.Exact<{
  accountIds?: Types.InputMaybe<Types.StringFilter>;
}>;


export type LatestAccountsBalancesQuery = { __typename?: 'Query', accountTotalBalanceHistoricalData?: { __typename?: 'AccountTotalBalanceHistoricalDataConnection', nodes: Array<{ __typename?: 'AccountTotalBalanceHistoricalDatum', totalTransferableNorm: string } | null> } | null };

export type SupplyFragment = { __typename?: 'MmSupply', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null };

export type WithdrawFragment = { __typename?: 'MmWithdraw', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null };

export type BorrowFragment = { __typename?: 'MmBorrow', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null };

export type RepayFragment = { __typename?: 'MmRepay', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null };

export type CollateralEnabledFragment = { __typename?: 'MmReserveUsedAsCollateralEnabledEvent', asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null };

export type CollateralDisabledFragment = { __typename?: 'MmReserveUsedAsCollateralDisabledEvent', asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null };

export type LiquidationCallFragment = { __typename?: 'MmLiquidationCall', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null };

export type UserEModeFragment = { __typename?: 'MmUserEModeSet', categoryId?: number | null };

export type EventDataFragment = { __typename?: 'MoneyMarketEvent', supply?: { __typename?: 'MmSupply', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null, withdraw?: { __typename?: 'MmWithdraw', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null, borrow?: { __typename?: 'MmBorrow', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null, repay?: { __typename?: 'MmRepay', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null, reserveUsedAsCollateralEnabled?: { __typename?: 'MmReserveUsedAsCollateralEnabledEvent', asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null, reserveUsedAsCollateralDisabled?: { __typename?: 'MmReserveUsedAsCollateralDisabledEvent', asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null, liquidationCall?: { __typename?: 'MmLiquidationCall', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null, userEModeSet?: { __typename?: 'MmUserEModeSet', categoryId?: number | null } | null };

export type MoneyMarketEventFragment = { __typename?: 'MoneyMarketEvent', eventName: string, event?: { __typename?: 'Event', block?: { __typename?: 'Block', timestamp: any } | null } | null, supply?: { __typename?: 'MmSupply', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null, withdraw?: { __typename?: 'MmWithdraw', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null, borrow?: { __typename?: 'MmBorrow', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null, repay?: { __typename?: 'MmRepay', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null, reserveUsedAsCollateralEnabled?: { __typename?: 'MmReserveUsedAsCollateralEnabledEvent', asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null, reserveUsedAsCollateralDisabled?: { __typename?: 'MmReserveUsedAsCollateralDisabledEvent', asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null, liquidationCall?: { __typename?: 'MmLiquidationCall', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null, userEModeSet?: { __typename?: 'MmUserEModeSet', categoryId?: number | null } | null };

export type MoneyMarketEventsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.MoneyMarketEventFilter>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type MoneyMarketEventsQuery = { __typename?: 'Query', moneyMarketEvents?: { __typename?: 'MoneyMarketEventsConnection', totalCount: number, nodes: Array<{ __typename?: 'MoneyMarketEvent', eventName: string, event?: { __typename?: 'Event', block?: { __typename?: 'Block', timestamp: any } | null } | null, supply?: { __typename?: 'MmSupply', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null, withdraw?: { __typename?: 'MmWithdraw', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null, borrow?: { __typename?: 'MmBorrow', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null, repay?: { __typename?: 'MmRepay', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null, reserveUsedAsCollateralEnabled?: { __typename?: 'MmReserveUsedAsCollateralEnabledEvent', asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null, reserveUsedAsCollateralDisabled?: { __typename?: 'MmReserveUsedAsCollateralDisabledEvent', asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null, liquidationCall?: { __typename?: 'MmLiquidationCall', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null, userEModeSet?: { __typename?: 'MmUserEModeSet', categoryId?: number | null } | null } | null> } | null };

export type OmnipoolYieldMetricsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type OmnipoolYieldMetricsQuery = { __typename?: 'Query', omnipoolAssetsYieldMetrics: { __typename?: 'OmnipoolAssetsYieldMetricsResponse', nodes: Array<{ __typename?: 'OmnipoolAssetYieldMetricsAggregated', assetId: string, assetRegistryId: string, projectedAprPerc: any } | null> } };

export type StableswapYieldMetricsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type StableswapYieldMetricsQuery = { __typename?: 'Query', stableswapYieldMetrics: { __typename?: 'StableswapYieldMetricsResponse', nodes: Array<{ __typename?: 'StableswapYieldMetricsAggregated', poolId: string, projectedAprPerc: string, projectedApyPerc: string } | null> } };

export type SwapFragment = { __typename?: 'Swap', paraTimestamp: any, operationType: string, swapperId?: string | null, event?: { __typename?: 'Event', paraBlockHeight: number, indexInBlock: number } | null, swapInputs: { __typename?: 'SwapInputRecordsConnection', nodes: Array<{ __typename?: 'SwapInputRecord', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null> }, swapOutputs: { __typename?: 'SwapOutputsConnection', nodes: Array<{ __typename?: 'SwapOutput', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null> }, dcaScheduleExecutionEvent?: { __typename?: 'DcaScheduleExecutionEvent', scheduleExecution?: { __typename?: 'DcaScheduleExecution', status?: string | null, schedule?: { __typename?: 'DcaSchedule', id: string, status?: string | null, assetInId?: string | null, totalExecutedAmountIn?: any | null, budgetAmountIn?: any | null } | null } | null } | null };

export type UserSwapsQueryVariables = Types.Exact<{
  swapperIdFilter?: Types.InputMaybe<Types.StringFilter>;
  allInvolvedAssetRegistryIds?: Types.InputMaybe<Types.StringListFilter>;
  offset: Types.Scalars['Int']['input'];
  pageSize: Types.Scalars['Int']['input'];
}>;


export type UserSwapsQuery = { __typename?: 'Query', swaps?: { __typename?: 'SwapsConnection', totalCount: number, nodes: Array<{ __typename?: 'Swap', paraTimestamp: any, operationType: string, swapperId?: string | null, event?: { __typename?: 'Event', paraBlockHeight: number, indexInBlock: number } | null, swapInputs: { __typename?: 'SwapInputRecordsConnection', nodes: Array<{ __typename?: 'SwapInputRecord', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null> }, swapOutputs: { __typename?: 'SwapOutputsConnection', nodes: Array<{ __typename?: 'SwapOutput', amount?: any | null, asset?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null> }, dcaScheduleExecutionEvent?: { __typename?: 'DcaScheduleExecutionEvent', scheduleExecution?: { __typename?: 'DcaScheduleExecution', status?: string | null, schedule?: { __typename?: 'DcaSchedule', id: string, status?: string | null, assetInId?: string | null, totalExecutedAmountIn?: any | null, budgetAmountIn?: any | null } | null } | null } | null } | null> } | null };

export type UserOrdersQueryVariables = Types.Exact<{
  address: Types.Scalars['String']['input'];
  assetInId?: Types.InputMaybe<Types.StringFilter>;
  assetOutId?: Types.InputMaybe<Types.StringFilter>;
  offset: Types.Scalars['Int']['input'];
  pageSize: Types.Scalars['Int']['input'];
  status: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
}>;


export type UserOrdersQuery = { __typename?: 'Query', dcaSchedules?: { __typename?: 'DcaSchedulesConnection', totalCount: number, nodes: Array<{ __typename?: 'DcaSchedule', id: string, status?: string | null, orderType: string, totalExecutedAmountIn?: any | null, totalExecutedAmountOut?: any | null, period?: number | null, budgetAmountIn?: any | null, singleTradeSize?: any | null, assetIn?: { __typename?: 'Asset', assetRegistryId?: string | null } | null, assetOut?: { __typename?: 'Asset', assetRegistryId?: string | null } | null } | null> } | null };

export type UserOpenOrdersCountQueryVariables = Types.Exact<{
  address: Types.Scalars['String']['input'];
  assetFilter?: Types.InputMaybe<Types.DcaScheduleFilter>;
}>;


export type UserOpenOrdersCountQuery = { __typename?: 'Query', dcaSchedules?: { __typename?: 'DcaSchedulesConnection', totalCount: number } | null };

export type DcaScheduleExecutionsQueryVariables = Types.Exact<{
  scheduleId: Types.Scalars['String']['input'];
}>;


export type DcaScheduleExecutionsQuery = { __typename?: 'Query', dcaSchedule?: { __typename?: 'DcaSchedule', assetInId?: string | null, assetOutId?: string | null, dcaScheduleExecutionsByScheduleId: { __typename?: 'DcaScheduleExecutionsConnection', nodes: Array<{ __typename?: 'DcaScheduleExecution', id: string, status?: string | null, amountIn?: any | null, amountOut?: any | null, dcaScheduleExecutionEventsByScheduleExecutionId: { __typename?: 'DcaScheduleExecutionEventsConnection', nodes: Array<{ __typename?: 'DcaScheduleExecutionEvent', event?: { __typename?: 'Event', paraBlockHeight: number, indexInBlock: number, block?: { __typename?: 'Block', timestamp: any } | null } | null } | null> } } | null> } } | null };

export type TradePricesQueryVariables = Types.Exact<{
  assetInId: Types.Scalars['String']['input'];
  assetOutId: Types.Scalars['String']['input'];
  startTimestamp?: Types.InputMaybe<Types.Scalars['String']['input']>;
  endTimestamp?: Types.InputMaybe<Types.Scalars['String']['input']>;
  bucketSize?: Types.InputMaybe<Types.TimeSeriesBucketTimeRange>;
}>;


export type TradePricesQuery = { __typename?: 'Query', assetPairPricesAndVolumesByPeriod: { __typename?: 'AssetPairPricesAndVolumeByPeriodResponse', nodes: Array<{ __typename?: 'AssetPairPriceSnapshot', buckets: Array<{ __typename?: 'AssetPairPriceBucket', timestamp: string, priceAvrgNorm: string }> } | null> } };

export type XykVolumeQueryVariables = Types.Exact<{
  filter: Types.XykpoolVolumeHistoricalDataByPeriodFilter;
}>;


export type XykVolumeQuery = { __typename?: 'Query', xykpoolVolumeHistoricalDataByPeriod: { __typename?: 'XykpoolVolumeHistoricalDataByPeriodResponse', nodes: Array<{ __typename?: 'XykpoolVolumeAggregated', assetAAssetRegistryId?: string | null, assetAId: string, assetAVol: any, assetAVolNorm: string, assetBAssetRegistryId?: string | null, assetBId: string, assetBVol: any, assetBVolNorm: string, poolId: string } | null> } };

export type OmnipoolVolumeQueryVariables = Types.Exact<{
  filter: Types.OmnipoolAssetVolumeHistoricalDataByPeriodFilter;
}>;


export type OmnipoolVolumeQuery = { __typename?: 'Query', omnipoolAssetVolumeHistoricalDataByPeriod: { __typename?: 'OmnipoolAssetVolumeHistoricalDataByPeriodResponse', nodes: Array<{ __typename?: 'OmnipoolAssetVolumeAggregated', assetId: string, assetRegistryId?: string | null, assetVol: any, assetVolNormalized: string } | null> } };

export type StablepoolVolumeQueryVariables = Types.Exact<{
  filter: Types.StableswapVolumeHistoricalDataByPeriodFilter;
}>;


export type StablepoolVolumeQuery = { __typename?: 'Query', stableswapVolumeHistoricalDataByPeriod: { __typename?: 'StableswapVolumeHistoricalDataByPeriodResponse', nodes: Array<{ __typename?: 'StableswapVolumeAggregated', poolId: string, poolVolNorm: string, assetVolumes: Array<{ __typename?: 'StablepoolAssetVolumeAggregated', assetRegistryId?: string | null, assetId: string, assetVol: any, assetVolNorm: string }> } | null> } };
