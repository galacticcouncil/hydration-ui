# Hydration UI

The web app for the Hydration parachain: trading, liquidity, lending and yield strategies.

## Multiply

**Multiply**:
A strategy that borrows against a deposit and buys more of the collateral with what it borrows, repeating until the position reaches a chosen leverage. This is the name users see.
_Avoid_: Looping, Loop, Leverage strategy

**Multiply pair**:
A collateral asset and a debt asset that can be multiplied together, e.g. PRIME/HOLLAR. Each pair gets its own strategy card.
_Avoid_: Strategy, market

**Multiply position**:
One user's leveraged holding in a Multiply pair, owned by whoever holds its position NFT.
_Avoid_: Proxy, vault, loop

**Target leverage**:
The leverage chosen when a Multiply position is opened. It is fixed for the life of the position.
_Avoid_: Multiplier

**Ladder**:
The series of steps a Multiply position takes to reach its target leverage (a ramp) or to come back down from it (an unwind).

**Rung**:
One step of a ladder: a single swap through an intent, followed by the matching borrow or repay.

**Stall**:
A ladder that has stopped before finishing, together with the reason it stopped. The owner has to act to move it on. Users see it as **Paused**.
_Avoid_: Error, failure

**Position status**:
What users see about a Multiply position's ladder: Active, Building, Withdrawing, Closing or Paused.
_Avoid_: State, phase

**Looper**:
The on-chain contracts behind Multiply. This is an internal name and never appears in the UI. It is unrelated to Juicer's keeper bot of the same name.
