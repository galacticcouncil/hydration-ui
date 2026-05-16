// Vendored verbatim from upstream
// `packages/common/src/filters/address-filter.ts`.
export class AddressFilter {
  private static allowlist: Optional<string[]>
  private static blocklist: Optional<string[]>

  static setAllowlist(allowlist: Optional<string[]>) {
    this.allowlist = allowlist
  }

  static setBlocklist(blocklist: Optional<string[]>) {
    this.blocklist = blocklist
  }

  static filter(addresses: string[]): string[] {
    return addresses
      .filter((address) => {
        return !this.allowlist || this.allowlist.includes(address)
      })
      .filter((address) => {
        return !this.blocklist || !this.blocklist.includes(address)
      })
      .sort()
  }
}
