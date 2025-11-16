# Shuttle Port Expo Example

This is a complete example of using Shuttle with React Native and Expo to enable mobile wallet connections in your Cosmos dApp.

## Features

- 🔐 Connect to multiple Cosmos wallets (Keplr, Leap, Cosmostation)
- 📱 QR code scanning for easy wallet connection
- 💾 Persistent wallet connections across app sessions
- 🔄 Switch between multiple networks
- 📤 Send transactions and sign messages

## Prerequisites

- Node.js 18+ installed
- Expo CLI installed (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (or physical device with Expo Go)
- WalletConnect Project ID from https://cloud.walletconnect.com

## Setup

1. **Install dependencies:**

```bash
pnpm install
```

2. **Configure WalletConnect:**

Edit `src/config/wallets.ts` and replace `YOUR_WALLET_CONNECT_PROJECT_ID` with your actual WalletConnect Project ID:

```typescript
export const WALLET_CONNECT_PROJECT_ID = "your_actual_project_id_here";
```

3. **Start the development server:**

```bash
pnpm start
```

4. **Run on your device:**

- **iOS Simulator:** Press `i` in the terminal
- **Android Emulator:** Press `a` in the terminal
- **Physical Device:** Scan the QR code with Expo Go app

## Project Structure

```
shuttle-port-expo/
├── src/
│   ├── components/
│   │   └── WalletConnect.tsx    # Main wallet connection UI
│   ├── config/
│   │   ├── networks.ts          # Network configurations
│   │   └── wallets.ts           # Wallet provider setup
│   └── hooks/                   # Custom hooks (if needed)
├── App.tsx                      # Root component
├── app.json                     # Expo configuration
└── package.json
```

## How to Use

### Connecting a Wallet

1. Tap "Connect Wallet" button
2. Select your preferred wallet from the list
3. Either:
   - Scan the QR code with your wallet app, or
   - Tap "Open Wallet App" to deep link directly to the wallet

### Switching Networks

1. Tap the "Network" button
2. Select your desired network from the list

### Disconnecting

1. When connected, tap the "Disconnect" button

## Customization

### Adding More Networks

Edit `src/config/networks.ts`:

```typescript
export const MY_NETWORK: Network = {
  name: "My Network",
  chainId: "my-chain-1",
  chainPrefix: "myprefix",
  rpc: "https://rpc.mynetwork.com",
  rest: "https://api.mynetwork.com",
  defaultCurrency: {
    coinDenom: "MINE",
    coinMinimalDenom: "umine",
    coinDecimals: 6,
  },
  gasPrice: "0.025umine",
};

export const networks = [MY_NETWORK, TERRA_TESTNET, NEUTRON_TESTNET];
```

### Adding More Wallet Providers

Edit `src/config/wallets.ts`:

```typescript
import { 
  KeplrMobileProvider, 
  LeapCosmosMobileProvider,
  MetamaskMobileProvider // Add new providers
} from "@delphi-labs/shuttle";

export const mobileProviders = [
  new KeplrMobileProvider({ networks, walletConnectProjectId: WALLET_CONNECT_PROJECT_ID }),
  new LeapCosmosMobileProvider({ networks, walletConnectProjectId: WALLET_CONNECT_PROJECT_ID }),
  new MetamaskMobileProvider({ networks, walletConnectProjectId: WALLET_CONNECT_PROJECT_ID }),
];
```

## Building for Production

### iOS

```bash
expo build:ios
```

### Android

```bash
expo build:android
```

Or use EAS Build for a more modern build process:

```bash
eas build --platform ios
eas build --platform android
```

## Troubleshooting

### "Cannot connect to wallet"

- Ensure you have a valid WalletConnect Project ID
- Check that the wallet app is installed on your device
- Verify network connectivity

### "QR code not showing"

- Check console logs for errors
- Ensure `react-native-qrcode-svg` is properly installed
- Try cleaning and rebuilding: `expo start -c`

### Deep linking not working

- Verify your URL scheme is correctly configured in `app.json`
- Check that the wallet app supports the deep link format
- Test with a physical device instead of simulator/emulator

## Learn More

- [Shuttle Documentation](https://github.com/delphi-labs/shuttle)
- [Expo Documentation](https://docs.expo.dev)
- [WalletConnect Documentation](https://docs.walletconnect.com)
- [Cosmos SDK Documentation](https://docs.cosmos.network)

## License

MIT

