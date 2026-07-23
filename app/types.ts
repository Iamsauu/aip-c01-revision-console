export type Importance = "Critical" | "Important" | "Awareness";

export type Source = {
  title: string;
  url: string;
  publisher?: string;
  verified_at?: string;
};

export type Skill = {
  id: string;
  title: string;
  importance?: Importance;
  topic_ids?: string[];
  service_ids?: string[];
  sources?: Source[];
};

export type Task = {
  id: string;
  title: string;
  summary?: string;
  skills: Skill[];
};

export type Domain = {
  id: string;
  code: string;
  title: string;
  short_title?: string;
  weight: number;
  summary: string;
  task_count?: number;
  skill_count?: number;
  tasks: Task[];
  sources: Source[];
  content_markdown?: string;
};

export type Topic = {
  id: string;
  title: string;
  short_title?: string;
  summary: string;
  why_it_matters?: string;
  importance: Importance;
  importance_reason: string;
  domain_ids: string[];
  skill_ids: string[];
  service_ids: string[];
  key_points: string[];
  decision_rules: string[];
  failure_modes: string[];
  sources: Source[];
  content_markdown?: string;
};

export type ServiceEntry = {
  id: string;
  name?: string;
  exam_label: string;
  current_label?: string;
  aliases?: string[];
  category: string;
  entity_type: "service" | "feature" | "capability";
  depth_tier: 1 | 2 | 3;
  importance: Importance;
  importance_reason: string;
  role: string;
  boundary: string;
  use_when?: string[];
  avoid_when?: string[];
  confusions?: string[];
  topic_ids?: string[];
  domain_ids?: string[];
  skill_ids?: string[];
  sources: Source[];
  verified_at?: string;
};

export type PracticeBankMentions = {
  correct_answer_mentions: number;
  total_questions: number;
  note: string;
};

export type ServiceQuestionSummary = {
  id: string;
  type: "single" | "multiple";
  mode: "recall" | "scenario" | "comparison" | "troubleshooting";
  prompt: string;
  explanation: string;
  importance: Importance;
};

export type ServiceTopicSummary = {
  id: string;
  title: string;
  short_title?: string;
  summary: string;
};

export type ServiceRelationship = {
  id: string;
  exam_label: string;
  question_count: number;
};

export type ServiceConfusionTarget = {
  label: string;
  id: string | null;
};

export type ServiceDetailEntry = ServiceEntry & {
  technical_boundary: string;
  exam_patterns: string[];
  strengths: string[];
  elimination_signals: string[];
  trigger_keywords: string[];
  confused_with: string[];
  comparison_notes: string[];
  practice_bank_mentions: PracticeBankMentions | null;
  related_questions: ServiceQuestionSummary[];
  related_topics: ServiceTopicSummary[];
  confusion_targets: ServiceConfusionTarget[];
  commonly_paired_with: ServiceRelationship[];
};

export type AnswerChoice = {
  id: string;
  text: string;
  rationale: string;
};

export type Question = {
  id: string;
  type: "single" | "multiple";
  mode: "recall" | "scenario" | "comparison" | "troubleshooting";
  prompt: string;
  choices: AnswerChoice[];
  correct_answer_ids: string[];
  explanation: string;
  domain_ids: string[];
  topic_ids: string[];
  service_ids: string[];
  importance: Importance;
  sources: Source[];
};

export type Lab = {
  id: string;
  title: string;
  summary: string;
  duration_minutes?: number;
  importance: Importance;
  objectives: string[];
  evidence: string[];
  domain_ids: string[];
  topic_ids: string[];
  service_ids: string[];
  sources: Source[];
  content_markdown?: string;
};

export type Certification = {
  id: string;
  code: string;
  title: string;
  question_count: number;
  scored_question_count: number;
  unscored_question_count: number;
  duration_minutes: number;
  passing_scaled_score: number;
  score_scale: {
    minimum: number;
    maximum: number;
  };
  coverage: {
    domains: number;
    tasks: number;
    skills: number;
    scope_entries: number;
  };
  caveats: string[];
  sources: Source[];
  content_version: string;
  verified_at: string;
};

export type KnowledgeData = {
  certification: Certification;
  domains: Domain[];
  topics: Topic[];
  services: ServiceEntry[];
  questions: Question[];
  labs: Lab[];
};

export type QuestionAttempt = {
  question_id: string;
  selected_ids: string[];
  correct: boolean;
  confidence: 1 | 2 | 3;
  attempted_at: string;
};

export type StudyProgress = {
  schema_version: 1;
  content_version: string;
  created_at: string;
  updated_at: string;
  question_attempts: QuestionAttempt[];
  reviewed_topic_ids: string[];
  reviewed_service_ids: string[];
  completed_lab_ids: string[];
  bookmarked_ids: string[];
};
