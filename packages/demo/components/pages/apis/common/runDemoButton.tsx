import { PlayIcon } from '@heroicons/react/24/solid';
import Button from '../../../ui/button';

export default function RunDemoButton({ runDemoFn, loading, response }) {
  return (
    <Button
      onClick={() => runDemoFn()}
      style={loading ? 'warning' : response !== null ? 'success' : 'light'}
      disabled={loading}
    >
      Run code snippet <PlayIcon className="w-4 h-8 ml-4" />
    </Button>
  );
}
