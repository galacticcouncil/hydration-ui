import "interfaces/augment-bignumber"

import { expect, test } from "vitest"
import { TypeRegistry, U32 } from "@polkadot/types"

import BN from "bignumber.js"
import BigNumber from "bignumber.js"
import { getAccountResolver } from "./accountResolver"
import { MultiCurrencyContainer } from "./multiCurrency"

const registry = new TypeRegistry()

const asset = new U32(registry, 0)

const accountResolver = getAccountResolver(registry)
const walletA = accountResolver(0)
const walletB = accountResolver(1)

test("read multi currency container", () => {
  const multiCurrency = new MultiCurrencyContainer(
    [[walletA, asset]],
    [
      {
        free: new BigNumber(0),
        reserved: new BigNumber(0),
        frozen: new BigNumber(0),
      },
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
      {
        free: new BigNumber(0),
        reserved: new BigNumber(0),
        frozen: new BigNumber(0),
      },
      {
        free: new BigNumber(0),
        reserved: new BigNumber(0),
        frozen: new BigNumber(0),
      },
    ],
  )

  multiCurrency.transfer(asset, walletA, walletB, new BN(128))

  expect(multiCurrency.free_balance(asset, walletA).toFixed()).toEqual("0")
  expect(multiCurrency.free_balance(asset, walletB).toFixed()).toEqual("256")

  expect(() =>
    multiCurrency.transfer(asset, walletA, walletB, new BN(128)),
  ).toThrowError()
})
