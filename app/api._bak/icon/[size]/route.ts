import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { size: string } }) {
  const size = Number.parseInt(params.size)

  // Cria um SVG com o ícone da igreja
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background circle -->
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="url(#grad)" />
      
      <!-- Church cross -->
      <g transform="translate(${size / 2}, ${size / 2})">
        <!-- Vertical bar -->
        <rect x="${-size / 16}" y="${-size / 3}" width="${size / 8}" height="${(size * 2) / 3}" fill="white" rx="${size / 32}" />
        <!-- Horizontal bar -->
        <rect x="${-size / 8}" y="${-size / 6}" width="${size / 4}" height="${size / 12}" fill="white" rx="${size / 48}" />
        
        <!-- Church base -->
        <rect x="${-size / 6}" y="${size / 6}" width="${size / 3}" height="${size / 8}" fill="white" rx="${size / 32}" />
        <polygon points="${-size / 8},${size / 6} 0,${size / 12} ${size / 8},${size / 6}" fill="white" />
      </g>
    </svg>
  `

  // Converte SVG para PNG usando canvas
  const canvas = `
    <canvas width="${size}" height="${size}"></canvas>
    <script>
      const canvas = document.querySelector('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = function() {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(function(blob) {
          // Return blob
        }, 'image/png');
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(\`${svg}\`);
    </script>
  `

  // Por enquanto, retorna o SVG como PNG headers
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
