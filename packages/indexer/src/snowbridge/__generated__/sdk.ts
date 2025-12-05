import * as Types from '@/snowbridge/__generated__/operations';

import { GraphQLClient, RequestOptions } from 'graphql-request';
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];

export const TransferStatusToPolkadotDocument = `
    query TransferStatusToPolkadot($hash: String!, $limit: Int = 10) {
  transferStatusToPolkadots(
    where: {messageId_eq: $hash, OR: {txHash_eq: $hash}}
    limit: $limit
  ) {
    status
    timestamp
    messageId
  }
}
    `;
export const TransferStatusToEthDocument = `
    query TransferStatusToEth($hash: String!, $limit: Int = 10) {
  transferStatusToEthereums(
    where: {messageId_eq: $hash, OR: {txHash_eq: $hash}}
    limit: $limit
  ) {
    status
    timestamp
    messageId
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    TransferStatusToPolkadot(variables: Types.TransferStatusToPolkadotQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.TransferStatusToPolkadotQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.TransferStatusToPolkadotQuery>({ document: TransferStatusToPolkadotDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'TransferStatusToPolkadot', 'query', variables);
    },
    TransferStatusToEth(variables: Types.TransferStatusToEthQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.TransferStatusToEthQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.TransferStatusToEthQuery>({ document: TransferStatusToEthDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'TransferStatusToEth', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;