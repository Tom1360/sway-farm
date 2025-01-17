import { cssObj } from '@fuel-ui/css';
import { Box, BoxCentered, Heading } from '@fuel-ui/react';
import { Analytics } from '@vercel/analytics/react';
import { Wallet, Provider } from 'fuels';
import type { WalletLocked, Account } from 'fuels';
import { useState, useEffect, useMemo } from 'react';

import Game from './components/Game';
import Home from './components/home/Home';
import { CONTRACT_ID, FARM_COIN_ASSET, FUEL_PROVIDER_URL } from './constants';
import { ContractAbi__factory } from './contracts';
import { useFuel } from './hooks/useFuel';
import { useIsConnected } from './hooks/useIsConnected';
import './App.css';

function App() {
  const [wallet, setWallet] = useState<WalletLocked>();
  const [burnerWallet, setBurnerWallet] = useState<Wallet>();
  const [mounted, setMounted] = useState<boolean>(false);
  const [isConnected] = useIsConnected();
  const [fuel] = useFuel();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobile = /(iphone|android|windows phone)/.test(userAgent);
    setIsMobile(mobile);
  }, []);

  useEffect(() => {
    async function getAccounts() {
      const currentAccount = await fuel.currentAccount();
      const tempWallet = await fuel.getWallet(currentAccount);
      setWallet(tempWallet);
      if (mounted) {
        const assets = await fuel.assets();
        let hasAsset = false;
        for (let i = 0; i < assets.length; i++) {
          if (FARM_COIN_ASSET.assetId === assets[i].assetId) {
            hasAsset = true;
            break;
          }
        }
        if (!hasAsset) {
          await fuel.addAssets([FARM_COIN_ASSET]);
        }
      } else {
        setMounted(true);
      }
    }

    async function getWallet() {
      const key = window.localStorage.getItem('sway-farm-wallet-key');
      if (key) {
        const provider = new Provider(FUEL_PROVIDER_URL);
        const walletFromKey = Wallet.fromPrivateKey(key, provider);
        setBurnerWallet(walletFromKey);
      }
    }

    // if wallet is installed & connected, fetch account info
    if (fuel && isConnected) getAccounts();

    // if not connected, check if has burner wallet stored
    if (!isConnected) getWallet();
  }, [fuel, isConnected, mounted]);

  const contract = useMemo(() => {
    if (fuel && wallet) {
      const contract = ContractAbi__factory.connect(CONTRACT_ID, wallet);
      return contract;
    } else if (burnerWallet) {
      const contract = ContractAbi__factory.connect(
        CONTRACT_ID,
        burnerWallet as Account
      );
      return contract;
    }
    return null;
  }, [fuel, wallet, burnerWallet]);

  return (
    <Box css={styles.root}>
      {isConnected || (contract && burnerWallet) ? (
        <Game contract={contract} isMobile={isMobile} />
      ) : (
        <BoxCentered css={styles.box}>
          <BoxCentered css={styles.innerBox}>
            <Heading css={styles.heading} as={'h1'}>
              SWAY FARM
            </Heading>
            <Home setBurnerWallet={setBurnerWallet} isMobile={isMobile} />
          </BoxCentered>
        </BoxCentered>
      )}
      <Analytics />
    </Box>
  );
}

export default App;

const styles = {
  root: cssObj({
    textAlign: 'center',
    height: '100vh',
    width: '100vw',
    '@sm': {
      display: 'grid',
      placeItems: 'center',
    },
  }),
  box: cssObj({
    marginTop: '20%',
  }),
  innerBox: cssObj({
    display: 'block',
  }),
  heading: cssObj({
    fontFamily: 'pressStart2P',
    fontSize: '$5xl',
    marginBottom: '40px',
    lineHeight: '3.5rem',
    color: 'green',
    '@sm': {
      fontSize: '$7xl',
      lineHeight: '2.5rem',
    },
  }),
  button: cssObj({
    fontFamily: 'pressStart2P',
    fontSize: '$sm',
    margin: 'auto',
    backgroundColor: 'transparent',
    color: '#aaa',
    border: '2px solid #754a1e',
    '&:hover': {
      color: '#ddd',
      background: '#754a1e !important',
      border: '2px solid #754a1e !important',
      boxShadow: 'none !important',
    },
  }),
  download: cssObj({
    color: '#ddd',
    fontFamily: 'pressStart2P',
    lineHeight: '24px',
  }),
  smallScreen: cssObj({
    color: '#ddd',
    fontFamily: 'pressStart2P',
    fontSize: '12px',
    '@sm': {
      display: 'none',
    },
  }),
};
