import { GradientText } from 'components/Typography/GradientText/GradientText'
import styled from '@emotion/styled'
import { Icon } from 'components/Icon/Icon'
import { theme } from 'theme'
import { ReactComponent as ListIcon } from "assets/icons/ListIcon.svg"
import { Text } from 'components/Typography/Text/Text'
import { Heading } from 'components/Typography/Heading/Heading'

const Selected = styled.div`
  background: linear-gradient(0deg, rgba(19, 18, 47, 0.52), rgba(19, 18, 47, 0.52)),
  radial-gradient(202.95% 202.95% at 30.22% 151.83%, #FF014D 0%, rgba(255, 32, 193, 0) 100%);
`

const SItem = styled.div`
  display: flex;
  align-items: baseline;
  border-left: 1px solid transparent;
  
  &:not(:last-of-type) {
    border-color: ${theme.colors.pink500}
  }
`

const Item = ({ children }: { children: string }) => {
  return (
    <SItem>
      <Icon icon={<ListIcon />} sx={{ ml: -1, mt: -1, mr: 7 }} />
      <Text color="white" sx={{ m: 0 }} fs={14} fw={400}>{children}</Text>
    </SItem>
  )
}

export const AddLiquidity = () => {

  return (
    <div>
      <GradientText>Add liquidity</GradientText>

      <Selected>
        <Heading fs={20} lh={26} fw={500}>Add to omnipool</Heading>
        <div>
          <div css={{ borderLeft: `1px solid ${theme.colors.white}`, marginBottom: 6, paddingLeft: 25 }}>
            <Text>Benefits</Text>
          </div>
          <Item>
            First benefit mentioned here. A line of of text would be enough.
          </Item>
          <Item>
            Second benefit mentioned here. A line of of text would be enough.
          </Item>
          <Item>
            Third benefit mentioned here. A line of of text would be enough.
          </Item>
          <Item>
            Fourth benefit mentioned here.
          </Item>
        </div>
      </Selected>
      <div>Add to stablepool</div>
    </div>
  )
}
