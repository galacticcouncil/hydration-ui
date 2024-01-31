import { ExclamationCircleIcon, LogoutIcon } from "@heroicons/react/outline"
import { Box, Button, SvgIcon, Typography } from "@mui/material"

import { BasicModal } from "./primitives/BasicModal"
import { Link } from "./primitives/Link"

export interface AddressBlockedProps {
  address: string
  onDisconnectWallet: () => void
}

export const AddressBlockedModal = ({
  address,
  onDisconnectWallet,
}: AddressBlockedProps) => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  const setOpen = (_value: boolean) => {} // ignore, we want the modal to not be dismissable

  return (
    <BasicModal open={true} withCloseButton={false} setOpen={setOpen}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <SvgIcon sx={{ fontSize: "24px", color: "warning.main", mb: 8 }}>
          <ExclamationCircleIcon />
        </SvgIcon>
        <Typography variant="h2">
          <span>Blocked Address</span>
        </Typography>
        <Typography variant="helperText" sx={{ my: 16 }}>
          {address}
        </Typography>
        <Typography variant="description" sx={{ textAlign: "center", mb: 16 }}>
          <span>
            This address is blocked on app.aave.com because it is associated
            with one or more
          </span>{" "}
          <Link
            href="https://docs.aave.com/faq/#address-screening"
            underline="always"
          >
            <span>blocked activities</span>
          </Link>
          {"."}
        </Typography>
        <Button variant="contained" onClick={onDisconnectWallet}>
          <SvgIcon fontSize="small" sx={{ mx: 4 }}>
            <LogoutIcon />
          </SvgIcon>
          <span>Disconnect Wallet</span>
        </Button>
      </Box>
    </BasicModal>
  )
}
