import { randomUUID } from 'crypto';

/**
 * Identifies this Node.js runtime (one value per process / serverless isolate after cold start).
 * Not a deployment-wide id — use for correlating logs with a single health dashboard view.
 */
const PROCESS_INSTANCE_ID = randomUUID();

export function getProcessInstanceId(): string {
  return PROCESS_INSTANCE_ID;
}
