import { Button, Flex, Paper, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { AnyChain } from "@galacticcouncil/xcm-core"
import { useTranslation } from "react-i18next"

import { ChainLogo } from "@/components/ChainLogo"

type RecipientConnectButtonProps = {
  destChain?: AnyChain
  onConnect: () => void
}

export const RecipientConnectButton: React.FC<RecipientConnectButtonProps> = ({
  destChain,
  onConnect,
}) => {
  const { t } = useTranslation("xcm")
  return (
    <Paper p={20} variant="plain" sx={{ bg: getToken("controls.dim.base") }}>
      <Flex
        justify="space-between"
        align="center"
        direction="row"
        gap={10}
        color={getToken("text.medium")}
      >
        {destChain ? (
          <>
            <Flex gap={10} align="center">
              <ChainLogo chain={destChain} size="large" />
              <Text fs="p3" fw={500}>
                {t("recipient.connect.chainNotConnected", {
                  chainName: destChain.name,
                })}
              </Text>
            </Flex>
            <Button onClick={onConnect} size="small">
              {t("recipient.connect.connect")}
            </Button>
          </>
        ) : (
          <Text fs="p3" fw={500}>
            {t("recipient.connect.notConnected")}
          </Text>
        )}
      </Flex>
    </Paper>
  )
}
