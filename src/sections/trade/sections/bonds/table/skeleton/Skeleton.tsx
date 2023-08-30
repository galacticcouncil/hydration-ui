import { TableSkeleton } from "components/Table/TableSkeleton"
import { useMyActiveBondsSkeleton } from "./Skeleton.utils"

type Props = {
  title: string
  showTransactions?: boolean
}

export const Skeleton = ({ title, showTransactions }: Props) => {
  const table = useMyActiveBondsSkeleton({ showTransactions })

  return <TableSkeleton table={table} title={title} />
}
