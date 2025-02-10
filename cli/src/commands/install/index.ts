import { Command } from "commander";
import { interact } from "./interactive.js";

export const install = new Command("install")
    .description("Downloads and installs NSM")
    .option("-q", "--quiet", "No console output. Errors if arguments are missing.")
    .action((str, options) => {
        if (!options.quiet) {
            interact(options).then((prm) => {

            }).catch(err => {
                console.error(err);
            })
        }
    });