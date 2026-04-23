import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import errorHandler from "./middleware/errorHandler";
import { supabase } from "./utils/supabase";
import { CustomError, RespBody, LoginReq, AuthReq } from "./utils/types";
import { log } from "console";

console.log("Hello World!");
console.log(process.env.NODE_ENV);

// Create an Express app
const app = express();
app.use(express.json());

// Define a test route for the server
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Node.js and PNPM!");
});

// Define a signup route for the server
app.post("/signup", async (req: Request, res: Response, next: NextFunction) => {
  const body: LoginReq = req.body;
  // if username or pwd not present return error
  if (!body.username || !body.password) {
    const err: CustomError = {
      status: 400,
      message: "Username and/or password can not be null",
    };
    return next(err);
  }
  try {
    const { error } = await supabase
      .from("user")
      .insert({ username: body.username, password: body.password });
    if (error) {
      const err: CustomError = {
        status: 400,
        message: error.details,
      };
      return next(err);
    }
  } catch (e) {
    log(e);
  }
  // saved into DB
  const response: RespBody = {
    success: true,
    status: 200,
    message: "Signup successful",
  };
  return res.status(200).send(response);
});

// Login route for a server
app.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  const body: LoginReq = req.body;
  // if username or pwd not present return error
  if (!body.username || !body.password) {
    const err: CustomError = {
      status: 400,
      message: "Username and/or password can not be null",
    };
    return next(err);
  }
  try {
    const { data, error } = await supabase
      .from("user")
      .select()
      .eq("username", body.username);
    if (error) {
      const err: CustomError = {
        status: 400,
        message: error.details + error.message,
      };
      return next(err);
    }
    if (data) {
      const fecthedUser = data[0];
      if (fecthedUser.password === body.password) {
        const response: RespBody = {
          success: true,
          status: 200,
          message: "Login successful",
        };
        return res.status(200).send(response);
      } else {
        const err: CustomError = {
          status: 400,
          message: "Wrong password !",
        };
        return next(err);
      }
    }
  } catch (e) {
    log(e);
  }
  // saved into DB
  const response: RespBody = {
    success: true,
    status: 200,
    message: "Signup successful",
  };
  return res.status(200).send(response);
});

const whatisit = await supabase.from("user").select();
console.log("what ? ", whatisit);

// Get all notes on refresh
app.post("/notes", async (req: Request, res: Response, next: NextFunction) => {
  const body: AuthReq = req.body;
  try {
    const { data, error } = await supabase
      .from("user_note_assoc")
      .select("*, note!inner ( * ), user ( username )");

    if (error) {
      const err: CustomError = {
        status: 400,
        message: error.details + error.message,
      };
      return next(err);
    }
    // define data structure type
    if (data) {
      const response: RespBody = {
        success: true,
        status: 200,
        message: "Fetched all notes of logged in user",
        data: data,
      };
      return res.status(200).json(response);
    }
  } catch (e) {
    log(e);
  }
});

// For particular note handle 'remind in next X days with edge cases'

// For particular note handle 'remind in next X days with edge cases'

app.use(errorHandler);

// Start the server on port from env
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
