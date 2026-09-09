import { useState, useEffect, useCallback, useRef } from "react";

export interface ProctoringConfig {
  isEnabled: boolean;
  maxViolations?: number;
  studentName?: string;
  studentEmail?: string;
  onViolation?: (count: number, reason: string) => void;
  onAutoSubmit?: (reason: string) => void;
}

export interface ProctoringState {
  violations: number;
  maxViolations: number;
  isFullscreen: boolean;
  lastViolationReason: string | null;
  showWarningModal: boolean;
  isTerminated: boolean;
  requestFullscreen: () => Promise<void>;
  dismissWarning: () => void;
}

export function useExamProctoring(config: ProctoringConfig): ProctoringState {
  const {
    isEnabled,
    maxViolations = 3,
    onViolation,
    onAutoSubmit,
  } = config;

  const [violations, setViolations] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastViolationReason, setLastViolationReason] = useState<string | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  const isTerminatedRef = useRef(false);
  const violationsRef = useRef(0);
  const ignoreNextBlurRef = useRef(false);

  // Sync ref with state
  useEffect(() => {
    violationsRef.current = violations;
  }, [violations]);

  // Request fullscreen wrapper
  const requestFullscreen = useCallback(async () => {
    if (typeof document === "undefined") return;
    try {
      const el = document.documentElement as any;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      console.warn("Fullscreen request denied or not supported:", err);
    }
  }, []);

  const handleViolation = useCallback(
    (reason: string) => {
      if (!isEnabled || isTerminatedRef.current) return;

      const nextCount = violationsRef.current + 1;
      setViolations(nextCount);
      violationsRef.current = nextCount;
      setLastViolationReason(reason);
      setShowWarningModal(true);

      if (onViolation) {
        onViolation(nextCount, reason);
      }

      // Check termination condition
      if (nextCount >= maxViolations) {
        isTerminatedRef.current = true;
        setIsTerminated(true);
        if (onAutoSubmit) {
          onAutoSubmit(reason);
        }
      }
    },
    [isEnabled, maxViolations, onViolation, onAutoSubmit]
  );

  const dismissWarning = useCallback(() => {
    setShowWarningModal(false);
  }, []);

  // 1. Fullscreen change listener
  useEffect(() => {
    if (!isEnabled || typeof document === "undefined") return;

    const checkFullscreen = () => {
      const fs = Boolean(
        document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).msFullscreenElement
      );
      setIsFullscreen(fs);

      // If exited fullscreen while exam is active
      if (!fs && !isTerminatedRef.current) {
        handleViolation("Exited Fullscreen mode. You must remain in Fullscreen during the exam.");
      }
    };

    document.addEventListener("fullscreenchange", checkFullscreen);
    document.addEventListener("webkitfullscreenchange", checkFullscreen);

    return () => {
      document.removeEventListener("fullscreenchange", checkFullscreen);
      document.removeEventListener("webkitfullscreenchange", checkFullscreen);
    };
  }, [isEnabled, handleViolation]);

  // 2. Tab switch & visibility change listener
  useEffect(() => {
    if (!isEnabled || typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.hidden && !isTerminatedRef.current) {
        handleViolation("Tab switch or application window change detected.");
      }
    };

    const handleWindowBlur = () => {
      if (ignoreNextBlurRef.current) {
        ignoreNextBlurRef.current = false;
        return;
      }
      setTimeout(() => {
        if (!document.hasFocus() && !isTerminatedRef.current) {
          handleViolation("Window focus lost. Navigating away from the exam is forbidden.");
        }
      }, 300);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [isEnabled, handleViolation]);

  // 3. Prevent right-click context menu, copy, cut, paste, and text selection
  useEffect(() => {
    if (!isEnabled || typeof document === "undefined") return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent key shortcuts (F12, DevTools, Ctrl+C, Ctrl+V, Ctrl+U, Ctrl+S, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c"))
      ) {
        e.preventDefault();
        return false;
      }

      if ((e.ctrlKey || e.metaKey) && ["c", "v", "x", "u", "s", "p"].includes(e.key.toLowerCase())) {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
          return;
        }
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEnabled]);

  return {
    violations,
    maxViolations,
    isFullscreen,
    lastViolationReason,
    showWarningModal,
    isTerminated,
    requestFullscreen,
    dismissWarning,
  };
}
