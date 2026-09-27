import { redirect } from "next/navigation"

export default function AdminRedirect({ params }: { params: { id: string } }) {
  redirect(`/admin-panel/${params.id}`)
}
