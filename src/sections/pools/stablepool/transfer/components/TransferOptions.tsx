import WaterRippleIcon from "assets/icons/WaterRippleIcon.svg?react"
import DropletIcon from "assets/icons/DropletIcon.svg?react"
import { TransferOption } from "./TransferOption"
import { ListItem } from "./ListItem"
import { useTranslation } from "react-i18next"

type Option = "OMNIPOOL" | "STABLEPOOL"

type Props = {
  selected: Option
  onSelect: (selected: Option) => void
}

export const TransferOptions = ({ selected, onSelect }: Props) => {
  const { t } = useTranslation()
  return (
    <>
      <TransferOption
        selected={selected === "OMNIPOOL"}
        onSelect={() => onSelect("OMNIPOOL")}
        heading={t("liquidity.add.omnipool")}
        subheading={t("liquidity.add.benefits")}
        icon={<WaterRippleIcon />}
      >
        <ListItem>
          First benefit mentioned here. A line of of text would be enough.
        </ListItem>
        <ListItem>
          Second benefit mentioned here. A line of of text would be enough.
        </ListItem>
        <ListItem>
          Third benefit mentioned here. A line of of text would be enough.
        </ListItem>
        <ListItem>Fourth benefit mentioned here.</ListItem>
      </TransferOption>
      <TransferOption
        selected={selected === "STABLEPOOL"}
        onSelect={() => onSelect("STABLEPOOL")}
        heading={t("liquidity.add.stablepool")}
        subheading={t("liquidity.add.benefits")}
        icon={<DropletIcon />}
      >
        <ListItem>
          First benefit mentioned here. A line of of text would be enough.
        </ListItem>
        <ListItem>
          Second benefit mentioned here. A line of of text would be enough.
        </ListItem>
        <ListItem>
          Third benefit mentioned here. A line of of text would be enough.
        </ListItem>
        <ListItem>Fourth benefit mentioned here.</ListItem>
      </TransferOption>
    </>
  )
}
