import { FC, useEffect, useState } from "react"
import { theme } from "theme"
import { useTranslation } from "react-i18next"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import PlusIcon from "assets/icons/PlusIcon.svg?react"
import WalletIcon from "assets/icons/WalletIcon.svg?react"
import { Icon } from "components/Icon/Icon"
import { Heading } from "components/Typography/Heading/Heading"
import { PlaceOrder } from "sections/trade/sections/otc/modals/PlaceOrder"
import { SButton, SHeader, SSearchContainer } from "./OtcHeader.styled"
import { useMedia } from "react-use"
import { Input } from "components/Input/Input"
import IconSearch from "assets/icons/IconSearch.svg?react"
import { useDebounce } from "react-use"

type Props = {
  showMyOrders: boolean
  showPartial: boolean
  searchVal: string
  onShowMyOrdersChange: (value: boolean) => void
  onShowPartialChange: (value: boolean) => void
  onSearchChange: (value: string) => void
  skeleton?: boolean
}

enum OrderType {
  All = "all",
  Partial = "partial",
  Mine = "mine",
}

export const OtcHeader: FC<Props> = ({
  showMyOrders,
  showPartial,
  searchVal,
  onShowMyOrdersChange,
  onShowPartialChange,
  onSearchChange,
  skeleton,
}) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const [openAdd, setOpenAdd] = useState(false)
  const { account } = useAccount()
  const [inputValue, setInputValue] = useState(searchVal)

  const onOptionChange = (value: OrderType) => {
    if (value === OrderType.Mine) {
      if (!isDesktop) {
        console.log("here")
        onShowMyOrdersChange(!showMyOrders)
      } else {
        onShowMyOrdersChange(true)
      }
    } else {
      onShowMyOrdersChange(false)
      onShowPartialChange(value === OrderType.All ? false : true)
    }
  }

  useEffect(() => {
    setInputValue(searchVal)
  }, [searchVal])

  useDebounce(
    () => {
      if (typeof onSearchChange === "function") {
        onSearchChange(inputValue)
      }
    },
    300,
    [inputValue],
  )

  const handleSearchChange = (value: string) => {
    setInputValue(value)
  }

  return (
    <>
      {!isDesktop && (
        <SHeader>
          <Heading fs={20} lh={26} fw={500}>
            {t("otc.header.titleAlt")}
          </Heading>
        </SHeader>
      )}
      <SSearchContainer sx={{ mb: [0, 30], mt: [16, 0] }}>
        <IconSearch />
        <Input
          value={inputValue}
          onChange={handleSearchChange}
          name="search"
          label="Input"
          placeholder={t("otc.header.search")}
        />
      </SSearchContainer>
      <div
        sx={{
          flex: "row",
          align: "center",
          mt: [20, 0],
          mb: 20,
          gap: 8,
        }}
      >
        {!!account && (
          <SButton
            size="small"
            variant="outline"
            disabled={!!skeleton}
            active={showMyOrders}
            onClick={(e) => {
              onOptionChange(OrderType.Mine)
            }}
          >
            <Icon icon={<WalletIcon />} size={14} />
            {t("otc.header.myOrders")}
          </SButton>
        )}

        {isDesktop && (
          <>
            <SButton
              size="small"
              variant="outline"
              disabled={!!skeleton}
              active={!showPartial && !showMyOrders}
              onClick={() => onOptionChange(OrderType.All)}
            >
              {t("otc.header.all")}
            </SButton>
            <SButton
              size="small"
              variant="outline"
              disabled={!!skeleton}
              active={showPartial && !showMyOrders}
              onClick={() => onOptionChange(OrderType.Partial)}
            >
              {t("otc.header.partiallyFillable")}
            </SButton>
          </>
        )}

        <SButton
          size="small"
          variant="primary"
          onClick={() => setOpenAdd(true)}
          disabled={!account || skeleton}
          css={{ marginLeft: "auto" }}
        >
          <Icon icon={<PlusIcon />} size={14} />
          {t("otc.header.placeOrder")}
        </SButton>
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
