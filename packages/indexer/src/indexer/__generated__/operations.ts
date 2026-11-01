import * as Types from '@/indexer/__generated__/types';

export type YieldFarmCreatedQueryVariables = Types.Exact<{
  blockNumber: Types.Scalars['Int']['input'];
}>;


export type YieldFarmCreatedQuery = { __typename?: 'Query', events: Array<{ __typename?: 'Event', args?: any | null }> };

export type PureCreatedEventsQueryVariables = Types.Exact<{
  purePublicKey: Types.Scalars['String']['input'];
}>;


export type PureCreatedEventsQuery = { __typename?: 'Query', events: Array<{ __typename?: 'Event', block: { __typename?: 'Block', height: number }, extrinsic?: { __typename?: 'Extrinsic', indexInBlock: number } | null }> };
