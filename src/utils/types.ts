export interface UpdateReq {
  username: string;
  noteId: number;
  increase: boolean;
}

export interface UpdateRes {
  userId: number;
  noteId: number;
  currentInterval: number;
  id: number;
  updatedAt: Date;
  note: { id: number; tags: string[]; content: string };
  user: { id: number; password: string; username: string };
}

export interface AuthReq {
  username: string;
}

export interface NotesRes {
  userId: number;
  noteId: number;
  currentInterval: number;
  id: number;
  updatedAt: Date;
  user: {
    username: string;
  };
  note: {
    id: number;
    tags: string[];
    content: string;
  };
}

export interface LoginReq {
  username: string;
  password: string;
}

export interface CustomError {
  status: number;
  message: string;
}

export interface RespBody {
  success: boolean;
  status: number;
  message?: string;
  data?: object | null;
}
