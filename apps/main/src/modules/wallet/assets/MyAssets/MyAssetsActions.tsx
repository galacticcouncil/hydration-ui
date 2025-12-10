import {
  Flex,
  Toggle,
  ToggleLabel,
  ToggleRoot,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { MyAssetsFeePaymentChange } from "@/modules/wallet/assets/MyAssets/MyAssetsFeePaymentChange"

type Props = {
  readonly hasFunds: boolean
  readonly showAllAssets: boolean
  readonly onToggleShowAllAssets: () => void
}

export const MyAssetsActions: FC<Props> = ({
  hasFunds,
  showAllAssets,
  onToggleShowAllAssets,
}) => {
  const { t } = useTranslation("wallet")

  return (
    <Flex gap={16} direction={["column", "row"]} align={["flex-end", "center"]}>
      {/* TODO add new asset */}
      {/* <Button size="medium">
        <Plus />
        {t("myAssets.header.cta")}
      </Button> */}
      <ToggleRoot>
        <ToggleLabel>{t("myAssets.header.toggle")}</ToggleLabel>
        <Toggle
          checked={showAllAssets}
          onCheckedChange={onToggleShowAllAssets}
        />
      </ToggleRoot>
      {hasFunds && <MyAssetsFeePaymentChange />}
    </Flex>
  )
}
