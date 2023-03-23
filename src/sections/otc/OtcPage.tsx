import { Page } from "components/Layout/Page/Page"
import { OtcHeader } from "sections/otc/header/OtcHeader"
import { OtcOrderTable } from "sections/otc/orders/OtcOrders"

import { useState } from "react"
import { useOrdersTableData } from "./orders/OtcOrdersData.utils"

export const OtcPage = () => {
  const [filter, setFilter] = useState({ showMyOrders: false })
  const order = useOrdersTableData()

  return (
    <Page>
      <OtcHeader
        showMyOrders={filter.showMyOrders}
        onShowMyOrdersChange={(value) =>
          setFilter((prev) => ({
            ...prev,
            showMyOrders: value,
          }))
        }
      />
      <OtcOrderTable data={order.data} />
    </Page>
  )
}
