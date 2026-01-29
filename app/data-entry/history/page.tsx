'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin, Image, FileText } from 'lucide-react';
import Link from 'next/link';

interface DataEntry {
  id: string;
  date: string;
  stage: string;
  farm: string;
  photos: number;
  germination?: string;
  soilMoisture?: string;
  pests?: string;
  diseases?: string;
  notes: string;
}

const recentEntries: DataEntry[] = [
  {
    id: '1',
    date: '2025-11-14',
    stage: 'Growth & Tillering',
    farm: 'North Field A',
    photos: 4,
    germination: '85-100%',
    soilMoisture: 'Optimal',
    pests: 'No pests',
    diseases: 'None',
    notes: 'Plants showing healthy growth. Applied micro-nutrients.',
  },
  {
    id: '2',
    date: '2025-11-13',
    stage: 'Sowing & Emergence',
    farm: 'South Field B',
    photos: 3,
    germination: '50-75%',
    soilMoisture: 'Optimal',
    pests: 'Minor infestation',
    diseases: 'None',
    notes: 'Good germination rate. Monitored for early pest control.',
  },
  {
    id: '3',
    date: '2025-11-12',
    stage: 'Pre-Sowing',
    farm: 'East Field C',
    photos: 2,
    notes: 'Land preparation complete. Ready for sowing.',
  },
];

export default function DataHistoryPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3">
          <Link href="/data-entry" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="font-semibold text-slate-900">Entry History</h1>
            <p className="text-xs text-slate-500">Recent field observations</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-3">
        {recentEntries.map((entry) => (
          <Card key={entry.id} className="p-4 border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{entry.stage}</h3>
                  <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" /> {entry.farm}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1 justify-end">
                    <Calendar className="w-4 h-4" /> {entry.date}
                  </p>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg">
                {entry.germination && (
                  <div className="text-xs">
                    <p className="text-slate-600">Germination</p>
                    <p className="font-semibold text-slate-900">{entry.germination}</p>
                  </div>
                )}
                {entry.soilMoisture && (
                  <div className="text-xs">
                    <p className="text-slate-600">Soil Moisture</p>
                    <p className="font-semibold text-slate-900">{entry.soilMoisture}</p>
                  </div>
                )}
                {entry.pests && (
                  <div className="text-xs">
                    <p className="text-slate-600">Pests</p>
                    <p className="font-semibold text-slate-900">{entry.pests}</p>
                  </div>
                )}
                {entry.diseases && (
                  <div className="text-xs">
                    <p className="text-slate-600">Diseases</p>
                    <p className="font-semibold text-slate-900">{entry.diseases}</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              <p className="text-sm text-slate-700 bg-blue-50 p-3 rounded-lg border border-blue-200">{entry.notes}</p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Image className="w-4 h-4" />
                  <span>{entry.photos} photos</span>
                </div>
                <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50">
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
