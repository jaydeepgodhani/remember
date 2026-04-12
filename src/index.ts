import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import errorHandler from "./middleware/errorHandler";
import { supabase } from "./utils/supabase";
import { CustomError, SignupReq } from "./utils/types";

console.log("Hello World!");
console.log(process.env.NODE_ENV);

// Create an Express app
const app = express();
app.use(express.json());

// Define a route for the server
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Node.js and PNPM!");
});

// Define a route for the server
app.post("/signup", (req: Request, res: Response, next: NextFunction) => {
  const body: SignupReq = req.body;
  // if username or pwd not present return error
  if (!body.username || !body.password) {
    const err: CustomError = {
      status: 400,
      message: 'Username and/or password can not be null',
    }
    next(err);
  }
  // save into DB
  res.status(200).send("User has succesfully signup");
});

const whatisit = await supabase.from("users").select();
console.log("what ? ", whatisit);

app.use(errorHandler);

// Start the server on port from env
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
