import { SkeletonClipPath } from "./ChartSkeleton.styled"

export const ChartSkeleton = () => {
  return (
    <div css={{ position: "relative" }}>
      <svg
        width="618"
        height="303"
        viewBox="0 0 618 303"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="clip-path">
            <path
              d="M0.773438 66.8698V302.292L617.228 302.292V1.52411C617.228 0.591954 616.026 0.204925 615.418 0.910968C554.573 71.4945 511.064 45.59 381.039 29.4934C249.728 13.2377 235.431 129.874 138.945 129.874C43.7854 129.874 39.8374 93.8813 2.36022 66.0795C1.70627 65.5944 0.773438 66.0555 0.773438 66.8698Z"
              fill="url(#paint0_radial_27177_23934)"
            />
            <path
              d="M0.773438 66.8698V302.292L617.228 302.292V1.52411C617.228 0.591954 616.026 0.204925 615.418 0.910968C554.573 71.4945 511.064 45.59 381.039 29.4934C249.728 13.2377 235.431 129.874 138.945 129.874C43.7854 129.874 39.8374 93.8813 2.36022 66.0795C1.70627 65.5944 0.773438 66.0555 0.773438 66.8698Z"
              fill="url(#paint1_linear_27177_23934)"
            />

            <defs>
              <radialGradient
                id="paint0_radial_27177_23934"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(308.009 8.43581) rotate(90.1908) scale(264.792 435.256)"
              >
                <stop stop-color="#4FDFFF" stop-opacity="0.31" />
                <stop offset="1" stop-color="#4FEAFF" stop-opacity="0" />
              </radialGradient>
              <linearGradient
                id="paint1_linear_27177_23934"
                x1="-28.9755"
                y1="59.7469"
                x2="-204.492"
                y2="60.8237"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#4FDFFF" stop-opacity="0" />
                <stop
                  offset="0.510526"
                  stop-color="#4FDFFF"
                  stop-opacity="0.17"
                />
                <stop offset="1" stop-color="#4FEAFF" stop-opacity="0" />
              </linearGradient>
            </defs>
          </clipPath>
        </defs>
      </svg>
      <SkeletonClipPath />
    </div>
  )
}
