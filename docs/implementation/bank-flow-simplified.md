# Simplified bank-flow preview

The bank modal now opens the **Simplified** variant. **Current flow** and **Version 2** remain in the existing bottom switcher for immediate comparison and rollback. No on-chain or CEX flow is changed by this implementation.

## Behavior

- Progress uses the shared Stepper in `OnrampModalTopContent`, above the modal header. Shared modal chrome, separators and Summary rows retain the app's tokens and responsive behavior.
- Deposit goes from amount to setup or existing account details without an additional planned-transfer review. The Bridge handoff reuses one status container. Details link to Portfolio → Deposits; receiving/queued states do not imply that HOLLAR has been credited.
- Withdrawal displays one quote consistently from amount through review and status. Simplified uses an explicitly illustrative 0.05% preview fee. Earlier variants retain their 0.5% preview fee. Unavailable provider costs/arrival estimates are not fabricated.
- In-progress setup is saved per connected wallet, and can be reopened from the Deposits section or the existing Notifications panel. Ready bank details use a different resume label. Only preview configuration is stored in `hydration-bank-setup-preview-v1`; no bank credentials or transfer-history records are stored.
- Transfer status exploration remains under explicitly labeled preview controls. It does not add records to Portfolio history. Existing preview notices are retained.

## Reverting the default

Change the initial `BankFlowVariant` in `useBankDepositFlow.ts` and `BankWithdraw.tsx` from `simplified` to `v2` or `current`. The earlier implementations remain intact. Remove the two `BankSetupResume` integration points in `PortfolioDepositsSection.tsx` and `NotificationCenter.tsx` to hide resume UI. The isolated preview storage key can be removed without affecting wallet connection or transfer history.

## API handoff

This remains a UI preview. Replace wallet-scoped setup drafts with authenticated provider process data; the resume component must reopen that process. Feed observed status into the progress mapping, supply one final provider quote to all withdrawal screens, and only show fee/time rows when supplied. Do not treat local drafts, preview state transitions, or demo account details as real bank transfers. Withdrawal history/resume requires the future bank-history/provider adapter; no synthetic history is created here.

## Verification (2026-10-30)

- `yarn lint`: all 11 workspace checks pass; final tracking typography adjustment also passes app ESLint/typecheck.
- 13 focused tests pass for quotes, provider handoff actions and observed deposit progression.
- Headless Chrome rendered the actual bank components in the existing modal shell at 1440px and 390px. Checked top progress placement, no planned-transfer review, compact provider return, setup restoration after reload, consistent payout through review/status, bank-details CTA and legacy-variant switching.
- The full live page currently stops at its initial data-loading shell in a fresh headless browser. Component captures therefore use browser-only wallet/provider fixtures; they do not verify provider APIs, signing, or live Portfolio/Notification data loading.
