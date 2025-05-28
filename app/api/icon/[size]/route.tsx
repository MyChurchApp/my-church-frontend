import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET(request: Request, { params }: { params: { size: string } }) {
  try {
    const size = Number.parseInt(params.size)

    return new ImageResponse(
      <div
        style={{
          background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: size > 200 ? "20px" : "10px",
        }}
      >
        {/* Cruz da Igreja */}
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
              width: size * 0.08,
              height: size * 0.5,
              background: "white",
              borderRadius: size * 0.02,
            }}
          />
          {/* Horizontal da cruz */}
          <div
            style={{
              width: size * 0.3,
              height: size * 0.08,
              background: "white",
              borderRadius: size * 0.02,
              position: "absolute",
              top: size * 0.15,
            }}
          />
        </div>

        {/* Texto MyChurch para ícones maiores */}
        {size >= 192 && (
          <div
            style={{
              position: "absolute",
              bottom: size * 0.1,
              color: "white",
              fontSize: size * 0.08,
              fontWeight: "bold",
              fontFamily: "system-ui",
            }}
          >
            MyChurch
          </div>
        )}
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
