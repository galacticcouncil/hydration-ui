import {
  Button,
  Flex,
  ModalBody,
  ModalContainer,
  ModalContentDivider,
  ModalHeader,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { Logo } from "@/components/Logo"

export const RemoveLiquiditySkeleton = () => {
  const { t } = useTranslation("liquidity")
  return (
    <Flex justify="center" mt={getTokenPx("containers.paddings.primary")}>
      <ModalContainer open>
        <ModalHeader title={t("removeLiquidity")} closable={false} />
        <ModalBody>
          <Flex
            align="center"
            justify="space-between"
            gap={getTokenPx("containers.paddings.quart")}
            pb={getTokenPx("containers.paddings.primary")}
          >
            <Logo id={""} size="large" isLoading />
            <Text fs="h5" fw={500} color={getToken("text.high")} font="primary">
              <Skeleton width={50} height="100%" />
            </Text>
          </Flex>

          <ModalContentDivider />

          <Button
            type="button"
            size="large"
            width="100%"
            mt={getTokenPx("containers.paddings.primary")}
            disabled
          >
            {t("removeLiquidity")}
          </Button>
        </ModalBody>
      </ModalContainer>
    </Flex>
  )
}
