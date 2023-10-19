import WaterRippleIcon from "assets/icons/WaterRippleIcon.svg?react"
import DropletIcon from "assets/icons/DropletIcon.svg?react"
import { TransferOption } from "./TransferOption"
import { ListItem } from "./ListItem"
import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"

export type Option = "OMNIPOOL" | "STABLEPOOL"

type Props = {
  selected: Option
  onSelect: (selected: Option) => void
  disableOmnipool?: boolean
}

export const TransferOptions = ({
  selected,
  onSelect,
  disableOmnipool,
}: Props) => {
  const { t } = useTranslation()
  return (
    <>
      <TransferOption
        selected={selected === "OMNIPOOL"}
        onSelect={() => onSelect("OMNIPOOL")}
        heading={t("liquidity.stablepool.add.stablepoolAndOmnipool")}
        subheading={t("liquidity.stablepool.add.benefits")}
        icon={<WaterRippleIcon />}
        disabled={disableOmnipool}
      >
        <ListItem>
          {t("liquidity.stablepool.add.stablepoolAndOmnipool.benefit1")}
        </ListItem>
        <ListItem>
          {t("liquidity.stablepool.add.stablepoolAndOmnipool.benefit2")}
        </ListItem>
        <ListItem>
          {t("liquidity.stablepool.add.stablepoolAndOmnipool.benefit3")}
        </ListItem>
        <ListItem>
          {t("liquidity.stablepool.add.stablepoolAndOmnipool.benefit4")}
        </ListItem>
        {disableOmnipool && (
          <Text color="alarmRed400" sx={{ ml: 30, mt: 20 }}>
            {t("liquidity.stablepool.add.stablepoolAndOmnipool.unavailable")}
          </Text>
        )}
      </TransferOption>
      <TransferOption
        selected={selected === "STABLEPOOL"}
        onSelect={() => onSelect("STABLEPOOL")}
        heading={t("liquidity.stablepool.add.stablepoolOnly")}
        subheading={t("liquidity.stablepool.add.benefits")}
        icon={<DropletIcon />}
      >
        <ListItem>
          {t("liquidity.stablepool.add.stablepoolOnly.benefit1")}
        </ListItem>
        <ListItem>
          {t("liquidity.stablepool.add.stablepoolOnly.benefit2")}
        </ListItem>
        <ListItem>
          {t("liquidity.stablepool.add.stablepoolOnly.benefit3")}
        </ListItem>
      </TransferOption>
    </>
  )
}
