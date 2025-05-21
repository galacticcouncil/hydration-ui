/* eslint-disable */
import * as types from './graphql';



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
    "fragment Swap on Swap {\n  swapInputs {\n    nodes {\n      asset {\n        assetRegistryId\n      }\n      amount\n    }\n  }\n  swapOutputs {\n    nodes {\n      asset {\n        assetRegistryId\n      }\n      amount\n    }\n  }\n  dcaScheduleExecutionEvent {\n    scheduleExecution {\n      schedule {\n        status\n      }\n      status\n    }\n  }\n}\n\nquery TradeOrders($address: String!, $offset: Int!, $pageSize: Int!) {\n  swaps(\n    filter: {swapperId: {equalTo: $address}}\n    offset: $offset\n    first: $pageSize\n    orderBy: ID_DESC\n  ) {\n    totalCount\n    nodes {\n      ...Swap\n    }\n  }\n}": typeof types.SwapFragmentDoc,
};
const documents: Documents = {
    "fragment Swap on Swap {\n  swapInputs {\n    nodes {\n      asset {\n        assetRegistryId\n      }\n      amount\n    }\n  }\n  swapOutputs {\n    nodes {\n      asset {\n        assetRegistryId\n      }\n      amount\n    }\n  }\n  dcaScheduleExecutionEvent {\n    scheduleExecution {\n      schedule {\n        status\n      }\n      status\n    }\n  }\n}\n\nquery TradeOrders($address: String!, $offset: Int!, $pageSize: Int!) {\n  swaps(\n    filter: {swapperId: {equalTo: $address}}\n    offset: $offset\n    first: $pageSize\n    orderBy: ID_DESC\n  ) {\n    totalCount\n    nodes {\n      ...Swap\n    }\n  }\n}": types.SwapFragmentDoc,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment Swap on Swap {\n  swapInputs {\n    nodes {\n      asset {\n        assetRegistryId\n      }\n      amount\n    }\n  }\n  swapOutputs {\n    nodes {\n      asset {\n        assetRegistryId\n      }\n      amount\n    }\n  }\n  dcaScheduleExecutionEvent {\n    scheduleExecution {\n      schedule {\n        status\n      }\n      status\n    }\n  }\n}\n\nquery TradeOrders($address: String!, $offset: Int!, $pageSize: Int!) {\n  swaps(\n    filter: {swapperId: {equalTo: $address}}\n    offset: $offset\n    first: $pageSize\n    orderBy: ID_DESC\n  ) {\n    totalCount\n    nodes {\n      ...Swap\n    }\n  }\n}"): typeof import('./graphql').SwapFragmentDoc;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
