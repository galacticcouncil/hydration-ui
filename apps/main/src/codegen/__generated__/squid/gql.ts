/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "fragment Supply on MmSupply {\n  asset {\n    assetRegistryId\n  }\n  amount\n}\n\nfragment Withdraw on MmWithdraw {\n  asset {\n    assetRegistryId\n  }\n  amount\n}\n\nfragment Borrow on MmBorrow {\n  asset {\n    assetRegistryId\n  }\n  amount\n}\n\nfragment Repay on MmRepay {\n  asset {\n    assetRegistryId\n  }\n  amount\n}\n\nfragment CollateralEnabled on MmReserveUsedAsCollateralEnabledEvent {\n  asset {\n    assetRegistryId\n  }\n}\n\nfragment CollateralDisabled on MmReserveUsedAsCollateralDisabledEvent {\n  asset {\n    assetRegistryId\n  }\n}\n\nfragment LiquidationCall on MmLiquidationCall {\n  asset: collateralAsset {\n    assetRegistryId\n  }\n  amount: liquidatedCollateralAmount\n}\n\nfragment UserEMode on MmUserEModeSet {\n  categoryId\n}\n\nfragment EventData on MoneyMarketEvent {\n  supply {\n    ...Supply\n  }\n  withdraw {\n    ...Withdraw\n  }\n  borrow {\n    ...Borrow\n  }\n  repay {\n    ...Repay\n  }\n  reserveUsedAsCollateralEnabled {\n    ...CollateralEnabled\n  }\n  reserveUsedAsCollateralDisabled {\n    ...CollateralDisabled\n  }\n  liquidationCall {\n    ...LiquidationCall\n  }\n  userEModeSet {\n    ...UserEMode\n  }\n}\n\nfragment MoneyMarketEvent on MoneyMarketEvent {\n  ...EventData\n  eventName\n  event {\n    block {\n      timestamp\n    }\n  }\n}\n\nquery MoneyMarketEvents($filter: MoneyMarketEventFilter, $first: Int, $offset: Int) {\n  moneyMarketEvents(\n    first: $first\n    offset: $offset\n    filter: $filter\n    orderBy: [EVENT_ID_DESC]\n  ) {\n    totalCount\n    nodes {\n      ...MoneyMarketEvent\n    }\n  }\n}": typeof types.SupplyFragmentDoc,
};
const documents: Documents = {
    "fragment Supply on MmSupply {\n  asset {\n    assetRegistryId\n  }\n  amount\n}\n\nfragment Withdraw on MmWithdraw {\n  asset {\n    assetRegistryId\n  }\n  amount\n}\n\nfragment Borrow on MmBorrow {\n  asset {\n    assetRegistryId\n  }\n  amount\n}\n\nfragment Repay on MmRepay {\n  asset {\n    assetRegistryId\n  }\n  amount\n}\n\nfragment CollateralEnabled on MmReserveUsedAsCollateralEnabledEvent {\n  asset {\n    assetRegistryId\n  }\n}\n\nfragment CollateralDisabled on MmReserveUsedAsCollateralDisabledEvent {\n  asset {\n    assetRegistryId\n  }\n}\n\nfragment LiquidationCall on MmLiquidationCall {\n  asset: collateralAsset {\n    assetRegistryId\n  }\n  amount: liquidatedCollateralAmount\n}\n\nfragment UserEMode on MmUserEModeSet {\n  categoryId\n}\n\nfragment EventData on MoneyMarketEvent {\n  supply {\n    ...Supply\n  }\n  withdraw {\n    ...Withdraw\n  }\n  borrow {\n    ...Borrow\n  }\n  repay {\n    ...Repay\n  }\n  reserveUsedAsCollateralEnabled {\n    ...CollateralEnabled\n  }\n  reserveUsedAsCollateralDisabled {\n    ...CollateralDisabled\n  }\n  liquidationCall {\n    ...LiquidationCall\n  }\n  userEModeSet {\n    ...UserEMode\n  }\n}\n\nfragment MoneyMarketEvent on MoneyMarketEvent {\n  ...EventData\n  eventName\n  event {\n    block {\n      timestamp\n    }\n  }\n}\n\nquery MoneyMarketEvents($filter: MoneyMarketEventFilter, $first: Int, $offset: Int) {\n  moneyMarketEvents(\n    first: $first\n    offset: $offset\n    filter: $filter\n    orderBy: [EVENT_ID_DESC]\n  ) {\n    totalCount\n    nodes {\n      ...MoneyMarketEvent\n    }\n  }\n}": types.SupplyFragmentDoc,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment Supply on MmSupply {\n  asset {\n    assetRegistryId\n  }\n  amount\n}\n\nfragment Withdraw on MmWithdraw {\n  asset {\n    assetRegistryId\n  }\n  amount\n}\n\nfragment Borrow on MmBorrow {\n  asset {\n    assetRegistryId\n  }\n  amount\n}\n\nfragment Repay on MmRepay {\n  asset {\n    assetRegistryId\n  }\n  amount\n}\n\nfragment CollateralEnabled on MmReserveUsedAsCollateralEnabledEvent {\n  asset {\n    assetRegistryId\n  }\n}\n\nfragment CollateralDisabled on MmReserveUsedAsCollateralDisabledEvent {\n  asset {\n    assetRegistryId\n  }\n}\n\nfragment LiquidationCall on MmLiquidationCall {\n  asset: collateralAsset {\n    assetRegistryId\n  }\n  amount: liquidatedCollateralAmount\n}\n\nfragment UserEMode on MmUserEModeSet {\n  categoryId\n}\n\nfragment EventData on MoneyMarketEvent {\n  supply {\n    ...Supply\n  }\n  withdraw {\n    ...Withdraw\n  }\n  borrow {\n    ...Borrow\n  }\n  repay {\n    ...Repay\n  }\n  reserveUsedAsCollateralEnabled {\n    ...CollateralEnabled\n  }\n  reserveUsedAsCollateralDisabled {\n    ...CollateralDisabled\n  }\n  liquidationCall {\n    ...LiquidationCall\n  }\n  userEModeSet {\n    ...UserEMode\n  }\n}\n\nfragment MoneyMarketEvent on MoneyMarketEvent {\n  ...EventData\n  eventName\n  event {\n    block {\n      timestamp\n    }\n  }\n}\n\nquery MoneyMarketEvents($filter: MoneyMarketEventFilter, $first: Int, $offset: Int) {\n  moneyMarketEvents(\n    first: $first\n    offset: $offset\n    filter: $filter\n    orderBy: [EVENT_ID_DESC]\n  ) {\n    totalCount\n    nodes {\n      ...MoneyMarketEvent\n    }\n  }\n}"): (typeof documents)["fragment Supply on MmSupply {\n  asset {\n    assetRegistryId\n  }\n  amount\n}\n\nfragment Withdraw on MmWithdraw {\n  asset {\n    assetRegistryId\n  }\n  amount\n}\n\nfragment Borrow on MmBorrow {\n  asset {\n    assetRegistryId\n  }\n  amount\n}\n\nfragment Repay on MmRepay {\n  asset {\n    assetRegistryId\n  }\n  amount\n}\n\nfragment CollateralEnabled on MmReserveUsedAsCollateralEnabledEvent {\n  asset {\n    assetRegistryId\n  }\n}\n\nfragment CollateralDisabled on MmReserveUsedAsCollateralDisabledEvent {\n  asset {\n    assetRegistryId\n  }\n}\n\nfragment LiquidationCall on MmLiquidationCall {\n  asset: collateralAsset {\n    assetRegistryId\n  }\n  amount: liquidatedCollateralAmount\n}\n\nfragment UserEMode on MmUserEModeSet {\n  categoryId\n}\n\nfragment EventData on MoneyMarketEvent {\n  supply {\n    ...Supply\n  }\n  withdraw {\n    ...Withdraw\n  }\n  borrow {\n    ...Borrow\n  }\n  repay {\n    ...Repay\n  }\n  reserveUsedAsCollateralEnabled {\n    ...CollateralEnabled\n  }\n  reserveUsedAsCollateralDisabled {\n    ...CollateralDisabled\n  }\n  liquidationCall {\n    ...LiquidationCall\n  }\n  userEModeSet {\n    ...UserEMode\n  }\n}\n\nfragment MoneyMarketEvent on MoneyMarketEvent {\n  ...EventData\n  eventName\n  event {\n    block {\n      timestamp\n    }\n  }\n}\n\nquery MoneyMarketEvents($filter: MoneyMarketEventFilter, $first: Int, $offset: Int) {\n  moneyMarketEvents(\n    first: $first\n    offset: $offset\n    filter: $filter\n    orderBy: [EVENT_ID_DESC]\n  ) {\n    totalCount\n    nodes {\n      ...MoneyMarketEvent\n    }\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;