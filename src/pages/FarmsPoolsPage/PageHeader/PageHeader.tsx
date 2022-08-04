import { Box } from "components/Box/Box";
import { Switch } from "components/Switch/Switch";
import { GradientText } from "components/Typography/GradientText/GradientText";
import { Heading } from "components/Typography/Heading/Heading";
import { Text } from "components/Typography/Text/Text";
import { useState } from "react";
import { FC } from "react";
import { useTranslation } from "react-i18next";

export const PageHeader: FC = () => {
  const { t } = useTranslation();

  const [showMyFarms, setShowMyFarms] = useState<boolean>(false);

  return (
    <>
      <Box flex spread mb={43}>
        <GradientText fs={30} fw={700}>
          {t("farmsPoolsPage.header.title")}
        </GradientText>
        <Box flex acenter>
          <Text fs={14} mr={10}>
            {t("farmsPoolsPage.header.switch")}
          </Text>
          <Switch
            value={showMyFarms}
            onCheckedChange={setShowMyFarms}
            size="small"
          />
        </Box>
      </Box>
      <Box flex even mb={40}>
        <Box>
          <Text color="neutralGray300" mb={14}>
            {t("farmsPoolsPage.header.valueLocked")}
          </Text>
          <Box flex align="baseline">
            <Heading as="h3" fs={42} fw={900}>
              $1 100 000 000.
            </Heading>
            <Heading fs={28} opacity={0.4}>
              56
            </Heading>
          </Box>
        </Box>
        <Box>
          <Text color="neutralGray300" mb={14}>
            {t("farmsPoolsPage.header.valueFarms")}
          </Text>
          <Box flex align="baseline">
            <Heading as="h3" fs={42} fw={900}>
              $1 100 000 000.
            </Heading>
            <Heading fs={28} opacity={0.4}>
              56
            </Heading>
          </Box>
        </Box>
      </Box>
    </>
  );
};
