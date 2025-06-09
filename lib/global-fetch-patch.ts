// Global fetch patch to fix Supabase 406 errors
export function patchGlobalFetch() {
  if (typeof window !== "undefined") {
    const originalFetch = window.fetch

    window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      // Check if this is a Supabase request
      const url = typeof input === "string" ? input : input.toString()

      if (url.includes("supabase.co/rest/v1/")) {
        const headers = new Headers(init?.headers)

        // Fix the problematic headers
        headers.set("Accept", "application/json")
        headers.delete("Accept-Profile")
        headers.delete("Content-Profile")

        // Remove the problematic PostgREST headers
        if (headers.get("Accept")?.includes("vnd.pgrst")) {
          headers.set("Accept", "application/json")
        }

        const newInit = {
          ...init,
          headers,
        }

        console.log("Patched Supabase request:", url, "Headers:", Object.fromEntries(headers.entries()))

        return originalFetch(input, newInit)
      }

      return originalFetch(input, init)
    }
  }
}
