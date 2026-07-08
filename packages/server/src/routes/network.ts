import { Router, type Router as ExpressRouter } from "express";
import { demoAddresses, networkConfig, pharosMainnetConfig, supportedNetworks } from "@foresight/engine";

export const networkRouter: ExpressRouter = Router();

networkRouter.get("/", (_req, res) => {
  res.json({
    chainId: pharosMainnetConfig.chainId,
    name: pharosMainnetConfig.name,
    rpcUrl: pharosMainnetConfig.rpcUrl,
    proofChainId: networkConfig.chainId,
    proofNetwork: networkConfig.name,
    forkBlock: networkConfig.forkBlock,
    defaultNetwork: "pharos",
    supportedNetworks: Object.fromEntries(
      Object.entries(supportedNetworks).map(([key, network]) => [
        key,
        { name: network.name, chainId: network.chainId, nativeCurrency: network.nativeCurrency, explorerUrl: network.explorerUrl },
      ]),
    ),
    contracts: {
      router: demoAddresses.router,
      usdc: demoAddresses.usdc,
      wphrs: demoAddresses.wphrs,
      moon: demoAddresses.moon,
    },
  });
});
