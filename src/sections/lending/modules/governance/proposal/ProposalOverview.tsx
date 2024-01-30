import { DownloadIcon } from "@heroicons/react/solid"

import { Twitter } from "@mui/icons-material"
import {
  Box,
  Button,
  Paper,
  Skeleton,
  styled,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { LensIcon } from "sections/lending/components/icons/LensIcon"
import { Warning } from "sections/lending/components/primitives/Warning"
import { EnhancedProposal } from "sections/lending/hooks/governance/useProposal"
// import { FormattedProposalTime } from 'sections/lending/modules/governance/FormattedProposalTime';
import { StateBadge } from "sections/lending/modules/governance/StateBadge"
// import { IpfsType } from 'sections/lending/static-build/ipfs';
// import { CustomProposalType } from 'sections/lending/static-build/proposal';
import { ipfsGateway } from "sections/lending/ui-config/governanceConfig"

const CenterAlignedImage = styled("img")({
  display: "block",
  margin: "0 auto",
  maxWidth: "100%",
})

const StyledLink = styled("a")({
  color: "inherit",
})

interface ProposalOverviewProps {
  error: boolean
  proposal?: EnhancedProposal
  loading: boolean
}

export const ProposalOverview = ({
  proposal,
  loading,
  error,
}: ProposalOverviewProps) => {
  const { breakpoints, palette } = useTheme()
  const lgUp = useMediaQuery(breakpoints.up("lg"))

  return (
    <Paper sx={{ px: 6, pt: 4, pb: 12 }} data-cy="vote-info-body">
      <Typography variant="h3">
        <span>Proposal overview</span>
      </Typography>
      {error ? (
        <Box sx={{ px: { md: 18 }, pt: 8 }}>
          <Warning severity="error">
            <span>An error has occurred fetching the proposal.</span>
          </Warning>
        </Box>
      ) : (
        <Box sx={{ px: { md: 18 }, pt: 8, wordBreak: "break-word" }}>
          {proposal ? (
            <>
              <Typography variant="h2" sx={{ mb: 24 }}>
                {proposal.proposal.proposalMetadata.title || <Skeleton />}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ mr: "24px", mb: { xs: "2px", sm: 0 } }}>
                    <StateBadge
                      state={proposal.proposal.state}
                      loading={loading}
                    />
                  </Box>

                  {/*
                   !loading && (
                     <FormattedProposalTime
                       state={proposal.state}
                       executionTime={proposal.executionTime}
                       startTimestamp={proposal.startTimestamp}
                       executionTimeWithGracePeriod={proposal.executionTimeWithGracePeriod}
                       expirationTimestamp={proposal.expirationTimestamp}
                     />

                     )
                     */}
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  component="a"
                  sx={{ minWidth: lgUp ? "160px" : "" }}
                  target="_blank"
                  rel="noopener"
                  href={`${ipfsGateway}/${proposal.proposal.ipfsHash}`}
                  startIcon={
                    <SvgIcon sx={{ "& path": { strokeWidth: "1" } }}>
                      <DownloadIcon />
                    </SvgIcon>
                  }
                >
                  {lgUp && <span>Raw-Ipfs</span>}
                </Button>
                <Button
                  component="a"
                  sx={{ minWidth: lgUp ? "160px" : "" }}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    proposal.proposal.proposalMetadata.title,
                  )}&url=${window.location.href}`}
                  startIcon={<Twitter />}
                >
                  {lgUp && <span>Share on twitter</span>}
                </Button>
                <Button
                  sx={{ minWidth: lgUp ? "160px" : "" }}
                  component="a"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://hey.xyz/?url=${window.location.href}&text=Check out this proposal on aave governance 👻👻 - ${proposal.proposal.proposalMetadata.title}&hashtags=Aave&preview=true`}
                  startIcon={
                    <LensIcon
                      color={
                        palette.mode === "dark"
                          ? palette.primary.light
                          : palette.text.primary
                      }
                    />
                  }
                >
                  {lgUp && <span>Share on Lens</span>}
                </Button>
              </Box>
            </>
          ) : (
            <Typography variant="buttonL">
              <Skeleton />
            </Typography>
          )}
          {proposal ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table({ node, ...props }) {
                  return (
                    <TableContainer component={Paper} variant="outlined">
                      <Table {...props} sx={{ wordBreak: "normal" }} />
                    </TableContainer>
                  )
                },
                tr({ node, ...props }) {
                  return (
                    <TableRow
                      css={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    />
                  )
                },
                td({ children, style }) {
                  return <TableCell style={style}>{children}</TableCell>
                },
                th({ children, style }) {
                  return <TableCell style={style}>{children}</TableCell>
                },
                tbody({ children }) {
                  return <TableBody>{children}</TableBody>
                },
                thead({ node, ...props }) {
                  return <TableHead {...props} />
                },
                img({ src: _src, alt }) {
                  if (!_src) return null
                  const src = /^\.\.\//.test(_src)
                    ? _src.replace(
                        "../",
                        "https://raw.githubusercontent.com/aave/aip/main/content/",
                      )
                    : _src
                  return <CenterAlignedImage src={src} alt={alt} />
                },
                a({ node, ...rest }) {
                  return <StyledLink {...rest} />
                },
                h2({ node, ...rest }) {
                  return (
                    <Typography
                      variant="subheader1"
                      sx={{ mt: 24 }}
                      gutterBottom
                      {...rest}
                    />
                  )
                },
                p({ node, ...rest }) {
                  return <Typography variant="description" {...rest} />
                },
              }}
            >
              {proposal.proposal.proposalMetadata.description}
            </ReactMarkdown>
          ) : (
            <>
              <Skeleton variant="text" sx={{ my: 16 }} />
              <Skeleton variant="rectangular" height={200} sx={{ my: 16 }} />
              <Skeleton variant="text" sx={{ my: 16 }} />
              <Skeleton variant="rectangular" height={400} sx={{ my: 16 }} />
            </>
          )}
        </Box>
      )}
    </Paper>
  )
}
