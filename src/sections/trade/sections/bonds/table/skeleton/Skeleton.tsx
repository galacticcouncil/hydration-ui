import { TableSkeleton } from "components/Table/TableSkeleton"
import { useBondsSkeleton } from "./Skeleton.utils"

type Props = {
  title: string
  showTransactions?: boolean
}

export const Skeleton = ({ title, showTransactions }: Props) => {
  const table = useBondsSkeleton({ showTransactions })

  return <TableSkeleton table={table} title={title} />
}
