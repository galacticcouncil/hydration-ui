import * as Types from '@/indexer/__generated__/types';

export type YieldFarmCreatedQueryVariables = Types.Exact<{
  blockNumber: Types.Scalars['Int']['input'];
}>;


export type YieldFarmCreatedQuery = { __typename?: 'Query', events: Array<{ __typename?: 'Event', args?: any | null }> };
