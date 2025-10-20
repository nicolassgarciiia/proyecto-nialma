// app/api/geocode/route.ts
import { NextResponse } from 'next/server'

// Esta función se ejecutará cuando alguien llame a POST /api/geocode
export async function POST(request: Request) {
  try {
    // 1. Leemos el cuerpo de la petición que nos envía el frontend
    const { placeName } = await request.json()

    if (!placeName) {
      return NextResponse.json({ error: 'placeName es requerido' }, { status: 400 })
    }

    // 2. Leemos la API Key secreta desde el servidor
    const apiKey = process.env.ORS_API_KEY

    // 3. Llamamos a OpenRouteService (ENDPOINT DE GEOCODE)
    const response = await fetch(
      `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(
        placeName
      )}`
    )

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error de ORS (Geocode):", errorData);
      throw new Error('Error al conectar con OpenRouteService (Geocoding)')
    }

    const data = await response.json()

    // 4. Procesamos la respuesta
    if (!data.features || data.features.length === 0) {
      throw new Error(`No se encontraron coordenadas para "${placeName}"`);
    }

    const firstResult = data.features[0]
    const coordinates = firstResult.geometry.coordinates // Formato: [lng, lat]

    // 5. Devolvemos las coordenadas limpias al frontend
    return NextResponse.json({
      lat: coordinates[1],
      lng: coordinates[0],
    })

  } catch (error: any) {
    console.error("Error en /api/geocode:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}