import { Loader2 } from 'lucide-react';

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
      <p className="mt-4 text-gray-500 text-lg font-medium">Loading...</p>
    </div>
  );
};

export default Loading;
