import { ResponsiveValue } from "utils/responsive"
import { Gradient, SSpinnerContainer } from "./Spinner.styled"

export const Spinner = ({
  size = 34,
  className,
}: {
  size?: ResponsiveValue<number>
  className?: string
}) => {
  return (
    <SSpinnerContainer size={size} className={className}>
      <svg viewBox="0 0 100 100">
        <g filter="url(#filter0_f_36709_245024)">
          <circle
            cx="50"
            cy="50"
            r="43"
            stroke="white"
            stroke-width="2"
            fill="none"
            strokeDasharray="50 300"
            strokeDashoffset="218"
            strokeLinecap="round"
          />
        </g>

        <foreignObject mask="url(#mask)" x="0" y="0" width="100" height="100">
          <Gradient />
        </foreignObject>

        <defs>
          <mask id="mask">
            <circle
              cx="50"
              cy="50"
              r="43"
              stroke="white"
              stroke-width="2"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="180.49555921538757 251.32741228718345"
            />
          </mask>

          <filter
            id="filter0_f_36709_245024"
            x="0.118683"
            y="0.442188"
            width="100"
            height="100"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="2.5"
              result="effect1_foregroundBlur_36709_245024"
            />
          </filter>
        </defs>
      </svg>
    </SSpinnerContainer>
  )
}
