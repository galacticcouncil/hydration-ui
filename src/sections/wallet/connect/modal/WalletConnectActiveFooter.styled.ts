import { Box } from "components/Box/Box"
import { Text } from "components/Typography/Text/Text"
import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled(Box)`
  align-items: center;
  justify-content: space-between;

  background: ${theme.colors.backgroundGray1000};

  margin: 0px -30px -30px;
  width: calc(100% + 30px * 2);

  border-radius: 16px;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;

  padding: 20px 30px;
`

export const SLogoutContainer = styled(Box)`
  gap: 2px;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.neutralGray500};
`

export const SSwitchText = styled(Text)`
  color: ${theme.colors.primary450};
  display: flex;
  align-items: center;
  justify-content: center;
`
