import { useSearchParams, useRouter } from "next/navigation";
import { FilterState } from "./types";

/**
 * Custom hook for managing URL-based state
 * Enables bookmarking, deep linking, and browser history navigation
 */
export function useUrlState<T extends Record<string, any>>(
  defaultState: T
) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get current state from URL params
  const getState = (): T => {
    const state: any = { ...defaultState };
    searchParams.forEach((value, key) => {
      if (key in defaultState) {
        const defaultValue = defaultState[key];
        if (typeof defaultValue === "number") {
          state[key] = Number(value);
        } else if (typeof defaultValue === "boolean") {
          state[key] = value === "true";
        } else {
          state[key] = value;
        }
      }
    });
    return state;
  };

  // Update state in URL
  const setState = (updates: Partial<T>) => {
    const current = getState();
    const newState = { ...current, ...updates };

    const params = new URLSearchParams();
    Object.entries(newState).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });

    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Reset to default state
  const resetState = () => {
    router.push("?", { scroll: false });
  };

  return {
    state: getState(),
    setState,
    resetState,
  };
}

/**
 * Hook for managing filter state with URL sync
 */
export function useFilterState(defaultFilters: Partial<FilterState>) {
  const { state, setState, resetState } = useUrlState<FilterState>({
    search: "",
    page: 1,
    pageSize: 10,
    ...defaultFilters,
  });

  const updateFilter = (key: keyof FilterState, value: any) => {
    setState({ [key]: value, page: 1 }); // Reset to page 1 on filter change
  };

  const updateFilters = (updates: Partial<FilterState>) => {
    setState({ ...updates, page: 1 });
  };

  const updateSearch = (search: string) => {
    setState({ search, page: 1 });
  };

  const updatePagination = (page: number, pageSize?: number) => {
    setState({ page, ...(pageSize && { pageSize }) });
  };

  const updateSort = (sortBy: string, sortOrder: "asc" | "desc") => {
    setState({ sortBy, sortOrder });
  };

  return {
    filters: state,
    updateFilter,
    updateFilters,
    updateSearch,
    updatePagination,
    updateSort,
    resetFilters: resetState,
  };
}

/**
 * Hook for managing tab state with URL sync
 */
export function useTabState(defaultTab: string) {
  const { state, setState } = useUrlState({ tab: defaultTab });

  const setTab = (tab: string) => {
    setState({ tab });
  };

  return {
    activeTab: state.tab,
    setTab,
  };
}

/**
 * Format URL search params for API calls
 */
export function formatSearchParams(params: URLSearchParams): Record<string, any> {
  const result: Record<string, any> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}