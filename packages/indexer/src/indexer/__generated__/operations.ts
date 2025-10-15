import * as Types from '@/indexer/__generated__/types';

export type ExtrinsicFragment = { __typename?: 'Extrinsic', hash: string, indexInBlock: number, success: boolean, error?: any | null, block: { __typename?: 'Block', height: number, timestamp: string } };

export type ExtrinsicByHashQueryVariables = Types.Exact<{
  hash: Types.Scalars['String']['input'];
}>;


export type ExtrinsicByHashQuery = { __typename?: 'Query', extrinsics: Array<{ __typename?: 'Extrinsic', hash: string, indexInBlock: number, success: boolean, error?: any | null, block: { __typename?: 'Block', height: number, timestamp: string } }> };

export type ExtrinsicByBlockAndIndexQueryVariables = Types.Exact<{
  blockNumber: Types.Scalars['Int']['input'];
  index: Types.Scalars['Int']['input'];
}>;


export type ExtrinsicByBlockAndIndexQuery = { __typename?: 'Query', extrinsics: Array<{ __typename?: 'Extrinsic', hash: string, indexInBlock: number, success: boolean, error?: any | null, block: { __typename?: 'Block', height: number, timestamp: string } }> };

export type OtcOrderStatusQueryVariables = Types.Exact<{
  orderId: Types.Scalars['Int']['input'];
}>;


export type OtcOrderStatusQuery = { __typename?: 'Query', events: Array<{ __typename?: 'Event', args?: any | null }> };
