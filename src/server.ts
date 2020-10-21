import process from "process";
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import { log } from "./log";
import { Server } from "http";


export const start = async (port = 8080): Promise<{ app: Express, listen: Server }> => {
    return new Promise((ok, _er) => {
        const app = express();
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        const PORT = process.env.PORT || port;
        const listen = app.listen(PORT, () => {
            log(`Server listening on port ${PORT}...`);
            ok({ app, listen });
        });
    });
};
