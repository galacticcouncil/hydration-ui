import { styled } from "@/utils"

export const SLink = styled.a<{ underlined?: boolean }>`
  color: inherit;
  text-decoration: ${({ underlined }) => (underlined ? "underline" : "none")};
  &:hover {
    text-decoration: underline;
  }
`
