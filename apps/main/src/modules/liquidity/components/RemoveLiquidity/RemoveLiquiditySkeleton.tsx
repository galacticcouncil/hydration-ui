import {
  Button,
  Flex,
  LogoSkeleton,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Separator,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

export const RemoveLiquiditySkeleton = ({
  onBack,
}: {
  onBack?: () => void
}) => {
  const { t } = useTranslation(["liquidity", "common"])

  return (
    <>
      <ModalHeader
        title={t("removeLiquidity")}
        closable={false}
        onBack={onBack}
      />
      <ModalBody>
        <Flex direction="column" gap="l">
          <Flex align="center" gap="base">
            <LogoSkeleton size="large" />
            <Skeleton width={120} height={24} />
          </Flex>

          <ModalContentDivider />

          <Text>
            <Skeleton width={120} height="1em" />
          </Text>
          <Flex
            direction="column"
            gap="m"
            p="m"
            sx={{
              borderRadius: "m",
              backgroundColor: getToken("surfaces.containers.dim.dimOnHigh"),
            }}
          >
            <ReceiveAssetSkeleton />
            <Separator />
            <ReceiveAssetSkeleton />
          </Flex>
        </Flex>
      </ModalBody>
      <ModalFooter>
        <Button
          type="button"
          size="large"
          variant="muted"
          width="100%"
          disabled
        >
          {t("removeLiquidity")}
        </Button>
      </ModalFooter>
    </>
  )
}

const ReceiveAssetSkeleton = () => (
  <Flex gap="m" justify="space-between" align="center">
    <Flex align="center" gap="base">
      <LogoSkeleton size="small" />
      <Skeleton width={48} height={14} />
    </Flex>
    <Flex direction="column" align="flex-end" gap="xs">
      <Skeleton width={72} height={16} />
      <Skeleton width={56} height={12} />
    </Flex>
  </Flex>
)
