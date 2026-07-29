import { Flex, Grid } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"
import { styled } from "@galacticcouncil/ui/utils"

export const SProductCardsContainer = styled(Grid)`
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.space.xl};

  ${mq("md")} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${mq("xl")} {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
`

export const SPegDot = styled.span<{ $stable: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ theme, $stable }) =>
    $stable ? theme.accents.success.emphasis : theme.accents.alertAlt.primary};
`

export const SIconWrapper = styled(Flex)`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme }) => theme.surfaces.containers.dim.dimOnBg};
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  flex-shrink: 0;

  img {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }
`

export const SMetricsGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(7.5rem, 1fr));
  gap: ${({ theme }) => theme.space.xl};
  margin-top: auto;
`

export const SCard = styled(Flex)<{ $span: number }>`
  grid-column: span ${({ $span }) => $span};
  background: ${({ theme }) => theme.surfaces.containers.high.primary};
  border: 1px solid ${({ theme }) => theme.details.borders};
  border-radius: 16px;
  padding: ${({ theme }) => theme.space.xl};
  position: relative;
  overflow: hidden;

  ${mq("max-lg")} {
    grid-column: span 1;
  }
`
