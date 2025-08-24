import { IsOptional, IsString, IsIn } from "class-validator";

export class NewChatDto {
  @IsString()
  msg = "";

  @IsOptional()
  @IsString()
  chatId?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsIn(["normal", "max", "power"])
  mode?: "normal" | "max" | "power";
}
