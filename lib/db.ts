// This file now just re-exports from the server-only module
export * from "./db.server"

// Note: Use getSql() function for lazy database initialization
// Do NOT export sql directly from @neondatabase/serverless as it causes
// the client to instantiate at module load time, triggering browser warnings
