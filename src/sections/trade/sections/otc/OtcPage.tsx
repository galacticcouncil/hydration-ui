import { OtcHeader } from "sections/trade/sections/otc/header/OtcHeader"
import { OtcOrderTable } from "sections/trade/sections/otc/orders/OtcOrders"
import { useState } from "react"
import { useOrdersTableData } from "./orders/OtcOrdersData.utils"

export const OtcPage = () => {
  const [filter, setFilter] = useState({
    showMyOrders: false,
    showPartial: false,
  })
  const order = useOrdersTableData()

  return (
    <>
      <OtcHeader
        showMyOrders={filter.showMyOrders}
        showPartial={filter.showPartial}
        onShowMyOrdersChange={(value) =>
          setFilter((prev) => ({
            ...prev,
            showMyOrders: value,
          }))
        }
        onShowPartialChange={(value) =>
          setFilter((prev) => ({
            ...prev,
            showPartial: value,
          }))
        }
      />
      <OtcOrderTable
        data={order.data}
        showMyOrders={filter.showMyOrders}
        showPartial={filter.showPartial}
      />
    </>
  )
}
