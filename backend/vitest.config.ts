import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? 'postgres://vendas:vendas@localhost:5432/vendas_test',
      BCRYPT_ROUNDS: '10',
      SEQUENTIAL_UNLOCK: 'true',
      EMAIL_PROVIDER: 'console',
    },
    fileParallelism: false,
    testTimeout: 20000,
  },
});
