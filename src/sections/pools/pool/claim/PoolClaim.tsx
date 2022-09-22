import { ReactComponent as FlagIcon } from "assets/icons/FlagIcon.svg"
import { Box } from "components/Box/Box"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { FooterWrapper } from "sections/pools/pool/claim/PoolClaim.styled"

export const PoolClaim = () => {
  const { t } = useTranslation()

  return (
    <FooterWrapper flex spread acenter>
      <Box width={380}>
        <Text fw={600} color="primary100">
          {t("pools.pool.claim.info", {
            locked: 2000,
            available: 1000,
          })}
        </Text>
      </Box>
      <Box width={206}>
        <Text>
          {t("pools.pool.claim.amount", {
            count: 15,
          })}
        </Text>
      </Box>
      <Box width={280} pl={30}>
        <Button variant="gradient" size="small">
          <Box flex acenter jcenter>
            <Icon icon={<FlagIcon />} mr={14} ml={7} />
            {t("pools.pool.claim.button")}
          </Box>
        </Button>
      </Box>
    </FooterWrapper>
  )
}
