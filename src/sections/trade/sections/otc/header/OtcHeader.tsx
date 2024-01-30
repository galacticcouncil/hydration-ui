import { FC, useState } from "react";
import { theme } from "theme";
import { useTranslation } from "react-i18next";
import { useAccount } from "sections/web3-connect/Web3Connect.utils";
import PlusIcon from "assets/icons/PlusIcon.svg?react";
import WalletIcon from "assets/icons/WalletIcon.svg?react";
import { Icon } from "components/Icon/Icon";
import { Switch } from "components/Switch/Switch";
import { Heading } from "components/Typography/Heading/Heading";
import { PlaceOrder } from "sections/trade/sections/otc/modals/PlaceOrder";
import { Separator } from "components/Separator/Separator";
import { SButton, SHeader, STabs } from "./OtcHeader.styled";
import { Tab } from "./OtcHeaderTab";
import { useMedia } from "react-use";

type Props = {
  showMyOrders: boolean;
  showPartial: boolean;
  onShowMyOrdersChange: (value: boolean) => void;
  onShowPartialChange: (value: boolean) => void;
  skeleton?: boolean;
};

enum OrderType {
  All = "all",
  Partial = "partial"
}

export const OtcHeader: FC<Props> = ({
  showMyOrders,
  showPartial,
  onShowMyOrdersChange,
  onShowPartialChange,
  skeleton,
}) => {
  const { t } = useTranslation();
  const isDesktop = useMedia(theme.viewport.gte.sm);
  const [openAdd, setOpenAdd] = useState(false);
  const { account } = useAccount();

  const onOptionChange = (value: OrderType) => {
    onShowPartialChange(value === OrderType.All ? false : true);
  };

  return (
    <>
      {!isDesktop && (
        <SHeader>
          <Heading fs={20} lh={26} fw={500}>
            {t("otc.header.titleAlt")}
          </Heading>
        </SHeader>
      )}
      <div
        sx={{
          flex: ["row-reverse", "row"],
          align: "center",
          mt: [20, 0],
          mb: 20,
          gap: 8,
        }}
      >
        {!!account && (
          <>
            <SButton
              size="small"
              variant="outline"
              disabled={!!skeleton}
              active={showMyOrders}
              onClick={() => onShowMyOrdersChange(!showMyOrders)}
            >
              <Icon icon={<WalletIcon />} size={14} />
              {t("otc.header.myOrders")}
            </SButton>

            <Separator
              orientation="vertical"
              color="white"
              opacity={0.12}
              sx={{ display: ["none", "inherit"], height: 24, mx: 8 }}
            />
          </>
        )}

        <SButton
          size="small"
          variant="outline"
          disabled={!!skeleton}
          active={!showPartial}
          onClick={() => onOptionChange(OrderType.All)}
        >
          {t("otc.header.all")}
        </SButton>
        <SButton
          size="small"
          variant="outline"
          disabled={!!skeleton}
          active={showPartial}
          onClick={() => onOptionChange(OrderType.Partial)}
        >
          {t("otc.header.partiallyFillable")}
        </SButton>

        {/* <STabs disabled={!!skeleton}>
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
        </STabs> */}

        <SButton
          size="small"
          variant="primary"
          onClick={() => setOpenAdd(true)}
          disabled={!account || skeleton}
          css={isDesktop ? { marginLeft: "auto" } : { marginRight: "auto" }}
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
  );
};
