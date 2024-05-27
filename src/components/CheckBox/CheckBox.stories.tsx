import { CheckBox } from "./CheckBox"
import { Text } from "components/Typography/Text/Text"
import type { Meta } from "@storybook/react"

export default {
  component: CheckBox,
} as Meta<typeof CheckBox>

export const Primary = () => <CheckBox />
export const PrimarySmall = () => <CheckBox size="small" />
export const PrimaryLarge = () => <CheckBox size="large" />
export const Secondary = () => <CheckBox variant="secondary" />
export const Disabled = () => <CheckBox disabled checked />
export const WithLabel = () => (
  <CheckBox label={<Text fs={14}>I agree with terms a and conditions.</Text>} />
)
