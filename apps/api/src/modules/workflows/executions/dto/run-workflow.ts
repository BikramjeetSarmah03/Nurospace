import { IsOptional, IsString } from "class-validator";

export class RunWorkflowDto {
  @IsOptional()
  @IsString()
  workflowId?: string;

  @IsOptional()
  @IsString()
  flowDefination?: string;
}
