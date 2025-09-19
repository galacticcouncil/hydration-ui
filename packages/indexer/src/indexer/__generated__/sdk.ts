import * as Types from '@/indexer/__generated__/operations';

import { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
export const ExtrinsicFragmentDoc = gql`
    fragment Extrinsic on Extrinsic {
  hash
  block {
    height
    timestamp
  }
  indexInBlock
  success
  error
}
    `;
export const ExtrinsicByHashDocument = gql`
    query ExtrinsicByHash($hash: String!) {
  extrinsics(where: {hash_eq: $hash}) {
    ...Extrinsic
  }
}
    ${ExtrinsicFragmentDoc}`;
export const ExtrinsicByBlockAndIndexDocument = gql`
    query ExtrinsicByBlockAndIndex($blockNumber: Int!, $index: Int!) {
  extrinsics(where: {block: {height_eq: $blockNumber}, indexInBlock_eq: $index}) {
    ...Extrinsic
  }
}
    ${ExtrinsicFragmentDoc}`;
export const OtcOrderStatusDocument = gql`
    query OtcOrderStatus($orderId: Int!) {
  events(
    where: {args_jsonContains: {orderId: $orderId}, AND: {name_eq: "OTC.Placed"}}
  ) {
    args
  }
}
    `;
export const AccumulatedRpsUpdatedEventsDocument = gql`
    query AccumulatedRpsUpdatedEvents {
  events(
    where: {name_eq: "Staking.AccumulatedRpsUpdated"}
    orderBy: [block_height_ASC]
  ) {
    args
    block {
      height
    }
    name
  }
}
    `;
export const StakingInitializedEventsDocument = gql`
    query StakingInitializedEvents {
  events(where: {name_eq: "Staking.StakingInitialized"}) {
    block {
      height
    }
    name
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    ExtrinsicByHash(variables: Types.ExtrinsicByHashQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.ExtrinsicByHashQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.ExtrinsicByHashQuery>({ document: ExtrinsicByHashDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ExtrinsicByHash', 'query', variables);
    },
    ExtrinsicByBlockAndIndex(variables: Types.ExtrinsicByBlockAndIndexQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.ExtrinsicByBlockAndIndexQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.ExtrinsicByBlockAndIndexQuery>({ document: ExtrinsicByBlockAndIndexDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ExtrinsicByBlockAndIndex', 'query', variables);
    },
    OtcOrderStatus(variables: Types.OtcOrderStatusQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.OtcOrderStatusQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.OtcOrderStatusQuery>({ document: OtcOrderStatusDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'OtcOrderStatus', 'query', variables);
    },
    AccumulatedRpsUpdatedEvents(variables?: Types.AccumulatedRpsUpdatedEventsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.AccumulatedRpsUpdatedEventsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.AccumulatedRpsUpdatedEventsQuery>({ document: AccumulatedRpsUpdatedEventsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AccumulatedRpsUpdatedEvents', 'query', variables);
    },
    StakingInitializedEvents(variables?: Types.StakingInitializedEventsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.StakingInitializedEventsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.StakingInitializedEventsQuery>({ document: StakingInitializedEventsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'StakingInitializedEvents', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;