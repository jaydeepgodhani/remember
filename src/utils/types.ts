export interface AuthReq {
  username: string;
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
  data?: object;
}
