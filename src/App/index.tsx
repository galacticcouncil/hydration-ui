import { Button } from "components/Button";
import { GlobalStyle } from "./GlobalStyle";

export const App = () => {
  return (
    <>
      <GlobalStyle />
      <p>Basilisk Mining UI</p>
      <Button text="Test" />
      <Button text="Test small" size="small" />
      <Button text="Test disabled" disabled />
    </>
  );
};
