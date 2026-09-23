"use client";

/**
 * Unified Event Bus for Cross-Page Invalidation
 * Replaces scattered custom events and localStorage listeners
 * Provides a centralized way to communicate state changes across tabs and components
 */

type EventCallback<T = any> = (data: T) => void;

interface EventSubscription {
  unsubscribe: () => void;
}

class EventBus {
  private events: Map<string, Set<EventCallback>> = new Map();
  private storageListeners: Map<string, (event: StorageEvent) => void> = new Map();

  /**
   * Subscribe to an event
   */
  subscribe<T>(eventName: string, callback: EventCallback<T>): EventSubscription {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    
    this.events.get(eventName)!.add(callback);
    
    return {
      unsubscribe: () => {
        this.events.get(eventName)?.delete(callback);
      }
    };
  }

  /**
   * Emit an event to all subscribers
   */
  emit<T>(eventName: string, data: T): void {
    const callbacks = this.events.get(eventName);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to cross-tab localStorage changes for a specific key
   */
  subscribeToStorage(key: string, callback: (newValue: string | null) => void): EventSubscription {
    const handler = (event: StorageEvent) => {
      if (event.key === key) {
        callback(event.newValue);
      }
    };

    window.addEventListener('storage', handler);
    this.storageListeners.set(key, handler);

    return {
      unsubscribe: () => {
        window.removeEventListener('storage', handler);
        this.storageListeners.delete(key);
      }
    };
  }

  /**
   * Clear all subscriptions
   */
  clear(): void {
    this.events.clear();
    this.storageListeners.forEach(handler => {
      window.removeEventListener('storage', handler);
    });
    this.storageListeners.clear();
  }
}

// Singleton instance
export const eventBus = new EventBus();

// Pre-defined event names for type safety
export const AppEvents = {
  // Exam events
  EXAM_CREATED: 'exam:created',
  EXAM_UPDATED: 'exam:updated',
  EXAM_DELETED: 'exam:deleted',
  EXAM_PUBLISHED: 'exam:published',
  EXAM_PURCHASED: 'exam:purchased',
  
  // Submission events
  EXAM_SUBMITTED: 'exam:submitted',
  EXAM_GRADED: 'exam:graded',
  
  // Revenue events
  REVENUE_UPDATED: 'revenue:updated',
  PURCHASE_COMPLETED: 'purchase:completed',
  
  // Subscription events
  SUBSCRIPTION_ACTIVATED: 'subscription:activated',
  SUBSCRIPTION_EXPIRED: 'subscription:expired',
  SUBSCRIPTION_CANCELLED: 'subscription:cancelled',
  
  // User events
  USER_PROFILE_UPDATED: 'user:profile_updated',
  USER_DELETED: 'user:deleted',
  USER_ROLE_CHANGED: 'user:role_changed',
  
  // Practice events
  PRACTICE_SESSION_STARTED: 'practice:started',
  PRACTICE_SESSION_COMPLETED: 'practice:completed',
  PRACTICE_BOOKMARK_TOGGLED: 'practice:bookmark_toggled',
  
  // Dashboard refresh events
  DASHBOARD_REFRESH: 'dashboard:refresh',
  TEACHER_DASHBOARD_REFRESH: 'dashboard:teacher:refresh',
  STUDENT_DASHBOARD_REFRESH: 'dashboard:student:refresh',
  ADMIN_DASHBOARD_REFRESH: 'dashboard:admin:refresh',
  
  // Cache invalidation
  CACHE_INVALIDATE: 'cache:invalidate',
  CACHE_INVALIDATE_EXAMS: 'cache:invalidate:exams',
  CACHE_INVALIDATE_SUBMISSIONS: 'cache:invalidate:submissions',
  CACHE_INVALIDATE_REVENUE: 'cache:invalidate:revenue',
} as const;

// Type-safe event emission helpers
export function emitExamCreated(exam: any): void {
  eventBus.emit(AppEvents.EXAM_CREATED, exam);
  eventBus.emit(AppEvents.DASHBOARD_REFRESH, { type: 'exam', action: 'created' });
  eventBus.emit(AppEvents.TEACHER_DASHBOARD_REFRESH, { type: 'exam', action: 'created' });
  eventBus.emit(AppEvents.STUDENT_DASHBOARD_REFRESH, { type: 'exam', action: 'created' });
}

export function emitExamUpdated(exam: any): void {
  eventBus.emit(AppEvents.EXAM_UPDATED, exam);
  eventBus.emit(AppEvents.DASHBOARD_REFRESH, { type: 'exam', action: 'updated' });
}

export function emitExamDeleted(examId: string): void {
  eventBus.emit(AppEvents.EXAM_DELETED, { examId });
  eventBus.emit(AppEvents.DASHBOARD_REFRESH, { type: 'exam', action: 'deleted' });
}

export function emitExamPurchased(purchase: any): void {
  eventBus.emit(AppEvents.EXAM_PURCHASED, purchase);
  eventBus.emit(AppEvents.REVENUE_UPDATED, purchase);
  eventBus.emit(AppEvents.TEACHER_DASHBOARD_REFRESH, { type: 'revenue', action: 'purchase' });
  eventBus.emit(AppEvents.ADMIN_DASHBOARD_REFRESH, { type: 'revenue', action: 'purchase' });
}

export function emitExamSubmitted(submission: any): void {
  eventBus.emit(AppEvents.EXAM_SUBMITTED, submission);
  eventBus.emit(AppEvents.TEACHER_DASHBOARD_REFRESH, { type: 'submission', action: 'submitted' });
  eventBus.emit(AppEvents.STUDENT_DASHBOARD_REFRESH, { type: 'submission', action: 'submitted' });
}

export function emitSubscriptionChanged(userId: string, status: string): void {
  eventBus.emit(AppEvents.SUBSCRIPTION_ACTIVATED, { userId, status });
  eventBus.emit(AppEvents.DASHBOARD_REFRESH, { type: 'subscription', action: 'changed' });
}

export function emitPracticeSessionCompleted(session: any): void {
  eventBus.emit(AppEvents.PRACTICE_SESSION_COMPLETED, session);
  eventBus.emit(AppEvents.STUDENT_DASHBOARD_REFRESH, { type: 'practice', action: 'completed' });
}

export function emitCacheInvalidate(cacheType: string): void {
  eventBus.emit(AppEvents.CACHE_INVALIDATE, { cacheType });
}

export function emitDashboardRefresh(role: 'teacher' | 'student' | 'admin', data?: any): void {
  switch (role) {
    case 'teacher':
      eventBus.emit(AppEvents.TEACHER_DASHBOARD_REFRESH, data);
      break;
    case 'student':
      eventBus.emit(AppEvents.STUDENT_DASHBOARD_REFRESH, data);
      break;
    case 'admin':
      eventBus.emit(AppEvents.ADMIN_DASHBOARD_REFRESH, data);
      break;
  }
  eventBus.emit(AppEvents.DASHBOARD_REFRESH, { role, ...data });
}

export default eventBus;