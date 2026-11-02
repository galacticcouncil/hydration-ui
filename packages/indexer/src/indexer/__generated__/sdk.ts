import * as Types from '@/indexer/__generated__/operations';

import { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];

export const YieldFarmCreatedDocument = gql`
    query YieldFarmCreated($blockNumber: Int!) {
  events(
    where: {name_eq: "OmnipoolLiquidityMining.YieldFarmCreated", block: {height_gte: $blockNumber}}
    orderBy: [block_height_ASC]
  ) {
    args
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    YieldFarmCreated(variables: Types.YieldFarmCreatedQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.YieldFarmCreatedQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.YieldFarmCreatedQuery>({ document: YieldFarmCreatedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'YieldFarmCreated', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;