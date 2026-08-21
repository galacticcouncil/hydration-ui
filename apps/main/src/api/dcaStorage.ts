import { Observable } from "rxjs"

// DCA storage is not part of the whitelisted descriptors, so it can only be
// read through the unsafe api - typed here to keep call sites type-safe.

type StorageOptions = { at?: string }

type WatchEntriesData = {
  deltas: unknown
  entries: Array<{ args: unknown; value: unknown }>
}

type DcaOrder =
  | {
      readonly type: "Sell"
      readonly value: {
        readonly asset_in: number
        readonly asset_out: number
        readonly amount_in: bigint
      }
    }
  | {
      readonly type: "Buy"
      readonly value: {
        readonly asset_in: number
        readonly asset_out: number
        readonly max_amount_in: bigint
      }
    }

export type DcaSchedule = {
  readonly period: number
  readonly total_amount: bigint
  readonly order: DcaOrder
}

export type UnsafeDcaQuery = {
  readonly DCA: {
    readonly ScheduleOwnership: {
      readonly getEntries: (
        address: string,
        options?: StorageOptions,
      ) => Promise<Array<{ keyArgs: [string, number]; value: undefined }>>
      readonly watchEntries: (
        address: string,
        options?: StorageOptions,
      ) => Observable<WatchEntriesData>
    }
    readonly Schedules: {
      readonly getValues: (
        keys: ReadonlyArray<readonly [number]>,
        options?: StorageOptions,
      ) => Promise<Array<DcaSchedule | undefined>>
    }
    readonly RemainingAmounts: {
      readonly getValues: (
        keys: ReadonlyArray<readonly [number]>,
        options?: StorageOptions,
      ) => Promise<Array<bigint | undefined>>
    }
  }
}
