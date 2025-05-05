import styled from "@emotion/styled"
import { mq } from "@galacticcouncil/ui/theme"

export const SFilterContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;

  ${mq("sm")} {
    max-width: 400px;
  }

  ${mq("md")} {
    display: none;
  }
`

export const SContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  > div {
    height: fit-content;
  }

  > div:nth-of-type(2) {
    display: none;
  }

  ${mq("md")} {
    flex-direction: row;

    > div:nth-of-type(1) {
      width: calc(100% - 400px);
    }

    > div:nth-of-type(2) {
      display: block;
      width: 400px;
    }
  }
`
