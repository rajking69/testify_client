import { toast } from "sonner";

/**
 * Toast notification utilities using Sonner
 */

export function showSuccessToast(message: string, description?: string) {
  toast.success(message, {
    description,
    duration: 3000,
  });
}

export function showErrorToast(message: string, description?: string) {
  toast.error(message, {
    description,
    duration: 4000,
  });
}

export function showInfoToast(message: string, description?: string) {
  toast.info(message, {
    description,
    duration: 3000,
  });
}

export function showWarningToast(message: string, description?: string) {
  toast.warning(message, {
    description,
    duration: 3000,
  });
}

export function showLoadingToast(message: string) {
  return toast.loading(message, {
    duration: 10000,
  });
}

export function dismissToast(toastId: string | number) {
  toast.dismiss(toastId);
}

/**
 * Promise-based toast for async operations
 */
export async function withPromiseToast<T>(
  promise: Promise<T>,
  {
    loading,
    success,
    error,
  }: {
    loading: string;
    success: string;
    error: string;
  }
): Promise<T> {
  return toast.promise(promise, {
    loading,
    success,
    error,
  });
}