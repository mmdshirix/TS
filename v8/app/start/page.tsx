import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getIntake } from "@/lib/intake"
import StartFlow from "@/components/start-flow"

export const dynamic = "force-dynamic"

/**
 * Landing for visitors arriving from the WordPress "Just tell me what to build" box.
 * Shows what we understood, lets them finish any remaining questions, asks them to
 * sign in / register, then builds the store and drops them into the dashboard tour.
 */
export default async function StartPage({ searchParams }: { searchParams: { intake?: string; prompt?: string } }) {
  const user = await getCurrentUser()
  const token = searchParams.intake || null
  const intake = token ? await getIntake(token) : null

  if (token && intake?.status === "built" && user) {
    redirect("/dashboard")
  }

  return (
    <StartFlow
      token={token}
      initialPrompt={searchParams.prompt || ""}
      intake={intake ? { prompt: intake.prompt, detected: intake.detected, answers: intake.answers, stage: intake.current_stage, questions: intake.questions as any, status: intake.status } : null}
      user={user ? { id: user.id, first_name: user.first_name } : null}
    />
  )
}
