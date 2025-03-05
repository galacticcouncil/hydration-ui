import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {"context":{"clientName":"indexer"}} as const;
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
  readonly AND?: InputMaybe<ReadonlyArray<BlockWhereInput>>;
  readonly OR?: InputMaybe<ReadonlyArray<BlockWhereInput>>;
  readonly calls_every?: InputMaybe<CallWhereInput>;
  readonly calls_none?: InputMaybe<CallWhereInput>;
  readonly calls_some?: InputMaybe<CallWhereInput>;
  readonly events_every?: InputMaybe<EventWhereInput>;
  readonly events_none?: InputMaybe<EventWhereInput>;
  readonly events_some?: InputMaybe<EventWhereInput>;
  readonly extrinsicsRoot_contains?: InputMaybe<Scalars['String']['input']>;
  readonly extrinsicsRoot_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly extrinsicsRoot_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly extrinsicsRoot_eq?: InputMaybe<Scalars['String']['input']>;
  readonly extrinsicsRoot_gt?: InputMaybe<Scalars['String']['input']>;
  readonly extrinsicsRoot_gte?: InputMaybe<Scalars['String']['input']>;
  readonly extrinsicsRoot_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly extrinsicsRoot_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly extrinsicsRoot_lt?: InputMaybe<Scalars['String']['input']>;
  readonly extrinsicsRoot_lte?: InputMaybe<Scalars['String']['input']>;
  readonly extrinsicsRoot_not_contains?: InputMaybe<Scalars['String']['input']>;
  readonly extrinsicsRoot_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly extrinsicsRoot_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly extrinsicsRoot_not_eq?: InputMaybe<Scalars['String']['input']>;
  readonly extrinsicsRoot_not_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly extrinsicsRoot_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly extrinsicsRoot_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly extrinsics_every?: InputMaybe<ExtrinsicWhereInput>;
  readonly extrinsics_none?: InputMaybe<ExtrinsicWhereInput>;
  readonly extrinsics_some?: InputMaybe<ExtrinsicWhereInput>;
  readonly hash_contains?: InputMaybe<Scalars['String']['input']>;
  readonly hash_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly hash_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly hash_eq?: InputMaybe<Scalars['String']['input']>;
  readonly hash_gt?: InputMaybe<Scalars['String']['input']>;
  readonly hash_gte?: InputMaybe<Scalars['String']['input']>;
  readonly hash_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly hash_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly hash_lt?: InputMaybe<Scalars['String']['input']>;
  readonly hash_lte?: InputMaybe<Scalars['String']['input']>;
  readonly hash_not_contains?: InputMaybe<Scalars['String']['input']>;
  readonly hash_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly hash_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly hash_not_eq?: InputMaybe<Scalars['String']['input']>;
  readonly hash_not_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly hash_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly hash_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly height_eq?: InputMaybe<Scalars['Int']['input']>;
  readonly height_gt?: InputMaybe<Scalars['Int']['input']>;
  readonly height_gte?: InputMaybe<Scalars['Int']['input']>;
  readonly height_in?: InputMaybe<ReadonlyArray<Scalars['Int']['input']>>;
  readonly height_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly height_lt?: InputMaybe<Scalars['Int']['input']>;
  readonly height_lte?: InputMaybe<Scalars['Int']['input']>;
  readonly height_not_eq?: InputMaybe<Scalars['Int']['input']>;
  readonly height_not_in?: InputMaybe<ReadonlyArray<Scalars['Int']['input']>>;
  readonly id_contains?: InputMaybe<Scalars['String']['input']>;
  readonly id_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly id_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly id_eq?: InputMaybe<Scalars['String']['input']>;
  readonly id_gt?: InputMaybe<Scalars['String']['input']>;
  readonly id_gte?: InputMaybe<Scalars['String']['input']>;
  readonly id_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly id_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly id_lt?: InputMaybe<Scalars['String']['input']>;
  readonly id_lte?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_contains?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_eq?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly id_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly id_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly parentHash_contains?: InputMaybe<Scalars['String']['input']>;
  readonly parentHash_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly parentHash_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly parentHash_eq?: InputMaybe<Scalars['String']['input']>;
  readonly parentHash_gt?: InputMaybe<Scalars['String']['input']>;
  readonly parentHash_gte?: InputMaybe<Scalars['String']['input']>;
  readonly parentHash_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly parentHash_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly parentHash_lt?: InputMaybe<Scalars['String']['input']>;
  readonly parentHash_lte?: InputMaybe<Scalars['String']['input']>;
  readonly parentHash_not_contains?: InputMaybe<Scalars['String']['input']>;
  readonly parentHash_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly parentHash_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly parentHash_not_eq?: InputMaybe<Scalars['String']['input']>;
  readonly parentHash_not_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly parentHash_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly parentHash_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly spec?: InputMaybe<MetadataWhereInput>;
  readonly spec_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly stateRoot_contains?: InputMaybe<Scalars['String']['input']>;
  readonly stateRoot_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly stateRoot_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly stateRoot_eq?: InputMaybe<Scalars['String']['input']>;
  readonly stateRoot_gt?: InputMaybe<Scalars['String']['input']>;
  readonly stateRoot_gte?: InputMaybe<Scalars['String']['input']>;
  readonly stateRoot_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly stateRoot_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly stateRoot_lt?: InputMaybe<Scalars['String']['input']>;
  readonly stateRoot_lte?: InputMaybe<Scalars['String']['input']>;
  readonly stateRoot_not_contains?: InputMaybe<Scalars['String']['input']>;
  readonly stateRoot_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly stateRoot_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly stateRoot_not_eq?: InputMaybe<Scalars['String']['input']>;
  readonly stateRoot_not_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly stateRoot_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly stateRoot_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly timestamp_eq?: InputMaybe<Scalars['DateTime']['input']>;
  readonly timestamp_gt?: InputMaybe<Scalars['DateTime']['input']>;
  readonly timestamp_gte?: InputMaybe<Scalars['DateTime']['input']>;
  readonly timestamp_in?: InputMaybe<ReadonlyArray<Scalars['DateTime']['input']>>;
  readonly timestamp_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly timestamp_lt?: InputMaybe<Scalars['DateTime']['input']>;
  readonly timestamp_lte?: InputMaybe<Scalars['DateTime']['input']>;
  readonly timestamp_not_eq?: InputMaybe<Scalars['DateTime']['input']>;
  readonly timestamp_not_in?: InputMaybe<ReadonlyArray<Scalars['DateTime']['input']>>;
  readonly validator_contains?: InputMaybe<Scalars['String']['input']>;
  readonly validator_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly validator_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly validator_eq?: InputMaybe<Scalars['String']['input']>;
  readonly validator_gt?: InputMaybe<Scalars['String']['input']>;
  readonly validator_gte?: InputMaybe<Scalars['String']['input']>;
  readonly validator_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly validator_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly validator_lt?: InputMaybe<Scalars['String']['input']>;
  readonly validator_lte?: InputMaybe<Scalars['String']['input']>;
  readonly validator_not_contains?: InputMaybe<Scalars['String']['input']>;
  readonly validator_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly validator_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly validator_not_eq?: InputMaybe<Scalars['String']['input']>;
  readonly validator_not_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly validator_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly validator_startsWith?: InputMaybe<Scalars['String']['input']>;
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
  readonly AND?: InputMaybe<ReadonlyArray<CallWhereInput>>;
  readonly OR?: InputMaybe<ReadonlyArray<CallWhereInput>>;
  readonly args_eq?: InputMaybe<Scalars['JSON']['input']>;
  readonly args_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly args_jsonContains?: InputMaybe<Scalars['JSON']['input']>;
  readonly args_jsonHasKey?: InputMaybe<Scalars['JSON']['input']>;
  readonly args_not_eq?: InputMaybe<Scalars['JSON']['input']>;
  readonly block?: InputMaybe<BlockWhereInput>;
  readonly block_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly error_eq?: InputMaybe<Scalars['JSON']['input']>;
  readonly error_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly error_jsonContains?: InputMaybe<Scalars['JSON']['input']>;
  readonly error_jsonHasKey?: InputMaybe<Scalars['JSON']['input']>;
  readonly error_not_eq?: InputMaybe<Scalars['JSON']['input']>;
  readonly extrinsic?: InputMaybe<ExtrinsicWhereInput>;
  readonly extrinsic_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly id_contains?: InputMaybe<Scalars['String']['input']>;
  readonly id_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly id_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly id_eq?: InputMaybe<Scalars['String']['input']>;
  readonly id_gt?: InputMaybe<Scalars['String']['input']>;
  readonly id_gte?: InputMaybe<Scalars['String']['input']>;
  readonly id_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly id_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly id_lt?: InputMaybe<Scalars['String']['input']>;
  readonly id_lte?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_contains?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_eq?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly id_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly id_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly name_contains?: InputMaybe<Scalars['String']['input']>;
  readonly name_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly name_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly name_eq?: InputMaybe<Scalars['String']['input']>;
  readonly name_gt?: InputMaybe<Scalars['String']['input']>;
  readonly name_gte?: InputMaybe<Scalars['String']['input']>;
  readonly name_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly name_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly name_lt?: InputMaybe<Scalars['String']['input']>;
  readonly name_lte?: InputMaybe<Scalars['String']['input']>;
  readonly name_not_contains?: InputMaybe<Scalars['String']['input']>;
  readonly name_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly name_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly name_not_eq?: InputMaybe<Scalars['String']['input']>;
  readonly name_not_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly name_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly name_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly origin_eq?: InputMaybe<Scalars['JSON']['input']>;
  readonly origin_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly origin_jsonContains?: InputMaybe<Scalars['JSON']['input']>;
  readonly origin_jsonHasKey?: InputMaybe<Scalars['JSON']['input']>;
  readonly origin_not_eq?: InputMaybe<Scalars['JSON']['input']>;
  readonly parent?: InputMaybe<CallWhereInput>;
  readonly parent_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly pos_eq?: InputMaybe<Scalars['Int']['input']>;
  readonly pos_gt?: InputMaybe<Scalars['Int']['input']>;
  readonly pos_gte?: InputMaybe<Scalars['Int']['input']>;
  readonly pos_in?: InputMaybe<ReadonlyArray<Scalars['Int']['input']>>;
  readonly pos_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly pos_lt?: InputMaybe<Scalars['Int']['input']>;
  readonly pos_lte?: InputMaybe<Scalars['Int']['input']>;
  readonly pos_not_eq?: InputMaybe<Scalars['Int']['input']>;
  readonly pos_not_in?: InputMaybe<ReadonlyArray<Scalars['Int']['input']>>;
  readonly success_eq?: InputMaybe<Scalars['Boolean']['input']>;
  readonly success_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly success_not_eq?: InputMaybe<Scalars['Boolean']['input']>;
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
  readonly AND?: InputMaybe<ReadonlyArray<EventWhereInput>>;
  readonly OR?: InputMaybe<ReadonlyArray<EventWhereInput>>;
  readonly args_eq?: InputMaybe<Scalars['JSON']['input']>;
  readonly args_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly args_jsonContains?: InputMaybe<Scalars['JSON']['input']>;
  readonly args_jsonHasKey?: InputMaybe<Scalars['JSON']['input']>;
  readonly args_not_eq?: InputMaybe<Scalars['JSON']['input']>;
  readonly block?: InputMaybe<BlockWhereInput>;
  readonly block_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly call?: InputMaybe<CallWhereInput>;
  readonly call_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly extrinsic?: InputMaybe<ExtrinsicWhereInput>;
  readonly extrinsic_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly id_contains?: InputMaybe<Scalars['String']['input']>;
  readonly id_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly id_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly id_eq?: InputMaybe<Scalars['String']['input']>;
  readonly id_gt?: InputMaybe<Scalars['String']['input']>;
  readonly id_gte?: InputMaybe<Scalars['String']['input']>;
  readonly id_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly id_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly id_lt?: InputMaybe<Scalars['String']['input']>;
  readonly id_lte?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_contains?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_eq?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly id_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly id_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly indexInBlock_eq?: InputMaybe<Scalars['Int']['input']>;
  readonly indexInBlock_gt?: InputMaybe<Scalars['Int']['input']>;
  readonly indexInBlock_gte?: InputMaybe<Scalars['Int']['input']>;
  readonly indexInBlock_in?: InputMaybe<ReadonlyArray<Scalars['Int']['input']>>;
  readonly indexInBlock_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly indexInBlock_lt?: InputMaybe<Scalars['Int']['input']>;
  readonly indexInBlock_lte?: InputMaybe<Scalars['Int']['input']>;
  readonly indexInBlock_not_eq?: InputMaybe<Scalars['Int']['input']>;
  readonly indexInBlock_not_in?: InputMaybe<ReadonlyArray<Scalars['Int']['input']>>;
  readonly name_contains?: InputMaybe<Scalars['String']['input']>;
  readonly name_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly name_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly name_eq?: InputMaybe<Scalars['String']['input']>;
  readonly name_gt?: InputMaybe<Scalars['String']['input']>;
  readonly name_gte?: InputMaybe<Scalars['String']['input']>;
  readonly name_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly name_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly name_lt?: InputMaybe<Scalars['String']['input']>;
  readonly name_lte?: InputMaybe<Scalars['String']['input']>;
  readonly name_not_contains?: InputMaybe<Scalars['String']['input']>;
  readonly name_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly name_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly name_not_eq?: InputMaybe<Scalars['String']['input']>;
  readonly name_not_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly name_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly name_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly phase_contains?: InputMaybe<Scalars['String']['input']>;
  readonly phase_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly phase_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly phase_eq?: InputMaybe<Scalars['String']['input']>;
  readonly phase_gt?: InputMaybe<Scalars['String']['input']>;
  readonly phase_gte?: InputMaybe<Scalars['String']['input']>;
  readonly phase_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly phase_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly phase_lt?: InputMaybe<Scalars['String']['input']>;
  readonly phase_lte?: InputMaybe<Scalars['String']['input']>;
  readonly phase_not_contains?: InputMaybe<Scalars['String']['input']>;
  readonly phase_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly phase_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly phase_not_eq?: InputMaybe<Scalars['String']['input']>;
  readonly phase_not_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly phase_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly phase_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly pos_eq?: InputMaybe<Scalars['Int']['input']>;
  readonly pos_gt?: InputMaybe<Scalars['Int']['input']>;
  readonly pos_gte?: InputMaybe<Scalars['Int']['input']>;
  readonly pos_in?: InputMaybe<ReadonlyArray<Scalars['Int']['input']>>;
  readonly pos_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly pos_lt?: InputMaybe<Scalars['Int']['input']>;
  readonly pos_lte?: InputMaybe<Scalars['Int']['input']>;
  readonly pos_not_eq?: InputMaybe<Scalars['Int']['input']>;
  readonly pos_not_in?: InputMaybe<ReadonlyArray<Scalars['Int']['input']>>;
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
  readonly AND?: InputMaybe<ReadonlyArray<ExtrinsicWhereInput>>;
  readonly OR?: InputMaybe<ReadonlyArray<ExtrinsicWhereInput>>;
  readonly block?: InputMaybe<BlockWhereInput>;
  readonly block_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly call?: InputMaybe<CallWhereInput>;
  readonly call_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly calls_every?: InputMaybe<CallWhereInput>;
  readonly calls_none?: InputMaybe<CallWhereInput>;
  readonly calls_some?: InputMaybe<CallWhereInput>;
  readonly error_eq?: InputMaybe<Scalars['JSON']['input']>;
  readonly error_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly error_jsonContains?: InputMaybe<Scalars['JSON']['input']>;
  readonly error_jsonHasKey?: InputMaybe<Scalars['JSON']['input']>;
  readonly error_not_eq?: InputMaybe<Scalars['JSON']['input']>;
  readonly fee_eq?: InputMaybe<Scalars['BigInt']['input']>;
  readonly fee_gt?: InputMaybe<Scalars['BigInt']['input']>;
  readonly fee_gte?: InputMaybe<Scalars['BigInt']['input']>;
  readonly fee_in?: InputMaybe<ReadonlyArray<Scalars['BigInt']['input']>>;
  readonly fee_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly fee_lt?: InputMaybe<Scalars['BigInt']['input']>;
  readonly fee_lte?: InputMaybe<Scalars['BigInt']['input']>;
  readonly fee_not_eq?: InputMaybe<Scalars['BigInt']['input']>;
  readonly fee_not_in?: InputMaybe<ReadonlyArray<Scalars['BigInt']['input']>>;
  readonly hash_contains?: InputMaybe<Scalars['String']['input']>;
  readonly hash_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly hash_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly hash_eq?: InputMaybe<Scalars['String']['input']>;
  readonly hash_gt?: InputMaybe<Scalars['String']['input']>;
  readonly hash_gte?: InputMaybe<Scalars['String']['input']>;
  readonly hash_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly hash_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly hash_lt?: InputMaybe<Scalars['String']['input']>;
  readonly hash_lte?: InputMaybe<Scalars['String']['input']>;
  readonly hash_not_contains?: InputMaybe<Scalars['String']['input']>;
  readonly hash_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly hash_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly hash_not_eq?: InputMaybe<Scalars['String']['input']>;
  readonly hash_not_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly hash_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly hash_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly id_contains?: InputMaybe<Scalars['String']['input']>;
  readonly id_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly id_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly id_eq?: InputMaybe<Scalars['String']['input']>;
  readonly id_gt?: InputMaybe<Scalars['String']['input']>;
  readonly id_gte?: InputMaybe<Scalars['String']['input']>;
  readonly id_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly id_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly id_lt?: InputMaybe<Scalars['String']['input']>;
  readonly id_lte?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_contains?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_eq?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly id_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly id_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly indexInBlock_eq?: InputMaybe<Scalars['Int']['input']>;
  readonly indexInBlock_gt?: InputMaybe<Scalars['Int']['input']>;
  readonly indexInBlock_gte?: InputMaybe<Scalars['Int']['input']>;
  readonly indexInBlock_in?: InputMaybe<ReadonlyArray<Scalars['Int']['input']>>;
  readonly indexInBlock_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly indexInBlock_lt?: InputMaybe<Scalars['Int']['input']>;
  readonly indexInBlock_lte?: InputMaybe<Scalars['Int']['input']>;
  readonly indexInBlock_not_eq?: InputMaybe<Scalars['Int']['input']>;
  readonly indexInBlock_not_in?: InputMaybe<ReadonlyArray<Scalars['Int']['input']>>;
  readonly pos_eq?: InputMaybe<Scalars['Int']['input']>;
  readonly pos_gt?: InputMaybe<Scalars['Int']['input']>;
  readonly pos_gte?: InputMaybe<Scalars['Int']['input']>;
  readonly pos_in?: InputMaybe<ReadonlyArray<Scalars['Int']['input']>>;
  readonly pos_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly pos_lt?: InputMaybe<Scalars['Int']['input']>;
  readonly pos_lte?: InputMaybe<Scalars['Int']['input']>;
  readonly pos_not_eq?: InputMaybe<Scalars['Int']['input']>;
  readonly pos_not_in?: InputMaybe<ReadonlyArray<Scalars['Int']['input']>>;
  readonly signature_eq?: InputMaybe<Scalars['JSON']['input']>;
  readonly signature_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly signature_jsonContains?: InputMaybe<Scalars['JSON']['input']>;
  readonly signature_jsonHasKey?: InputMaybe<Scalars['JSON']['input']>;
  readonly signature_not_eq?: InputMaybe<Scalars['JSON']['input']>;
  readonly success_eq?: InputMaybe<Scalars['Boolean']['input']>;
  readonly success_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly success_not_eq?: InputMaybe<Scalars['Boolean']['input']>;
  readonly tip_eq?: InputMaybe<Scalars['BigInt']['input']>;
  readonly tip_gt?: InputMaybe<Scalars['BigInt']['input']>;
  readonly tip_gte?: InputMaybe<Scalars['BigInt']['input']>;
  readonly tip_in?: InputMaybe<ReadonlyArray<Scalars['BigInt']['input']>>;
  readonly tip_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly tip_lt?: InputMaybe<Scalars['BigInt']['input']>;
  readonly tip_lte?: InputMaybe<Scalars['BigInt']['input']>;
  readonly tip_not_eq?: InputMaybe<Scalars['BigInt']['input']>;
  readonly tip_not_in?: InputMaybe<ReadonlyArray<Scalars['BigInt']['input']>>;
  readonly version_eq?: InputMaybe<Scalars['Int']['input']>;
  readonly version_gt?: InputMaybe<Scalars['Int']['input']>;
  readonly version_gte?: InputMaybe<Scalars['Int']['input']>;
  readonly version_in?: InputMaybe<ReadonlyArray<Scalars['Int']['input']>>;
  readonly version_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly version_lt?: InputMaybe<Scalars['Int']['input']>;
  readonly version_lte?: InputMaybe<Scalars['Int']['input']>;
  readonly version_not_eq?: InputMaybe<Scalars['Int']['input']>;
  readonly version_not_in?: InputMaybe<ReadonlyArray<Scalars['Int']['input']>>;
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
  readonly AND?: InputMaybe<ReadonlyArray<MetadataWhereInput>>;
  readonly OR?: InputMaybe<ReadonlyArray<MetadataWhereInput>>;
  readonly blockHash_contains?: InputMaybe<Scalars['String']['input']>;
  readonly blockHash_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly blockHash_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly blockHash_eq?: InputMaybe<Scalars['String']['input']>;
  readonly blockHash_gt?: InputMaybe<Scalars['String']['input']>;
  readonly blockHash_gte?: InputMaybe<Scalars['String']['input']>;
  readonly blockHash_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly blockHash_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly blockHash_lt?: InputMaybe<Scalars['String']['input']>;
  readonly blockHash_lte?: InputMaybe<Scalars['String']['input']>;
  readonly blockHash_not_contains?: InputMaybe<Scalars['String']['input']>;
  readonly blockHash_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly blockHash_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly blockHash_not_eq?: InputMaybe<Scalars['String']['input']>;
  readonly blockHash_not_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly blockHash_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly blockHash_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly blockHeight_eq?: InputMaybe<Scalars['Int']['input']>;
  readonly blockHeight_gt?: InputMaybe<Scalars['Int']['input']>;
  readonly blockHeight_gte?: InputMaybe<Scalars['Int']['input']>;
  readonly blockHeight_in?: InputMaybe<ReadonlyArray<Scalars['Int']['input']>>;
  readonly blockHeight_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly blockHeight_lt?: InputMaybe<Scalars['Int']['input']>;
  readonly blockHeight_lte?: InputMaybe<Scalars['Int']['input']>;
  readonly blockHeight_not_eq?: InputMaybe<Scalars['Int']['input']>;
  readonly blockHeight_not_in?: InputMaybe<ReadonlyArray<Scalars['Int']['input']>>;
  readonly hex_contains?: InputMaybe<Scalars['String']['input']>;
  readonly hex_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly hex_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly hex_eq?: InputMaybe<Scalars['String']['input']>;
  readonly hex_gt?: InputMaybe<Scalars['String']['input']>;
  readonly hex_gte?: InputMaybe<Scalars['String']['input']>;
  readonly hex_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly hex_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly hex_lt?: InputMaybe<Scalars['String']['input']>;
  readonly hex_lte?: InputMaybe<Scalars['String']['input']>;
  readonly hex_not_contains?: InputMaybe<Scalars['String']['input']>;
  readonly hex_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly hex_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly hex_not_eq?: InputMaybe<Scalars['String']['input']>;
  readonly hex_not_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly hex_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly hex_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly id_contains?: InputMaybe<Scalars['String']['input']>;
  readonly id_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly id_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly id_eq?: InputMaybe<Scalars['String']['input']>;
  readonly id_gt?: InputMaybe<Scalars['String']['input']>;
  readonly id_gte?: InputMaybe<Scalars['String']['input']>;
  readonly id_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly id_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly id_lt?: InputMaybe<Scalars['String']['input']>;
  readonly id_lte?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_contains?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_eq?: InputMaybe<Scalars['String']['input']>;
  readonly id_not_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly id_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly id_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly specName_contains?: InputMaybe<Scalars['String']['input']>;
  readonly specName_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly specName_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly specName_eq?: InputMaybe<Scalars['String']['input']>;
  readonly specName_gt?: InputMaybe<Scalars['String']['input']>;
  readonly specName_gte?: InputMaybe<Scalars['String']['input']>;
  readonly specName_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly specName_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly specName_lt?: InputMaybe<Scalars['String']['input']>;
  readonly specName_lte?: InputMaybe<Scalars['String']['input']>;
  readonly specName_not_contains?: InputMaybe<Scalars['String']['input']>;
  readonly specName_not_containsInsensitive?: InputMaybe<Scalars['String']['input']>;
  readonly specName_not_endsWith?: InputMaybe<Scalars['String']['input']>;
  readonly specName_not_eq?: InputMaybe<Scalars['String']['input']>;
  readonly specName_not_in?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly specName_not_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly specName_startsWith?: InputMaybe<Scalars['String']['input']>;
  readonly specVersion_eq?: InputMaybe<Scalars['Int']['input']>;
  readonly specVersion_gt?: InputMaybe<Scalars['Int']['input']>;
  readonly specVersion_gte?: InputMaybe<Scalars['Int']['input']>;
  readonly specVersion_in?: InputMaybe<ReadonlyArray<Scalars['Int']['input']>>;
  readonly specVersion_isNull?: InputMaybe<Scalars['Boolean']['input']>;
  readonly specVersion_lt?: InputMaybe<Scalars['Int']['input']>;
  readonly specVersion_lte?: InputMaybe<Scalars['Int']['input']>;
  readonly specVersion_not_eq?: InputMaybe<Scalars['Int']['input']>;
  readonly specVersion_not_in?: InputMaybe<ReadonlyArray<Scalars['Int']['input']>>;
};

export type WhereIdInput = {
  readonly id: Scalars['String']['input'];
};

export type OrdersStateQueryVariables = Exact<{
  orderId: Scalars['Int']['input'];
}>;


export type OrdersStateQuery = { readonly __typename?: 'Query', readonly events: ReadonlyArray<{ readonly __typename?: 'Event', readonly args: any | null }> };


export const OrdersStateDocument = gql`
    query OrdersState($orderId: Int!) {
  events(
    where: {args_jsonContains: {orderId: $orderId}, AND: {name_eq: "OTC.Placed"}}
  ) {
    args
  }
}
    `;

/**
 * __useOrdersStateQuery__
 *
 * To run a query within a React component, call `useOrdersStateQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrdersStateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrdersStateQuery({
 *   variables: {
 *      orderId: // value for 'orderId'
 *   },
 * });
 */
export function useOrdersStateQuery(baseOptions: Apollo.QueryHookOptions<OrdersStateQuery, OrdersStateQueryVariables> & ({ variables: OrdersStateQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OrdersStateQuery, OrdersStateQueryVariables>(OrdersStateDocument, options);
      }
export function useOrdersStateLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OrdersStateQuery, OrdersStateQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OrdersStateQuery, OrdersStateQueryVariables>(OrdersStateDocument, options);
        }
export function useOrdersStateSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OrdersStateQuery, OrdersStateQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OrdersStateQuery, OrdersStateQueryVariables>(OrdersStateDocument, options);
        }
export type OrdersStateQueryHookResult = ReturnType<typeof useOrdersStateQuery>;
export type OrdersStateLazyQueryHookResult = ReturnType<typeof useOrdersStateLazyQuery>;
export type OrdersStateSuspenseQueryHookResult = ReturnType<typeof useOrdersStateSuspenseQuery>;
export type OrdersStateQueryResult = Apollo.QueryResult<OrdersStateQuery, OrdersStateQueryVariables>;