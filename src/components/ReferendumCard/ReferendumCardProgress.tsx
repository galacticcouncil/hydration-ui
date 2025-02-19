import { LinearProgress } from "components/Progress"
import BN from "bignumber.js"
import { theme } from "theme"

export type ReferendumCardProgressProps = {
  percAyes: BN
  percNays: BN
}

export const ReferendumCardProgress: React.FC<ReferendumCardProgressProps> = ({
  percAyes,
  percNays,
}) => {
  const isNoVotes = percAyes.eq(0) && percNays.eq(0)
  return (
    <div sx={{ flex: "row", gap: 8 }}>
      {isNoVotes ? (
        <LinearProgress
          size="small"
          withoutLabel
          percent={100}
          colorCustom={`rgba(${theme.rgbColors.darkBlue300}, 0.5)`}
        />
      ) : (
        <>
          <LinearProgress
            size="small"
            withoutLabel
            sx={{
              width: `${percAyes.lt(2) ? 2 : percAyes.toNumber()}%`,
            }}
            percent={100}
            colorCustom={`linear-gradient(
                270deg,
                ${theme.colors.green600} 50%,
                transparent 100%)`}
          />
          <LinearProgress
            size="small"
            withoutLabel
            sx={{
              width: `${percNays.lt(2) ? 2 : percNays.toNumber()}%`,
            }}
            percent={100}
            colorCustom={`linear-gradient(
                90deg,
                ${theme.colors.pink700} 50%,
                transparent 100%)`}
          />
        </>
      )}
    </div>
  )
}
