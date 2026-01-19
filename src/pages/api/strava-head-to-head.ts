import type { NextApiRequest, NextApiResponse } from 'next';

type StravaActivity = {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  start_date: string;
};

type StravaAthlete = {
  id: number;
  firstname: string;
  lastname: string;
  profile: string;
};

type StravaStats = {
  all_run_totals: {
    distance: number;
    count: number;
  };
  ytd_run_totals: {
    distance: number;
    count: number;
  };
};

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

type StravaRunnerConfig = {
  id: string;
  token?: string;
  fallbackName: string;
};

const METERS_TO_MILES = 0.000621371;
const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

const mockResponse: HeadToHeadResponse = {
  goalMiles: 100,
  lastUpdated: new Date().toISOString(),
  athletes: [
    {
      id: 'athlete-1',
      name: 'Alex Rivera',
      avatarUrl:
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
      januaryMiles: 68.4,
      totalMiles: 512.7,
      longestRunMiles: 14.2,
      weeklyAverageMiles: 26.9,
      lastActivity: '2024-01-18T12:30:00Z',
      runs: [
        {
          id: 'run-1',
          athleteId: 'athlete-1',
          name: 'Lunchtime Tempo',
          date: '2024-01-18T12:30:00Z',
          distanceMiles: 6.4,
          durationMinutes: 52,
          pace: '8:05/mi'
        },
        {
          id: 'run-2',
          athleteId: 'athlete-1',
          name: 'River Loop',
          date: '2024-01-16T18:00:00Z',
          distanceMiles: 5.1,
          durationMinutes: 43,
          pace: '8:26/mi'
        },
        {
          id: 'run-3',
          athleteId: 'athlete-1',
          name: 'Long Run Saturday',
          date: '2024-01-13T14:00:00Z',
          distanceMiles: 12.2,
          durationMinutes: 111,
          pace: '9:05/mi'
        }
      ]
    },
    {
      id: 'athlete-2',
      name: 'Jordan Lee',
      avatarUrl:
        'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=200&q=80',
      januaryMiles: 74.8,
      totalMiles: 538.3,
      longestRunMiles: 16.0,
      weeklyAverageMiles: 29.4,
      lastActivity: '2024-01-19T07:45:00Z',
      runs: [
        {
          id: 'run-4',
          athleteId: 'athlete-2',
          name: 'Morning Hills',
          date: '2024-01-19T07:45:00Z',
          distanceMiles: 7.8,
          durationMinutes: 63,
          pace: '8:03/mi'
        },
        {
          id: 'run-5',
          athleteId: 'athlete-2',
          name: 'Recovery Jog',
          date: '2024-01-17T10:15:00Z',
          distanceMiles: 4.2,
          durationMinutes: 39,
          pace: '9:17/mi'
        },
        {
          id: 'run-6',
          athleteId: 'athlete-2',
          name: 'Sunday Endurance',
          date: '2024-01-14T09:00:00Z',
          distanceMiles: 13.6,
          durationMinutes: 122,
          pace: '8:58/mi'
        }
      ]
    }
  ]
};

const toMiles = (meters: number) => meters * METERS_TO_MILES;

const formatPace = (distanceMiles: number, durationMinutes: number) => {
  if (distanceMiles <= 0) return '—';
  const paceMinutes = durationMinutes / distanceMiles;
  const minutes = Math.floor(paceMinutes);
  const seconds = Math.round((paceMinutes - minutes) * 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}/mi`;
};

const buildJanuaryWindow = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const januaryStart = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
  const febStart = new Date(Date.UTC(year, 1, 1, 0, 0, 0));
  return {
    after: Math.floor(januaryStart.getTime() / 1000),
    before: Math.floor(febStart.getTime() / 1000)
  };
};

const weeksSinceJanuaryStart = () => {
  const now = new Date();
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0));
  const diffMs = Math.max(0, now.getTime() - yearStart.getTime());
  return Math.max(1, diffMs / (7 * 24 * 60 * 60 * 1000));
};

const fetchStrava = async <T,>(endpoint: string, token: string): Promise<T> => {
  const response = await fetch(`${STRAVA_API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Strava request failed: ${response.status}`);
  }

  return (await response.json()) as T;
};

const buildAthlete = async (runner: StravaRunnerConfig): Promise<Athlete> => {
  if (!runner.token) {
    return {
      ...mockResponse.athletes.find((athlete) => athlete.id === runner.id)!,
      name: runner.fallbackName
    };
  }

  const athlete = await fetchStrava<StravaAthlete>('/athlete', runner.token);
  const stats = await fetchStrava<StravaStats>(
    `/athletes/${athlete.id}/stats`,
    runner.token
  );

  const januaryWindow = buildJanuaryWindow();
  const activities = await fetchStrava<StravaActivity[]>(
    `/athlete/activities?after=${januaryWindow.after}&before=${januaryWindow.before}&per_page=50`,
    runner.token
  );

  const runs = activities
    .filter((activity) => activity.type === 'Run')
    .map((activity) => {
      const distanceMiles = toMiles(activity.distance);
      const durationMinutes = activity.moving_time / 60;
      return {
        id: `${activity.id}`,
        athleteId: runner.id,
        name: activity.name,
        date: activity.start_date,
        distanceMiles,
        durationMinutes,
        pace: formatPace(distanceMiles, durationMinutes)
      };
    })
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  const januaryMiles = runs.reduce((total, run) => total + run.distanceMiles, 0);
  const longestRunMiles = runs.reduce(
    (max, run) => Math.max(max, run.distanceMiles),
    0
  );
  const totalMiles = toMiles(stats.all_run_totals.distance);
  const weeklyAverageMiles =
    stats.ytd_run_totals.distance > 0
      ? toMiles(stats.ytd_run_totals.distance) / weeksSinceJanuaryStart()
      : 0;

  return {
    id: runner.id,
    name: `${athlete.firstname} ${athlete.lastname}`.trim() || runner.fallbackName,
    avatarUrl: athlete.profile,
    januaryMiles,
    totalMiles,
    longestRunMiles,
    weeklyAverageMiles,
    lastActivity: runs[0]?.date ?? new Date().toISOString(),
    runs: runs.slice(0, 6)
  };
};

const runners: StravaRunnerConfig[] = [
  {
    id: 'athlete-1',
    token: process.env.STRAVA_ATHLETE_ONE_TOKEN,
    fallbackName: 'Runner One'
  },
  {
    id: 'athlete-2',
    token: process.env.STRAVA_ATHLETE_TWO_TOKEN,
    fallbackName: 'Runner Two'
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HeadToHeadResponse>
) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  try {
    const athletes = await Promise.all(runners.map((runner) => buildAthlete(runner)));

    res.status(200).json({
      goalMiles: 100,
      lastUpdated: new Date().toISOString(),
      athletes
    });
  } catch (error) {
    console.error('Strava API error', error);
    res.status(200).json(mockResponse);
  }
}
