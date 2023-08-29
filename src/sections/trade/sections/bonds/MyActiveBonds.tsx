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
            assetId: "1",
            maturity: 1693314639000,
            balance: "300 845 HDX",
            price: "1$",
          },
          {
            assetId: "2",
            maturity: 1693314639000,
            balance: "300 845 HDX",
            price: "1$",
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
