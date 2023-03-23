import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAccountStore } from "state/store"
import { ReactComponent as PlusIcon } from "assets/icons/PlusIcon.svg"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { Switch } from "components/Switch/Switch"
import { Heading } from "components/Typography/Heading/Heading"
import { Text } from "components/Typography/Text/Text"
import { OtcHeaderTotal } from "sections/otc/header/OtcHeaderTotal"
import { PlaceOrder } from "../modals/PlaceOrder"

type Props = {
  showMyOrders: boolean
  onShowMyOrdersChange: (value: boolean) => void
}

export const OtcHeader: FC<Props> = ({
  showMyOrders,
  onShowMyOrdersChange,
}) => {
  const { t } = useTranslation()
  const [openAdd, setOpenAdd] = useState(false)
  const { account } = useAccountStore()

  return (
    <>
      <div sx={{ flex: "row", justify: "space-between", mb: 43 }}>
        <Heading fs={20} lh={26} fw={500}>
          {t("otc.header.title")}
        </Heading>
        {!!account && (
          <Switch
            value={showMyOrders}
            onCheckedChange={onShowMyOrdersChange}
            size="small"
            name="my-offers"
            label={t("otc.header.switch")}
          />
        )}
      </div>
      <div
        sx={{ flex: ["column", "row"], mb: 40 }}
        css={{ "> *:not([role='separator'])": { flex: 1 } }}
      >
        <div sx={{ flex: ["row", "column"], justify: "space-between" }}>
          <Text color="brightBlue300" sx={{ mb: 14 }}>
            {t("otc.header.totalValue")}
          </Text>
          <div sx={{ flex: "row", align: "center", justify: "space-between" }}>
            <OtcHeaderTotal myOffers={showMyOrders} />
            <Button
              size="medium"
              variant="primary"
              sx={{ mt: "-20px" }}
              onClick={() => setOpenAdd(true)}
            >
              <div sx={{ flex: "row", align: "center" }}>
                <Icon icon={<PlusIcon />} sx={{ mr: 8, height: 16 }} />
                {t("otc.header.placeOrder")}
              </div>
            </Button>
          </div>
        </div>
      </div>

      {openAdd && (
        <PlaceOrder
          assetOut={"2"}
          assetIn={"0"}
          isOpen={openAdd}
          onClose={() => setOpenAdd(false)}
          onSuccess={() => {}}
        />
      )}
    </>
  )
}
