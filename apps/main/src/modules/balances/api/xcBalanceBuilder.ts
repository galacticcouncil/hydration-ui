const MIN_ACCOUNTS = 1
const MAX_ACCOUNTS = 5

export type XcBalanceCriteria = {
  account: string | string[]
}

export type XcBalanceRequest = {
  criteria: XcBalanceCriteria
}

export type XcBalanceBuildOptions = {
  validate?: boolean
}

export class XcBalancesBuilder {
  private accountList: string[] = []

  account(address: string): this {
    this.accountList.push(address)
    return this
  }

  accounts(addresses: string[]): this {
    this.accountList.push(...addresses)
    return this
  }

  private validate(): void {
    if (this.accountList.length < MIN_ACCOUNTS) {
      throw new Error("At least one account is required")
    }
    if (this.accountList.length > MAX_ACCOUNTS) {
      throw new Error(`A maximum of ${MAX_ACCOUNTS} accounts is allowed`)
    }
  }

  build(options?: XcBalanceBuildOptions): XcBalanceRequest {
    if (options?.validate) this.validate()

    const [first, ...rest] = this.accountList
    const account: string | string[] =
      rest.length === 0 && first !== undefined ? first : this.accountList

    return { criteria: { account } }
  }
}

export class XcBalanceBuilder {
  static balances(): XcBalancesBuilder {
    return new XcBalancesBuilder()
  }
}
