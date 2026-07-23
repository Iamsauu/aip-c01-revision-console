import certificationPayload from "../../public/data/certification.json";
import serviceDetailsPayload from "../../public/data/service-details.json";
import type { Certification, ServiceDetailEntry } from "../types";

export const certification =
  certificationPayload as unknown as Certification;

export const serviceDetails = (
  serviceDetailsPayload as unknown as {
    items: ServiceDetailEntry[];
  }
).items;
