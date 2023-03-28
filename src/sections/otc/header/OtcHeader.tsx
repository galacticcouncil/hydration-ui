import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAccountStore } from "state/store"
import { ReactComponent as PlusIcon } from "assets/icons/PlusIcon.svg"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { Switch } from "components/Switch/Switch"
import { Heading } from "components/Typography/Heading/Heading"
import { PlaceOrder } from "../modals/PlaceOrder"
import { Separator } from "components/Separator/Separator"
import { SHeader, STabs } from "./OtcHeader.styled"
import { Tab } from "./OtcHeaderTab"

type Props = {
  showMyOrders: boolean
  visibility: string
  onShowMyOrdersChange: (value: boolean) => void
  onVisibilityChange: (value: string) => void
}

export const OtcHeader: FC<Props> = ({
  showMyOrders,
  visibility,
  onShowMyOrdersChange,
  onVisibilityChange,
}) => {
  const { t } = useTranslation()
  const [openAdd, setOpenAdd] = useState(false)
  const { account } = useAccountStore()

  const onOptionChange = (e: { target: { value: string } }) => {
    onVisibilityChange(e.target.value)
  }

  return (
    <>
      <SHeader sx={{ flex: "row", justify: "space-between" }}>
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
      </SHeader>
      <Separator
        color="white"
        opacity={0.12}
        sx={{ display: ["none", "inherit"] }}
      />
      <div
        sx={{
          flex: ["row-reverse", "row"],
          align: "baseline",
          justify: "space-between",
          mt: [20, 32],
          mb: 20,
        }}
      >
        <STabs>
          <Tab
            value={"all"}
            active={visibility}
            label={"All"}
            onChange={onOptionChange}
          />
          <Tab
            value={"partial"}
            active={visibility}
            label={"Partially fillable"}
            onChange={onOptionChange}
          />
          <Tab
            value={"full"}
            active={visibility}
            label={"Fillable"}
            onChange={onOptionChange}
          />
        </STabs>
        <Button
          size="medium"
          variant="primary"
          onClick={() => setOpenAdd(true)}
          disabled={!account}
        >
          <div sx={{ flex: "row", align: "center" }}>
            <Icon icon={<PlusIcon />} sx={{ mr: 8, height: 16 }} />
            {t("otc.header.placeOrder")}
          </div>
        </Button>
      </div>

      {openAdd && (
        <PlaceOrder
          isOpen={openAdd}
          onClose={() => setOpenAdd(false)}
          onSuccess={() => {}}
        />
      )}
    </>
  )
}
