import { encodeFunctionData } from "viem"
import { describe, expect, it } from "vitest"

import { UNIPROXY_ABI } from "@/api/gamma/abi"
import { BIL_POOL_ABI } from "@/modules/strategies/bil/config/abi"
import { AnyTransaction } from "@/modules/transactions/types"

import {
  decodeEvmInputs,
  decodeReviewTx,
} from "./ReviewTransactionJsonView.utils"

const ADDR = "0x20aa5d9fff339c3f1acaee792aa05c53ceb3f741"

describe("decodeEvmInputs", () => {
  it("decodes known EVM.call inputs inside a batch, leaves unknown ones as hex", () => {
    const deposit = encodeFunctionData({
      abi: UNIPROXY_ABI,
      functionName: "deposit",
      args: [1n, 2n, ADDR, ADDR, [0n, 0n, 0n, 0n]],
    })

    const json = {
      "Utility.batch_all": {
        calls: [
          { "EVM.call": { target: ADDR, input: deposit } },
          { "EVM.call": { target: ADDR, input: "0xdeadbeef" } },
        ],
      },
    }

    expect(decodeEvmInputs(json)).toEqual({
      "Utility.batch_all": {
        calls: [
          {
            "EVM.call": {
              target: ADDR,
              input: {
                deposit: {
                  deposit0: "1",
                  deposit1: "2",
                  to: expect.stringMatching(new RegExp(ADDR, "i")),
                  pos: expect.stringMatching(new RegExp(ADDR, "i")),
                  minIn: ["0", "0", "0", "0"],
                },
              },
            },
          },
          { "EVM.call": { target: ADDR, input: "0xdeadbeef" } },
        ],
      },
    })
  })
})

describe("decodeEvmCall", () => {
  it("names args from the selector's function when names collide", () => {
    const input = encodeFunctionData({
      abi: BIL_POOL_ABI,
      functionName: "withdraw",
      args: [ADDR, 5n, ADDR],
    })

    expect(decodeEvmInputs({ "EVM.call": { input } })).toMatchObject({
      "EVM.call": {
        input: { withdraw: { asset: expect.any(String), amount: "5" } },
      },
    })
  })
})

describe("decodeReviewTx", () => {
  it("evm mode lists only the EVM call inputs of a batched extrinsic", () => {
    const input = encodeFunctionData({
      abi: BIL_POOL_ABI,
      functionName: "withdraw",
      args: [ADDR, 5n, ADDR],
    })
    const evmCall = (input: string) => ({
      type: "EVM",
      value: { type: "call", value: { target: ADDR, input } },
    })
    const tx = {
      signSubmitAndWatch: () => {},
      decodedCall: {
        type: "Utility",
        value: {
          type: "batch_all",
          value: { calls: [evmCall(input), evmCall("0xdeadbeef")] },
        },
      },
    } as unknown as AnyTransaction

    expect(decodeReviewTx(tx, undefined, "evm")).toMatchObject([
      { withdraw: { amount: "5" } },
      "0xdeadbeef",
    ])
    expect(decodeReviewTx(tx, undefined, "substrate")).toMatchObject({
      "Utility.batch_all": {
        calls: [{ "EVM.call": { input: { withdraw: { amount: "5" } } } }, {}],
      },
    })
  })
})
