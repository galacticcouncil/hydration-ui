import * as Types from '@/multix/__generated__/types';

export type MultisigsByAccountIdsQueryVariables = Types.Exact<{
  accountIds?: Types.InputMaybe<Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']>;
}>;


export type MultisigsByAccountIdsQuery = { __typename?: 'Query', accounts: Array<{ __typename?: 'Account', id: string, pubKey: string, isMultisig?: boolean | null, isPureProxy?: boolean | null, threshold?: number | null, signatories: Array<{ __typename?: 'AccountMultisig', id: string, signatory: { __typename?: 'Account', id: string, pubKey: string } }>, delegateeFor: Array<{ __typename?: 'ProxyAccount', id: string, type: Types.ProxyType, delegator: { __typename?: 'Account', id: string, pubKey: string, isPureProxy?: boolean | null }, delegatee: { __typename?: 'Account', id: string, pubKey: string, isPureProxy?: boolean | null } }>, delegatorFor: Array<{ __typename?: 'ProxyAccount', id: string, type: Types.ProxyType, delegatee: { __typename?: 'Account', id: string, pubKey: string, isMultisig?: boolean | null, threshold?: number | null, signatories: Array<{ __typename?: 'AccountMultisig', id: string, signatory: { __typename?: 'Account', id: string, pubKey: string } }> } }> }> };
