'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, GripVertical } from 'lucide-react';

interface AssessmentComponent {
  id: string;
  name: string;
  maxScore: number;
  weight: number;
  sortOrder: number;
}

interface AssessmentComponentsManagerProps {
  assessmentId: string;
  onSave?: () => void;
}

export function AssessmentComponentsManager({
  assessmentId,
  onSave,
}: AssessmentComponentsManagerProps) {
  const [components, setComponents] = useState<AssessmentComponent[]>([
    { id: '1', name: 'Continuous Assessment (CA)', maxScore: 30, weight: 20, sortOrder: 1 },
    { id: '2', name: 'Test', maxScore: 20, weight: 30, sortOrder: 2 },
    { id: '3', name: 'Examination', maxScore: 50, weight: 50, sortOrder: 3 },
  ]);

  const [newComponent, setNewComponent] = useState({ name: '', maxScore: 0, weight: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  const isValidWeight = totalWeight <= 100;

  const addComponent = async () => {
    if (!newComponent.name || newComponent.maxScore <= 0 || newComponent.weight <= 0) {
      setError('Please fill all fields with valid values');
      return;
    }

    if (totalWeight + newComponent.weight > 100) {
      setError(
        `Adding this component would exceed 100% total weight. Current: ${totalWeight}%, Adding: ${newComponent.weight}%`
      );
      return;
    }

    const component: AssessmentComponent = {
      id: `comp-${Date.now()}`,
      name: newComponent.name,
      maxScore: newComponent.maxScore,
      weight: newComponent.weight,
      sortOrder: components.length + 1,
    };

    setComponents([...components, component]);
    setNewComponent({ name: '', maxScore: 0, weight: 0 });
    setError('');
  };

  const removeComponent = (id: string) => {
    if (components.length === 1) {
      setError('You must have at least one component');
      return;
    }
    setComponents(components.filter((c) => c.id !== id));
  };

  const updateComponent = (id: string, field: string, value: any) => {
    const updated = components.map((c) =>
      c.id === id ? { ...c, [field]: field === 'weight' || field === 'maxScore' ? parseFloat(value) : value } : c
    );

    // Validate weights don't exceed 100%
    const newTotal = updated.reduce((sum, c) => sum + c.weight, 0);
    if (newTotal <= 100) {
      setComponents(updated);
      setError('');
    } else {
      setError(`Total weight cannot exceed 100% (would be ${newTotal}%)`);
    }
  };

  const saveComponents = async () => {
    if (!isValidWeight) {
      setError('Total weight must not exceed 100%');
      return;
    }

    setLoading(true);
    try {
      // Save components to backend
      const response = await fetch(`/api/admin/assessment-components/${assessmentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          components: components.map((c, idx) => ({
            ...c,
            sortOrder: idx + 1,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to save components');

      onSave?.();
    } catch (err: any) {
      setError(err.message || 'Failed to save components');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Assessment Components</h3>
        <p className="text-sm text-muted mb-4">
          Define how this assessment is scored. Components are flexible scoring categories (e.g., CA, Test, Exam).
        </p>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {components.map((component) => (
          <div key={component.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
            <GripVertical className="w-4 h-4 text-gray-400" />

            <input
              type="text"
              value={component.name}
              onChange={(e) => updateComponent(component.id, 'name', e.target.value)}
              placeholder="Component name"
              className="flex-1 px-2 py-1 border rounded text-sm"
            />

            <div className="flex gap-2">
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1">Max Score</label>
                <input
                  type="number"
                  value={component.maxScore}
                  onChange={(e) => updateComponent(component.id, 'maxScore', e.target.value)}
                  className="w-16 px-2 py-1 border rounded text-sm"
                  min="1"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1">Weight %</label>
                <input
                  type="number"
                  value={component.weight}
                  onChange={(e) => updateComponent(component.id, 'weight', e.target.value)}
                  className="w-16 px-2 py-1 border rounded text-sm"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <button
              onClick={() => removeComponent(component.id)}
              className="p-1 hover:bg-red-100 rounded text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium">Total Weight:</span>
          <Badge variant={isValidWeight ? 'default' : 'warning'}>{totalWeight}%</Badge>
        </div>
      </div>

      <div className="space-y-2 p-4 bg-gray-50 rounded border-2 border-dashed">
        <h4 className="font-medium text-sm">Add New Component</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={newComponent.name}
            onChange={(e) => setNewComponent({ ...newComponent, name: e.target.value })}
            placeholder="Component name (e.g., Assignment)"
            className="flex-1 px-3 py-2 border rounded text-sm"
          />
          <input
            type="number"
            value={newComponent.maxScore || ''}
            onChange={(e) => setNewComponent({ ...newComponent, maxScore: parseFloat(e.target.value) })}
            placeholder="Max score"
            className="w-20 px-2 py-2 border rounded text-sm"
            min="1"
          />
          <input
            type="number"
            value={newComponent.weight || ''}
            onChange={(e) => setNewComponent({ ...newComponent, weight: parseFloat(e.target.value) })}
            placeholder="Weight %"
            className="w-20 px-2 py-2 border rounded text-sm"
            min="0"
            max="100"
          />
          <Button onClick={addComponent} variant="outline" className="text-sm">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button variant="outline">Cancel</Button>
        <Button onClick={saveComponents} disabled={loading || !isValidWeight}>
          {loading ? 'Saving...' : 'Save Components'}
        </Button>
      </div>
    </div>
  );
}
