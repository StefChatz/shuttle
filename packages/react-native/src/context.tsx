import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Linking } from "react-native";

import {
  BroadcastResult,
  Fee,
  MobileConnectResponse,
  NetworkCurrency,
  SigningResult,
  SimulateResult,
  TransactionMsg,
  WalletConnection,
  WalletMobileProvider,
} from "@delphi-labs/shuttle";

import { ShuttleStore, useShuttleStore } from "./store";

export type ShuttleContextType = {
  mobileProviders: WalletMobileProvider[];
  mobileConnect: (options: {
    mobileProviderId: string;
    chainId: string;
    callback?: (walletConnection: WalletConnection) => void;
  }) => Promise<MobileConnectResponse>;
  wallets: WalletConnection[];
  getWallets: (filters?: { providerId?: string; chainId?: string }) => WalletConnection[];
  recentWallet: WalletConnection | null;
  disconnect: (filters?: { providerId?: string; chainId?: string }) => void;
  disconnectWallet: (wallet: WalletConnection) => void;
  simulate: (options: {
    messages: TransactionMsg[];
    wallet?: WalletConnection | null;
    overrides?: {
      rpc?: string;
      rest?: string;
      gasAdjustment?: number;
      gasPrice?: string;
      feeCurrency?: NetworkCurrency;
    };
  }) => Promise<SimulateResult>;
  broadcast: (options: {
    messages: TransactionMsg[];
    wallet?: WalletConnection | null;
    fee?: Fee | null;
    feeAmount?: string | null;
    gasLimit?: string | null;
    memo?: string | null;
    overrides?: {
      rpc?: string;
      rest?: string;
      gasAdjustment?: number;
      gasPrice?: string;
      feeCurrency?: NetworkCurrency;
    };
  }) => Promise<BroadcastResult>;
  sign: (options: {
    messages: TransactionMsg[];
    fee?: Fee | null;
    feeAmount?: string | null;
    gasLimit?: string | null;
    memo?: string | null;
    wallet?: WalletConnection | null;
    overrides?: {
      rpc?: string;
      rest?: string;
      gasAdjustment?: number;
      gasPrice?: string;
      feeCurrency?: NetworkCurrency;
    };
  }) => Promise<SigningResult>;
  signArbitrary: (options: { wallet?: WalletConnection | null; data: Uint8Array }) => Promise<SigningResult>;
  verifyArbitrary: (options: {
    wallet?: WalletConnection | null;
    data: Uint8Array;
    signResult: SigningResult;
  }) => Promise<boolean>;
  openUrl: (url: string) => Promise<void>;
};

export const ShuttleContext = createContext<ShuttleContextType | undefined>(undefined);

export function ShuttleProvider({
  persistent = false,
  persistentKey = "shuttle",
  mobileProviders = [],
  store,
  children,
  withLogging = false,
  walletConnectProjectId,
}: {
  persistent?: boolean;
  persistentKey?: string;
  mobileProviders: WalletMobileProvider[];
  store?: ShuttleStore;
  children?: React.ReactNode;
  withLogging?: boolean;
  walletConnectProjectId?: string;
}) {
  const [availableMobileProviders, setAvailableMobileProviders] = useState<WalletMobileProvider[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const internalStore = useShuttleStore();

  const wallets = useMemo(() => {
    return store?.wallets || internalStore.wallets;
  }, [store, internalStore]);

  const getWallets = useMemo(() => {
    return store?.getWallets || internalStore.getWallets;
  }, [store, internalStore]);

  const recentWallet = useMemo(() => {
    return store?.recentWallet || internalStore.recentWallet;
  }, [store, internalStore]);

  const addWallet = useCallback(
    async (wallet: WalletConnection) => {
      internalStore.addWallet(wallet);
      store?.addWallet(wallet);
      if (persistent) {
        try {
          await AsyncStorage.setItem(persistentKey || "shuttle", JSON.stringify(internalStore.getWallets()));
        } catch (error) {
          if (withLogging) {
            console.warn("Shuttle: Error saving wallet connections", error);
          }
        }
      }
    },
    [internalStore, persistent, persistentKey, store, withLogging],
  );

  const removeWallets = useCallback(
    async (filters?: { providerId?: string; chainId?: string }) => {
      internalStore.removeWallets(filters);
      store?.removeWallets(filters);
      if (persistent) {
        try {
          await AsyncStorage.setItem(persistentKey || "shuttle", JSON.stringify(internalStore.getWallets()));
        } catch (error) {
          if (withLogging) {
            console.warn("Shuttle: Error saving wallet connections", error);
          }
        }
      }
    },
    [internalStore, persistent, persistentKey, store, withLogging],
  );

  const removeWallet = useCallback(
    async (wallet: WalletConnection) => {
      internalStore.removeWallet(wallet);
      store?.removeWallet(wallet);
      if (persistent) {
        try {
          await AsyncStorage.setItem(persistentKey || "shuttle", JSON.stringify(internalStore.getWallets()));
        } catch (error) {
          if (withLogging) {
            console.warn("Shuttle: Error saving wallet connections", error);
          }
        }
      }
    },
    [internalStore, persistent, persistentKey, store, withLogging],
  );

  const openUrl = useCallback(async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      throw new Error(`Cannot open URL: ${url}`);
    }
  }, []);

  const providerInterface = useMemo(() => {
    const mobileConnect = async ({
      mobileProviderId,
      chainId,
      callback,
    }: {
      mobileProviderId: string;
      chainId: string;
      callback?: (walletConnection: WalletConnection) => void;
    }) => {
      const mobileProvider = availableMobileProviders.find((mobileProvider) => mobileProvider.id === mobileProviderId);
      if (!mobileProvider) {
        throw new Error(`Mobile provider ${mobileProviderId} not found`);
      }

      return mobileProvider.connect({
        chainId,
        callback: (wallet: WalletConnection) => {
          void addWallet(wallet);
          callback?.(wallet);
        },
      });
    };

    const disconnect = (filters?: { providerId?: string; chainId?: string }) => {
      internalStore.getWallets(filters).forEach((wallet) => {
        const provider = availableMobileProviders.find((mobileProvider) => mobileProvider.id === wallet.providerId);
        if (provider) {
          provider.disconnect({ wallet });
        }
      });

      void removeWallets(filters);
    };

    const disconnectWallet = (wallet: WalletConnection) => {
      const provider = availableMobileProviders.find((mobileProvider) => mobileProvider.id === wallet.providerId);

      if (provider) {
        provider.disconnect({ wallet });
      }

      void removeWallet(wallet);
    };

    const simulate = async ({
      messages,
      wallet,
      overrides,
    }: {
      messages: TransactionMsg[];
      wallet?: WalletConnection | null;
      overrides?: {
        rpc?: string;
        rest?: string;
        gasAdjustment?: number;
        gasPrice?: string;
        feeCurrency?: NetworkCurrency;
      };
    }) => {
      const walletToUse = wallet || recentWallet;
      if (!walletToUse) {
        throw new Error("No wallet to simulate with");
      }

      const provider = availableMobileProviders.find((mobileProvider) => mobileProvider.id === walletToUse.providerId);

      if (!provider) {
        throw new Error(`Provider ${walletToUse.providerId} not found`);
      }

      return provider.simulate({ messages, wallet: walletToUse });
    };

    const broadcast = async ({
      messages,
      wallet,
      fee,
      feeAmount,
      gasLimit,
      memo,
      overrides,
    }: {
      messages: TransactionMsg[];
      wallet?: WalletConnection | null;
      fee?: Fee | null;
      feeAmount?: string | null;
      gasLimit?: string | null;
      memo?: string | null;
      overrides?: {
        rpc?: string;
        rest?: string;
        gasAdjustment?: number;
        gasPrice?: string;
        feeCurrency?: NetworkCurrency;
      };
    }) => {
      const walletToUse = wallet || recentWallet;
      if (!walletToUse) {
        throw new Error("No wallet to broadcast with");
      }

      const provider = availableMobileProviders.find((mobileProvider) => mobileProvider.id === walletToUse.providerId);

      if (!provider) {
        throw new Error(`Provider ${walletToUse.providerId} not found`);
      }

      return provider.broadcast({ messages, wallet: walletToUse, fee, feeAmount, gasLimit, memo, overrides });
    };

    const sign = async ({
      messages,
      fee,
      feeAmount,
      gasLimit,
      memo,
      wallet,
      overrides,
    }: {
      messages: TransactionMsg[];
      fee?: Fee | null;
      feeAmount?: string | null;
      gasLimit?: string | null;
      memo?: string | null;
      wallet?: WalletConnection | null;
      overrides?: {
        rpc?: string;
        rest?: string;
        gasAdjustment?: number;
        gasPrice?: string;
        feeCurrency?: NetworkCurrency;
      };
    }) => {
      const walletToUse = wallet || recentWallet;
      if (!walletToUse) {
        throw new Error("No wallet to sign with");
      }

      const provider = availableMobileProviders.find((mobileProvider) => mobileProvider.id === walletToUse.providerId);

      if (!provider) {
        throw new Error(`Provider ${walletToUse.providerId} not found`);
      }

      return provider.sign({ messages, wallet: walletToUse, fee, feeAmount, gasLimit, memo, overrides });
    };

    const signArbitrary = async ({ wallet, data }: { wallet?: WalletConnection | null; data: Uint8Array }) => {
      const walletToUse = wallet || recentWallet;
      if (!walletToUse) {
        throw new Error("No wallet to sign with");
      }

      const provider = availableMobileProviders.find((mobileProvider) => mobileProvider.id === walletToUse.providerId);

      if (!provider) {
        throw new Error(`Provider ${walletToUse.providerId} not found`);
      }

      return provider.signArbitrary({ wallet: walletToUse, data });
    };

    const verifyArbitrary = async ({
      wallet,
      data,
      signResult,
    }: {
      wallet?: WalletConnection | null;
      data: Uint8Array;
      signResult: SigningResult;
    }) => {
      const walletToUse = wallet || recentWallet;
      if (!walletToUse) {
        throw new Error("No wallet to sign with");
      }

      const provider = availableMobileProviders.find((mobileProvider) => mobileProvider.id === walletToUse.providerId);

      if (!provider) {
        throw new Error(`Provider ${walletToUse.providerId} not found`);
      }

      return provider.verifyArbitrary({ wallet: walletToUse, data, signResult });
    };

    return {
      mobileProviders,
      mobileConnect,
      wallets,
      getWallets,
      recentWallet,
      disconnect,
      disconnectWallet,
      simulate,
      broadcast,
      sign,
      signArbitrary,
      verifyArbitrary,
      openUrl,
    };
  }, [
    mobileProviders,
    wallets,
    getWallets,
    recentWallet,
    availableMobileProviders,
    internalStore,
    addWallet,
    removeWallets,
    removeWallet,
    openUrl,
  ]);

  const updateMobileWallets = useCallback(
    (mobileProvider: WalletMobileProvider) => {
      getWallets({ providerId: mobileProvider.id }).forEach((mobileProviderWallet) => {
        if (!mobileProviderWallet.mobileSession) {
          return;
        }
        mobileProvider
          .getWalletConnection({
            chainId: mobileProviderWallet.network.chainId,
            mobileSession: mobileProviderWallet.mobileSession,
          })
          .then((wallet: WalletConnection) => {
            if (mobileProviderWallet.id !== wallet.id) {
              void removeWallet(mobileProviderWallet);
              void addWallet(wallet);
            }
          })
          .catch(() => {
            void removeWallet(mobileProviderWallet);
          });
      });
    },
    [getWallets, removeWallet, addWallet],
  );

  // Initialize store from AsyncStorage
  useEffect(() => {
    if (!isInitialized && persistent) {
      AsyncStorage.getItem(persistentKey || "shuttle")
        .then((stored) => {
          if (stored) {
            try {
              const walletConnections: WalletConnection[] = JSON.parse(stored);
              if (walletConnections && walletConnections.length > 0 && internalStore.getWallets().length === 0) {
                internalStore.restore(walletConnections);
                store?.restore(walletConnections);
              }
            } catch (error) {
              if (withLogging) {
                console.warn("Shuttle: Error parsing stored wallet connections", error);
              }
            }
          }
          setIsInitialized(true);
        })
        .catch((error) => {
          if (withLogging) {
            console.warn("Shuttle: Error loading wallet connections", error);
          }
          setIsInitialized(true);
        });
    } else if (!persistent) {
      setIsInitialized(true);
    }
  }, [isInitialized, persistent, persistentKey, internalStore, store, withLogging]);

  // Initialize mobile providers
  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    mobileProviders
      .filter((mobileProvider) => !mobileProvider.initializing && !mobileProvider.initialized)
      .forEach((mobileProvider) => {
        mobileProvider
          .init({ walletConnectProjectId })
          .then(() => {
            updateMobileWallets(mobileProvider);

            mobileProvider.setOnUpdateCallback(() => {
              updateMobileWallets(mobileProvider);
            });

            setAvailableMobileProviders((prev) => {
              const rest = prev.filter((p) => p.id !== mobileProvider.id);
              return [...rest, mobileProvider];
            });
          })
          .catch((e: Error) => {
            if (withLogging) {
              console.warn("Shuttle: ", e);
            }
          });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, walletConnectProjectId, withLogging]);

  return <ShuttleContext.Provider value={providerInterface}>{children}</ShuttleContext.Provider>;
}

export function useShuttle() {
  const context = useContext(ShuttleContext);

  if (context === undefined) {
    throw new Error("Please wrap your component with ShuttleProvider to call: useShuttle");
  }

  return context;
}
