export interface IChat {
  id: string;
  slug: string;
  title: string;
  userId: string;
  createdAt: string;
  messages?: IMessage[];
}

export interface IMessage {
  id?: string;
  chatId?: string;
  role: string;
  content: string;
  createdAt?: string;
}
