import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    // Read the favicon file from the public directory
    const faviconPath = join(process.cwd(), 'public', 'favicon.ico')
    const faviconBuffer = readFileSync(faviconPath)
    
    // Create response with proper headers
    const response = new NextResponse(faviconBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/x-icon',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
    
    return response
  } catch (error) {
    // If favicon doesn't exist, return 404
    return new NextResponse('Favicon not found', { 
      status: 404,
      headers: {
        'X-Robots-Tag': 'noindex, nofollow',
      }
    })
  }
}
