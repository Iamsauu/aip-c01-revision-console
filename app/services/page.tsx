import type { Metadata } from "next";
import {
  ServiceCatalog,
  type ServiceCatalogEntry,
} from "./components/ServiceCatalog";
import { ServiceShell } from "./components/ServiceShell";
import { serviceDetails } from "./data";

export const metadata: Metadata = {
  title: "AWS Services and Features Catalog - AIP-C01",
  description:
    "Explore AWS services, features, and capabilities by AIP-C01 decision patterns, core differentiators, elimination signals, and trigger keywords.",
};

export default function ServicesPage() {
  const catalogServices: ServiceCatalogEntry[] = serviceDetails.map(
    (service) => ({
      id: service.id,
      exam_label: service.exam_label,
      current_label: service.current_label,
      aliases: service.aliases,
      category: service.category,
      entity_type: service.entity_type,
      depth_tier: service.depth_tier,
      role: service.role,
      technical_boundary: service.technical_boundary,
      exam_patterns: service.exam_patterns,
      strengths: service.strengths,
      elimination_signals: service.elimination_signals,
      trigger_keywords: service.trigger_keywords,
      confused_with: service.confused_with,
      standout_feature: service.standout_feature,
      distinction_notes: service.distinction_notes,
      practice_bank_mentions: service.practice_bank_mentions,
    }),
  );
  return (
    <ServiceShell title="AWS Services Catalog">
      <ServiceCatalog services={catalogServices} />
    </ServiceShell>
  );
}
