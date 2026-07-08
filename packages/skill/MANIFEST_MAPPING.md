# Manifest Mapping

The official Pharos Skill Engine v0.1.0 package downloaded during research uses a
markdown skill format:

- `SKILL.md` with YAML frontmatter
- `assets/` for network and token metadata
- `references/` markdown files for capability-specific instructions

No standalone JSON manifest was present in the official package. Foresight therefore
ships `SKILL.md` as the primary Pharos-compatible skill file and includes
`manifest.json` as a supplemental reviewer/MCP manifest.

## Official Field Mapping

| Official `SKILL.md` field | Foresight value |
| --- | --- |
| `name` | `foresight` |
| `description` | Pharos-first EVM pre-flight skill for write transactions |
| `version` | `1.0.0` |
| `requires.anyBins` | `node`, `pnpm` |

## Network Mapping

Foresight defaults to Pharos Mainnet for normal pre-sign checks:

- default chain ID `1672`
- default RPC `https://rpc.pharos.xyz`
- explorer `https://pharosscan.xyz/`
- proof/demo network `pharos-testnet` / `atlantic`, chain ID `688689`

## Tool Mapping

| Foresight MCP tool | Skill capability |
| --- | --- |
| `foresight_simulate` | Pre-sign transaction simulation and verdict |
| `foresight_assess_risk` | Risk-only report |
| `foresight_explain` | Calldata decoding |
| `foresight_diagnose` | Failed transaction autopsy |

If a future Pharos Agent Center release introduces a stricter manifest schema,
`manifest.json` can be adapted without changing the engine. The MCP server and HTTP
server both call the same pure TypeScript engine functions.


## Multi-chain note

Pharos Mainnet is the default user network. Pharos Atlantic remains the official proof network for deployed demo contracts. Generic pre-sign checks also accept `chain`, `chainId`, and `rpcUrl` for ethereum, base, polygon, bsc, arbitrum, optimism, or custom EVM RPCs.
