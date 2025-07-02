import WaterRippleIcon from "assets/icons/WaterRippleIcon.svg?react"
import DropletIcon from "assets/icons/DropletIcon.svg?react"
import { PathOption } from "sections/pools/stablepool/components/PathOption"
import { ListItem } from "sections/pools/stablepool/components/ListItem"
import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { TFarmAprData } from "api/farms"
import { Button } from "components/Button/Button"
import { useState } from "react"

export type Option = "OMNIPOOL" | "STABLEPOOL"

type Props = {
  disableOmnipool?: boolean
  farms: TFarmAprData[]
  onConfirm: (selected: Option) => void
}

export const TransferOptions = ({
  disableOmnipool,
  farms,
  onConfirm,
}: Props) => {
  const { t } = useTranslation()
  const [selectedOption, setSelectedOption] = useState<Option>(
    disableOmnipool ? "STABLEPOOL" : "OMNIPOOL",
  )

  return (
    <>
      <PathOption
        selected={selectedOption === "OMNIPOOL"}
        onSelect={() => setSelectedOption("OMNIPOOL")}
        heading={t("liquidity.stablepool.add.stablepoolAndOmnipool")}
        subheading={t("liquidity.stablepool.add.benefits")}
        icon={<WaterRippleIcon />}
        disabled={disableOmnipool}
        isFarms={!!farms.length}
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
      </PathOption>
      <PathOption
        selected={selectedOption === "STABLEPOOL"}
        onSelect={() => setSelectedOption("STABLEPOOL")}
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

      <Button
        variant="primary"
        sx={{ mt: 21 }}
        onClick={() => onConfirm(selectedOption)}
      >
        {t("next")}
      </Button>
    </>
  )
}
