// ============================================================================
// NATIONX GROCERY — SUPABASE BACKEND CONNECTOR (Spec §3, §4.2, §12)
// ============================================================================

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('your-project-id')
);

/**
 * Universal PostgREST query helper for Supabase tables
 */
export async function supabaseQuery<T>(
  table: string,
  options: {
    select?: string;
    filters?: Record<string, string | number | boolean>;
    limit?: number;
    order?: string;
  } = {}
): Promise<{ data: T[] | null; error: string | null }> {
  if (!isSupabaseConfigured) {
    return { 
      data: null, 
      error: 'Supabase credentials not configured in .env. Operating in verified local repository mode.' 
    };
  }

  try {
    const params = new URLSearchParams();
    params.set('select', options.select || '*');
    if (options.limit) params.set('limit', String(options.limit));
    if (options.order) params.set('order', options.order);

    if (options.filters) {
      Object.entries(options.filters).forEach(([k, v]) => {
        params.set(k, `eq.${v}`);
      });
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errBody = await res.text();
      return { data: null, error: `Supabase Error (${res.status}): ${errBody}` };
    }

    const data: T[] = await res.json();
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Network request failed' };
  }
}

/**
 * RPC execution helper for atomic PostgreSQL functions (e.g. reserve_stock_atomic)
 */
export async function supabaseRpc<T>(
  functionName: string,
  payload: Record<string, unknown>
): Promise<{ data: T | null; error: string | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: 'Supabase credentials not configured in .env' };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errBody = await res.text();
      return { data: null, error: `RPC Error: ${errBody}` };
    }

    const data: T = await res.json();
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'RPC invocation failed' };
  }
}
