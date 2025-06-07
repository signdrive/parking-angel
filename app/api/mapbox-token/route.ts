export async function GET() {
  const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN

  if (!mapboxToken) {
    console.error("Mapbox token not configured on the server.")
    return new Response(JSON.stringify({ error: "Mapbox token not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  return new Response(JSON.stringify({ token: mapboxToken }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
