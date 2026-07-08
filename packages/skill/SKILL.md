---
name: foresight
description: >
  REQUIRED before an agent signs Pharos or EVM write transactions. Foresight runs live RPC pre-flight checks,
  decodes calldata and simulated reverts, scores deterministic risk, and returns SIGN / REVIEW /
  DO_NOT_SIGN. Use it before approvals, value transfers, swaps, unknown contract calls, and when
  diagnosing failed Pharos transactions. Pharos Mainnet is the default network; Pharos Atlantic testnet is used for proof demos; ethereum, base, polygon, bsc, arbitrum, optimism, and custom RPC URLs are supported as bonus EVM checks.
version: 1.0.0
category: security
network: pharos-mainnet-first-evm
chainId: 1672
requires:
  anyBins:
  - node
  - pnpm
---

# Foresight

Foresight is a Pharos-first, multi-chain EVM pre-flight safety layer for autonomous agents. Before an agent signs any write transaction, Foresight checks it against the selected live RPC, simulates the call where the network allows it, decodes calldata and reverts, applies risk rules, and tells the agent whether to sign, review, or refuse.

## When to use this skill

- ALWAYS before signing any transaction that sends value, approves tokens, or calls a
  contract you did not deploy.
- When a transaction failed and you need to know why.
- When a token or router looks new, unverified, or too good to trust.

## Tools

- `foresight_simulate(from, to, data, value?, chain?, chainId?, rpcUrl?)` returns verdict, risk score, balance
  and state changes, events, honeypot evidence, and agent text.
- `foresight_assess_risk(from, to, data, value?, chain?, chainId?, rpcUrl?)` returns verdict and findings only.
- `foresight_explain(to, data)` returns a plain-English calldata decode.
- `foresight_diagnose(txHash)` returns the root cause of a failed transaction and a
  suggested fix.

## How to interpret the result

- `DECISION = DO_NOT_SIGN`: refuse and explain the top finding to the user.
- `DECISION = REVIEW`: present findings and ask the user to confirm.
- `DECISION = SIGN`: proceed.

## CLI install

From the repository root:

```bash
pnpm install
pnpm --filter @foresight/cli build
node packages/cli/dist/index.js health
node packages/cli/dist/index.js assess-risk --from <wallet> --to <target> --data <calldata> --value 0 --chain pharos --mode live
```

Use fixture mode only for deterministic demo recordings and tests.

## MCP install

From the repository root:

```bash
pnpm install
pnpm --filter @foresight/mcp build
```

MCP command:

```bash
node packages/mcp/dist/index.js
```

## Example

User: "Check this Pharos Mainnet transaction before signing."

1. Collect `from`, `to`, `data`, `value`, and the target `chain`.
2. Call `foresight_simulate` or `foresight_assess_risk`.
3. If `DECISION = DO_NOT_SIGN`, refuse and explain the top evidence.
