import { Page } from "components/Layout/Page/Page"
import { OtcHeader } from "sections/otc/header/OtcHeader"
import { OtcOrderTable } from "sections/otc/orders/OtcOrders"

import { useState } from "react"
import { useOrdersTableData } from "./orders/OtcOrdersData.utils"

export const OtcPage = () => {
  const [filter, setFilter] = useState({
    showMyOrders: false,
    visibility: "all",
  })
  const order = useOrdersTableData()

  return (
    <Page>
      <OtcHeader
        showMyOrders={filter.showMyOrders}
        visibility={filter.visibility}
        onShowMyOrdersChange={(value) =>
          setFilter((prev) => ({
            ...prev,
            showMyOrders: value,
          }))
        }
        onVisibilityChange={(value) =>
          setFilter((prev) => ({
            ...prev,
            visibility: value,
          }))
        }
      />
      <OtcOrderTable
        data={order.data}
        showMyOrders={filter.showMyOrders}
        visibility={filter.visibility}
      />
    </Page>
  )
}
