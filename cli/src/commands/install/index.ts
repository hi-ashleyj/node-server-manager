import { Command } from "commander";
import { interact } from "./interactive.js";
import { validate } from "./options.js";

export const install = new Command("install")
    .description("Downloads and installs NSM")
    .option("-q", "--quiet", "No console output. Errors if arguments are missing.")
    .action((str, options) => {
        if (!options.quiet) {
            interact(options).catch(err => {
                console.error(err);
            })
        } else {
            const check = validate.parse(options);
            // problem? quiet was asked, throw the error
        }
    });