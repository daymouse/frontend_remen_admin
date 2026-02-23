import { Button } from "@/components/ui/button"

export default function ButtonOutline({
  onClick,
  sudahJaga,
  absenLoading,
  primary = "#622F10",
}) {
  const label = absenLoading
    ? "Mencatat..."
    : sudahJaga
    ? "Anda Sedang Jaga Hari Ini"
    : "Saya Jaga Sekarang"

  return (
    <Button
      onClick={onClick}
      disabled={sudahJaga || absenLoading}
      variant="outline"
      className="mb-4 px-6 py-3 font-semibold transition-colors"
      style={{
        backgroundColor: sudahJaga ? "#ccc" : primary,
        color: "#fff",
      }}
    >
      {label}
    </Button>
  )
}
