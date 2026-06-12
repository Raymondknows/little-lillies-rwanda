'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Loader } from 'lucide-react';

interface Component {
  id: string;
  name: string;
  maxScore: number;
  weight: number;
  sortOrder: number;
}

interface SetupWizardProps {
  assessmentId: string;
  onSetupComplete?: () => void;
  onCancel?: () => void;
}

export function AssessmentSetupWizard({
  assessmentId,
  onSetupComplete,
  onCancel,
}: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [components, setComponents] = useState<Component[]>([
    {
      id: 'comp-ca',
      name: 'Continuous Assessment',
      maxScore: 20,
      weight: 20,
      sortOrder: 1,
    },
    {
      id: 'comp-test',
      name: 'Test',
      maxScore: 20,
      weight: 20,
      sortOrder: 2,
    },
    {
      id: 'comp-exam',
      name: 'Examination',
      maxScore: 60,
      weight: 60,
      sortOrder: 3,
    },
  ]);

  // Load current configuration
  useEffect(() => {
    loadConfiguration();
  }, [assessmentId]);

  const loadConfiguration = async () => {
    try {
      const response = await fetch(`/api/assessments/setup/${assessmentId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.isConfigured && data.components) {
          setComponents(data.components);
          setIsConfigured(true);
          setMessage({ type: 'success', text: 'Assessment is already configured' });
          setStep(3); // Show completed state
        }
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
  };

  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  const isValidWeight = totalWeight === 100;

  const updateComponent = (index: number, field: string, value: any) => {
    const updated = [...components];
    updated[index] = {
      ...updated[index],
      [field]: field === 'weight' || field === 'maxScore' ? parseFloat(value) : value,
    };
    setComponents(updated);
  };

  const handleUseDefaults = () => {
    setComponents([
      {
        id: 'comp-ca',
        name: 'Continuous Assessment',
        maxScore: 20,
        weight: 20,
        sortOrder: 1,
      },
      {
        id: 'comp-test',
        name: 'Test',
        maxScore: 20,
        weight: 20,
        sortOrder: 2,
      },
      {
        id: 'comp-exam',
        name: 'Examination',
        maxScore: 60,
        weight: 60,
        sortOrder: 3,
      },
    ]);
    setMessage(null);
  };

  const handleSave = async () => {
    if (!isValidWeight) {
      setMessage({
        type: 'error',
        text: `Total weight must equal 100% (current: ${totalWeight}%)`,
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/assessments/setup/${assessmentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-school-id': localStorage.getItem('schoolId') || '',
        },
        body: JSON.stringify({ components }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save configuration');
      }

      const data = await response.json();
      setIsConfigured(true);
      setMessage({ type: 'success', text: data.message });
      setStep(3);

      // Callback after 1 second
      setTimeout(() => {
        onSetupComplete?.();
      }, 1000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save configuration',
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    // Welcome step
    return (
      <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Assessment Setup Wizard</h2>
          <p className="text-sm text-gray-600">
            Configure the grading structure for this assessment by defining the weight of each component.
          </p>
        </div>

        <div className="space-y-4 rounded-lg bg-blue-50 p-4">
          <h3 className="font-semibold text-blue-900">What You'll Do</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ Set weights for Continuous Assessment (CA), Test, and Exam</li>
            <li>✓ Ensure total weight equals 100%</li>
            <li>✓ Use defaults or customize as needed</li>
          </ul>
        </div>

        <div className="space-y-2 rounded-lg bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">⚠️ Important</p>
          <p className="text-sm text-amber-800">
            You can only configure this while the assessment is in DRAFT status. Once published, these settings are locked.
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => setStep(2)} className="flex-1" variant="default">
            Continue
          </Button>
          <Button onClick={onCancel} className="flex-1" variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    // Configuration step
    return (
      <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Define Component Weights</h2>
          <p className="text-sm text-gray-600">
            Total weight must equal 100%
          </p>
        </div>

        {message && (
          <div
            className={`flex gap-2 rounded-lg p-4 ${
              message.type === 'success'
                ? 'border border-green-200 bg-green-50'
                : 'border border-red-200 bg-red-50'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <p
              className={`text-sm ${
                message.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {components.map((component, index) => (
            <div key={component.id} className="space-y-2 rounded-lg border border-gray-200 p-4">
              <label className="text-sm font-semibold">{component.name}</label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-600">Max Score</label>
                  <input
                    type="number"
                    min="1"
                    value={component.maxScore}
                    onChange={(e) => updateComponent(index, 'maxScore', e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Weight %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={component.weight}
                    onChange={(e) => updateComponent(index, 'weight', e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Contribution</label>
                  <div className="rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                    {((component.weight / totalWeight) * 100).toFixed(0)}% of total
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Total Weight</span>
            <Badge
              variant={isValidWeight ? 'default' : 'error'}
              className="text-base"
            >
              {totalWeight}%
            </Badge>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            {isValidWeight
              ? '✓ Perfect! Total weight equals 100%'
              : `✗ Invalid. Currently ${totalWeight}%, need 100%`}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleUseDefaults}
            variant="outline"
            className="flex-1"
          >
            Reset to Defaults
          </Button>
          <Button
            onClick={() => setStep(1)}
            variant="outline"
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValidWeight || loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Configuration'
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    // Completion step
    return (
      <div className="space-y-6 rounded-lg border border-green-200 bg-green-50 p-6">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="mt-1 h-8 w-8 text-green-600 flex-shrink-0" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-green-900">Assessment Configured!</h2>
            <p className="text-sm text-green-800">
              Your assessment structure has been successfully configured.
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-lg bg-white p-4">
          <h3 className="font-semibold">Your Configuration</h3>
          <ul className="space-y-2 text-sm">
            {components.map((comp) => (
              <li key={comp.id} className="flex justify-between">
                <span className="text-gray-600">{comp.name}</span>
                <Badge variant="outline">{comp.weight}%</Badge>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2 rounded-lg bg-blue-50 p-4">
          <h3 className="font-semibold text-blue-900">Next Steps</h3>
          <ol className="space-y-1 text-sm text-blue-800">
            <li>1. Enter scores for each student</li>
            <li>2. Calculate grades</li>
            <li>3. Calculate positions</li>
            <li>4. Publish results</li>
          </ol>
        </div>

        <Button onClick={onSetupComplete} className="w-full">
          Continue to Results
        </Button>
      </div>
    );
  }

  return null;
}
