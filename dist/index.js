import "dotenv/config";
import express from "express";
import errorHandler from "./middleware/errorHandler";
import { supabase } from "./utils/supabase";
import { log } from "console";
import { addHours } from "date-fns";
import { timers } from "./utils/constants";
import cors from "cors";
console.log("Hello World!");
console.log(process.env.NODE_ENV);
const app = express();
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
    res.send("Hello from Node.js and PNPM!");
});
app.post("/signup", async (req, res, next) => {
    const body = req.body;
    if (!body.username || !body.password) {
        const err = {
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
            const err = {
                status: 400,
                message: error.details,
            };
            return next(err);
        }
    }
    catch (e) {
        log(e);
    }
    const response = {
        success: true,
        status: 200,
        message: "Signup successful",
    };
    return res.status(200).send(response);
});
app.post("/login", async (req, res, next) => {
    const body = req.body;
    if (!body.username || !body.password) {
        const err = {
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
            const err = {
                status: 400,
                message: error.details + error.message,
            };
            return next(err);
        }
        if (data) {
            const fecthedUser = data[0];
            if (fecthedUser.password === body.password) {
                const response = {
                    success: true,
                    status: 200,
                    message: "Login successful",
                };
                return res.status(200).send(response);
            }
            else {
                const err = {
                    status: 400,
                    message: "Wrong password !",
                };
                return next(err);
            }
        }
    }
    catch (e) {
        log(e);
    }
    const response = {
        success: true,
        status: 200,
        message: "Signup successful",
    };
    return res.status(200).send(response);
});
app.post("/createNote", async (req, res, next) => {
    const body = req.body;
    try {
        let { data, error, } = await supabase.rpc("createnote", {
            content: body.content,
            tags: body.tags || null,
            userid: body.userId,
        });
        if (error) {
            console.log(error);
            const err = {
                status: 400,
                message: error.details + error.message,
            };
            return next(err);
        }
        else {
            console.log("repsonse data ... ", data);
            const response = {
                success: true,
                status: 200,
                message: "Note created",
                data: data,
            };
            return res.status(200).json(response);
        }
    }
    catch (e) {
        log(e);
    }
});
app.post("/getNotes", async (req, res, next) => {
    const body = req.body;
    try {
        const { data, error, } = await supabase
            .from("user_note_assoc")
            .select("*, note!inner ( * ), user!inner ( id )")
            .eq("user.id", body.userId);
        if (error) {
            const err = {
                status: 400,
                message: error.details + error.message,
            };
            return next(err);
        }
        else {
            const now = new Date();
            let filteredData = null;
            if (data !== null) {
                filteredData = data.filter((ele, index, arr) => {
                    const currentInterval = ele.currentInterval;
                    const updatedAt = ele.updatedAt;
                    const remindAfterThisDate = addHours(updatedAt, timers[currentInterval]);
                    if (now >= remindAfterThisDate)
                        return true;
                    else
                        return false;
                });
            }
            const response = {
                success: true,
                status: 200,
                message: "Fetched all notes of logged in user",
                data: filteredData,
            };
            return res.status(200).json(response);
        }
    }
    catch (e) {
        log(e);
    }
});
app.post("/updateNote", async (req, res, next) => {
    const body = req.body;
    try {
        const { data, error } = await supabase
            .from("user_note_assoc")
            .select("*, note!inner ( * ), user ( * )")
            .eq("noteId", body.noteId);
        if (error) {
            const err = {
                status: 400,
                message: error.details + error.message,
            };
            return next(err);
        }
        if (data) {
            if (data.length === 0) {
                const err = {
                    status: 400,
                    message: `No note found with id ${body.noteId} for userId ${body.userId}`,
                };
                return next(err);
            }
            else {
                const row = data[0];
                const currentInterval = row.currentInterval;
                const updatedAt = row.updatedAt;
                const now = new Date();
                const remindAfterThisDate = addHours(updatedAt, timers[currentInterval]);
                const tooFar = addHours(updatedAt, timers[currentInterval] * 3);
                let calculatedInterval = row.currentInterval;
                if (body.increase === false) {
                    if (row.currentInterval !== 0) {
                        calculatedInterval--;
                    }
                }
                else {
                    if (now >= remindAfterThisDate && now < tooFar) {
                        if (calculatedInterval + 1 < timers.length)
                            calculatedInterval++;
                    }
                }
                const { data: dataNew, error: errorNew } = await supabase
                    .from("user_note_assoc")
                    .update({ currentInterval: calculatedInterval, updatedAt: now })
                    .eq("noteId", body.noteId);
                const response = {
                    success: true,
                    status: 200,
                    message: "Update successful",
                };
                return res.status(200).send(response);
            }
        }
    }
    catch (e) {
        log(e);
    }
});
app.use(errorHandler);
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map