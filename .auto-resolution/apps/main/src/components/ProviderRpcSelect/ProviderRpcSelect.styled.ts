import styled from "@emotion/styled"
import { mq } from "@galacticcouncil/ui/theme"

export const SContainer = styled.div`
  padding: 8px;
  padding-bottom: 80px;

  display: flex;
  justify-content: end;

  ${mq("lg")} {
    position: fixed;
    right: 0;
    bottom: 0;
    padding-bottom: 8px;
  }
`
