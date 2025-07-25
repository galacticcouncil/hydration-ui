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
  BigInt: { input: any; output: any; }
  DateTime: { input: any; output: any; }
  JSON: { input: any; output: any; }
};

export type Block = {
  __typename?: 'Block';
  calls: Array<Call>;
  events: Array<Event>;
  extrinsics: Array<Extrinsic>;
  extrinsicsRoot: Scalars['String']['output'];
  hash: Scalars['String']['output'];
  height: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  parentHash: Scalars['String']['output'];
  spec: Metadata;
  stateRoot: Scalars['String']['output'];
  timestamp: Scalars['DateTime']['output'];
  validator?: Maybe<Scalars['String']['output']>;
};


export type BlockCallsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CallOrderByInput>>;
  where?: InputMaybe<CallWhereInput>;
};


export type BlockEventsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<EventOrderByInput>>;
  where?: InputMaybe<EventWhereInput>;
};


export type BlockExtrinsicsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ExtrinsicOrderByInput>>;
  where?: InputMaybe<ExtrinsicWhereInput>;
};

export type BlockEdge = {
  __typename?: 'BlockEdge';
  cursor: Scalars['String']['output'];
  node: Block;
};

export enum BlockOrderByInput {
  ExtrinsicsRootAsc = 'extrinsicsRoot_ASC',
  ExtrinsicsRootDesc = 'extrinsicsRoot_DESC',
  HashAsc = 'hash_ASC',
  HashDesc = 'hash_DESC',
  HeightAsc = 'height_ASC',
  HeightDesc = 'height_DESC',
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  ParentHashAsc = 'parentHash_ASC',
  ParentHashDesc = 'parentHash_DESC',
  SpecBlockHashAsc = 'spec_blockHash_ASC',
  SpecBlockHashDesc = 'spec_blockHash_DESC',
  SpecBlockHeightAsc = 'spec_blockHeight_ASC',
  SpecBlockHeightDesc = 'spec_blockHeight_DESC',
  SpecHexAsc = 'spec_hex_ASC',
  SpecHexDesc = 'spec_hex_DESC',
  SpecIdAsc = 'spec_id_ASC',
  SpecIdDesc = 'spec_id_DESC',
  SpecSpecNameAsc = 'spec_specName_ASC',
  SpecSpecNameDesc = 'spec_specName_DESC',
  SpecSpecVersionAsc = 'spec_specVersion_ASC',
  SpecSpecVersionDesc = 'spec_specVersion_DESC',
  StateRootAsc = 'stateRoot_ASC',
  StateRootDesc = 'stateRoot_DESC',
  TimestampAsc = 'timestamp_ASC',
  TimestampDesc = 'timestamp_DESC',
  ValidatorAsc = 'validator_ASC',
  ValidatorDesc = 'validator_DESC'
}

export type BlockWhereInput = {
  AND?: InputMaybe<Array<BlockWhereInput>>;
  OR?: InputMaybe<Array<BlockWhereInput>>;
  calls_every?: InputMaybe<CallWhereInput>;
  calls_none?: InputMaybe<CallWhereInput>;
  calls_some?: InputMaybe<CallWhereInput>;
  events_every?: InputMaybe<EventWhereInput>;
  events_none?: InputMaybe<EventWhereInput>;
  events_some?: InputMaybe<EventWhereInput>;
  extrinsicsRoot_contains?: InputMaybe<Scalars['String']['input']>;
  extrinsicsRoot_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  extrinsicsRoot_endsWith?: InputMaybe<Scalars['String']['input']>;
  extrinsicsRoot_eq?: InputMaybe<Scalars['String']['input']>;
  extrinsicsRoot_gt?: InputMaybe<Scalars['String']['input']>;
  extrinsicsRoot_gte?: InputMaybe<Scalars['String']['input']>;
  extrinsicsRoot_in?: InputMaybe<Array<Scalars['String']['input']>>;
  extrinsicsRoot_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  extrinsicsRoot_lt?: InputMaybe<Scalars['String']['input']>;
  extrinsicsRoot_lte?: InputMaybe<Scalars['String']['input']>;
  extrinsicsRoot_not_contains?: InputMaybe<Scalars['String']['input']>;
  extrinsicsRoot_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  extrinsicsRoot_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  extrinsicsRoot_not_eq?: InputMaybe<Scalars['String']['input']>;
  extrinsicsRoot_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  extrinsicsRoot_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  extrinsicsRoot_startsWith?: InputMaybe<Scalars['String']['input']>;
  extrinsics_every?: InputMaybe<ExtrinsicWhereInput>;
  extrinsics_none?: InputMaybe<ExtrinsicWhereInput>;
  extrinsics_some?: InputMaybe<ExtrinsicWhereInput>;
  hash_contains?: InputMaybe<Scalars['String']['input']>;
  hash_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  hash_endsWith?: InputMaybe<Scalars['String']['input']>;
  hash_eq?: InputMaybe<Scalars['String']['input']>;
  hash_gt?: InputMaybe<Scalars['String']['input']>;
  hash_gte?: InputMaybe<Scalars['String']['input']>;
  hash_in?: InputMaybe<Array<Scalars['String']['input']>>;
  hash_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  hash_lt?: InputMaybe<Scalars['String']['input']>;
  hash_lte?: InputMaybe<Scalars['String']['input']>;
  hash_not_contains?: InputMaybe<Scalars['String']['input']>;
  hash_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  hash_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  hash_not_eq?: InputMaybe<Scalars['String']['input']>;
  hash_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  hash_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  hash_startsWith?: InputMaybe<Scalars['String']['input']>;
  height_eq?: InputMaybe<Scalars['Int']['input']>;
  height_gt?: InputMaybe<Scalars['Int']['input']>;
  height_gte?: InputMaybe<Scalars['Int']['input']>;
  height_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  height_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  height_lt?: InputMaybe<Scalars['Int']['input']>;
  height_lte?: InputMaybe<Scalars['Int']['input']>;
  height_not_eq?: InputMaybe<Scalars['Int']['input']>;
  height_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
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
  parentHash_contains?: InputMaybe<Scalars['String']['input']>;
  parentHash_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  parentHash_endsWith?: InputMaybe<Scalars['String']['input']>;
  parentHash_eq?: InputMaybe<Scalars['String']['input']>;
  parentHash_gt?: InputMaybe<Scalars['String']['input']>;
  parentHash_gte?: InputMaybe<Scalars['String']['input']>;
  parentHash_in?: InputMaybe<Array<Scalars['String']['input']>>;
  parentHash_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  parentHash_lt?: InputMaybe<Scalars['String']['input']>;
  parentHash_lte?: InputMaybe<Scalars['String']['input']>;
  parentHash_not_contains?: InputMaybe<Scalars['String']['input']>;
  parentHash_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  parentHash_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  parentHash_not_eq?: InputMaybe<Scalars['String']['input']>;
  parentHash_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  parentHash_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  parentHash_startsWith?: InputMaybe<Scalars['String']['input']>;
  spec?: InputMaybe<MetadataWhereInput>;
  spec_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  stateRoot_contains?: InputMaybe<Scalars['String']['input']>;
  stateRoot_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  stateRoot_endsWith?: InputMaybe<Scalars['String']['input']>;
  stateRoot_eq?: InputMaybe<Scalars['String']['input']>;
  stateRoot_gt?: InputMaybe<Scalars['String']['input']>;
  stateRoot_gte?: InputMaybe<Scalars['String']['input']>;
  stateRoot_in?: InputMaybe<Array<Scalars['String']['input']>>;
  stateRoot_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  stateRoot_lt?: InputMaybe<Scalars['String']['input']>;
  stateRoot_lte?: InputMaybe<Scalars['String']['input']>;
  stateRoot_not_contains?: InputMaybe<Scalars['String']['input']>;
  stateRoot_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  stateRoot_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  stateRoot_not_eq?: InputMaybe<Scalars['String']['input']>;
  stateRoot_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  stateRoot_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  stateRoot_startsWith?: InputMaybe<Scalars['String']['input']>;
  timestamp_eq?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_gt?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_gte?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  timestamp_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  timestamp_lt?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_lte?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_not_eq?: InputMaybe<Scalars['DateTime']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  validator_contains?: InputMaybe<Scalars['String']['input']>;
  validator_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  validator_endsWith?: InputMaybe<Scalars['String']['input']>;
  validator_eq?: InputMaybe<Scalars['String']['input']>;
  validator_gt?: InputMaybe<Scalars['String']['input']>;
  validator_gte?: InputMaybe<Scalars['String']['input']>;
  validator_in?: InputMaybe<Array<Scalars['String']['input']>>;
  validator_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  validator_lt?: InputMaybe<Scalars['String']['input']>;
  validator_lte?: InputMaybe<Scalars['String']['input']>;
  validator_not_contains?: InputMaybe<Scalars['String']['input']>;
  validator_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  validator_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  validator_not_eq?: InputMaybe<Scalars['String']['input']>;
  validator_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  validator_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  validator_startsWith?: InputMaybe<Scalars['String']['input']>;
};

export type BlocksConnection = {
  __typename?: 'BlocksConnection';
  edges: Array<BlockEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Call = {
  __typename?: 'Call';
  args?: Maybe<Scalars['JSON']['output']>;
  block: Block;
  error?: Maybe<Scalars['JSON']['output']>;
  extrinsic: Extrinsic;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  origin?: Maybe<Scalars['JSON']['output']>;
  parent?: Maybe<Call>;
  pos: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type CallEdge = {
  __typename?: 'CallEdge';
  cursor: Scalars['String']['output'];
  node: Call;
};

export enum CallOrderByInput {
  BlockExtrinsicsRootAsc = 'block_extrinsicsRoot_ASC',
  BlockExtrinsicsRootDesc = 'block_extrinsicsRoot_DESC',
  BlockHashAsc = 'block_hash_ASC',
  BlockHashDesc = 'block_hash_DESC',
  BlockHeightAsc = 'block_height_ASC',
  BlockHeightDesc = 'block_height_DESC',
  BlockIdAsc = 'block_id_ASC',
  BlockIdDesc = 'block_id_DESC',
  BlockParentHashAsc = 'block_parentHash_ASC',
  BlockParentHashDesc = 'block_parentHash_DESC',
  BlockStateRootAsc = 'block_stateRoot_ASC',
  BlockStateRootDesc = 'block_stateRoot_DESC',
  BlockTimestampAsc = 'block_timestamp_ASC',
  BlockTimestampDesc = 'block_timestamp_DESC',
  BlockValidatorAsc = 'block_validator_ASC',
  BlockValidatorDesc = 'block_validator_DESC',
  ExtrinsicFeeAsc = 'extrinsic_fee_ASC',
  ExtrinsicFeeDesc = 'extrinsic_fee_DESC',
  ExtrinsicHashAsc = 'extrinsic_hash_ASC',
  ExtrinsicHashDesc = 'extrinsic_hash_DESC',
  ExtrinsicIdAsc = 'extrinsic_id_ASC',
  ExtrinsicIdDesc = 'extrinsic_id_DESC',
  ExtrinsicIndexInBlockAsc = 'extrinsic_indexInBlock_ASC',
  ExtrinsicIndexInBlockDesc = 'extrinsic_indexInBlock_DESC',
  ExtrinsicPosAsc = 'extrinsic_pos_ASC',
  ExtrinsicPosDesc = 'extrinsic_pos_DESC',
  ExtrinsicSuccessAsc = 'extrinsic_success_ASC',
  ExtrinsicSuccessDesc = 'extrinsic_success_DESC',
  ExtrinsicTipAsc = 'extrinsic_tip_ASC',
  ExtrinsicTipDesc = 'extrinsic_tip_DESC',
  ExtrinsicVersionAsc = 'extrinsic_version_ASC',
  ExtrinsicVersionDesc = 'extrinsic_version_DESC',
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  ParentIdAsc = 'parent_id_ASC',
  ParentIdDesc = 'parent_id_DESC',
  ParentNameAsc = 'parent_name_ASC',
  ParentNameDesc = 'parent_name_DESC',
  ParentPosAsc = 'parent_pos_ASC',
  ParentPosDesc = 'parent_pos_DESC',
  ParentSuccessAsc = 'parent_success_ASC',
  ParentSuccessDesc = 'parent_success_DESC',
  PosAsc = 'pos_ASC',
  PosDesc = 'pos_DESC',
  SuccessAsc = 'success_ASC',
  SuccessDesc = 'success_DESC'
}

export type CallWhereInput = {
  AND?: InputMaybe<Array<CallWhereInput>>;
  OR?: InputMaybe<Array<CallWhereInput>>;
  args_eq?: InputMaybe<Scalars['JSON']['input']>;
  args_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  args_jsonContains?: InputMaybe<Scalars['JSON']['input']>;
  args_jsonHasKey?: InputMaybe<Scalars['JSON']['input']>;
  args_not_eq?: InputMaybe<Scalars['JSON']['input']>;
  block?: InputMaybe<BlockWhereInput>;
  block_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  error_eq?: InputMaybe<Scalars['JSON']['input']>;
  error_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  error_jsonContains?: InputMaybe<Scalars['JSON']['input']>;
  error_jsonHasKey?: InputMaybe<Scalars['JSON']['input']>;
  error_not_eq?: InputMaybe<Scalars['JSON']['input']>;
  extrinsic?: InputMaybe<ExtrinsicWhereInput>;
  extrinsic_isNull?: InputMaybe<Scalars['Boolean']['input']>;
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
  name_contains?: InputMaybe<Scalars['String']['input']>;
  name_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  name_endsWith?: InputMaybe<Scalars['String']['input']>;
  name_eq?: InputMaybe<Scalars['String']['input']>;
  name_gt?: InputMaybe<Scalars['String']['input']>;
  name_gte?: InputMaybe<Scalars['String']['input']>;
  name_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  name_lt?: InputMaybe<Scalars['String']['input']>;
  name_lte?: InputMaybe<Scalars['String']['input']>;
  name_not_contains?: InputMaybe<Scalars['String']['input']>;
  name_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  name_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  name_not_eq?: InputMaybe<Scalars['String']['input']>;
  name_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  name_startsWith?: InputMaybe<Scalars['String']['input']>;
  origin_eq?: InputMaybe<Scalars['JSON']['input']>;
  origin_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  origin_jsonContains?: InputMaybe<Scalars['JSON']['input']>;
  origin_jsonHasKey?: InputMaybe<Scalars['JSON']['input']>;
  origin_not_eq?: InputMaybe<Scalars['JSON']['input']>;
  parent?: InputMaybe<CallWhereInput>;
  parent_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  pos_eq?: InputMaybe<Scalars['Int']['input']>;
  pos_gt?: InputMaybe<Scalars['Int']['input']>;
  pos_gte?: InputMaybe<Scalars['Int']['input']>;
  pos_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  pos_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  pos_lt?: InputMaybe<Scalars['Int']['input']>;
  pos_lte?: InputMaybe<Scalars['Int']['input']>;
  pos_not_eq?: InputMaybe<Scalars['Int']['input']>;
  pos_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  success_eq?: InputMaybe<Scalars['Boolean']['input']>;
  success_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  success_not_eq?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CallsConnection = {
  __typename?: 'CallsConnection';
  edges: Array<CallEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Event = {
  __typename?: 'Event';
  args?: Maybe<Scalars['JSON']['output']>;
  block: Block;
  call?: Maybe<Call>;
  extrinsic?: Maybe<Extrinsic>;
  id: Scalars['String']['output'];
  indexInBlock: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  phase: Scalars['String']['output'];
  pos: Scalars['Int']['output'];
};

export type EventEdge = {
  __typename?: 'EventEdge';
  cursor: Scalars['String']['output'];
  node: Event;
};

export enum EventOrderByInput {
  BlockExtrinsicsRootAsc = 'block_extrinsicsRoot_ASC',
  BlockExtrinsicsRootDesc = 'block_extrinsicsRoot_DESC',
  BlockHashAsc = 'block_hash_ASC',
  BlockHashDesc = 'block_hash_DESC',
  BlockHeightAsc = 'block_height_ASC',
  BlockHeightDesc = 'block_height_DESC',
  BlockIdAsc = 'block_id_ASC',
  BlockIdDesc = 'block_id_DESC',
  BlockParentHashAsc = 'block_parentHash_ASC',
  BlockParentHashDesc = 'block_parentHash_DESC',
  BlockStateRootAsc = 'block_stateRoot_ASC',
  BlockStateRootDesc = 'block_stateRoot_DESC',
  BlockTimestampAsc = 'block_timestamp_ASC',
  BlockTimestampDesc = 'block_timestamp_DESC',
  BlockValidatorAsc = 'block_validator_ASC',
  BlockValidatorDesc = 'block_validator_DESC',
  CallIdAsc = 'call_id_ASC',
  CallIdDesc = 'call_id_DESC',
  CallNameAsc = 'call_name_ASC',
  CallNameDesc = 'call_name_DESC',
  CallPosAsc = 'call_pos_ASC',
  CallPosDesc = 'call_pos_DESC',
  CallSuccessAsc = 'call_success_ASC',
  CallSuccessDesc = 'call_success_DESC',
  ExtrinsicFeeAsc = 'extrinsic_fee_ASC',
  ExtrinsicFeeDesc = 'extrinsic_fee_DESC',
  ExtrinsicHashAsc = 'extrinsic_hash_ASC',
  ExtrinsicHashDesc = 'extrinsic_hash_DESC',
  ExtrinsicIdAsc = 'extrinsic_id_ASC',
  ExtrinsicIdDesc = 'extrinsic_id_DESC',
  ExtrinsicIndexInBlockAsc = 'extrinsic_indexInBlock_ASC',
  ExtrinsicIndexInBlockDesc = 'extrinsic_indexInBlock_DESC',
  ExtrinsicPosAsc = 'extrinsic_pos_ASC',
  ExtrinsicPosDesc = 'extrinsic_pos_DESC',
  ExtrinsicSuccessAsc = 'extrinsic_success_ASC',
  ExtrinsicSuccessDesc = 'extrinsic_success_DESC',
  ExtrinsicTipAsc = 'extrinsic_tip_ASC',
  ExtrinsicTipDesc = 'extrinsic_tip_DESC',
  ExtrinsicVersionAsc = 'extrinsic_version_ASC',
  ExtrinsicVersionDesc = 'extrinsic_version_DESC',
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  IndexInBlockAsc = 'indexInBlock_ASC',
  IndexInBlockDesc = 'indexInBlock_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  PhaseAsc = 'phase_ASC',
  PhaseDesc = 'phase_DESC',
  PosAsc = 'pos_ASC',
  PosDesc = 'pos_DESC'
}

export type EventWhereInput = {
  AND?: InputMaybe<Array<EventWhereInput>>;
  OR?: InputMaybe<Array<EventWhereInput>>;
  args_eq?: InputMaybe<Scalars['JSON']['input']>;
  args_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  args_jsonContains?: InputMaybe<Scalars['JSON']['input']>;
  args_jsonHasKey?: InputMaybe<Scalars['JSON']['input']>;
  args_not_eq?: InputMaybe<Scalars['JSON']['input']>;
  block?: InputMaybe<BlockWhereInput>;
  block_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  call?: InputMaybe<CallWhereInput>;
  call_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  extrinsic?: InputMaybe<ExtrinsicWhereInput>;
  extrinsic_isNull?: InputMaybe<Scalars['Boolean']['input']>;
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
  indexInBlock_eq?: InputMaybe<Scalars['Int']['input']>;
  indexInBlock_gt?: InputMaybe<Scalars['Int']['input']>;
  indexInBlock_gte?: InputMaybe<Scalars['Int']['input']>;
  indexInBlock_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  indexInBlock_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  indexInBlock_lt?: InputMaybe<Scalars['Int']['input']>;
  indexInBlock_lte?: InputMaybe<Scalars['Int']['input']>;
  indexInBlock_not_eq?: InputMaybe<Scalars['Int']['input']>;
  indexInBlock_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  name_contains?: InputMaybe<Scalars['String']['input']>;
  name_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  name_endsWith?: InputMaybe<Scalars['String']['input']>;
  name_eq?: InputMaybe<Scalars['String']['input']>;
  name_gt?: InputMaybe<Scalars['String']['input']>;
  name_gte?: InputMaybe<Scalars['String']['input']>;
  name_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  name_lt?: InputMaybe<Scalars['String']['input']>;
  name_lte?: InputMaybe<Scalars['String']['input']>;
  name_not_contains?: InputMaybe<Scalars['String']['input']>;
  name_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  name_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  name_not_eq?: InputMaybe<Scalars['String']['input']>;
  name_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  name_startsWith?: InputMaybe<Scalars['String']['input']>;
  phase_contains?: InputMaybe<Scalars['String']['input']>;
  phase_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  phase_endsWith?: InputMaybe<Scalars['String']['input']>;
  phase_eq?: InputMaybe<Scalars['String']['input']>;
  phase_gt?: InputMaybe<Scalars['String']['input']>;
  phase_gte?: InputMaybe<Scalars['String']['input']>;
  phase_in?: InputMaybe<Array<Scalars['String']['input']>>;
  phase_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  phase_lt?: InputMaybe<Scalars['String']['input']>;
  phase_lte?: InputMaybe<Scalars['String']['input']>;
  phase_not_contains?: InputMaybe<Scalars['String']['input']>;
  phase_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  phase_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  phase_not_eq?: InputMaybe<Scalars['String']['input']>;
  phase_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  phase_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  phase_startsWith?: InputMaybe<Scalars['String']['input']>;
  pos_eq?: InputMaybe<Scalars['Int']['input']>;
  pos_gt?: InputMaybe<Scalars['Int']['input']>;
  pos_gte?: InputMaybe<Scalars['Int']['input']>;
  pos_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  pos_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  pos_lt?: InputMaybe<Scalars['Int']['input']>;
  pos_lte?: InputMaybe<Scalars['Int']['input']>;
  pos_not_eq?: InputMaybe<Scalars['Int']['input']>;
  pos_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type EventsConnection = {
  __typename?: 'EventsConnection';
  edges: Array<EventEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Extrinsic = {
  __typename?: 'Extrinsic';
  block: Block;
  call: Call;
  calls: Array<Call>;
  error?: Maybe<Scalars['JSON']['output']>;
  fee?: Maybe<Scalars['BigInt']['output']>;
  hash: Scalars['String']['output'];
  id: Scalars['String']['output'];
  indexInBlock: Scalars['Int']['output'];
  pos: Scalars['Int']['output'];
  signature?: Maybe<Scalars['JSON']['output']>;
  success: Scalars['Boolean']['output'];
  tip?: Maybe<Scalars['BigInt']['output']>;
  version: Scalars['Int']['output'];
};


export type ExtrinsicCallsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CallOrderByInput>>;
  where?: InputMaybe<CallWhereInput>;
};

export type ExtrinsicEdge = {
  __typename?: 'ExtrinsicEdge';
  cursor: Scalars['String']['output'];
  node: Extrinsic;
};

export enum ExtrinsicOrderByInput {
  BlockExtrinsicsRootAsc = 'block_extrinsicsRoot_ASC',
  BlockExtrinsicsRootDesc = 'block_extrinsicsRoot_DESC',
  BlockHashAsc = 'block_hash_ASC',
  BlockHashDesc = 'block_hash_DESC',
  BlockHeightAsc = 'block_height_ASC',
  BlockHeightDesc = 'block_height_DESC',
  BlockIdAsc = 'block_id_ASC',
  BlockIdDesc = 'block_id_DESC',
  BlockParentHashAsc = 'block_parentHash_ASC',
  BlockParentHashDesc = 'block_parentHash_DESC',
  BlockStateRootAsc = 'block_stateRoot_ASC',
  BlockStateRootDesc = 'block_stateRoot_DESC',
  BlockTimestampAsc = 'block_timestamp_ASC',
  BlockTimestampDesc = 'block_timestamp_DESC',
  BlockValidatorAsc = 'block_validator_ASC',
  BlockValidatorDesc = 'block_validator_DESC',
  CallIdAsc = 'call_id_ASC',
  CallIdDesc = 'call_id_DESC',
  CallNameAsc = 'call_name_ASC',
  CallNameDesc = 'call_name_DESC',
  CallPosAsc = 'call_pos_ASC',
  CallPosDesc = 'call_pos_DESC',
  CallSuccessAsc = 'call_success_ASC',
  CallSuccessDesc = 'call_success_DESC',
  FeeAsc = 'fee_ASC',
  FeeDesc = 'fee_DESC',
  HashAsc = 'hash_ASC',
  HashDesc = 'hash_DESC',
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  IndexInBlockAsc = 'indexInBlock_ASC',
  IndexInBlockDesc = 'indexInBlock_DESC',
  PosAsc = 'pos_ASC',
  PosDesc = 'pos_DESC',
  SuccessAsc = 'success_ASC',
  SuccessDesc = 'success_DESC',
  TipAsc = 'tip_ASC',
  TipDesc = 'tip_DESC',
  VersionAsc = 'version_ASC',
  VersionDesc = 'version_DESC'
}

export type ExtrinsicWhereInput = {
  AND?: InputMaybe<Array<ExtrinsicWhereInput>>;
  OR?: InputMaybe<Array<ExtrinsicWhereInput>>;
  block?: InputMaybe<BlockWhereInput>;
  block_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  call?: InputMaybe<CallWhereInput>;
  call_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  calls_every?: InputMaybe<CallWhereInput>;
  calls_none?: InputMaybe<CallWhereInput>;
  calls_some?: InputMaybe<CallWhereInput>;
  error_eq?: InputMaybe<Scalars['JSON']['input']>;
  error_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  error_jsonContains?: InputMaybe<Scalars['JSON']['input']>;
  error_jsonHasKey?: InputMaybe<Scalars['JSON']['input']>;
  error_not_eq?: InputMaybe<Scalars['JSON']['input']>;
  fee_eq?: InputMaybe<Scalars['BigInt']['input']>;
  fee_gt?: InputMaybe<Scalars['BigInt']['input']>;
  fee_gte?: InputMaybe<Scalars['BigInt']['input']>;
  fee_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  fee_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  fee_lt?: InputMaybe<Scalars['BigInt']['input']>;
  fee_lte?: InputMaybe<Scalars['BigInt']['input']>;
  fee_not_eq?: InputMaybe<Scalars['BigInt']['input']>;
  fee_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  hash_contains?: InputMaybe<Scalars['String']['input']>;
  hash_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  hash_endsWith?: InputMaybe<Scalars['String']['input']>;
  hash_eq?: InputMaybe<Scalars['String']['input']>;
  hash_gt?: InputMaybe<Scalars['String']['input']>;
  hash_gte?: InputMaybe<Scalars['String']['input']>;
  hash_in?: InputMaybe<Array<Scalars['String']['input']>>;
  hash_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  hash_lt?: InputMaybe<Scalars['String']['input']>;
  hash_lte?: InputMaybe<Scalars['String']['input']>;
  hash_not_contains?: InputMaybe<Scalars['String']['input']>;
  hash_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  hash_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  hash_not_eq?: InputMaybe<Scalars['String']['input']>;
  hash_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  hash_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  hash_startsWith?: InputMaybe<Scalars['String']['input']>;
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
  indexInBlock_eq?: InputMaybe<Scalars['Int']['input']>;
  indexInBlock_gt?: InputMaybe<Scalars['Int']['input']>;
  indexInBlock_gte?: InputMaybe<Scalars['Int']['input']>;
  indexInBlock_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  indexInBlock_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  indexInBlock_lt?: InputMaybe<Scalars['Int']['input']>;
  indexInBlock_lte?: InputMaybe<Scalars['Int']['input']>;
  indexInBlock_not_eq?: InputMaybe<Scalars['Int']['input']>;
  indexInBlock_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  pos_eq?: InputMaybe<Scalars['Int']['input']>;
  pos_gt?: InputMaybe<Scalars['Int']['input']>;
  pos_gte?: InputMaybe<Scalars['Int']['input']>;
  pos_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  pos_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  pos_lt?: InputMaybe<Scalars['Int']['input']>;
  pos_lte?: InputMaybe<Scalars['Int']['input']>;
  pos_not_eq?: InputMaybe<Scalars['Int']['input']>;
  pos_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  signature_eq?: InputMaybe<Scalars['JSON']['input']>;
  signature_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  signature_jsonContains?: InputMaybe<Scalars['JSON']['input']>;
  signature_jsonHasKey?: InputMaybe<Scalars['JSON']['input']>;
  signature_not_eq?: InputMaybe<Scalars['JSON']['input']>;
  success_eq?: InputMaybe<Scalars['Boolean']['input']>;
  success_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  success_not_eq?: InputMaybe<Scalars['Boolean']['input']>;
  tip_eq?: InputMaybe<Scalars['BigInt']['input']>;
  tip_gt?: InputMaybe<Scalars['BigInt']['input']>;
  tip_gte?: InputMaybe<Scalars['BigInt']['input']>;
  tip_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tip_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  tip_lt?: InputMaybe<Scalars['BigInt']['input']>;
  tip_lte?: InputMaybe<Scalars['BigInt']['input']>;
  tip_not_eq?: InputMaybe<Scalars['BigInt']['input']>;
  tip_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  version_eq?: InputMaybe<Scalars['Int']['input']>;
  version_gt?: InputMaybe<Scalars['Int']['input']>;
  version_gte?: InputMaybe<Scalars['Int']['input']>;
  version_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  version_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  version_lt?: InputMaybe<Scalars['Int']['input']>;
  version_lte?: InputMaybe<Scalars['Int']['input']>;
  version_not_eq?: InputMaybe<Scalars['Int']['input']>;
  version_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type ExtrinsicsConnection = {
  __typename?: 'ExtrinsicsConnection';
  edges: Array<ExtrinsicEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Metadata = {
  __typename?: 'Metadata';
  blockHash: Scalars['String']['output'];
  blockHeight: Scalars['Int']['output'];
  hex: Scalars['String']['output'];
  id: Scalars['String']['output'];
  specName: Scalars['String']['output'];
  specVersion?: Maybe<Scalars['Int']['output']>;
};

export type MetadataConnection = {
  __typename?: 'MetadataConnection';
  edges: Array<MetadataEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type MetadataEdge = {
  __typename?: 'MetadataEdge';
  cursor: Scalars['String']['output'];
  node: Metadata;
};

export enum MetadataOrderByInput {
  BlockHashAsc = 'blockHash_ASC',
  BlockHashDesc = 'blockHash_DESC',
  BlockHeightAsc = 'blockHeight_ASC',
  BlockHeightDesc = 'blockHeight_DESC',
  HexAsc = 'hex_ASC',
  HexDesc = 'hex_DESC',
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  SpecNameAsc = 'specName_ASC',
  SpecNameDesc = 'specName_DESC',
  SpecVersionAsc = 'specVersion_ASC',
  SpecVersionDesc = 'specVersion_DESC'
}

export type MetadataWhereInput = {
  AND?: InputMaybe<Array<MetadataWhereInput>>;
  OR?: InputMaybe<Array<MetadataWhereInput>>;
  blockHash_contains?: InputMaybe<Scalars['String']['input']>;
  blockHash_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  blockHash_endsWith?: InputMaybe<Scalars['String']['input']>;
  blockHash_eq?: InputMaybe<Scalars['String']['input']>;
  blockHash_gt?: InputMaybe<Scalars['String']['input']>;
  blockHash_gte?: InputMaybe<Scalars['String']['input']>;
  blockHash_in?: InputMaybe<Array<Scalars['String']['input']>>;
  blockHash_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  blockHash_lt?: InputMaybe<Scalars['String']['input']>;
  blockHash_lte?: InputMaybe<Scalars['String']['input']>;
  blockHash_not_contains?: InputMaybe<Scalars['String']['input']>;
  blockHash_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  blockHash_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  blockHash_not_eq?: InputMaybe<Scalars['String']['input']>;
  blockHash_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  blockHash_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  blockHash_startsWith?: InputMaybe<Scalars['String']['input']>;
  blockHeight_eq?: InputMaybe<Scalars['Int']['input']>;
  blockHeight_gt?: InputMaybe<Scalars['Int']['input']>;
  blockHeight_gte?: InputMaybe<Scalars['Int']['input']>;
  blockHeight_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  blockHeight_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  blockHeight_lt?: InputMaybe<Scalars['Int']['input']>;
  blockHeight_lte?: InputMaybe<Scalars['Int']['input']>;
  blockHeight_not_eq?: InputMaybe<Scalars['Int']['input']>;
  blockHeight_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  hex_contains?: InputMaybe<Scalars['String']['input']>;
  hex_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  hex_endsWith?: InputMaybe<Scalars['String']['input']>;
  hex_eq?: InputMaybe<Scalars['String']['input']>;
  hex_gt?: InputMaybe<Scalars['String']['input']>;
  hex_gte?: InputMaybe<Scalars['String']['input']>;
  hex_in?: InputMaybe<Array<Scalars['String']['input']>>;
  hex_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  hex_lt?: InputMaybe<Scalars['String']['input']>;
  hex_lte?: InputMaybe<Scalars['String']['input']>;
  hex_not_contains?: InputMaybe<Scalars['String']['input']>;
  hex_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  hex_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  hex_not_eq?: InputMaybe<Scalars['String']['input']>;
  hex_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  hex_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  hex_startsWith?: InputMaybe<Scalars['String']['input']>;
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
  specName_contains?: InputMaybe<Scalars['String']['input']>;
  specName_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  specName_endsWith?: InputMaybe<Scalars['String']['input']>;
  specName_eq?: InputMaybe<Scalars['String']['input']>;
  specName_gt?: InputMaybe<Scalars['String']['input']>;
  specName_gte?: InputMaybe<Scalars['String']['input']>;
  specName_in?: InputMaybe<Array<Scalars['String']['input']>>;
  specName_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  specName_lt?: InputMaybe<Scalars['String']['input']>;
  specName_lte?: InputMaybe<Scalars['String']['input']>;
  specName_not_contains?: InputMaybe<Scalars['String']['input']>;
  specName_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  specName_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  specName_not_eq?: InputMaybe<Scalars['String']['input']>;
  specName_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  specName_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  specName_startsWith?: InputMaybe<Scalars['String']['input']>;
  specVersion_eq?: InputMaybe<Scalars['Int']['input']>;
  specVersion_gt?: InputMaybe<Scalars['Int']['input']>;
  specVersion_gte?: InputMaybe<Scalars['Int']['input']>;
  specVersion_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  specVersion_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  specVersion_lt?: InputMaybe<Scalars['Int']['input']>;
  specVersion_lte?: InputMaybe<Scalars['Int']['input']>;
  specVersion_not_eq?: InputMaybe<Scalars['Int']['input']>;
  specVersion_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor: Scalars['String']['output'];
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  blockById?: Maybe<Block>;
  /** @deprecated Use blockById */
  blockByUniqueInput?: Maybe<Block>;
  blocks: Array<Block>;
  blocksConnection: BlocksConnection;
  callById?: Maybe<Call>;
  /** @deprecated Use callById */
  callByUniqueInput?: Maybe<Call>;
  calls: Array<Call>;
  callsConnection: CallsConnection;
  eventById?: Maybe<Event>;
  /** @deprecated Use eventById */
  eventByUniqueInput?: Maybe<Event>;
  events: Array<Event>;
  eventsConnection: EventsConnection;
  extrinsicById?: Maybe<Extrinsic>;
  /** @deprecated Use extrinsicById */
  extrinsicByUniqueInput?: Maybe<Extrinsic>;
  extrinsics: Array<Extrinsic>;
  extrinsicsConnection: ExtrinsicsConnection;
  metadata: Array<Metadata>;
  metadataById?: Maybe<Metadata>;
  /** @deprecated Use metadataById */
  metadataByUniqueInput?: Maybe<Metadata>;
  metadataConnection: MetadataConnection;
};


export type QueryBlockByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryBlockByUniqueInputArgs = {
  where: WhereIdInput;
};


export type QueryBlocksArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<BlockOrderByInput>>;
  where?: InputMaybe<BlockWhereInput>;
};


export type QueryBlocksConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy: Array<BlockOrderByInput>;
  where?: InputMaybe<BlockWhereInput>;
};


export type QueryCallByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryCallByUniqueInputArgs = {
  where: WhereIdInput;
};


export type QueryCallsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<CallOrderByInput>>;
  where?: InputMaybe<CallWhereInput>;
};


export type QueryCallsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy: Array<CallOrderByInput>;
  where?: InputMaybe<CallWhereInput>;
};


export type QueryEventByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryEventByUniqueInputArgs = {
  where: WhereIdInput;
};


export type QueryEventsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<EventOrderByInput>>;
  where?: InputMaybe<EventWhereInput>;
};


export type QueryEventsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy: Array<EventOrderByInput>;
  where?: InputMaybe<EventWhereInput>;
};


export type QueryExtrinsicByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryExtrinsicByUniqueInputArgs = {
  where: WhereIdInput;
};


export type QueryExtrinsicsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ExtrinsicOrderByInput>>;
  where?: InputMaybe<ExtrinsicWhereInput>;
};


export type QueryExtrinsicsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy: Array<ExtrinsicOrderByInput>;
  where?: InputMaybe<ExtrinsicWhereInput>;
};


export type QueryMetadataArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<MetadataOrderByInput>>;
  where?: InputMaybe<MetadataWhereInput>;
};


export type QueryMetadataByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryMetadataByUniqueInputArgs = {
  where: WhereIdInput;
};


export type QueryMetadataConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy: Array<MetadataOrderByInput>;
  where?: InputMaybe<MetadataWhereInput>;
};

export type WhereIdInput = {
  id: Scalars['String']['input'];
};
