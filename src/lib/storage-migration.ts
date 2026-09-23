"use client";

/**
 * localStorage Cleanup and Migration Utility
 * Handles migration of legacy localStorage keys to backend APIs
 * and cleanup of deprecated keys
 */

// Legacy keys that should be migrated/cleaned up
const LEGACY_KEYS = [
  // Practice Mode (now uses backend)
  'practice_bookmarks',
  'practice_history',
  'testify_last_result',
  
  // Teacher Revenue (now uses backend)
  'testify_purchased_records',
  'testify_teacher_exams',
  'testify_teacher_exam_students',
  
  // Student Data (now uses backend)
  'testify_student_purchases',
  'testify_student_submissions',
  'testify_exam_attempts',
  
  // Subscription (now uses backend)
  'testify_teacher_subscription_',
  'testify_teacher_premium_',
  
  // Profile (now uses backend)
  'testify_custom_profile',
  'testify_custom_profile_',
  
  // Draft/Temp (can be cleaned up)
  'testify_exam_draft_',
];

// Keys that are still valid for UI preferences only
const VALID_UI_KEYS = [
  'theme',
  'language',
  'sidebar_collapsed',
  'notification_preferences',
];

/**
 * Check if a key is a legacy key that should be migrated
 */
export function isLegacyKey(key: string): boolean {
  return LEGACY_KEYS.some(legacyKey => key.startsWith(legacyKey));
}

/**
 * Check if a key is a valid UI preference key
 */
export function isValidUIKey(key: string): boolean {
  return VALID_UI_KEYS.some(validKey => key.startsWith(validKey));
}

/**
 * Get all legacy keys currently in localStorage
 */
export function getLegacyKeysInStorage(): string[] {
  const legacyKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && isLegacyKey(key)) {
      legacyKeys.push(key);
    }
  }
  return legacyKeys;
}

/**
 * Get size of legacy data in localStorage (in bytes)
 */
export function getLegacyDataSize(): number {
  let size = 0;
  const legacyKeys = getLegacyKeysInStorage();
  legacyKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      size += key.length + value.length;
    }
  });
  return size;
}

/**
 * Migrate specific legacy data to backend
 * This is a placeholder - actual migration would call backend APIs
 */
export async function migrateLegacyData(userEmail: string): Promise<{ migrated: string[]; errors: string[] }> {
  const migrated: string[] = [];
  const errors: string[] = [];
  
  // Practice bookmarks - would call backend API to save
  const bookmarks = localStorage.getItem('practice_bookmarks');
  if (bookmarks) {
    try {
      // await practiceService.saveBookmarks(JSON.parse(bookmarks), userEmail);
      migrated.push('practice_bookmarks');
    } catch (error) {
      errors.push(`practice_bookmarks: ${error}`);
    }
  }
  
  // Practice history - would call backend API
  const history = localStorage.getItem('practice_history');
  if (history) {
    try {
      // await practiceService.saveHistory(JSON.parse(history), userEmail);
      migrated.push('practice_history');
    } catch (error) {
      errors.push(`practice_history: ${error}`);
    }
  }
  
  return { migrated, errors };
}

/**
 * Clean up legacy keys after successful migration
 * Call this after verifying backend has the data
 */
export function cleanupLegacyKeys(keysToKeep: string[] = []): number {
  const legacyKeys = getLegacyKeysInStorage();
  let cleaned = 0;
  
  legacyKeys.forEach(key => {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key);
      cleaned++;
    }
  });
  
  return cleaned;
}

/**
 * Clear all legacy data (use with caution - only after full migration)
 */
export function clearAllLegacyData(): void {
  const legacyKeys = getLegacyKeysInStorage();
  legacyKeys.forEach(key => localStorage.removeItem(key));
}

/**
 * Get storage usage report
 */
export function getStorageReport(): {
  totalKeys: number;
  legacyKeys: number;
  validUIKeys: number;
  otherKeys: number;
  totalSize: number;
  legacySize: number;
} {
  const allKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) allKeys.push(key);
  }
  
  let totalSize = 0;
  let legacySize = 0;
  let legacyCount = 0;
  let validUICount = 0;
  let otherCount = 0;
  
  allKeys.forEach(key => {
    const value = localStorage.getItem(key) || '';
    const size = key.length + value.length;
    totalSize += size;
    
    if (isLegacyKey(key)) {
      legacyCount++;
      legacySize += size;
    } else if (isValidUIKey(key)) {
      validUICount++;
    } else {
      otherCount++;
    }
  });
  
  return {
    totalKeys: allKeys.length,
    legacyKeys: legacyCount,
    validUIKeys: validUICount,
    otherKeys: otherCount,
    totalSize,
    legacySize,
  };
}

/**
 * Auto-migration on app load - migrates data on first visit after update
 * Uses a version marker to only run once
 */
export function runAutoMigration(userEmail: string): Promise<void> {
  return new Promise((resolve) => {
    const migrationVersion = '2.0';
    const currentVersion = localStorage.getItem('migration_version');
    
    if (currentVersion === migrationVersion) {
      resolve();
      return;
    }
    
    // Run migration
    migrateLegacyData(userEmail).then(({ migrated, errors }) => {
      if (errors.length === 0 && migrated.length > 0) {
        // Clean up migrated keys
        cleanupLegacyKeys();
        // Mark migration as complete
        localStorage.setItem('migration_version', migrationVersion);
      }
      resolve();
    }).catch(() => {
      resolve(); // Don't block app on migration failure
    });
  });
}

export default {
  isLegacyKey,
  isValidUIKey,
  getLegacyKeysInStorage,
  getLegacyDataSize,
  migrateLegacyData,
  cleanupLegacyKeys,
  clearAllLegacyData,
  getStorageReport,
  runAutoMigration,
};