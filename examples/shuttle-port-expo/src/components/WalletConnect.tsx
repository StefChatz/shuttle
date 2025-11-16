import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useShuttle } from "@delphi-labs/shuttle-react-native";
import { DEFAULT_NETWORK, networks } from "../config/networks";

export default function WalletConnect() {
  const { mobileProviders, mobileConnect, wallets, disconnect, recentWallet, openUrl } = useShuttle();
  const [showProviders, setShowProviders] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUri, setQrCodeUri] = useState("");
  const [deepLinkUrl, setDeepLinkUrl] = useState("");
  const [selectedChainId, setSelectedChainId] = useState(DEFAULT_NETWORK.chainId);
  const [showNetworks, setShowNetworks] = useState(false);

  const handleConnect = async (providerId: string) => {
    try {
      const result = await mobileConnect({
        mobileProviderId: providerId,
        chainId: selectedChainId,
        callback: (wallet) => {
          console.log("Wallet connected:", wallet);
          setShowQRCode(false);
          setShowProviders(false);
        },
      });

      setQrCodeUri(result.qrCodeUrl);
      setDeepLinkUrl(result.androidUrl);
      setShowQRCode(true);
    } catch (error) {
      console.error("Connection error:", error);
      Alert.alert("Connection Error", error instanceof Error ? error.message : "Failed to connect wallet");
    }
  };

  const handleOpenWallet = async () => {
    try {
      if (deepLinkUrl) {
        await openUrl(deepLinkUrl);
      }
    } catch (error) {
      console.error("Failed to open wallet:", error);
      Alert.alert("Error", "Failed to open wallet app");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    Alert.alert("Success", "Wallet disconnected");
  };

  if (recentWallet) {
    return (
      <View style={styles.connectedContainer}>
        <View style={styles.card}>
          <Text style={styles.label}>Connected Wallet</Text>
          <Text style={styles.address}>{recentWallet.account.address}</Text>
          <Text style={styles.info}>Chain: {recentWallet.network.name}</Text>
          <Text style={styles.info}>Provider: {recentWallet.name}</Text>
          <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
            <Text style={styles.disconnectButtonText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect Your Wallet</Text>

      <TouchableOpacity
        style={styles.networkButton}
        onPress={() => setShowNetworks(true)}
      >
        <Text style={styles.networkButtonText}>
          Network: {networks.find(n => n.chainId === selectedChainId)?.name || "Select Network"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.connectButton}
        onPress={() => setShowProviders(true)}
      >
        <Text style={styles.connectButtonText}>Connect Wallet</Text>
      </TouchableOpacity>

      {/* Network Selection Modal */}
      <Modal
        visible={showNetworks}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNetworks(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Network</Text>
            <ScrollView style={styles.networkList}>
              {networks.map((network) => (
                <TouchableOpacity
                  key={network.chainId}
                  style={[
                    styles.networkItem,
                    selectedChainId === network.chainId && styles.selectedNetwork
                  ]}
                  onPress={() => {
                    setSelectedChainId(network.chainId);
                    setShowNetworks(false);
                  }}
                >
                  <Text style={styles.networkName}>{network.name}</Text>
                  <Text style={styles.networkChainId}>{network.chainId}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowNetworks(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Provider Selection Modal */}
      <Modal
        visible={showProviders}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProviders(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Wallet</Text>
            <ScrollView style={styles.providerList}>
              {mobileProviders.map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  style={styles.providerItem}
                  onPress={() => handleConnect(provider.id)}
                >
                  <Text style={styles.providerName}>{provider.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowProviders(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        visible={showQRCode}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQRCode(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Scan QR Code</Text>
            <View style={styles.qrContainer}>
              {qrCodeUri && <QRCode value={qrCodeUri} size={250} />}
            </View>
            <Text style={styles.qrInfo}>
              Scan this QR code with your wallet app or click the button below to open it directly
            </Text>
            <TouchableOpacity
              style={styles.openWalletButton}
              onPress={handleOpenWallet}
            >
              <Text style={styles.openWalletButtonText}>Open Wallet App</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowQRCode(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  connectedContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  networkButton: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: "100%",
  },
  networkButtonText: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
  connectButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    width: "100%",
  },
  connectButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000",
  },
  info: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  disconnectButton: {
    backgroundColor: "#FF3B30",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  disconnectButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  providerList: {
    marginBottom: 15,
  },
  providerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  providerName: {
    fontSize: 16,
    fontWeight: "500",
  },
  networkList: {
    marginBottom: 15,
  },
  networkItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedNetwork: {
    backgroundColor: "#e3f2fd",
  },
  networkName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  networkChainId: {
    fontSize: 12,
    color: "#666",
  },
  qrContainer: {
    alignItems: "center",
    marginVertical: 20,
    padding: 20,
    backgroundColor: "white",
  },
  qrInfo: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 15,
  },
  openWalletButton: {
    backgroundColor: "#34C759",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  openWalletButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  closeButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  closeButtonText: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
});

