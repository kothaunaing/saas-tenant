const PUBLIC_ROUTES = new Set(["/login", "/register"]);

export function isPublicAuthRoute(pathname: string) {
  return PUBLIC_ROUTES.has(pathname);
}
