// app/api/directions/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { start, end } = await request.json()
    if (!start || !end) {
      return NextResponse.json({ error: 'Coordenadas de inicio y fin son requeridas' }, { status: 400 })
    }

    const apiKey = process.env.ORS_API_KEY

    const response = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car/geojson`, {
      method: 'POST',
      headers: {
        'Authorization': apiKey!,
        'Content-Type': 'application/json',
        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
      },
      body: JSON.stringify({
        coordinates: [start, end]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error de OpenRouteService:', errorData)
      throw new Error(errorData.error?.message || 'Error al conectar con OpenRouteService (rutas)')
    }

    const data = await response.json()

    if (!data.features || data.features.length === 0) {
      throw new Error('No se encontró ninguna ruta entre los puntos.')
    }
    const feature = data.features[0]

    if (!feature.geometry || !feature.geometry.coordinates) {
      throw new Error('La respuesta de ORS no tiene geometría.')
    }
    
    const routeGeometry = feature.geometry.coordinates
    const leafletCoords = routeGeometry.map((coord: number[]) => [coord[1], coord[0]])

    let distance = null
    let duration = null

    // --- ¡AQUÍ ESTÁ EL ARREGLO! ---
    // El resumen no está en 'feature.summary',
    // está DENTRO de 'feature.properties'
    if (feature.properties && feature.properties.summary) {
      console.log("El 'summary' SÍ existe. Leyendo 'distance'...");
      distance = feature.properties.summary.distance // en metros
      duration = feature.properties.summary.duration // en segundos
    } else {
      console.log("El 'summary' NO existe. Se omitirá la distancia.");
    }

    // Devolvemos la geometría lista para Leaflet
    return NextResponse.json({
      geometry: leafletCoords,
      distance: distance, // Será null si no hay summary
      duration: duration, // Será null si no hay summary
    })

  } catch (error: any) {
    console.error('Error en /api/directions (dentro del catch):', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}