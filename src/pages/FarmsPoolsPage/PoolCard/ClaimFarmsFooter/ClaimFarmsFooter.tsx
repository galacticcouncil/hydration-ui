import { FlagIcon } from "assets/icons/FlagIcon";
import { Box } from "components/Box/Box";
import { Button } from "components/Button/Button";
import { Icon } from "components/Icon/Icon";
import { Text } from "components/Typography/Text/Text";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { FooterWrapper } from "./ClaimFarmsFooter.styled";

type ClaimFarmsFooterProps = {};

export const ClaimFarmsFooter: FC<ClaimFarmsFooterProps> = () => {
  const { t } = useTranslation();
  return (
    <FooterWrapper flex spread acenter>
      <Box width={380}>
        <Text fw={600} color="primarySuccess100">
          {t("farmsPoolsPage.poolCard.footer.info", {
            locked: 2000,
            available: 1000,
          })}
        </Text>
      </Box>
      <Box width={206}>
        <Text>
          {t("farmsPoolsPage.poolCard.footer.claim", {
            count: 15,
          })}
        </Text>
      </Box>
      <Box width={280} pl={30}>
        <Button variant="gradient" size="small">
          <Box flex acenter jcenter>
            <Icon icon={<FlagIcon />} mr={14} ml={7} />
            {t("farmsPoolsPage.poolCard.footer.button.claimFarms")}
          </Box>
        </Button>
      </Box>
    </FooterWrapper>
  );
};
