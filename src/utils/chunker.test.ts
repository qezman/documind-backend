import { describe, it, expect, vi } from 'vitest';
import { chunkText } from './chunker.js';

// stub env so tests don't need a real .env
vi.mock('../config/env.js', () => ({
  env: {
    CHUNK_SIZE_TOKENS: 50,
    CHUNK_OVERLAP_TOKENS: 10,
  },
}));

describe('chunkText', () => {
  it('should return a single chunk for short text', () => {
    const text = 'This is a short text that easily fits within the token limit.';
    const chunks = chunkText(text);

    expect(chunks).toHaveLength(1);
    expect(chunks[0].content).toBe(text);
    expect(chunks[0].chunkIndex).toBe(0);
    expect(chunks[0].tokenCount).toBeGreaterThan(0);
  });

  it('should handle empty text gracefully', () => {
    const chunks = chunkText('');
    expect(chunks).toHaveLength(0);
  });
});
