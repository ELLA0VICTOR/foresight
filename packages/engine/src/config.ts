import type { Address, ContractLabel, NetworkConfig, NetworkKey, NetworkSelection } from "./types.js";

export const DEFAULT_FORK_BLOCK = Number(process.env.FORK_BLOCK ?? 23559136);

export const PHAROS_MAINNET_CHAIN_ID = 1672;
export const PHAROS_ATLANTIC_CHAIN_ID = 688689;

export const networkConfig: NetworkConfig = {
  name: process.env.PHAROS_NETWORK_NAME ?? "atlantic-testnet",
  chainId: Number(process.env.PHAROS_CHAIN_ID ?? PHAROS_ATLANTIC_CHAIN_ID),
  rpcUrl: process.env.PHAROS_RPC_URL ?? "https://atlantic.dplabs-internal.com",
  wsUrl: process.env.PHAROS_WS_URL ?? "wss://atlantic.dplabs-internal.com",
  nativeCurrency: process.env.PHAROS_NATIVE_SYMBOL ?? "PHRS",
  explorerUrl: process.env.PHAROS_EXPLORER_URL ?? "https://atlantic.pharosscan.xyz/",
  explorerApiUrl:
    process.env.PHAROS_EXPLORER_API ??
    "https://api.socialscan.io/pharos-atlantic-testnet",
  explorerVerifyApiUrl:
    process.env.PHAROS_EXPLORER_VERIFY_API ??
    "https://api.socialscan.io/pharos-atlantic-testnet/v1/explorer/command_api/contract",
  forkBlock: DEFAULT_FORK_BLOCK,
};

export const pharosMainnetConfig: NetworkConfig = {
  name: process.env.PHAROS_MAINNET_NETWORK_NAME ?? "pharos-mainnet",
  chainId: Number(process.env.PHAROS_MAINNET_CHAIN_ID ?? PHAROS_MAINNET_CHAIN_ID),
  rpcUrl: process.env.PHAROS_MAINNET_RPC_URL ?? "https://rpc.pharos.xyz",
  nativeCurrency: process.env.PHAROS_MAINNET_NATIVE_SYMBOL ?? "PROS",
  explorerUrl: process.env.PHAROS_MAINNET_EXPLORER_URL ?? "https://pharosscan.xyz/",
};

function envNumber(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mainnetConfig(input: {
  name: string;
  chainId: number;
  rpcUrl: string;
  nativeCurrency: string;
  explorerUrl: string;
  envPrefix: string;
}): NetworkConfig {
  return {
    name: process.env[`${input.envPrefix}_NETWORK_NAME`] ?? input.name,
    chainId: envNumber(`${input.envPrefix}_CHAIN_ID`, input.chainId),
    rpcUrl: process.env[`${input.envPrefix}_RPC_URL`] ?? input.rpcUrl,
    nativeCurrency: process.env[`${input.envPrefix}_NATIVE_SYMBOL`] ?? input.nativeCurrency,
    explorerUrl: process.env[`${input.envPrefix}_EXPLORER_URL`] ?? input.explorerUrl,
  };
}

export const supportedNetworks: Record<NetworkKey, NetworkConfig> = {
  pharos: pharosMainnetConfig,
  "pharos-mainnet": pharosMainnetConfig,
  "pharos-testnet": networkConfig,
  atlantic: networkConfig,
  ethereum: mainnetConfig({
    name: "ethereum-mainnet",
    chainId: 1,
    rpcUrl: "https://ethereum-rpc.publicnode.com",
    nativeCurrency: "ETH",
    explorerUrl: "https://etherscan.io/",
    envPrefix: "ETHEREUM",
  }),
  base: mainnetConfig({
    name: "base-mainnet",
    chainId: 8453,
    rpcUrl: "https://mainnet.base.org",
    nativeCurrency: "ETH",
    explorerUrl: "https://basescan.org/",
    envPrefix: "BASE",
  }),
  polygon: mainnetConfig({
    name: "polygon-mainnet",
    chainId: 137,
    rpcUrl: "https://polygon-rpc.com",
    nativeCurrency: "POL",
    explorerUrl: "https://polygonscan.com/",
    envPrefix: "POLYGON",
  }),
  bsc: mainnetConfig({
    name: "bsc-mainnet",
    chainId: 56,
    rpcUrl: "https://bsc-dataseed.binance.org",
    nativeCurrency: "BNB",
    explorerUrl: "https://bscscan.com/",
    envPrefix: "BSC",
  }),
  arbitrum: mainnetConfig({
    name: "arbitrum-one",
    chainId: 42161,
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    nativeCurrency: "ETH",
    explorerUrl: "https://arbiscan.io/",
    envPrefix: "ARBITRUM",
  }),
  optimism: mainnetConfig({
    name: "optimism-mainnet",
    chainId: 10,
    rpcUrl: "https://mainnet.optimism.io",
    nativeCurrency: "ETH",
    explorerUrl: "https://optimistic.etherscan.io/",
    envPrefix: "OPTIMISM",
  }),
};

function normalizeChain(value: string | undefined): string | undefined {
  return value?.trim().toLowerCase();
}

export function resolveNetworkConfig(selection: NetworkSelection = {}): NetworkConfig {
  const chain = normalizeChain(selection.chain);
  const byChain =
    chain && Object.prototype.hasOwnProperty.call(supportedNetworks, chain)
      ? supportedNetworks[chain as NetworkKey]
      : undefined;
  const byChainId = selection.chainId
    ? Object.values(supportedNetworks).find((network) => network.chainId === selection.chainId)
    : undefined;

  if (chain && !byChain && !selection.rpcUrl) {
    throw new Error(
      `Unsupported chain "${selection.chain}". Use one of ${Object.keys(supportedNetworks).join(", ")} or pass --rpc-url.`,
    );
  }

  const base = byChain ?? byChainId ?? pharosMainnetConfig;

  if (!selection.rpcUrl && !selection.chainId) {
    return base;
  }

  return {
    ...base,
    name: byChain
      ? base.name
      : selection.chainId
        ? `custom-${selection.chainId}`
        : chain
          ? `custom-${chain}`
          : base.name,
    chainId: selection.chainId ?? base.chainId,
    rpcUrl: selection.rpcUrl ?? base.rpcUrl,
    explorerUrl: byChain || byChainId ? base.explorerUrl : "",
  };
}

export function isPharosNetwork(config: NetworkConfig): boolean {
  return config.chainId === pharosMainnetConfig.chainId || config.chainId === networkConfig.chainId;
}

export function isPharosTestnet(config: NetworkConfig): boolean {
  return config.chainId === networkConfig.chainId;
}

function envAddress(name: string, fallback: Address): Address {
  return (process.env[name] ?? fallback) as Address;
}

export const demoAddresses = {
  agent: envAddress("DEMO_AGENT_ADDRESS", "0xa1b2000000000000000000000000000000000001"),
  router: envAddress("ADDR_ROUTER", "0x4d7C3EF2d8553F9502b7EcbAB056F1981C89BadA"),
  moon: envAddress("ADDR_MOON", "0xCE26F3e00AE932C420A30E52A93bb141C543ECdf"),
  owner: envAddress("DEMO_OWNER_ADDRESS", "0x00000000000000000000000000000000f0e51003"),
  fresh: envAddress("DEMO_FRESH_ADDRESS", "0x00000000000000000000000000000000f0e51004"),
  usdc: envAddress("ADDR_USDC", "0x5420f2D7c9219FD6E7d44b571762D1aa4824cDFc"),
  wphrs: envAddress("ADDR_WPHRS", "0x6C21fA4468d4bCd05FCb628addF187574C84fAAC"),
  probe: envAddress("ADDR_PROBE", "0x4d7c79F36EFD1E78f986B8E422312Be2e7D0Fc83"),
} as const satisfies Record<string, Address>;

export const contractLabels: Record<Address, ContractLabel> = {
  [demoAddresses.router]: {
    address: demoAddresses.router,
    name: "SimpleRouter",
    verified: true,
    deployedBlock: 23550000,
  },
  [demoAddresses.usdc]: {
    address: demoAddresses.usdc,
    name: "USDC",
    verified: true,
    deployedBlock: 23540000,
  },
  [demoAddresses.wphrs]: {
    address: demoAddresses.wphrs,
    name: "WPHRS",
    verified: true,
    deployedBlock: 23540000,
  },
  [demoAddresses.moon]: {
    address: demoAddresses.moon,
    name: "MoonToken",
    verified: false,
    deployedBlock: 23559002,
  },
  [demoAddresses.probe]: {
    address: demoAddresses.probe,
    name: "RoundTripProbe",
    verified: true,
    deployedBlock: 23559002,
  },
};

export function labelFor(address: Address): ContractLabel {
  return (
    contractLabels[address] ?? {
      address,
      name: "UnknownContract",
      verified: false,
    }
  );
}