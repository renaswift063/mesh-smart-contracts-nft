import { useEffect, useState } from 'react';
import Button from '../../../ui/button';
import useWallet from '../../../../contexts/wallet';
import { BrowserWallet } from '@martifylabs/mesh';
import type { Wallet } from '@martifylabs/mesh';

export default function ConnectCipWallet() {
  const { connecting, walletNameConnected, connectWallet, availableWallets } = useWallet();
  // const [availableWallets, setAvailableWallets] = useState<
  //   Wallet[] | undefined
  // >(undefined);

  // useEffect(() => {
  //   async function init() {
  //     setAvailableWallets(BrowserWallet.getInstalledWallets());
  //   }
  //   init();
  // }, []);

  return (
    <>
      {availableWallets
        ? availableWallets.length == 0
          ? 'No wallets installed'
          : availableWallets.map((wallet, i) => (
              <Button
                key={i}
                onClick={() => connectWallet(wallet.name)}
                style={
                  walletNameConnected == wallet.name
                    ? 'success'
                    : connecting
                    ? 'warning'
                    : 'light'
                }
                disabled={connecting || walletNameConnected == wallet.name}
              >
                <img src={`${wallet.icon}`} className="m-0 mr-2 w-6 h-6" />
                Connect with {wallet.name}
              </Button>
            ))
        : ''}
    </>
  );
}
