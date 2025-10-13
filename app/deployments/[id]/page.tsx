import { DeploymentDetailsClient } from "./deployment-details-client"

export default async function DeploymentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <DeploymentDetailsClient id={id} />
}
