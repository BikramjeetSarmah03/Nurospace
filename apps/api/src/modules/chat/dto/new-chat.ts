import { IsOptional, IsString } from "class-validator";

export class NewChatDto {
  @IsString()
  msg = "";

  @IsOptional()
  @IsString()
  chatId?: string;
}
