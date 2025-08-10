import { IsString } from "class-validator";

export class NewChatDto {
  @IsString()
  msg?: string;
}
