export function getAssetPath(path: string): string {
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname;
    const clean = path.startsWith("/") ? path : `/${path}`;
    if (pathname.startsWith("/aip-c01-revision-console")) {
      return `/aip-c01-revision-console${clean}`;
    }
    return clean;
  }
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean;
}
