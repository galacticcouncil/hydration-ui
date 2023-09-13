import { TableSkeleton } from "components/Table/TableSkeleton"
import { useBondsSkeleton } from "./Skeleton.utils"

type Props = {
  title: string
  showTransactions?: boolean
  showTransfer?: boolean
}

export const Skeleton = ({ title, showTransactions, showTransfer }: Props) => {
  const table = useBondsSkeleton({
    showTransactions,
    showTransfer,
    onTransfer: () => null,
  })

  return <TableSkeleton table={table} title={title} />
}
