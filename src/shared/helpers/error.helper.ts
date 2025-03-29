export function formatError(contextMessage: string, error: unknown): Error {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return new Error(`${contextMessage}: ${message}`);
}
