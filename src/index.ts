import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import errorHandler from "./middleware/errorHandler";
import { supabase } from "./utils/supabase";
import {
  CustomError,
  RespBody,
  LoginReq,
  AuthReq,
  UpdateReq,
  UpdateRes,
  NotesRes,
} from "./utils/types";
import { log, timeLog } from "console";
import { addHours } from "date-fns";
import { timers } from "./utils/constants";
import { PostgrestError } from "@supabase/supabase-js";

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

// Get all notes on refresh - TODO take timer into account
app.post("/notes", async (req: Request, res: Response, next: NextFunction) => {
  const body: AuthReq = req.body;
  try {
    const {
      data,
      error,
    }: { data: NotesRes[] | null; error: PostgrestError | null } =
      await supabase
        .from("user_note_assoc")
        .select("*, note!inner ( * ), user!inner ( username )")
        .eq("user.username", body.username);

    if (error) {
      const err: CustomError = {
        status: 400,
        message: error.details + error.message,
      };
      return next(err);
    } else {
      console.log(data);
      const now: Date = new Date();
      let filteredData = null;
      if (data !== null) {
        filteredData = data.filter((ele, index, arr) => {
          const currentInterval: number = ele.currentInterval;
          const updatedAt: Date = ele.updatedAt;
          const remindAfterThisDate: Date = addHours(
            updatedAt,
            timers[currentInterval],
          );
          if (now >= remindAfterThisDate) return true;
          else return false;
        });
      }
      const response: RespBody = {
        success: true,
        status: 200,
        message: "Fetched all notes of logged in user",
        data: filteredData,
      };
      return res.status(200).json(response);
    }
  } catch (e) {
    log(e);
  }
});

// For particular note handle 'remind in next X days with edge cases'
app.post("/update", async (req: Request, res: Response, next: NextFunction) => {
  const body: UpdateReq = req.body;
  try {
    const { data, error } = await supabase
      .from("user_note_assoc")
      .select("*, note!inner ( * ), user ( * )")
      .eq("noteId", body.noteId);

    if (error) {
      const err: CustomError = {
        status: 400,
        message: error.details + error.message,
      };
      return next(err);
    }
    // define data structure type
    if (data) {
      if (data.length === 0) {
        const err: CustomError = {
          status: 400,
          message: `No note found with id ${body.noteId} for user ${body.username}`,
        };
        return next(err);
      } else {
        const row: UpdateRes = data[0];
        const currentInterval = row.currentInterval;
        const updatedAt: Date = row.updatedAt;
        const now: Date = new Date();
        const remindAfterThisDate: Date = addHours(
          updatedAt,
          timers[currentInterval],
        );
        const tooFar: Date = addHours(updatedAt, timers[currentInterval] * 3);
        let calculatedInterval: number = row.currentInterval;
        if (body.increase === false) {
          if (row.currentInterval !== 0) {
            calculatedInterval--;
          }
        } else {
          if (now >= remindAfterThisDate && now < tooFar) {
            if (calculatedInterval + 1 < timers.length) calculatedInterval++;
          }
        }
        const { data: dataNew, error: errorNew } = await supabase
          .from("user_note_assoc")
          .update({ currentInterval: calculatedInterval, updatedAt: now })
          .eq("noteId", body.noteId);
        const response: RespBody = {
          success: true,
          status: 200,
          message: "Update successful",
        };
        return res.status(200).send(response);
      }
    }
  } catch (e) {
    log(e);
  }
});

app.use(errorHandler);

// Start the server on port from env
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
