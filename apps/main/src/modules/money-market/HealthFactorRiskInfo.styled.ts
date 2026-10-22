import { styled } from "@galacticcouncil/ui/utils"

const alignToLeft = {
  left: "0%",
  center: "50%",
  right: "100%",
} as const

const alignToTransform = {
  left: "translateX(0%)",
  center: "translateX(-50%)",
  right: "translateX(-100%)",
} as const

const alignToAlignItems = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
} as const

export const SFloatingValue = styled.div<{
  placement: "top" | "bottom"
  align?: "left" | "center" | "right"
}>`
  display: flex;
  position: absolute;
  padding-block: 2px;
  flex-direction: column;
  text-align: ${({ align }) => align};

  bottom: ${({ placement }) => (placement === "top" ? "100%" : "auto")};
  top: ${({ placement }) => (placement === "bottom" ? "100%" : "auto")};

  left: ${({ align = "center" }) => alignToLeft[align]};
  transform: ${({ align = "center" }) => alignToTransform[align]};
  align-items: ${({ align = "center" }) => alignToAlignItems[align]};
`
