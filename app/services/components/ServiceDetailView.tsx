import {
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  ArrowsLeftRight,
  BookOpenText,
  CheckCircle,
  LinkSimple,
  Sparkle,
  Target,
  WarningCircle,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";
import type { ServiceDetailEntry } from "../../types";
import { ServiceReviewButton } from "./ServiceReviewButton";
import { getAssetPath } from "../../utils/path";

const depthLabels: Record<number, string> = {
  1: "Tier 1: Implement and troubleshoot",
  2: "Tier 2: Make architecture decisions",
  3: "Tier 3: Recognize the service",
};

const modeLabels: Record<string, string> = {
  scenario: "Scenario",
  comparison: "Comparison",
  troubleshooting: "Troubleshooting",
  recall: "Recall",
};

type ServiceNeighbor = Pick<ServiceDetailEntry, "id" | "exam_label">;

function DetailList({
  items,
  danger = false,
}: {
  items: string[];
  danger?: boolean;
}) {
  return (
    <ul className={danger ? "service-detail-list danger" : "service-detail-list"}>
      {items.map((item) => (
        <li key={item}>
          {danger ? (
            <WarningCircle size={18} aria-hidden="true" />
          ) : (
            <CheckCircle size={18} aria-hidden="true" />
          )}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ServiceDetailView({
  service,
  contentVersion,
  previous,
  next,
}: {
  service: ServiceDetailEntry;
  contentVersion: string;
  previous?: ServiceNeighbor;
  next?: ServiceNeighbor;
}) {
  return (
    <article className="service-detail-page">
      <nav className="service-breadcrumb" aria-label="Breadcrumb">
        <Link href={getAssetPath("/services")}>
          <ArrowLeft size={16} aria-hidden="true" />
          Services
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{service.category}</span>
      </nav>

      <header className="service-detail-hero">
        <div className="service-detail-heading">
          <div className="service-detail-tags">
            <span>{service.entity_type}</span>
            <span>Tier {service.depth_tier}</span>
            <span>{service.category}</span>
          </div>
          <h1>{service.exam_label}</h1>
          <p>{service.role}</p>
          {service.current_label &&
            service.current_label !== service.exam_label && (
              <div className="service-rename-note">
                AWS now calls this <strong>{service.current_label}</strong>
                {service.aliases?.length
                  ? `. You may also see ${service.aliases.join(", ")}`
                  : ""}
              </div>
            )}
        </div>

        <aside className="service-detail-summary">
          <div>
            <span>Study Depth</span>
            <strong>{depthLabels[service.depth_tier]}</strong>
          </div>
          {service.practice_bank_mentions && (
            <div>
              <span>Practice Question Signal</span>
              <strong>
                {service.practice_bank_mentions.correct_answer_mentions}/
                {service.practice_bank_mentions.total_questions} correct answers
              </strong>
              <small>Based on this study set, not official AWS exam weighting.</small>
            </div>
          )}
          <ServiceReviewButton
            serviceId={service.id}
            contentVersion={contentVersion}
          />
        </aside>
      </header>

      {service.standout_feature && (
        <section className="service-standout-banner" aria-labelledby="standout-title">
          <div className="service-standout-header">
            <Sparkle size={24} weight="fill" aria-hidden="true" />
            <div>
              <span className="services-kicker">Core Differentiator</span>
              <h2 id="standout-title">Why it stands out</h2>
            </div>
          </div>
          <p className="service-standout-text">{service.standout_feature}</p>
        </section>
      )}

      <section className="service-memory-line" aria-labelledby="memory-title">
        <Target size={24} aria-hidden="true" />
        <div>
          <p id="memory-title">Key Takeaway</p>
          <strong>{service.strengths[0]}</strong>
        </div>
      </section>

      <section className="service-keyword-section" aria-labelledby="keyword-title">
        <div className="service-section-heading">
          <h2 id="keyword-title">Trigger Keywords</h2>
          <p>
            Use these terms to build a shortlist, then check every scenario
            constraint before choosing an answer.
          </p>
        </div>
        <div className="service-keywords">
          {service.trigger_keywords.map((keyword) => (
            <code key={keyword}>{keyword}</code>
          ))}
        </div>
      </section>

      <div className="service-decision-grid">
        <section className="service-decision-panel patterns">
          <p className="services-kicker">Decision Trigger Patterns</p>
          <h2>When should you choose this service?</h2>
          <DetailList items={service.exam_patterns} />
        </section>

        <section className="service-decision-panel strengths">
          <p className="services-kicker">Strengths and Use Cases</p>
          <h2>What does it do especially well?</h2>
          <DetailList items={service.strengths} />
        </section>

        <section className="service-elimination-panel">
          <div>
            <WarningCircle size={24} aria-hidden="true" />
            <p className="services-kicker">Elimination Signals</p>
            <h2>When should you rule it out?</h2>
          </div>
          <DetailList items={service.elimination_signals} danger />
          <p>
            No single word unconditionally eliminates an option. Red flags apply when
            they directly conflict with key scenario requirements.
          </p>
        </section>
      </div>

      {((service.distinction_notes && service.distinction_notes.length > 0) ||
        service.confusion_targets.length > 0) && (
        <section
          className="service-confusion-section"
          aria-labelledby="distinction-title"
        >
          <div className="service-section-heading">
            <h2 id="distinction-title">How it differs from similar options</h2>
            <p>
              Compare responsibilities and operating boundaries before eliminating a
              similar-looking answer.
            </p>
          </div>
          <div className="service-confusion-layout">
            {service.confusion_targets.length > 0 && (
              <div className="service-confusion-links">
                {service.confusion_targets.map((target) =>
                  target.id ? (
                    <Link href={getAssetPath(`/services/${target.id}`)} key={target.label}>
                      <ArrowsLeftRight size={18} aria-hidden="true" />
                      <span>{target.label}</span>
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  ) : (
                    <span key={target.label}>
                      <ArrowsLeftRight size={18} aria-hidden="true" />
                      {target.label}
                    </span>
                  ),
                )}
              </div>
            )}
            {service.distinction_notes && service.distinction_notes.length > 0 ? (
              <DetailList items={service.distinction_notes} />
            ) : (
              service.comparison_notes.length > 0 && (
                <DetailList items={service.comparison_notes} />
              )
            )}
          </div>
        </section>
      )}

      {service.commonly_paired_with.length > 0 && (
        <section className="service-pairing-section" aria-labelledby="pairing-title">
          <div>
            <LinkSimple size={21} aria-hidden="true" />
            <h2 id="pairing-title">Commonly Paired Services</h2>
          </div>
          <div className="service-pairing-links">
            {service.commonly_paired_with.map((related) => (
              <Link href={getAssetPath(`/services/${related.id}`)} key={related.id}>
                <span>{related.exam_label}</span>
                <small>{related.question_count} related questions</small>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="service-question-section" aria-labelledby="question-title">
        <div className="service-section-heading">
          <h2 id="question-title">Related Exam Questions</h2>
          <p>
            Questions from this study set that directly test this service.
          </p>
        </div>
        {service.related_questions.length > 0 ? (
          <div className="service-question-list">
            {service.related_questions.map((question) => (
              <article key={question.id}>
                <div>
                  <span>{modeLabels[question.mode] ?? question.mode}</span>
                  <code>{question.id}</code>
                </div>
                <h3>{question.prompt}</h3>
                <p>{question.explanation}</p>
                <Link
                  href={getAssetPath(`/?view=practice&question=${question.id}`)}
                  aria-label={`Open ${question.id} in Practice`}
                >
                  Open in Practice
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="service-question-empty">
            <BookOpenText size={24} aria-hidden="true" />
            <div>
              <h3>No direct public MCQ attached yet</h3>
              <p>
                This entry remains fully in scope for study. Use the patterns and differentiators
                above for recognition at this tier.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="service-topic-section" aria-labelledby="topic-title">
        <div className="service-section-heading">
          <h2 id="topic-title">Related Knowledge Base Topics</h2>
          <p>
            Core concepts behind this service&apos;s architecture and decision rules.
          </p>
        </div>
        <div className="service-topic-grid">
          {service.related_topics.map((topic) => (
            <article key={topic.id}>
              <span>{topic.short_title || topic.title}</span>
              <p>{topic.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="service-source-section" aria-labelledby="source-title">
        <div>
          <h2 id="source-title">Official AWS Documentation</h2>
          <p>
            Before production use, verify Region availability, quotas, model support,
            and pricing.
          </p>
        </div>
        <div>
          {service.sources.map((source) => (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              key={source.url}
            >
              <span>
                {source.title}
                <span className="visually-hidden"> (opens in a new tab)</span>
              </span>
              <ArrowSquareOut size={16} aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>

      <nav className="service-neighbor-nav" aria-label="Adjacent services navigation">
        {previous ? (
          <Link href={getAssetPath(`/services/${previous.id}`)} rel="prev">
            <ArrowLeft size={17} aria-hidden="true" />
            <span>
              <small>Previous</small>
              <strong>{previous.exam_label}</strong>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={getAssetPath(`/services/${next.id}`)} rel="next">
            <span>
              <small>Next</small>
              <strong>{next.exam_label}</strong>
            </span>
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
