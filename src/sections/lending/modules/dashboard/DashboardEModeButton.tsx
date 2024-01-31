import { CogIcon, LightningBoltIcon } from "@heroicons/react/solid"

import { Box, Button, SvgIcon, Typography } from "@mui/material"
import Menu from "@mui/material/Menu"
import React, { useState } from "react"
import { EmodeModalType } from "sections/lending/components/transactions/Emode/EmodeModalContent"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useModalContext } from "sections/lending/hooks/useModal"

import LightningBoltGradient from "sections/lending/assets/lightningBoltGradient.svg?react"

import { Link } from "sections/lending/components/primitives/Link"
import { Row } from "sections/lending/components/primitives/Row"
import { TypographyGradient } from "sections/lending/components/primitives/TypographyGradient"
import { getEmodeMessage } from "sections/lending/components/transactions/Emode/EmodeNaming"

interface DashboardEModeButtonProps {
  userEmodeCategoryId: number
}

export const DashboardEModeButton = ({
  userEmodeCategoryId,
}: DashboardEModeButtonProps) => {
  const { openEmode } = useModalContext()
  const { eModes: _eModes } = useAppDataContext()

  const iconButtonSize = 12

  const [anchorEl, setAnchorEl] = useState<Element | null>(null)
  const open = Boolean(anchorEl)
  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const isEModeDisabled = userEmodeCategoryId === 0

  const EModeLabelMessage = () => (
    <span>{getEmodeMessage(_eModes[userEmodeCategoryId].label)}</span>
  )

  const eModes = Object.keys(_eModes).length

  return (
    <Box
      sx={{ display: "inline-flex", alignItems: "center" }}
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <Typography mr={1} variant="description" color="text.secondary">
        <span>E-Mode</span>
      </Typography>

      <Button
        onClick={(e) => {
          e.stopPropagation()
          handleClick(e)
        }}
        data-cy={`emode-open`}
        size="small"
        variant="outlined"
        sx={(theme) => ({
          ml: 1,
          borderRadius: "4px",
          p: 0,
          "&:after": {
            content: "''",
            position: "absolute",
            left: -1,
            right: -1,
            bottom: -1,
            top: -1,
            background: isEModeDisabled
              ? "transparent"
              : theme.palette.gradients.aaveGradient,
            borderRadius: "4px",
          },
        })}
      >
        <Box
          sx={(theme) => ({
            display: "inline-flex",
            alignItems: "center",
            position: "relative",
            zIndex: 1,
            bgcolor: isEModeDisabled
              ? open
                ? theme.palette.background.disabled
                : theme.palette.background.surface
              : theme.palette.background.paper,
            px: "4px",
            borderRadius: "4px",
          })}
        >
          <SvgIcon
            sx={{
              fontSize: iconButtonSize,
              mr: "4px",
              color: isEModeDisabled ? "text.muted" : "text.primary",
            }}
          >
            {isEModeDisabled ? (
              <LightningBoltIcon />
            ) : (
              <LightningBoltGradient />
            )}
          </SvgIcon>

          {isEModeDisabled ? (
            <Typography variant="buttonS" color="text.secondary">
              <EModeLabelMessage />
            </Typography>
          ) : (
            <TypographyGradient variant="buttonS">
              <EModeLabelMessage />
            </TypographyGradient>
          )}

          <SvgIcon
            sx={{
              fontSize: iconButtonSize,
              ml: "4px",
              color: "primary.light",
            }}
          >
            <CogIcon />
          </SvgIcon>
        </Box>
      </Button>

      <Menu
        open={open}
        anchorEl={anchorEl}
        sx={{ ".MuiMenu-paper": { maxWidth: "280px" } }}
        onClose={handleClose}
        keepMounted={true}
      >
        <Box sx={{ px: 16, pt: 8, pb: 12 }}>
          <Typography variant="subheader1" mb={isEModeDisabled ? 1 : 3}>
            <span>Efficiency mode (E-Mode)</span>
          </Typography>

          {!isEModeDisabled && (
            <Box>
              <Typography mb={1} variant="caption" color="text.secondary">
                <span>Asset category</span>
              </Typography>

              <Box
                sx={(theme) => ({
                  p: 2,
                  mb: 3,
                  borderRadius: "6px",
                  border: `1px solid ${theme.palette.divider}`,
                })}
              >
                <Row
                  caption={
                    <Box sx={{ display: "inline-flex", alignItems: "center" }}>
                      <SvgIcon
                        sx={{
                          fontSize: iconButtonSize,
                          mr: 1,
                        }}
                      >
                        <LightningBoltGradient />
                      </SvgIcon>
                      <Typography variant="subheader2" color="text.primary">
                        <EModeLabelMessage />
                      </Typography>
                    </Box>
                  }
                >
                  <Box sx={{ display: "inline-flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        bgcolor: "success.main",
                        boxShadow:
                          "0px 2px 1px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.25)",
                        mr: "5px",
                      }}
                    />
                    <Typography variant="subheader2" color="success.main">
                      <span>Enabled</span>
                    </Typography>
                  </Box>
                </Row>
              </Box>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary" mb={4}>
            <span>
              E-Mode increases your LTV for a selected category of assets up to
              97%.{" "}
              <Link
                href="https://docs.aave.com/faq/aave-v3-features#high-efficiency-mode-e-mode"
                sx={{ textDecoration: "underline" }}
                variant="caption"
                color="text.secondary"
              >
                Learn more
              </Link>
            </span>
          </Typography>

          {isEModeDisabled ? (
            <Button
              fullWidth
              variant={"gradient"}
              onClick={() => {
                openEmode(EmodeModalType.ENABLE)
                handleClose()
              }}
              data-cy={"emode-enable"}
            >
              <span>Enable E-Mode</span>
            </Button>
          ) : (
            <>
              {eModes > 2 && (
                <Button
                  fullWidth
                  sx={{ mb: "6px" }}
                  variant={"outlined"}
                  onClick={() => {
                    openEmode(EmodeModalType.SWITCH)
                    handleClose()
                  }}
                  data-cy={"emode-switch"}
                >
                  <span>Switch E-Mode category</span>
                </Button>
              )}
              <Button
                fullWidth
                variant={"outlined"}
                onClick={() => {
                  openEmode(EmodeModalType.DISABLE)
                  handleClose()
                }}
                data-cy={"emode-disable"}
              >
                <span>Disable E-Mode</span>
              </Button>
            </>
          )}
        </Box>
      </Menu>
    </Box>
  )
}
