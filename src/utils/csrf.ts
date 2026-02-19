// src/utils/csrf.ts

export function getCsrfToken(): string | null {
  const name = "csrftoken";
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
  
  return cookieValue || null;
}

export function getCsrfHeaders(): Record<string, string> {
  const token = getCsrfToken();
  return token ? { "X-CSRFToken": token } : {};
}