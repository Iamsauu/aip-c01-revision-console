import { MagnifyingGlass } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { ServiceShell } from "../components/ServiceShell";
import { getAssetPath } from "../../utils/path";

export default function ServiceNotFound() {
  return (
    <ServiceShell title="Service not found">
      <div className="service-not-found">
        <MagnifyingGlass size={30} aria-hidden="true" />
        <h1>We could not find that service</h1>
        <p>
          The URL may be incorrect, or AWS may have renamed the service. Search
          the catalog using its current name or exam label.
        </p>
        <Link href={getAssetPath("/services")}>Back to Services</Link>
      </div>
    </ServiceShell>
  );
}
