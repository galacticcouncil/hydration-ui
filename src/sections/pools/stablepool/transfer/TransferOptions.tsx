import WaterRippleIcon from "assets/icons/WaterRippleIcon.svg?react"
import DropletIcon from "assets/icons/DropletIcon.svg?react"
import { PathOption } from "sections/pools/stablepool/components/PathOption"
import { ListItem } from "sections/pools/stablepool/components/ListItem"
import { useTranslation } from "react-i18next"

export type Option = "OMNIPOOL" | "STABLEPOOL"

type Props = {
  selected: Option
  onSelect: (selected: Option) => void
}

export const TransferOptions = ({ selected, onSelect }: Props) => {
  const { t } = useTranslation()
  return (
    <>
      <PathOption
        selected={selected === "OMNIPOOL"}
        onSelect={() => onSelect("OMNIPOOL")}
        heading={t("liquidity.stablepool.add.stablepoolAndOmnipool")}
        subheading={t("liquidity.stablepool.add.benefits")}
        icon={<WaterRippleIcon />}
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
      </PathOption>
      <PathOption
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
      </PathOption>
    </>
  )
}
