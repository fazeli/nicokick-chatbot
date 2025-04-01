import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get the API URL from environment variables, defaulting to the current origin if not set
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Helper function to ensure URLs are properly formatted for API requests
function getFullUrl(url: string): string {
  // If the URL is already absolute, return it as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's an API endpoint but doesn't start with '/', add it
  if (!url.startsWith('/')) {
    url = `/${url}`;
  }
  
  // If we have an API base URL, use it, otherwise just use the relative URL
  return API_BASE_URL ? `${API_BASE_URL}${url}` : url;
}

export async function apiRequest(
  url: string,
  options?: RequestInit,
): Promise<any> {
  const fullUrl = getFullUrl(url);
  
  const res = await fetch(fullUrl, {
    ...options,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const fullUrl = getFullUrl(url);
    
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
