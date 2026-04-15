import * as Types from '@/multix/__generated__/operations';

import { GraphQLClient, RequestOptions } from 'graphql-request';
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];

export const MultisigsByAccountIdsDocument = `
    query MultisigsByAccountIds($accountIds: [String!]) {
  accounts(
    where: {AND: [{OR: [{id_in: $accountIds}, {signatories_some: {signatory: {id_in: $accountIds}}}]}, {isMultisig_eq: true}]}
  ) {
    id
    pubKey
    isMultisig
    isPureProxy
    threshold
    signatories {
      id
      signatory {
        id
        pubKey
      }
    }
    delegateeFor {
      id
      type
      delegator {
        id
        pubKey
        isPureProxy
      }
      delegatee {
        id
        pubKey
        isPureProxy
      }
    }
    delegatorFor {
      id
      type
      delegatee {
        id
        pubKey
        isMultisig
        threshold
        signatories {
          id
          signatory {
            id
            pubKey
          }
        }
      }
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    MultisigsByAccountIds(variables?: Types.MultisigsByAccountIdsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<Types.MultisigsByAccountIdsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Types.MultisigsByAccountIdsQuery>({ document: MultisigsByAccountIdsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'MultisigsByAccountIds', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;