import type { Metadata } from "next";
import {
  ServiceCatalog,
  type ServiceCatalogEntry,
} from "./components/ServiceCatalog";
import { ServiceShell } from "./components/ServiceShell";
import { serviceDetails } from "./data";

export const metadata: Metadata = {
  title: "AWS Services theo pattern đề thi",
  description:
    "Tra cứu từng AWS service, feature và capability theo pattern AIP-C01, điểm mạnh, red flag có điều kiện và từ khóa gợi nhớ.",
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
      practice_bank_mentions: service.practice_bank_mentions,
    }),
  );
  return (
    <ServiceShell title="Services">
      <ServiceCatalog services={catalogServices} />
    </ServiceShell>
  );
}
