"use client";

import {
  ArrowRight,
  CheckCircle,
  MagnifyingGlass,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ServiceDetailEntry, StudyProgress } from "../../types";
import { getAssetPath } from "../../utils/path";

const STORAGE_KEY = "aip-c01-progress-v1";

export type ServiceCatalogEntry = Pick<
  ServiceDetailEntry,
  | "id"
  | "exam_label"
  | "current_label"
  | "aliases"
  | "category"
  | "entity_type"
  | "depth_tier"
  | "role"
  | "technical_boundary"
  | "exam_patterns"
  | "strengths"
  | "elimination_signals"
  | "trigger_keywords"
  | "confused_with"
  | "practice_bank_mentions"
>;

const depthLabels: Record<number, string> = {
  1: "Tier 1: triển khai",
  2: "Tier 2: quyết định kiến trúc",
  3: "Tier 3: nhận diện",
};

function categoryId(category: string) {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function readReviewedServiceIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const progress = JSON.parse(raw) as StudyProgress;
    return new Set(progress.reviewed_service_ids ?? []);
  } catch {
    return new Set<string>();
  }
}

function ServiceCatalogCard({
  service,
  reviewed,
}: {
  service: ServiceCatalogEntry;
  reviewed: boolean;
}) {
  return (
    <Link className="service-catalog-card" href={getAssetPath(`/services/${service.id}`)}>
      <div className="service-card-meta">
        <span>{service.entity_type}</span>
        <span>Tier {service.depth_tier}</span>
        {reviewed && (
          <span className="service-card-reviewed">
            <CheckCircle size={14} weight="fill" />
            Đã ôn
          </span>
        )}
      </div>
      <h3>{service.exam_label}</h3>
      <p>{service.strengths[0]}</p>
      <div className="service-card-signals" aria-label="Từ khóa gợi nhớ">
        {service.trigger_keywords.slice(0, 3).map((keyword) => (
          <code key={keyword}>{keyword}</code>
        ))}
      </div>
      <div className="service-card-warning">
        <WarningCircle size={16} aria-hidden="true" />
        <span>{service.elimination_signals[0]}</span>
      </div>
      <span className="service-card-open">
        Mở trang chi tiết
        <ArrowRight size={16} />
      </span>
    </Link>
  );
}

export function ServiceCatalog({
  services,
}: {
  services: ServiceCatalogEntry[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [depth, setDepth] = useState("All");
  const [entityType, setEntityType] = useState("All");
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setReviewedIds(readReviewedIds());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const categories = useMemo(
    () => [...new Set(services.map((service) => service.category))],
    [services],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return services.filter((service) => {
      const haystack = [
        service.exam_label,
        service.current_label,
        ...(service.aliases ?? []),
        service.category,
        service.role,
        service.technical_boundary,
        ...service.exam_patterns,
        ...service.strengths,
        ...service.elimination_signals,
        ...service.trigger_keywords,
        ...service.confused_with,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        (!normalizedQuery || haystack.includes(normalizedQuery)) &&
        (category === "All" || service.category === category) &&
        (depth === "All" || String(service.depth_tier) === depth) &&
        (entityType === "All" || service.entity_type === entityType)
      );
    });
  }, [category, depth, entityType, query, services]);

  const grouped = useMemo(
    () =>
      categories
        .map((name) => ({
          name,
          items: filtered.filter((service) => service.category === name),
        }))
        .filter((group) => group.items.length > 0),
    [categories, filtered],
  );

  const highSignalServices = useMemo(
    () =>
      services
        .filter((service) => service.practice_bank_mentions)
        .sort(
          (left, right) =>
            (right.practice_bank_mentions?.correct_answer_mentions ?? 0) -
            (left.practice_bank_mentions?.correct_answer_mentions ?? 0),
        )
        .slice(0, 8),
    [services],
  );

  const counts = useMemo(
    () => ({
      services: services.filter((item) => item.entity_type === "service").length,
      features: services.filter((item) => item.entity_type === "feature").length,
      capabilities: services.filter((item) => item.entity_type === "capability")
        .length,
    }),
    [services],
  );

  function clearFilters() {
    setQuery("");
    setCategory("All");
    setDepth("All");
    setEntityType("All");
  }

  return (
    <div className="service-catalog-page">
      <section className="service-catalog-hero">
        <div>
          <p className="services-kicker">Ôn theo tín hiệu đề thi</p>
          <h1>Nhìn constraint, chọn đúng service.</h1>
          <p>
            Mỗi scope entry có pattern, điểm mạnh, red flag có điều kiện và các
            từ khóa dễ liên tưởng khi làm bài.
          </p>
        </div>
        <dl className="service-scope-counts" aria-label="Phạm vi service">
          <div>
            <dt>Tổng scope</dt>
            <dd>{services.length}</dd>
          </div>
          <div>
            <dt>Services</dt>
            <dd>{counts.services}</dd>
          </div>
          <div>
            <dt>Features</dt>
            <dd>{counts.features}</dd>
          </div>
          <div>
            <dt>Capabilities</dt>
            <dd>{counts.capabilities}</dd>
          </div>
        </dl>
      </section>

      <section className="service-signal-section" aria-labelledby="signal-title">
        <div className="service-section-heading">
          <h2 id="signal-title">Tín hiệu mạnh trong bộ 150 câu local</h2>
          <p>
            Đây là số lần xuất hiện trong đáp án đúng của bộ luyện tập, không
            phải trọng số chính thức từ AWS.
          </p>
        </div>
        <div className="service-signal-rail">
          {highSignalServices.map((service) => (
            <Link href={getAssetPath(`/services/${service.id}`)} key={service.id}>
              <span>{service.exam_label}</span>
              <strong>
                {service.practice_bank_mentions?.correct_answer_mentions}/
                {service.practice_bank_mentions?.total_questions}
              </strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="service-catalog-controls" aria-label="Lọc services">
        <label className="service-search">
          <MagnifyingGlass size={19} aria-hidden="true" />
          <span className="visually-hidden">Tìm service</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm service, pattern, từ khóa hoặc distractor"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Xóa tìm kiếm">
              <X size={16} />
            </button>
          )}
        </label>

        <label className="service-select">
          <span>Nhóm</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="All">Tất cả nhóm</option>
            {categories.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="service-select">
          <span>Độ sâu</span>
          <select value={depth} onChange={(event) => setDepth(event.target.value)}>
            <option value="All">Tất cả tier</option>
            <option value="1">{depthLabels[1]}</option>
            <option value="2">{depthLabels[2]}</option>
            <option value="3">{depthLabels[3]}</option>
          </select>
        </label>

        <label className="service-select">
          <span>Loại entry</span>
          <select
            value={entityType}
            onChange={(event) => setEntityType(event.target.value)}
          >
            <option value="All">Tất cả loại</option>
            <option value="service">Service</option>
            <option value="feature">Feature</option>
            <option value="capability">Capability</option>
          </select>
        </label>
      </section>

      <div className="service-result-line">
        <p>
          <strong>{filtered.length}</strong> kết quả
        </p>
        {(query ||
          category !== "All" ||
          depth !== "All" ||
          entityType !== "All") && (
          <button type="button" onClick={clearFilters}>
            Xóa toàn bộ bộ lọc
          </button>
        )}
      </div>

      {grouped.length > 0 ? (
        <div className="service-category-stack">
          {grouped.map((group) => (
            <section
              className="service-category-section"
              id={categoryId(group.name)}
              key={group.name}
            >
              <header>
                <h2>{group.name}</h2>
                <span>{group.items.length} entries</span>
              </header>
              <div className="service-catalog-grid">
                {group.items.map((service) => (
                  <ServiceCatalogCard
                    service={service}
                    reviewed={reviewedIds.has(service.id)}
                    key={service.id}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="service-catalog-empty">
          <MagnifyingGlass size={28} />
          <h2>Không tìm thấy service phù hợp</h2>
          <p>Thử một từ khóa ngắn hơn hoặc xóa các bộ lọc đang bật.</p>
          <button type="button" onClick={clearFilters}>
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
