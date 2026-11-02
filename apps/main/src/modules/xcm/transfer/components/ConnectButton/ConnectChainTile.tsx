import { Button, Flex, FlexProps, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getChainId } from "@galacticcouncil/utils"
import { AnyChain } from "@galacticcouncil/xc-core"
import { useTranslation } from "react-i18next"

import { ChainLogo } from "@/components/ChainLogo"

type ConnectTileBaseProps = FlexProps & {
  layout?: "horizontal" | "vertical"
  onConnect: () => void
}

type ConnectChainTileProps = ConnectTileBaseProps & {
  chain: AnyChain | null
}

export const ConnectChainTile: React.FC<ConnectChainTileProps> = ({
  chain,
  ...props
}) => (
  <ConnectTile
    chainName={chain?.name}
    logo={
      chain && (
        <ChainLogo
          ecosystem={chain.ecosystem}
          chainId={getChainId(chain)}
          size="large"
        />
      )
    }
    {...props}
  />
)

type ConnectTileProps = ConnectTileBaseProps & {
  chainName?: string
  logo?: React.ReactNode
}

/** Connect prompt for a chain given by its name and logo, xcm or not. */
export const ConnectTile: React.FC<ConnectTileProps> = ({
  chainName,
  logo,
  onConnect,
  layout = "horizontal",
  bg = getToken("controls.dim.base"),
  ...props
}) => {
  const { t } = useTranslation(["common", "xcm"])
  return (
    <Flex
      justify="space-between"
      align="center"
      direction="row"
      gap="base"
      color={getToken("text.medium")}
      borderRadius="xl"
      bg={bg}
      p="xl"
      {...props}
    >
      {chainName ? (
        <Flex
          gap="base"
          align="center"
          width="100%"
          direction={layout === "vertical" ? "column" : "row"}
          mx="auto"
        >
          {logo}
          <Text
            fs="p3"
            fw={500}
            lh={1.3}
            align={layout === "vertical" ? "center" : "left"}
          >
            {t("xcm:chainNotConnected", {
              chainName,
            })}
          </Text>
          <Button
            onClick={onConnect}
            size="small"
            {...(layout === "vertical" ? { mx: "auto" } : { ml: "auto" })}
          >
            {t("connect")}
          </Button>
        </Flex>
      ) : (
        <Text fs="p3" fw={500}>
          {t("notConnected")}
        </Text>
      )}
    </Flex>
  )
}
