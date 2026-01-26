import {
  Button,
  Flex,
  Paper,
  PaperProps,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { AnyChain } from "@galacticcouncil/xc-core"
import { useTranslation } from "react-i18next"

import { ChainLogo } from "@/components/ChainLogo"

type ConnectChainTileProps = PaperProps & {
  chain: AnyChain | null
  onConnect: () => void
}

export const ConnectChainTile: React.FC<ConnectChainTileProps> = ({
  chain,
  onConnect,
  ...props
}) => {
  const { t } = useTranslation(["common", "xcm"])
  return (
    <Paper variant="plain" {...props}>
      <Flex
        justify="space-between"
        align="center"
        direction="row"
        gap="base"
        color={getToken("text.medium")}
      >
        {chain ? (
          <>
            <Flex gap="base" align="center">
              <ChainLogo chain={chain} size="large" />
              <Text fs="p3" fw={500}>
                {t("xcm:chainNotConnected", {
                  chainName: chain.name,
                })}
              </Text>
            </Flex>
            <Button onClick={onConnect} size="small">
              {t("connect")}
            </Button>
          </>
        ) : (
          <Text fs="p3" fw={500}>
            {t("notConnected")}
          </Text>
        )}
      </Flex>
    </Paper>
  )
}
