import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import Stepper from "@/components/register/Stepper"
import StepAccount from "@/components/register/StepAccount"
import StepProfile from "@/components/register/StepProfile"
import StepOtp from "@/components/register/StepOtp"

export default function Register() {
  const [step, setStep] = useState(0)
  const [userId, setUserId] = useState(null)

  return (
    <div className="min-h-screen flex flex-col gap-6 items-center justify-center px-4">
      <h2 className="text-3xl font-bold text-[#622F10] text-center mb-4 sm:mb-6">
        Registrasi
      </h2>
      <Card className="w-full max-w-xl">
        <CardContent className="p-6">
          <Stepper step={step} />

          {step === 0 && (
            <StepAccount next={() => setStep(1)} setUserId={setUserId} />
          )}

          {step === 1 && (
            <StepProfile userId={userId} next={() => setStep(2)} />
          )}

          {step === 2 && <StepOtp userId={userId} />}
        </CardContent>
      </Card>
    </div>
  )
}
