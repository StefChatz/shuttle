import { Network } from "@delphi-labs/shuttle";

export const TERRA_TESTNET: Network = {
  name: "Terra 2 Testnet",
  chainId: "pisco-1",
  chainPrefix: "terra",
  rpc: "https://multichain-nodes.astroport.fi/pisco-1/rpc/",
  rest: "https://multichain-nodes.astroport.fi/pisco-1/lcd/",
  bip44: {
    coinType: 330,
  },
  defaultCurrency: {
    coinDenom: "LUNA",
    coinMinimalDenom: "uluna",
    coinDecimals: 6,
    coinGeckoId: "terra-luna-2",
  },
  gasPrice: "0.015uluna",
};

export const NEUTRON_TESTNET: Network = {
  name: "Neutron Testnet",
  chainId: "pion-1",
  chainPrefix: "neutron",
  rpc: "https://rpc-palvus.pion-1.ntrn.tech/",
  rest: "https://rest-palvus.pion-1.ntrn.tech/",
  defaultCurrency: {
    coinDenom: "NTRN",
    coinMinimalDenom: "untrn",
    coinDecimals: 6,
  },
  gasPrice: "0.025untrn",
};

export const DEFAULT_NETWORK = TERRA_TESTNET;

export const networks = [TERRA_TESTNET, NEUTRON_TESTNET];

export function getNetworkByChainId(chainId: string): Network {
  const network = networks.find((network) => network.chainId === chainId);
  if (!network) {
    throw new Error(`Network with chainId ${chainId} not found`);
  }
  return network;
}

