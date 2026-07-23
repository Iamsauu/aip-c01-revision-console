import { MagnifyingGlass } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { ServiceShell } from "../components/ServiceShell";

export default function ServiceNotFound() {
  return (
    <ServiceShell title="Không tìm thấy">
      <div className="service-not-found">
        <MagnifyingGlass size={30} />
        <h1>Không tìm thấy service này</h1>
        <p>
          URL có thể đã sai hoặc scope entry đã được đổi tên. Quay lại catalog để
          tìm theo tên AWS hiện tại hoặc exam label.
        </p>
        <Link href="/services">Về trang Services</Link>
      </div>
    </ServiceShell>
  );
}
