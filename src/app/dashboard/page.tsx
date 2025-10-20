// app/dashboard/page.tsx
'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient' 
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import dynamic from 'next/dynamic'

// Interfaz para Place
interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  user_id: string;
  created_at: string;
}

// Interfaz para la Geometría de la Ruta
type RouteGeometry = [number, number][];


export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const [placeName, setPlaceName] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [places, setPlaces] = useState<Place[]>([])

  // Estados para la RUTA
  const [startPlaceId, setStartPlaceId] = useState<string>('')
  const [endPlaceId, setEndPlaceId] = useState<string>('')
  const [routeGeometry, setRouteGeometry] = useState<RouteGeometry | null>(null)
  const [routeInfo, setRouteInfo] = useState<{distance: number | null, duration: number | null} | null>(null) // Acepta null
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false)
  const [routeMessage, setRouteMessage] = useState('')


  // Carga dinámica del mapa (con tu alias correcto)
  const Map = useMemo(() => dynamic(
    () => import('@/components/Map'), 
    { 
      loading: () => <p className="text-center">Cargando mapa...</p>,
      ssr: false 
    }
  ), [])

  // useEffect (carga usuario y lugares)
  useEffect(() => {
    const checkUserAndFetchPlaces = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login'); return
      }
      setUser(user)
      

      const { data, error }: { data: Place[] | null; error: any } = await supabase
        .from('places')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setPlaces(data)
        if (data.length >= 2) {
          setStartPlaceId(data[0].id)
          setEndPlaceId(data[1].id)
        }
      }
      setLoading(false)
    }
    checkUserAndFetchPlaces()
  }, [router])

  // handleLogout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // handleAddPlace
  const handleAddPlace = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user) return 
    setIsSubmitting(true)
    setFormMessage('')
    try {
      const geocodeResponse = await fetch('/api/geocode', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ placeName: placeName }) })
      const geoData = await geocodeResponse.json()
      if (!geocodeResponse.ok) throw new Error(geoData.error || 'Error en el geocoding')

      const { data: newPlace, error: insertError } = await supabase
        .from('places')
        .insert({ name: placeName, lat: geoData.lat, lng: geoData.lng, user_id: user.id })
        .select()
        .single()

      if (insertError) throw new Error(insertError.message)
      setFormMessage(`¡Lugar "${placeName}" añadido con éxito!`)
      setPlaceName('') 
      if (newPlace) {
        setPlaces([newPlace, ...places])
      }
    } catch (error: any) {
      setFormMessage(`Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // handleCalculateRoute 
  const handleCalculateRoute = async () => {
    if (!startPlaceId || !endPlaceId) {
      setRouteMessage('Por favor, selecciona un origen y un destino.');
      return;
    }

    setIsCalculatingRoute(true)
    setRouteMessage('')
    setRouteGeometry(null)
    setRouteInfo(null)

    try {
      const startPlace = places.find(p => p.id === startPlaceId)
      const endPlace = places.find(p => p.id === endPlaceId)

      if (!startPlace || !endPlace) {
        throw new Error('No se pudieron encontrar los lugares seleccionados.')
      }

      const response = await fetch('/api/directions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: [startPlace.lng, startPlace.lat],
          end: [endPlace.lng, endPlace.lat]
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Error al calcular la ruta')
      }

      // 3. Guardar la geometría y la info de la ruta
      setRouteGeometry(data.geometry)
      setRouteInfo({ distance: data.distance, duration: data.duration })

      // Comprobamos si distance y duration NO son null
      if (data.distance !== null && data.duration !== null) {
        setRouteMessage(
          `Ruta calculada: ${(data.distance / 1000).toFixed(2)} km en ${Math.round(
            data.duration / 60
          )} min.`
        )
      } else {
        // Si son null, mostramos la ruta pero sin info
        setRouteMessage('Ruta calculada (distancia/duración no disponibles).')
      }
    
    } catch (error: any) {
      setRouteMessage(`Error: ${error.message}`)
    } finally {
      setIsCalculatingRoute(false)
    }
  }


  if (loading) {
    return <div className="p-4">Cargando...</div>
  }

  // --- RENDER (VISTA) ---
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Cabecera */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">¡Bienvenido!</h1>
          <p className="mt-2 text-lg">Sesión de: <span className="font-mono text-blue-600">{user?.email}</span></p>
        </div>
        <button onClick={handleLogout} className="py-2 px-4 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none">
          Cerrar Sesión
        </button>
      </div>

      {/* Formulario Añadir Lugar */}
      <div className="mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Añadir Lugar (R2)</h2>
        <form onSubmit={handleAddPlace}>
           <label htmlFor="placeName" className="block text-sm font-medium text-gray-700">Nombre del lugar (Topónimo)</label>
           <input id="placeName" type="text" value={placeName} onChange={(e) => setPlaceName(e.target.value)} required placeholder="Ej: Museo del Prado, Madrid" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
           <button type="submit" disabled={isSubmitting} className="w-full mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:bg-gray-400">
             {isSubmitting ? 'Guardando...' : 'Añadir Lugar'}
           </button>
        </form>
        {formMessage && <p className="mt-4 text-center text-sm font-medium">{formMessage}</p>}
      </div>

      {/* Calcular Ruta (R4) */}
      <div className="mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Calcular Ruta (R4)</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Desplegable de Origen */}
          <div>
            <label htmlFor="startPlace" className="block text-sm font-medium text-gray-700">Origen</label>
            <select
              id="startPlace"
              value={startPlaceId}
              onChange={(e) => setStartPlaceId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Selecciona un origen --</option>
              {places.map(place => (
                <option key={place.id} value={place.id}>{place.name}</option>
              ))}
            </select>
          </div>
          {/* Desplegable de Destino */}
          <div>
            <label htmlFor="endPlace" className="block text-sm font-medium text-gray-700">Destino</label>
            <select
              id="endPlace"
              value={endPlaceId}
              onChange={(e) => setEndPlaceId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Selecciona un destino --</option>
              {places.map(place => (
                <option key={place.id} value={place.id}>{place.name}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleCalculateRoute}
          disabled={isCalculatingRoute || places.length < 2}
          className="w-full mt-6 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:bg-gray-400"
        >
          {isCalculatingRoute ? 'Calculando...' : 'Obtener Ruta'}
        </button>
        {routeMessage && <p className="mt-4 text-center text-sm font-medium">{routeMessage}</p>}
      </div>
      
      {/* Mapa */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Mapa Interactivo</h2>
        <Map places={places} routeGeometry={routeGeometry} />
      </div>

      {/* Lista de Lugares */}
      <div className="mt-10 p-6 bg-white rounded-lg shadow-md">
         <h2 className="text-2xl font-bold mb-4">Lista de Lugares</h2>
         <ul className="divide-y divide-gray-200">
          {places.length > 0 ? (
            places.map(place => (
              <li key={place.id} className="py-3">
                <p className="text-lg font-medium text-gray-900">{place.name}</p>
                <p className="text-sm text-gray-500">Coords: {place.lat.toFixed(4)}, {place.lng.toFixed(4)}</p>
              </li>
            ))
          ) : (
            <p className="text-gray-500">Aún no has guardado ningún lugar.</p>
          )}
         </ul>
      </div>
    </div>
  )
}