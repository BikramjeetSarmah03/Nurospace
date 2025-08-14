import { IsString } from "class-validator";

export class UpdateWorkflowDto {
  @IsString()
  defination!: string;
}
