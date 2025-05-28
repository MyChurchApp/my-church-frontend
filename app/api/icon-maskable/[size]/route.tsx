import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET(request: Request, { params }: { params: { size: string } }) {
  try {
    const size = Number.parseInt(params.size)
    const safeZone = size * 0.1 // 10% safe zone para maskable

    return new ImageResponse(
      <div
        style={{
          background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: safeZone,
        }}
      >
        {/* Cruz da Igreja - menor para maskable */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Vertical da cruz */}
          <div
            style={{
              width: size * 0.06,
              height: size * 0.35,
              background: "white",
              borderRadius: size * 0.015,
            }}
          />
          {/* Horizontal da cruz */}
          <div
            style={{
              width: size * 0.22,
              height: size * 0.06,
              background: "white",
              borderRadius: size * 0.015,
              position: "absolute",
              top: size * 0.12,
            }}
          />
        </div>
      </div>,
      {
        width: size,
        height: size,
      },
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
