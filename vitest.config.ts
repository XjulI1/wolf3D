import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          test: { name: 'engine', environment: 'node', include: ['src/engine/**/*.test.ts'] },
        },
        {
          extends: true,
          test: { name: 'scene', environment: 'node', include: ['src/scene/**/*.test.ts'] },
        },
        {
          extends: true,
          test: { name: 'pwa', environment: 'node', include: ['src/pwa/**/*.test.ts'] },
        },
        {
          extends: true,
          test: {
            name: 'ui',
            environment: 'happy-dom',
            include: ['src/game/**/*.test.ts', 'src/ui/**/*.test.ts'],
          },
        },
      ],
    },
  }),
)
