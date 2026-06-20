import { useState, useEffect } from "react";

interface UseAssessmentDataOptions {
  endpoint: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Custom hook to fetch assessment data from various roles
 * Eliminates boilerplate code in admin/teacher/parent results pages
 * 
 * Usage:
 * const { data, loading, error } = useAssessmentData({
 *   endpoint: '/api/admin/results/data'
 * });
 */
export function useAssessmentData({
  endpoint,
  onSuccess,
  onError,
}: UseAssessmentDataOptions) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
        onSuccess?.(result);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load data";
        setError(errorMessage);
        onError?.(errorMessage);
        console.error("Error fetching assessment data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, onSuccess, onError]);

  return { data, loading, error };
}

/**
 * Hook for fetching a single assessment by ID
 */
export function useAssessmentDetail(assessmentId: string) {
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assessmentId) {
      setLoading(false);
      return;
    }

    const fetchAssessment = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/assessments/${assessmentId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch assessment");
        }

        const data = await response.json();
        setAssessment(data.assessment || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId]);

  return { assessment, loading, error };
}
