"use client";

import {
  ArrowCounterClockwise,
  ArrowLeft,
  ArrowSquareOut,
  BookOpenText,
  Books,
  Brain,
  CaretDown,
  CaretRight,
  Check,
  CheckCircle,
  CheckSquare,
  Database,
  DownloadSimple,
  Flask,
  GearSix,
  House,
  Info,
  MagnifyingGlass,
  Moon,
  Play,
  ShieldCheck,
  Sun,
  Target,
  UploadSimple,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { Dialog, Theme } from "@radix-ui/themes";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import type {
  Certification,
  Domain,
  Importance,
  KnowledgeData,
  Lab,
  Question,
  QuestionAttempt,
  ServiceEntry,
  Source,
  StudyProgress,
  Topic,
} from "../types";
import { getAssetPath } from "../utils/path";

type Section = "today" | "learn" | "practice" | "errors";
type LearnTab = "topics" | "services" | "blueprint" | "labs";
type ThemeMode = "light" | "dark";
type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: KnowledgeData };

const STORAGE_KEY = "aip-c01-progress-v1";
const THEME_KEY = "aip-c01-theme";

const navItems: Array<{
  id: Section;
  label: string;
  icon: typeof House;
}> = [
  { id: "today", label: "Today", icon: House },
  { id: "learn", label: "Learn", icon: Books },
  { id: "practice", label: "Practice", icon: CheckSquare },
  { id: "errors", label: "Errors", icon: WarningCircle },
];

function collectionFromPayload<T>(
  payload: unknown,
  keys: string[],
): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key] as T[];
  }
  if (Array.isArray(record.items)) return record.items as T[];
  return [];
}

function objectFromPayload<T>(
  payload: unknown,
  keys: string[],
): T {
  if (!payload || typeof payload !== "object") {
    throw new Error("Certification metadata is not a JSON object.");
  }
  const record = payload as Record<string, unknown>;
  for (const key of keys) {
    if (record[key] && typeof record[key] === "object") {
      return record[key] as T;
    }
  }
  return payload as T;
}

async function fetchJson(path: string): Promise<unknown> {
  const targetPath = getAssetPath(path);
  const response = await fetch(targetPath, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${targetPath} returned ${response.status}.`);
  }
  return response.json() as Promise<unknown>;
}

function createEmptyProgress(contentVersion: string): StudyProgress {
  const now = new Date().toISOString();
  return {
    schema_version: 1,
    content_version: contentVersion,
    created_at: now,
    updated_at: now,
    question_attempts: [],
    reviewed_topic_ids: [],
    reviewed_service_ids: [],
    completed_lab_ids: [],
    bookmarked_ids: [],
  };
}

function isProgress(value: unknown): value is StudyProgress {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    record.schema_version === 1 &&
    typeof record.content_version === "string" &&
    Array.isArray(record.question_attempts) &&
    Array.isArray(record.reviewed_topic_ids) &&
    Array.isArray(record.reviewed_service_ids) &&
    Array.isArray(record.completed_lab_ids) &&
    Array.isArray(record.bookmarked_ids)
  );
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function latestAttempts(attempts: QuestionAttempt[]) {
  const result = new Map<string, QuestionAttempt>();
  for (const attempt of attempts) {
    const previous = result.get(attempt.question_id);
    if (
      !previous ||
      new Date(attempt.attempted_at).getTime() >=
        new Date(previous.attempted_at).getTime()
    ) {
      result.set(attempt.question_id, attempt);
    }
  }
  return result;
}

function formatDate(value?: string) {
  if (!value) return "Date not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function isSameAnswer(selected: string[], correct: string[]) {
  if (selected.length !== correct.length) return false;
  const expected = new Set(correct);
  return selected.every((id) => expected.has(id));
}

function sourceFor(item: { sources?: Source[] }) {
  return item.sources?.[0];
}

function labelForImportance(importance: Importance | string | undefined) {
  if (!importance) return "Awareness";
  const normalized = importance.toLowerCase();
  if (normalized === "high" || normalized === "critical") return "High";
  if (normalized === "medium" || normalized === "important") return "Medium";
  return "Awareness";
}

function importanceClass(importance: Importance | string | undefined) {
  return `depth-${labelForImportance(importance).toLowerCase()}`;
}

function AppLogo() {
  return (
    <div className="app-logo" aria-hidden="true">
      <span>A</span>
      <span>I</span>
      <span>P</span>
    </div>
  );
}

function SourceLink({
  source,
  compact = false,
}: {
  source?: Source;
  compact?: boolean;
}) {
  if (!source?.url) {
    return (
      <span className="source-missing">
        <WarningCircle size={15} />
        Source unavailable
      </span>
    );
  }
  return (
    <a
      className={compact ? "source-link compact" : "source-link"}
      href={source.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`${source.title || "AWS documentation"} opens in a new tab`}
    >
      {compact ? "AWS docs" : source.title || "AWS documentation"}
      <ArrowSquareOut size={14} aria-hidden="true" />
    </a>
  );
}

function StudyDepth({
  importance,
}: {
  importance: Importance | string | undefined;
}) {
  const label = labelForImportance(importance);
  return (
    <span
      className={`study-depth ${importanceClass(importance)}`}
      title="Internal study heuristic. AWS does not publish per-service importance or question probability."
    >
      <span className="depth-dot" aria-hidden="true" />
      Study depth: {label}
    </span>
  );
}

function Metric({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
}) {
  return (
    <div className="metric">
      <div className="metric-icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <p className="eyebrow">{label}</p>
        <strong>{value}</strong>
        <span>{helper}</span>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}

function LoadingView() {
  return (
    <main className="load-state" aria-live="polite" aria-busy="true">
      <div className="load-mark">
        <span />
        <span />
        <span />
      </div>
      <p className="eyebrow">Loading source-backed JSON</p>
      <h1>Preparing your revision console</h1>
      <p>Checking the blueprint, services, topics, and practice catalog.</p>
    </main>
  );
}

function ErrorView({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <main className="load-state" role="alert">
      <div className="empty-icon danger">
        <WarningCircle size={26} />
      </div>
      <p className="eyebrow">Content could not load</p>
      <h1>The JSON catalog needs attention</h1>
      <p>{message}</p>
      <button className="primary-button" onClick={retry}>
        <ArrowCounterClockwise size={18} />
        Try again
      </button>
    </main>
  );
}

export function RevisionConsole() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [reloadToken, setReloadToken] = useState(0);
  const [section, setSection] = useState<Section>("today");
  const [learnTab, setLearnTab] = useState<LearnTab>("topics");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [search, setSearch] = useState("");
  const [depthFilter, setDepthFilter] = useState("All");
  const [domainFilter, setDomainFilter] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedService, setSelectedService] =
    useState<ServiceEntry | null>(null);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dataNotice, setDataNotice] = useState("");
  const [progress, setProgress] = useState<StudyProgress | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<1 | 2 | 3 | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [practiceMode, setPracticeMode] = useState("mixed");
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_KEY);
    const preferred: ThemeMode =
      saved === "light" || saved === "dark"
        ? saved
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    const frame = window.requestAnimationFrame(() => setTheme(preferred));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (!selectedTopic) return;
    window.scrollTo({ top: 0, behavior: "auto" });
    document.getElementById("topic-detail-title")?.focus();
  }, [selectedTopic]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    const questionId = params.get("question");
    const frame = window.requestAnimationFrame(() => {
      if (
        view === "today" ||
        view === "learn" ||
        view === "practice" ||
        view === "errors"
      ) {
        setSection(view);
      }
      if (questionId) {
        setSection("practice");
        setPracticeMode("mixed");
        setActiveQuestionId(questionId);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadState({ status: "loading" });
      try {
        const [
          certificationPayload,
          domainsPayload,
          topicsPayload,
          servicesPayload,
          questionsPayload,
          labsPayload,
        ] = await Promise.all([
          fetchJson("/data/certification.json"),
          fetchJson("/data/domains.json"),
          fetchJson("/data/topics.json"),
          fetchJson("/data/services.json"),
          fetchJson("/data/questions.json"),
          fetchJson("/data/labs.json"),
        ]);

        const data: KnowledgeData = {
          certification: objectFromPayload<Certification>(
            certificationPayload,
            ["certification", "metadata"],
          ),
          domains: collectionFromPayload<Domain>(domainsPayload, ["domains"]),
          topics: collectionFromPayload<Topic>(topicsPayload, ["topics"]),
          services: collectionFromPayload<ServiceEntry>(servicesPayload, [
            "services",
            "entities",
          ]),
          questions: collectionFromPayload<Question>(questionsPayload, [
            "questions",
          ]),
          labs: collectionFromPayload<Lab>(labsPayload, ["labs"]),
        };

        if (
          data.domains.length !== 5 ||
          data.topics.length < 12 ||
          data.services.length < 100
        ) {
          throw new Error(
            `Coverage check failed: ${data.domains.length} domains, ${data.topics.length} topics, and ${data.services.length} scope entries were found.`,
          );
        }

        if (cancelled) return;

        const saved = window.localStorage.getItem(STORAGE_KEY);
        let loadedProgress = createEmptyProgress(
          data.certification.content_version,
        );
        if (saved) {
          try {
            const parsed: unknown = JSON.parse(saved);
            if (!isProgress(parsed)) throw new Error("Invalid learner state.");
            loadedProgress = parsed;
          } catch {
            setDataNotice(
              "Saved progress was not valid and was left untouched. A fresh in-memory profile is active.",
            );
          }
        }
        setProgress(loadedProgress);
        setLoadState({ status: "ready", data });
      } catch (error) {
        if (!cancelled) {
          setLoadState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "The content files are not valid JSON.",
          });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  useEffect(() => {
    if (!progress) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const data = loadState.status === "ready" ? loadState.data : null;
  const attemptMap = useMemo(
    () => latestAttempts(progress?.question_attempts ?? []),
    [progress?.question_attempts],
  );

  const filteredTopics = useMemo(() => {
    if (!data) return [];
    const query = search.trim().toLowerCase();
    return data.topics.filter((topic) => {
      const matchesQuery =
        !query ||
        [topic.title, topic.summary, ...(topic.key_points ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesDepth =
        depthFilter === "All" ||
        labelForImportance(topic.importance) === depthFilter;
      const matchesDomain =
        domainFilter === "All" || topic.domain_ids?.includes(domainFilter);
      return matchesQuery && matchesDepth && matchesDomain;
    });
  }, [data, depthFilter, domainFilter, search]);

  const filteredServices = useMemo(() => {
    if (!data) return [];
    const query = search.trim().toLowerCase();
    return data.services.filter((service) => {
      const matchesQuery =
        !query ||
        [
          service.exam_label,
          service.current_label,
          ...(service.aliases ?? []),
          service.category,
          service.role,
          service.boundary,
          ...(service.use_when ?? []),
          ...(service.avoid_when ?? []),
          ...(service.confusions ?? []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesDepth =
        depthFilter === "All" ||
        labelForImportance(service.importance) === depthFilter;
      const matchesDomain =
        domainFilter === "All" ||
        service.domain_ids?.includes(domainFilter) ||
        !service.domain_ids?.length;
      return matchesQuery && matchesDepth && matchesDomain;
    });
  }, [data, depthFilter, domainFilter, search]);

  const practiceQuestions = useMemo(() => {
    if (!data) return [];
    if (practiceMode === "mixed") return data.questions;
    if (practiceMode === "errors") {
      return data.questions.filter(
        (question) => attemptMap.get(question.id)?.correct === false,
      );
    }
    if (practiceMode === "unseen") {
      return data.questions.filter((question) => !attemptMap.has(question.id));
    }
    return data.questions.filter((question) => question.mode === practiceMode);
  }, [attemptMap, data, practiceMode]);

  const activeQuestion =
    practiceQuestions.find((question) => question.id === activeQuestionId) ??
    practiceQuestions[0] ??
    null;

  const answerActiveQuestion = useCallback(() => {
    if (!activeQuestion || !progress || !confidence || !selectedAnswers.length)
      return;
    const attempt: QuestionAttempt = {
      question_id: activeQuestion.id,
      selected_ids: selectedAnswers,
      correct: isSameAnswer(
        selectedAnswers,
        activeQuestion.correct_answer_ids,
      ),
      confidence,
      attempted_at: new Date().toISOString(),
    };
    setProgress({
      ...progress,
      updated_at: new Date().toISOString(),
      question_attempts: [...progress.question_attempts, attempt],
    });
    setFeedbackOpen(true);
  }, [activeQuestion, confidence, progress, selectedAnswers]);

  function nextQuestion() {
    if (!activeQuestion) return;
    const currentIndex = practiceQuestions.findIndex(
      (question) => question.id === activeQuestion.id,
    );
    const next =
      practiceQuestions[(currentIndex + 1) % practiceQuestions.length];
    setActiveQuestionId(next?.id ?? null);
    setSelectedAnswers([]);
    setConfidence(null);
    setFeedbackOpen(false);
  }

  function markTopicReviewed(id: string) {
    if (!progress) return;
    setProgress({
      ...progress,
      updated_at: new Date().toISOString(),
      reviewed_topic_ids: unique([...progress.reviewed_topic_ids, id]),
    });
  }

  function markServiceReviewed(id: string) {
    if (!progress) return;
    setProgress({
      ...progress,
      updated_at: new Date().toISOString(),
      reviewed_service_ids: unique([...progress.reviewed_service_ids, id]),
    });
  }

  function toggleLab(id: string) {
    if (!progress) return;
    const completed = progress.completed_lab_ids.includes(id);
    setProgress({
      ...progress,
      updated_at: new Date().toISOString(),
      completed_lab_ids: completed
        ? progress.completed_lab_ids.filter((labId) => labId !== id)
        : [...progress.completed_lab_ids, id],
    });
  }

  function exportProgress() {
    if (!progress) return;
    const exportPayload = {
      app: "AIP-C01 Revision Console",
      exported_at: new Date().toISOString(),
      ...progress,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aip-c01-progress-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setDataNotice("Progress exported as JSON.");
  }

  async function importProgress(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !progress) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isProgress(parsed)) {
        throw new Error("This file does not match progress schema version 1.");
      }
      const merged: StudyProgress = {
        ...progress,
        content_version: progress.content_version,
        updated_at: new Date().toISOString(),
        question_attempts: [
          ...progress.question_attempts,
          ...parsed.question_attempts,
        ],
        reviewed_topic_ids: unique([
          ...progress.reviewed_topic_ids,
          ...parsed.reviewed_topic_ids,
        ]),
        reviewed_service_ids: unique([
          ...progress.reviewed_service_ids,
          ...parsed.reviewed_service_ids,
        ]),
        completed_lab_ids: unique([
          ...progress.completed_lab_ids,
          ...parsed.completed_lab_ids,
        ]),
        bookmarked_ids: unique([
          ...progress.bookmarked_ids,
          ...parsed.bookmarked_ids,
        ]),
      };
      setProgress(merged);
      setDataNotice("Progress merged from JSON. Existing records were preserved.");
    } catch (error) {
      setDataNotice(
        error instanceof Error ? error.message : "The JSON file is not valid.",
      );
    }
  }

  function resetProgress() {
    if (!data) return;
    const confirmed = window.confirm(
      "Reset all local study progress? Export a backup first if you may need it.",
    );
    if (!confirmed) return;
    const empty = createEmptyProgress(data.certification.content_version);
    setProgress(empty);
    setDataNotice("Local study progress was reset.");
  }

  if (loadState.status === "loading") return <LoadingView />;
  if (loadState.status === "error") {
    return (
      <ErrorView
        message={loadState.message}
        retry={() => setReloadToken((value) => value + 1)}
      />
    );
  }
  if (!data) return <LoadingView />;

  return (
    <Theme
      appearance={theme}
      accentColor="orange"
      grayColor="slate"
      radius="medium"
      scaling="100%"
    >
      <a className="skip-link" href="#main-content">
        Skip to study content
      </a>
      <div className="app-frame">
        <aside className="sidebar" aria-label="Primary navigation">
          <div className="brand-lockup">
            <AppLogo />
            <div>
              <strong>AIP-C01</strong>
              <span>Revision Console</span>
            </div>
          </div>

          <nav className="nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={section === item.id ? "active" : ""}
                  onClick={() => {
                    setSelectedTopic(null);
                    setSection(item.id);
                  }}
                  aria-current={section === item.id ? "page" : undefined}
                >
                  <Icon size={19} weight={section === item.id ? "fill" : "regular"} />
                  <span>{item.label}</span>
                  {item.id === "errors" && (
                    <span className="nav-count">
                      {
                        [...attemptMap.values()].filter(
                          (attempt) => !attempt.correct,
                        ).length
                      }
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="sidebar-foot">
            <div className="source-status">
              <CheckCircle size={17} weight="fill" />
              <div>
                <strong>Official scope represented</strong>
                <span>
                  {data.certification.coverage?.skills ?? 98}/98 skills
                </span>
              </div>
            </div>
            <p>
              Verified {formatDate(data.certification.verified_at)}. AWS says the
              outline and service list can change.
            </p>
          </div>
        </aside>

        <div className="workspace">
          <header className="topbar">
            <div className="mobile-brand">
              <AppLogo />
              <strong>AIP-C01</strong>
            </div>
            <div className="header-title">
              <span className="eyebrow">
                {selectedTopic
                  ? "Knowledge map"
                  : "AWS Certified Generative AI Developer Professional"}
              </span>
              {selectedTopic ? (
                <div className="header-context-title">Topic detail</div>
              ) : (
                <h1>
                  {section === "today" && "Today"}
                  {section === "learn" && "Knowledge map"}
                  {section === "practice" && "Practice"}
                  {section === "errors" && "Error notebook"}
                </h1>
              )}
            </div>
            <div className="topbar-actions">
              <button
                className="icon-button"
                onClick={() =>
                  setTheme((value) => (value === "light" ? "dark" : "light"))
                }
                aria-label={
                  theme === "light" ? "Use dark theme" : "Use light theme"
                }
                title={theme === "light" ? "Use dark theme" : "Use light theme"}
              >
                {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
              </button>
              <button
                className="icon-button"
                onClick={() => setSettingsOpen(true)}
                aria-label="Open data settings"
                title="Data settings"
              >
                <GearSix size={20} />
              </button>
            </div>
          </header>

          <main id="main-content" className="main-content">
            {dataNotice && (
              <div className="notice" role="status">
                <Info size={18} />
                <span>{dataNotice}</span>
                <button
                  aria-label="Dismiss notice"
                  onClick={() => setDataNotice("")}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {selectedTopic && (
              <TopicDetailPage
                topic={selectedTopic}
                reviewed={Boolean(
                  progress?.reviewed_topic_ids.includes(selectedTopic.id),
                )}
                onBack={() => setSelectedTopic(null)}
                onReviewed={() => markTopicReviewed(selectedTopic.id)}
              />
            )}

            {!selectedTopic && section === "today" && (
              <TodayScreen
                data={data}
                progress={progress}
                attemptMap={attemptMap}
                onStartPractice={() => {
                  setPracticeMode("unseen");
                  setSection("practice");
                }}
                onLearn={() => setSection("learn")}
              />
            )}

            {!selectedTopic && section === "learn" && (
              <LearnScreen
                data={data}
                progress={progress}
                tab={learnTab}
                setTab={setLearnTab}
                search={search}
                setSearch={setSearch}
                depthFilter={depthFilter}
                setDepthFilter={setDepthFilter}
                domainFilter={domainFilter}
                setDomainFilter={setDomainFilter}
                topics={filteredTopics}
                services={filteredServices}
                onTopic={setSelectedTopic}
                onService={(service) => {
                  window.location.assign(`/services/${service.id}`);
                }}
                onLab={setSelectedLab}
                onToggleLab={toggleLab}
              />
            )}

            {!selectedTopic && section === "practice" && (
              <PracticeScreen
                questions={practiceQuestions}
                activeQuestion={activeQuestion}
                selectedAnswers={selectedAnswers}
                setSelectedAnswers={setSelectedAnswers}
                confidence={confidence}
                setConfidence={setConfidence}
                feedbackOpen={feedbackOpen}
                onSubmit={answerActiveQuestion}
                onNext={nextQuestion}
                mode={practiceMode}
                setMode={(mode) => {
                  setPracticeMode(mode);
                  setActiveQuestionId(null);
                  setSelectedAnswers([]);
                  setConfidence(null);
                  setFeedbackOpen(false);
                }}
                attempts={attemptMap}
              />
            )}

            {!selectedTopic && section === "errors" && (
              <ErrorsScreen
                data={data}
                attempts={attemptMap}
                onRetry={(questionId) => {
                  setPracticeMode("errors");
                  setActiveQuestionId(questionId);
                  setSelectedAnswers([]);
                  setConfidence(null);
                  setFeedbackOpen(false);
                  setSection("practice");
                }}
              />
            )}
          </main>
        </div>
      </div>

      <nav className="mobile-nav" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={section === item.id ? "active" : ""}
              onClick={() => {
                setSelectedTopic(null);
                setSection(item.id);
              }}
              aria-current={section === item.id ? "page" : undefined}
            >
              <Icon size={20} weight={section === item.id ? "fill" : "regular"} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <ServiceDialog
        service={selectedService}
        open={Boolean(selectedService)}
        onOpenChange={(open) => {
          if (!open) setSelectedService(null);
        }}
        reviewed={Boolean(
          selectedService &&
            progress?.reviewed_service_ids.includes(selectedService.id),
        )}
        onReviewed={() => {
          if (!selectedService) return;
          markServiceReviewed(selectedService.id);
        }}
      />

      <LabDialog
        lab={selectedLab}
        open={Boolean(selectedLab)}
        onOpenChange={(open) => {
          if (!open) setSelectedLab(null);
        }}
        completed={Boolean(
          selectedLab && progress?.completed_lab_ids.includes(selectedLab.id),
        )}
        onToggle={() => {
          if (!selectedLab) return;
          toggleLab(selectedLab.id);
        }}
      />

      <Dialog.Root open={settingsOpen} onOpenChange={setSettingsOpen}>
        <Dialog.Content className="detail-dialog settings-dialog" maxWidth="560px">
          <div className="dialog-heading">
            <div>
              <p className="eyebrow">Local JSON data</p>
              <Dialog.Title>Progress and backup</Dialog.Title>
              <Dialog.Description>
                Study progress stays in this browser as JSON. Export it before
                changing devices or clearing browser data.
              </Dialog.Description>
            </div>
            <Dialog.Close>
              <button className="icon-button" aria-label="Close data settings">
                <X size={19} />
              </button>
            </Dialog.Close>
          </div>
          <div className="settings-actions">
            <button className="primary-button" onClick={exportProgress}>
              <DownloadSimple size={18} />
              Export progress JSON
            </button>
            <button
              className="secondary-button"
              onClick={() => importInputRef.current?.click()}
            >
              <UploadSimple size={18} />
              Import and merge JSON
            </button>
            <input
              ref={importInputRef}
              className="visually-hidden"
              type="file"
              accept="application/json,.json"
              onChange={(event) => void importProgress(event)}
            />
          </div>
          <div className="settings-meta">
            <div>
              <span>Schema</span>
              <strong>Version {progress?.schema_version ?? 1}</strong>
            </div>
            <div>
              <span>Content</span>
              <strong>{data.certification.content_version}</strong>
            </div>
            <div>
              <span>Last saved</span>
              <strong>{formatDate(progress?.updated_at)}</strong>
            </div>
          </div>
          <div className="danger-zone">
            <div>
              <strong>Reset local progress</strong>
              <p>This removes attempts, reviews, errors, and lab completion.</p>
            </div>
            <button className="danger-button" onClick={resetProgress}>
              Reset
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </Theme>
  );
}

function TodayScreen({
  data,
  progress,
  attemptMap,
  onStartPractice,
  onLearn,
}: {
  data: KnowledgeData;
  progress: StudyProgress | null;
  attemptMap: Map<string, QuestionAttempt>;
  onStartPractice: () => void;
  onLearn: () => void;
}) {
  const attempts = [...attemptMap.values()];
  const correct = attempts.filter((attempt) => attempt.correct).length;
  const accuracy = attempts.length
    ? Math.round((correct / attempts.length) * 100)
    : 0;
  const topicCoverage = Math.round(
    ((progress?.reviewed_topic_ids.length ?? 0) / data.topics.length) * 100,
  );
  const errors = attempts.filter((attempt) => !attempt.correct);
  const unseen = data.questions.filter((question) => !attemptMap.has(question.id));
  const dueCount = Math.min(8, unseen.length + errors.length);

  return (
    <div className="screen-stack">
      <section className="today-lead">
        <div>
          <p className="eyebrow">Focused study session</p>
          <h2>
            {dueCount
              ? `${dueCount} items ready for review`
              : "Your review queue is clear"}
          </h2>
          <p>
            Answer first, record confidence, then use the AWS source to correct
            the decision rule.
          </p>
        </div>
        <button className="primary-button large" onClick={onStartPractice}>
          <Play size={19} weight="fill" />
          {unseen.length ? "Start unseen practice" : "Practice weak areas"}
        </button>
      </section>

      <section className="metric-row" aria-label="Study progress summary">
        <Metric
          label="Practice accuracy"
          value={`${accuracy}%`}
          helper={attempts.length ? `${attempts.length} answered` : "No attempts yet"}
          icon={<Target size={22} />}
        />
        <Metric
          label="Topic coverage"
          value={`${topicCoverage}%`}
          helper={`${progress?.reviewed_topic_ids.length ?? 0}/${data.topics.length} reviewed`}
          icon={<BookOpenText size={22} />}
        />
        <Metric
          label="Confident errors"
          value={`${errors.filter((attempt) => attempt.confidence === 3).length}`}
          helper={`${errors.length} errors total`}
          icon={<WarningCircle size={22} />}
        />
        <Metric
          label="Labs complete"
          value={`${progress?.completed_lab_ids.length ?? 0}/${data.labs.length}`}
          helper="Hands-on evidence"
          icon={<Flask size={22} />}
        />
      </section>

      <section className="scope-panel">
        <div className="scope-copy">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Official scope represented</p>
              <h2>Blueprint coverage, not an exam guarantee</h2>
            </div>
            <SourceLink source={sourceFor(data.certification)} compact />
          </div>
          <div className="coverage-numbers">
            <div>
              <strong>{data.certification.coverage.domains}/5</strong>
              <span>domains</span>
            </div>
            <div>
              <strong>{data.certification.coverage.tasks}/20</strong>
              <span>tasks</span>
            </div>
            <div>
              <strong>{data.certification.coverage.skills}/98</strong>
              <span>skills</span>
            </div>
            <div>
              <strong>{data.certification.coverage.scope_entries}/106</strong>
              <span>scope entries</span>
            </div>
          </div>
          <p className="fine-print">
            Verified {formatDate(data.certification.verified_at)}. Some entries
            are features rather than standalone services. AWS states that its
            outline and service list are non-exhaustive and subject to change.
          </p>
        </div>
        <div className="exam-contract">
          <p className="eyebrow">Exam contract</p>
          <div className="contract-line">
            <span>Questions</span>
            <strong>{data.certification.question_count}</strong>
          </div>
          <div className="contract-line">
            <span>Time</span>
            <strong>{data.certification.duration_minutes} min</strong>
          </div>
          <div className="contract-line">
            <span>Pass standard</span>
            <strong>{data.certification.passing_scaled_score}</strong>
          </div>
          <div className="score-warning">
            <Info size={17} />
            <p>
              AWS uses a scaled score. An 85% practice target cannot be converted
              to an AWS score or guarantee a pass.
            </p>
          </div>
        </div>
      </section>

      <section className="domain-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Study allocation</p>
            <h2>Follow the published domain weights</h2>
          </div>
          <button className="text-button" onClick={onLearn}>
            Open knowledge map
            <CaretRight size={16} />
          </button>
        </div>
        <div className="domain-list">
          {data.domains.map((domain) => (
            <div className="domain-row" key={domain.id}>
              <div className="domain-index">{domain.code.replace("D", "")}</div>
              <div className="domain-copy">
                <strong>{domain.short_title || domain.title}</strong>
                <span>
                  {domain.tasks?.length ?? domain.task_count ?? 0} tasks,{" "}
                  {domain.skill_count ??
                    domain.tasks?.reduce(
                      (sum, task) => sum + (task.skills?.length ?? 0),
                      0,
                    ) ??
                    0}{" "}
                  skills
                </span>
              </div>
              <div className="domain-weight">{domain.weight}%</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function LearnScreen({
  data,
  progress,
  tab,
  setTab,
  search,
  setSearch,
  depthFilter,
  setDepthFilter,
  domainFilter,
  setDomainFilter,
  topics,
  services,
  onTopic,
  onService,
  onLab,
  onToggleLab,
}: {
  data: KnowledgeData;
  progress: StudyProgress | null;
  tab: LearnTab;
  setTab: (tab: LearnTab) => void;
  search: string;
  setSearch: (search: string) => void;
  depthFilter: string;
  setDepthFilter: (depth: string) => void;
  domainFilter: string;
  setDomainFilter: (domain: string) => void;
  topics: Topic[];
  services: ServiceEntry[];
  onTopic: (topic: Topic) => void;
  onService: (service: ServiceEntry) => void;
  onLab: (lab: Lab) => void;
  onToggleLab: (id: string) => void;
}) {
  return (
    <div className="screen-stack">
      <div className="tab-strip" role="tablist" aria-label="Knowledge views">
        {(
          [
            ["topics", "Topics", data.topics.length],
            ["services", "Services", data.services.length],
            ["blueprint", "Blueprint", 98],
            ["labs", "Labs", data.labs.length],
          ] as Array<[LearnTab, string, number]>
        ).map(([id, label, count]) =>
          id === "services" ? (
            <Link
              href="/services"
              key={id}
              role="tab"
              aria-selected={tab === id}
              className={tab === id ? "active" : ""}
            >
              {label}
              <span>{count}</span>
            </Link>
          ) : (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              className={tab === id ? "active" : ""}
              onClick={() => setTab(id)}
            >
              {label}
              <span>{count}</span>
            </button>
          ),
        )}
      </div>

      {(tab === "topics" || tab === "services") && (
        <div className="filter-bar">
          <label className="search-field">
            <MagnifyingGlass size={18} aria-hidden="true" />
            <span className="visually-hidden">
              Search {tab === "topics" ? "topics" : "services"}
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                tab === "topics"
                  ? "Search decisions, concepts, and failure modes"
                  : "Search name, role, alias, or distractor"
              }
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
              >
                <X size={16} />
              </button>
            )}
          </label>
          <label className="select-field">
            <span className="visually-hidden">Study depth</span>
            <select
              value={depthFilter}
              onChange={(event) => setDepthFilter(event.target.value)}
            >
              <option>All</option>
              <option>High</option>
              <option>Medium</option>
              <option>Awareness</option>
            </select>
            <CaretDown size={15} aria-hidden="true" />
          </label>
          <label className="select-field">
            <span className="visually-hidden">Domain</span>
            <select
              value={domainFilter}
              onChange={(event) => setDomainFilter(event.target.value)}
            >
              <option value="All">All domains</option>
              {data.domains.map((domain) => (
                <option value={domain.id} key={domain.id}>
                  {domain.code}
                </option>
              ))}
            </select>
            <CaretDown size={15} aria-hidden="true" />
          </label>
        </div>
      )}

      {tab === "topics" && (
        <>
          <div className="result-summary">
            <p>
              <strong>{topics.length}</strong> canonical topics
            </p>
            <span>Canonical guides prevent duplicated study notes.</span>
          </div>
          {topics.length ? (
            <div className="topic-grid">
              {topics.map((topic, index) => (
                <article className="topic-card" key={topic.id}>
                  <div className="topic-card-top">
                    <span className="topic-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <StudyDepth importance={topic.importance} />
                  </div>
                  <h2>{topic.short_title || topic.title}</h2>
                  <p>{topic.summary}</p>
                  <div className="topic-meta">
                    <span>{topic.skill_ids?.length ?? 0} skills</span>
                    <span>{topic.service_ids?.length ?? 0} services</span>
                    {progress?.reviewed_topic_ids.includes(topic.id) && (
                      <span className="reviewed">
                        <Check size={13} />
                        Reviewed
                      </span>
                    )}
                  </div>
                  <div className="card-actions">
                    <button
                      className="text-button"
                      onClick={() => onTopic(topic)}
                    >
                      Study topic
                      <CaretRight size={15} />
                    </button>
                    <SourceLink source={sourceFor(topic)} compact />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<MagnifyingGlass size={24} />}
              title="No topics match"
              body="Clear a filter or try a broader decision keyword."
              action={
                <button
                  className="secondary-button"
                  onClick={() => {
                    setSearch("");
                    setDepthFilter("All");
                    setDomainFilter("All");
                  }}
                >
                  Clear filters
                </button>
              }
            />
          )}
        </>
      )}

      {tab === "services" && (
        <>
          <div className="result-summary">
            <p>
              <strong>{services.length}</strong> of {data.services.length} scope
              entries
            </p>
            <span>
              Features and capabilities are identified separately from services.
            </span>
          </div>
          {services.length ? (
            <div className="service-table" role="list">
              <div className="service-table-head" aria-hidden="true">
                <span>Name and role</span>
                <span>Category</span>
                <span>Study depth</span>
                <span>Reference</span>
              </div>
              {services.map((service) => (
                <article className="service-row" role="listitem" key={service.id}>
                  <button
                    className="service-main"
                    onClick={() => onService(service)}
                  >
                    <span className="entity-type">{service.entity_type}</span>
                    <strong>{service.exam_label}</strong>
                    <small>{service.role}</small>
                  </button>
                  <span className="service-category">{service.category}</span>
                  <StudyDepth importance={service.importance} />
                  <SourceLink source={sourceFor(service)} compact />
                  {progress?.reviewed_service_ids.includes(service.id) && (
                    <span className="row-reviewed" title="Reviewed">
                      <CheckCircle size={17} weight="fill" />
                    </span>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Database size={24} />}
              title="No scope entries match"
              body="Try the exam label, current service name, role, or category."
              action={
                <button
                  className="secondary-button"
                  onClick={() => {
                    setSearch("");
                    setDepthFilter("All");
                    setDomainFilter("All");
                  }}
                >
                  Clear filters
                </button>
              }
            />
          )}
          <p className="heuristic-note">
            <Info size={16} />
            Study depth is an internal heuristic based on blueprint evidence,
            architectural centrality, decision depth, and volatility. Awareness
            means lower required depth, not safe to ignore.
          </p>
        </>
      )}

      {tab === "blueprint" && (
        <BlueprintView domains={data.domains} />
      )}

      {tab === "labs" && (
        <div className="lab-list">
          {data.labs.map((lab, index) => {
            const completed = progress?.completed_lab_ids.includes(lab.id);
            return (
              <article className="lab-row" key={lab.id}>
                <button
                  className={`lab-check ${completed ? "complete" : ""}`}
                  onClick={() => onToggleLab(lab.id)}
                  aria-label={
                    completed
                      ? `Mark ${lab.title} incomplete`
                      : `Mark ${lab.title} complete`
                  }
                  aria-pressed={completed}
                >
                  {completed ? (
                    <Check size={16} weight="bold" />
                  ) : (
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  )}
                </button>
                <button className="lab-copy" onClick={() => onLab(lab)}>
                  <span className="eyebrow">
                    {lab.duration_minutes
                      ? `${lab.duration_minutes} minutes`
                      : "Hands-on validation"}
                  </span>
                  <strong>{lab.title}</strong>
                  <p>{lab.summary}</p>
                </button>
                <SourceLink source={sourceFor(lab)} compact />
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BlueprintView({ domains }: { domains: Domain[] }) {
  const [openDomains, setOpenDomains] = useState<string[]>([domains[0]?.id]);

  return (
    <div className="blueprint-list">
      <div className="result-summary">
        <p>
          <strong>5</strong> domains, <strong>20</strong> tasks,{" "}
          <strong>98</strong> official skills
        </p>
        <span>Published domain weights should guide study time.</span>
      </div>
      {domains.map((domain) => {
        const open = openDomains.includes(domain.id);
        const skillCount =
          domain.tasks?.reduce(
            (sum, task) => sum + (task.skills?.length ?? 0),
            0,
          ) ??
          domain.skill_count ??
          0;
        return (
          <section className="blueprint-domain" key={domain.id}>
            <button
              className="blueprint-domain-head"
              aria-expanded={open}
              onClick={() =>
                setOpenDomains((current) =>
                  open
                    ? current.filter((id) => id !== domain.id)
                    : [...current, domain.id],
                )
              }
            >
              <span className="domain-index">
                {domain.code.replace("D", "")}
              </span>
              <span className="blueprint-title">
                <strong>{domain.title}</strong>
                <small>
                  {domain.tasks?.length ?? domain.task_count ?? 0} tasks,{" "}
                  {skillCount} skills
                </small>
              </span>
              <span className="domain-weight">{domain.weight}%</span>
              <CaretDown
                className={open ? "rotated" : ""}
                size={18}
                aria-hidden="true"
              />
            </button>
            {open && (
              <div className="task-list">
                {domain.tasks.map((task) => (
                  <details key={task.id}>
                    <summary>
                      <span>{task.id.toUpperCase()}</span>
                      <strong>{task.title}</strong>
                      <small>{task.skills.length} skills</small>
                    </summary>
                    <ul>
                      {task.skills.map((skill) => (
                        <li key={skill.id}>
                          <Check size={14} aria-hidden="true" />
                          <span>
                            <strong>{skill.id.toUpperCase()}</strong>
                            {skill.title}
                          </span>
                          <SourceLink
                            source={sourceFor(skill)}
                            compact
                          />
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
                <SourceLink source={sourceFor(domain)} />
                <FullGuide
                  title={`${domain.title} full guide`}
                  content={domain.content_markdown}
                />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function PracticeScreen({
  questions,
  activeQuestion,
  selectedAnswers,
  setSelectedAnswers,
  confidence,
  setConfidence,
  feedbackOpen,
  onSubmit,
  onNext,
  mode,
  setMode,
  attempts,
}: {
  questions: Question[];
  activeQuestion: Question | null;
  selectedAnswers: string[];
  setSelectedAnswers: (answers: string[]) => void;
  confidence: 1 | 2 | 3 | null;
  setConfidence: (confidence: 1 | 2 | 3) => void;
  feedbackOpen: boolean;
  onSubmit: () => void;
  onNext: () => void;
  mode: string;
  setMode: (mode: string) => void;
  attempts: Map<string, QuestionAttempt>;
}) {
  if (!activeQuestion) {
    return (
      <div className="screen-stack">
        <PracticeModeBar mode={mode} setMode={setMode} />
        <EmptyState
          icon={<CheckCircle size={25} />}
          title={mode === "errors" ? "No errors to retry" : "No questions found"}
          body={
            mode === "errors"
              ? "Complete a mixed or unseen session first."
              : "Choose another practice mode."
          }
          action={
            <button className="primary-button" onClick={() => setMode("mixed")}>
              Start mixed practice
            </button>
          }
        />
      </div>
    );
  }

  const correct = isSameAnswer(
    selectedAnswers,
    activeQuestion.correct_answer_ids,
  );
  const answeredCount = questions.filter((question) =>
    attempts.has(question.id),
  ).length;

  return (
    <div className="screen-stack practice-layout">
      <PracticeModeBar mode={mode} setMode={setMode} />
      <div className="practice-context">
        <div>
          <StudyDepth importance={activeQuestion.importance} />
          <span className="mode-label">{activeQuestion.mode}</span>
        </div>
        <span>
          {answeredCount}/{questions.length} answered in this set
        </span>
      </div>

      <section className="question-panel">
        <div className="question-heading">
          <div className="question-index">
            <Brain size={20} />
          </div>
          <div>
            <p className="eyebrow">
              {activeQuestion.type === "multiple"
                ? "Select all that apply"
                : "Select one answer"}
            </p>
            <h2>{activeQuestion.prompt}</h2>
          </div>
        </div>

        <fieldset
          className="answer-list"
          disabled={feedbackOpen}
          aria-describedby="answer-instruction"
        >
          <legend className="visually-hidden">Answer choices</legend>
          <p id="answer-instruction" className="visually-hidden">
            Choose the best answer before revealing feedback.
          </p>
          {activeQuestion.choices.map((choice, index) => {
            const selected = selectedAnswers.includes(choice.id);
            return (
              <label
                key={choice.id}
                className={`answer-choice ${selected ? "selected" : ""}`}
              >
                <input
                  type={activeQuestion.type === "multiple" ? "checkbox" : "radio"}
                  name={`question-${activeQuestion.id}`}
                  value={choice.id}
                  checked={selected}
                  onChange={() => {
                    if (activeQuestion.type === "multiple") {
                      setSelectedAnswers(
                        selected
                          ? selectedAnswers.filter((id) => id !== choice.id)
                          : [...selectedAnswers, choice.id],
                      );
                    } else {
                      setSelectedAnswers([choice.id]);
                    }
                  }}
                />
                <span className="choice-key">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{choice.text}</span>
              </label>
            );
          })}
        </fieldset>

        {!feedbackOpen && (
          <div className="confidence-row">
            <div>
              <strong>How confident are you?</strong>
              <span>Record this before feedback.</span>
            </div>
            <div className="confidence-options" role="group" aria-label="Confidence">
              {(
                [
                  [1, "Low"],
                  [2, "Medium"],
                  [3, "High"],
                ] as Array<[1 | 2 | 3, string]>
              ).map(([value, label]) => (
                <button
                  key={value}
                  className={confidence === value ? "active" : ""}
                  aria-pressed={confidence === value}
                  onClick={() => setConfidence(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {!feedbackOpen ? (
          <div className="question-actions">
            <span>
              {!selectedAnswers.length
                ? "Choose an answer"
                : !confidence
                  ? "Set confidence to continue"
                  : "Ready to check"}
            </span>
            <button
              className="primary-button"
              disabled={!selectedAnswers.length || !confidence}
              onClick={onSubmit}
            >
              Check answer
            </button>
          </div>
        ) : (
          <div
            className={`feedback ${correct ? "correct" : "incorrect"}`}
            role="status"
            aria-live="polite"
          >
            <div className="feedback-title">
              {correct ? (
                <CheckCircle size={22} weight="fill" />
              ) : (
                <WarningCircle size={22} weight="fill" />
              )}
              <div>
                <p className="eyebrow">
                  {correct ? "Correct decision" : "Decision needs correction"}
                </p>
                <h3>{activeQuestion.explanation}</h3>
              </div>
            </div>
            <div className="rationale-list">
              {activeQuestion.choices.map((choice, index) => (
                <div
                  key={choice.id}
                  className={
                    activeQuestion.correct_answer_ids.includes(choice.id)
                      ? "correct-rationale"
                      : ""
                  }
                >
                  <strong>{String.fromCharCode(65 + index)}</strong>
                  <p>{choice.rationale}</p>
                </div>
              ))}
            </div>
            <div className="feedback-actions">
              <SourceLink source={sourceFor(activeQuestion)} />
              <button className="primary-button" onClick={onNext}>
                Next question
                <CaretRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
      <p className="heuristic-note">
        <Info size={16} />
        Practice accuracy is a study metric. AWS reports a scaled score from 100
        to 1,000, with 750 as the passing standard.
      </p>
    </div>
  );
}

function PracticeModeBar({
  mode,
  setMode,
}: {
  mode: string;
  setMode: (mode: string) => void;
}) {
  const modes = [
    ["mixed", "Mixed"],
    ["unseen", "Unseen"],
    ["scenario", "Scenarios"],
    ["comparison", "Comparisons"],
    ["troubleshooting", "Troubleshooting"],
    ["errors", "Errors"],
  ];
  return (
    <div className="mode-bar" aria-label="Practice mode">
      {modes.map(([value, label]) => (
        <button
          key={value}
          className={mode === value ? "active" : ""}
          aria-pressed={mode === value}
          onClick={() => setMode(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ErrorsScreen({
  data,
  attempts,
  onRetry,
}: {
  data: KnowledgeData;
  attempts: Map<string, QuestionAttempt>;
  onRetry: (questionId: string) => void;
}) {
  const errors = data.questions
    .map((question) => ({ question, attempt: attempts.get(question.id) }))
    .filter(
      (
        item,
      ): item is { question: Question; attempt: QuestionAttempt } =>
        Boolean(item.attempt && !item.attempt.correct),
    )
    .sort((a, b) => b.attempt.confidence - a.attempt.confidence);

  if (!errors.length) {
    return (
      <EmptyState
        icon={<ShieldCheck size={27} />}
        title="No errors recorded yet"
        body="Incorrect answers appear here automatically, with confident mistakes listed first."
      />
    );
  }

  return (
    <div className="screen-stack">
      <div className="error-summary">
        <div>
          <p className="eyebrow">Correction queue</p>
          <h2>
            {errors.length} {errors.length === 1 ? "decision" : "decisions"} to
            revisit
          </h2>
          <p>
            Retry changed scenarios after reviewing the governing rule and AWS
            source.
          </p>
        </div>
        <div className="confidence-key">
          <span>Priority</span>
          <strong>High-confidence mistakes first</strong>
        </div>
      </div>
      <div className="error-list">
        {errors.map(({ question, attempt }) => (
          <article className="error-row" key={question.id}>
            <div className={`confidence-badge level-${attempt.confidence}`}>
              C{attempt.confidence}
            </div>
            <div>
              <div className="error-meta">
                <span>{question.mode}</span>
                <StudyDepth importance={question.importance} />
              </div>
              <h3>{question.prompt}</h3>
              <p>{question.explanation}</p>
              <div className="card-actions">
                <button
                  className="text-button"
                  onClick={() => onRetry(question.id)}
                >
                  Retry decision
                  <CaretRight size={15} />
                </button>
                <SourceLink source={sourceFor(question)} compact />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function TopicDetailPage({
  topic,
  reviewed,
  onBack,
  onReviewed,
}: {
  topic: Topic;
  reviewed: boolean;
  onBack: () => void;
  onReviewed: () => void;
}) {
  return (
    <article className="topic-detail-page" aria-labelledby="topic-detail-title">
      <button className="topic-detail-back" onClick={onBack}>
        <ArrowLeft size={17} aria-hidden="true" />
        Back to topics
      </button>

      <header className="topic-detail-hero">
        <div className="topic-detail-hero-copy">
          <StudyDepth importance={topic.importance} />
          <h1 id="topic-detail-title" tabIndex={-1}>
            {topic.title}
          </h1>
          <p>{topic.summary}</p>
          <div className="topic-detail-meta" aria-label="Topic coverage">
            <span>
              <strong>{topic.skill_ids?.length ?? 0}</strong> official skills
            </span>
            <span>
              <strong>{topic.service_ids?.length ?? 0}</strong> related services
            </span>
          </div>
        </div>
        <div className="topic-detail-actions">
          <button
            className={reviewed ? "secondary-button complete" : "primary-button"}
            onClick={onReviewed}
            disabled={reviewed}
          >
            <Check size={16} />
            {reviewed ? "Reviewed" : "Mark reviewed"}
          </button>
          <SourceLink source={sourceFor(topic)} />
        </div>
      </header>

      <section
        className="topic-detail-essentials"
        aria-labelledby="topic-essentials-title"
      >
        <div className="topic-detail-section-heading">
          <div>
            <p className="eyebrow">Decision essentials</p>
            <h2 id="topic-essentials-title">Review before the full guide</h2>
          </div>
          <p>
            Use these constraints to eliminate weak answers before comparing
            implementation details.
          </p>
        </div>
        <div className="topic-detail-essential-grid">
          <section className="topic-detail-panel">
            <h3>Why this matters</h3>
            <p>{topic.why_it_matters || topic.importance_reason}</p>
          </section>
          <TopicDetailList
            title="Decision rules"
            items={topic.decision_rules}
          />
          <TopicDetailList title="Key knowledge" items={topic.key_points} />
          <TopicDetailList
            title="Failure modes"
            items={topic.failure_modes}
            danger
          />
        </div>
      </section>

      <section
        className="topic-detail-guide"
        aria-labelledby="topic-guide-title"
      >
        <div className="topic-detail-guide-heading">
          <BookOpenText size={22} aria-hidden="true" />
          <div>
            <p className="eyebrow">Complete topic guide</p>
            <h2 id="topic-guide-title">Study the full decision model</h2>
          </div>
        </div>
        <MarkdownReader
          content={topic.content_markdown}
          variant="page"
        />
      </section>

      <section className="topic-detail-sources">
        <SourceRegistry sources={topic.sources} />
        <div className="topic-detail-footer">
          <p>
            Recheck the AWS sources when model support, Regions, APIs, quotas,
            or pricing change.
          </p>
          <button
            className={reviewed ? "secondary-button complete" : "primary-button"}
            onClick={onReviewed}
            disabled={reviewed}
          >
            <Check size={16} />
            {reviewed ? "Reviewed" : "Mark reviewed"}
          </button>
        </div>
      </section>
    </article>
  );
}

function TopicDetailList({
  title,
  items,
  danger = false,
}: {
  title: string;
  items: string[];
  danger?: boolean;
}) {
  if (!items?.length) return null;
  return (
    <section className={`topic-detail-panel ${danger ? "danger" : ""}`}>
      <h3>{title}</h3>
      <ul>
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>
            {danger ? (
              <WarningCircle size={17} aria-hidden="true" />
            ) : (
              <Check size={17} aria-hidden="true" />
            )}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ServiceDialog({
  service,
  open,
  onOpenChange,
  reviewed,
  onReviewed,
}: {
  service: ServiceEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewed: boolean;
  onReviewed: () => void;
}) {
  if (!service) return null;
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="detail-dialog" maxWidth="760px">
        <div className="dialog-heading">
          <div>
            <div className="dialog-tags">
              <span className="entity-type">{service.entity_type}</span>
              <StudyDepth importance={service.importance} />
            </div>
            <Dialog.Title>{service.exam_label}</Dialog.Title>
            <Dialog.Description>{service.role}</Dialog.Description>
          </div>
          <Dialog.Close>
            <button className="icon-button" aria-label="Close service">
              <X size={19} />
            </button>
          </Dialog.Close>
        </div>
        {service.current_label &&
          service.current_label !== service.exam_label && (
            <div className="rename-note">
              <Info size={17} />
              <p>
                Current AWS label: <strong>{service.current_label}</strong>
                {service.aliases?.length
                  ? `. Also known as ${service.aliases.join(", ")}.`
                  : "."}
              </p>
            </div>
          )}
        <div className="detail-section">
          <p className="eyebrow">Decision boundary</p>
          <p>{service.boundary}</p>
        </div>
        <DetailList title="Use when" items={service.use_when ?? []} />
        <DetailList title="Avoid when" items={service.avoid_when ?? []} danger />
        <DetailList
          title="Nearest distractors"
          items={service.confusions ?? []}
        />
        <div className="study-rationale">
          <strong>Why this study depth?</strong>
          <p>{service.importance_reason}</p>
        </div>
        <SourceRegistry sources={service.sources} />
        <div className="dialog-footer">
          <span>
            Verified{" "}
            {formatDate(service.verified_at || sourceFor(service)?.verified_at)}
          </span>
          <button
            className={reviewed ? "secondary-button complete" : "primary-button"}
            onClick={onReviewed}
            disabled={reviewed}
          >
            <Check size={16} />
            {reviewed ? "Reviewed" : "Mark reviewed"}
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function LabDialog({
  lab,
  open,
  onOpenChange,
  completed,
  onToggle,
}: {
  lab: Lab | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  completed: boolean;
  onToggle: () => void;
}) {
  if (!lab) return null;
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="detail-dialog" maxWidth="720px">
        <div className="dialog-heading">
          <div>
            <StudyDepth importance={lab.importance} />
            <Dialog.Title>{lab.title}</Dialog.Title>
            <Dialog.Description>{lab.summary}</Dialog.Description>
          </div>
          <Dialog.Close>
            <button className="icon-button" aria-label="Close lab">
              <X size={19} />
            </button>
          </Dialog.Close>
        </div>
        <DetailList title="Objectives" items={lab.objectives} />
        <DetailList title="Evidence to capture" items={lab.evidence} />
        <FullGuide
          title="Open the complete lab procedure"
          content={lab.content_markdown}
        />
        <SourceRegistry sources={lab.sources} />
        <div className="dialog-footer">
          <span>
            {lab.duration_minutes
              ? `Estimated ${lab.duration_minutes} minutes`
              : "Hands-on validation"}
          </span>
          <button
            className={completed ? "secondary-button complete" : "primary-button"}
            onClick={onToggle}
          >
            <Check size={16} />
            {completed ? "Completed" : "Mark completed"}
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function DetailList({
  title,
  items,
  danger = false,
}: {
  title: string;
  items: string[];
  danger?: boolean;
}) {
  if (!items?.length) return null;
  return (
    <div className={`detail-section detail-list ${danger ? "danger" : ""}`}>
      <p className="eyebrow">{title}</p>
      <ul>
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>
            {danger ? (
              <WarningCircle size={16} aria-hidden="true" />
            ) : (
              <Check size={16} aria-hidden="true" />
            )}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FullGuide({
  title,
  content,
}: {
  title: string;
  content?: string;
}) {
  if (!content?.trim()) return null;
  return (
    <details className="full-guide">
      <summary>
        <BookOpenText size={17} aria-hidden="true" />
        <span>{title}</span>
        <CaretDown size={16} aria-hidden="true" />
      </summary>
      <MarkdownReader content={content} />
    </details>
  );
}

function MarkdownReader({
  content,
  variant = "embedded",
}: {
  content?: string;
  variant?: "embedded" | "page";
}) {
  if (!content?.trim()) {
    return (
      <div className={`markdown-reader markdown-reader-${variant}`}>
        <p>Full guide content is not available.</p>
      </div>
    );
  }

  const renderedContent =
    variant === "page" ? content.replace(/^#\s+.+\r?\n+/, "") : content;

  return (
    <div className={`markdown-reader markdown-reader-${variant}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h2>{children}</h2>,
          h2: ({ children }) =>
            variant === "page" ? <h2>{children}</h2> : <h3>{children}</h3>,
          h3: ({ children }) =>
            variant === "page" ? <h3>{children}</h3> : <h4>{children}</h4>,
          table: ({ children }) => (
            <div className="markdown-table">
              <table>{children}</table>
            </div>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer">
              <span>{children}</span>
              <ArrowSquareOut size={13} aria-hidden="true" />
            </a>
          ),
        }}
      >
        {renderedContent}
      </ReactMarkdown>
    </div>
  );
}

function SourceRegistry({ sources }: { sources: Source[] }) {
  return (
    <div className="source-registry">
      <div>
        <p className="eyebrow">Official AWS references</p>
        <span>Facts should be rechecked when AWS changes a source.</span>
      </div>
      <div>
        {sources?.length ? (
          sources.map((source) => (
            <SourceLink key={`${source.url}-${source.title}`} source={source} />
          ))
        ) : (
          <span className="source-missing">
            <WarningCircle size={15} />
            No source attached
          </span>
        )}
      </div>
    </div>
  );
}
