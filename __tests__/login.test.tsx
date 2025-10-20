// __tests__/login.test.tsx
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Login from '@/src/app/login/page' // Asegúrate de que la ruta sea correcta

// 'describe' agrupa nuestras pruebas
describe('Página de Login', () => {

  // 'it' es una prueba individual
  it('debería renderizar el formulario de login correctamente', () => {
    // 1. Renderiza el componente en un entorno virtual
    render(<Login />)

    // 2. Busca elementos en la pantalla
    
    // Busca el input de email por su "label"
    const emailInput = screen.getByLabelText(/email/i)
    
    // Busca el botón por el texto que contiene
    const loginButton = screen.getByRole('button', {
      name: /enviar enlace mágico/i,
    })

    // 3. Comprueba que los elementos existen
    expect(emailInput).toBeInTheDocument()
    expect(loginButton).toBeInTheDocument()
  })
})