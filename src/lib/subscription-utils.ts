/**
 * Utility functions for handling subscription-related errors
 */

export interface SubscriptionError {
  isSubscriptionBlocked: boolean;
  reason: string;
}

/**
 * Check if a fetch response is due to subscription being blocked
 */
export async function checkSubscriptionError(response: Response): Promise<SubscriptionError | null> {
  if (response.status === 403) {
    try {
      const errorBody = await response.json();
      if (errorBody?.code === 'SUBSCRIPTION_INACTIVE') {
        return {
          isSubscriptionBlocked: true,
          reason: errorBody.reason || 'Your school subscription is not active',
        };
      }
    } catch (e) {
      // JSON parse failed, not a subscription error
    }
  }
  return null;
}

/**
 * Custom error class for subscription blocking
 */
export class SubscriptionBlockedError extends Error {
  reason: string;

  constructor(reason: string = 'Your school subscription is not active') {
    super('SUBSCRIPTION_BLOCKED');
    this.reason = reason;
    this.name = 'SubscriptionBlockedError';
  }
}
