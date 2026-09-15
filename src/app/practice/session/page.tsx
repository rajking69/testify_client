"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { purchaseService } from "@/services/purchase.service";
import { examService } from "@/services/exam.service";
import { useExamProctoring } from "@/lib/use-exam-proctoring";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Bookmark,
  BookmarkCheck,
  RotateCcw,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Home,
  ShieldCheck,
  ShieldAlert,
  Maximize2,
  Minimize2,
  Flag,
  Layers,
  Save,
  Check,
  AlertTriangle,
  Camera,
  CameraOff,
  Video,
  Lock as LockIcon,
} from "lucide-react";
import { usePractice } from "@/lib/practice/practice-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { getMonitoringSocket } from "@/lib/socket-client";

function PracticeSessionContent() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    currentSession,
    setCurrentSession,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    userAnswers,
    setUserAnswers,
    timeRemaining,
    setTimeRemaining,
    isTimerRunning,
    setIsTimerRunning,
    toggleBookmark,
    endPracticeSession,
    config,
  } = usePractice();

  const [showEndModal, setShowEndModal] = useState(false);
  const [sessionLoadError, setSessionLoadError] = useState<string | null>(null);
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [paletteFilter, setPaletteFilter] = useState<"all" | "answered" | "unanswered" | "marked">("all");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [examEndDateTime, setExamEndDateTime] = useState<string | null>(null);
  const [proctorIncomingWarning, setProctorIncomingWarning] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isHighFreqStreaming, setIsHighFreqStreaming] = useState(false);
  const [isCamMinimized, setIsCamMinimized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setIsCamMinimized(true);
    }
  }, []);

  const studentId = useMemo(() => {
    if (session?.user?.id) return String(session.user.id);
    if (session?.user?.email) return session.user.email.replace(/[^a-zA-Z0-9]/g, "_");
    if (typeof window !== "undefined") {
      let cached = sessionStorage.getItem("testify_proctor_student_id");
      if (!cached) {
        cached = `student_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem("testify_proctor_student_id", cached);
      }
      return cached;
    }
    return "student_candidate";
  }, [session?.user?.id, session?.user?.email]);

  const examIdParam = searchParams.get("examId");

  const isCameraRequiredForExam = useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      const stored = localStorage.getItem("testify_active_live_exam");
      if (stored) {
        const parsed = JSON.parse(stored);
        return Boolean(parsed.requireCamera);
      }
    } catch {}
    return false;
  }, []);
  
  const isLiveExam = Boolean(examIdParam || config.mode === "timed");

  // Ref to end session to avoid circular deps
  const handleEndSessionRef = useRef<() => Promise<void>>(async () => { });


  // Browser Back Button Interceptor for Live Exam Security
  useEffect(() => {
    if (!isLiveExam || typeof window === "undefined") return;

    window.history.pushState(null, "", window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      console.error("[Proctoring] Browser Back button pressed during live exam. Auto-submitting exam.");
      handleEndSessionRef.current();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isLiveExam]);

  // 1. Setup Proctoring & Anti-Cheating Suite
  const {
    violations,
    maxViolations,
    isFullscreen,
    lastViolationReason,
    showWarningModal,
    isTerminated,
    requestFullscreen,
    dismissWarning,
  } = useExamProctoring({
    isEnabled: isLiveExam,
    maxViolations: 3,
    studentName: session?.user?.name || "Student Scholar",
    studentEmail: session?.user?.email || "student@example.com",
    onViolation: (count, reason) => {
      console.warn(`[Proctoring] Strike ${count}/3: ${reason}`);
    },
    onAutoSubmit: (reason) => {
      console.error(`[Proctoring] Auto-terminating exam session: ${reason}`);
      handleEndSessionRef.current();
    },
  });

  // 1.1 Socket.IO Live Monitoring & Proctor Connection
  useEffect(() => {
    if (!isLiveExam || !isCameraRequiredForExam) return;
    const socket = getMonitoringSocket();
    if (!socket) return;

    const currentExamId = searchParams.get("examId") || "live-session";
    const studentName = searchParams.get("name") || searchParams.get("studentName") || session?.user?.name || "Student Scholar";
    const studentEmail = searchParams.get("email") || searchParams.get("studentEmail") || session?.user?.email || "student@example.com";

    // Join room on monitoring server
    socket.emit("student:join", {
      studentId,
      name: studentName,
      email: studentEmail,
      examId: currentExamId,
      examTitle: searchParams.get("title") || "Live Examination",
      totalQuestions: currentSession?.length || 10,
    });

    const handleIncomingWarning = (data: { message: string; timestamp: string }) => {
      setProctorIncomingWarning(data.message || "Please adhere strictly to examination rules.");
    };

    const handleRemoteTerminate = (data: { reason?: string }) => {
      alert(data?.reason || "Your exam session has been terminated by the instructor/proctor.");
      handleEndSessionRef.current();
    };

    socket.on("proctor:warning", handleIncomingWarning);
    socket.on("proctor:terminate", handleRemoteTerminate);

    return () => {
      socket.off("proctor:warning", handleIncomingWarning);
      socket.off("proctor:terminate", handleRemoteTerminate);
      socket.emit("student:leave");
    };
  }, [isLiveExam, searchParams, session, currentSession?.length, studentId]);

  // 1.2 Emit continuous telemetry updates to teacher dashboard
  useEffect(() => {
    if (!isLiveExam || !currentSession || currentSession.length === 0) return;
    const socket = getMonitoringSocket();
    if (!socket) return;

    const answeredCount = Object.keys(userAnswers).length;
    const totalQuestions = currentSession.length;
    const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    const timeRemainingStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    socket.emit("student:telemetry", {
      studentId,
      progress: progressPercent,
      answeredCount,
      totalQuestions,
      timeRemaining: timeRemainingStr,
      tabSwitches: violations,
      focusLossCount: violations,
      status: violations >= 2 ? "Critical" : violations === 1 ? "Warning" : "Normal",
    });
  }, [isLiveExam, currentSession, userAnswers, violations, timeRemaining, studentId]);

  // 1.3 Live Proctoring WebCam Capture (High-Definition 720p 30fps)
  useEffect(() => {
    if (!isLiveExam) return;
    let localStream: MediaStream | null = null;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraError("Webcam not supported on this browser.");
          return;
        }

        let stream: MediaStream | null = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            },
            audio: false,
          });
        } catch (firstErr) {
          console.warn("Retrying webcam with default constraint:", firstErr);
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        localStream = stream;
        localStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(() => { });
          };
          videoRef.current.play().catch(() => { });
        }
        setCameraActive(true);
        setCameraError(null);
      } catch (err: any) {
        console.warn("[Proctoring WebCam] Access denied or unavailable:", err);
        setCameraActive(false);
        setCameraError("Webcam permission blocked or camera unavailable.");
      }
    }

    startCamera();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      localStreamRef.current = null;
    };
  }, [isLiveExam]);

  // 1.4 High-Resolution Snapshot Frame Generator (Fallback & Instant Preview)
  useEffect(() => {
    if (!isLiveExam || !cameraActive) return;
    const socket = getMonitoringSocket();
    if (!socket) return;

    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");

    const startHighFreq = () => setIsHighFreqStreaming(true);
    const stopHighFreq = () => setIsHighFreqStreaming(false);

    socket.on("proctor:start_video_stream", startHighFreq);
    socket.on("proctor:stop_video_stream", stopHighFreq);

    const intervalTime = isHighFreqStreaming ? 180 : 1200;

    const captureFrame = () => {
      if (videoRef.current && ctx) {
        try {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const frameBase64 = canvas.toDataURL("image/jpeg", 0.75);
          socket.emit("student:video_frame", {
            studentId,
            frame: frameBase64,
          });
        } catch { }
      }
    };

    // Capture first frame immediately
    const firstTimer = setTimeout(captureFrame, 150);

    const intervalId = setInterval(captureFrame, intervalTime);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(intervalId);
      socket.off("proctor:start_video_stream", startHighFreq);
      socket.off("proctor:stop_video_stream", stopHighFreq);
    };
  }, [isLiveExam, cameraActive, isHighFreqStreaming, studentId]);

  // 1.5 WebRTC Real-Time P2P HD Video Streaming to Teacher Dashboard
  useEffect(() => {
    if (!isLiveExam) return;
    const socket = getMonitoringSocket();
    if (!socket) return;

    const handleOffer = async (data: { teacherSocketId: string; offer: RTCSessionDescriptionInit }) => {
      try {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
        }

        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        });
        peerConnectionRef.current = pc;

        const activeStream = localStreamRef.current || (videoRef.current?.srcObject as MediaStream | null);
        if (activeStream) {
          activeStream.getTracks().forEach((track) => {
            track.enabled = true;
            pc.addTrack(track, activeStream);
          });
        }

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("webrtc:ice_candidate", {
              targetTeacherSocketId: data.teacherSocketId,
              fromStudentId: studentId,
              candidate: event.candidate,
            });
          }
        };

        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("webrtc:answer", {
          studentId,
          teacherSocketId: data.teacherSocketId,
          answer,
        });
      } catch (err) {
        console.warn("WebRTC answer negotiation error:", err);
      }
    };

    const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit }) => {
      try {
        if (peerConnectionRef.current && data.candidate) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (err) {
        console.warn("WebRTC candidate error on student:", err);
      }
    };

    const handleHangup = () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };

    socket.on("webrtc:offer", handleOffer);
    socket.on("webrtc:ice_candidate", handleIceCandidate);
    socket.on("webrtc:hangup", handleHangup);

    return () => {
      socket.off("webrtc:offer", handleOffer);
      socket.off("webrtc:ice_candidate", handleIceCandidate);
      socket.off("webrtc:hangup", handleHangup);
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, [isLiveExam, studentId]);

  // Auto-initialize exam session from URL query parameters or backend exam
  useEffect(() => {
    if (currentSession && currentSession.length > 0) return;

    const subjectParam = searchParams.get("subject");
    const currentExamId = searchParams.get("examId");

    // 0. Strict 1-Attempt Guard: Check if student has already completed this exam
    if (currentExamId && typeof window !== "undefined") {
      try {
        const storedSubs = JSON.parse(localStorage.getItem("testify_student_submissions") || "[]");
        const currentEmail = (session?.user?.email || "").trim().toLowerCase();
        const currentUserId = session?.user?.id;

        const alreadyTaken = storedSubs.find((sub: any) => {
          const matchExam =
            String(sub.examId) === currentExamId ||
            String(sub.id) === currentExamId ||
            sub.token === currentExamId;

          const matchUser =
            (currentEmail && sub.studentEmail && sub.studentEmail.trim().toLowerCase() === currentEmail) ||
            (currentUserId && sub.studentId && sub.studentId === currentUserId);

          return matchExam && matchUser;
        });

        if (alreadyTaken) {
          router.replace(`/practice/result?examId=${currentExamId}`);
          return;
        }
      } catch (e) {
        console.error("Retake guard error:", e);
      }
    }

    async function initializeQuestions() {
      let questionsToUse: any[] = [];
      let examDurationSec = 600; // 10 mins default

      if (currentExamId && typeof window !== "undefined") {
        // 1. Check if active live exam was stored by waiting room
        try {
          const storedActive = localStorage.getItem("testify_active_live_exam");
          if (storedActive) {
            const active = JSON.parse(storedActive);
            const isMatch =
              String(active.examId) === currentExamId ||
              String(active.id) === currentExamId ||
              active.token === currentExamId ||
              (active.joinCode && active.joinCode.toUpperCase() === currentExamId.toUpperCase());

            if ((isMatch || !active.examId) && active.questions && active.questions.length > 0) {
              if (active.duration) {
                examDurationSec = active.duration * 60;
              }
              if (active.endDateTime) {
                setExamEndDateTime(active.endDateTime);
                const endMs = new Date(active.endDateTime).getTime();
                if (!isNaN(endMs)) {
                  const remainingUntilEnd = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
                  if (remainingUntilEnd < examDurationSec) {
                    examDurationSec = remainingUntilEnd;
                  }
                }
              }
              questionsToUse = active.questions.map((q: any, idx: number) => ({
                id: q.id || q._id || `q-${idx}`,
                subject: active.subject || "Examination",
                topic: q.topic || "General",
                type: q.type || q.questionType?.toLowerCase() || "mcq",
                difficulty: q.difficulty?.toLowerCase() || "medium",
                questionText: q.questionText || q.text || q.question || "Examination Question",
                question: q.questionText || q.text || q.question || "Examination Question",
                options: q.options || [],
                correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
                explanation: q.explanation || "Official answer explanation.",
              }));
            }
          }
        } catch { }

        // 2. Check local teacher exams repository in localStorage (Fast & Offline)
        if (questionsToUse.length === 0) {
          try {
            const stored = localStorage.getItem("testify_teacher_exams");
            if (stored) {
              const list = JSON.parse(stored);
              const found = list.find(
                (e: any) =>
                  String(e.id) === currentExamId ||
                  String(e._id) === currentExamId ||
                  e.joinCode?.toUpperCase() === currentExamId.toUpperCase() ||
                  e.accessToken === currentExamId
              );
              if (found) {
                if (found.duration) {
                  examDurationSec = found.duration * 60;
                }
                if (found.endDateTime) {
                  setExamEndDateTime(found.endDateTime);
                  const endMs = new Date(found.endDateTime).getTime();
                  if (!isNaN(endMs)) {
                    const remainingUntilEnd = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
                    if (remainingUntilEnd < examDurationSec) {
                      examDurationSec = remainingUntilEnd;
                    }
                  }
                }
                if (found.questions && found.questions.length > 0) {
                  questionsToUse = found.questions.map((q: any, idx: number) => ({
                    id: q.id || q._id || `q-${idx}`,
                    subject: found.subject || "Examination",
                    topic: q.topic || "General",
                    type: q.type || "mcq",
                    difficulty: q.difficulty || "medium",
                    questionText: q.questionText || q.text || q.question || "Sample examination question",
                    question: q.questionText || q.text || q.question || "Sample examination question",
                    options: q.options || [],
                    correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
                    explanation: q.explanation || "Official answer explanation provided by instructor.",
                  }));
                }
              }
            }
          } catch { }
        }

        // 3. If not found in local stores, fetch from remote backend REST API gracefully
        if (questionsToUse.length === 0) {
          try {
            const single = await examService.getExamById(currentExamId).catch(() => null);
            if (single?.data && single.data.questions && single.data.questions.length > 0) {
              if (single.data.durationMinutes) {
                examDurationSec = single.data.durationMinutes * 60;
              }
              const remoteEnd = (single.data as any).endDateTime;
              if (remoteEnd) {
                setExamEndDateTime(remoteEnd);
                const endMs = new Date(remoteEnd).getTime();
                if (!isNaN(endMs)) {
                  const remainingUntilEnd = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
                  if (remainingUntilEnd < examDurationSec) {
                    examDurationSec = remainingUntilEnd;
                  }
                }
              }
              questionsToUse = single.data.questions.map((q: any, idx: number) => ({
                id: q.id || q._id || `q-${idx}`,
                subject: single.data.subject || single.data.category || "Examination",
                topic: q.topic || "General",
                type: q.type || q.questionType?.toLowerCase() || "mcq",
                difficulty: q.difficulty?.toLowerCase() || "medium",
                questionText: q.questionText || q.text || q.question || "Examination Question",
                question: q.questionText || q.text || q.question || "Examination Question",
                options: q.options || [],
                correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
                explanation: q.explanation || "Official answer explanation.",
              }));
            }
          } catch { }
        }
      }

      // If no questions found for this exam, set error
      if (questionsToUse.length === 0) {
        setSessionLoadError("No examination questions are configured for this session. Please contact your instructor.");
        return;
      }

      if (questionsToUse.length > 0) {
        setCurrentSession(questionsToUse);
        setCurrentQuestionIndex(0);

        // Check for saved draft to restore progress after accidental refresh/crash
        if (currentExamId && typeof window !== "undefined") {
          try {
            const draftRaw = localStorage.getItem(`testify_exam_draft_${currentExamId}`);
            if (draftRaw) {
              const draft = JSON.parse(draftRaw);
              if (draft.answers && Object.keys(draft.answers).length > 0) {
                setUserAnswers(draft.answers);
              } else {
                setUserAnswers({});
              }
              if (draft.marked && Array.isArray(draft.marked)) {
                setMarkedForReview(new Set(draft.marked));
              }
              if (draft.currentIndex !== undefined && draft.currentIndex < questionsToUse.length) {
                setCurrentQuestionIndex(draft.currentIndex);
              }
              if (draft.timeRemaining && draft.timeRemaining > 0) {
                examDurationSec = draft.timeRemaining;
              }
            } else {
              setUserAnswers({});
            }
          } catch {
            setUserAnswers({});
          }
        } else {
          setUserAnswers({});
        }

        setTimeRemaining(examDurationSec);
        setIsTimerRunning(true);
      }
    }

    initializeQuestions();
  }, [
    currentSession,
    searchParams,
    setCurrentSession,
    setCurrentQuestionIndex,
    setUserAnswers,
    setTimeRemaining,
    setIsTimerRunning,
    router,
    session,
  ]);

  // 2. Auto-Save Draft on every answer or state change
  useEffect(() => {
    if (!examIdParam || !currentSession || currentSession.length === 0) return;
    try {
      localStorage.setItem(
        `testify_exam_draft_${examIdParam}`,
        JSON.stringify({
          answers: userAnswers,
          marked: Array.from(markedForReview),
          currentIndex: currentQuestionIndex,
          timeRemaining,
          savedAt: new Date().toISOString(),
        })
      );
      setLastSavedTime(new Date().toLocaleTimeString());
    } catch { }
  }, [userAnswers, markedForReview, currentQuestionIndex, timeRemaining, examIdParam, currentSession]);

  // Derive selectedAnswer from userAnswers instead of using useEffect
  const selectedAnswer =
    currentSession && currentSession[currentQuestionIndex] && userAnswers[currentSession[currentQuestionIndex].id] !== undefined
      ? userAnswers[currentSession[currentQuestionIndex].id]
      : null;

  const showExplanation = false;

  const handleEndSession = async () => {
    const result = endPracticeSession();

    try {
      const currentExamId = searchParams.get("examId");
      const subjectParam = searchParams.get("subject") || (currentSession && currentSession[0]?.subject) || "Computer Science";

      let examTitle = "Live Assessment Examination";
      let examDuration = "30 mins";
      let studentEmail = searchParams.get("email") || searchParams.get("studentEmail") || session?.user?.email || "";
      let studentName = searchParams.get("name") || searchParams.get("studentName") || session?.user?.name || "Student Scholar";

      const activeExamRaw = localStorage.getItem("testify_active_live_exam");
      if (activeExamRaw) {
        try {
          const parsed = JSON.parse(activeExamRaw);
          if (parsed.title) examTitle = parsed.title;
          if (parsed.duration) examDuration = `${parsed.duration} mins`;
          if (parsed.studentEmail) studentEmail = parsed.studentEmail;
          if (parsed.studentName) studentName = parsed.studentName;
        } catch { }
      }

      const teacherExamsRaw = localStorage.getItem("testify_teacher_exams");
      if (teacherExamsRaw && examTitle === "Live Assessment Examination") {
        try {
          const tList = JSON.parse(teacherExamsRaw);
          const found = tList.find((e: any) => String(e.id) === currentExamId || e.joinCode === currentExamId || e.accessToken === currentExamId);
          if (found) {
            examTitle = found.title;
            examDuration = `${found.duration || 30} mins`;
          }
        } catch { }
      }

      const finalEmail = studentEmail || session?.user?.email || "student@example.com";
      const finalName = studentName || session?.user?.name || "Student Scholar";

      const newSubmission = {
        id: currentExamId || `sub-${Date.now()}`,
        examId: currentExamId || `sub-${Date.now()}`,
        title: examTitle,
        subject: subjectParam,
        duration: examDuration,
        schedule: `Completed on ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        status: "Completed",
        score: `${result.scorePercentage}%`,
        percentage: result.scorePercentage,
        isPassed: result.scorePercentage >= 40,
        studentEmail: finalEmail,
        studentName: finalName,
        token: currentExamId || "exam_session",
        completedAt: new Date().toISOString(),
        timeTakenSeconds: result.timeSpentSeconds || 600,
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
        questions: result.questions || currentSession,
        userAnswers: result.userAnswers || userAnswers,
      };

      const storedSubs = JSON.parse(localStorage.getItem("testify_student_submissions") || "[]");
      const filtered = storedSubs.filter((s: any) => !(String(s.examId) === String(newSubmission.examId) && (s.studentEmail === newSubmission.studentEmail || !s.studentEmail)));
      const updated = [newSubmission, ...filtered];
      localStorage.setItem("testify_student_submissions", JSON.stringify(updated));

      // Clean up the draft after successful completion
      if (currentExamId) {
        try {
          localStorage.removeItem(`testify_exam_draft_${currentExamId}`);
        } catch { }
      }

      // Submit directly to backend API if this is an official examination
      if (currentExamId) {
        try {
          const apiAnswers = Object.entries(userAnswers).map(([k, v]) => ({
            questionId: String(k),
            selectedOptionIndex: typeof v === "number" ? v : (!isNaN(Number(v)) ? Number(v) : 0),
            submittedAnswer: String(v),
          }));
          await examService.submitExam(currentExamId, apiAnswers);
        } catch (apiErr) {
          console.warn("Backend API exam submission note:", apiErr);
        }
      }

      const storedHist = JSON.parse(localStorage.getItem("testify_practice_history") || "[]");
      localStorage.setItem("testify_practice_history", JSON.stringify([newSubmission, ...storedHist]));

      try {
        purchaseService.saveAttempt({
          id: newSubmission.id,
          studentId: session?.user?.id || "student-1",
          studentName: finalName,
          studentEmail: finalEmail,
          examId: currentExamId || newSubmission.id,
          examTitle: examTitle,
          subject: subjectParam,
          startTime: new Date(Date.now() - (result.timeSpentSeconds || 600) * 1000).toISOString(),
          endTime: new Date().toISOString(),
          submissionTime: new Date().toISOString(),
          durationMinutes: Math.max(1, Math.round((result.timeSpentSeconds || 600) / 60)),
          status: "SUBMITTED",
          answers: Object.fromEntries(Object.entries(userAnswers).map(([k, v]) => [k, String(v)])),
          score: result.correctAnswers,
          totalMarks: result.totalQuestions,
          passMark: Math.ceil(result.totalQuestions * 0.4),
          passed: result.scorePercentage >= 40,
          evaluationStatus: "AUTO_EVALUATED",
        });
      } catch { }

      window.dispatchEvent(new CustomEvent("testify_exam_submitted", { detail: newSubmission }));
      window.dispatchEvent(new Event("storage"));

      try {
        const socket = getMonitoringSocket();
        if (socket) {
          socket.emit("student:submit_result", newSubmission);
          socket.emit("student:leave", newSubmission);
        }
      } catch { }

      if (videoRef.current && videoRef.current.srcObject) {
        try {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach((t) => t.stop());
        } catch { }
      }
    } catch (e) {
      console.error("Failed to save student submission", e);
    }

    router.push("/practice/result");
  };

  handleEndSessionRef.current = handleEndSession;

  const endPracticeSessionRef = useRef(endPracticeSession);
  const routerRef = useRef(router);

  useEffect(() => {
    endPracticeSessionRef.current = endPracticeSession;
    routerRef.current = router;
  }, [endPracticeSession, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        // Absolute End Date & Time cutoff check: Auto save and auto-submit
        if (examEndDateTime) {
          const endMs = new Date(examEndDateTime).getTime();
          if (!isNaN(endMs) && Date.now() >= endMs) {
            console.warn("[Session] Exam deadline reached! Triggering auto-submit...");
            setIsTimerRunning(false);
            setTimeRemaining(0);
            handleEndSessionRef.current();
            return;
          }
        }

        setTimeRemaining((prev: number) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeRemaining, examEndDateTime, setTimeRemaining, setIsTimerRunning]);

  // Auto-submit when timer reaches zero
  useEffect(() => {
    if (!isTimerRunning && timeRemaining === 0 && config.mode === "timed") {
      handleEndSessionRef.current();
    }
  }, [isTimerRunning, timeRemaining, config.mode]);

  // Palette filtered items (Must be declared before any early returns to satisfy React Rules of Hooks)
  const filteredIndices = useMemo(() => {
    if (!currentSession || currentSession.length === 0) return [];
    return currentSession
      .map((q, idx) => ({ q, idx }))
      .filter(({ q, idx }) => {
        const isAns = userAnswers[q.id] !== undefined;
        const isRev = markedForReview.has(q.id);

        if (paletteFilter === "answered") return isAns;
        if (paletteFilter === "unanswered") return !isAns;
        if (paletteFilter === "marked") return isRev;
        return true;
      })
      .map(({ idx }) => idx);
  }, [currentSession, userAnswers, markedForReview, paletteFilter]);

  if (session?.user?.role === "teacher") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FAF8F5] via-[#F4F9FD] to-[#FAF8F5] dark:from-[#030712] dark:via-[#090d16] dark:to-[#0f172a] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md bg-white dark:bg-slate-900 p-8 rounded-3xl border border-amber-300 dark:border-amber-800 shadow-xl">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold font-display text-[#0B2238] dark:text-white">
            Teacher Access Restricted
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            You are currently logged in as a <strong>Teacher ({session?.user?.email})</strong>. Teachers are strictly prohibited from attempting or submitting practice tests and examinations.
          </p>
          <div className="pt-3 flex flex-col gap-2">
            <Link href="/teacher/dashboard">
              <Button className="w-full bg-[#152234] text-white text-xs font-bold h-10 rounded-xl">
                Go to Teacher Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (sessionLoadError) {
    const currentExamId = searchParams.get("examId");
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FAF8F5] via-[#F4F9FD] to-[#FAF8F5] dark:from-[#030712] dark:via-[#090d16] dark:to-[#0f172a] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <AlertCircle className="h-14 w-14 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold font-display text-[#0B2238] dark:text-white">
            Questions Unavailable
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {sessionLoadError}
          </p>
          <div className="pt-3 flex gap-2 justify-center">
            {currentExamId && (
              <Link href={`/exam/${currentExamId}`}>
                <Button className="bg-[#0092E3] text-white text-xs font-semibold px-5">
                  Back to Exam Room
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button variant="outline" className="text-xs px-5">
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentSession || currentSession.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FAF8F5] via-[#F4F9FD] to-[#FAF8F5] dark:from-[#030712] dark:via-[#090d16] dark:to-[#0f172a] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto" />
          <h2 className="text-2xl font-bold text-[#0B2238] dark:text-white">
            No Active Session
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Please configure and start a practice session first.
          </p>
          <Button onClick={() => router.push("/practice")}>
            Back to Practice Setup
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = currentSession[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / currentSession.length) * 100;
  const answeredCount = Object.keys(userAnswers).length;
  const currentQuestionId = currentQuestion?.id;
  const isCurrentMarked = markedForReview.has(currentQuestionId);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (answer: string | number) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion.id]: answer,
    });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentSession.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleClearAnswer = () => {
    const newAnswers = { ...userAnswers };
    delete newAnswers[currentQuestion.id];
    setUserAnswers(newAnswers);
  };

  const handleBookmarkToggle = () => {
    toggleBookmark(currentQuestion.id);
  };

  const handleToggleMarkForReview = () => {
    if (!currentQuestionId) return;
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestionId)) {
        next.delete(currentQuestionId);
      } else {
        next.add(currentQuestionId);
      }
      return next;
    });
  };

  const handleNavigationClick = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const isBookmarked = currentQuestion.isBookmarked;

  return (
    <div className="relative min-h-screen select-none bg-gradient-to-b from-[#FAF8F5] via-[#F4F9FD] to-[#FAF8F5] dark:from-[#030712] dark:via-[#090d16] dark:to-[#0f172a] text-[#0B2238] dark:text-slate-100 pt-6 pb-28 sm:pb-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle Security Watermark (Clean & Non-Intrusive) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 select-none overflow-hidden opacity-[0.04] dark:opacity-[0.06] flex flex-wrap justify-around content-around p-12 text-slate-700 dark:text-slate-300 font-mono text-xs rotate-[-15deg]"
      >
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="whitespace-nowrap select-none m-8">
            {session?.user?.email || (typeof window !== "undefined" && JSON.parse(localStorage.getItem("testify_active_live_exam") || "{}")?.studentEmail) || "STUDENT"} • {examIdParam ? `ROOM: ${examIdParam.toUpperCase()}` : "TESTIFY SECURE"}
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Top Control Bar: Home, Proctoring Badges, Fullscreen, and Auto-Save */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4"
        >
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push("/")} className="h-9 rounded-xl">
              <span className="flex items-center gap-2 text-xs">
                <Home className="h-4 w-4" />
                Back to Home
              </span>
            </Button>

            {isLiveExam && isCameraRequiredForExam && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Anti-Cheating Monitored</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Strikes Counter */}
            {isLiveExam && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all ${violations === 0
                    ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    : violations === 1
                      ? "bg-amber-100 dark:bg-amber-950/80 border-amber-400 text-amber-900 dark:text-amber-200 animate-pulse"
                      : "bg-rose-100 dark:bg-rose-950/80 border-rose-400 text-rose-900 dark:text-rose-200 animate-bounce"
                  }`}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Strikes: {violations}/{maxViolations}</span>
              </div>
            )}

            {/* Fullscreen Button */}
            {isLiveExam && (
              <Button
                variant={isFullscreen ? "outline" : "primary"}
                size="sm"
                onClick={requestFullscreen}
                className="h-9 rounded-xl text-xs font-semibold"
              >
                <Maximize2 className="h-3.5 w-3.5 mr-1.5" />
                {isFullscreen ? "Fullscreen Active" : "Enter Fullscreen"}
              </Button>
            )}

            {/* Auto-Save Indicator */}
            {lastSavedTime && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <Save className="h-3 w-3 text-emerald-500" />
                Auto-saved {lastSavedTime}
              </span>
            )}
          </div>
        </motion.div>

        {/* Header with Subject & Timer */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Badge variant="primary" className="text-xs font-bold uppercase tracking-wider">
              {config.mode} Examination
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {currentQuestion.subject}
            </Badge>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Cutoff Deadline Badge */}
            {examEndDateTime && !isNaN(new Date(examEndDateTime).getTime()) && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold">
                <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>
                  Cutoff: {new Date(examEndDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            )}

            {/* Timer Display with Pulsing Low Time Warning */}
            {config.mode === "timed" && (
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-lg transition-all ${timeRemaining < 120
                    ? "bg-rose-100 dark:bg-rose-950/80 border-rose-400 text-rose-700 dark:text-rose-300 animate-pulse shadow-lg shadow-rose-500/20"
                    : timeRemaining < 300
                      ? "bg-amber-100 dark:bg-amber-950/80 border-amber-400 text-amber-800 dark:text-amber-200"
                      : "bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                  }`}
              >
                <Clock className={`h-5 w-5 ${timeRemaining < 120 ? "animate-spin text-rose-600" : ""}`} />
                <span>{formatTime(timeRemaining)}</span>
                {timeRemaining < 120 && (
                  <span className="text-[10px] font-sans uppercase font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded">
                    Ending Soon
                  </span>
                )}
              </div>
            )}

            {config.mode !== "timed" && isTimerRunning && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-lg">
                <Clock className="h-5 w-5" />
                {formatTime(timeRemaining)}
              </div>
            )}
          </div>
        </motion.div>

        
        {/* Strict Linear Exam Warning Callout */}
        {isLiveExam && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-between gap-2 shadow-2xs">
            <span className="flex items-center gap-2">
              <LockIcon className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Strict Linear Exam: Going back to previous questions is strictly forbidden. Navigating backward will auto-submit your exam.</span>
            </span>
            <span className="text-[10px] bg-amber-200 dark:bg-amber-900 px-2 py-0.5 rounded text-amber-900 dark:text-amber-100 font-extrabold uppercase shrink-0">
              Forward Only
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span>
              Question {currentQuestionIndex + 1} of {currentSession.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-[#00A3C4] to-[#0284C7] dark:from-cyan-500 dark:to-blue-600 rounded-full"
            />
          </div>
        </motion.div>

        {/* Interactive Question Palette with Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#0092E3]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Question Palette
              </span>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 text-[11px] font-semibold">
              <button
                onClick={() => setPaletteFilter("all")}
                className={`px-2.5 py-1 rounded-lg transition-all ${paletteFilter === "all"
                    ? "bg-[#0092E3] text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
              >
                All ({currentSession.length})
              </button>
              <button
                onClick={() => setPaletteFilter("answered")}
                className={`px-2.5 py-1 rounded-lg transition-all ${paletteFilter === "answered"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                  }`}
              >
                Answered ({answeredCount})
              </button>
              <button
                onClick={() => setPaletteFilter("unanswered")}
                className={`px-2.5 py-1 rounded-lg transition-all ${paletteFilter === "unanswered"
                    ? "bg-slate-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
              >
                Unanswered ({currentSession.length - answeredCount})
              </button>
              <button
                onClick={() => setPaletteFilter("marked")}
                className={`px-2.5 py-1 rounded-lg transition-all ${paletteFilter === "marked"
                    ? "bg-purple-600 text-white"
                    : "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100"
                  }`}
              >
                Marked ({markedForReview.size})
              </button>
            </div>
          </div>

          {/* Grid Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {filteredIndices.map((index) => {
              const qId = currentSession[index].id;
              const isAnswered = userAnswers[qId] !== undefined;
              const isMarked = markedForReview.has(qId);
              const isCurrent = index === currentQuestionIndex;

              return (
                <button
                  key={index}
                  onClick={() => handleNavigationClick(index)}
                  className={`relative w-10 h-10 rounded-xl text-xs font-bold border transition-all cursor-pointer ${isCurrent
                      ? "ring-2 ring-[#0092E3] ring-offset-2 dark:ring-offset-slate-900 border-[#0092E3] scale-105"
                      : ""
                    } ${isMarked
                      ? "bg-purple-500 text-white border-purple-600"
                      : isAnswered
                        ? "bg-emerald-500 text-white border-emerald-600"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#0092E3]"
                    }`}
                  title={`Question ${index + 1}: ${isMarked ? "Marked for Review" : isAnswered ? "Answered" : "Unanswered"}`}
                >
                  {index + 1}
                  {isMarked && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border border-white dark:border-slate-900 flex items-center justify-center">
                      <Flag className="w-1.5 h-1.5 text-purple-950" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Palette Legend */}
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-semibold text-slate-500 dark:text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-600" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-purple-500 border border-purple-600" />
              <span>Marked for Review</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
              <span>Unanswered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border-2 border-[#0092E3]" />
              <span>Current</span>
            </div>
          </div>
        </motion.div>

        {/* Main Question Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="hoverEffect shadow-lg">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="info" className="text-[10px]">
                    {currentQuestion.topic}
                  </Badge>
                  <Badge
                    variant={
                      currentQuestion.difficulty === "easy"
                        ? "success"
                        : currentQuestion.difficulty === "medium"
                          ? "warning"
                          : "danger"
                    }
                    className="text-[10px]"
                  >
                    {currentQuestion.difficulty}
                  </Badge>

                  {isCurrentMarked && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                      <Flag className="h-3 w-3" /> Marked for Review
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg sm:text-xl leading-relaxed">
                  {currentQuestion.questionText || currentQuestion.question || "Examination Question"}
                </CardTitle>
              </div>

              {/* Action Buttons: Mark for Review & Bookmark */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleMarkForReview}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${isCurrentMarked
                      ? "bg-purple-100 dark:bg-purple-950/80 border-purple-400 text-purple-700 dark:text-purple-300 font-bold"
                      : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 hover:text-purple-600 hover:border-purple-400"
                    }`}
                  title={isCurrentMarked ? "Unmark for review" : "Mark question for review"}
                >
                  <Flag className="h-5 w-5" />
                </button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleBookmarkToggle}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${isBookmarked
                      ? "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400"
                      : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 hover:text-amber-500"
                    }`}
                  title={isBookmarked ? "Remove bookmark" : "Bookmark question"}
                >
                  {isBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                </motion.button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => {
                  const isSelected =
                    selectedAnswer === index ||
                    selectedAnswer === option ||
                    String(selectedAnswer) === String(index) ||
                    (typeof selectedAnswer === "string" && String(selectedAnswer).trim().toLowerCase() === String(option).trim().toLowerCase());

                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${isSelected
                          ? "bg-[#0092E3] dark:bg-cyan-600 text-white border-[#0092E3] dark:border-cyan-600 shadow-md font-semibold"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-[#0092E3] dark:hover:border-cyan-500"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected
                              ? "border-white bg-white/20 text-white"
                              : "border-slate-300 dark:border-slate-600"
                            }`}
                        >
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                        </div>
                        <span className="flex-1 font-medium">{option}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          {/* Navigation & Submit Buttons Group */}
          <div className="flex flex-col items-center gap-3 w-full sm:w-auto justify-center">
            {isLiveExam && selectedAnswer === null && (
              <p className="w-full text-center text-xs font-bold text-amber-600 dark:text-amber-400 py-1.5 px-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 animate-pulse">
                ⚠️ You must select an answer before proceeding to the next question.
              </p>
            )}

            <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
              {!isLiveExam && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="rounded-xl"
                >
                  <span className="flex items-center gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </span>
                </Button>
              )}
              <Button
                variant="outline"
                size="md"
                onClick={handleClearAnswer}
                disabled={selectedAnswer === null}
                className="rounded-xl"
              >
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  <span>Clear Answer</span>
                </span>
              </Button>

              {currentQuestionIndex === currentSession.length - 1 ? (
                <Button
                  size="md"
                  onClick={() => setShowEndModal(true)}
                  disabled={isLiveExam && selectedAnswer === null}
                  className={`font-bold shadow-md px-6 rounded-xl transition-all ${
                    isLiveExam && selectedAnswer === null
                      ? "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 cursor-pointer"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Submit Exam</span>
                  </span>
                </Button>
              ) : (
                <Button
                  size="md"
                  onClick={handleNext}
                  disabled={isLiveExam && selectedAnswer === null}
                  className={`font-bold shadow-md px-6 rounded-xl transition-all ${
                    isLiveExam && selectedAnswer === null
                      ? "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
                      : "bg-[#0092E3] hover:bg-[#007AC9] text-white shadow-[#0092E3]/20 cursor-pointer"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>Next Question</span>
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400"
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Answered: {answeredCount}/{currentSession.length}
          </div>
          <div className="flex items-center gap-1.5">
            <Flag className="h-4 w-4 text-purple-500" />
            Marked for Review: {markedForReview.size}
          </div>
          <div className="flex items-center gap-1.5">
            <Bookmark className="h-4 w-4 text-amber-500" />
            Bookmarked: {currentSession.filter((q) => q.isBookmarked).length}
          </div>
        </motion.div>
      </div>

      {/* End Session Confirmation Modal */}
      <Modal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        title="End Examination & Submit Responses"
        description="Are you sure you want to finalize and submit your examination? Your answers will be locked and graded."
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowEndModal(false)} className="rounded-xl">
              Continue Exam
            </Button>
            <Button onClick={handleEndSession} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
              Confirm & Submit
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Questions Answered:</span>
              <span className="font-bold text-[#0B2238] dark:text-white">
                {answeredCount} of {currentSession.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Marked for Review:</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {markedForReview.size}
              </span>
            </div>
          </div>
          {markedForReview.size > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Note: You still have {markedForReview.size} questions marked for review. They will be submitted with your selected answers.
            </p>
          )}
        </div>
      </Modal>

      {/* Proctoring Violation Warning Modal */}
      <Modal
        isOpen={showWarningModal}
        onClose={() => {
          dismissWarning();
          requestFullscreen();
        }}
        title={`Academic Integrity Alert — Strike ${violations} of ${maxViolations}`}
        description="Proctoring monitors have detected an integrity violation during your live examination session."
        size="md"
        footer={
          <Button
            onClick={() => {
              dismissWarning();
              requestFullscreen();
            }}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-11 rounded-xl"
          >
            I Understand & Resume Fullscreen
          </Button>
        }
      >
        <div className="space-y-4 text-center py-2">
          <div className="h-14 w-14 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto border border-rose-300">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
              {lastViolationReason || "Tab switch or unauthorized navigation detected."}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Exiting fullscreen, switching browser tabs, or opening external software is strictly recorded. Reaching <strong>3 strikes</strong> will trigger immediate, automatic termination and submission of your examination.
            </p>
          </div>

          <div className="flex justify-center gap-2 pt-1">
            {Array.from({ length: maxViolations }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border ${i < violations
                    ? "bg-rose-600 text-white border-rose-700 animate-pulse"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700"
                  }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Proctor Live Warning Modal (Sent by Teacher/Invigilator in real-time) */}
      <Modal
        isOpen={!!proctorIncomingWarning}
        onClose={() => setProctorIncomingWarning(null)}
        title="Official Proctor Warning"
        description="Your exam invigilator has transmitted a direct compliance warning to your screen."
        size="md"
        footer={
          <Button
            onClick={() => setProctorIncomingWarning(null)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-11 rounded-xl"
          >
            I Acknowledge and Will Comply
          </Button>
        }
      >
        <div className="space-y-4 text-center py-2">
          <div className="h-14 w-14 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center mx-auto border border-amber-300">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60">
              "{proctorIncomingWarning}"
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This notice has been logged on the invigilator dashboard. Failure to comply immediately will result in your session being terminated.
            </p>
          </div>
        </div>
      </Modal>

      {/* Floating Proctoring Webcam (Picture-in-Picture with Mobile Collapse) */}
      {isLiveExam && (
        <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40">
          {/* Always-active hidden video element when minimized so stream & frame capture never get paused */}
          <video
            ref={(el) => {
              if (isCamMinimized) {
                videoRef.current = el;
                if (el && localStreamRef.current && el.srcObject !== localStreamRef.current) {
                  el.srcObject = localStreamRef.current;
                  el.play().catch(() => { });
                }
              }
            }}
            autoPlay
            playsInline
            muted
            className={
              isCamMinimized
                ? "w-1 h-1 opacity-0 absolute pointer-events-none -z-10"
                : "hidden"
            }
          />

          {isCamMinimized ? (
            /* Minimized Sleek Floating Pill (Zero obstruction on mobile screens) */
            <button
              type="button"
              onClick={() => setIsCamMinimized(false)}
              className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-bold border border-emerald-500/50 shadow-2xl backdrop-blur-md transition-all active:scale-95 group"
              title="Click to expand camera preview"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-semibold text-slate-200">
                {cameraActive ? "Camera Live" : "Initializing..."}
              </span>
              <Maximize2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors ml-0.5" />
            </button>
          ) : (
            /* Expanded Picture-in-Picture Box */
            <div className="w-36 sm:w-52 rounded-2xl overflow-hidden bg-slate-900 border-2 border-[#0092E3]/60 shadow-2xl shadow-blue-500/20 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
              <div className="relative aspect-[4/3] bg-slate-950 flex items-center justify-center overflow-hidden">
                <video
                  ref={(el) => {
                    if (!isCamMinimized) {
                      videoRef.current = el;
                      if (el && localStreamRef.current && el.srcObject !== localStreamRef.current) {
                        el.srcObject = localStreamRef.current;
                        el.play().catch(() => { });
                      }
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover -scale-x-100 ${cameraActive ? "block" : "hidden"}`}
                />
                {!cameraActive && (
                  <div className="text-center p-2 sm:p-3 text-slate-400 text-xs">
                    <CameraOff className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-amber-500 mb-1 animate-pulse" />
                    <p className="text-[9px] sm:text-[10px] leading-tight font-medium text-amber-300">
                      {cameraError || "Initializing WebCam..."}
                    </p>
                  </div>
                )}

                {/* Proctor Status Badge */}
                <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-[8px] sm:text-[9px] font-bold text-emerald-400 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>LIVE PROCTOR</span>
                </div>

                {/* Minimize Button */}
                <button
                  type="button"
                  onClick={() => setIsCamMinimized(true)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
                  title="Minimize preview"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-slate-900/90 border-t border-slate-800 text-[9px] sm:text-[10px] text-slate-300 flex items-center justify-between font-mono">
                <span>Feed</span>
                <span className={cameraActive ? "text-emerald-400 font-bold" : "text-amber-400"}>
                  {cameraActive ? "Broadcasting" : "Off"}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PracticeSessionPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="text-slate-400 text-xs font-semibold animate-pulse">
            Loading examination questions...
          </div>
        </div>
      }
    >
      <PracticeSessionContent />
    </React.Suspense>
  );
}
