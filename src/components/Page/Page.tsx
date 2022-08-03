import { FC } from "react";
import { ReactNode } from "react";
import { StyledPage } from "./Page.styled";

type PageProps = {
  children: ReactNode;
};

export const Page: FC<PageProps> = ({ children }) => (
  <StyledPage>
    <div>{children}</div>
  </StyledPage>
);
