export default function Stepper({ step}) {
  const steps = ["Akun", "Data Diri", "Verifikasi OTP"]

  return (
    <div className="w-full mb-10">
      <div className="relative flex items-center justify-between">
        <div className="absolute top-4 left-0 right-0 h-[3px] bg-muted z-0" />

        {steps.map((label, i) => (
          <div
            key={i}
            className="relative z-10 flex flex-col items-center"
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center border-2 font-semibold
              ${
                i <= step
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span className="text-sm mt-2">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
