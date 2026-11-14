import {
  cashOutKey,
  useBankCashOutStore,
} from "@/modules/onramp/bank/store/useBankCashOutStore"
import {
  getLocalSendView,
  LocalSendView,
} from "@/modules/onramp/bank/utils/cashOut"
import { useStrictEvmLedger } from "@/modules/transactions/utils/strictEvm"

/** What this tab did with the cash-out's transactions, from the strict ledger alone. */
export const useCashOutLocalSend = (
  h160: string,
  rampId: string,
): { view: LocalSendView; redeemHash: string | null } => {
  const record = useBankCashOutStore(
    (state) => state.records[cashOutKey(h160, rampId)],
  )
  const approve = useStrictEvmLedger((ledger) =>
    record?.approveDigest ? ledger.entries[record.approveDigest] : undefined,
  )
  const redeem = useStrictEvmLedger((ledger) =>
    record ? ledger.entries[record.redeemDigest] : undefined,
  )
  return {
    view: getLocalSendView(approve, redeem, !!record),
    redeemHash: record?.redeemHash ?? null,
  }
}
