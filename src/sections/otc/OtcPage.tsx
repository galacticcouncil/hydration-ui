import { Page } from "components/Layout/Page/Page"
import { OtcHeader } from "sections/otc/header/OtcHeader"
import { OtcOffersTable } from "sections/otc/offers/OtcOffers"

import { useState } from "react"
import { useOrderTableData } from "./offers/OtcOffersData.utils"

export const OtcPage = () => {
  const [filter, setFilter] = useState({ showMyOffers: false })
  const order = useOrderTableData()

  return (
    <Page>
      <OtcHeader
        showMyOffers={filter.showMyOffers}
        onShowMyOffersChange={(value) =>
          setFilter((prev) => ({
            ...prev,
            showMyOffers: value,
          }))
        }
      />
      <OtcOffersTable data={order.data} />
    </Page>
  )
}
