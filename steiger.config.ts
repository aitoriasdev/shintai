import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      // Project rule: no barrel files. Slices are consumed by importing the defining file directly.
      'fsd/public-api': 'off',
      'fsd/no-public-api-sidestep': 'off',
    },
  },
  {
    // Colocated specs and test helpers are not part of any slice's API.
    ignores: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.e2e.ts', 'src/shared/lib/testing/**'],
  },
])
