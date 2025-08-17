import { IsString, IsOptional, IsIn } from "class-validator";

export class UploadResourceDto {
  @IsString()
  @IsIn(["pdf", "image", "youtube", "notes"])
  type: string | undefined;

  @IsOptional()
  file?: File;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
