export type IWorkflow = {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description?: string | null;
  defination?: string | null;
  execuationPlan?: string | null;
  oron?: string | null;
  status: string;
  creditCost?: number | null;
  lastRunId?: string | null;
  lastRunStatus?: string | null;
  lastRunAt?: Date | null;
  nextRunAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
