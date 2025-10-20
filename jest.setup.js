// jest.setup.js

import dotenv from 'dotenv'

// Le decimos a dotenv que cargue las variables del archivo .env.local
// ¡Esto pone tus claves de Supabase en process.env para que el test las lea!
dotenv.config({ path: '.env.local' }) 

// Esto es lo que ya tenías, para que funcione .toBeInTheDocument()
import '@testing-library/jest-dom'