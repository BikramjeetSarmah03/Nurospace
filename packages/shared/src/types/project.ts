export type IProject = {
  id: string;
  name: string;
  description?: string | null;
  userId: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
