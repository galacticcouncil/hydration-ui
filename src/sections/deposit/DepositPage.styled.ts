import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  --modal-content-padding: 12px;
  --modal-header-padding-y: 12px;
  --modal-header-padding-x: 12px;
  --modal-header-btn-size: 34px;
  --modal-header-height: calc(
    var(--modal-header-btn-size) + var(--modal-header-padding-y) * 1.5
  );

  position: relative;

  display: flex;
  flex-flow: column;

  width: 100%;
  max-width: 610px;
  margin: 0 auto;

  overflow: hidden;

  background: ${theme.colors.darkBlue700};
  border-radius: 8px;
  border: 1px solid rgba(158, 167, 180, 0.2);

  color: #fff;
`
