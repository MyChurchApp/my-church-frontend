import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizes = {
    sm: { logo: 32, height: 32 },
    md: { logo: 40, height: 40 },
    lg: { logo: 60, height: 60 },
  }

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Image
          src="/mychurch-logo-transparent.png"
          alt="MyChurch Logo"
          width={sizes[size].logo}
          height={sizes[size].height}
          className="object-contain"
        />
      </div>
      {showText && <span className={`font-semibold ${size === "lg" ? "text-2xl" : "text-xl"}`}>MyChurch</span>}
    </Link>
  )
}
