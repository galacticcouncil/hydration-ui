import { GitHub, Twitter } from "@mui/icons-material"
import { Box, styled, SvgIcon, Typography } from "@mui/material"
import { Link } from "sections/lending/components/primitives/Link"

import DiscordIcon from "sections/lending/assets/icons/discord.svg?react"
import LensLogoIcon from "sections/lending/assets/icons/lens-logo.svg?react"

interface StyledLinkProps {
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
}

const StyledLink = styled(Link)<StyledLinkProps>(({ theme }) => ({
  color: theme.palette.text.muted,
  "&:hover": {
    color: theme.palette.text.primary,
  },
  display: "flex",
  alignItems: "center",
}))

const FOOTER_ICONS = [
  {
    href: "https://hey.xyz/u/aaveaave",
    icon: <LensLogoIcon />,
    title: "Aave",
  },
  {
    href: "https://twitter.com/aave",
    icon: <Twitter />,
    title: "Lens",
  },
  {
    href: "https://discord.com/invite/aave",
    icon: <DiscordIcon />,
    title: "Discord",
  },
  {
    href: "https://github.com/aave",
    icon: <GitHub />,
    title: "Github",
  },
]

export function AppFooter() {
  const FOOTER_LINKS = [
    {
      href: "https://aave.com/term-of-use/",
      label: <span>Terms</span>,
      key: "Terms",
    },
    {
      href: "https://aave.com/privacy-policy/",
      label: <span>Privacy</span>,
      key: "Privacy",
    },
    {
      href: "https://docs.aave.com/hub/",
      label: <span>Docs</span>,
      key: "Docs",
    },
    {
      href: "https://docs.aave.com/faq/",
      label: <span>FAQS</span>,
      key: "FAQS",
    },
    {
      href: "https://discord.com/invite/aave",
      label: <span>Send feedback</span>,
      key: "Send feedback",
    },
    {
      href: "",
      label: <span>Manage analytics</span>,
      key: "Manage analytics",
    },
  ]

  return (
    <Box
      sx={(theme) => ({
        display: "flex",
        padding: ["22px 0px 40px 0px", "0 22px 0 40px", "20px 22px"],
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "22px",
        flexDirection: ["column", "column", "row"],
        boxShadow:
          theme.palette.mode === "light"
            ? "inset 0px 1px 0px rgba(0, 0, 0, 0.04)"
            : "inset 0px 1px 0px rgba(255, 255, 255, 0.12)",
      })}
    >
      <Box sx={{ display: "flex", gap: "10px", alignItems: "center" }}>
        {FOOTER_LINKS.map((link) => (
          <StyledLink onClick={link.onClick} key={link.key} href={link.href}>
            <Typography variant="caption">{link.label}</Typography>
          </StyledLink>
        ))}
      </Box>
      <Box sx={{ display: "flex", gap: "10px", alignItems: "center" }}>
        {FOOTER_ICONS.map((icon) => (
          <StyledLink href={icon.href} key={icon.title}>
            <SvgIcon
              sx={{
                fontSize: [24, 24, 20],
              }}
            >
              {icon.icon}
            </SvgIcon>
          </StyledLink>
        ))}
      </Box>
    </Box>
  )
}
