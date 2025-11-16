# @mansteve/shuttle-react-native

[![npm version](https://badge.fury.io/js/%40mansteve%2Fshuttle-react-native.svg)](https://www.npmjs.com/package/@mansteve/shuttle-react-native)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

React Native/Expo bindings for Shuttle - Mobile wallet connections for Cosmos dApps.

> **Based on [Shuttle](https://github.com/delphi-labs/shuttle) by Delphi Labs**  
> This package extends Shuttle to provide React Native and Expo support for mobile wallet connections.
>
> **Author:** Stefanos Chatzakis  
> **Repository:** https://github.com/StefChatz/shuttle

## Installation

```bash
npm install @delphi-labs/shuttle @mansteve/shuttle-react-native @react-native-async-storage/async-storage
```

or with yarn:

```bash
yarn add @delphi-labs/shuttle @mansteve/shuttle-react-native @react-native-async-storage/async-storage
```

or with pnpm:

```bash
pnpm add @delphi-labs/shuttle @mansteve/shuttle-react-native @react-native-async-storage/async-storage
```

## Quick Start

### 1. Setup WalletConnect Project ID

Get your WalletConnect Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com).

### 2. Configure Networks and Providers

```typescript
import { Network, KeplrMobileProvider, LeapCosmosMobileProvider } from "@delphi-labs/shuttle";

const TERRA_TESTNET: Network = {
  name: "Terra 2 Testnet",
  chainId: "pisco-1",
  chainPrefix: "terra",
  rpc: "https://multichain-nodes.astroport.fi/pisco-1/rpc/",
  rest: "https://multichain-nodes.astroport.fi/pisco-1/lcd/",
  bip44: { coinType: 330 },
  defaultCurrency: {
    coinDenom: "LUNA",
    coinMinimalDenom: "uluna",
    coinDecimals: 6,
  },
  gasPrice: "0.015uluna",
};

const WALLET_CONNECT_PROJECT_ID = "YOUR_PROJECT_ID";

const mobileProviders = [
  new KeplrMobileProvider({
    networks: [TERRA_TESTNET],
    walletConnectProjectId: WALLET_CONNECT_PROJECT_ID,
  }),
  new LeapCosmosMobileProvider({
    networks: [TERRA_TESTNET],
    walletConnectProjectId: WALLET_CONNECT_PROJECT_ID,
  }),
];
```

### 3. Wrap Your App with ShuttleProvider

```typescript
import { ShuttleProvider } from "@mansteve/shuttle-react-native";

function App() {
  return (
    <ShuttleProvider
      mobileProviders={mobileProviders}
      walletConnectProjectId={WALLET_CONNECT_PROJECT_ID}
      persistent={true}
      persistentKey="my-app-shuttle"
      withLogging={true}
    >
      <YourApp />
    </ShuttleProvider>
  );
}
```

### 4. Connect to Wallets

```typescript
import { useShuttle } from "@mansteve/shuttle-react-native";
import { Linking } from "react-native";
import QRCode from "react-native-qrcode-svg";

function WalletConnectButton() {
  const { mobileConnect, wallets, disconnect, openUrl } = useShuttle();
  const [qrCodeUri, setQrCodeUri] = useState("");

  const handleConnect = async () => {
    const result = await mobileConnect({
      mobileProviderId: "mobile-keplr",
      chainId: "pisco-1",
      callback: (wallet) => {
        console.log("Connected:", wallet);
      },
    });

    // Show QR code for scanning
    setQrCodeUri(result.qrCodeUrl);

    // Or directly open the wallet app
    await openUrl(result.androidUrl); // or result.iosUrl for iOS
  };

  if (wallets.length > 0) {
    return <Button title="Disconnect" onPress={() => disconnect()} />;
  }

  return (
    <>
      <Button title="Connect Wallet" onPress={handleConnect} />
      {qrCodeUri && <QRCode value={qrCodeUri} size={250} />}
    </>
  );
}
```

### 5. Sign and Broadcast Transactions

```typescript
import { useShuttle } from "@mansteve/shuttle-react-native";
import { MsgSend } from "@delphi-labs/shuttle";

function SendTokens() {
  const { broadcast, recentWallet } = useShuttle();

  const handleSend = async () => {
    if (!recentWallet) return;

    const result = await broadcast({
      messages: [
        new MsgSend({
          fromAddress: recentWallet.account.address,
          toAddress: "terra1...",
          amount: [{ denom: "uluna", amount: "1000000" }],
        }),
      ],
      wallet: recentWallet,
    });

    console.log("Transaction hash:", result.hash);
  };

  return <Button title="Send Tokens" onPress={handleSend} />;
}
```

## API Reference

### ShuttleProvider Props

- `mobileProviders`: Array of mobile wallet providers
- `walletConnectProjectId`: Your WalletConnect project ID
- `persistent`: Enable persistent wallet connections (default: false)
- `persistentKey`: Key for AsyncStorage (default: "shuttle")
- `withLogging`: Enable console logging (default: false)
- `store`: Optional custom Zustand store

### useShuttle Hook

Returns an object with:

- `mobileProviders`: Available mobile wallet providers
- `mobileConnect({ mobileProviderId, chainId, callback })`: Connect to a mobile wallet
- `wallets`: Array of connected wallets
- `recentWallet`: Most recently used wallet
- `getWallets(filters?)`: Get wallets with optional filters
- `disconnect(filters?)`: Disconnect wallets
- `disconnectWallet(wallet)`: Disconnect a specific wallet
- `simulate({ messages, wallet?, overrides? })`: Simulate a transaction
- `broadcast({ messages, wallet?, fee?, memo?, overrides? })`: Broadcast a transaction
- `sign({ messages, wallet?, fee?, memo?, overrides? })`: Sign a transaction
- `signArbitrary({ wallet?, data })`: Sign arbitrary data
- `verifyArbitrary({ wallet?, data, signResult })`: Verify signed data
- `openUrl(url)`: Open a URL (useful for deep links to wallet apps)

## Supported Wallets

- Keplr Mobile (via WalletConnect)
- Leap Cosmos Mobile (via WalletConnect)
- Cosmostation Mobile (via WalletConnect)
- Metamask Mobile (via WalletConnect)
- Trust Wallet Mobile (via WalletConnect)

## Example

Check out the complete example app at `examples/shuttle-port-expo` in the repository.

## Deep Linking

To handle wallet callbacks, configure deep linking in your app:

1. Add a custom URL scheme in `app.json`:

```json
{
  "expo": {
    "scheme": "myapp"
  }
}
```

2. Configure Android intent filters and iOS URL schemes as needed.

## License

MIT
