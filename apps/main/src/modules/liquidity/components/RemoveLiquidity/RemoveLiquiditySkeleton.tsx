import {
  Button,
  Flex,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"

export const RemoveLiquiditySkeleton = ({
  onBack,
}: {
  onBack?: () => void
}) => {
  const { t } = useTranslation("liquidity")

  return (
    <>
      <ModalHeader
        title={t("removeLiquidity")}
        closable={false}
        onBack={onBack}
      />
      <ModalBody>
        <Flex align="center" justify="space-between" gap="base" pb="xxl">
          <AssetLogo id={""} size="large" isLoading />
          <Text fs="h5" fw={500} color={getToken("text.high")} font="primary">
            <Skeleton width={50} height="100%" />
          </Text>
        </Flex>

        <ModalContentDivider />

        <Button type="button" size="large" width="100%" mt="xxl" disabled>
          {t("removeLiquidity")}
        </Button>
      </ModalBody>
    </>
  )
}
