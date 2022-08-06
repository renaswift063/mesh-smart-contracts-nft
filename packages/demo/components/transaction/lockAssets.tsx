import { useState, useEffect } from 'react';
import Mesh from '@martifylabs/mesh';
import { Button, Card, Codeblock, Input } from '../../components';
import useWallet from '../../contexts/wallet';
import { TransactionService } from '@martifylabs/mesh';

export default function LockAssets() {
  return (
    <Card>
      <div className="grid gap-4 grid-cols-2">
        <div className="">
          <h3>Lock assets SC</h3>
          <p>WIP</p>
        </div>
        <div className="mt-8">
          <CodeDemo />
        </div>
      </div>
    </Card>
  );
}

function CodeDemo() {
  const { wallet, walletConnected, walletNameConnected } = useWallet();
  const [state, setState] = useState<number>(0);
  const [result, setResult] = useState<null | string>(null);
  const [response, setResponse] = useState<null | any>(null);
  const [amount, setAmount] = useState<string>('1500000');
  const [datum, setDatum] = useState<string>('');

  async function debug() {
    /*console.log('debug');

    let data = {
      fields: [
        "484f525345323033",
        43434,
        "dee127dcc877b538e2fda67d10eff19426b0453779ea17c8bb1b87ff"
      ],
    };
    const plustusdata = TransactionService.debug(data);
    console.log('plustusdata', plustusdata);*/

    /**
     * LOCK
     */

    // const tx = await Mesh.transaction.build({
    //   outputs: [
    //     {
    //       address:
    //         'addr_test1wpnlxv2xv9a9ucvnvzqakwepzl9ltx7jzgm53av2e9ncv4sysemm8',
    //       assets: {
    //         'f57f145fb8dd8373daff7cf55cea181669e99c4b73328531ebd4419a.SOCIETY': 1,
    //         lovelace: 3000000,
    //       },
    //     },
    //   ],
    //   hasDatum: true,
    //   blockfrostApiKey:
    //     (await Mesh.wallet.getNetworkId()) === 1
    //       ? process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY_MAINNET!
    //       : process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY_TESTNET!,
    //   network: await Mesh.wallet.getNetworkId(),
    // });
    // console.log('tx', tx);

    // const signature = await Mesh.wallet.signTx({ tx });

    // const txHash = await Mesh.wallet.submitTransaction({
    //   tx: tx,
    //   witnesses: [signature],
    // });
    // console.log('txHash', txHash);

    /**
     * UNLOCK
     */

    //  const txHash = await Mesh.transaction.buildSCv3({
    //   ownerAddress: await Mesh.wallet.getWalletAddress(),
    //   scriptAddress:
    //     'addr_test1wpnlxv2xv9a9ucvnvzqakwepzl9ltx7jzgm53av2e9ncv4sysemm8',
    //   blockfrostApiKey:
    //     (await Mesh.wallet.getNetworkId()) === 1
    //       ? process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY_MAINNET!
    //       : process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY_TESTNET!,
    //   network: await Mesh.wallet.getNetworkId(),
    // });
    // console.log('tx', txHash);

    /**
     * to check BF tx hash
     */
    // await Mesh.blockfrost.init({
    //   blockfrostApiKey: process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY_TESTNET!,
    //   network: 0,
    // });
    // let result = await Mesh.blockfrost.transactionsTransactionUTXOs({
    //   hash: '3c0fc4774e529432b2eaa654720231ad6c6d92ae2a4a7ab2544a93dcfa3c8561',
    // });
    // console.log('result', result);
  }

  async function makeTransaction() {
    setState(1);
    try {
      const tx = new TransactionService({ walletService: wallet });
      tx.sendLovelace(
        "addr_test1qq5tay78z9l77vkxvrvtrv70nvjdk0fyvxmqzs57jg0vq6wk3w9pfppagj5rc4wsmlfyvc8xs7ytkumazu9xq49z94pqzl95zt",
        amount.toString(),
        {
          datum: {
            fields: ["484f525345323033", 123]
          }
        }
      );
      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      setResult(txHash);
      setState(2);
    } catch (error) {
      setResult(`${error}`);
      setState(0);
    }
  }

  let codeSnippet = 'code here;';

  return (
    <>
      <table className="border border-slate-300 w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <tbody>
          <tr>
            <td className="py-4 px-4 w-1/4">Lock amount</td>
            <td className="py-4 px-4 w-3/4">
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="amount lovelace to lock"
                type="number"
              />
            </td>
          </tr>
          <tr>
            <td className="py-4 px-4 w-1/4">Datum</td>
            <td className="py-4 px-4 w-3/4">
              <Input
                value={datum}
                onChange={(e) => setDatum(e.target.value)}
                placeholder="a password for datum"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <Codeblock data={codeSnippet} isJson={false} />

      {walletConnected && (
        <Button
          onClick={() => makeTransaction()}
          disabled={state == 1}
          style={state == 1 ? 'warning' : state == 2 ? 'success' : 'light'}
        >
          Run code snippet
        </Button>
      )}
      {result && (
        <>
          <h4>Result</h4>
          <Codeblock data={result} />
        </>
      )}

      <Button
        onClick={() => debug()}
        // disabled={!walletConnected || state == 1}
      >
        debug
      </Button>
    </>
  );
}
