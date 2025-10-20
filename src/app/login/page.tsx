// app/login/page.tsx
'use client' 

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient' // Importamos nuestro cliente

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault() // Evita que la página se recargue
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${location.origin}/dashboard`,
        },
      })

      if (error) throw error
      setMessage('¡Revisa tu email para ver el enlace de inicio de sesión!')
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-lg max-w-sm w-full">
        <h1 className="text-2xl font-bold text-center mb-4">Iniciar Sesión</h1>
        <p className="text-center text-gray-600 mb-6">
          Ingresa tu email para recibir un enlace de acceso (sin contraseña).
        </p>
        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {loading ? 'Enviando...' : 'Enviar enlace mágico'}
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm font-medium text-green-600">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}