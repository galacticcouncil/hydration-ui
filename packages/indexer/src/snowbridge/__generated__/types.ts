export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigInt: { input: unknown; output: unknown; }
  DateTime: { input: string; output: string; }
};

export enum InboundMessageDispatchedOnEthereumOrderByInput {
  BlockNumberAsc = 'blockNumber_ASC',
  BlockNumberAscNullsFirst = 'blockNumber_ASC_NULLS_FIRST',
  BlockNumberAscNullsLast = 'blockNumber_ASC_NULLS_LAST',
  BlockNumberDesc = 'blockNumber_DESC',
  BlockNumberDescNullsFirst = 'blockNumber_DESC_NULLS_FIRST',
  BlockNumberDescNullsLast = 'blockNumber_DESC_NULLS_LAST',
  ChannelIdAsc = 'channelId_ASC',
  ChannelIdAscNullsFirst = 'channelId_ASC_NULLS_FIRST',
  ChannelIdAscNullsLast = 'channelId_ASC_NULLS_LAST',
  ChannelIdDesc = 'channelId_DESC',
  ChannelIdDescNullsFirst = 'channelId_DESC_NULLS_FIRST',
  ChannelIdDescNullsLast = 'channelId_DESC_NULLS_LAST',
  IdAsc = 'id_ASC',
  IdAscNullsFirst = 'id_ASC_NULLS_FIRST',
  IdAscNullsLast = 'id_ASC_NULLS_LAST',
  IdDesc = 'id_DESC',
  IdDescNullsFirst = 'id_DESC_NULLS_FIRST',
  IdDescNullsLast = 'id_DESC_NULLS_LAST',
  MessageIdAsc = 'messageId_ASC',
  MessageIdAscNullsFirst = 'messageId_ASC_NULLS_FIRST',
  MessageIdAscNullsLast = 'messageId_ASC_NULLS_LAST',
  MessageIdDesc = 'messageId_DESC',
  MessageIdDescNullsFirst = 'messageId_DESC_NULLS_FIRST',
  MessageIdDescNullsLast = 'messageId_DESC_NULLS_LAST',
  NonceAsc = 'nonce_ASC',
  NonceAscNullsFirst = 'nonce_ASC_NULLS_FIRST',
  NonceAscNullsLast = 'nonce_ASC_NULLS_LAST',
  NonceDesc = 'nonce_DESC',
  NonceDescNullsFirst = 'nonce_DESC_NULLS_FIRST',
  NonceDescNullsLast = 'nonce_DESC_NULLS_LAST',
  RewardAddressAsc = 'rewardAddress_ASC',
  RewardAddressAscNullsFirst = 'rewardAddress_ASC_NULLS_FIRST',
  RewardAddressAscNullsLast = 'rewardAddress_ASC_NULLS_LAST',
  RewardAddressDesc = 'rewardAddress_DESC',
  RewardAddressDescNullsFirst = 'rewardAddress_DESC_NULLS_FIRST',
  RewardAddressDescNullsLast = 'rewardAddress_DESC_NULLS_LAST',
  SuccessAsc = 'success_ASC',
  SuccessAscNullsFirst = 'success_ASC_NULLS_FIRST',
  SuccessAscNullsLast = 'success_ASC_NULLS_LAST',
  SuccessDesc = 'success_DESC',
  SuccessDescNullsFirst = 'success_DESC_NULLS_FIRST',
  SuccessDescNullsLast = 'success_DESC_NULLS_LAST',
  TimestampAsc = 'timestamp_ASC',
  TimestampAscNullsFirst = 'timestamp_ASC_NULLS_FIRST',
  TimestampAscNullsLast = 'timestamp_ASC_NULLS_LAST',
  TimestampDesc = 'timestamp_DESC',
  TimestampDescNullsFirst = 'timestamp_DESC_NULLS_FIRST',
  TimestampDescNullsLast = 'timestamp_DESC_NULLS_LAST',
  TxHashAsc = 'txHash_ASC',
  TxHashAscNullsFirst = 'txHash_ASC_NULLS_FIRST',
  TxHashAscNullsLast = 'txHash_ASC_NULLS_LAST',
  TxHashDesc = 'txHash_DESC',
  TxHashDescNullsFirst = 'txHash_DESC_NULLS_FIRST',
  TxHashDescNullsLast = 'txHash_DESC_NULLS_LAST'
}

export type InboundMessageDispatchedOnEthereumWhereInput = {
  AND?: InputMaybe<Array<InboundMessageDispatchedOnEthereumWhereInput>>;
  OR?: InputMaybe<Array<InboundMessageDispatchedOnEthereumWhereInput>>;
  blockNumber_eq?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  blockNumber_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  blockNumber_lt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_eq?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  channelId_contains?: InputMaybe<Scalars['String']['input']>;
  channelId_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  channelId_endsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_eq?: InputMaybe<Scalars['String']['input']>;
  channelId_gt?: InputMaybe<Scalars['String']['input']>;
  channelId_gte?: InputMaybe<Scalars['String']['input']>;
  channelId_in?: InputMaybe<Array<Scalars['String']['input']>>;
  channelId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  channelId_lt?: InputMaybe<Scalars['String']['input']>;
  channelId_lte?: InputMaybe<Scalars['String']['input']>;
  channelId_not_contains?: InputMaybe<Scalars['String']['input']>;
  channelId_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  channelId_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_not_eq?: InputMaybe<Scalars['String']['input']>;
  channelId_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  channelId_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_startsWith?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  id_endsWith?: InputMaybe<Scalars['String']['input']>;
  id_eq?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<Scalars['String']['input']>>;
  id_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  id_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  id_not_eq?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  id_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  id_startsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_contains?: InputMaybe<Scalars['String']['input']>;
  messageId_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  messageId_endsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_eq?: InputMaybe<Scalars['String']['input']>;
  messageId_gt?: InputMaybe<Scalars['String']['input']>;
  messageId_gte?: InputMaybe<Scalars['String']['input']>;
  messageId_in?: InputMaybe<Array<Scalars['String']['input']>>;
  messageId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  messageId_lt?: InputMaybe<Scalars['String']['input']>;
  messageId_lte?: InputMaybe<Scalars['String']['input']>;
  messageId_not_contains?: InputMaybe<Scalars['String']['input']>;
  messageId_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  messageId_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_not_eq?: InputMaybe<Scalars['String']['input']>;
  messageId_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  messageId_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_startsWith?: InputMaybe<Scalars['String']['input']>;
  nonce_eq?: InputMaybe<Scalars['Int']['input']>;
  nonce_gt?: InputMaybe<Scalars['Int']['input']>;
  nonce_gte?: InputMaybe<Scalars['Int']['input']>;
  nonce_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  nonce_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  nonce_lt?: InputMaybe<Scalars['Int']['input']>;
  nonce_lte?: InputMaybe<Scalars['Int']['input']>;
  nonce_not_eq?: InputMaybe<Scalars['Int']['input']>;
  nonce_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  rewardAddress_contains?: InputMaybe<Scalars['String']['input']>;
  rewardAddress_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  rewardAddress_endsWith?: InputMaybe<Scalars['String']['input']>;
  rewardAddress_eq?: InputMaybe<Scalars['String']['input']>;
  rewardAddress_gt?: InputMaybe<Scalars['String']['input']>;
  rewardAddress_gte?: InputMaybe<Scalars['String']['input']>;
  rewardAddress_in?: InputMaybe<Array<Scalars['String']['input']>>;
  rewardAddress_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  rewardAddress_lt?: InputMaybe<Scalars['String']['input']>;
  rewardAddress_lte?: InputMaybe<Scalars['String']['input']>;
  rewardAddress_not_contains?: InputMaybe<Scalars['String']['input']>;
  rewardAddress_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  rewardAddress_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  rewardAddress_not_eq?: InputMaybe<Scalars['String']['input']>;
  rewardAddress_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  rewardAddress_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  rewardAddress_startsWith?: InputMaybe<Scalars['String']['input']>;
  success_eq?: InputMaybe<Scalars['Boolean']['input']>;
  success_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  success_not_eq?: InputMaybe<Scalars['Boolean']['input']>;
  timestamp_eq?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_gt?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_gte?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  timestamp_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  timestamp_lt?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_lte?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_not_eq?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  txHash_contains?: InputMaybe<Scalars['String']['input']>;
  txHash_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  txHash_endsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_eq?: InputMaybe<Scalars['String']['input']>;
  txHash_gt?: InputMaybe<Scalars['String']['input']>;
  txHash_gte?: InputMaybe<Scalars['String']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['String']['input']>>;
  txHash_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  txHash_lt?: InputMaybe<Scalars['String']['input']>;
  txHash_lte?: InputMaybe<Scalars['String']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['String']['input']>;
  txHash_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  txHash_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_not_eq?: InputMaybe<Scalars['String']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  txHash_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_startsWith?: InputMaybe<Scalars['String']['input']>;
};

export enum InboundMessageReceivedOnBridgeHubOrderByInput {
  BlockNumberAsc = 'blockNumber_ASC',
  BlockNumberAscNullsFirst = 'blockNumber_ASC_NULLS_FIRST',
  BlockNumberAscNullsLast = 'blockNumber_ASC_NULLS_LAST',
  BlockNumberDesc = 'blockNumber_DESC',
  BlockNumberDescNullsFirst = 'blockNumber_DESC_NULLS_FIRST',
  BlockNumberDescNullsLast = 'blockNumber_DESC_NULLS_LAST',
  ChannelIdAsc = 'channelId_ASC',
  ChannelIdAscNullsFirst = 'channelId_ASC_NULLS_FIRST',
  ChannelIdAscNullsLast = 'channelId_ASC_NULLS_LAST',
  ChannelIdDesc = 'channelId_DESC',
  ChannelIdDescNullsFirst = 'channelId_DESC_NULLS_FIRST',
  ChannelIdDescNullsLast = 'channelId_DESC_NULLS_LAST',
  EventIdAsc = 'eventId_ASC',
  EventIdAscNullsFirst = 'eventId_ASC_NULLS_FIRST',
  EventIdAscNullsLast = 'eventId_ASC_NULLS_LAST',
  EventIdDesc = 'eventId_DESC',
  EventIdDescNullsFirst = 'eventId_DESC_NULLS_FIRST',
  EventIdDescNullsLast = 'eventId_DESC_NULLS_LAST',
  IdAsc = 'id_ASC',
  IdAscNullsFirst = 'id_ASC_NULLS_FIRST',
  IdAscNullsLast = 'id_ASC_NULLS_LAST',
  IdDesc = 'id_DESC',
  IdDescNullsFirst = 'id_DESC_NULLS_FIRST',
  IdDescNullsLast = 'id_DESC_NULLS_LAST',
  MessageIdAsc = 'messageId_ASC',
  MessageIdAscNullsFirst = 'messageId_ASC_NULLS_FIRST',
  MessageIdAscNullsLast = 'messageId_ASC_NULLS_LAST',
  MessageIdDesc = 'messageId_DESC',
  MessageIdDescNullsFirst = 'messageId_DESC_NULLS_FIRST',
  MessageIdDescNullsLast = 'messageId_DESC_NULLS_LAST',
  NonceAsc = 'nonce_ASC',
  NonceAscNullsFirst = 'nonce_ASC_NULLS_FIRST',
  NonceAscNullsLast = 'nonce_ASC_NULLS_LAST',
  NonceDesc = 'nonce_DESC',
  NonceDescNullsFirst = 'nonce_DESC_NULLS_FIRST',
  NonceDescNullsLast = 'nonce_DESC_NULLS_LAST',
  TimestampAsc = 'timestamp_ASC',
  TimestampAscNullsFirst = 'timestamp_ASC_NULLS_FIRST',
  TimestampAscNullsLast = 'timestamp_ASC_NULLS_LAST',
  TimestampDesc = 'timestamp_DESC',
  TimestampDescNullsFirst = 'timestamp_DESC_NULLS_FIRST',
  TimestampDescNullsLast = 'timestamp_DESC_NULLS_LAST',
  TxHashAsc = 'txHash_ASC',
  TxHashAscNullsFirst = 'txHash_ASC_NULLS_FIRST',
  TxHashAscNullsLast = 'txHash_ASC_NULLS_LAST',
  TxHashDesc = 'txHash_DESC',
  TxHashDescNullsFirst = 'txHash_DESC_NULLS_FIRST',
  TxHashDescNullsLast = 'txHash_DESC_NULLS_LAST'
}

export type InboundMessageReceivedOnBridgeHubWhereInput = {
  AND?: InputMaybe<Array<InboundMessageReceivedOnBridgeHubWhereInput>>;
  OR?: InputMaybe<Array<InboundMessageReceivedOnBridgeHubWhereInput>>;
  blockNumber_eq?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  blockNumber_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  blockNumber_lt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_eq?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  channelId_contains?: InputMaybe<Scalars['String']['input']>;
  channelId_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  channelId_endsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_eq?: InputMaybe<Scalars['String']['input']>;
  channelId_gt?: InputMaybe<Scalars['String']['input']>;
  channelId_gte?: InputMaybe<Scalars['String']['input']>;
  channelId_in?: InputMaybe<Array<Scalars['String']['input']>>;
  channelId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  channelId_lt?: InputMaybe<Scalars['String']['input']>;
  channelId_lte?: InputMaybe<Scalars['String']['input']>;
  channelId_not_contains?: InputMaybe<Scalars['String']['input']>;
  channelId_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  channelId_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_not_eq?: InputMaybe<Scalars['String']['input']>;
  channelId_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  channelId_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_startsWith?: InputMaybe<Scalars['String']['input']>;
  eventId_contains?: InputMaybe<Scalars['String']['input']>;
  eventId_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  eventId_endsWith?: InputMaybe<Scalars['String']['input']>;
  eventId_eq?: InputMaybe<Scalars['String']['input']>;
  eventId_gt?: InputMaybe<Scalars['String']['input']>;
  eventId_gte?: InputMaybe<Scalars['String']['input']>;
  eventId_in?: InputMaybe<Array<Scalars['String']['input']>>;
  eventId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  eventId_lt?: InputMaybe<Scalars['String']['input']>;
  eventId_lte?: InputMaybe<Scalars['String']['input']>;
  eventId_not_contains?: InputMaybe<Scalars['String']['input']>;
  eventId_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  eventId_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  eventId_not_eq?: InputMaybe<Scalars['String']['input']>;
  eventId_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  eventId_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  eventId_startsWith?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  id_endsWith?: InputMaybe<Scalars['String']['input']>;
  id_eq?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<Scalars['String']['input']>>;
  id_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  id_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  id_not_eq?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  id_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  id_startsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_contains?: InputMaybe<Scalars['String']['input']>;
  messageId_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  messageId_endsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_eq?: InputMaybe<Scalars['String']['input']>;
  messageId_gt?: InputMaybe<Scalars['String']['input']>;
  messageId_gte?: InputMaybe<Scalars['String']['input']>;
  messageId_in?: InputMaybe<Array<Scalars['String']['input']>>;
  messageId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  messageId_lt?: InputMaybe<Scalars['String']['input']>;
  messageId_lte?: InputMaybe<Scalars['String']['input']>;
  messageId_not_contains?: InputMaybe<Scalars['String']['input']>;
  messageId_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  messageId_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_not_eq?: InputMaybe<Scalars['String']['input']>;
  messageId_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  messageId_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_startsWith?: InputMaybe<Scalars['String']['input']>;
  nonce_eq?: InputMaybe<Scalars['Int']['input']>;
  nonce_gt?: InputMaybe<Scalars['Int']['input']>;
  nonce_gte?: InputMaybe<Scalars['Int']['input']>;
  nonce_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  nonce_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  nonce_lt?: InputMaybe<Scalars['Int']['input']>;
  nonce_lte?: InputMaybe<Scalars['Int']['input']>;
  nonce_not_eq?: InputMaybe<Scalars['Int']['input']>;
  nonce_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_eq?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_gt?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_gte?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  timestamp_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  timestamp_lt?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_lte?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_not_eq?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  txHash_contains?: InputMaybe<Scalars['String']['input']>;
  txHash_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  txHash_endsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_eq?: InputMaybe<Scalars['String']['input']>;
  txHash_gt?: InputMaybe<Scalars['String']['input']>;
  txHash_gte?: InputMaybe<Scalars['String']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['String']['input']>>;
  txHash_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  txHash_lt?: InputMaybe<Scalars['String']['input']>;
  txHash_lte?: InputMaybe<Scalars['String']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['String']['input']>;
  txHash_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  txHash_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_not_eq?: InputMaybe<Scalars['String']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  txHash_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_startsWith?: InputMaybe<Scalars['String']['input']>;
};

export enum MessageProcessedOnPolkadotOrderByInput {
  BlockNumberAsc = 'blockNumber_ASC',
  BlockNumberAscNullsFirst = 'blockNumber_ASC_NULLS_FIRST',
  BlockNumberAscNullsLast = 'blockNumber_ASC_NULLS_LAST',
  BlockNumberDesc = 'blockNumber_DESC',
  BlockNumberDescNullsFirst = 'blockNumber_DESC_NULLS_FIRST',
  BlockNumberDescNullsLast = 'blockNumber_DESC_NULLS_LAST',
  EventIdAsc = 'eventId_ASC',
  EventIdAscNullsFirst = 'eventId_ASC_NULLS_FIRST',
  EventIdAscNullsLast = 'eventId_ASC_NULLS_LAST',
  EventIdDesc = 'eventId_DESC',
  EventIdDescNullsFirst = 'eventId_DESC_NULLS_FIRST',
  EventIdDescNullsLast = 'eventId_DESC_NULLS_LAST',
  IdAsc = 'id_ASC',
  IdAscNullsFirst = 'id_ASC_NULLS_FIRST',
  IdAscNullsLast = 'id_ASC_NULLS_LAST',
  IdDesc = 'id_DESC',
  IdDescNullsFirst = 'id_DESC_NULLS_FIRST',
  IdDescNullsLast = 'id_DESC_NULLS_LAST',
  MessageIdAsc = 'messageId_ASC',
  MessageIdAscNullsFirst = 'messageId_ASC_NULLS_FIRST',
  MessageIdAscNullsLast = 'messageId_ASC_NULLS_LAST',
  MessageIdDesc = 'messageId_DESC',
  MessageIdDescNullsFirst = 'messageId_DESC_NULLS_FIRST',
  MessageIdDescNullsLast = 'messageId_DESC_NULLS_LAST',
  NetworkAsc = 'network_ASC',
  NetworkAscNullsFirst = 'network_ASC_NULLS_FIRST',
  NetworkAscNullsLast = 'network_ASC_NULLS_LAST',
  NetworkDesc = 'network_DESC',
  NetworkDescNullsFirst = 'network_DESC_NULLS_FIRST',
  NetworkDescNullsLast = 'network_DESC_NULLS_LAST',
  ParaIdAsc = 'paraId_ASC',
  ParaIdAscNullsFirst = 'paraId_ASC_NULLS_FIRST',
  ParaIdAscNullsLast = 'paraId_ASC_NULLS_LAST',
  ParaIdDesc = 'paraId_DESC',
  ParaIdDescNullsFirst = 'paraId_DESC_NULLS_FIRST',
  ParaIdDescNullsLast = 'paraId_DESC_NULLS_LAST',
  SuccessAsc = 'success_ASC',
  SuccessAscNullsFirst = 'success_ASC_NULLS_FIRST',
  SuccessAscNullsLast = 'success_ASC_NULLS_LAST',
  SuccessDesc = 'success_DESC',
  SuccessDescNullsFirst = 'success_DESC_NULLS_FIRST',
  SuccessDescNullsLast = 'success_DESC_NULLS_LAST',
  TimestampAsc = 'timestamp_ASC',
  TimestampAscNullsFirst = 'timestamp_ASC_NULLS_FIRST',
  TimestampAscNullsLast = 'timestamp_ASC_NULLS_LAST',
  TimestampDesc = 'timestamp_DESC',
  TimestampDescNullsFirst = 'timestamp_DESC_NULLS_FIRST',
  TimestampDescNullsLast = 'timestamp_DESC_NULLS_LAST'
}

export type MessageProcessedOnPolkadotWhereInput = {
  AND?: InputMaybe<Array<MessageProcessedOnPolkadotWhereInput>>;
  OR?: InputMaybe<Array<MessageProcessedOnPolkadotWhereInput>>;
  blockNumber_eq?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  blockNumber_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  blockNumber_lt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_eq?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  eventId_contains?: InputMaybe<Scalars['String']['input']>;
  eventId_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  eventId_endsWith?: InputMaybe<Scalars['String']['input']>;
  eventId_eq?: InputMaybe<Scalars['String']['input']>;
  eventId_gt?: InputMaybe<Scalars['String']['input']>;
  eventId_gte?: InputMaybe<Scalars['String']['input']>;
  eventId_in?: InputMaybe<Array<Scalars['String']['input']>>;
  eventId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  eventId_lt?: InputMaybe<Scalars['String']['input']>;
  eventId_lte?: InputMaybe<Scalars['String']['input']>;
  eventId_not_contains?: InputMaybe<Scalars['String']['input']>;
  eventId_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  eventId_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  eventId_not_eq?: InputMaybe<Scalars['String']['input']>;
  eventId_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  eventId_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  eventId_startsWith?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  id_endsWith?: InputMaybe<Scalars['String']['input']>;
  id_eq?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<Scalars['String']['input']>>;
  id_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  id_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  id_not_eq?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  id_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  id_startsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_contains?: InputMaybe<Scalars['String']['input']>;
  messageId_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  messageId_endsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_eq?: InputMaybe<Scalars['String']['input']>;
  messageId_gt?: InputMaybe<Scalars['String']['input']>;
  messageId_gte?: InputMaybe<Scalars['String']['input']>;
  messageId_in?: InputMaybe<Array<Scalars['String']['input']>>;
  messageId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  messageId_lt?: InputMaybe<Scalars['String']['input']>;
  messageId_lte?: InputMaybe<Scalars['String']['input']>;
  messageId_not_contains?: InputMaybe<Scalars['String']['input']>;
  messageId_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  messageId_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_not_eq?: InputMaybe<Scalars['String']['input']>;
  messageId_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  messageId_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_startsWith?: InputMaybe<Scalars['String']['input']>;
  network_contains?: InputMaybe<Scalars['String']['input']>;
  network_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  network_endsWith?: InputMaybe<Scalars['String']['input']>;
  network_eq?: InputMaybe<Scalars['String']['input']>;
  network_gt?: InputMaybe<Scalars['String']['input']>;
  network_gte?: InputMaybe<Scalars['String']['input']>;
  network_in?: InputMaybe<Array<Scalars['String']['input']>>;
  network_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  network_lt?: InputMaybe<Scalars['String']['input']>;
  network_lte?: InputMaybe<Scalars['String']['input']>;
  network_not_contains?: InputMaybe<Scalars['String']['input']>;
  network_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  network_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  network_not_eq?: InputMaybe<Scalars['String']['input']>;
  network_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  network_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  network_startsWith?: InputMaybe<Scalars['String']['input']>;
  paraId_eq?: InputMaybe<Scalars['Int']['input']>;
  paraId_gt?: InputMaybe<Scalars['Int']['input']>;
  paraId_gte?: InputMaybe<Scalars['Int']['input']>;
  paraId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  paraId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  paraId_lt?: InputMaybe<Scalars['Int']['input']>;
  paraId_lte?: InputMaybe<Scalars['Int']['input']>;
  paraId_not_eq?: InputMaybe<Scalars['Int']['input']>;
  paraId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  success_eq?: InputMaybe<Scalars['Boolean']['input']>;
  success_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  success_not_eq?: InputMaybe<Scalars['Boolean']['input']>;
  timestamp_eq?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_gt?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_gte?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  timestamp_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  timestamp_lt?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_lte?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_not_eq?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
};

export enum OutboundMessageAcceptedOnBridgeHubOrderByInput {
  BlockNumberAsc = 'blockNumber_ASC',
  BlockNumberAscNullsFirst = 'blockNumber_ASC_NULLS_FIRST',
  BlockNumberAscNullsLast = 'blockNumber_ASC_NULLS_LAST',
  BlockNumberDesc = 'blockNumber_DESC',
  BlockNumberDescNullsFirst = 'blockNumber_DESC_NULLS_FIRST',
  BlockNumberDescNullsLast = 'blockNumber_DESC_NULLS_LAST',
  ChannelIdAsc = 'channelId_ASC',
  ChannelIdAscNullsFirst = 'channelId_ASC_NULLS_FIRST',
  ChannelIdAscNullsLast = 'channelId_ASC_NULLS_LAST',
  ChannelIdDesc = 'channelId_DESC',
  ChannelIdDescNullsFirst = 'channelId_DESC_NULLS_FIRST',
  ChannelIdDescNullsLast = 'channelId_DESC_NULLS_LAST',
  EventIdAsc = 'eventId_ASC',
  EventIdAscNullsFirst = 'eventId_ASC_NULLS_FIRST',
  EventIdAscNullsLast = 'eventId_ASC_NULLS_LAST',
  EventIdDesc = 'eventId_DESC',
  EventIdDescNullsFirst = 'eventId_DESC_NULLS_FIRST',
  EventIdDescNullsLast = 'eventId_DESC_NULLS_LAST',
  IdAsc = 'id_ASC',
  IdAscNullsFirst = 'id_ASC_NULLS_FIRST',
  IdAscNullsLast = 'id_ASC_NULLS_LAST',
  IdDesc = 'id_DESC',
  IdDescNullsFirst = 'id_DESC_NULLS_FIRST',
  IdDescNullsLast = 'id_DESC_NULLS_LAST',
  MessageIdAsc = 'messageId_ASC',
  MessageIdAscNullsFirst = 'messageId_ASC_NULLS_FIRST',
  MessageIdAscNullsLast = 'messageId_ASC_NULLS_LAST',
  MessageIdDesc = 'messageId_DESC',
  MessageIdDescNullsFirst = 'messageId_DESC_NULLS_FIRST',
  MessageIdDescNullsLast = 'messageId_DESC_NULLS_LAST',
  NonceAsc = 'nonce_ASC',
  NonceAscNullsFirst = 'nonce_ASC_NULLS_FIRST',
  NonceAscNullsLast = 'nonce_ASC_NULLS_LAST',
  NonceDesc = 'nonce_DESC',
  NonceDescNullsFirst = 'nonce_DESC_NULLS_FIRST',
  NonceDescNullsLast = 'nonce_DESC_NULLS_LAST',
  TimestampAsc = 'timestamp_ASC',
  TimestampAscNullsFirst = 'timestamp_ASC_NULLS_FIRST',
  TimestampAscNullsLast = 'timestamp_ASC_NULLS_LAST',
  TimestampDesc = 'timestamp_DESC',
  TimestampDescNullsFirst = 'timestamp_DESC_NULLS_FIRST',
  TimestampDescNullsLast = 'timestamp_DESC_NULLS_LAST'
}

export type OutboundMessageAcceptedOnBridgeHubWhereInput = {
  AND?: InputMaybe<Array<OutboundMessageAcceptedOnBridgeHubWhereInput>>;
  OR?: InputMaybe<Array<OutboundMessageAcceptedOnBridgeHubWhereInput>>;
  blockNumber_eq?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  blockNumber_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  blockNumber_lt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_eq?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  channelId_contains?: InputMaybe<Scalars['String']['input']>;
  channelId_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  channelId_endsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_eq?: InputMaybe<Scalars['String']['input']>;
  channelId_gt?: InputMaybe<Scalars['String']['input']>;
  channelId_gte?: InputMaybe<Scalars['String']['input']>;
  channelId_in?: InputMaybe<Array<Scalars['String']['input']>>;
  channelId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  channelId_lt?: InputMaybe<Scalars['String']['input']>;
  channelId_lte?: InputMaybe<Scalars['String']['input']>;
  channelId_not_contains?: InputMaybe<Scalars['String']['input']>;
  channelId_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  channelId_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_not_eq?: InputMaybe<Scalars['String']['input']>;
  channelId_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  channelId_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_startsWith?: InputMaybe<Scalars['String']['input']>;
  eventId_contains?: InputMaybe<Scalars['String']['input']>;
  eventId_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  eventId_endsWith?: InputMaybe<Scalars['String']['input']>;
  eventId_eq?: InputMaybe<Scalars['String']['input']>;
  eventId_gt?: InputMaybe<Scalars['String']['input']>;
  eventId_gte?: InputMaybe<Scalars['String']['input']>;
  eventId_in?: InputMaybe<Array<Scalars['String']['input']>>;
  eventId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  eventId_lt?: InputMaybe<Scalars['String']['input']>;
  eventId_lte?: InputMaybe<Scalars['String']['input']>;
  eventId_not_contains?: InputMaybe<Scalars['String']['input']>;
  eventId_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  eventId_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  eventId_not_eq?: InputMaybe<Scalars['String']['input']>;
  eventId_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  eventId_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  eventId_startsWith?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  id_endsWith?: InputMaybe<Scalars['String']['input']>;
  id_eq?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<Scalars['String']['input']>>;
  id_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  id_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  id_not_eq?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  id_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  id_startsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_contains?: InputMaybe<Scalars['String']['input']>;
  messageId_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  messageId_endsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_eq?: InputMaybe<Scalars['String']['input']>;
  messageId_gt?: InputMaybe<Scalars['String']['input']>;
  messageId_gte?: InputMaybe<Scalars['String']['input']>;
  messageId_in?: InputMaybe<Array<Scalars['String']['input']>>;
  messageId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  messageId_lt?: InputMaybe<Scalars['String']['input']>;
  messageId_lte?: InputMaybe<Scalars['String']['input']>;
  messageId_not_contains?: InputMaybe<Scalars['String']['input']>;
  messageId_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  messageId_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_not_eq?: InputMaybe<Scalars['String']['input']>;
  messageId_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  messageId_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_startsWith?: InputMaybe<Scalars['String']['input']>;
  nonce_eq?: InputMaybe<Scalars['Int']['input']>;
  nonce_gt?: InputMaybe<Scalars['Int']['input']>;
  nonce_gte?: InputMaybe<Scalars['Int']['input']>;
  nonce_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  nonce_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  nonce_lt?: InputMaybe<Scalars['Int']['input']>;
  nonce_lte?: InputMaybe<Scalars['Int']['input']>;
  nonce_not_eq?: InputMaybe<Scalars['Int']['input']>;
  nonce_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_eq?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_gt?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_gte?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  timestamp_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  timestamp_lt?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_lte?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_not_eq?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
};

export enum OutboundMessageAcceptedOnEthereumOrderByInput {
  BlockNumberAsc = 'blockNumber_ASC',
  BlockNumberAscNullsFirst = 'blockNumber_ASC_NULLS_FIRST',
  BlockNumberAscNullsLast = 'blockNumber_ASC_NULLS_LAST',
  BlockNumberDesc = 'blockNumber_DESC',
  BlockNumberDescNullsFirst = 'blockNumber_DESC_NULLS_FIRST',
  BlockNumberDescNullsLast = 'blockNumber_DESC_NULLS_LAST',
  ChannelIdAsc = 'channelId_ASC',
  ChannelIdAscNullsFirst = 'channelId_ASC_NULLS_FIRST',
  ChannelIdAscNullsLast = 'channelId_ASC_NULLS_LAST',
  ChannelIdDesc = 'channelId_DESC',
  ChannelIdDescNullsFirst = 'channelId_DESC_NULLS_FIRST',
  ChannelIdDescNullsLast = 'channelId_DESC_NULLS_LAST',
  IdAsc = 'id_ASC',
  IdAscNullsFirst = 'id_ASC_NULLS_FIRST',
  IdAscNullsLast = 'id_ASC_NULLS_LAST',
  IdDesc = 'id_DESC',
  IdDescNullsFirst = 'id_DESC_NULLS_FIRST',
  IdDescNullsLast = 'id_DESC_NULLS_LAST',
  MessageIdAsc = 'messageId_ASC',
  MessageIdAscNullsFirst = 'messageId_ASC_NULLS_FIRST',
  MessageIdAscNullsLast = 'messageId_ASC_NULLS_LAST',
  MessageIdDesc = 'messageId_DESC',
  MessageIdDescNullsFirst = 'messageId_DESC_NULLS_FIRST',
  MessageIdDescNullsLast = 'messageId_DESC_NULLS_LAST',
  NonceAsc = 'nonce_ASC',
  NonceAscNullsFirst = 'nonce_ASC_NULLS_FIRST',
  NonceAscNullsLast = 'nonce_ASC_NULLS_LAST',
  NonceDesc = 'nonce_DESC',
  NonceDescNullsFirst = 'nonce_DESC_NULLS_FIRST',
  NonceDescNullsLast = 'nonce_DESC_NULLS_LAST',
  TimestampAsc = 'timestamp_ASC',
  TimestampAscNullsFirst = 'timestamp_ASC_NULLS_FIRST',
  TimestampAscNullsLast = 'timestamp_ASC_NULLS_LAST',
  TimestampDesc = 'timestamp_DESC',
  TimestampDescNullsFirst = 'timestamp_DESC_NULLS_FIRST',
  TimestampDescNullsLast = 'timestamp_DESC_NULLS_LAST',
  TxHashAsc = 'txHash_ASC',
  TxHashAscNullsFirst = 'txHash_ASC_NULLS_FIRST',
  TxHashAscNullsLast = 'txHash_ASC_NULLS_LAST',
  TxHashDesc = 'txHash_DESC',
  TxHashDescNullsFirst = 'txHash_DESC_NULLS_FIRST',
  TxHashDescNullsLast = 'txHash_DESC_NULLS_LAST'
}

export type OutboundMessageAcceptedOnEthereumWhereInput = {
  AND?: InputMaybe<Array<OutboundMessageAcceptedOnEthereumWhereInput>>;
  OR?: InputMaybe<Array<OutboundMessageAcceptedOnEthereumWhereInput>>;
  blockNumber_eq?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  blockNumber_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  blockNumber_lt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_eq?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  channelId_contains?: InputMaybe<Scalars['String']['input']>;
  channelId_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  channelId_endsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_eq?: InputMaybe<Scalars['String']['input']>;
  channelId_gt?: InputMaybe<Scalars['String']['input']>;
  channelId_gte?: InputMaybe<Scalars['String']['input']>;
  channelId_in?: InputMaybe<Array<Scalars['String']['input']>>;
  channelId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  channelId_lt?: InputMaybe<Scalars['String']['input']>;
  channelId_lte?: InputMaybe<Scalars['String']['input']>;
  channelId_not_contains?: InputMaybe<Scalars['String']['input']>;
  channelId_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  channelId_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_not_eq?: InputMaybe<Scalars['String']['input']>;
  channelId_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  channelId_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_startsWith?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  id_endsWith?: InputMaybe<Scalars['String']['input']>;
  id_eq?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<Scalars['String']['input']>>;
  id_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  id_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  id_not_eq?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  id_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  id_startsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_contains?: InputMaybe<Scalars['String']['input']>;
  messageId_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  messageId_endsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_eq?: InputMaybe<Scalars['String']['input']>;
  messageId_gt?: InputMaybe<Scalars['String']['input']>;
  messageId_gte?: InputMaybe<Scalars['String']['input']>;
  messageId_in?: InputMaybe<Array<Scalars['String']['input']>>;
  messageId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  messageId_lt?: InputMaybe<Scalars['String']['input']>;
  messageId_lte?: InputMaybe<Scalars['String']['input']>;
  messageId_not_contains?: InputMaybe<Scalars['String']['input']>;
  messageId_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  messageId_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_not_eq?: InputMaybe<Scalars['String']['input']>;
  messageId_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  messageId_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_startsWith?: InputMaybe<Scalars['String']['input']>;
  nonce_eq?: InputMaybe<Scalars['Int']['input']>;
  nonce_gt?: InputMaybe<Scalars['Int']['input']>;
  nonce_gte?: InputMaybe<Scalars['Int']['input']>;
  nonce_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  nonce_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  nonce_lt?: InputMaybe<Scalars['Int']['input']>;
  nonce_lte?: InputMaybe<Scalars['Int']['input']>;
  nonce_not_eq?: InputMaybe<Scalars['Int']['input']>;
  nonce_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_eq?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_gt?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_gte?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  timestamp_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  timestamp_lt?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_lte?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_not_eq?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  txHash_contains?: InputMaybe<Scalars['String']['input']>;
  txHash_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  txHash_endsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_eq?: InputMaybe<Scalars['String']['input']>;
  txHash_gt?: InputMaybe<Scalars['String']['input']>;
  txHash_gte?: InputMaybe<Scalars['String']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['String']['input']>>;
  txHash_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  txHash_lt?: InputMaybe<Scalars['String']['input']>;
  txHash_lte?: InputMaybe<Scalars['String']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['String']['input']>;
  txHash_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  txHash_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_not_eq?: InputMaybe<Scalars['String']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  txHash_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_startsWith?: InputMaybe<Scalars['String']['input']>;
};

export enum TransferStatusToEthereumOrderByInput {
  AmountAsc = 'amount_ASC',
  AmountAscNullsFirst = 'amount_ASC_NULLS_FIRST',
  AmountAscNullsLast = 'amount_ASC_NULLS_LAST',
  AmountDesc = 'amount_DESC',
  AmountDescNullsFirst = 'amount_DESC_NULLS_FIRST',
  AmountDescNullsLast = 'amount_DESC_NULLS_LAST',
  BlockNumberAsc = 'blockNumber_ASC',
  BlockNumberAscNullsFirst = 'blockNumber_ASC_NULLS_FIRST',
  BlockNumberAscNullsLast = 'blockNumber_ASC_NULLS_LAST',
  BlockNumberDesc = 'blockNumber_DESC',
  BlockNumberDescNullsFirst = 'blockNumber_DESC_NULLS_FIRST',
  BlockNumberDescNullsLast = 'blockNumber_DESC_NULLS_LAST',
  ChannelIdAsc = 'channelId_ASC',
  ChannelIdAscNullsFirst = 'channelId_ASC_NULLS_FIRST',
  ChannelIdAscNullsLast = 'channelId_ASC_NULLS_LAST',
  ChannelIdDesc = 'channelId_DESC',
  ChannelIdDescNullsFirst = 'channelId_DESC_NULLS_FIRST',
  ChannelIdDescNullsLast = 'channelId_DESC_NULLS_LAST',
  DestinationAddressAsc = 'destinationAddress_ASC',
  DestinationAddressAscNullsFirst = 'destinationAddress_ASC_NULLS_FIRST',
  DestinationAddressAscNullsLast = 'destinationAddress_ASC_NULLS_LAST',
  DestinationAddressDesc = 'destinationAddress_DESC',
  DestinationAddressDescNullsFirst = 'destinationAddress_DESC_NULLS_FIRST',
  DestinationAddressDescNullsLast = 'destinationAddress_DESC_NULLS_LAST',
  IdAsc = 'id_ASC',
  IdAscNullsFirst = 'id_ASC_NULLS_FIRST',
  IdAscNullsLast = 'id_ASC_NULLS_LAST',
  IdDesc = 'id_DESC',
  IdDescNullsFirst = 'id_DESC_NULLS_FIRST',
  IdDescNullsLast = 'id_DESC_NULLS_LAST',
  MessageIdAsc = 'messageId_ASC',
  MessageIdAscNullsFirst = 'messageId_ASC_NULLS_FIRST',
  MessageIdAscNullsLast = 'messageId_ASC_NULLS_LAST',
  MessageIdDesc = 'messageId_DESC',
  MessageIdDescNullsFirst = 'messageId_DESC_NULLS_FIRST',
  MessageIdDescNullsLast = 'messageId_DESC_NULLS_LAST',
  NonceAsc = 'nonce_ASC',
  NonceAscNullsFirst = 'nonce_ASC_NULLS_FIRST',
  NonceAscNullsLast = 'nonce_ASC_NULLS_LAST',
  NonceDesc = 'nonce_DESC',
  NonceDescNullsFirst = 'nonce_DESC_NULLS_FIRST',
  NonceDescNullsLast = 'nonce_DESC_NULLS_LAST',
  SenderAddressAsc = 'senderAddress_ASC',
  SenderAddressAscNullsFirst = 'senderAddress_ASC_NULLS_FIRST',
  SenderAddressAscNullsLast = 'senderAddress_ASC_NULLS_LAST',
  SenderAddressDesc = 'senderAddress_DESC',
  SenderAddressDescNullsFirst = 'senderAddress_DESC_NULLS_FIRST',
  SenderAddressDescNullsLast = 'senderAddress_DESC_NULLS_LAST',
  SourceParaIdAsc = 'sourceParaId_ASC',
  SourceParaIdAscNullsFirst = 'sourceParaId_ASC_NULLS_FIRST',
  SourceParaIdAscNullsLast = 'sourceParaId_ASC_NULLS_LAST',
  SourceParaIdDesc = 'sourceParaId_DESC',
  SourceParaIdDescNullsFirst = 'sourceParaId_DESC_NULLS_FIRST',
  SourceParaIdDescNullsLast = 'sourceParaId_DESC_NULLS_LAST',
  StatusAsc = 'status_ASC',
  StatusAscNullsFirst = 'status_ASC_NULLS_FIRST',
  StatusAscNullsLast = 'status_ASC_NULLS_LAST',
  StatusDesc = 'status_DESC',
  StatusDescNullsFirst = 'status_DESC_NULLS_FIRST',
  StatusDescNullsLast = 'status_DESC_NULLS_LAST',
  TimestampAsc = 'timestamp_ASC',
  TimestampAscNullsFirst = 'timestamp_ASC_NULLS_FIRST',
  TimestampAscNullsLast = 'timestamp_ASC_NULLS_LAST',
  TimestampDesc = 'timestamp_DESC',
  TimestampDescNullsFirst = 'timestamp_DESC_NULLS_FIRST',
  TimestampDescNullsLast = 'timestamp_DESC_NULLS_LAST',
  ToAssetHubMessageQueueBlockNumberAsc = 'toAssetHubMessageQueue_blockNumber_ASC',
  ToAssetHubMessageQueueBlockNumberAscNullsFirst = 'toAssetHubMessageQueue_blockNumber_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueBlockNumberAscNullsLast = 'toAssetHubMessageQueue_blockNumber_ASC_NULLS_LAST',
  ToAssetHubMessageQueueBlockNumberDesc = 'toAssetHubMessageQueue_blockNumber_DESC',
  ToAssetHubMessageQueueBlockNumberDescNullsFirst = 'toAssetHubMessageQueue_blockNumber_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueBlockNumberDescNullsLast = 'toAssetHubMessageQueue_blockNumber_DESC_NULLS_LAST',
  ToAssetHubMessageQueueEventIdAsc = 'toAssetHubMessageQueue_eventId_ASC',
  ToAssetHubMessageQueueEventIdAscNullsFirst = 'toAssetHubMessageQueue_eventId_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueEventIdAscNullsLast = 'toAssetHubMessageQueue_eventId_ASC_NULLS_LAST',
  ToAssetHubMessageQueueEventIdDesc = 'toAssetHubMessageQueue_eventId_DESC',
  ToAssetHubMessageQueueEventIdDescNullsFirst = 'toAssetHubMessageQueue_eventId_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueEventIdDescNullsLast = 'toAssetHubMessageQueue_eventId_DESC_NULLS_LAST',
  ToAssetHubMessageQueueIdAsc = 'toAssetHubMessageQueue_id_ASC',
  ToAssetHubMessageQueueIdAscNullsFirst = 'toAssetHubMessageQueue_id_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueIdAscNullsLast = 'toAssetHubMessageQueue_id_ASC_NULLS_LAST',
  ToAssetHubMessageQueueIdDesc = 'toAssetHubMessageQueue_id_DESC',
  ToAssetHubMessageQueueIdDescNullsFirst = 'toAssetHubMessageQueue_id_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueIdDescNullsLast = 'toAssetHubMessageQueue_id_DESC_NULLS_LAST',
  ToAssetHubMessageQueueMessageIdAsc = 'toAssetHubMessageQueue_messageId_ASC',
  ToAssetHubMessageQueueMessageIdAscNullsFirst = 'toAssetHubMessageQueue_messageId_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueMessageIdAscNullsLast = 'toAssetHubMessageQueue_messageId_ASC_NULLS_LAST',
  ToAssetHubMessageQueueMessageIdDesc = 'toAssetHubMessageQueue_messageId_DESC',
  ToAssetHubMessageQueueMessageIdDescNullsFirst = 'toAssetHubMessageQueue_messageId_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueMessageIdDescNullsLast = 'toAssetHubMessageQueue_messageId_DESC_NULLS_LAST',
  ToAssetHubMessageQueueNetworkAsc = 'toAssetHubMessageQueue_network_ASC',
  ToAssetHubMessageQueueNetworkAscNullsFirst = 'toAssetHubMessageQueue_network_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueNetworkAscNullsLast = 'toAssetHubMessageQueue_network_ASC_NULLS_LAST',
  ToAssetHubMessageQueueNetworkDesc = 'toAssetHubMessageQueue_network_DESC',
  ToAssetHubMessageQueueNetworkDescNullsFirst = 'toAssetHubMessageQueue_network_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueNetworkDescNullsLast = 'toAssetHubMessageQueue_network_DESC_NULLS_LAST',
  ToAssetHubMessageQueueParaIdAsc = 'toAssetHubMessageQueue_paraId_ASC',
  ToAssetHubMessageQueueParaIdAscNullsFirst = 'toAssetHubMessageQueue_paraId_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueParaIdAscNullsLast = 'toAssetHubMessageQueue_paraId_ASC_NULLS_LAST',
  ToAssetHubMessageQueueParaIdDesc = 'toAssetHubMessageQueue_paraId_DESC',
  ToAssetHubMessageQueueParaIdDescNullsFirst = 'toAssetHubMessageQueue_paraId_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueParaIdDescNullsLast = 'toAssetHubMessageQueue_paraId_DESC_NULLS_LAST',
  ToAssetHubMessageQueueSuccessAsc = 'toAssetHubMessageQueue_success_ASC',
  ToAssetHubMessageQueueSuccessAscNullsFirst = 'toAssetHubMessageQueue_success_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueSuccessAscNullsLast = 'toAssetHubMessageQueue_success_ASC_NULLS_LAST',
  ToAssetHubMessageQueueSuccessDesc = 'toAssetHubMessageQueue_success_DESC',
  ToAssetHubMessageQueueSuccessDescNullsFirst = 'toAssetHubMessageQueue_success_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueSuccessDescNullsLast = 'toAssetHubMessageQueue_success_DESC_NULLS_LAST',
  ToAssetHubMessageQueueTimestampAsc = 'toAssetHubMessageQueue_timestamp_ASC',
  ToAssetHubMessageQueueTimestampAscNullsFirst = 'toAssetHubMessageQueue_timestamp_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueTimestampAscNullsLast = 'toAssetHubMessageQueue_timestamp_ASC_NULLS_LAST',
  ToAssetHubMessageQueueTimestampDesc = 'toAssetHubMessageQueue_timestamp_DESC',
  ToAssetHubMessageQueueTimestampDescNullsFirst = 'toAssetHubMessageQueue_timestamp_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueTimestampDescNullsLast = 'toAssetHubMessageQueue_timestamp_DESC_NULLS_LAST',
  ToBridgeHubMessageQueueBlockNumberAsc = 'toBridgeHubMessageQueue_blockNumber_ASC',
  ToBridgeHubMessageQueueBlockNumberAscNullsFirst = 'toBridgeHubMessageQueue_blockNumber_ASC_NULLS_FIRST',
  ToBridgeHubMessageQueueBlockNumberAscNullsLast = 'toBridgeHubMessageQueue_blockNumber_ASC_NULLS_LAST',
  ToBridgeHubMessageQueueBlockNumberDesc = 'toBridgeHubMessageQueue_blockNumber_DESC',
  ToBridgeHubMessageQueueBlockNumberDescNullsFirst = 'toBridgeHubMessageQueue_blockNumber_DESC_NULLS_FIRST',
  ToBridgeHubMessageQueueBlockNumberDescNullsLast = 'toBridgeHubMessageQueue_blockNumber_DESC_NULLS_LAST',
  ToBridgeHubMessageQueueEventIdAsc = 'toBridgeHubMessageQueue_eventId_ASC',
  ToBridgeHubMessageQueueEventIdAscNullsFirst = 'toBridgeHubMessageQueue_eventId_ASC_NULLS_FIRST',
  ToBridgeHubMessageQueueEventIdAscNullsLast = 'toBridgeHubMessageQueue_eventId_ASC_NULLS_LAST',
  ToBridgeHubMessageQueueEventIdDesc = 'toBridgeHubMessageQueue_eventId_DESC',
  ToBridgeHubMessageQueueEventIdDescNullsFirst = 'toBridgeHubMessageQueue_eventId_DESC_NULLS_FIRST',
  ToBridgeHubMessageQueueEventIdDescNullsLast = 'toBridgeHubMessageQueue_eventId_DESC_NULLS_LAST',
  ToBridgeHubMessageQueueIdAsc = 'toBridgeHubMessageQueue_id_ASC',
  ToBridgeHubMessageQueueIdAscNullsFirst = 'toBridgeHubMessageQueue_id_ASC_NULLS_FIRST',
  ToBridgeHubMessageQueueIdAscNullsLast = 'toBridgeHubMessageQueue_id_ASC_NULLS_LAST',
  ToBridgeHubMessageQueueIdDesc = 'toBridgeHubMessageQueue_id_DESC',
  ToBridgeHubMessageQueueIdDescNullsFirst = 'toBridgeHubMessageQueue_id_DESC_NULLS_FIRST',
  ToBridgeHubMessageQueueIdDescNullsLast = 'toBridgeHubMessageQueue_id_DESC_NULLS_LAST',
  ToBridgeHubMessageQueueMessageIdAsc = 'toBridgeHubMessageQueue_messageId_ASC',
  ToBridgeHubMessageQueueMessageIdAscNullsFirst = 'toBridgeHubMessageQueue_messageId_ASC_NULLS_FIRST',
  ToBridgeHubMessageQueueMessageIdAscNullsLast = 'toBridgeHubMessageQueue_messageId_ASC_NULLS_LAST',
  ToBridgeHubMessageQueueMessageIdDesc = 'toBridgeHubMessageQueue_messageId_DESC',
  ToBridgeHubMessageQueueMessageIdDescNullsFirst = 'toBridgeHubMessageQueue_messageId_DESC_NULLS_FIRST',
  ToBridgeHubMessageQueueMessageIdDescNullsLast = 'toBridgeHubMessageQueue_messageId_DESC_NULLS_LAST',
  ToBridgeHubMessageQueueNetworkAsc = 'toBridgeHubMessageQueue_network_ASC',
  ToBridgeHubMessageQueueNetworkAscNullsFirst = 'toBridgeHubMessageQueue_network_ASC_NULLS_FIRST',
  ToBridgeHubMessageQueueNetworkAscNullsLast = 'toBridgeHubMessageQueue_network_ASC_NULLS_LAST',
  ToBridgeHubMessageQueueNetworkDesc = 'toBridgeHubMessageQueue_network_DESC',
  ToBridgeHubMessageQueueNetworkDescNullsFirst = 'toBridgeHubMessageQueue_network_DESC_NULLS_FIRST',
  ToBridgeHubMessageQueueNetworkDescNullsLast = 'toBridgeHubMessageQueue_network_DESC_NULLS_LAST',
  ToBridgeHubMessageQueueParaIdAsc = 'toBridgeHubMessageQueue_paraId_ASC',
  ToBridgeHubMessageQueueParaIdAscNullsFirst = 'toBridgeHubMessageQueue_paraId_ASC_NULLS_FIRST',
  ToBridgeHubMessageQueueParaIdAscNullsLast = 'toBridgeHubMessageQueue_paraId_ASC_NULLS_LAST',
  ToBridgeHubMessageQueueParaIdDesc = 'toBridgeHubMessageQueue_paraId_DESC',
  ToBridgeHubMessageQueueParaIdDescNullsFirst = 'toBridgeHubMessageQueue_paraId_DESC_NULLS_FIRST',
  ToBridgeHubMessageQueueParaIdDescNullsLast = 'toBridgeHubMessageQueue_paraId_DESC_NULLS_LAST',
  ToBridgeHubMessageQueueSuccessAsc = 'toBridgeHubMessageQueue_success_ASC',
  ToBridgeHubMessageQueueSuccessAscNullsFirst = 'toBridgeHubMessageQueue_success_ASC_NULLS_FIRST',
  ToBridgeHubMessageQueueSuccessAscNullsLast = 'toBridgeHubMessageQueue_success_ASC_NULLS_LAST',
  ToBridgeHubMessageQueueSuccessDesc = 'toBridgeHubMessageQueue_success_DESC',
  ToBridgeHubMessageQueueSuccessDescNullsFirst = 'toBridgeHubMessageQueue_success_DESC_NULLS_FIRST',
  ToBridgeHubMessageQueueSuccessDescNullsLast = 'toBridgeHubMessageQueue_success_DESC_NULLS_LAST',
  ToBridgeHubMessageQueueTimestampAsc = 'toBridgeHubMessageQueue_timestamp_ASC',
  ToBridgeHubMessageQueueTimestampAscNullsFirst = 'toBridgeHubMessageQueue_timestamp_ASC_NULLS_FIRST',
  ToBridgeHubMessageQueueTimestampAscNullsLast = 'toBridgeHubMessageQueue_timestamp_ASC_NULLS_LAST',
  ToBridgeHubMessageQueueTimestampDesc = 'toBridgeHubMessageQueue_timestamp_DESC',
  ToBridgeHubMessageQueueTimestampDescNullsFirst = 'toBridgeHubMessageQueue_timestamp_DESC_NULLS_FIRST',
  ToBridgeHubMessageQueueTimestampDescNullsLast = 'toBridgeHubMessageQueue_timestamp_DESC_NULLS_LAST',
  ToBridgeHubOutboundQueueBlockNumberAsc = 'toBridgeHubOutboundQueue_blockNumber_ASC',
  ToBridgeHubOutboundQueueBlockNumberAscNullsFirst = 'toBridgeHubOutboundQueue_blockNumber_ASC_NULLS_FIRST',
  ToBridgeHubOutboundQueueBlockNumberAscNullsLast = 'toBridgeHubOutboundQueue_blockNumber_ASC_NULLS_LAST',
  ToBridgeHubOutboundQueueBlockNumberDesc = 'toBridgeHubOutboundQueue_blockNumber_DESC',
  ToBridgeHubOutboundQueueBlockNumberDescNullsFirst = 'toBridgeHubOutboundQueue_blockNumber_DESC_NULLS_FIRST',
  ToBridgeHubOutboundQueueBlockNumberDescNullsLast = 'toBridgeHubOutboundQueue_blockNumber_DESC_NULLS_LAST',
  ToBridgeHubOutboundQueueChannelIdAsc = 'toBridgeHubOutboundQueue_channelId_ASC',
  ToBridgeHubOutboundQueueChannelIdAscNullsFirst = 'toBridgeHubOutboundQueue_channelId_ASC_NULLS_FIRST',
  ToBridgeHubOutboundQueueChannelIdAscNullsLast = 'toBridgeHubOutboundQueue_channelId_ASC_NULLS_LAST',
  ToBridgeHubOutboundQueueChannelIdDesc = 'toBridgeHubOutboundQueue_channelId_DESC',
  ToBridgeHubOutboundQueueChannelIdDescNullsFirst = 'toBridgeHubOutboundQueue_channelId_DESC_NULLS_FIRST',
  ToBridgeHubOutboundQueueChannelIdDescNullsLast = 'toBridgeHubOutboundQueue_channelId_DESC_NULLS_LAST',
  ToBridgeHubOutboundQueueEventIdAsc = 'toBridgeHubOutboundQueue_eventId_ASC',
  ToBridgeHubOutboundQueueEventIdAscNullsFirst = 'toBridgeHubOutboundQueue_eventId_ASC_NULLS_FIRST',
  ToBridgeHubOutboundQueueEventIdAscNullsLast = 'toBridgeHubOutboundQueue_eventId_ASC_NULLS_LAST',
  ToBridgeHubOutboundQueueEventIdDesc = 'toBridgeHubOutboundQueue_eventId_DESC',
  ToBridgeHubOutboundQueueEventIdDescNullsFirst = 'toBridgeHubOutboundQueue_eventId_DESC_NULLS_FIRST',
  ToBridgeHubOutboundQueueEventIdDescNullsLast = 'toBridgeHubOutboundQueue_eventId_DESC_NULLS_LAST',
  ToBridgeHubOutboundQueueIdAsc = 'toBridgeHubOutboundQueue_id_ASC',
  ToBridgeHubOutboundQueueIdAscNullsFirst = 'toBridgeHubOutboundQueue_id_ASC_NULLS_FIRST',
  ToBridgeHubOutboundQueueIdAscNullsLast = 'toBridgeHubOutboundQueue_id_ASC_NULLS_LAST',
  ToBridgeHubOutboundQueueIdDesc = 'toBridgeHubOutboundQueue_id_DESC',
  ToBridgeHubOutboundQueueIdDescNullsFirst = 'toBridgeHubOutboundQueue_id_DESC_NULLS_FIRST',
  ToBridgeHubOutboundQueueIdDescNullsLast = 'toBridgeHubOutboundQueue_id_DESC_NULLS_LAST',
  ToBridgeHubOutboundQueueMessageIdAsc = 'toBridgeHubOutboundQueue_messageId_ASC',
  ToBridgeHubOutboundQueueMessageIdAscNullsFirst = 'toBridgeHubOutboundQueue_messageId_ASC_NULLS_FIRST',
  ToBridgeHubOutboundQueueMessageIdAscNullsLast = 'toBridgeHubOutboundQueue_messageId_ASC_NULLS_LAST',
  ToBridgeHubOutboundQueueMessageIdDesc = 'toBridgeHubOutboundQueue_messageId_DESC',
  ToBridgeHubOutboundQueueMessageIdDescNullsFirst = 'toBridgeHubOutboundQueue_messageId_DESC_NULLS_FIRST',
  ToBridgeHubOutboundQueueMessageIdDescNullsLast = 'toBridgeHubOutboundQueue_messageId_DESC_NULLS_LAST',
  ToBridgeHubOutboundQueueNonceAsc = 'toBridgeHubOutboundQueue_nonce_ASC',
  ToBridgeHubOutboundQueueNonceAscNullsFirst = 'toBridgeHubOutboundQueue_nonce_ASC_NULLS_FIRST',
  ToBridgeHubOutboundQueueNonceAscNullsLast = 'toBridgeHubOutboundQueue_nonce_ASC_NULLS_LAST',
  ToBridgeHubOutboundQueueNonceDesc = 'toBridgeHubOutboundQueue_nonce_DESC',
  ToBridgeHubOutboundQueueNonceDescNullsFirst = 'toBridgeHubOutboundQueue_nonce_DESC_NULLS_FIRST',
  ToBridgeHubOutboundQueueNonceDescNullsLast = 'toBridgeHubOutboundQueue_nonce_DESC_NULLS_LAST',
  ToBridgeHubOutboundQueueTimestampAsc = 'toBridgeHubOutboundQueue_timestamp_ASC',
  ToBridgeHubOutboundQueueTimestampAscNullsFirst = 'toBridgeHubOutboundQueue_timestamp_ASC_NULLS_FIRST',
  ToBridgeHubOutboundQueueTimestampAscNullsLast = 'toBridgeHubOutboundQueue_timestamp_ASC_NULLS_LAST',
  ToBridgeHubOutboundQueueTimestampDesc = 'toBridgeHubOutboundQueue_timestamp_DESC',
  ToBridgeHubOutboundQueueTimestampDescNullsFirst = 'toBridgeHubOutboundQueue_timestamp_DESC_NULLS_FIRST',
  ToBridgeHubOutboundQueueTimestampDescNullsLast = 'toBridgeHubOutboundQueue_timestamp_DESC_NULLS_LAST',
  ToDestinationBlockNumberAsc = 'toDestination_blockNumber_ASC',
  ToDestinationBlockNumberAscNullsFirst = 'toDestination_blockNumber_ASC_NULLS_FIRST',
  ToDestinationBlockNumberAscNullsLast = 'toDestination_blockNumber_ASC_NULLS_LAST',
  ToDestinationBlockNumberDesc = 'toDestination_blockNumber_DESC',
  ToDestinationBlockNumberDescNullsFirst = 'toDestination_blockNumber_DESC_NULLS_FIRST',
  ToDestinationBlockNumberDescNullsLast = 'toDestination_blockNumber_DESC_NULLS_LAST',
  ToDestinationChannelIdAsc = 'toDestination_channelId_ASC',
  ToDestinationChannelIdAscNullsFirst = 'toDestination_channelId_ASC_NULLS_FIRST',
  ToDestinationChannelIdAscNullsLast = 'toDestination_channelId_ASC_NULLS_LAST',
  ToDestinationChannelIdDesc = 'toDestination_channelId_DESC',
  ToDestinationChannelIdDescNullsFirst = 'toDestination_channelId_DESC_NULLS_FIRST',
  ToDestinationChannelIdDescNullsLast = 'toDestination_channelId_DESC_NULLS_LAST',
  ToDestinationIdAsc = 'toDestination_id_ASC',
  ToDestinationIdAscNullsFirst = 'toDestination_id_ASC_NULLS_FIRST',
  ToDestinationIdAscNullsLast = 'toDestination_id_ASC_NULLS_LAST',
  ToDestinationIdDesc = 'toDestination_id_DESC',
  ToDestinationIdDescNullsFirst = 'toDestination_id_DESC_NULLS_FIRST',
  ToDestinationIdDescNullsLast = 'toDestination_id_DESC_NULLS_LAST',
  ToDestinationMessageIdAsc = 'toDestination_messageId_ASC',
  ToDestinationMessageIdAscNullsFirst = 'toDestination_messageId_ASC_NULLS_FIRST',
  ToDestinationMessageIdAscNullsLast = 'toDestination_messageId_ASC_NULLS_LAST',
  ToDestinationMessageIdDesc = 'toDestination_messageId_DESC',
  ToDestinationMessageIdDescNullsFirst = 'toDestination_messageId_DESC_NULLS_FIRST',
  ToDestinationMessageIdDescNullsLast = 'toDestination_messageId_DESC_NULLS_LAST',
  ToDestinationNonceAsc = 'toDestination_nonce_ASC',
  ToDestinationNonceAscNullsFirst = 'toDestination_nonce_ASC_NULLS_FIRST',
  ToDestinationNonceAscNullsLast = 'toDestination_nonce_ASC_NULLS_LAST',
  ToDestinationNonceDesc = 'toDestination_nonce_DESC',
  ToDestinationNonceDescNullsFirst = 'toDestination_nonce_DESC_NULLS_FIRST',
  ToDestinationNonceDescNullsLast = 'toDestination_nonce_DESC_NULLS_LAST',
  ToDestinationRewardAddressAsc = 'toDestination_rewardAddress_ASC',
  ToDestinationRewardAddressAscNullsFirst = 'toDestination_rewardAddress_ASC_NULLS_FIRST',
  ToDestinationRewardAddressAscNullsLast = 'toDestination_rewardAddress_ASC_NULLS_LAST',
  ToDestinationRewardAddressDesc = 'toDestination_rewardAddress_DESC',
  ToDestinationRewardAddressDescNullsFirst = 'toDestination_rewardAddress_DESC_NULLS_FIRST',
  ToDestinationRewardAddressDescNullsLast = 'toDestination_rewardAddress_DESC_NULLS_LAST',
  ToDestinationSuccessAsc = 'toDestination_success_ASC',
  ToDestinationSuccessAscNullsFirst = 'toDestination_success_ASC_NULLS_FIRST',
  ToDestinationSuccessAscNullsLast = 'toDestination_success_ASC_NULLS_LAST',
  ToDestinationSuccessDesc = 'toDestination_success_DESC',
  ToDestinationSuccessDescNullsFirst = 'toDestination_success_DESC_NULLS_FIRST',
  ToDestinationSuccessDescNullsLast = 'toDestination_success_DESC_NULLS_LAST',
  ToDestinationTimestampAsc = 'toDestination_timestamp_ASC',
  ToDestinationTimestampAscNullsFirst = 'toDestination_timestamp_ASC_NULLS_FIRST',
  ToDestinationTimestampAscNullsLast = 'toDestination_timestamp_ASC_NULLS_LAST',
  ToDestinationTimestampDesc = 'toDestination_timestamp_DESC',
  ToDestinationTimestampDescNullsFirst = 'toDestination_timestamp_DESC_NULLS_FIRST',
  ToDestinationTimestampDescNullsLast = 'toDestination_timestamp_DESC_NULLS_LAST',
  ToDestinationTxHashAsc = 'toDestination_txHash_ASC',
  ToDestinationTxHashAscNullsFirst = 'toDestination_txHash_ASC_NULLS_FIRST',
  ToDestinationTxHashAscNullsLast = 'toDestination_txHash_ASC_NULLS_LAST',
  ToDestinationTxHashDesc = 'toDestination_txHash_DESC',
  ToDestinationTxHashDescNullsFirst = 'toDestination_txHash_DESC_NULLS_FIRST',
  ToDestinationTxHashDescNullsLast = 'toDestination_txHash_DESC_NULLS_LAST',
  TokenAddressAsc = 'tokenAddress_ASC',
  TokenAddressAscNullsFirst = 'tokenAddress_ASC_NULLS_FIRST',
  TokenAddressAscNullsLast = 'tokenAddress_ASC_NULLS_LAST',
  TokenAddressDesc = 'tokenAddress_DESC',
  TokenAddressDescNullsFirst = 'tokenAddress_DESC_NULLS_FIRST',
  TokenAddressDescNullsLast = 'tokenAddress_DESC_NULLS_LAST',
  TokenLocationAsc = 'tokenLocation_ASC',
  TokenLocationAscNullsFirst = 'tokenLocation_ASC_NULLS_FIRST',
  TokenLocationAscNullsLast = 'tokenLocation_ASC_NULLS_LAST',
  TokenLocationDesc = 'tokenLocation_DESC',
  TokenLocationDescNullsFirst = 'tokenLocation_DESC_NULLS_FIRST',
  TokenLocationDescNullsLast = 'tokenLocation_DESC_NULLS_LAST',
  TxHashAsc = 'txHash_ASC',
  TxHashAscNullsFirst = 'txHash_ASC_NULLS_FIRST',
  TxHashAscNullsLast = 'txHash_ASC_NULLS_LAST',
  TxHashDesc = 'txHash_DESC',
  TxHashDescNullsFirst = 'txHash_DESC_NULLS_FIRST',
  TxHashDescNullsLast = 'txHash_DESC_NULLS_LAST'
}

export enum TransferStatusToEthereumV2OrderByInput {
  AmountAsc = 'amount_ASC',
  AmountAscNullsFirst = 'amount_ASC_NULLS_FIRST',
  AmountAscNullsLast = 'amount_ASC_NULLS_LAST',
  AmountDesc = 'amount_DESC',
  AmountDescNullsFirst = 'amount_DESC_NULLS_FIRST',
  AmountDescNullsLast = 'amount_DESC_NULLS_LAST',
  BlockNumberAsc = 'blockNumber_ASC',
  BlockNumberAscNullsFirst = 'blockNumber_ASC_NULLS_FIRST',
  BlockNumberAscNullsLast = 'blockNumber_ASC_NULLS_LAST',
  BlockNumberDesc = 'blockNumber_DESC',
  BlockNumberDescNullsFirst = 'blockNumber_DESC_NULLS_FIRST',
  BlockNumberDescNullsLast = 'blockNumber_DESC_NULLS_LAST',
  ChannelIdAsc = 'channelId_ASC',
  ChannelIdAscNullsFirst = 'channelId_ASC_NULLS_FIRST',
  ChannelIdAscNullsLast = 'channelId_ASC_NULLS_LAST',
  ChannelIdDesc = 'channelId_DESC',
  ChannelIdDescNullsFirst = 'channelId_DESC_NULLS_FIRST',
  ChannelIdDescNullsLast = 'channelId_DESC_NULLS_LAST',
  ClaimerAsc = 'claimer_ASC',
  ClaimerAscNullsFirst = 'claimer_ASC_NULLS_FIRST',
  ClaimerAscNullsLast = 'claimer_ASC_NULLS_LAST',
  ClaimerDesc = 'claimer_DESC',
  ClaimerDescNullsFirst = 'claimer_DESC_NULLS_FIRST',
  ClaimerDescNullsLast = 'claimer_DESC_NULLS_LAST',
  DestinationAddressAsc = 'destinationAddress_ASC',
  DestinationAddressAscNullsFirst = 'destinationAddress_ASC_NULLS_FIRST',
  DestinationAddressAscNullsLast = 'destinationAddress_ASC_NULLS_LAST',
  DestinationAddressDesc = 'destinationAddress_DESC',
  DestinationAddressDescNullsFirst = 'destinationAddress_DESC_NULLS_FIRST',
  DestinationAddressDescNullsLast = 'destinationAddress_DESC_NULLS_LAST',
  FeeAsc = 'fee_ASC',
  FeeAscNullsFirst = 'fee_ASC_NULLS_FIRST',
  FeeAscNullsLast = 'fee_ASC_NULLS_LAST',
  FeeDesc = 'fee_DESC',
  FeeDescNullsFirst = 'fee_DESC_NULLS_FIRST',
  FeeDescNullsLast = 'fee_DESC_NULLS_LAST',
  FromV1Asc = 'fromV1_ASC',
  FromV1AscNullsFirst = 'fromV1_ASC_NULLS_FIRST',
  FromV1AscNullsLast = 'fromV1_ASC_NULLS_LAST',
  FromV1Desc = 'fromV1_DESC',
  FromV1DescNullsFirst = 'fromV1_DESC_NULLS_FIRST',
  FromV1DescNullsLast = 'fromV1_DESC_NULLS_LAST',
  IdAsc = 'id_ASC',
  IdAscNullsFirst = 'id_ASC_NULLS_FIRST',
  IdAscNullsLast = 'id_ASC_NULLS_LAST',
  IdDesc = 'id_DESC',
  IdDescNullsFirst = 'id_DESC_NULLS_FIRST',
  IdDescNullsLast = 'id_DESC_NULLS_LAST',
  MessageIdAsc = 'messageId_ASC',
  MessageIdAscNullsFirst = 'messageId_ASC_NULLS_FIRST',
  MessageIdAscNullsLast = 'messageId_ASC_NULLS_LAST',
  MessageIdDesc = 'messageId_DESC',
  MessageIdDescNullsFirst = 'messageId_DESC_NULLS_FIRST',
  MessageIdDescNullsLast = 'messageId_DESC_NULLS_LAST',
  NonceAsc = 'nonce_ASC',
  NonceAscNullsFirst = 'nonce_ASC_NULLS_FIRST',
  NonceAscNullsLast = 'nonce_ASC_NULLS_LAST',
  NonceDesc = 'nonce_DESC',
  NonceDescNullsFirst = 'nonce_DESC_NULLS_FIRST',
  NonceDescNullsLast = 'nonce_DESC_NULLS_LAST',
  SenderAddressAsc = 'senderAddress_ASC',
  SenderAddressAscNullsFirst = 'senderAddress_ASC_NULLS_FIRST',
  SenderAddressAscNullsLast = 'senderAddress_ASC_NULLS_LAST',
  SenderAddressDesc = 'senderAddress_DESC',
  SenderAddressDescNullsFirst = 'senderAddress_DESC_NULLS_FIRST',
  SenderAddressDescNullsLast = 'senderAddress_DESC_NULLS_LAST',
  SourceParaIdAsc = 'sourceParaId_ASC',
  SourceParaIdAscNullsFirst = 'sourceParaId_ASC_NULLS_FIRST',
  SourceParaIdAscNullsLast = 'sourceParaId_ASC_NULLS_LAST',
  SourceParaIdDesc = 'sourceParaId_DESC',
  SourceParaIdDescNullsFirst = 'sourceParaId_DESC_NULLS_FIRST',
  SourceParaIdDescNullsLast = 'sourceParaId_DESC_NULLS_LAST',
  StatusAsc = 'status_ASC',
  StatusAscNullsFirst = 'status_ASC_NULLS_FIRST',
  StatusAscNullsLast = 'status_ASC_NULLS_LAST',
  StatusDesc = 'status_DESC',
  StatusDescNullsFirst = 'status_DESC_NULLS_FIRST',
  StatusDescNullsLast = 'status_DESC_NULLS_LAST',
  TimestampAsc = 'timestamp_ASC',
  TimestampAscNullsFirst = 'timestamp_ASC_NULLS_FIRST',
  TimestampAscNullsLast = 'timestamp_ASC_NULLS_LAST',
  TimestampDesc = 'timestamp_DESC',
  TimestampDescNullsFirst = 'timestamp_DESC_NULLS_FIRST',
  TimestampDescNullsLast = 'timestamp_DESC_NULLS_LAST',
  ToAssetHubMessageQueueBlockNumberAsc = 'toAssetHubMessageQueue_blockNumber_ASC',
  ToAssetHubMessageQueueBlockNumberAscNullsFirst = 'toAssetHubMessageQueue_blockNumber_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueBlockNumberAscNullsLast = 'toAssetHubMessageQueue_blockNumber_ASC_NULLS_LAST',
  ToAssetHubMessageQueueBlockNumberDesc = 'toAssetHubMessageQueue_blockNumber_DESC',
  ToAssetHubMessageQueueBlockNumberDescNullsFirst = 'toAssetHubMessageQueue_blockNumber_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueBlockNumberDescNullsLast = 'toAssetHubMessageQueue_blockNumber_DESC_NULLS_LAST',
  ToAssetHubMessageQueueEventIdAsc = 'toAssetHubMessageQueue_eventId_ASC',
  ToAssetHubMessageQueueEventIdAscNullsFirst = 'toAssetHubMessageQueue_eventId_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueEventIdAscNullsLast = 'toAssetHubMessageQueue_eventId_ASC_NULLS_LAST',
  ToAssetHubMessageQueueEventIdDesc = 'toAssetHubMessageQueue_eventId_DESC',
  ToAssetHubMessageQueueEventIdDescNullsFirst = 'toAssetHubMessageQueue_eventId_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueEventIdDescNullsLast = 'toAssetHubMessageQueue_eventId_DESC_NULLS_LAST',
  ToAssetHubMessageQueueIdAsc = 'toAssetHubMessageQueue_id_ASC',
  ToAssetHubMessageQueueIdAscNullsFirst = 'toAssetHubMessageQueue_id_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueIdAscNullsLast = 'toAssetHubMessageQueue_id_ASC_NULLS_LAST',
  ToAssetHubMessageQueueIdDesc = 'toAssetHubMessageQueue_id_DESC',
  ToAssetHubMessageQueueIdDescNullsFirst = 'toAssetHubMessageQueue_id_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueIdDescNullsLast = 'toAssetHubMessageQueue_id_DESC_NULLS_LAST',
  ToAssetHubMessageQueueMessageIdAsc = 'toAssetHubMessageQueue_messageId_ASC',
  ToAssetHubMessageQueueMessageIdAscNullsFirst = 'toAssetHubMessageQueue_messageId_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueMessageIdAscNullsLast = 'toAssetHubMessageQueue_messageId_ASC_NULLS_LAST',
  ToAssetHubMessageQueueMessageIdDesc = 'toAssetHubMessageQueue_messageId_DESC',
  ToAssetHubMessageQueueMessageIdDescNullsFirst = 'toAssetHubMessageQueue_messageId_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueMessageIdDescNullsLast = 'toAssetHubMessageQueue_messageId_DESC_NULLS_LAST',
  ToAssetHubMessageQueueNetworkAsc = 'toAssetHubMessageQueue_network_ASC',
  ToAssetHubMessageQueueNetworkAscNullsFirst = 'toAssetHubMessageQueue_network_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueNetworkAscNullsLast = 'toAssetHubMessageQueue_network_ASC_NULLS_LAST',
  ToAssetHubMessageQueueNetworkDesc = 'toAssetHubMessageQueue_network_DESC',
  ToAssetHubMessageQueueNetworkDescNullsFirst = 'toAssetHubMessageQueue_network_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueNetworkDescNullsLast = 'toAssetHubMessageQueue_network_DESC_NULLS_LAST',
  ToAssetHubMessageQueueParaIdAsc = 'toAssetHubMessageQueue_paraId_ASC',
  ToAssetHubMessageQueueParaIdAscNullsFirst = 'toAssetHubMessageQueue_paraId_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueParaIdAscNullsLast = 'toAssetHubMessageQueue_paraId_ASC_NULLS_LAST',
  ToAssetHubMessageQueueParaIdDesc = 'toAssetHubMessageQueue_paraId_DESC',
  ToAssetHubMessageQueueParaIdDescNullsFirst = 'toAssetHubMessageQueue_paraId_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueParaIdDescNullsLast = 'toAssetHubMessageQueue_paraId_DESC_NULLS_LAST',
  ToAssetHubMessageQueueSuccessAsc = 'toAssetHubMessageQueue_success_ASC',
  ToAssetHubMessageQueueSuccessAscNullsFirst = 'toAssetHubMessageQueue_success_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueSuccessAscNullsLast = 'toAssetHubMessageQueue_success_ASC_NULLS_LAST',
  ToAssetHubMessageQueueSuccessDesc = 'toAssetHubMessageQueue_success_DESC',
  ToAssetHubMessageQueueSuccessDescNullsFirst = 'toAssetHubMessageQueue_success_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueSuccessDescNullsLast = 'toAssetHubMessageQueue_success_DESC_NULLS_LAST',
  ToAssetHubMessageQueueTimestampAsc = 'toAssetHubMessageQueue_timestamp_ASC',
  ToAssetHubMessageQueueTimestampAscNullsFirst = 'toAssetHubMessageQueue_timestamp_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueTimestampAscNullsLast = 'toAssetHubMessageQueue_timestamp_ASC_NULLS_LAST',
  ToAssetHubMessageQueueTimestampDesc = 'toAssetHubMessageQueue_timestamp_DESC',
  ToAssetHubMessageQueueTimestampDescNullsFirst = 'toAssetHubMessageQueue_timestamp_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueTimestampDescNullsLast = 'toAssetHubMessageQueue_timestamp_DESC_NULLS_LAST',
  ToBridgeHubMessageQueueBlockNumberAsc = 'toBridgeHubMessageQueue_blockNumber_ASC',
  ToBridgeHubMessageQueueBlockNumberAscNullsFirst = 'toBridgeHubMessageQueue_blockNumber_ASC_NULLS_FIRST',
  ToBridgeHubMessageQueueBlockNumberAscNullsLast = 'toBridgeHubMessageQueue_blockNumber_ASC_NULLS_LAST',
  ToBridgeHubMessageQueueBlockNumberDesc = 'toBridgeHubMessageQueue_blockNumber_DESC',
  ToBridgeHubMessageQueueBlockNumberDescNullsFirst = 'toBridgeHubMessageQueue_blockNumber_DESC_NULLS_FIRST',
  ToBridgeHubMessageQueueBlockNumberDescNullsLast = 'toBridgeHubMessageQueue_blockNumber_DESC_NULLS_LAST',
  ToBridgeHubMessageQueueEventIdAsc = 'toBridgeHubMessageQueue_eventId_ASC',
  ToBridgeHubMessageQueueEventIdAscNullsFirst = 'toBridgeHubMessageQueue_eventId_ASC_NULLS_FIRST',
  ToBridgeHubMessageQueueEventIdAscNullsLast = 'toBridgeHubMessageQueue_eventId_ASC_NULLS_LAST',
  ToBridgeHubMessageQueueEventIdDesc = 'toBridgeHubMessageQueue_eventId_DESC',
  ToBridgeHubMessageQueueEventIdDescNullsFirst = 'toBridgeHubMessageQueue_eventId_DESC_NULLS_FIRST',
  ToBridgeHubMessageQueueEventIdDescNullsLast = 'toBridgeHubMessageQueue_eventId_DESC_NULLS_LAST',
  ToBridgeHubMessageQueueIdAsc = 'toBridgeHubMessageQueue_id_ASC',
  ToBridgeHubMessageQueueIdAscNullsFirst = 'toBridgeHubMessageQueue_id_ASC_NULLS_FIRST',
  ToBridgeHubMessageQueueIdAscNullsLast = 'toBridgeHubMessageQueue_id_ASC_NULLS_LAST',
  ToBridgeHubMessageQueueIdDesc = 'toBridgeHubMessageQueue_id_DESC',
  ToBridgeHubMessageQueueIdDescNullsFirst = 'toBridgeHubMessageQueue_id_DESC_NULLS_FIRST',
  ToBridgeHubMessageQueueIdDescNullsLast = 'toBridgeHubMessageQueue_id_DESC_NULLS_LAST',
  ToBridgeHubMessageQueueMessageIdAsc = 'toBridgeHubMessageQueue_messageId_ASC',
  ToBridgeHubMessageQueueMessageIdAscNullsFirst = 'toBridgeHubMessageQueue_messageId_ASC_NULLS_FIRST',
  ToBridgeHubMessageQueueMessageIdAscNullsLast = 'toBridgeHubMessageQueue_messageId_ASC_NULLS_LAST',
  ToBridgeHubMessageQueueMessageIdDesc = 'toBridgeHubMessageQueue_messageId_DESC',
  ToBridgeHubMessageQueueMessageIdDescNullsFirst = 'toBridgeHubMessageQueue_messageId_DESC_NULLS_FIRST',
  ToBridgeHubMessageQueueMessageIdDescNullsLast = 'toBridgeHubMessageQueue_messageId_DESC_NULLS_LAST',
  ToBridgeHubMessageQueueNetworkAsc = 'toBridgeHubMessageQueue_network_ASC',
  ToBridgeHubMessageQueueNetworkAscNullsFirst = 'toBridgeHubMessageQueue_network_ASC_NULLS_FIRST',
  ToBridgeHubMessageQueueNetworkAscNullsLast = 'toBridgeHubMessageQueue_network_ASC_NULLS_LAST',
  ToBridgeHubMessageQueueNetworkDesc = 'toBridgeHubMessageQueue_network_DESC',
  ToBridgeHubMessageQueueNetworkDescNullsFirst = 'toBridgeHubMessageQueue_network_DESC_NULLS_FIRST',
  ToBridgeHubMessageQueueNetworkDescNullsLast = 'toBridgeHubMessageQueue_network_DESC_NULLS_LAST',
  ToBridgeHubMessageQueueParaIdAsc = 'toBridgeHubMessageQueue_paraId_ASC',
  ToBridgeHubMessageQueueParaIdAscNullsFirst = 'toBridgeHubMessageQueue_paraId_ASC_NULLS_FIRST',
  ToBridgeHubMessageQueueParaIdAscNullsLast = 'toBridgeHubMessageQueue_paraId_ASC_NULLS_LAST',
  ToBridgeHubMessageQueueParaIdDesc = 'toBridgeHubMessageQueue_paraId_DESC',
  ToBridgeHubMessageQueueParaIdDescNullsFirst = 'toBridgeHubMessageQueue_paraId_DESC_NULLS_FIRST',
  ToBridgeHubMessageQueueParaIdDescNullsLast = 'toBridgeHubMessageQueue_paraId_DESC_NULLS_LAST',
  ToBridgeHubMessageQueueSuccessAsc = 'toBridgeHubMessageQueue_success_ASC',
  ToBridgeHubMessageQueueSuccessAscNullsFirst = 'toBridgeHubMessageQueue_success_ASC_NULLS_FIRST',
  ToBridgeHubMessageQueueSuccessAscNullsLast = 'toBridgeHubMessageQueue_success_ASC_NULLS_LAST',
  ToBridgeHubMessageQueueSuccessDesc = 'toBridgeHubMessageQueue_success_DESC',
  ToBridgeHubMessageQueueSuccessDescNullsFirst = 'toBridgeHubMessageQueue_success_DESC_NULLS_FIRST',
  ToBridgeHubMessageQueueSuccessDescNullsLast = 'toBridgeHubMessageQueue_success_DESC_NULLS_LAST',
  ToBridgeHubMessageQueueTimestampAsc = 'toBridgeHubMessageQueue_timestamp_ASC',
  ToBridgeHubMessageQueueTimestampAscNullsFirst = 'toBridgeHubMessageQueue_timestamp_ASC_NULLS_FIRST',
  ToBridgeHubMessageQueueTimestampAscNullsLast = 'toBridgeHubMessageQueue_timestamp_ASC_NULLS_LAST',
  ToBridgeHubMessageQueueTimestampDesc = 'toBridgeHubMessageQueue_timestamp_DESC',
  ToBridgeHubMessageQueueTimestampDescNullsFirst = 'toBridgeHubMessageQueue_timestamp_DESC_NULLS_FIRST',
  ToBridgeHubMessageQueueTimestampDescNullsLast = 'toBridgeHubMessageQueue_timestamp_DESC_NULLS_LAST',
  ToBridgeHubOutboundQueueBlockNumberAsc = 'toBridgeHubOutboundQueue_blockNumber_ASC',
  ToBridgeHubOutboundQueueBlockNumberAscNullsFirst = 'toBridgeHubOutboundQueue_blockNumber_ASC_NULLS_FIRST',
  ToBridgeHubOutboundQueueBlockNumberAscNullsLast = 'toBridgeHubOutboundQueue_blockNumber_ASC_NULLS_LAST',
  ToBridgeHubOutboundQueueBlockNumberDesc = 'toBridgeHubOutboundQueue_blockNumber_DESC',
  ToBridgeHubOutboundQueueBlockNumberDescNullsFirst = 'toBridgeHubOutboundQueue_blockNumber_DESC_NULLS_FIRST',
  ToBridgeHubOutboundQueueBlockNumberDescNullsLast = 'toBridgeHubOutboundQueue_blockNumber_DESC_NULLS_LAST',
  ToBridgeHubOutboundQueueChannelIdAsc = 'toBridgeHubOutboundQueue_channelId_ASC',
  ToBridgeHubOutboundQueueChannelIdAscNullsFirst = 'toBridgeHubOutboundQueue_channelId_ASC_NULLS_FIRST',
  ToBridgeHubOutboundQueueChannelIdAscNullsLast = 'toBridgeHubOutboundQueue_channelId_ASC_NULLS_LAST',
  ToBridgeHubOutboundQueueChannelIdDesc = 'toBridgeHubOutboundQueue_channelId_DESC',
  ToBridgeHubOutboundQueueChannelIdDescNullsFirst = 'toBridgeHubOutboundQueue_channelId_DESC_NULLS_FIRST',
  ToBridgeHubOutboundQueueChannelIdDescNullsLast = 'toBridgeHubOutboundQueue_channelId_DESC_NULLS_LAST',
  ToBridgeHubOutboundQueueEventIdAsc = 'toBridgeHubOutboundQueue_eventId_ASC',
  ToBridgeHubOutboundQueueEventIdAscNullsFirst = 'toBridgeHubOutboundQueue_eventId_ASC_NULLS_FIRST',
  ToBridgeHubOutboundQueueEventIdAscNullsLast = 'toBridgeHubOutboundQueue_eventId_ASC_NULLS_LAST',
  ToBridgeHubOutboundQueueEventIdDesc = 'toBridgeHubOutboundQueue_eventId_DESC',
  ToBridgeHubOutboundQueueEventIdDescNullsFirst = 'toBridgeHubOutboundQueue_eventId_DESC_NULLS_FIRST',
  ToBridgeHubOutboundQueueEventIdDescNullsLast = 'toBridgeHubOutboundQueue_eventId_DESC_NULLS_LAST',
  ToBridgeHubOutboundQueueIdAsc = 'toBridgeHubOutboundQueue_id_ASC',
  ToBridgeHubOutboundQueueIdAscNullsFirst = 'toBridgeHubOutboundQueue_id_ASC_NULLS_FIRST',
  ToBridgeHubOutboundQueueIdAscNullsLast = 'toBridgeHubOutboundQueue_id_ASC_NULLS_LAST',
  ToBridgeHubOutboundQueueIdDesc = 'toBridgeHubOutboundQueue_id_DESC',
  ToBridgeHubOutboundQueueIdDescNullsFirst = 'toBridgeHubOutboundQueue_id_DESC_NULLS_FIRST',
  ToBridgeHubOutboundQueueIdDescNullsLast = 'toBridgeHubOutboundQueue_id_DESC_NULLS_LAST',
  ToBridgeHubOutboundQueueMessageIdAsc = 'toBridgeHubOutboundQueue_messageId_ASC',
  ToBridgeHubOutboundQueueMessageIdAscNullsFirst = 'toBridgeHubOutboundQueue_messageId_ASC_NULLS_FIRST',
  ToBridgeHubOutboundQueueMessageIdAscNullsLast = 'toBridgeHubOutboundQueue_messageId_ASC_NULLS_LAST',
  ToBridgeHubOutboundQueueMessageIdDesc = 'toBridgeHubOutboundQueue_messageId_DESC',
  ToBridgeHubOutboundQueueMessageIdDescNullsFirst = 'toBridgeHubOutboundQueue_messageId_DESC_NULLS_FIRST',
  ToBridgeHubOutboundQueueMessageIdDescNullsLast = 'toBridgeHubOutboundQueue_messageId_DESC_NULLS_LAST',
  ToBridgeHubOutboundQueueNonceAsc = 'toBridgeHubOutboundQueue_nonce_ASC',
  ToBridgeHubOutboundQueueNonceAscNullsFirst = 'toBridgeHubOutboundQueue_nonce_ASC_NULLS_FIRST',
  ToBridgeHubOutboundQueueNonceAscNullsLast = 'toBridgeHubOutboundQueue_nonce_ASC_NULLS_LAST',
  ToBridgeHubOutboundQueueNonceDesc = 'toBridgeHubOutboundQueue_nonce_DESC',
  ToBridgeHubOutboundQueueNonceDescNullsFirst = 'toBridgeHubOutboundQueue_nonce_DESC_NULLS_FIRST',
  ToBridgeHubOutboundQueueNonceDescNullsLast = 'toBridgeHubOutboundQueue_nonce_DESC_NULLS_LAST',
  ToBridgeHubOutboundQueueTimestampAsc = 'toBridgeHubOutboundQueue_timestamp_ASC',
  ToBridgeHubOutboundQueueTimestampAscNullsFirst = 'toBridgeHubOutboundQueue_timestamp_ASC_NULLS_FIRST',
  ToBridgeHubOutboundQueueTimestampAscNullsLast = 'toBridgeHubOutboundQueue_timestamp_ASC_NULLS_LAST',
  ToBridgeHubOutboundQueueTimestampDesc = 'toBridgeHubOutboundQueue_timestamp_DESC',
  ToBridgeHubOutboundQueueTimestampDescNullsFirst = 'toBridgeHubOutboundQueue_timestamp_DESC_NULLS_FIRST',
  ToBridgeHubOutboundQueueTimestampDescNullsLast = 'toBridgeHubOutboundQueue_timestamp_DESC_NULLS_LAST',
  ToDestinationBlockNumberAsc = 'toDestination_blockNumber_ASC',
  ToDestinationBlockNumberAscNullsFirst = 'toDestination_blockNumber_ASC_NULLS_FIRST',
  ToDestinationBlockNumberAscNullsLast = 'toDestination_blockNumber_ASC_NULLS_LAST',
  ToDestinationBlockNumberDesc = 'toDestination_blockNumber_DESC',
  ToDestinationBlockNumberDescNullsFirst = 'toDestination_blockNumber_DESC_NULLS_FIRST',
  ToDestinationBlockNumberDescNullsLast = 'toDestination_blockNumber_DESC_NULLS_LAST',
  ToDestinationChannelIdAsc = 'toDestination_channelId_ASC',
  ToDestinationChannelIdAscNullsFirst = 'toDestination_channelId_ASC_NULLS_FIRST',
  ToDestinationChannelIdAscNullsLast = 'toDestination_channelId_ASC_NULLS_LAST',
  ToDestinationChannelIdDesc = 'toDestination_channelId_DESC',
  ToDestinationChannelIdDescNullsFirst = 'toDestination_channelId_DESC_NULLS_FIRST',
  ToDestinationChannelIdDescNullsLast = 'toDestination_channelId_DESC_NULLS_LAST',
  ToDestinationIdAsc = 'toDestination_id_ASC',
  ToDestinationIdAscNullsFirst = 'toDestination_id_ASC_NULLS_FIRST',
  ToDestinationIdAscNullsLast = 'toDestination_id_ASC_NULLS_LAST',
  ToDestinationIdDesc = 'toDestination_id_DESC',
  ToDestinationIdDescNullsFirst = 'toDestination_id_DESC_NULLS_FIRST',
  ToDestinationIdDescNullsLast = 'toDestination_id_DESC_NULLS_LAST',
  ToDestinationMessageIdAsc = 'toDestination_messageId_ASC',
  ToDestinationMessageIdAscNullsFirst = 'toDestination_messageId_ASC_NULLS_FIRST',
  ToDestinationMessageIdAscNullsLast = 'toDestination_messageId_ASC_NULLS_LAST',
  ToDestinationMessageIdDesc = 'toDestination_messageId_DESC',
  ToDestinationMessageIdDescNullsFirst = 'toDestination_messageId_DESC_NULLS_FIRST',
  ToDestinationMessageIdDescNullsLast = 'toDestination_messageId_DESC_NULLS_LAST',
  ToDestinationNonceAsc = 'toDestination_nonce_ASC',
  ToDestinationNonceAscNullsFirst = 'toDestination_nonce_ASC_NULLS_FIRST',
  ToDestinationNonceAscNullsLast = 'toDestination_nonce_ASC_NULLS_LAST',
  ToDestinationNonceDesc = 'toDestination_nonce_DESC',
  ToDestinationNonceDescNullsFirst = 'toDestination_nonce_DESC_NULLS_FIRST',
  ToDestinationNonceDescNullsLast = 'toDestination_nonce_DESC_NULLS_LAST',
  ToDestinationRewardAddressAsc = 'toDestination_rewardAddress_ASC',
  ToDestinationRewardAddressAscNullsFirst = 'toDestination_rewardAddress_ASC_NULLS_FIRST',
  ToDestinationRewardAddressAscNullsLast = 'toDestination_rewardAddress_ASC_NULLS_LAST',
  ToDestinationRewardAddressDesc = 'toDestination_rewardAddress_DESC',
  ToDestinationRewardAddressDescNullsFirst = 'toDestination_rewardAddress_DESC_NULLS_FIRST',
  ToDestinationRewardAddressDescNullsLast = 'toDestination_rewardAddress_DESC_NULLS_LAST',
  ToDestinationSuccessAsc = 'toDestination_success_ASC',
  ToDestinationSuccessAscNullsFirst = 'toDestination_success_ASC_NULLS_FIRST',
  ToDestinationSuccessAscNullsLast = 'toDestination_success_ASC_NULLS_LAST',
  ToDestinationSuccessDesc = 'toDestination_success_DESC',
  ToDestinationSuccessDescNullsFirst = 'toDestination_success_DESC_NULLS_FIRST',
  ToDestinationSuccessDescNullsLast = 'toDestination_success_DESC_NULLS_LAST',
  ToDestinationTimestampAsc = 'toDestination_timestamp_ASC',
  ToDestinationTimestampAscNullsFirst = 'toDestination_timestamp_ASC_NULLS_FIRST',
  ToDestinationTimestampAscNullsLast = 'toDestination_timestamp_ASC_NULLS_LAST',
  ToDestinationTimestampDesc = 'toDestination_timestamp_DESC',
  ToDestinationTimestampDescNullsFirst = 'toDestination_timestamp_DESC_NULLS_FIRST',
  ToDestinationTimestampDescNullsLast = 'toDestination_timestamp_DESC_NULLS_LAST',
  ToDestinationTxHashAsc = 'toDestination_txHash_ASC',
  ToDestinationTxHashAscNullsFirst = 'toDestination_txHash_ASC_NULLS_FIRST',
  ToDestinationTxHashAscNullsLast = 'toDestination_txHash_ASC_NULLS_LAST',
  ToDestinationTxHashDesc = 'toDestination_txHash_DESC',
  ToDestinationTxHashDescNullsFirst = 'toDestination_txHash_DESC_NULLS_FIRST',
  ToDestinationTxHashDescNullsLast = 'toDestination_txHash_DESC_NULLS_LAST',
  TokenAddressAsc = 'tokenAddress_ASC',
  TokenAddressAscNullsFirst = 'tokenAddress_ASC_NULLS_FIRST',
  TokenAddressAscNullsLast = 'tokenAddress_ASC_NULLS_LAST',
  TokenAddressDesc = 'tokenAddress_DESC',
  TokenAddressDescNullsFirst = 'tokenAddress_DESC_NULLS_FIRST',
  TokenAddressDescNullsLast = 'tokenAddress_DESC_NULLS_LAST',
  TokenLocationAsc = 'tokenLocation_ASC',
  TokenLocationAscNullsFirst = 'tokenLocation_ASC_NULLS_FIRST',
  TokenLocationAscNullsLast = 'tokenLocation_ASC_NULLS_LAST',
  TokenLocationDesc = 'tokenLocation_DESC',
  TokenLocationDescNullsFirst = 'tokenLocation_DESC_NULLS_FIRST',
  TokenLocationDescNullsLast = 'tokenLocation_DESC_NULLS_LAST',
  TxHashAsc = 'txHash_ASC',
  TxHashAscNullsFirst = 'txHash_ASC_NULLS_FIRST',
  TxHashAscNullsLast = 'txHash_ASC_NULLS_LAST',
  TxHashDesc = 'txHash_DESC',
  TxHashDescNullsFirst = 'txHash_DESC_NULLS_FIRST',
  TxHashDescNullsLast = 'txHash_DESC_NULLS_LAST'
}

export type TransferStatusToEthereumV2WhereInput = {
  AND?: InputMaybe<Array<TransferStatusToEthereumV2WhereInput>>;
  OR?: InputMaybe<Array<TransferStatusToEthereumV2WhereInput>>;
  amount_eq?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_eq?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_eq?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  blockNumber_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  blockNumber_lt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_eq?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  channelId_contains?: InputMaybe<Scalars['String']['input']>;
  channelId_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  channelId_endsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_eq?: InputMaybe<Scalars['String']['input']>;
  channelId_gt?: InputMaybe<Scalars['String']['input']>;
  channelId_gte?: InputMaybe<Scalars['String']['input']>;
  channelId_in?: InputMaybe<Array<Scalars['String']['input']>>;
  channelId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  channelId_lt?: InputMaybe<Scalars['String']['input']>;
  channelId_lte?: InputMaybe<Scalars['String']['input']>;
  channelId_not_contains?: InputMaybe<Scalars['String']['input']>;
  channelId_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  channelId_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_not_eq?: InputMaybe<Scalars['String']['input']>;
  channelId_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  channelId_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_startsWith?: InputMaybe<Scalars['String']['input']>;
  claimer_contains?: InputMaybe<Scalars['String']['input']>;
  claimer_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  claimer_endsWith?: InputMaybe<Scalars['String']['input']>;
  claimer_eq?: InputMaybe<Scalars['String']['input']>;
  claimer_gt?: InputMaybe<Scalars['String']['input']>;
  claimer_gte?: InputMaybe<Scalars['String']['input']>;
  claimer_in?: InputMaybe<Array<Scalars['String']['input']>>;
  claimer_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  claimer_lt?: InputMaybe<Scalars['String']['input']>;
  claimer_lte?: InputMaybe<Scalars['String']['input']>;
  claimer_not_contains?: InputMaybe<Scalars['String']['input']>;
  claimer_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  claimer_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  claimer_not_eq?: InputMaybe<Scalars['String']['input']>;
  claimer_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  claimer_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  claimer_startsWith?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_contains?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_endsWith?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_eq?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_gt?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_gte?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_in?: InputMaybe<Array<Scalars['String']['input']>>;
  destinationAddress_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  destinationAddress_lt?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_lte?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_not_contains?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_not_eq?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  destinationAddress_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_startsWith?: InputMaybe<Scalars['String']['input']>;
  fee_eq?: InputMaybe<Scalars['BigInt']['input']>;
  fee_gt?: InputMaybe<Scalars['BigInt']['input']>;
  fee_gte?: InputMaybe<Scalars['BigInt']['input']>;
  fee_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  fee_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  fee_lt?: InputMaybe<Scalars['BigInt']['input']>;
  fee_lte?: InputMaybe<Scalars['BigInt']['input']>;
  fee_not_eq?: InputMaybe<Scalars['BigInt']['input']>;
  fee_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  fromV1_eq?: InputMaybe<Scalars['Boolean']['input']>;
  fromV1_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  fromV1_not_eq?: InputMaybe<Scalars['Boolean']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  id_endsWith?: InputMaybe<Scalars['String']['input']>;
  id_eq?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<Scalars['String']['input']>>;
  id_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  id_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  id_not_eq?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  id_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  id_startsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_contains?: InputMaybe<Scalars['String']['input']>;
  messageId_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  messageId_endsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_eq?: InputMaybe<Scalars['String']['input']>;
  messageId_gt?: InputMaybe<Scalars['String']['input']>;
  messageId_gte?: InputMaybe<Scalars['String']['input']>;
  messageId_in?: InputMaybe<Array<Scalars['String']['input']>>;
  messageId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  messageId_lt?: InputMaybe<Scalars['String']['input']>;
  messageId_lte?: InputMaybe<Scalars['String']['input']>;
  messageId_not_contains?: InputMaybe<Scalars['String']['input']>;
  messageId_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  messageId_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_not_eq?: InputMaybe<Scalars['String']['input']>;
  messageId_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  messageId_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_startsWith?: InputMaybe<Scalars['String']['input']>;
  nonce_eq?: InputMaybe<Scalars['Int']['input']>;
  nonce_gt?: InputMaybe<Scalars['Int']['input']>;
  nonce_gte?: InputMaybe<Scalars['Int']['input']>;
  nonce_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  nonce_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  nonce_lt?: InputMaybe<Scalars['Int']['input']>;
  nonce_lte?: InputMaybe<Scalars['Int']['input']>;
  nonce_not_eq?: InputMaybe<Scalars['Int']['input']>;
  nonce_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  senderAddress_contains?: InputMaybe<Scalars['String']['input']>;
  senderAddress_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  senderAddress_endsWith?: InputMaybe<Scalars['String']['input']>;
  senderAddress_eq?: InputMaybe<Scalars['String']['input']>;
  senderAddress_gt?: InputMaybe<Scalars['String']['input']>;
  senderAddress_gte?: InputMaybe<Scalars['String']['input']>;
  senderAddress_in?: InputMaybe<Array<Scalars['String']['input']>>;
  senderAddress_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  senderAddress_lt?: InputMaybe<Scalars['String']['input']>;
  senderAddress_lte?: InputMaybe<Scalars['String']['input']>;
  senderAddress_not_contains?: InputMaybe<Scalars['String']['input']>;
  senderAddress_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  senderAddress_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  senderAddress_not_eq?: InputMaybe<Scalars['String']['input']>;
  senderAddress_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  senderAddress_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  senderAddress_startsWith?: InputMaybe<Scalars['String']['input']>;
  sourceParaId_eq?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_gt?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_gte?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  sourceParaId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  sourceParaId_lt?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_lte?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_not_eq?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  status_eq?: InputMaybe<Scalars['Int']['input']>;
  status_gt?: InputMaybe<Scalars['Int']['input']>;
  status_gte?: InputMaybe<Scalars['Int']['input']>;
  status_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  status_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  status_lt?: InputMaybe<Scalars['Int']['input']>;
  status_lte?: InputMaybe<Scalars['Int']['input']>;
  status_not_eq?: InputMaybe<Scalars['Int']['input']>;
  status_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_eq?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_gt?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_gte?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  timestamp_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  timestamp_lt?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_lte?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_not_eq?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  toAssetHubMessageQueue?: InputMaybe<MessageProcessedOnPolkadotWhereInput>;
  toAssetHubMessageQueue_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  toBridgeHubMessageQueue?: InputMaybe<MessageProcessedOnPolkadotWhereInput>;
  toBridgeHubMessageQueue_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  toBridgeHubOutboundQueue?: InputMaybe<OutboundMessageAcceptedOnBridgeHubWhereInput>;
  toBridgeHubOutboundQueue_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  toDestination?: InputMaybe<InboundMessageDispatchedOnEthereumWhereInput>;
  toDestination_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  tokenAddress_contains?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_endsWith?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_eq?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_gt?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_gte?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tokenAddress_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  tokenAddress_lt?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_lte?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_not_contains?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_not_eq?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tokenAddress_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_startsWith?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_contains?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_endsWith?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_eq?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_gt?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_gte?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tokenLocation_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  tokenLocation_lt?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_lte?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_not_contains?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_not_eq?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tokenLocation_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_startsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_contains?: InputMaybe<Scalars['String']['input']>;
  txHash_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  txHash_endsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_eq?: InputMaybe<Scalars['String']['input']>;
  txHash_gt?: InputMaybe<Scalars['String']['input']>;
  txHash_gte?: InputMaybe<Scalars['String']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['String']['input']>>;
  txHash_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  txHash_lt?: InputMaybe<Scalars['String']['input']>;
  txHash_lte?: InputMaybe<Scalars['String']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['String']['input']>;
  txHash_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  txHash_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_not_eq?: InputMaybe<Scalars['String']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  txHash_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_startsWith?: InputMaybe<Scalars['String']['input']>;
};

export type TransferStatusToEthereumWhereInput = {
  AND?: InputMaybe<Array<TransferStatusToEthereumWhereInput>>;
  OR?: InputMaybe<Array<TransferStatusToEthereumWhereInput>>;
  amount_eq?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_eq?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_eq?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  blockNumber_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  blockNumber_lt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_eq?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  channelId_contains?: InputMaybe<Scalars['String']['input']>;
  channelId_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  channelId_endsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_eq?: InputMaybe<Scalars['String']['input']>;
  channelId_gt?: InputMaybe<Scalars['String']['input']>;
  channelId_gte?: InputMaybe<Scalars['String']['input']>;
  channelId_in?: InputMaybe<Array<Scalars['String']['input']>>;
  channelId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  channelId_lt?: InputMaybe<Scalars['String']['input']>;
  channelId_lte?: InputMaybe<Scalars['String']['input']>;
  channelId_not_contains?: InputMaybe<Scalars['String']['input']>;
  channelId_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  channelId_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_not_eq?: InputMaybe<Scalars['String']['input']>;
  channelId_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  channelId_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_startsWith?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_contains?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_endsWith?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_eq?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_gt?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_gte?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_in?: InputMaybe<Array<Scalars['String']['input']>>;
  destinationAddress_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  destinationAddress_lt?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_lte?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_not_contains?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_not_eq?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  destinationAddress_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_startsWith?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  id_endsWith?: InputMaybe<Scalars['String']['input']>;
  id_eq?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<Scalars['String']['input']>>;
  id_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  id_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  id_not_eq?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  id_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  id_startsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_contains?: InputMaybe<Scalars['String']['input']>;
  messageId_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  messageId_endsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_eq?: InputMaybe<Scalars['String']['input']>;
  messageId_gt?: InputMaybe<Scalars['String']['input']>;
  messageId_gte?: InputMaybe<Scalars['String']['input']>;
  messageId_in?: InputMaybe<Array<Scalars['String']['input']>>;
  messageId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  messageId_lt?: InputMaybe<Scalars['String']['input']>;
  messageId_lte?: InputMaybe<Scalars['String']['input']>;
  messageId_not_contains?: InputMaybe<Scalars['String']['input']>;
  messageId_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  messageId_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_not_eq?: InputMaybe<Scalars['String']['input']>;
  messageId_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  messageId_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_startsWith?: InputMaybe<Scalars['String']['input']>;
  nonce_eq?: InputMaybe<Scalars['Int']['input']>;
  nonce_gt?: InputMaybe<Scalars['Int']['input']>;
  nonce_gte?: InputMaybe<Scalars['Int']['input']>;
  nonce_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  nonce_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  nonce_lt?: InputMaybe<Scalars['Int']['input']>;
  nonce_lte?: InputMaybe<Scalars['Int']['input']>;
  nonce_not_eq?: InputMaybe<Scalars['Int']['input']>;
  nonce_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  senderAddress_contains?: InputMaybe<Scalars['String']['input']>;
  senderAddress_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  senderAddress_endsWith?: InputMaybe<Scalars['String']['input']>;
  senderAddress_eq?: InputMaybe<Scalars['String']['input']>;
  senderAddress_gt?: InputMaybe<Scalars['String']['input']>;
  senderAddress_gte?: InputMaybe<Scalars['String']['input']>;
  senderAddress_in?: InputMaybe<Array<Scalars['String']['input']>>;
  senderAddress_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  senderAddress_lt?: InputMaybe<Scalars['String']['input']>;
  senderAddress_lte?: InputMaybe<Scalars['String']['input']>;
  senderAddress_not_contains?: InputMaybe<Scalars['String']['input']>;
  senderAddress_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  senderAddress_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  senderAddress_not_eq?: InputMaybe<Scalars['String']['input']>;
  senderAddress_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  senderAddress_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  senderAddress_startsWith?: InputMaybe<Scalars['String']['input']>;
  sourceParaId_eq?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_gt?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_gte?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  sourceParaId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  sourceParaId_lt?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_lte?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_not_eq?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  status_eq?: InputMaybe<Scalars['Int']['input']>;
  status_gt?: InputMaybe<Scalars['Int']['input']>;
  status_gte?: InputMaybe<Scalars['Int']['input']>;
  status_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  status_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  status_lt?: InputMaybe<Scalars['Int']['input']>;
  status_lte?: InputMaybe<Scalars['Int']['input']>;
  status_not_eq?: InputMaybe<Scalars['Int']['input']>;
  status_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_eq?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_gt?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_gte?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  timestamp_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  timestamp_lt?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_lte?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_not_eq?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  toAssetHubMessageQueue?: InputMaybe<MessageProcessedOnPolkadotWhereInput>;
  toAssetHubMessageQueue_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  toBridgeHubMessageQueue?: InputMaybe<MessageProcessedOnPolkadotWhereInput>;
  toBridgeHubMessageQueue_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  toBridgeHubOutboundQueue?: InputMaybe<OutboundMessageAcceptedOnBridgeHubWhereInput>;
  toBridgeHubOutboundQueue_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  toDestination?: InputMaybe<InboundMessageDispatchedOnEthereumWhereInput>;
  toDestination_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  tokenAddress_contains?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_endsWith?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_eq?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_gt?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_gte?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tokenAddress_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  tokenAddress_lt?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_lte?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_not_contains?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_not_eq?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tokenAddress_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_startsWith?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_contains?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_endsWith?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_eq?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_gt?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_gte?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tokenLocation_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  tokenLocation_lt?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_lte?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_not_contains?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_not_eq?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tokenLocation_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_startsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_contains?: InputMaybe<Scalars['String']['input']>;
  txHash_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  txHash_endsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_eq?: InputMaybe<Scalars['String']['input']>;
  txHash_gt?: InputMaybe<Scalars['String']['input']>;
  txHash_gte?: InputMaybe<Scalars['String']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['String']['input']>>;
  txHash_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  txHash_lt?: InputMaybe<Scalars['String']['input']>;
  txHash_lte?: InputMaybe<Scalars['String']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['String']['input']>;
  txHash_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  txHash_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_not_eq?: InputMaybe<Scalars['String']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  txHash_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_startsWith?: InputMaybe<Scalars['String']['input']>;
};

export enum TransferStatusToPolkadotOrderByInput {
  AmountAsc = 'amount_ASC',
  AmountAscNullsFirst = 'amount_ASC_NULLS_FIRST',
  AmountAscNullsLast = 'amount_ASC_NULLS_LAST',
  AmountDesc = 'amount_DESC',
  AmountDescNullsFirst = 'amount_DESC_NULLS_FIRST',
  AmountDescNullsLast = 'amount_DESC_NULLS_LAST',
  BlockNumberAsc = 'blockNumber_ASC',
  BlockNumberAscNullsFirst = 'blockNumber_ASC_NULLS_FIRST',
  BlockNumberAscNullsLast = 'blockNumber_ASC_NULLS_LAST',
  BlockNumberDesc = 'blockNumber_DESC',
  BlockNumberDescNullsFirst = 'blockNumber_DESC_NULLS_FIRST',
  BlockNumberDescNullsLast = 'blockNumber_DESC_NULLS_LAST',
  ChannelIdAsc = 'channelId_ASC',
  ChannelIdAscNullsFirst = 'channelId_ASC_NULLS_FIRST',
  ChannelIdAscNullsLast = 'channelId_ASC_NULLS_LAST',
  ChannelIdDesc = 'channelId_DESC',
  ChannelIdDescNullsFirst = 'channelId_DESC_NULLS_FIRST',
  ChannelIdDescNullsLast = 'channelId_DESC_NULLS_LAST',
  DestinationAddressAsc = 'destinationAddress_ASC',
  DestinationAddressAscNullsFirst = 'destinationAddress_ASC_NULLS_FIRST',
  DestinationAddressAscNullsLast = 'destinationAddress_ASC_NULLS_LAST',
  DestinationAddressDesc = 'destinationAddress_DESC',
  DestinationAddressDescNullsFirst = 'destinationAddress_DESC_NULLS_FIRST',
  DestinationAddressDescNullsLast = 'destinationAddress_DESC_NULLS_LAST',
  DestinationNetworkAsc = 'destinationNetwork_ASC',
  DestinationNetworkAscNullsFirst = 'destinationNetwork_ASC_NULLS_FIRST',
  DestinationNetworkAscNullsLast = 'destinationNetwork_ASC_NULLS_LAST',
  DestinationNetworkDesc = 'destinationNetwork_DESC',
  DestinationNetworkDescNullsFirst = 'destinationNetwork_DESC_NULLS_FIRST',
  DestinationNetworkDescNullsLast = 'destinationNetwork_DESC_NULLS_LAST',
  DestinationParaIdAsc = 'destinationParaId_ASC',
  DestinationParaIdAscNullsFirst = 'destinationParaId_ASC_NULLS_FIRST',
  DestinationParaIdAscNullsLast = 'destinationParaId_ASC_NULLS_LAST',
  DestinationParaIdDesc = 'destinationParaId_DESC',
  DestinationParaIdDescNullsFirst = 'destinationParaId_DESC_NULLS_FIRST',
  DestinationParaIdDescNullsLast = 'destinationParaId_DESC_NULLS_LAST',
  IdAsc = 'id_ASC',
  IdAscNullsFirst = 'id_ASC_NULLS_FIRST',
  IdAscNullsLast = 'id_ASC_NULLS_LAST',
  IdDesc = 'id_DESC',
  IdDescNullsFirst = 'id_DESC_NULLS_FIRST',
  IdDescNullsLast = 'id_DESC_NULLS_LAST',
  MessageIdAsc = 'messageId_ASC',
  MessageIdAscNullsFirst = 'messageId_ASC_NULLS_FIRST',
  MessageIdAscNullsLast = 'messageId_ASC_NULLS_LAST',
  MessageIdDesc = 'messageId_DESC',
  MessageIdDescNullsFirst = 'messageId_DESC_NULLS_FIRST',
  MessageIdDescNullsLast = 'messageId_DESC_NULLS_LAST',
  NonceAsc = 'nonce_ASC',
  NonceAscNullsFirst = 'nonce_ASC_NULLS_FIRST',
  NonceAscNullsLast = 'nonce_ASC_NULLS_LAST',
  NonceDesc = 'nonce_DESC',
  NonceDescNullsFirst = 'nonce_DESC_NULLS_FIRST',
  NonceDescNullsLast = 'nonce_DESC_NULLS_LAST',
  SenderAddressAsc = 'senderAddress_ASC',
  SenderAddressAscNullsFirst = 'senderAddress_ASC_NULLS_FIRST',
  SenderAddressAscNullsLast = 'senderAddress_ASC_NULLS_LAST',
  SenderAddressDesc = 'senderAddress_DESC',
  SenderAddressDescNullsFirst = 'senderAddress_DESC_NULLS_FIRST',
  SenderAddressDescNullsLast = 'senderAddress_DESC_NULLS_LAST',
  SourceNetworkAsc = 'sourceNetwork_ASC',
  SourceNetworkAscNullsFirst = 'sourceNetwork_ASC_NULLS_FIRST',
  SourceNetworkAscNullsLast = 'sourceNetwork_ASC_NULLS_LAST',
  SourceNetworkDesc = 'sourceNetwork_DESC',
  SourceNetworkDescNullsFirst = 'sourceNetwork_DESC_NULLS_FIRST',
  SourceNetworkDescNullsLast = 'sourceNetwork_DESC_NULLS_LAST',
  SourceParaIdAsc = 'sourceParaId_ASC',
  SourceParaIdAscNullsFirst = 'sourceParaId_ASC_NULLS_FIRST',
  SourceParaIdAscNullsLast = 'sourceParaId_ASC_NULLS_LAST',
  SourceParaIdDesc = 'sourceParaId_DESC',
  SourceParaIdDescNullsFirst = 'sourceParaId_DESC_NULLS_FIRST',
  SourceParaIdDescNullsLast = 'sourceParaId_DESC_NULLS_LAST',
  StatusAsc = 'status_ASC',
  StatusAscNullsFirst = 'status_ASC_NULLS_FIRST',
  StatusAscNullsLast = 'status_ASC_NULLS_LAST',
  StatusDesc = 'status_DESC',
  StatusDescNullsFirst = 'status_DESC_NULLS_FIRST',
  StatusDescNullsLast = 'status_DESC_NULLS_LAST',
  TimestampAsc = 'timestamp_ASC',
  TimestampAscNullsFirst = 'timestamp_ASC_NULLS_FIRST',
  TimestampAscNullsLast = 'timestamp_ASC_NULLS_LAST',
  TimestampDesc = 'timestamp_DESC',
  TimestampDescNullsFirst = 'timestamp_DESC_NULLS_FIRST',
  TimestampDescNullsLast = 'timestamp_DESC_NULLS_LAST',
  ToAssetHubMessageQueueBlockNumberAsc = 'toAssetHubMessageQueue_blockNumber_ASC',
  ToAssetHubMessageQueueBlockNumberAscNullsFirst = 'toAssetHubMessageQueue_blockNumber_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueBlockNumberAscNullsLast = 'toAssetHubMessageQueue_blockNumber_ASC_NULLS_LAST',
  ToAssetHubMessageQueueBlockNumberDesc = 'toAssetHubMessageQueue_blockNumber_DESC',
  ToAssetHubMessageQueueBlockNumberDescNullsFirst = 'toAssetHubMessageQueue_blockNumber_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueBlockNumberDescNullsLast = 'toAssetHubMessageQueue_blockNumber_DESC_NULLS_LAST',
  ToAssetHubMessageQueueEventIdAsc = 'toAssetHubMessageQueue_eventId_ASC',
  ToAssetHubMessageQueueEventIdAscNullsFirst = 'toAssetHubMessageQueue_eventId_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueEventIdAscNullsLast = 'toAssetHubMessageQueue_eventId_ASC_NULLS_LAST',
  ToAssetHubMessageQueueEventIdDesc = 'toAssetHubMessageQueue_eventId_DESC',
  ToAssetHubMessageQueueEventIdDescNullsFirst = 'toAssetHubMessageQueue_eventId_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueEventIdDescNullsLast = 'toAssetHubMessageQueue_eventId_DESC_NULLS_LAST',
  ToAssetHubMessageQueueIdAsc = 'toAssetHubMessageQueue_id_ASC',
  ToAssetHubMessageQueueIdAscNullsFirst = 'toAssetHubMessageQueue_id_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueIdAscNullsLast = 'toAssetHubMessageQueue_id_ASC_NULLS_LAST',
  ToAssetHubMessageQueueIdDesc = 'toAssetHubMessageQueue_id_DESC',
  ToAssetHubMessageQueueIdDescNullsFirst = 'toAssetHubMessageQueue_id_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueIdDescNullsLast = 'toAssetHubMessageQueue_id_DESC_NULLS_LAST',
  ToAssetHubMessageQueueMessageIdAsc = 'toAssetHubMessageQueue_messageId_ASC',
  ToAssetHubMessageQueueMessageIdAscNullsFirst = 'toAssetHubMessageQueue_messageId_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueMessageIdAscNullsLast = 'toAssetHubMessageQueue_messageId_ASC_NULLS_LAST',
  ToAssetHubMessageQueueMessageIdDesc = 'toAssetHubMessageQueue_messageId_DESC',
  ToAssetHubMessageQueueMessageIdDescNullsFirst = 'toAssetHubMessageQueue_messageId_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueMessageIdDescNullsLast = 'toAssetHubMessageQueue_messageId_DESC_NULLS_LAST',
  ToAssetHubMessageQueueNetworkAsc = 'toAssetHubMessageQueue_network_ASC',
  ToAssetHubMessageQueueNetworkAscNullsFirst = 'toAssetHubMessageQueue_network_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueNetworkAscNullsLast = 'toAssetHubMessageQueue_network_ASC_NULLS_LAST',
  ToAssetHubMessageQueueNetworkDesc = 'toAssetHubMessageQueue_network_DESC',
  ToAssetHubMessageQueueNetworkDescNullsFirst = 'toAssetHubMessageQueue_network_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueNetworkDescNullsLast = 'toAssetHubMessageQueue_network_DESC_NULLS_LAST',
  ToAssetHubMessageQueueParaIdAsc = 'toAssetHubMessageQueue_paraId_ASC',
  ToAssetHubMessageQueueParaIdAscNullsFirst = 'toAssetHubMessageQueue_paraId_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueParaIdAscNullsLast = 'toAssetHubMessageQueue_paraId_ASC_NULLS_LAST',
  ToAssetHubMessageQueueParaIdDesc = 'toAssetHubMessageQueue_paraId_DESC',
  ToAssetHubMessageQueueParaIdDescNullsFirst = 'toAssetHubMessageQueue_paraId_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueParaIdDescNullsLast = 'toAssetHubMessageQueue_paraId_DESC_NULLS_LAST',
  ToAssetHubMessageQueueSuccessAsc = 'toAssetHubMessageQueue_success_ASC',
  ToAssetHubMessageQueueSuccessAscNullsFirst = 'toAssetHubMessageQueue_success_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueSuccessAscNullsLast = 'toAssetHubMessageQueue_success_ASC_NULLS_LAST',
  ToAssetHubMessageQueueSuccessDesc = 'toAssetHubMessageQueue_success_DESC',
  ToAssetHubMessageQueueSuccessDescNullsFirst = 'toAssetHubMessageQueue_success_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueSuccessDescNullsLast = 'toAssetHubMessageQueue_success_DESC_NULLS_LAST',
  ToAssetHubMessageQueueTimestampAsc = 'toAssetHubMessageQueue_timestamp_ASC',
  ToAssetHubMessageQueueTimestampAscNullsFirst = 'toAssetHubMessageQueue_timestamp_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueTimestampAscNullsLast = 'toAssetHubMessageQueue_timestamp_ASC_NULLS_LAST',
  ToAssetHubMessageQueueTimestampDesc = 'toAssetHubMessageQueue_timestamp_DESC',
  ToAssetHubMessageQueueTimestampDescNullsFirst = 'toAssetHubMessageQueue_timestamp_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueTimestampDescNullsLast = 'toAssetHubMessageQueue_timestamp_DESC_NULLS_LAST',
  ToBridgeHubInboundQueueBlockNumberAsc = 'toBridgeHubInboundQueue_blockNumber_ASC',
  ToBridgeHubInboundQueueBlockNumberAscNullsFirst = 'toBridgeHubInboundQueue_blockNumber_ASC_NULLS_FIRST',
  ToBridgeHubInboundQueueBlockNumberAscNullsLast = 'toBridgeHubInboundQueue_blockNumber_ASC_NULLS_LAST',
  ToBridgeHubInboundQueueBlockNumberDesc = 'toBridgeHubInboundQueue_blockNumber_DESC',
  ToBridgeHubInboundQueueBlockNumberDescNullsFirst = 'toBridgeHubInboundQueue_blockNumber_DESC_NULLS_FIRST',
  ToBridgeHubInboundQueueBlockNumberDescNullsLast = 'toBridgeHubInboundQueue_blockNumber_DESC_NULLS_LAST',
  ToBridgeHubInboundQueueChannelIdAsc = 'toBridgeHubInboundQueue_channelId_ASC',
  ToBridgeHubInboundQueueChannelIdAscNullsFirst = 'toBridgeHubInboundQueue_channelId_ASC_NULLS_FIRST',
  ToBridgeHubInboundQueueChannelIdAscNullsLast = 'toBridgeHubInboundQueue_channelId_ASC_NULLS_LAST',
  ToBridgeHubInboundQueueChannelIdDesc = 'toBridgeHubInboundQueue_channelId_DESC',
  ToBridgeHubInboundQueueChannelIdDescNullsFirst = 'toBridgeHubInboundQueue_channelId_DESC_NULLS_FIRST',
  ToBridgeHubInboundQueueChannelIdDescNullsLast = 'toBridgeHubInboundQueue_channelId_DESC_NULLS_LAST',
  ToBridgeHubInboundQueueEventIdAsc = 'toBridgeHubInboundQueue_eventId_ASC',
  ToBridgeHubInboundQueueEventIdAscNullsFirst = 'toBridgeHubInboundQueue_eventId_ASC_NULLS_FIRST',
  ToBridgeHubInboundQueueEventIdAscNullsLast = 'toBridgeHubInboundQueue_eventId_ASC_NULLS_LAST',
  ToBridgeHubInboundQueueEventIdDesc = 'toBridgeHubInboundQueue_eventId_DESC',
  ToBridgeHubInboundQueueEventIdDescNullsFirst = 'toBridgeHubInboundQueue_eventId_DESC_NULLS_FIRST',
  ToBridgeHubInboundQueueEventIdDescNullsLast = 'toBridgeHubInboundQueue_eventId_DESC_NULLS_LAST',
  ToBridgeHubInboundQueueIdAsc = 'toBridgeHubInboundQueue_id_ASC',
  ToBridgeHubInboundQueueIdAscNullsFirst = 'toBridgeHubInboundQueue_id_ASC_NULLS_FIRST',
  ToBridgeHubInboundQueueIdAscNullsLast = 'toBridgeHubInboundQueue_id_ASC_NULLS_LAST',
  ToBridgeHubInboundQueueIdDesc = 'toBridgeHubInboundQueue_id_DESC',
  ToBridgeHubInboundQueueIdDescNullsFirst = 'toBridgeHubInboundQueue_id_DESC_NULLS_FIRST',
  ToBridgeHubInboundQueueIdDescNullsLast = 'toBridgeHubInboundQueue_id_DESC_NULLS_LAST',
  ToBridgeHubInboundQueueMessageIdAsc = 'toBridgeHubInboundQueue_messageId_ASC',
  ToBridgeHubInboundQueueMessageIdAscNullsFirst = 'toBridgeHubInboundQueue_messageId_ASC_NULLS_FIRST',
  ToBridgeHubInboundQueueMessageIdAscNullsLast = 'toBridgeHubInboundQueue_messageId_ASC_NULLS_LAST',
  ToBridgeHubInboundQueueMessageIdDesc = 'toBridgeHubInboundQueue_messageId_DESC',
  ToBridgeHubInboundQueueMessageIdDescNullsFirst = 'toBridgeHubInboundQueue_messageId_DESC_NULLS_FIRST',
  ToBridgeHubInboundQueueMessageIdDescNullsLast = 'toBridgeHubInboundQueue_messageId_DESC_NULLS_LAST',
  ToBridgeHubInboundQueueNonceAsc = 'toBridgeHubInboundQueue_nonce_ASC',
  ToBridgeHubInboundQueueNonceAscNullsFirst = 'toBridgeHubInboundQueue_nonce_ASC_NULLS_FIRST',
  ToBridgeHubInboundQueueNonceAscNullsLast = 'toBridgeHubInboundQueue_nonce_ASC_NULLS_LAST',
  ToBridgeHubInboundQueueNonceDesc = 'toBridgeHubInboundQueue_nonce_DESC',
  ToBridgeHubInboundQueueNonceDescNullsFirst = 'toBridgeHubInboundQueue_nonce_DESC_NULLS_FIRST',
  ToBridgeHubInboundQueueNonceDescNullsLast = 'toBridgeHubInboundQueue_nonce_DESC_NULLS_LAST',
  ToBridgeHubInboundQueueTimestampAsc = 'toBridgeHubInboundQueue_timestamp_ASC',
  ToBridgeHubInboundQueueTimestampAscNullsFirst = 'toBridgeHubInboundQueue_timestamp_ASC_NULLS_FIRST',
  ToBridgeHubInboundQueueTimestampAscNullsLast = 'toBridgeHubInboundQueue_timestamp_ASC_NULLS_LAST',
  ToBridgeHubInboundQueueTimestampDesc = 'toBridgeHubInboundQueue_timestamp_DESC',
  ToBridgeHubInboundQueueTimestampDescNullsFirst = 'toBridgeHubInboundQueue_timestamp_DESC_NULLS_FIRST',
  ToBridgeHubInboundQueueTimestampDescNullsLast = 'toBridgeHubInboundQueue_timestamp_DESC_NULLS_LAST',
  ToBridgeHubInboundQueueTxHashAsc = 'toBridgeHubInboundQueue_txHash_ASC',
  ToBridgeHubInboundQueueTxHashAscNullsFirst = 'toBridgeHubInboundQueue_txHash_ASC_NULLS_FIRST',
  ToBridgeHubInboundQueueTxHashAscNullsLast = 'toBridgeHubInboundQueue_txHash_ASC_NULLS_LAST',
  ToBridgeHubInboundQueueTxHashDesc = 'toBridgeHubInboundQueue_txHash_DESC',
  ToBridgeHubInboundQueueTxHashDescNullsFirst = 'toBridgeHubInboundQueue_txHash_DESC_NULLS_FIRST',
  ToBridgeHubInboundQueueTxHashDescNullsLast = 'toBridgeHubInboundQueue_txHash_DESC_NULLS_LAST',
  ToDestinationBlockNumberAsc = 'toDestination_blockNumber_ASC',
  ToDestinationBlockNumberAscNullsFirst = 'toDestination_blockNumber_ASC_NULLS_FIRST',
  ToDestinationBlockNumberAscNullsLast = 'toDestination_blockNumber_ASC_NULLS_LAST',
  ToDestinationBlockNumberDesc = 'toDestination_blockNumber_DESC',
  ToDestinationBlockNumberDescNullsFirst = 'toDestination_blockNumber_DESC_NULLS_FIRST',
  ToDestinationBlockNumberDescNullsLast = 'toDestination_blockNumber_DESC_NULLS_LAST',
  ToDestinationEventIdAsc = 'toDestination_eventId_ASC',
  ToDestinationEventIdAscNullsFirst = 'toDestination_eventId_ASC_NULLS_FIRST',
  ToDestinationEventIdAscNullsLast = 'toDestination_eventId_ASC_NULLS_LAST',
  ToDestinationEventIdDesc = 'toDestination_eventId_DESC',
  ToDestinationEventIdDescNullsFirst = 'toDestination_eventId_DESC_NULLS_FIRST',
  ToDestinationEventIdDescNullsLast = 'toDestination_eventId_DESC_NULLS_LAST',
  ToDestinationIdAsc = 'toDestination_id_ASC',
  ToDestinationIdAscNullsFirst = 'toDestination_id_ASC_NULLS_FIRST',
  ToDestinationIdAscNullsLast = 'toDestination_id_ASC_NULLS_LAST',
  ToDestinationIdDesc = 'toDestination_id_DESC',
  ToDestinationIdDescNullsFirst = 'toDestination_id_DESC_NULLS_FIRST',
  ToDestinationIdDescNullsLast = 'toDestination_id_DESC_NULLS_LAST',
  ToDestinationMessageIdAsc = 'toDestination_messageId_ASC',
  ToDestinationMessageIdAscNullsFirst = 'toDestination_messageId_ASC_NULLS_FIRST',
  ToDestinationMessageIdAscNullsLast = 'toDestination_messageId_ASC_NULLS_LAST',
  ToDestinationMessageIdDesc = 'toDestination_messageId_DESC',
  ToDestinationMessageIdDescNullsFirst = 'toDestination_messageId_DESC_NULLS_FIRST',
  ToDestinationMessageIdDescNullsLast = 'toDestination_messageId_DESC_NULLS_LAST',
  ToDestinationNetworkAsc = 'toDestination_network_ASC',
  ToDestinationNetworkAscNullsFirst = 'toDestination_network_ASC_NULLS_FIRST',
  ToDestinationNetworkAscNullsLast = 'toDestination_network_ASC_NULLS_LAST',
  ToDestinationNetworkDesc = 'toDestination_network_DESC',
  ToDestinationNetworkDescNullsFirst = 'toDestination_network_DESC_NULLS_FIRST',
  ToDestinationNetworkDescNullsLast = 'toDestination_network_DESC_NULLS_LAST',
  ToDestinationParaIdAsc = 'toDestination_paraId_ASC',
  ToDestinationParaIdAscNullsFirst = 'toDestination_paraId_ASC_NULLS_FIRST',
  ToDestinationParaIdAscNullsLast = 'toDestination_paraId_ASC_NULLS_LAST',
  ToDestinationParaIdDesc = 'toDestination_paraId_DESC',
  ToDestinationParaIdDescNullsFirst = 'toDestination_paraId_DESC_NULLS_FIRST',
  ToDestinationParaIdDescNullsLast = 'toDestination_paraId_DESC_NULLS_LAST',
  ToDestinationSuccessAsc = 'toDestination_success_ASC',
  ToDestinationSuccessAscNullsFirst = 'toDestination_success_ASC_NULLS_FIRST',
  ToDestinationSuccessAscNullsLast = 'toDestination_success_ASC_NULLS_LAST',
  ToDestinationSuccessDesc = 'toDestination_success_DESC',
  ToDestinationSuccessDescNullsFirst = 'toDestination_success_DESC_NULLS_FIRST',
  ToDestinationSuccessDescNullsLast = 'toDestination_success_DESC_NULLS_LAST',
  ToDestinationTimestampAsc = 'toDestination_timestamp_ASC',
  ToDestinationTimestampAscNullsFirst = 'toDestination_timestamp_ASC_NULLS_FIRST',
  ToDestinationTimestampAscNullsLast = 'toDestination_timestamp_ASC_NULLS_LAST',
  ToDestinationTimestampDesc = 'toDestination_timestamp_DESC',
  ToDestinationTimestampDescNullsFirst = 'toDestination_timestamp_DESC_NULLS_FIRST',
  ToDestinationTimestampDescNullsLast = 'toDestination_timestamp_DESC_NULLS_LAST',
  TokenAddressAsc = 'tokenAddress_ASC',
  TokenAddressAscNullsFirst = 'tokenAddress_ASC_NULLS_FIRST',
  TokenAddressAscNullsLast = 'tokenAddress_ASC_NULLS_LAST',
  TokenAddressDesc = 'tokenAddress_DESC',
  TokenAddressDescNullsFirst = 'tokenAddress_DESC_NULLS_FIRST',
  TokenAddressDescNullsLast = 'tokenAddress_DESC_NULLS_LAST',
  TokenLocationAsc = 'tokenLocation_ASC',
  TokenLocationAscNullsFirst = 'tokenLocation_ASC_NULLS_FIRST',
  TokenLocationAscNullsLast = 'tokenLocation_ASC_NULLS_LAST',
  TokenLocationDesc = 'tokenLocation_DESC',
  TokenLocationDescNullsFirst = 'tokenLocation_DESC_NULLS_FIRST',
  TokenLocationDescNullsLast = 'tokenLocation_DESC_NULLS_LAST',
  TxHashAsc = 'txHash_ASC',
  TxHashAscNullsFirst = 'txHash_ASC_NULLS_FIRST',
  TxHashAscNullsLast = 'txHash_ASC_NULLS_LAST',
  TxHashDesc = 'txHash_DESC',
  TxHashDescNullsFirst = 'txHash_DESC_NULLS_FIRST',
  TxHashDescNullsLast = 'txHash_DESC_NULLS_LAST'
}

export enum TransferStatusToPolkadotV2OrderByInput {
  AmountAsc = 'amount_ASC',
  AmountAscNullsFirst = 'amount_ASC_NULLS_FIRST',
  AmountAscNullsLast = 'amount_ASC_NULLS_LAST',
  AmountDesc = 'amount_DESC',
  AmountDescNullsFirst = 'amount_DESC_NULLS_FIRST',
  AmountDescNullsLast = 'amount_DESC_NULLS_LAST',
  BlockNumberAsc = 'blockNumber_ASC',
  BlockNumberAscNullsFirst = 'blockNumber_ASC_NULLS_FIRST',
  BlockNumberAscNullsLast = 'blockNumber_ASC_NULLS_LAST',
  BlockNumberDesc = 'blockNumber_DESC',
  BlockNumberDescNullsFirst = 'blockNumber_DESC_NULLS_FIRST',
  BlockNumberDescNullsLast = 'blockNumber_DESC_NULLS_LAST',
  ChannelIdAsc = 'channelId_ASC',
  ChannelIdAscNullsFirst = 'channelId_ASC_NULLS_FIRST',
  ChannelIdAscNullsLast = 'channelId_ASC_NULLS_LAST',
  ChannelIdDesc = 'channelId_DESC',
  ChannelIdDescNullsFirst = 'channelId_DESC_NULLS_FIRST',
  ChannelIdDescNullsLast = 'channelId_DESC_NULLS_LAST',
  ClaimerAsc = 'claimer_ASC',
  ClaimerAscNullsFirst = 'claimer_ASC_NULLS_FIRST',
  ClaimerAscNullsLast = 'claimer_ASC_NULLS_LAST',
  ClaimerDesc = 'claimer_DESC',
  ClaimerDescNullsFirst = 'claimer_DESC_NULLS_FIRST',
  ClaimerDescNullsLast = 'claimer_DESC_NULLS_LAST',
  DestinationAddressAsc = 'destinationAddress_ASC',
  DestinationAddressAscNullsFirst = 'destinationAddress_ASC_NULLS_FIRST',
  DestinationAddressAscNullsLast = 'destinationAddress_ASC_NULLS_LAST',
  DestinationAddressDesc = 'destinationAddress_DESC',
  DestinationAddressDescNullsFirst = 'destinationAddress_DESC_NULLS_FIRST',
  DestinationAddressDescNullsLast = 'destinationAddress_DESC_NULLS_LAST',
  DestinationNetworkAsc = 'destinationNetwork_ASC',
  DestinationNetworkAscNullsFirst = 'destinationNetwork_ASC_NULLS_FIRST',
  DestinationNetworkAscNullsLast = 'destinationNetwork_ASC_NULLS_LAST',
  DestinationNetworkDesc = 'destinationNetwork_DESC',
  DestinationNetworkDescNullsFirst = 'destinationNetwork_DESC_NULLS_FIRST',
  DestinationNetworkDescNullsLast = 'destinationNetwork_DESC_NULLS_LAST',
  DestinationParaIdAsc = 'destinationParaId_ASC',
  DestinationParaIdAscNullsFirst = 'destinationParaId_ASC_NULLS_FIRST',
  DestinationParaIdAscNullsLast = 'destinationParaId_ASC_NULLS_LAST',
  DestinationParaIdDesc = 'destinationParaId_DESC',
  DestinationParaIdDescNullsFirst = 'destinationParaId_DESC_NULLS_FIRST',
  DestinationParaIdDescNullsLast = 'destinationParaId_DESC_NULLS_LAST',
  FeeAsc = 'fee_ASC',
  FeeAscNullsFirst = 'fee_ASC_NULLS_FIRST',
  FeeAscNullsLast = 'fee_ASC_NULLS_LAST',
  FeeDesc = 'fee_DESC',
  FeeDescNullsFirst = 'fee_DESC_NULLS_FIRST',
  FeeDescNullsLast = 'fee_DESC_NULLS_LAST',
  FromV1Asc = 'fromV1_ASC',
  FromV1AscNullsFirst = 'fromV1_ASC_NULLS_FIRST',
  FromV1AscNullsLast = 'fromV1_ASC_NULLS_LAST',
  FromV1Desc = 'fromV1_DESC',
  FromV1DescNullsFirst = 'fromV1_DESC_NULLS_FIRST',
  FromV1DescNullsLast = 'fromV1_DESC_NULLS_LAST',
  IdAsc = 'id_ASC',
  IdAscNullsFirst = 'id_ASC_NULLS_FIRST',
  IdAscNullsLast = 'id_ASC_NULLS_LAST',
  IdDesc = 'id_DESC',
  IdDescNullsFirst = 'id_DESC_NULLS_FIRST',
  IdDescNullsLast = 'id_DESC_NULLS_LAST',
  MessageIdAsc = 'messageId_ASC',
  MessageIdAscNullsFirst = 'messageId_ASC_NULLS_FIRST',
  MessageIdAscNullsLast = 'messageId_ASC_NULLS_LAST',
  MessageIdDesc = 'messageId_DESC',
  MessageIdDescNullsFirst = 'messageId_DESC_NULLS_FIRST',
  MessageIdDescNullsLast = 'messageId_DESC_NULLS_LAST',
  NonceAsc = 'nonce_ASC',
  NonceAscNullsFirst = 'nonce_ASC_NULLS_FIRST',
  NonceAscNullsLast = 'nonce_ASC_NULLS_LAST',
  NonceDesc = 'nonce_DESC',
  NonceDescNullsFirst = 'nonce_DESC_NULLS_FIRST',
  NonceDescNullsLast = 'nonce_DESC_NULLS_LAST',
  SenderAddressAsc = 'senderAddress_ASC',
  SenderAddressAscNullsFirst = 'senderAddress_ASC_NULLS_FIRST',
  SenderAddressAscNullsLast = 'senderAddress_ASC_NULLS_LAST',
  SenderAddressDesc = 'senderAddress_DESC',
  SenderAddressDescNullsFirst = 'senderAddress_DESC_NULLS_FIRST',
  SenderAddressDescNullsLast = 'senderAddress_DESC_NULLS_LAST',
  SourceNetworkAsc = 'sourceNetwork_ASC',
  SourceNetworkAscNullsFirst = 'sourceNetwork_ASC_NULLS_FIRST',
  SourceNetworkAscNullsLast = 'sourceNetwork_ASC_NULLS_LAST',
  SourceNetworkDesc = 'sourceNetwork_DESC',
  SourceNetworkDescNullsFirst = 'sourceNetwork_DESC_NULLS_FIRST',
  SourceNetworkDescNullsLast = 'sourceNetwork_DESC_NULLS_LAST',
  SourceParaIdAsc = 'sourceParaId_ASC',
  SourceParaIdAscNullsFirst = 'sourceParaId_ASC_NULLS_FIRST',
  SourceParaIdAscNullsLast = 'sourceParaId_ASC_NULLS_LAST',
  SourceParaIdDesc = 'sourceParaId_DESC',
  SourceParaIdDescNullsFirst = 'sourceParaId_DESC_NULLS_FIRST',
  SourceParaIdDescNullsLast = 'sourceParaId_DESC_NULLS_LAST',
  StatusAsc = 'status_ASC',
  StatusAscNullsFirst = 'status_ASC_NULLS_FIRST',
  StatusAscNullsLast = 'status_ASC_NULLS_LAST',
  StatusDesc = 'status_DESC',
  StatusDescNullsFirst = 'status_DESC_NULLS_FIRST',
  StatusDescNullsLast = 'status_DESC_NULLS_LAST',
  TimestampAsc = 'timestamp_ASC',
  TimestampAscNullsFirst = 'timestamp_ASC_NULLS_FIRST',
  TimestampAscNullsLast = 'timestamp_ASC_NULLS_LAST',
  TimestampDesc = 'timestamp_DESC',
  TimestampDescNullsFirst = 'timestamp_DESC_NULLS_FIRST',
  TimestampDescNullsLast = 'timestamp_DESC_NULLS_LAST',
  ToAssetHubMessageQueueBlockNumberAsc = 'toAssetHubMessageQueue_blockNumber_ASC',
  ToAssetHubMessageQueueBlockNumberAscNullsFirst = 'toAssetHubMessageQueue_blockNumber_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueBlockNumberAscNullsLast = 'toAssetHubMessageQueue_blockNumber_ASC_NULLS_LAST',
  ToAssetHubMessageQueueBlockNumberDesc = 'toAssetHubMessageQueue_blockNumber_DESC',
  ToAssetHubMessageQueueBlockNumberDescNullsFirst = 'toAssetHubMessageQueue_blockNumber_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueBlockNumberDescNullsLast = 'toAssetHubMessageQueue_blockNumber_DESC_NULLS_LAST',
  ToAssetHubMessageQueueEventIdAsc = 'toAssetHubMessageQueue_eventId_ASC',
  ToAssetHubMessageQueueEventIdAscNullsFirst = 'toAssetHubMessageQueue_eventId_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueEventIdAscNullsLast = 'toAssetHubMessageQueue_eventId_ASC_NULLS_LAST',
  ToAssetHubMessageQueueEventIdDesc = 'toAssetHubMessageQueue_eventId_DESC',
  ToAssetHubMessageQueueEventIdDescNullsFirst = 'toAssetHubMessageQueue_eventId_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueEventIdDescNullsLast = 'toAssetHubMessageQueue_eventId_DESC_NULLS_LAST',
  ToAssetHubMessageQueueIdAsc = 'toAssetHubMessageQueue_id_ASC',
  ToAssetHubMessageQueueIdAscNullsFirst = 'toAssetHubMessageQueue_id_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueIdAscNullsLast = 'toAssetHubMessageQueue_id_ASC_NULLS_LAST',
  ToAssetHubMessageQueueIdDesc = 'toAssetHubMessageQueue_id_DESC',
  ToAssetHubMessageQueueIdDescNullsFirst = 'toAssetHubMessageQueue_id_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueIdDescNullsLast = 'toAssetHubMessageQueue_id_DESC_NULLS_LAST',
  ToAssetHubMessageQueueMessageIdAsc = 'toAssetHubMessageQueue_messageId_ASC',
  ToAssetHubMessageQueueMessageIdAscNullsFirst = 'toAssetHubMessageQueue_messageId_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueMessageIdAscNullsLast = 'toAssetHubMessageQueue_messageId_ASC_NULLS_LAST',
  ToAssetHubMessageQueueMessageIdDesc = 'toAssetHubMessageQueue_messageId_DESC',
  ToAssetHubMessageQueueMessageIdDescNullsFirst = 'toAssetHubMessageQueue_messageId_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueMessageIdDescNullsLast = 'toAssetHubMessageQueue_messageId_DESC_NULLS_LAST',
  ToAssetHubMessageQueueNetworkAsc = 'toAssetHubMessageQueue_network_ASC',
  ToAssetHubMessageQueueNetworkAscNullsFirst = 'toAssetHubMessageQueue_network_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueNetworkAscNullsLast = 'toAssetHubMessageQueue_network_ASC_NULLS_LAST',
  ToAssetHubMessageQueueNetworkDesc = 'toAssetHubMessageQueue_network_DESC',
  ToAssetHubMessageQueueNetworkDescNullsFirst = 'toAssetHubMessageQueue_network_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueNetworkDescNullsLast = 'toAssetHubMessageQueue_network_DESC_NULLS_LAST',
  ToAssetHubMessageQueueParaIdAsc = 'toAssetHubMessageQueue_paraId_ASC',
  ToAssetHubMessageQueueParaIdAscNullsFirst = 'toAssetHubMessageQueue_paraId_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueParaIdAscNullsLast = 'toAssetHubMessageQueue_paraId_ASC_NULLS_LAST',
  ToAssetHubMessageQueueParaIdDesc = 'toAssetHubMessageQueue_paraId_DESC',
  ToAssetHubMessageQueueParaIdDescNullsFirst = 'toAssetHubMessageQueue_paraId_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueParaIdDescNullsLast = 'toAssetHubMessageQueue_paraId_DESC_NULLS_LAST',
  ToAssetHubMessageQueueSuccessAsc = 'toAssetHubMessageQueue_success_ASC',
  ToAssetHubMessageQueueSuccessAscNullsFirst = 'toAssetHubMessageQueue_success_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueSuccessAscNullsLast = 'toAssetHubMessageQueue_success_ASC_NULLS_LAST',
  ToAssetHubMessageQueueSuccessDesc = 'toAssetHubMessageQueue_success_DESC',
  ToAssetHubMessageQueueSuccessDescNullsFirst = 'toAssetHubMessageQueue_success_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueSuccessDescNullsLast = 'toAssetHubMessageQueue_success_DESC_NULLS_LAST',
  ToAssetHubMessageQueueTimestampAsc = 'toAssetHubMessageQueue_timestamp_ASC',
  ToAssetHubMessageQueueTimestampAscNullsFirst = 'toAssetHubMessageQueue_timestamp_ASC_NULLS_FIRST',
  ToAssetHubMessageQueueTimestampAscNullsLast = 'toAssetHubMessageQueue_timestamp_ASC_NULLS_LAST',
  ToAssetHubMessageQueueTimestampDesc = 'toAssetHubMessageQueue_timestamp_DESC',
  ToAssetHubMessageQueueTimestampDescNullsFirst = 'toAssetHubMessageQueue_timestamp_DESC_NULLS_FIRST',
  ToAssetHubMessageQueueTimestampDescNullsLast = 'toAssetHubMessageQueue_timestamp_DESC_NULLS_LAST',
  ToBridgeHubInboundQueueBlockNumberAsc = 'toBridgeHubInboundQueue_blockNumber_ASC',
  ToBridgeHubInboundQueueBlockNumberAscNullsFirst = 'toBridgeHubInboundQueue_blockNumber_ASC_NULLS_FIRST',
  ToBridgeHubInboundQueueBlockNumberAscNullsLast = 'toBridgeHubInboundQueue_blockNumber_ASC_NULLS_LAST',
  ToBridgeHubInboundQueueBlockNumberDesc = 'toBridgeHubInboundQueue_blockNumber_DESC',
  ToBridgeHubInboundQueueBlockNumberDescNullsFirst = 'toBridgeHubInboundQueue_blockNumber_DESC_NULLS_FIRST',
  ToBridgeHubInboundQueueBlockNumberDescNullsLast = 'toBridgeHubInboundQueue_blockNumber_DESC_NULLS_LAST',
  ToBridgeHubInboundQueueChannelIdAsc = 'toBridgeHubInboundQueue_channelId_ASC',
  ToBridgeHubInboundQueueChannelIdAscNullsFirst = 'toBridgeHubInboundQueue_channelId_ASC_NULLS_FIRST',
  ToBridgeHubInboundQueueChannelIdAscNullsLast = 'toBridgeHubInboundQueue_channelId_ASC_NULLS_LAST',
  ToBridgeHubInboundQueueChannelIdDesc = 'toBridgeHubInboundQueue_channelId_DESC',
  ToBridgeHubInboundQueueChannelIdDescNullsFirst = 'toBridgeHubInboundQueue_channelId_DESC_NULLS_FIRST',
  ToBridgeHubInboundQueueChannelIdDescNullsLast = 'toBridgeHubInboundQueue_channelId_DESC_NULLS_LAST',
  ToBridgeHubInboundQueueEventIdAsc = 'toBridgeHubInboundQueue_eventId_ASC',
  ToBridgeHubInboundQueueEventIdAscNullsFirst = 'toBridgeHubInboundQueue_eventId_ASC_NULLS_FIRST',
  ToBridgeHubInboundQueueEventIdAscNullsLast = 'toBridgeHubInboundQueue_eventId_ASC_NULLS_LAST',
  ToBridgeHubInboundQueueEventIdDesc = 'toBridgeHubInboundQueue_eventId_DESC',
  ToBridgeHubInboundQueueEventIdDescNullsFirst = 'toBridgeHubInboundQueue_eventId_DESC_NULLS_FIRST',
  ToBridgeHubInboundQueueEventIdDescNullsLast = 'toBridgeHubInboundQueue_eventId_DESC_NULLS_LAST',
  ToBridgeHubInboundQueueIdAsc = 'toBridgeHubInboundQueue_id_ASC',
  ToBridgeHubInboundQueueIdAscNullsFirst = 'toBridgeHubInboundQueue_id_ASC_NULLS_FIRST',
  ToBridgeHubInboundQueueIdAscNullsLast = 'toBridgeHubInboundQueue_id_ASC_NULLS_LAST',
  ToBridgeHubInboundQueueIdDesc = 'toBridgeHubInboundQueue_id_DESC',
  ToBridgeHubInboundQueueIdDescNullsFirst = 'toBridgeHubInboundQueue_id_DESC_NULLS_FIRST',
  ToBridgeHubInboundQueueIdDescNullsLast = 'toBridgeHubInboundQueue_id_DESC_NULLS_LAST',
  ToBridgeHubInboundQueueMessageIdAsc = 'toBridgeHubInboundQueue_messageId_ASC',
  ToBridgeHubInboundQueueMessageIdAscNullsFirst = 'toBridgeHubInboundQueue_messageId_ASC_NULLS_FIRST',
  ToBridgeHubInboundQueueMessageIdAscNullsLast = 'toBridgeHubInboundQueue_messageId_ASC_NULLS_LAST',
  ToBridgeHubInboundQueueMessageIdDesc = 'toBridgeHubInboundQueue_messageId_DESC',
  ToBridgeHubInboundQueueMessageIdDescNullsFirst = 'toBridgeHubInboundQueue_messageId_DESC_NULLS_FIRST',
  ToBridgeHubInboundQueueMessageIdDescNullsLast = 'toBridgeHubInboundQueue_messageId_DESC_NULLS_LAST',
  ToBridgeHubInboundQueueNonceAsc = 'toBridgeHubInboundQueue_nonce_ASC',
  ToBridgeHubInboundQueueNonceAscNullsFirst = 'toBridgeHubInboundQueue_nonce_ASC_NULLS_FIRST',
  ToBridgeHubInboundQueueNonceAscNullsLast = 'toBridgeHubInboundQueue_nonce_ASC_NULLS_LAST',
  ToBridgeHubInboundQueueNonceDesc = 'toBridgeHubInboundQueue_nonce_DESC',
  ToBridgeHubInboundQueueNonceDescNullsFirst = 'toBridgeHubInboundQueue_nonce_DESC_NULLS_FIRST',
  ToBridgeHubInboundQueueNonceDescNullsLast = 'toBridgeHubInboundQueue_nonce_DESC_NULLS_LAST',
  ToBridgeHubInboundQueueTimestampAsc = 'toBridgeHubInboundQueue_timestamp_ASC',
  ToBridgeHubInboundQueueTimestampAscNullsFirst = 'toBridgeHubInboundQueue_timestamp_ASC_NULLS_FIRST',
  ToBridgeHubInboundQueueTimestampAscNullsLast = 'toBridgeHubInboundQueue_timestamp_ASC_NULLS_LAST',
  ToBridgeHubInboundQueueTimestampDesc = 'toBridgeHubInboundQueue_timestamp_DESC',
  ToBridgeHubInboundQueueTimestampDescNullsFirst = 'toBridgeHubInboundQueue_timestamp_DESC_NULLS_FIRST',
  ToBridgeHubInboundQueueTimestampDescNullsLast = 'toBridgeHubInboundQueue_timestamp_DESC_NULLS_LAST',
  ToBridgeHubInboundQueueTxHashAsc = 'toBridgeHubInboundQueue_txHash_ASC',
  ToBridgeHubInboundQueueTxHashAscNullsFirst = 'toBridgeHubInboundQueue_txHash_ASC_NULLS_FIRST',
  ToBridgeHubInboundQueueTxHashAscNullsLast = 'toBridgeHubInboundQueue_txHash_ASC_NULLS_LAST',
  ToBridgeHubInboundQueueTxHashDesc = 'toBridgeHubInboundQueue_txHash_DESC',
  ToBridgeHubInboundQueueTxHashDescNullsFirst = 'toBridgeHubInboundQueue_txHash_DESC_NULLS_FIRST',
  ToBridgeHubInboundQueueTxHashDescNullsLast = 'toBridgeHubInboundQueue_txHash_DESC_NULLS_LAST',
  ToDestinationBlockNumberAsc = 'toDestination_blockNumber_ASC',
  ToDestinationBlockNumberAscNullsFirst = 'toDestination_blockNumber_ASC_NULLS_FIRST',
  ToDestinationBlockNumberAscNullsLast = 'toDestination_blockNumber_ASC_NULLS_LAST',
  ToDestinationBlockNumberDesc = 'toDestination_blockNumber_DESC',
  ToDestinationBlockNumberDescNullsFirst = 'toDestination_blockNumber_DESC_NULLS_FIRST',
  ToDestinationBlockNumberDescNullsLast = 'toDestination_blockNumber_DESC_NULLS_LAST',
  ToDestinationEventIdAsc = 'toDestination_eventId_ASC',
  ToDestinationEventIdAscNullsFirst = 'toDestination_eventId_ASC_NULLS_FIRST',
  ToDestinationEventIdAscNullsLast = 'toDestination_eventId_ASC_NULLS_LAST',
  ToDestinationEventIdDesc = 'toDestination_eventId_DESC',
  ToDestinationEventIdDescNullsFirst = 'toDestination_eventId_DESC_NULLS_FIRST',
  ToDestinationEventIdDescNullsLast = 'toDestination_eventId_DESC_NULLS_LAST',
  ToDestinationIdAsc = 'toDestination_id_ASC',
  ToDestinationIdAscNullsFirst = 'toDestination_id_ASC_NULLS_FIRST',
  ToDestinationIdAscNullsLast = 'toDestination_id_ASC_NULLS_LAST',
  ToDestinationIdDesc = 'toDestination_id_DESC',
  ToDestinationIdDescNullsFirst = 'toDestination_id_DESC_NULLS_FIRST',
  ToDestinationIdDescNullsLast = 'toDestination_id_DESC_NULLS_LAST',
  ToDestinationMessageIdAsc = 'toDestination_messageId_ASC',
  ToDestinationMessageIdAscNullsFirst = 'toDestination_messageId_ASC_NULLS_FIRST',
  ToDestinationMessageIdAscNullsLast = 'toDestination_messageId_ASC_NULLS_LAST',
  ToDestinationMessageIdDesc = 'toDestination_messageId_DESC',
  ToDestinationMessageIdDescNullsFirst = 'toDestination_messageId_DESC_NULLS_FIRST',
  ToDestinationMessageIdDescNullsLast = 'toDestination_messageId_DESC_NULLS_LAST',
  ToDestinationNetworkAsc = 'toDestination_network_ASC',
  ToDestinationNetworkAscNullsFirst = 'toDestination_network_ASC_NULLS_FIRST',
  ToDestinationNetworkAscNullsLast = 'toDestination_network_ASC_NULLS_LAST',
  ToDestinationNetworkDesc = 'toDestination_network_DESC',
  ToDestinationNetworkDescNullsFirst = 'toDestination_network_DESC_NULLS_FIRST',
  ToDestinationNetworkDescNullsLast = 'toDestination_network_DESC_NULLS_LAST',
  ToDestinationParaIdAsc = 'toDestination_paraId_ASC',
  ToDestinationParaIdAscNullsFirst = 'toDestination_paraId_ASC_NULLS_FIRST',
  ToDestinationParaIdAscNullsLast = 'toDestination_paraId_ASC_NULLS_LAST',
  ToDestinationParaIdDesc = 'toDestination_paraId_DESC',
  ToDestinationParaIdDescNullsFirst = 'toDestination_paraId_DESC_NULLS_FIRST',
  ToDestinationParaIdDescNullsLast = 'toDestination_paraId_DESC_NULLS_LAST',
  ToDestinationSuccessAsc = 'toDestination_success_ASC',
  ToDestinationSuccessAscNullsFirst = 'toDestination_success_ASC_NULLS_FIRST',
  ToDestinationSuccessAscNullsLast = 'toDestination_success_ASC_NULLS_LAST',
  ToDestinationSuccessDesc = 'toDestination_success_DESC',
  ToDestinationSuccessDescNullsFirst = 'toDestination_success_DESC_NULLS_FIRST',
  ToDestinationSuccessDescNullsLast = 'toDestination_success_DESC_NULLS_LAST',
  ToDestinationTimestampAsc = 'toDestination_timestamp_ASC',
  ToDestinationTimestampAscNullsFirst = 'toDestination_timestamp_ASC_NULLS_FIRST',
  ToDestinationTimestampAscNullsLast = 'toDestination_timestamp_ASC_NULLS_LAST',
  ToDestinationTimestampDesc = 'toDestination_timestamp_DESC',
  ToDestinationTimestampDescNullsFirst = 'toDestination_timestamp_DESC_NULLS_FIRST',
  ToDestinationTimestampDescNullsLast = 'toDestination_timestamp_DESC_NULLS_LAST',
  TokenAddressAsc = 'tokenAddress_ASC',
  TokenAddressAscNullsFirst = 'tokenAddress_ASC_NULLS_FIRST',
  TokenAddressAscNullsLast = 'tokenAddress_ASC_NULLS_LAST',
  TokenAddressDesc = 'tokenAddress_DESC',
  TokenAddressDescNullsFirst = 'tokenAddress_DESC_NULLS_FIRST',
  TokenAddressDescNullsLast = 'tokenAddress_DESC_NULLS_LAST',
  TokenIdAsc = 'tokenID_ASC',
  TokenIdAscNullsFirst = 'tokenID_ASC_NULLS_FIRST',
  TokenIdAscNullsLast = 'tokenID_ASC_NULLS_LAST',
  TokenIdDesc = 'tokenID_DESC',
  TokenIdDescNullsFirst = 'tokenID_DESC_NULLS_FIRST',
  TokenIdDescNullsLast = 'tokenID_DESC_NULLS_LAST',
  TokenLocationAsc = 'tokenLocation_ASC',
  TokenLocationAscNullsFirst = 'tokenLocation_ASC_NULLS_FIRST',
  TokenLocationAscNullsLast = 'tokenLocation_ASC_NULLS_LAST',
  TokenLocationDesc = 'tokenLocation_DESC',
  TokenLocationDescNullsFirst = 'tokenLocation_DESC_NULLS_FIRST',
  TokenLocationDescNullsLast = 'tokenLocation_DESC_NULLS_LAST',
  TxHashAsc = 'txHash_ASC',
  TxHashAscNullsFirst = 'txHash_ASC_NULLS_FIRST',
  TxHashAscNullsLast = 'txHash_ASC_NULLS_LAST',
  TxHashDesc = 'txHash_DESC',
  TxHashDescNullsFirst = 'txHash_DESC_NULLS_FIRST',
  TxHashDescNullsLast = 'txHash_DESC_NULLS_LAST'
}

export type TransferStatusToPolkadotV2WhereInput = {
  AND?: InputMaybe<Array<TransferStatusToPolkadotV2WhereInput>>;
  OR?: InputMaybe<Array<TransferStatusToPolkadotV2WhereInput>>;
  amount_eq?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_eq?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_eq?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  blockNumber_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  blockNumber_lt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_eq?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  channelId_contains?: InputMaybe<Scalars['String']['input']>;
  channelId_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  channelId_endsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_eq?: InputMaybe<Scalars['String']['input']>;
  channelId_gt?: InputMaybe<Scalars['String']['input']>;
  channelId_gte?: InputMaybe<Scalars['String']['input']>;
  channelId_in?: InputMaybe<Array<Scalars['String']['input']>>;
  channelId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  channelId_lt?: InputMaybe<Scalars['String']['input']>;
  channelId_lte?: InputMaybe<Scalars['String']['input']>;
  channelId_not_contains?: InputMaybe<Scalars['String']['input']>;
  channelId_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  channelId_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_not_eq?: InputMaybe<Scalars['String']['input']>;
  channelId_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  channelId_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_startsWith?: InputMaybe<Scalars['String']['input']>;
  claimer_contains?: InputMaybe<Scalars['String']['input']>;
  claimer_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  claimer_endsWith?: InputMaybe<Scalars['String']['input']>;
  claimer_eq?: InputMaybe<Scalars['String']['input']>;
  claimer_gt?: InputMaybe<Scalars['String']['input']>;
  claimer_gte?: InputMaybe<Scalars['String']['input']>;
  claimer_in?: InputMaybe<Array<Scalars['String']['input']>>;
  claimer_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  claimer_lt?: InputMaybe<Scalars['String']['input']>;
  claimer_lte?: InputMaybe<Scalars['String']['input']>;
  claimer_not_contains?: InputMaybe<Scalars['String']['input']>;
  claimer_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  claimer_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  claimer_not_eq?: InputMaybe<Scalars['String']['input']>;
  claimer_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  claimer_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  claimer_startsWith?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_contains?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_endsWith?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_eq?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_gt?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_gte?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_in?: InputMaybe<Array<Scalars['String']['input']>>;
  destinationAddress_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  destinationAddress_lt?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_lte?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_not_contains?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_not_eq?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  destinationAddress_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_startsWith?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_contains?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_endsWith?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_eq?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_gt?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_gte?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_in?: InputMaybe<Array<Scalars['String']['input']>>;
  destinationNetwork_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  destinationNetwork_lt?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_lte?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_not_contains?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_not_eq?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  destinationNetwork_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_startsWith?: InputMaybe<Scalars['String']['input']>;
  destinationParaId_eq?: InputMaybe<Scalars['Int']['input']>;
  destinationParaId_gt?: InputMaybe<Scalars['Int']['input']>;
  destinationParaId_gte?: InputMaybe<Scalars['Int']['input']>;
  destinationParaId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  destinationParaId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  destinationParaId_lt?: InputMaybe<Scalars['Int']['input']>;
  destinationParaId_lte?: InputMaybe<Scalars['Int']['input']>;
  destinationParaId_not_eq?: InputMaybe<Scalars['Int']['input']>;
  destinationParaId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  fee_eq?: InputMaybe<Scalars['BigInt']['input']>;
  fee_gt?: InputMaybe<Scalars['BigInt']['input']>;
  fee_gte?: InputMaybe<Scalars['BigInt']['input']>;
  fee_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  fee_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  fee_lt?: InputMaybe<Scalars['BigInt']['input']>;
  fee_lte?: InputMaybe<Scalars['BigInt']['input']>;
  fee_not_eq?: InputMaybe<Scalars['BigInt']['input']>;
  fee_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  fromV1_eq?: InputMaybe<Scalars['Boolean']['input']>;
  fromV1_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  fromV1_not_eq?: InputMaybe<Scalars['Boolean']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  id_endsWith?: InputMaybe<Scalars['String']['input']>;
  id_eq?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<Scalars['String']['input']>>;
  id_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  id_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  id_not_eq?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  id_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  id_startsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_contains?: InputMaybe<Scalars['String']['input']>;
  messageId_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  messageId_endsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_eq?: InputMaybe<Scalars['String']['input']>;
  messageId_gt?: InputMaybe<Scalars['String']['input']>;
  messageId_gte?: InputMaybe<Scalars['String']['input']>;
  messageId_in?: InputMaybe<Array<Scalars['String']['input']>>;
  messageId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  messageId_lt?: InputMaybe<Scalars['String']['input']>;
  messageId_lte?: InputMaybe<Scalars['String']['input']>;
  messageId_not_contains?: InputMaybe<Scalars['String']['input']>;
  messageId_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  messageId_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_not_eq?: InputMaybe<Scalars['String']['input']>;
  messageId_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  messageId_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_startsWith?: InputMaybe<Scalars['String']['input']>;
  nonce_eq?: InputMaybe<Scalars['Int']['input']>;
  nonce_gt?: InputMaybe<Scalars['Int']['input']>;
  nonce_gte?: InputMaybe<Scalars['Int']['input']>;
  nonce_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  nonce_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  nonce_lt?: InputMaybe<Scalars['Int']['input']>;
  nonce_lte?: InputMaybe<Scalars['Int']['input']>;
  nonce_not_eq?: InputMaybe<Scalars['Int']['input']>;
  nonce_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  senderAddress_contains?: InputMaybe<Scalars['String']['input']>;
  senderAddress_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  senderAddress_endsWith?: InputMaybe<Scalars['String']['input']>;
  senderAddress_eq?: InputMaybe<Scalars['String']['input']>;
  senderAddress_gt?: InputMaybe<Scalars['String']['input']>;
  senderAddress_gte?: InputMaybe<Scalars['String']['input']>;
  senderAddress_in?: InputMaybe<Array<Scalars['String']['input']>>;
  senderAddress_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  senderAddress_lt?: InputMaybe<Scalars['String']['input']>;
  senderAddress_lte?: InputMaybe<Scalars['String']['input']>;
  senderAddress_not_contains?: InputMaybe<Scalars['String']['input']>;
  senderAddress_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  senderAddress_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  senderAddress_not_eq?: InputMaybe<Scalars['String']['input']>;
  senderAddress_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  senderAddress_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  senderAddress_startsWith?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_contains?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_endsWith?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_eq?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_gt?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_gte?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_in?: InputMaybe<Array<Scalars['String']['input']>>;
  sourceNetwork_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  sourceNetwork_lt?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_lte?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_not_contains?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_not_eq?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  sourceNetwork_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_startsWith?: InputMaybe<Scalars['String']['input']>;
  sourceParaId_eq?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_gt?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_gte?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  sourceParaId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  sourceParaId_lt?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_lte?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_not_eq?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  status_eq?: InputMaybe<Scalars['Int']['input']>;
  status_gt?: InputMaybe<Scalars['Int']['input']>;
  status_gte?: InputMaybe<Scalars['Int']['input']>;
  status_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  status_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  status_lt?: InputMaybe<Scalars['Int']['input']>;
  status_lte?: InputMaybe<Scalars['Int']['input']>;
  status_not_eq?: InputMaybe<Scalars['Int']['input']>;
  status_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_eq?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_gt?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_gte?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  timestamp_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  timestamp_lt?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_lte?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_not_eq?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  toAssetHubMessageQueue?: InputMaybe<MessageProcessedOnPolkadotWhereInput>;
  toAssetHubMessageQueue_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  toBridgeHubInboundQueue?: InputMaybe<InboundMessageReceivedOnBridgeHubWhereInput>;
  toBridgeHubInboundQueue_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  toDestination?: InputMaybe<MessageProcessedOnPolkadotWhereInput>;
  toDestination_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  tokenAddress_contains?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_endsWith?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_eq?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_gt?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_gte?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tokenAddress_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  tokenAddress_lt?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_lte?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_not_contains?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_not_eq?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tokenAddress_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_startsWith?: InputMaybe<Scalars['String']['input']>;
  tokenID_contains?: InputMaybe<Scalars['String']['input']>;
  tokenID_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  tokenID_endsWith?: InputMaybe<Scalars['String']['input']>;
  tokenID_eq?: InputMaybe<Scalars['String']['input']>;
  tokenID_gt?: InputMaybe<Scalars['String']['input']>;
  tokenID_gte?: InputMaybe<Scalars['String']['input']>;
  tokenID_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tokenID_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  tokenID_lt?: InputMaybe<Scalars['String']['input']>;
  tokenID_lte?: InputMaybe<Scalars['String']['input']>;
  tokenID_not_contains?: InputMaybe<Scalars['String']['input']>;
  tokenID_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  tokenID_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  tokenID_not_eq?: InputMaybe<Scalars['String']['input']>;
  tokenID_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tokenID_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  tokenID_startsWith?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_contains?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_endsWith?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_eq?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_gt?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_gte?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tokenLocation_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  tokenLocation_lt?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_lte?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_not_contains?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_not_eq?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tokenLocation_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_startsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_contains?: InputMaybe<Scalars['String']['input']>;
  txHash_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  txHash_endsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_eq?: InputMaybe<Scalars['String']['input']>;
  txHash_gt?: InputMaybe<Scalars['String']['input']>;
  txHash_gte?: InputMaybe<Scalars['String']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['String']['input']>>;
  txHash_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  txHash_lt?: InputMaybe<Scalars['String']['input']>;
  txHash_lte?: InputMaybe<Scalars['String']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['String']['input']>;
  txHash_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  txHash_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_not_eq?: InputMaybe<Scalars['String']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  txHash_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_startsWith?: InputMaybe<Scalars['String']['input']>;
};

export type TransferStatusToPolkadotWhereInput = {
  AND?: InputMaybe<Array<TransferStatusToPolkadotWhereInput>>;
  OR?: InputMaybe<Array<TransferStatusToPolkadotWhereInput>>;
  amount_eq?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_eq?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_eq?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  blockNumber_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  blockNumber_lt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_eq?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  channelId_contains?: InputMaybe<Scalars['String']['input']>;
  channelId_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  channelId_endsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_eq?: InputMaybe<Scalars['String']['input']>;
  channelId_gt?: InputMaybe<Scalars['String']['input']>;
  channelId_gte?: InputMaybe<Scalars['String']['input']>;
  channelId_in?: InputMaybe<Array<Scalars['String']['input']>>;
  channelId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  channelId_lt?: InputMaybe<Scalars['String']['input']>;
  channelId_lte?: InputMaybe<Scalars['String']['input']>;
  channelId_not_contains?: InputMaybe<Scalars['String']['input']>;
  channelId_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  channelId_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_not_eq?: InputMaybe<Scalars['String']['input']>;
  channelId_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  channelId_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  channelId_startsWith?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_contains?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_endsWith?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_eq?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_gt?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_gte?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_in?: InputMaybe<Array<Scalars['String']['input']>>;
  destinationAddress_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  destinationAddress_lt?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_lte?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_not_contains?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_not_eq?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  destinationAddress_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  destinationAddress_startsWith?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_contains?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_endsWith?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_eq?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_gt?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_gte?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_in?: InputMaybe<Array<Scalars['String']['input']>>;
  destinationNetwork_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  destinationNetwork_lt?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_lte?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_not_contains?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_not_eq?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  destinationNetwork_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  destinationNetwork_startsWith?: InputMaybe<Scalars['String']['input']>;
  destinationParaId_eq?: InputMaybe<Scalars['Int']['input']>;
  destinationParaId_gt?: InputMaybe<Scalars['Int']['input']>;
  destinationParaId_gte?: InputMaybe<Scalars['Int']['input']>;
  destinationParaId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  destinationParaId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  destinationParaId_lt?: InputMaybe<Scalars['Int']['input']>;
  destinationParaId_lte?: InputMaybe<Scalars['Int']['input']>;
  destinationParaId_not_eq?: InputMaybe<Scalars['Int']['input']>;
  destinationParaId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  id_endsWith?: InputMaybe<Scalars['String']['input']>;
  id_eq?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<Scalars['String']['input']>>;
  id_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  id_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  id_not_eq?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  id_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  id_startsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_contains?: InputMaybe<Scalars['String']['input']>;
  messageId_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  messageId_endsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_eq?: InputMaybe<Scalars['String']['input']>;
  messageId_gt?: InputMaybe<Scalars['String']['input']>;
  messageId_gte?: InputMaybe<Scalars['String']['input']>;
  messageId_in?: InputMaybe<Array<Scalars['String']['input']>>;
  messageId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  messageId_lt?: InputMaybe<Scalars['String']['input']>;
  messageId_lte?: InputMaybe<Scalars['String']['input']>;
  messageId_not_contains?: InputMaybe<Scalars['String']['input']>;
  messageId_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  messageId_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_not_eq?: InputMaybe<Scalars['String']['input']>;
  messageId_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  messageId_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  messageId_startsWith?: InputMaybe<Scalars['String']['input']>;
  nonce_eq?: InputMaybe<Scalars['Int']['input']>;
  nonce_gt?: InputMaybe<Scalars['Int']['input']>;
  nonce_gte?: InputMaybe<Scalars['Int']['input']>;
  nonce_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  nonce_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  nonce_lt?: InputMaybe<Scalars['Int']['input']>;
  nonce_lte?: InputMaybe<Scalars['Int']['input']>;
  nonce_not_eq?: InputMaybe<Scalars['Int']['input']>;
  nonce_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  senderAddress_contains?: InputMaybe<Scalars['String']['input']>;
  senderAddress_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  senderAddress_endsWith?: InputMaybe<Scalars['String']['input']>;
  senderAddress_eq?: InputMaybe<Scalars['String']['input']>;
  senderAddress_gt?: InputMaybe<Scalars['String']['input']>;
  senderAddress_gte?: InputMaybe<Scalars['String']['input']>;
  senderAddress_in?: InputMaybe<Array<Scalars['String']['input']>>;
  senderAddress_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  senderAddress_lt?: InputMaybe<Scalars['String']['input']>;
  senderAddress_lte?: InputMaybe<Scalars['String']['input']>;
  senderAddress_not_contains?: InputMaybe<Scalars['String']['input']>;
  senderAddress_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  senderAddress_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  senderAddress_not_eq?: InputMaybe<Scalars['String']['input']>;
  senderAddress_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  senderAddress_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  senderAddress_startsWith?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_contains?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_endsWith?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_eq?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_gt?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_gte?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_in?: InputMaybe<Array<Scalars['String']['input']>>;
  sourceNetwork_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  sourceNetwork_lt?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_lte?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_not_contains?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_not_eq?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  sourceNetwork_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  sourceNetwork_startsWith?: InputMaybe<Scalars['String']['input']>;
  sourceParaId_eq?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_gt?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_gte?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  sourceParaId_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  sourceParaId_lt?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_lte?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_not_eq?: InputMaybe<Scalars['Int']['input']>;
  sourceParaId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  status_eq?: InputMaybe<Scalars['Int']['input']>;
  status_gt?: InputMaybe<Scalars['Int']['input']>;
  status_gte?: InputMaybe<Scalars['Int']['input']>;
  status_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  status_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  status_lt?: InputMaybe<Scalars['Int']['input']>;
  status_lte?: InputMaybe<Scalars['Int']['input']>;
  status_not_eq?: InputMaybe<Scalars['Int']['input']>;
  status_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_eq?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_gt?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_gte?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  timestamp_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  timestamp_lt?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_lte?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_not_eq?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  toAssetHubMessageQueue?: InputMaybe<MessageProcessedOnPolkadotWhereInput>;
  toAssetHubMessageQueue_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  toBridgeHubInboundQueue?: InputMaybe<InboundMessageReceivedOnBridgeHubWhereInput>;
  toBridgeHubInboundQueue_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  toDestination?: InputMaybe<MessageProcessedOnPolkadotWhereInput>;
  toDestination_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  tokenAddress_contains?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_endsWith?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_eq?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_gt?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_gte?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tokenAddress_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  tokenAddress_lt?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_lte?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_not_contains?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_not_eq?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tokenAddress_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  tokenAddress_startsWith?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_contains?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_endsWith?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_eq?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_gt?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_gte?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tokenLocation_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  tokenLocation_lt?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_lte?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_not_contains?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_not_eq?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tokenLocation_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  tokenLocation_startsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_contains?: InputMaybe<Scalars['String']['input']>;
  txHash_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  txHash_endsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_eq?: InputMaybe<Scalars['String']['input']>;
  txHash_gt?: InputMaybe<Scalars['String']['input']>;
  txHash_gte?: InputMaybe<Scalars['String']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['String']['input']>>;
  txHash_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  txHash_lt?: InputMaybe<Scalars['String']['input']>;
  txHash_lte?: InputMaybe<Scalars['String']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['String']['input']>;
  txHash_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  txHash_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_not_eq?: InputMaybe<Scalars['String']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  txHash_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  txHash_startsWith?: InputMaybe<Scalars['String']['input']>;
};
