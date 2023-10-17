import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import styled from "@emotion/styled"
import { theme } from "theme"
import ListIcon from "assets/icons/ListIcon.svg?react"

const SItem = styled.div`
  display: flex;
  align-items: baseline;
  border-left: 1px solid transparent;
  opacity: 0.8;

  &:not(:last-of-type) {
    border-color: ${theme.colors.pink500};
  }
`

export const ListItem = ({ children }: { children: string }) => (
  <SItem>
    <Icon
      icon={<ListIcon />}
      sx={{ ml: -1, mt: -1, mr: 7, color: "pink500" }}
    />
    <Text color="white" sx={{ m: 0 }} fs={14} fw={400}>
      {children}
    </Text>
  </SItem>
)
