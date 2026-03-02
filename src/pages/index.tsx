import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type RunEntry = {
  id: string;
  athleteId: string;
  name: string;
  date: string;
  distanceMiles: number;
  durationMinutes: number;
  pace: string;
};

type Athlete = {
  id: string;
  name: string;
  avatarUrl: string;
  januaryMiles: number;
  totalMiles: number;
  longestRunMiles: number;
  weeklyAverageMiles: number;
  lastActivity: string;
  runs: RunEntry[];
};

type HeadToHeadResponse = {
  goalMiles: number;
  lastUpdated: string;
  athletes: Athlete[];
};

const numberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

const formatMiles = (value: number) => `${numberFormatter.format(value)} mi`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

const getLeader = (athletes: Athlete[], metric: keyof Athlete) => {
  if (athletes.length === 0) return null;
  return athletes.reduce((leader, current) =>
    current[metric] > leader[metric] ? current : leader
  );
};

export default function Home() {
  const [dashboard, setDashboard] = useState<HeadToHeadResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setInterval>;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/strava-head-to-head');
        if (!response.ok) {
          throw new Error('Unable to load dashboard');
        }
        const data = (await response.json()) as HeadToHeadResponse;
        setDashboard(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Live feed unavailable. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    timeoutId = setInterval(fetchDashboard, 60000);

    return () => clearInterval(timeoutId);
  }, []);

  const goalMiles = dashboard?.goalMiles ?? 100;

  const combinedRuns = useMemo(() => {
    if (!dashboard) return [] as RunEntry[];
    return dashboard.athletes
      .flatMap((athlete) => athlete.runs)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [dashboard]);

  const januaryLeader = dashboard
    ? getLeader(dashboard.athletes, 'januaryMiles')
    : null;
  const totalLeader = dashboard ? getLeader(dashboard.athletes, 'totalMiles') : null;

  const goalProgress = (miles: number) =>
    Math.min(100, Math.round((miles / goalMiles) * 100));

  const milesToGoal = (miles: number) => Math.max(0, goalMiles - miles);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">January Strava Showdown</h1>
            <p className="text-slate-300 max-w-2xl">
              Head-to-head live dashboard tracking the 100-mile January goal and total
              distance leaderboard.
            </p>
          </div>
        </div>
      </header>

      <nav className="bg-slate-900/70 border-b border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex gap-6 py-4 text-sm">
            <Link href="/" className="text-white">
              Live Dashboard
            </Link>
            <Link href="/knowledge-base" className="text-slate-400 hover:text-white">
              Knowledge Base
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center">
            Loading live data...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-red-200">
            {error}
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-slate-400">
                        January 100-mile goal
                      </p>
                      <h2 className="text-2xl font-semibold">Race to 100 miles</h2>
                    </div>
                    <div className="text-right text-sm text-slate-400">
                      Last updated {dashboard ? formatDateTime(dashboard.lastUpdated) : ''}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {dashboard?.athletes.map((athlete) => (
                      <div key={athlete.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={athlete.avatarUrl}
                              alt={athlete.name}
                              className="h-12 w-12 rounded-full border border-slate-700"
                            />
                            <div>
                              <p className="font-semibold">{athlete.name}</p>
                              <p className="text-sm text-slate-400">
                                {formatMiles(athlete.januaryMiles)} so far
                              </p>
                            </div>
                          </div>
                          <p className="text-lg font-semibold">
                            {goalProgress(athlete.januaryMiles)}%
                          </p>
                        </div>
                        <div className="h-3 w-full rounded-full bg-slate-800">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-orange-400 to-pink-500"
                            style={{ width: `${goalProgress(athlete.januaryMiles)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Goal: {formatMiles(goalMiles)}</span>
                          <span>
                            {formatMiles(milesToGoal(athlete.januaryMiles))} to go
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-slate-400">
                        Total distance leaderboard
                      </p>
                      <h2 className="text-2xl font-semibold">Who goes the farthest?</h2>
                    </div>
                    <div className="text-sm text-slate-400">All-time to date</div>
                  </div>

                  <div className="grid gap-4">
                    {dashboard?.athletes.map((athlete) => (
                      <div
                        key={athlete.id}
                        className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{athlete.name}</p>
                            <p className="text-sm text-slate-400">Total mileage</p>
                          </div>
                          <p className="text-xl font-semibold">
                            {formatMiles(athlete.totalMiles)}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-slate-300">
                          <div>
                            <p className="text-xs uppercase text-slate-500">Longest run</p>
                            <p className="font-semibold">
                              {formatMiles(athlete.longestRunMiles)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-slate-500">Weekly avg</p>
                            <p className="font-semibold">
                              {formatMiles(athlete.weeklyAverageMiles)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-slate-500">Last activity</p>
                            <p className="font-semibold">{formatDate(athlete.lastActivity)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-950 p-6">
                  <h3 className="text-lg font-semibold mb-4">Current Leaders</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">January miles</span>
                      <span className="font-semibold">
                        {januaryLeader?.name ?? '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Total distance</span>
                      <span className="font-semibold">
                        {totalLeader?.name ?? '—'}
                      </span>
                    </div>
                    <div className="border-t border-slate-800 pt-4">
                      <p className="text-slate-400">Goal status</p>
                      <p className="text-2xl font-semibold">
                        {dashboard?.athletes.every((athlete) => athlete.januaryMiles >= goalMiles)
                          ? 'Both hit 100+'
                          : 'Keep pushing'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent runs</h3>
                  <div className="space-y-4 text-sm">
                    {combinedRuns.slice(0, 6).map((run) => {
                      const athlete = dashboard?.athletes.find(
                        (person) => person.id === run.athleteId
                      );
                      return (
                        <div key={run.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">
                              {athlete?.name ?? 'Runner'} • {run.name}
                            </p>
                            <p className="text-slate-400">
                              {formatDate(run.date)} • {run.pace} pace
                            </p>
                          </div>
                          <p className="font-semibold">{formatMiles(run.distanceMiles)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                  <h3 className="text-lg font-semibold mb-2">Live feed</h3>
                  <p className="text-sm text-slate-400">
                    Auto-refreshes every 60 seconds. Add
                    <code className="mx-1 rounded bg-slate-800 px-2 py-0.5 text-xs">
                      STRAVA_ATHLETE_ONE_TOKEN
                    </code>
                    and
                    <code className="mx-1 rounded bg-slate-800 px-2 py-0.5 text-xs">
                      STRAVA_ATHLETE_TWO_TOKEN
                    </code>
                    in
                    <code className="mx-1 rounded bg-slate-800 px-2 py-0.5 text-xs">
                      /api/strava-head-to-head
                    </code>
                    to pull real activities.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
