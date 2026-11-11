import styled from "@emotion/styled"

// Geist's caps sit high in the line box, so the label reads ~1px above its
// icon; trimming to cap height centres the letters themselves. Ignored where
// text-box is unsupported (Firefox), which keeps today's look.
export const SMenuLabelText = styled.span`
  text-box: trim-both cap alphabetic;
`
