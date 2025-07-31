export function MissingEnvBanner() {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 m-4">
      <div className="flex">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Missing Environment Variables
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              Please set up your Supabase environment variables:
            </p>
            <ul className="list-disc list-inside mt-1">
              <li>VITE_SUPABASE_URL</li>
              <li>VITE_SUPABASE_ANON_KEY</li>
            </ul>
            <p className="mt-2">
              Click "Connect to Supabase" in the top right to configure your project.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}