import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    // Read the favicon file from the public directory
    const faviconPath = path.join(process.cwd(), 'public', 'favicon.ico')
    const favicon = await readFile(faviconPath)

    // Return the favicon with proper headers
    return new NextResponse(favicon, {
      status: 200,
      headers: {
        'Content-Type': 'image/x-icon',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  } catch (error) {
    // If favicon is not found, return 404
    return new NextResponse('Favicon not found', { 
      status: 404,
      headers: {
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  }
}
