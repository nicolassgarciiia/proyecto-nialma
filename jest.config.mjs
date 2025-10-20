// jest.config.mjs
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Apunta a tu app de Next.js
  dir: './',
})

/** @type {import('jest').Config} */
const config = {
  // Le dice a Jest que simule un navegador
  testEnvironment: 'jest-environment-jsdom',

  // Apunta al archivo de setup que crearemos en el Paso 2
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], 
}

// Exporta la configuración
export default createJestConfig(config)