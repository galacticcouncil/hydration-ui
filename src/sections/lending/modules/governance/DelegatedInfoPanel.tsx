import { Button, Divider, Paper, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { constants } from "ethers"
import { AvatarSize } from "sections/lending/components/Avatar"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { Link } from "sections/lending/components/primitives/Link"
import { Row } from "sections/lending/components/primitives/Row"
import { TokenIcon } from "sections/lending/components/primitives/TokenIcon"
import { ExternalUserDisplay } from "sections/lending/components/UserDisplay"
import { useGovernanceTokens } from "sections/lending/hooks/governance/useGovernanceTokens"
import { usePowers } from "sections/lending/hooks/governance/usePowers"
import { useModalContext } from "sections/lending/hooks/useModal"
import { ZERO_ADDRESS } from "sections/lending/modules/governance/utils/formatProposal"
import { useRootStore } from "sections/lending/store/root"

type DelegatedPowerProps = {
  aavePower: string
  stkAavePower: string
  aaveDelegatee: string
  stkAaveDelegatee: string
  title: string
  aAavePower: string
  aAaveDelegatee: string
}

const DelegatedPower: React.FC<DelegatedPowerProps> = ({
  aavePower,
  stkAavePower,
  aaveDelegatee,
  stkAaveDelegatee,
  aAaveDelegatee,
  aAavePower,
  title,
}) => {
  const isAaveSelfDelegated =
    !aaveDelegatee || constants.AddressZero === aaveDelegatee
  const isStkAaveSelfDelegated =
    !stkAaveDelegatee || constants.AddressZero === stkAaveDelegatee
  const isAAaveSelfDelegated =
    !aAaveDelegatee || constants.AddressZero === aAaveDelegatee

  if (isAaveSelfDelegated && isStkAaveSelfDelegated && isAAaveSelfDelegated)
    return null

  return (
    <Box sx={{ display: "flex", flexDirection: "column", mt: 6, mb: 2 }}>
      <Typography typography="caption" sx={{ mb: 5 }} color="text.secondary">
        <span>{title}</span>
      </Typography>
      <Box sx={{ display: "flex", gap: 4, flexDirection: "column" }}>
        {aaveDelegatee !== ZERO_ADDRESS &&
        aaveDelegatee === stkAaveDelegatee &&
        aaveDelegatee === aAaveDelegatee ? (
          <Row
            align="flex-start"
            caption={
              <ExternalUserDisplay
                avatarProps={{ size: AvatarSize.XS }}
                titleProps={{ variant: "subheader1" }}
                address={aaveDelegatee}
              />
            }
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <FormattedNumber
                value={
                  Number(aavePower) + Number(stkAavePower) + Number(aAavePower)
                }
                variant="subheader1"
              />
              <Typography variant="helperText" color="text.secondary">
                AAVE + stkAAVE + aAAVE
              </Typography>
            </Box>
          </Row>
        ) : (
          <>
            {!isAaveSelfDelegated && (
              <Row
                align="flex-start"
                caption={
                  <ExternalUserDisplay
                    avatarProps={{ size: AvatarSize.XS }}
                    titleProps={{ variant: "subheader1" }}
                    address={aaveDelegatee}
                  />
                }
              >
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <TokenIcon symbol="AAVE" sx={{ width: 16, height: 16 }} />
                  <FormattedNumber value={aavePower} variant="subheader1" />
                </Box>
              </Row>
            )}
            {!isStkAaveSelfDelegated && (
              <Row
                align="flex-start"
                caption={
                  <ExternalUserDisplay
                    avatarProps={{ size: AvatarSize.XS }}
                    titleProps={{ variant: "subheader1" }}
                    address={stkAaveDelegatee}
                  />
                }
              >
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <TokenIcon symbol="stkAAVE" sx={{ width: 16, height: 16 }} />
                  <FormattedNumber value={stkAavePower} variant="subheader1" />
                </Box>
              </Row>
            )}

            {!isAAaveSelfDelegated && (
              <Row
                align="flex-start"
                caption={
                  <ExternalUserDisplay
                    avatarProps={{ size: AvatarSize.XS }}
                    titleProps={{ variant: "subheader1" }}
                    address={aAaveDelegatee}
                  />
                }
              >
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <TokenIcon
                    aToken
                    symbol="aave"
                    sx={{ width: 16, height: 16 }}
                  />
                  <FormattedNumber value={aAavePower} variant="subheader1" />
                </Box>
              </Row>
            )}
          </>
        )}
      </Box>
    </Box>
  )
}

export const DelegatedInfoPanel = () => {
  const address = useRootStore((store) => store.account)
  const {
    data: { aave, stkAave, aAave },
  } = useGovernanceTokens()
  const { data: powers } = usePowers()
  const { openGovDelegation, openRevokeGovDelegation } = useModalContext()

  if (!powers || !address) return null

  const disableButton =
    Number(aave) <= 0 &&
    Number(stkAave) <= 0 &&
    Number(aAave) <= 0 &&
    powers.aavePropositionDelegatee === constants.AddressZero &&
    powers.aaveVotingDelegatee === constants.AddressZero &&
    powers.stkAavePropositionDelegatee === constants.AddressZero &&
    powers.stkAaveVotingDelegatee === constants.AddressZero &&
    powers.aAavePropositionDelegatee === constants.AddressZero &&
    powers.aAaveVotingDelegatee === constants.AddressZero

  const showRevokeButton =
    powers.aavePropositionDelegatee !== constants.AddressZero ||
    powers.aaveVotingDelegatee !== constants.AddressZero ||
    powers.stkAavePropositionDelegatee !== constants.AddressZero ||
    powers.stkAaveVotingDelegatee !== constants.AddressZero ||
    powers.aAaveVotingDelegatee !== constants.AddressZero ||
    powers.aAavePropositionDelegatee !== constants.AddressZero

  return (
    <Paper sx={{ mt: 2 }}>
      <Box sx={{ px: 6, pb: 6, pt: 4 }}>
        <Typography typography="h3">
          <span>Delegated power</span>
        </Typography>
        <Typography
          typography="description"
          sx={{ mt: 1 }}
          color="text.secondary"
        >
          <span>
            Use your AAVE, stkAAVE, or aAave balance to delegate your voting and
            proposition powers. You will not be sending any tokens, only the
            rights to vote and propose changes to the protocol. You can
            re-delegate or revoke power to self at any time.
          </span>
          <Link
            href="https://docs.aave.com/developers/v/2.0/protocol-governance/governance"
            target="_blank"
            variant="description"
            color="text.secondary"
            sx={{ textDecoration: "underline", ml: 1 }}
          >
            <span>Learn more.</span>
          </Link>
        </Typography>
        {disableButton ? (
          <Typography variant="description" color="text.muted" mt={6}>
            <span>You have no AAVE/stkAAVE/aAave balance to delegate.</span>
          </Typography>
        ) : (
          <>
            <DelegatedPower
              aavePower={aave}
              stkAavePower={stkAave}
              aAavePower={aAave}
              aAaveDelegatee={powers.aAaveVotingDelegatee}
              aaveDelegatee={powers.aaveVotingDelegatee}
              stkAaveDelegatee={powers.stkAaveVotingDelegatee}
              title="Voting power"
            />
            <DelegatedPower
              aavePower={aave}
              aAavePower={aAave}
              aAaveDelegatee={powers.aAavePropositionDelegatee}
              stkAavePower={stkAave}
              aaveDelegatee={powers.aavePropositionDelegatee}
              stkAaveDelegatee={powers.stkAavePropositionDelegatee}
              title="Proposition power"
            />
          </>
        )}
      </Box>
      <Divider />
      <Box sx={{ p: 6, display: "flex", flexDirection: "column", gap: 2 }}>
        <Button
          size="large"
          sx={{ width: "100%" }}
          variant="contained"
          disabled={disableButton}
          onClick={() => openGovDelegation()}
        >
          <span>Set up delegation</span>
        </Button>
        {showRevokeButton && (
          <Button
            size="large"
            sx={{ width: "100%" }}
            variant="outlined"
            disabled={disableButton}
            onClick={() => openRevokeGovDelegation()}
          >
            <span>Revoke power</span>
          </Button>
        )}
      </Box>
    </Paper>
  )
}
