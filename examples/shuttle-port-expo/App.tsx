import React from "react";
import { StyleSheet, View, SafeAreaView, StatusBar } from "react-native";
import { ShuttleProvider } from "@delphi-labs/shuttle-react-native";
import WalletConnect from "./src/components/WalletConnect";
import { mobileProviders, WALLET_CONNECT_PROJECT_ID } from "./src/config/wallets";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ShuttleProvider
        mobileProviders={mobileProviders}
        walletConnectProjectId={WALLET_CONNECT_PROJECT_ID}
        persistent={true}
        persistentKey="shuttle-expo"
        withLogging={true}
      >
        <View style={styles.content}>
          <WalletConnect />
        </View>
      </ShuttleProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },
});

