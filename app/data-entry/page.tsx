'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ArrowLeft, MapPin, Camera, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface StageOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
}

const stageOptions: StageOption[] = [
  {
    id: 'pre-sowing',
    label: 'Pre-Sowing',
    description: 'Land preparation & schedule',
    icon: '🌱',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    id: 'sowing',
    label: 'Sowing & Emergence',
    description: 'Germination tracking',
    icon: '🌾',
    color: 'bg-green-50 border-green-200',
  },
  {
    id: 'growth',
    label: 'Growth & Tillering',
    description: 'Plant development monitoring',
    icon: '🌿',
    color: 'bg-emerald-50 border-emerald-200',
  },
  {
    id: 'rosette',
    label: 'Rosette Stage',
    description: 'Germination & fertility',
    icon: '🍃',
    color: 'bg-amber-50 border-amber-200',
  },
  {
    id: 'emergence',
    label: 'Emergence Stage',
    description: '10-15 days post-sowing',
    icon: '🌳',
    color: 'bg-teal-50 border-teal-200',
  },
];

export default function DataEntryPage() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  if (selectedStage) {
    return <DataEntryForm stageId={selectedStage} onBack={() => setSelectedStage(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold">
            FO
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Log Field Data</h1>
            <p className="text-xs text-slate-500">Select crop stage to begin</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-3">
        {/* Stage Selection Cards */}
        {stageOptions.map((stage) => (
          <button
            key={stage.id}
            onClick={() => setSelectedStage(stage.id)}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${stage.color} hover:shadow-md active:scale-95`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl">{stage.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{stage.label}</h3>
                  <p className="text-sm text-slate-600">{stage.description}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 mt-1" />
            </div>
          </button>
        ))}

        {/* Quick Tips */}
        <Card className="mt-8 p-4 bg-blue-50 border-blue-200">
          <h4 className="font-semibold text-sm text-blue-900 mb-2">Pro Tips</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Capture clear photos from multiple angles</li>
            <li>• Record data at consistent times daily</li>
            <li>• Use GPS for accurate farm location tracking</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

interface DataEntryFormProps {
  stageId: string;
  onBack: () => void;
}

function DataEntryForm({ stageId, onBack }: DataEntryFormProps) {
  const [formData, setFormData] = useState({
    visitDate: new Date().toISOString().split('T')[0],
    visitTime: new Date().toTimeString().slice(0, 5),
    location: '',
    gpsCoords: '',
    photos: [] as string[],
    observations: '',
    germination: '',
    soilMoisture: '',
    pests: '',
    diseases: '',
    treatments: '',
    fertilizer: '',
    irrigation: '',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoCapture = () => {
    setPhotoCount((prev) => prev + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onBack();
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-900 mb-2">Data Submitted!</h2>
          <p className="text-green-700 mb-6">Your field observations have been saved successfully.</p>
          <Button onClick={onBack} className="bg-green-600 hover:bg-green-700">
            Record Another Entry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-slate-900">Data Entry Form</h1>
            <p className="text-xs text-slate-500">{stageId.replace('-', ' ').toUpperCase()}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-4">
        {/* Location Section */}
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-600" />
            Location Information
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Visit Date</label>
              <input
                type="date"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Visit Time</label>
              <input
                type="time"
                name="visitTime"
                value={formData.visitTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Farm Location / Name</label>
              <input
                type="text"
                name="location"
                placeholder="Enter farm name or location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">GPS Coordinates (Optional)</label>
              <input
                type="text"
                name="gpsCoords"
                placeholder="Lat, Lng"
                value={formData.gpsCoords}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Photo Capture Section */}
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-600" />
            Photos & Evidence
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: Math.max(2, photoCount) }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={handlePhotoCapture}
                className="aspect-square rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-center transition-colors"
              >
                {i < photoCount ? (
                  <div className="text-center">
                    <Camera className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-xs text-slate-600">Photo {i + 1}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Add photo</p>
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">{photoCount} photo(s) added</p>
        </div>

        {/* Observations Section */}
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3">Field Observations</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Germination % (if applicable)</label>
              <select
                name="germination"
                value={formData.germination}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select...</option>
                <option value="0-25">0-25%</option>
                <option value="25-50">25-50%</option>
                <option value="50-75">50-75%</option>
                <option value="75-100">75-100%</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Soil Moisture Level</label>
              <select
                name="soilMoisture"
                value={formData.soilMoisture}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select...</option>
                <option value="dry">Dry</option>
                <option value="optimal">Optimal</option>
                <option value="wet">Wet</option>
                <option value="waterlogged">Waterlogged</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Pest Observations</label>
              <select
                name="pests"
                value={formData.pests}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">None observed</option>
                <option value="none">No pests</option>
                <option value="minor">Minor infestation</option>
                <option value="moderate">Moderate infestation</option>
                <option value="severe">Severe infestation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Diseases Observed</label>
              <select
                name="diseases"
                value={formData.diseases}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">None</option>
                <option value="leaf-spot">Leaf Spot</option>
                <option value="rust">Rust</option>
                <option value="powdery-mildew">Powdery Mildew</option>
                <option value="blight">Blight</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Treatments Applied</label>
              <textarea
                name="treatments"
                placeholder="List any treatments applied..."
                value={formData.treatments}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Fertilizer Applied (Optional)</label>
              <textarea
                name="fertilizer"
                placeholder="Type and amount..."
                value={formData.fertilizer}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Irrigation Details (Optional)</label>
              <textarea
                name="irrigation"
                placeholder="Amount, method, timing..."
                value={formData.irrigation}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Additional Notes</label>
              <textarea
                name="notes"
                placeholder="Any other observations or comments..."
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 sticky bottom-20">
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg">
            Submit Field Data
          </Button>
          <button
            type="button"
            onClick={onBack}
            className="w-full mt-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
