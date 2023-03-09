import "interfaces/augment-bignumber"

import { expect, test } from "vitest"
import { TypeRegistry, U128, U32 } from "@polkadot/types"
import { OrmlTokensAccountData } from "@polkadot/types/lookup"

import BN from "bignumber.js"

import { getAccountResolver } from "./accountResolver"
import { MultiCurrencyContainer } from "./multiCurrency"
import { createStruct } from "utils/test/createTestApi"

const registry = new TypeRegistry()

const asset = new U32(registry, 0)

const accountResolver = getAccountResolver(registry)
const walletA = accountResolver(0)
const walletB = accountResolver(1)

test("read multi currency container", () => {
  const multiCurrency = new MultiCurrencyContainer(
    [[walletA, asset]],
    [
      createStruct<OrmlTokensAccountData>(registry, {
        free: [U128, new U128(registry, 128)],
        reserved: [U128, new U128(registry, 256)],
        frozen: [U128, new U128(registry, 512)],
      }),
    ],
  )

  expect(multiCurrency.free_balance(asset, walletA).toFixed()).toEqual("128")
})

test("transfer multi currency container", () => {
  const multiCurrency = new MultiCurrencyContainer(
    [
      [walletA, asset],
      [walletB, asset],
    ],
    [
      createStruct<OrmlTokensAccountData>(registry, {
        free: [U128, new U128(registry, "128")],
        reserved: [U128, new U128(registry, "256")],
        frozen: [U128, new U128(registry, "512")],
      }),
      createStruct<OrmlTokensAccountData>(registry, {
        free: [U128, new U128(registry, 128)],
        reserved: [U128, new U128(registry, 256)],
        frozen: [U128, new U128(registry, 512)],
      }),
    ],
  )

  multiCurrency.transfer(asset, walletA, walletB, new BN(128))

  expect(multiCurrency.free_balance(asset, walletA).toFixed()).toEqual("0")
  expect(multiCurrency.free_balance(asset, walletB).toFixed()).toEqual("256")

  expect(() =>
    multiCurrency.transfer(asset, walletA, walletB, new BN(128)),
  ).toThrowError()
})
