/**
 * Supabase Client Setup
 * Initialize Supabase client for authentication and database operations
 */

// Import Supabase client from CDN (or you can use npm package)
// For production, you should bundle this properly

class SupabaseClient {
    constructor() {
        this.client = null;
        this.init();
    }

    init() {
        if (!window.__ENV || !window.__ENV.SUPABASE_URL || !window.__ENV.SUPABASE_ANON_KEY) {
            throw new Error('Supabase configuration missing. Please check env.js');
        }

        // For now, we'll create a simple client using fetch
        // In production, you should use the official Supabase JS client
        this.client = {
            auth: {
                signUp: async ({ email, password, options }) => {
                    const response = await fetch(`${window.__ENV.SUPABASE_URL}/auth/v1/signup`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': window.__ENV.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.__ENV.SUPABASE_ANON_KEY}`
                        },
                        body: JSON.stringify({
                            email: email,
                            password: password,
                            options: {
                                data: options?.data || {}
                            }
                        })
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        return { data: null, error: data };
                    }

                    return { data: data, error: null };
                },

                signIn: async ({ email, password }) => {
                    const response = await fetch(`${window.__ENV.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': window.__ENV.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.__ENV.SUPABASE_ANON_KEY}`
                        },
                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        return { data: null, error: data };
                    }

                    return { data: data, error: null };
                },

                signOut: async () => {
                    const token = sessionStorage.getItem('auth_token');
                    if (token) {
                        await fetch(`${window.__ENV.SUPABASE_URL}/auth/v1/logout`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'apikey': window.__ENV.SUPABASE_ANON_KEY,
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        sessionStorage.removeItem('auth_token');
                    }
                },

                getCurrentUser: async () => {
                    const token = sessionStorage.getItem('auth_token');
                    if (!token) return { data: { user: null }, error: null };

                    const response = await fetch(`${window.__ENV.SUPABASE_URL}/auth/v1/user`, {
                        headers: {
                            'apikey': window.__ENV.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        return { data: { user: null }, error: data };
                    }

                    return { data: { user: data }, error: null };
                }
            },

            from: (table) => ({
                select: (columns = '*') => ({
                    eq: (column, value) => ({
                        then: async (callback) => {
                            const token = sessionStorage.getItem('auth_token');
                            const response = await fetch(`${window.__ENV.SUPABASE_URL}/rest/v1/${table}?select=${columns}&${column}=eq.${value}`, {
                                headers: {
                                    'apikey': window.__ENV.SUPABASE_ANON_KEY,
                                    'Authorization': token ? `Bearer ${token}` : `Bearer ${window.__ENV.SUPABASE_ANON_KEY}`
                                }
                            });

                            const data = await response.json();
                            callback(response.ok ? data : null, response.ok ? null : data);
                        }
                    })
                })
            })
        };
    }

    get auth() {
        return this.client.auth;
    }

    get from() {
        return this.client.from;
    }
}

// Initialize global Supabase client
window.supabase = new SupabaseClient();
