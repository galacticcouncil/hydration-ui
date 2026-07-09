import assert from "node:assert/strict"

import {
  buildAddresses,
  getAllAddresses,
  isVisibleToWallet,
  selectAddresses,
} from "./AddressBook.merge"
import type { Address } from "./AddressBook.store"

// ponytail: standalone assert self-check, no framework. Run from this package:
//   ../../node_modules/.bin/esbuild \
//     src/components/address-book/AddressBook.selfcheck.ts \
//     --bundle --platform=node --format=cjs \
//     '--external:@galacticcouncil/sdk-next' '--external:@galacticcouncil/math-*' \
//     --outfile=.selfcheck.cjs && node .selfcheck.cjs && rm .selfcheck.cjs
// AddressBook.merge imports normalizePublicKey from @/utils/publicKey, which
// pulls @galacticcouncil/utils (xc-core) transitively — hence the externals.

const WALLET_1 = "wallet-1-pubkey"
const WALLET_2 = "wallet-2-pubkey"

function custom(key: string): Address {
  return {
    publicKey: key,
    address: key,
    name: "test",
    provider: "metamask" as Address["provider"],
    mode: "evm" as Address["mode"],
    savedBy: [],
    isCustom: true,
  }
}

// 1. New owned add: saved while connected -> savedBy = [connected]
{
  const [entry] = buildAddresses([], [custom("a")], WALLET_1)
  assert.deepEqual(entry!.savedBy, [WALLET_1])
}

// 2. Disconnected global add: no wallet -> savedBy = []
{
  const [entry] = buildAddresses([], [custom("a")], null)
  assert.deepEqual(entry!.savedBy, [])
}

// 2b. Own-account sync (isCustom falsy) is never gated, even when connected.
{
  const sync: Address = { ...custom("b"), isCustom: false, savedBy: [] }
  const [entry] = buildAddresses([], [sync], WALLET_1)
  assert.deepEqual(entry!.savedBy, [])
}

// 3. Reuse from a second wallet: append to savedBy, no duplicate row.
{
  const first = buildAddresses([], [custom("a")], WALLET_1)
  const second = buildAddresses(first, [custom("a")], WALLET_2)
  assert.equal(second.length, 1)
  assert.deepEqual(second[0]!.savedBy, [WALLET_1, WALLET_2])

  // re-adding from a wallet already in savedBy is a no-op (deduped union).
  const third = buildAddresses(second, [custom("a")], WALLET_1)
  assert.deepEqual(third[0]!.savedBy, [WALLET_1, WALLET_2])
}

// 3b. Manually saving an existing synced address promotes it to custom so
// filtered views such as tracked wallets can display it.
{
  const synced: Address = {
    ...custom("a"),
    name: "Synced account",
    isCustom: false,
    savedBy: [],
  }
  const [entry] = buildAddresses([synced], [custom("a")], WALLET_1)

  assert.equal(entry!.isCustom, true)
  assert.equal(entry!.name, "Synced account")
  assert.deepEqual(entry!.savedBy, [WALLET_1])
}

// selectAddresses: each filter axis + combinations.
{
  // Cast literals via the indexed type to avoid importing the enum value.
  const EVM = "evm" as Address["mode"]
  const SUB = "substrate" as Address["mode"]

  const make = (over: Partial<Address>) => ({ ...custom("x"), ...over })

  const evmGlobal = make({ publicKey: "1", mode: EVM, savedBy: [] })
  const evmOwned = make({
    publicKey: "2",
    mode: EVM,
    savedBy: [WALLET_1],
  })
  const subOther = make({
    publicKey: "3",
    mode: SUB,
    savedBy: [WALLET_2],
  })
  const subSync = make({
    publicKey: "4",
    mode: SUB,
    savedBy: [],
    isCustom: false,
  })
  const all = [evmGlobal, evmOwned, subOther, subSync]

  const keys = (xs: Address[]) => xs.map((a) => a.publicKey).sort()

  // omitted filter -> no constraint
  assert.deepEqual(keys(selectAddresses(all, {}, WALLET_1)), [
    "1",
    "2",
    "3",
    "4",
  ])

  // mode axis
  assert.deepEqual(keys(selectAddresses(all, { mode: EVM }, WALLET_1)), [
    "1",
    "2",
  ])

  // isCustom axis (false matches the own-account sync)
  assert.deepEqual(keys(selectAddresses(all, { isCustom: false }, WALLET_1)), [
    "4",
  ])
  assert.deepEqual(keys(selectAddresses(all, { isCustom: true }, WALLET_1)), [
    "1",
    "2",
    "3",
  ])

  // related: true -> global entries + entries owned by connected.
  assert.deepEqual(keys(selectAddresses(all, { related: true }, WALLET_1)), [
    "1",
    "2",
    "4",
  ])

  // related: false -> entries saved by another wallet only.
  assert.deepEqual(keys(selectAddresses(all, { related: false }, WALLET_1)), [
    "3",
  ])

  // disconnected -> global entries are still related.
  assert.deepEqual(keys(selectAddresses(all, { related: true }, null)), [
    "1",
    "4",
  ])

  // combination: global + owned EVM contacts only
  assert.deepEqual(
    keys(selectAddresses(all, { mode: EVM, related: true }, WALLET_1)),
    ["1", "2"],
  )
}

// Model X visibility: global + own-saved visible; other-saved hidden; syncs
// always visible; disconnected sees only global.
{
  const global = { ...custom("g"), savedBy: [] }
  const owned = { ...custom("o"), savedBy: [WALLET_1] }
  const other = { ...custom("x"), savedBy: [WALLET_2] }
  const sync: Address = { ...custom("s"), savedBy: [WALLET_2], isCustom: false }

  assert.equal(isVisibleToWallet(global, WALLET_1), true)
  assert.equal(isVisibleToWallet(owned, WALLET_1), true)
  assert.equal(isVisibleToWallet(other, WALLET_1), false)
  assert.equal(isVisibleToWallet(sync, WALLET_1), true)

  // disconnected -> only global custom contacts
  assert.equal(isVisibleToWallet(global, null), true)
  assert.equal(isVisibleToWallet(owned, null), false)
}

{
  const named = custom("named")
  const unnamedSui = {
    ...custom("sui-1"),
    name: "",
    mode: "sui" as Address["mode"],
  }
  const unnamedSui2 = {
    ...custom("sui-2"),
    name: "",
    mode: "sui" as Address["mode"],
  }
  const unnamedSolana = {
    ...custom("sol-1"),
    name: "",
    mode: "solana" as Address["mode"],
  }

  const unnamedNear = {
    ...custom("crypthor.near"),
    name: "",
    address: "crypthor.near",
    mode: "near" as Address["mode"],
  }

  assert.equal(getAllAddresses([named])[0]?.name, "test")
  assert.equal(getAllAddresses([unnamedNear])[0]?.name, "crypthor")
  assert.equal(getAllAddresses([unnamedSui])[0]?.name, "Sui 1")
  assert.deepEqual(
    getAllAddresses([unnamedSui, unnamedSui2, unnamedSolana]).map(
      (a) => a.name,
    ),
    ["Sui 1", "Sui 2", "Solana 1"],
  )
}

// normalizeAddress mode resolution: explicit input.mode overrides the derived
// value; omitted -> derive from the address; null derive -> reject.
// ponytail: replicates normalizeAddress's `input.mode ?? derive(address)` rule
// without importing the store (which pulls heavy SDK/ui deps that break this
// standalone bundle — see US-003). Keep in sync with AddressBook.store.ts.
{
  type Mode = Address["mode"]
  const resolveMode = (
    input: { address: string; mode?: Mode },
    derive: (address: string) => Mode | null,
  ): Mode | null => input.mode ?? derive(input.address)

  // derive-default: no explicit mode -> uses the derived value
  assert.equal(
    resolveMode({ address: "0xabc" }, () => "evm" as Mode),
    "evm",
  )

  // explicit override: SubstrateH160 on an H160 address wins over derived EVM
  assert.equal(
    resolveMode(
      { address: "0xabc", mode: "substrate-h160" as Mode },
      () => "evm" as Mode,
    ),
    "substrate-h160",
  )

  // null derive + no explicit mode -> rejected (null)
  assert.equal(
    resolveMode({ address: "garbage" }, () => null),
    null,
  )
}

// eslint-disable-next-line no-console
console.log("AddressBook savedBy/merge/select selfcheck OK")
