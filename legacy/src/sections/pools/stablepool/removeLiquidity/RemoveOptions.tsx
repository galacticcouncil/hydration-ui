import WaterRippleIcon from "assets/icons/WaterRippleIcon.svg?react"
import DropletIcon from "assets/icons/DropletIcon.svg?react"
import { PathOption } from "sections/pools/stablepool/components/PathOption"
import { ListItem } from "sections/pools/stablepool/components/ListItem"
import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"

export type RemoveOption = "SHARES" | "STABLE"

type Props = {
  selected: RemoveOption
  onSelect: (selected: RemoveOption) => void
}

export const RemoveOptions = ({ selected, onSelect }: Props) => {
  const { t } = useTranslation()
  return (
    <>
      <PathOption
        selected={selected === "SHARES"}
        onSelect={() => onSelect("SHARES")}
        heading={t("liquidity.stablepool.remove.shares")}
        subheading={t("liquidity.stablepool.add.benefits")}
        icon={<WaterRippleIcon />}
      >
        <ListItem>
          {t("liquidity.stablepool.remove.stablepoolOnly.benefit1")}
        </ListItem>
        <ListItem>
          {t("liquidity.stablepool.remove.stablepoolOnly.benefit2")}
        </ListItem>
        <ListItem>
          {t("liquidity.stablepool.remove.stablepoolOnly.benefit3")}
        </ListItem>
      </PathOption>
      <PathOption
        selected={selected === "STABLE"}
        onSelect={() => onSelect("STABLE")}
        heading={t("liquidity.stablepool.remove.stable")}
        icon={<DropletIcon />}
      >
        <Text color="white" sx={{ m: 0, ml: 38 }} fs={14} fw={400}>
          {t("liquidity.stablepool.remove.all")}
        </Text>
      </PathOption>
    </>
  )
}
