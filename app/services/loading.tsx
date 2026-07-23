import { ServiceShell } from "./components/ServiceShell";

export default function ServicesLoading() {
  return (
    <ServiceShell title="Services">
      <div className="service-loading" aria-busy="true" aria-live="polite">
        <div className="service-loading-heading">
          <span />
          <span />
          <span />
        </div>
        <div className="service-loading-grid">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index}>
              <span />
              <span />
              <span />
            </div>
          ))}
        </div>
        <span className="visually-hidden">Đang tải nội dung service</span>
      </div>
    </ServiceShell>
  );
}
