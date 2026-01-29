import styled from "@emotion/styled"

import heroImage from "assets/images/next-ui-banner.webp"
import selectImage from "assets/images/next-ui-select.webp"

export const SHeroImage = styled.div`
  aspect-ratio: 462 / 288;
  background-image: url(${heroImage});
  background-size: cover;
  background-repeat: no-repeat;
`

export const SSelectImage = styled.div`
  aspect-ratio: 276 / 54;
  width: 60%;

  background-image: url(${selectImage});
  background-size: cover;
  background-repeat: no-repeat;
  margin: 0 auto;
`

export const SContent = styled.div`
  padding: 20px 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: -125px;
  max-width: 90%;
  margin-inline: auto;
`

export const SFooter = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 40px 30px;
`
