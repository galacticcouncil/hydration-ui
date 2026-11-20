import { ModalBody } from "@galacticcouncil/ui/components"
import { styled } from "@galacticcouncil/ui/utils"

export const SActionModalBody = styled(ModalBody)`
  display: flex;
  flex-direction: column;

  & > form {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  & > form > :nth-last-child(2) {
    margin-top: auto;
  }
`
