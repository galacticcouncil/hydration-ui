import { BondsTable } from "./table/BondsTable"
import { Skeleton } from "./table/skeleton/Skeleton"
import { useQuery } from "@tanstack/react-query"
import { Bond } from "./table/BondsTable.utils"

export const MyActiveBonds = () => {
  // TODO: replace mocked values with fetched data
  const { data, isLoading } = useQuery(["dummy"], () => {
    return new Promise<Bond[]>((resolve) =>
      setTimeout(() => {
        resolve([
          {
            id: "1",
            bond: "bond",
            maturity: "June  2024",
            balance: "300 845 HDX",
          },
          {
            id: "2",
            bond: "bond2",
            maturity: "June  2024",
            balance: "300 845 HDX",
          },
        ])
      }, 2000),
    )
  })

  const props = {
    title: "My Active Bonds",
    showTransactions: false,
  }

  if (isLoading) {
    return <Skeleton {...props} />
  }

  return <BondsTable {...props} data={data ?? []} />
}
