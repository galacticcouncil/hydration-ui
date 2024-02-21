import { FC, useState } from "react"
import { theme } from "theme"
import { useTranslation } from "react-i18next"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import PlusIcon from "assets/icons/PlusIcon.svg?react"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { Switch } from "components/Switch/Switch"
import { Heading } from "components/Typography/Heading/Heading"
import { PlaceOrder } from "sections/trade/sections/otc/modals/PlaceOrder"
import { Separator } from "components/Separator/Separator"
import { SHeader, STabs } from "./OtcHeader.styled"
import { Tab } from "./OtcHeaderTab"
import { useMedia } from "react-use"

type Props = {
  showMyOrders: boolean
  showPartial: boolean
  onShowMyOrdersChange: (value: boolean) => void
  onShowPartialChange: (value: boolean) => void
  skeleton?: boolean
}

export const OtcHeader: FC<Props> = ({
  showMyOrders,
  showPartial,
  onShowMyOrdersChange,
  onShowPartialChange,
  skeleton,
}) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const [openAdd, setOpenAdd] = useState(false)
  const { account } = useAccount()

  const onOptionChange = (e: { target: { value: string } }) => {
    onShowPartialChange(e.target.value === "all" ? false : true)
  }

  return (
    <>
      <SHeader sx={{ flex: "row", justify: "space-between" }}>
        <Heading fs={20} lh={26} fw={500}>
          {isDesktop ? t("otc.header.title") : t("otc.header.titleAlt")}
        </Heading>
        {!!account && (
          <Switch
            value={showMyOrders}
            onCheckedChange={onShowMyOrdersChange}
            name="my-offers"
            label={t("otc.header.switch")}
            disabled={!!skeleton}
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
        <STabs disabled={!!skeleton}>
          <Tab
            value={"all"}
            active={!showPartial}
            label={"All"}
            onChange={onOptionChange}
            disabled={!!skeleton}
          />
          <Tab
            value={"partial"}
            active={showPartial}
            label={"Partially fillable"}
            onChange={onOptionChange}
            disabled={!!skeleton}
          />
        </STabs>
        <Button
          size="medium"
          variant="primary"
          onClick={() => setOpenAdd(true)}
          disabled={!account || skeleton}
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
