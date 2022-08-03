import { Page } from "components/Page/Page";
import { Button } from "components/Button/Button";
import { Heading } from "components/Typography/Heading/Heading";
import { Text } from "components/Typography/Text/Text";
import { GradientText } from "components/Typography/GradientText/GradientText";
import { Switch } from "components/Switch/Switch";
import { useState } from "react";
import { Box } from "components/Box/Box";

export const FarmsPoolsPage = () => {
  const [switchVal, setSwitchVal] = useState<boolean>(false);
  const [switchVal2, setSwitchVal2] = useState<boolean>(false);

  return (
    <Page>
      <Text>Playground</Text>
      <Button text="Test" />
      <Button text="Test small" size="small" />
      <Button variant="primary" text="Test" />
      <Button variant="primary" text="Test" disabled />
      <Heading as="h1">H1/bold</Heading>
      <Heading as="h2" weight={400} fs={30}>
        Letter spacing
      </Heading>
      <Heading as="h3" weight={500} fs={40}>
        Letter spacing
      </Heading>
      <GradientText fs={40}>Le epique gradient texte</GradientText>
      <Box width={100} height={100} center>
        <Switch value={switchVal} onCheckedChange={setSwitchVal} />
        <Switch value={switchVal2} onCheckedChange={setSwitchVal2} disabled />
      </Box>
    </Page>
  );
};
