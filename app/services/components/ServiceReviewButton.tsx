"use client";

import { Check, CheckCircle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import type { StudyProgress } from "../../types";

const STORAGE_KEY = "aip-c01-progress-v1";

function emptyProgress(contentVersion: string): StudyProgress {
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

function readProgress(contentVersion: string) {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return emptyProgress(contentVersion);
  try {
    const parsed = JSON.parse(saved) as StudyProgress;
    if (!Array.isArray(parsed.reviewed_service_ids)) {
      return emptyProgress(contentVersion);
    }
    return parsed;
  } catch {
    return emptyProgress(contentVersion);
  }
}

export function ServiceReviewButton({
  serviceId,
  contentVersion,
}: {
  serviceId: string;
  contentVersion: string;
}) {
  const [reviewed, setReviewed] = useState(false);

  useEffect(() => {
    const progress = readProgress(contentVersion);
    const frame = window.requestAnimationFrame(() => {
      setReviewed(progress.reviewed_service_ids.includes(serviceId));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [contentVersion, serviceId]);

  function markReviewed() {
    const progress = readProgress(contentVersion);
    if (!progress.reviewed_service_ids.includes(serviceId)) {
      progress.reviewed_service_ids.push(serviceId);
    }
    progress.updated_at = new Date().toISOString();
    progress.content_version = contentVersion;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    setReviewed(true);
  }

  return (
    <button
      className={reviewed ? "service-review-button reviewed" : "service-review-button"}
      type="button"
      onClick={markReviewed}
      disabled={reviewed}
    >
      {reviewed ? (
        <CheckCircle size={18} weight="fill" />
      ) : (
        <Check size={18} />
      )}
      {reviewed ? "Đã ôn" : "Đánh dấu đã ôn"}
    </button>
  );
}
