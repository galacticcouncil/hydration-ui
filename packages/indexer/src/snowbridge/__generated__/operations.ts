import * as Types from '@/snowbridge/__generated__/types';

export type TransferStatusToPolkadotQueryVariables = Types.Exact<{
  hash: Types.Scalars['String']['input'];
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type TransferStatusToPolkadotQuery = { __typename?: 'Query', transferStatusToPolkadots: Array<{ __typename?: 'TransferStatusToPolkadot', status?: number | null, timestamp: string, messageId: string }> };

export type TransferStatusToEthQueryVariables = Types.Exact<{
  hash: Types.Scalars['String']['input'];
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type TransferStatusToEthQuery = { __typename?: 'Query', transferStatusToEthereums: Array<{ __typename?: 'TransferStatusToEthereum', status?: number | null, timestamp: string, messageId: string }> };
