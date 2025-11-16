import { KeplrMobileProvider, LeapCosmosMobileProvider, CosmostationMobileProvider } from "@delphi-labs/shuttle";
import { networks } from "./networks";

// WalletConnect Project ID - Get one from https://cloud.walletconnect.com
export const WALLET_CONNECT_PROJECT_ID = "YOUR_WALLET_CONNECT_PROJECT_ID";

export const mobileProviders = [
  new KeplrMobileProvider({
    networks,
    walletConnectProjectId: WALLET_CONNECT_PROJECT_ID,
  }),
  new LeapCosmosMobileProvider({
    networks,
    walletConnectProjectId: WALLET_CONNECT_PROJECT_ID,
  }),
  new CosmostationMobileProvider({
    networks,
    walletConnectProjectId: WALLET_CONNECT_PROJECT_ID,
  }),
];

