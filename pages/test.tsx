import { useEffect, useState } from 'react'

export default function TestEnv() {
  const [envStatus, setEnvStatus] = useState<{
    supabaseUrl: boolean;
    supabaseKey: boolean;
  }>({
    supabaseUrl: false,
    supabaseKey: false,
  });

  useEffect(() => {
    setEnvStatus({
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Environment Variables Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">NEXT_PUBLIC_SUPABASE_URL</h2>
          <div className={`text-${envStatus.supabaseUrl ? 'green' : 'red'}-600`}>
            {envStatus.supabaseUrl ? '✅ Set' : '❌ Not set'}
          </div>
          {envStatus.supabaseUrl && (
            <div className="mt-2 text-sm text-gray-600">
              Value starts with: {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20)}...
            </div>
          )}
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">NEXT_PUBLIC_SUPABASE_ANON_KEY</h2>
          <div className={`text-${envStatus.supabaseKey ? 'green' : 'red'}-600`}>
            {envStatus.supabaseKey ? '✅ Set' : '❌ Not set'}
          </div>
          {envStatus.supabaseKey && (
            <div className="mt-2 text-sm text-gray-600">
              Value starts with: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-600">
        <p>If variables are not set:</p>
        <ol className="list-decimal pl-5 mt-2 space-y-2">
          <li>Check that .env.local exists in your project root</li>
          <li>Verify that the variable names are exactly as shown</li>
          <li>Restart your Next.js development server</li>
          <li>Make sure there are no spaces in the .env.local file values</li>
        </ol>
      </div>
    </div>
  );
}
