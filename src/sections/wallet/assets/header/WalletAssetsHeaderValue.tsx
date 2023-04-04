import { Heading } from "components/Typography/Heading/Heading"
import { Text } from "components/Typography/Text/Text"
import { useTranslation, Trans } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { theme } from "theme"
import { separateBalance } from "utils/balance"
import BN from "bignumber.js"

type Props = {
  value: BN
  title: string
  isLoading: boolean
  disconnected?: boolean
}

export const WalletAssetsHeaderValue = ({
  value,
  title,
  isLoading,
  disconnected,
}: Props) => {
  const { t } = useTranslation()

  return (
    <div
      css={{ flex: 1, width: "100%" }}
      sx={{
        flex: ["row", "column"],
        justify: ["space-between", "flex-start"],
        align: ["center", "flex-start"],
      }}
    >
      <Text color="brightBlue300" sx={{ fontSize: [14, 16], mb: [0, 14] }}>
        {title}
      </Text>

      {isLoading || disconnected ? (
        <Skeleton
          sx={{ width: [97, 168], height: [27, 42] }}
          enableAnimation={!disconnected}
        />
      ) : (
        <Heading as="h3" sx={{ fontSize: [19, 42], fontWeight: 500 }}>
          <Text
            font="ChakraPetch"
            fw={900}
            fs={[19, 42]}
            sx={{ display: "inline-block" }}
          >
            $
          </Text>
          <Trans
            t={t}
            i18nKey="wallet.assets.header.value"
            tOptions={{
              ...separateBalance(value, {
                type: "dollar",
              }),
            }}
          >
            <span
              sx={{ fontSize: [19, 26] }}
              css={{ color: `rgba(${theme.rgbColors.white}, 0.4);` }}
            />
          </Trans>
        </Heading>
      )}
    </div>
  )
}
