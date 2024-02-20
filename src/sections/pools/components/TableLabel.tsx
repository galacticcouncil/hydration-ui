import { Text } from "components/Typography/Text/Text"

export const TableLabel = ({ label }: { label: string }) => (
  <Text
    fs={[15, 19]}
    lh={[19, 24]}
    font="FontOver"
    tTransform="uppercase"
    sx={{ p: ["24px 0 16px", "30px 0 20px"] }}
  >
    {label}
  </Text>
)
