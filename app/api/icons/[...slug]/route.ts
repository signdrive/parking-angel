import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest, { params }: { params: { slug: string[] } }) {
  try {
    const iconPath = params.slug.join("/")
    const filePath = path.join(process.cwd(), "public", iconPath)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      // Return a simple SVG fallback
      const size = iconPath.includes("192") ? 192 : iconPath.includes("512") ? 512 : 180
      const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#3b82f6" rx="20"/>
        <text x="50%" y="50%" font-family="Arial" font-size="${size / 4}" fill="white" text-anchor="middle" dominant-baseline="central">PA</text>
      </svg>`

      return new NextResponse(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=31536000",
        },
      })
    }

    const fileBuffer = fs.readFileSync(filePath)
    const ext = path.extname(filePath).toLowerCase()

    let contentType = "image/png"
    if (ext === ".svg") contentType = "image/svg+xml"
    if (ext === ".ico") contentType = "image/x-icon"

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    })
  } catch (error) {
    console.error("Icon serving error:", error)

    // Return a minimal SVG as ultimate fallback
    const svg = `<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
      <rect width="192" height="192" fill="#3b82f6"/>
      <text x="96" y="110" font-family="Arial" font-size="48" fill="white" text-anchor="middle">PA</text>
    </svg>`

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    })
  }
}
