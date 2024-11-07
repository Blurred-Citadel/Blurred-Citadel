import React from 'react'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Blurred Citadel</h1>
      
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Key Stories</h2>
          <div className="space-y-4">
            {/* Example stories */}
            <div className="border-b pb-4">
              <h3 className="font-medium">Tech Workforce Trends</h3>
              <p className="text-gray-600 mt-1">Rising demand for remote tech workers signals structural shift in employment patterns.</p>
              <div className="mt-2 text-sm text-blue-600">Impact: High | Sector: Technology | Trend: Growing</div>
            </div>

            <div className="border-b pb-4">
              <h3 className="font-medium">Labor Market Update</h3>
              <p className="text-gray-600 mt-1">Skills shortage in key industries driving salary increases and recruitment challenges.</p>
              <div className="mt-2 text-sm text-blue-600">Impact: Medium | Sector: Cross-Industry | Trend: Persistent</div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Analysis</h2>
          <div className="prose">
            <p>Key takeaways from today's news:</p>
            <ul className="list-disc pl-4 space-y-2">
              <li>Remote work adoption continues to accelerate</li>
              <li>Skills shortages creating recruitment challenges</li>
              <li>Salary pressures increasing across sectors</li>
            </ul>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Action Items</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span>Review remote work policies for competitive alignment</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span>Monitor salary trends in key recruitment areas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Evaluate skill development opportunities</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
