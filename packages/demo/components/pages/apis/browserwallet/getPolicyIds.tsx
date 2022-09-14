import { useState } from 'react';
import Codeblock from '../../../ui/codeblock';
import Card from '../../../ui/card';
import RunDemoButton from '../common/runDemoButton';
import RunDemoResult from '../common/runDemoResult';
import SectionTwoCol from '../common/sectionTwoCol';
import useWallet from '../../../../contexts/wallet';
import ConnectCipWallet from '../common/connectCipWallet';

export default function GetPolicyIds() {
  return (
    <SectionTwoCol
      sidebarTo="getPolicyIds"
      header="Get Policy IDs"
      leftFn={Left()}
      rightFn={Right()}
    />
  );
}

function Left() {
  return (
    <>
      <p>Return a list of assets' policy ID.</p>
      <Codeblock
        data={`const policyIds = await wallet.getPolicyIds();`}
        isJson={false}
      />
    </>
  );
}

function Right() {
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<null | any>(null);
  const { wallet, walletConnected, hasAvailableWallets } = useWallet();

  async function runDemo() {
    setLoading(true);
    let results = await wallet.getPolicyIds();
    setResponse(results);
    setLoading(false);
  }
  return (
    <>
      {hasAvailableWallets && (
        <Card>
          {walletConnected ? (
            <>
              <RunDemoButton
                runDemoFn={runDemo}
                loading={loading}
                response={response}
              />
              <RunDemoResult response={response} />
            </>
          ) : (
            <ConnectCipWallet />
          )}
        </Card>
      )}
    </>
  );
}
