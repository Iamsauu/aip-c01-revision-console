import {
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  ArrowsLeftRight,
  BookOpenText,
  CheckCircle,
  LinkSimple,
  Target,
  WarningCircle,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";
import type { ServiceDetailEntry } from "../../types";
import { ServiceReviewButton } from "./ServiceReviewButton";

const depthLabels: Record<number, string> = {
  1: "Tier 1: cần hiểu cách triển khai và xử lý lỗi",
  2: "Tier 2: cần phân biệt theo quyết định kiến trúc",
  3: "Tier 3: cần nhận diện đúng vai trò",
};

const modeLabels: Record<string, string> = {
  scenario: "Tình huống",
  comparison: "So sánh",
  troubleshooting: "Xử lý lỗi",
  recall: "Ghi nhớ",
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
        <Link href="/services">
          <ArrowLeft size={16} />
          Services
        </Link>
        <span>/</span>
        <span>{service.category}</span>
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
                Tên hiện tại trên AWS: <strong>{service.current_label}</strong>
                {service.aliases?.length
                  ? `, còn gặp dưới tên ${service.aliases.join(", ")}`
                  : ""}
              </div>
            )}
        </div>

        <aside className="service-detail-summary">
          <div>
            <span>Độ sâu ôn tập</span>
            <strong>{depthLabels[service.depth_tier]}</strong>
          </div>
          {service.practice_bank_mentions && (
            <div>
              <span>Tín hiệu trong bộ local</span>
              <strong>
                {service.practice_bank_mentions.correct_answer_mentions}/
                {service.practice_bank_mentions.total_questions} đáp án đúng
              </strong>
              <small>Không phải trọng số chính thức của AWS.</small>
            </div>
          )}
          <ServiceReviewButton
            serviceId={service.id}
            contentVersion={contentVersion}
          />
        </aside>
      </header>

      <section className="service-memory-line" aria-labelledby="memory-title">
        <Target size={24} aria-hidden="true" />
        <div>
          <p id="memory-title">Nhớ một câu</p>
          <strong>{service.strengths[0]}</strong>
        </div>
      </section>

      <section className="service-keyword-section" aria-labelledby="keyword-title">
        <div className="service-section-heading">
          <h2 id="keyword-title">Từ khóa dễ liên tưởng</h2>
          <p>
            Dùng để tạo shortlist. Vẫn phải đối chiếu toàn bộ constraint trước
            khi chọn đáp án.
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
          <p className="services-kicker">Pattern phổ biến</p>
          <h2>Khi nào đề đang dẫn tới service này?</h2>
          <DetailList items={service.exam_patterns} />
        </section>

        <section className="service-decision-panel strengths">
          <p className="services-kicker">Điểm mạnh</p>
          <h2>Service này giải quyết tốt điều gì?</h2>
          <DetailList items={service.strengths} />
        </section>

        <section className="service-elimination-panel">
          <div>
            <WarningCircle size={24} aria-hidden="true" />
            <p className="services-kicker">Red flag có điều kiện</p>
            <h2>Nhìn thấy constraint này thì cân nhắc loại đáp án</h2>
          </div>
          <DetailList items={service.elimination_signals} danger />
          <p>
            Không có một từ đơn lẻ nào luôn loại được đáp án. Red flag chỉ đúng
            khi nó mâu thuẫn với yêu cầu chính của tình huống.
          </p>
        </section>
      </div>

      {(service.confusion_targets.length > 0 ||
        service.comparison_notes.length > 0) && (
        <section
          className="service-confusion-section"
          aria-labelledby="confusion-title"
        >
          <div className="service-section-heading">
            <h2 id="confusion-title">Dễ nhầm với service nào?</h2>
            <p>
              So sánh theo trách nhiệm kiến trúc, không so theo việc hai dịch vụ
              có thể cùng xuất hiện trong một solution.
            </p>
          </div>
          <div className="service-confusion-layout">
            <div className="service-confusion-links">
              {service.confusion_targets.map((target) =>
                target.id ? (
                  <Link href={`/services/${target.id}`} key={target.label}>
                    <ArrowsLeftRight size={18} />
                    <span>{target.label}</span>
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <span key={target.label}>
                    <ArrowsLeftRight size={18} />
                    {target.label}
                  </span>
                ),
              )}
            </div>
            {service.comparison_notes.length > 0 && (
              <DetailList items={service.comparison_notes} />
            )}
          </div>
        </section>
      )}

      {service.commonly_paired_with.length > 0 && (
        <section className="service-pairing-section" aria-labelledby="pairing-title">
          <div>
            <LinkSimple size={21} aria-hidden="true" />
            <h2 id="pairing-title">Thường đi cùng trong câu hỏi local</h2>
          </div>
          <div className="service-pairing-links">
            {service.commonly_paired_with.map((related) => (
              <Link href={`/services/${related.id}`} key={related.id}>
                <span>{related.exam_label}</span>
                <small>{related.question_count} câu liên quan</small>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="service-question-section" aria-labelledby="question-title">
        <div className="service-section-heading">
          <h2 id="question-title">Pattern từ câu hỏi gốc trong site</h2>
          <p>
            Các câu dưới đây do knowledge base local tổng hợp và có liên kết trực
            tiếp tới scope entry này.
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
                <Link href={`/?view=practice&question=${question.id}`}>
                  Mở trong Practice
                  <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="service-question-empty">
            <BookOpenText size={24} aria-hidden="true" />
            <div>
              <h3>Chưa có câu MCQ public gắn trực tiếp</h3>
              <p>
                Entry này vẫn thuộc scope ôn tập. Dùng pattern và red flag phía
                trên để nhận diện ở mức tier hiện tại.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="service-topic-section" aria-labelledby="topic-title">
        <div className="service-section-heading">
          <h2 id="topic-title">Kiến thức nền liên quan</h2>
          <p>
            Các topic này là nguồn dùng để suy ra vai trò, pattern và boundary
            của service.
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
          <h2 id="source-title">Nguồn AWS chính thức</h2>
          <p>
            Kiểm tra lại Region, quota, model support và pricing trước khi áp
            dụng cho production.
          </p>
        </div>
        <div>
          {service.sources.map((source) => (
            <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>
              <span>{source.title}</span>
              <ArrowSquareOut size={16} />
            </a>
          ))}
        </div>
      </section>

      <nav className="service-neighbor-nav" aria-label="Service liền kề">
        {previous ? (
          <Link href={`/services/${previous.id}`} rel="prev">
            <ArrowLeft size={17} />
            <span>
              <small>Trước</small>
              <strong>{previous.exam_label}</strong>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/services/${next.id}`} rel="next">
            <span>
              <small>Tiếp theo</small>
              <strong>{next.exam_label}</strong>
            </span>
            <ArrowRight size={17} />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
