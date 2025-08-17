import { IsOptional, IsString } from "class-validator";

export class RunWorkflowDto {
  @IsOptional()
  @IsString()
  flowDefination?: string;
}
