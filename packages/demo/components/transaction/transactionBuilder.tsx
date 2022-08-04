import { useState, useEffect } from 'react';
import Mesh from '@martifylabs/mesh';
import { Badge, Button, Card, Codeblock, Input, Modal } from '../../components';
import { RadioGroup } from '@headlessui/react';
import {
  CheckCircleIcon,
  TrashIcon,
  PlusCircleIcon,
} from '@heroicons/react/solid';
import { Recipient } from '../../types';
import { XIcon } from '@heroicons/react/solid';
import useWallet from '../../contexts/wallet';

export default function TransactionBuilder() {
  return (
    <Card>
      <div className="grid gap-4 grid-cols-2">
        <div className="">
          <h3>Transaction Builder</h3>
          <p>
            Design your own transaction but selecting inputs UTXOs and defining
            the outputs.
          </p>
        </div>
        <div className="mt-8"></div>
      </div>
      <PrepareInputsOutputs />
    </Card>
  );
}

function PrepareInputsOutputs() {
  const { walletConnected } = useWallet();
  const [state, setState] = useState(0);
  const [utxos, setUtxos] = useState<{}[] | string[] | undefined>([]);
  const [selectedUtxos, setSelectedUtxos] = useState<string[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  useEffect(() => {
    async function init() {
      setUtxos(await Mesh.wallet.getUtxos());
      const newRecipents = [
        {
          address:
            (await Mesh.wallet.getNetworkId()) === 1
              ? process.env.NEXT_PUBLIC_TEST_ADDRESS_MAINNET!
              : process.env.NEXT_PUBLIC_TEST_ADDRESS_TESTNET!,
          assets: {},
        },
      ];
      setRecipients(newRecipents);
    }
    if (walletConnected) {
      init();
    }
  }, [walletConnected]);

  return (
    <>
      <div className="grid gap-4 grid-cols-2">
        <div>
          <h4>Select inputs</h4>
          <Inputs
            utxos={utxos}
            selectedUtxos={selectedUtxos}
            setSelectedUtxos={setSelectedUtxos}
          />
        </div>
        <div>
          <h4>Define outputs</h4>
          <Outputs
            state={state}
            utxos={utxos}
            selectedUtxos={selectedUtxos}
            recipients={recipients}
            setRecipients={setRecipients}
          />
        </div>
      </div>
      <CodeDemo
        recipients={recipients}
        state={state}
        setState={setState}
        selectedUtxos={selectedUtxos}
      />
    </>
  );
}

function Inputs({ utxos, selectedUtxos, setSelectedUtxos }) {
  function toggleSelectUtxo(value) {
    let updated = [...selectedUtxos];
    let id = value.cbor;
    if (updated.includes(id)) {
      const index = updated.indexOf(id);
      updated.splice(index, 1);
    } else {
      updated.push(id);
    }
    setSelectedUtxos(updated);
  }

  return (
    <div className="w-full">
      <RadioGroup value={null} onChange={toggleSelectUtxo}>
        <div className="space-y-2">
          {utxos
            .map((item) => item.address)
            .filter((value, index, self) => self.indexOf(value) === index)
            .map((address, index) => {
              return (
                <div key={index} className="border border-slate-300 text-sm text-left text-gray-500 dark:text-gray-400 grid gap-4 grid-cols-1">
                  <p className="truncate">
                    <b className="truncate">{address}</b>
                  </p>

                  <div>
                    {utxos
                      .filter((utxo) => {
                        return utxo.address == address;
                      })
                      .map((utxo, i) => {
                        let thisSelected = selectedUtxos.includes(utxo.cbor);
                        return (
                          <RadioGroup.Option
                            key={i}
                            value={utxo}
                            className={`
                    ${
                      thisSelected
                        ? 'bg-sky-900 bg-opacity-75 text-white'
                        : 'bg-white'
                    }
                      relative flex cursor-pointer rounded-lg px-4 shadow-md focus:outline-none m-4`}
                          >
                            {
                              <>
                                <div className="flex w-full items-center justify-between">
                                  <div className="w-full">
                                    <RadioGroup.Label
                                      as="p"
                                      className={`font-medium  ${
                                        thisSelected
                                          ? 'text-white'
                                          : 'text-gray-900'
                                      }`}
                                    >
                                      UTXO #{i + 1}
                                    </RadioGroup.Label>
                                    <RadioGroup.Description
                                      as="span"
                                      className={`${
                                        thisSelected
                                          ? 'text-sky-100'
                                          : 'text-gray-500'
                                      }`}
                                    >
                                      <Assets assets={utxo.assets} />
                                    </RadioGroup.Description>
                                  </div>
                                  {thisSelected && (
                                    <div className="shrink-0 text-white">
                                      <CheckCircleIcon className="h-6 w-6" />
                                    </div>
                                  )}
                                </div>
                              </>
                            }
                          </RadioGroup.Option>
                        );
                      })}
                  </div>
                </div>
              );
            })}
        </div>
      </RadioGroup>
    </div>
  );
}

function Assets({ assets }) {
  return (
    <div className="w-full max-w-md grid grid-cols-3 gap-1 max-h-44 overflow-scroll">
      {Object.keys(assets).map((assetId, i) => {
        let style = 'default';
        let assetName = assetId;
        let quantity = assets[assetId];
        let policy: undefined | string = undefined;
        if (assetId == 'lovelace') {
          style = 'red';
          quantity = `${quantity / 1000000}`;
          assetName = `₳`;
        } else {
          assetName = assetName.split('.')[1];
          policy = assetName.split('.')[0];
        }
        return (
          <Badge style={style} className="block mb-2 truncate" key={i}>
            <b>{quantity}</b> {assetName}
          </Badge>
        );
      })}
    </div>
  );
}

function Outputs({ state, utxos, selectedUtxos, recipients, setRecipients }) {
  const [selectedAsset, setSelectedAsset] = useState('');
  const [showSelectAssetModal, setShowSelectAssetModal] = useState(false);

  let availableAssets = {};
  for (let i = 0; i < selectedUtxos.length; i++) {
    let selectedHex = selectedUtxos[i];
    let thisUtxo = utxos.filter(function (utxo) {
      return utxo.cbor === selectedHex;
    })[0];
    for (let assetId in thisUtxo.assets) {
      if (!(assetId in availableAssets)) {
        availableAssets[assetId] = 0;
      }
      availableAssets[assetId] += thisUtxo.assets[assetId];
    }
  }

  function add() {
    let newRecipients = [...recipients];
    newRecipients.push({
      address: '',
      assets: {},
    });
    setRecipients(newRecipients);
  }

  function remove(index) {
    let newRecipients = [...recipients];
    newRecipients.splice(index, 1);
    setRecipients(newRecipients);
  }

  function updateAddress(index, field, value) {
    let newRecipients = [...recipients];
    newRecipients[index][field] = value;
    setRecipients(newRecipients);
  }

  function addAsset(index, assetId) {
    let newRecipients = [...recipients];
    let startingAmount = 1;
    if (assetId == 'lovelace') {
      startingAmount = 1000000;
    }
    newRecipients[index].assets[assetId] = startingAmount;
    setRecipients(newRecipients);
  }

  function removeAsset(index, assetId) {
    let newRecipients = [...recipients];
    delete newRecipients[index].assets[assetId];
    setRecipients(newRecipients);
  }

  function updateAsset(index, assetId, value) {
    let newRecipients = [...recipients];
    let newValue = parseInt(value);
    if (availableAssets[assetId] >= newValue && newValue > 0) {
      newRecipients[index].assets[assetId] = newValue;
    }
    setRecipients(newRecipients);
  }

  return (
    <>
      <table className="border border-slate-300 w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="py-3 px-6">
              Recipients
            </th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {recipients.map((recipient, i) => {
            return (
              <tr key={i}>
                <td className="py-4 px-4 w-3/4">
                  <Input
                    value={recipient.address}
                    onChange={(e) =>
                      updateAddress(i, 'address', e.target.value)
                    }
                    placeholder="address"
                  />

                  <div className="py-4 px-4 w-full grid gap-4 grid-cols-1">
                    {Object.keys(recipient.assets).map((assetId, j) => {
                      return (
                        <div className="w-full grid gap-4 grid-cols-3" key={j}>
                          <b className="pt-4 capitalize">
                            {assetId.includes('.')
                              ? assetId.split('.')[1]
                              : assetId}
                          </b>

                          <div className="flex gap-4 w-max">
                            <Input
                              value={recipient.assets[assetId]}
                              onChange={(e) =>
                                updateAsset(i, assetId, e.target.value)
                              }
                              placeholder="quantity"
                              type="number"
                            />
                            <Button
                              onClick={() => removeAsset(i, assetId)}
                              style="error"
                              disabled={state == 1}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    <div className="relative">
                      <select
                        id="addasset"
                        className="block p-4 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={selectedAsset}
                        onChange={(e) => setSelectedAsset(e.target.value)}
                      >
                        <option value="">add an asset</option>
                        {Object.keys(availableAssets).map((assetId, i) => {
                          return (
                            <option value={assetId} key={i}>
                              {assetId.includes('.')
                                ? assetId.split('.')[1]
                                : assetId}
                            </option>
                          );
                        })}
                      </select>
                      <button
                        className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        onClick={() => addAsset(i, selectedAsset)}
                        disabled={selectedAsset == ''}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 w-3/4">
                  <Button
                    onClick={() => remove(i)}
                    style="error"
                    disabled={state == 1}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            );
          })}
          <tr>
            <td className="py-4 px-4" colSpan={3}>
              <Button
                onClick={() => add()}
                style="primary"
                className="block w-full"
                disabled={state == 1}
              >
                <PlusCircleIcon className="m-0 mr-2 w-6 h-6" />
                <span>Add recipient</span>
              </Button>
            </td>
          </tr>
        </tbody>
      </table>

      {showSelectAssetModal && (
        <SelectAssetModal showModal={setShowSelectAssetModal} />
      )}
    </>
  );
}

function CodeDemo({ recipients, state, setState, selectedUtxos }) {
  const { walletConnected } = useWallet();
  const [result, setResult] = useState<null | string>(null);
  const [ttl, setTtl] = useState('');
  const [message, setMessage] = useState('');
  const [changeAddress, setChangeAddress] = useState('');

  useEffect(() => {
    async function getWalletAddress() {
      setChangeAddress(await Mesh.wallet.getWalletAddress());
    }
    if (walletConnected) {
      getWalletAddress();
    }
  }, [walletConnected]);

  async function makeTransaction() {
    setState(1);

    try {
      let params = {
        inputs: selectedUtxos,
        outputs: recipients,
        blockfrostApiKey:
          (await Mesh.wallet.getNetworkId()) === 1
            ? process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY_MAINNET!
            : process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY_TESTNET!,
        network: await Mesh.wallet.getNetworkId(),
      };

      if (ttl) {
        // @ts-ignore
        params.ttl = ttl;
      }
      if (changeAddress) {
        // @ts-ignore
        params.changeAddress = changeAddress;
      }
      if (message) {
        // @ts-ignore
        params.message = message;
      }

      const tx = await Mesh.transaction.build(params);

      const signature = await Mesh.wallet.signTx({ tx });

      const txHash = await Mesh.wallet.submitTransaction({
        tx: tx,
        witnesses: [signature],
      });
      setResult(txHash);

      setState(2);
    } catch (error) {
      setResult(`${error}`);
      setState(0);
    }
  }

  let utxoSnippet = JSON.stringify(selectedUtxos, null, 2);
  utxoSnippet = utxoSnippet.replace(new RegExp('  ', 'g'), '    ');
  utxoSnippet = utxoSnippet.replace(new RegExp(']', 'g'), '  ]');

  let codeSnippet = `const recipients = ${JSON.stringify(recipients, null, 2)};

const tx = await Mesh.transaction.build({
  inputs: ${utxoSnippet},
  outputs: recipients,
  changeAddress: "${changeAddress}",`;

  if (ttl != '') {
    codeSnippet += `\n  ttl: ${ttl},`;
  }
  if (message != '') {
    codeSnippet += `\n  message: "${message}",`;
  }

  codeSnippet += `
  blockfrostApiKey: "BLOCKFROST_API_KEY",
  network: await Mesh.wallet.getNetworkId(),
});

const signature = await Mesh.wallet.signTx({ tx });

const txHash = await Mesh.wallet.submitTransaction({
  tx: tx,
  witnesses: [signature],
});`;

  return (
    <div className="grid gap-4 grid-cols-2">
      <div>
        <h4>Define transaction parameters</h4>

        <table className="border border-slate-300 w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <tbody>
            <tr>
              <td className="py-4 px-4 w-1/4">Change Address</td>
              <td className="py-4 px-4 w-3/4">
                <Input
                  value={changeAddress}
                  onChange={(e) => setChangeAddress(e.target.value)}
                  placeholder="change address"
                />
                <p>
                  Change Address - is a bech32 address that will receive the
                  remaining assets as &quot;change&quot;.
                </p>
              </td>
            </tr>
            <tr>
              <td className="py-4 px-4 w-1/4">TTL</td>
              <td className="py-4 px-4 w-3/4">
                <Input
                  value={ttl}
                  onChange={(e) => setTtl(e.target.value)}
                  placeholder="ttl"
                  type="number"
                />
                <p>
                  Time-to-live (TTL) - represents a slot, or deadline by which a
                  transaction must be submitted. The TTL is an absolute slot
                  number, rather than a relative one, which means that the --ttl
                  value should be greater than the current slot number. A
                  transaction becomes invalid once its ttl expires.
                </p>
              </td>
            </tr>
            <tr>
              <td className="py-4 px-4 w-1/4">Message</td>
              <td className="py-4 px-4 w-3/4">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="message"
                />
                <p>
                  Transaction message is introduced in{' '}
                  <a
                    href="https://cips.cardano.org/cips/cip20/"
                    rel="noreferrer"
                  >
                    CIP 20
                  </a>
                  , an optional metadata to add messages, comments or memos to
                  transactions.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
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
      </div>
    </div>
  );
}

function SelectAssetModal({ showModal }) {
  return (
    <Modal>
      <div className="text-center mb-8">
        <h2>Get started on Mesh</h2>
        <pre>yarn add @martifylabs/mesh</pre>

        <a
          href="https://github.com/MartifyLabs/mesh"
          className="mt-6 dark:text-white dark:hover:border-white text-base leading-none focus:outline-none hover:border-gray-800 focus:border-gray-800 border-b border-transparent text-center text-gray-800"
          target="_blank"
          rel="noreferrer"
        >
          Visit the Github repo for details
        </a>
      </div>

      <button
        className="text-gray-800 dark:text-gray-400 absolute top-8 right-8 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
        aria-label="close"
        onClick={() => showModal(false)}
      >
        <XIcon className="w-6 h-6" />
      </button>
    </Modal>
  );
}
