export function shortenAccountAddress(address: string) {
  return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`
}
