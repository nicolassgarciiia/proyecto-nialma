// app/page.tsx
import Link from 'next/link' // Importamos el componente de Enlace de Next.js

export default function HomePage() {
  return (
    // Usamos Tailwind para centrar todo en la pantalla
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="text-center p-10 bg-white rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">
          Bienvenidos al Spike 
          <br />
          del proyecto de las asignaturas EI1039-EI1048
          <br />
          Nicolás, Matías y Alberto
        </h1>
        
        {/* Este enlace te llevará a la página de login que ya creamos */}
        <Link href="/login">
          <button className="py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-colors duration-200">
            Ir a Inicio de Sesión / Registro
          </button>
        </Link>
      </div>
    </main>
  )
}