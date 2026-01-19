import type { NextApiRequest, NextApiResponse } from 'next';

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

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HeadToHeadResponse>
) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  res.status(200).json(mockResponse);
}
