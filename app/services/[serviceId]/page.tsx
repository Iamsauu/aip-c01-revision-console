import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailView } from "../components/ServiceDetailView";
import { ServiceShell } from "../components/ServiceShell";
import { certification, serviceDetails } from "../data";

export const dynamicParams = false;

export function generateStaticParams() {
  return serviceDetails.map((service) => ({ serviceId: service.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}): Promise<Metadata> {
  const { serviceId } = await params;
  const service = serviceDetails.find((item) => item.id === serviceId);
  if (!service) return {};
  return {
    title: service.exam_label,
    description: `${service.role} Xem pattern đề thi, điểm mạnh, red flag và từ khóa gợi nhớ cho AIP-C01.`,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  const index = serviceDetails.findIndex((service) => service.id === serviceId);
  if (index < 0) notFound();

  const service = serviceDetails[index];
  const previous = serviceDetails[index - 1];
  const next = serviceDetails[index + 1];

  return (
    <ServiceShell title={service.exam_label}>
      <ServiceDetailView
        service={service}
        contentVersion={certification.content_version}
        previous={previous}
        next={next}
      />
    </ServiceShell>
  );
}
