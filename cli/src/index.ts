import { program } from "commander";
import { install } from "./commands/install/index.js";

program.name(__PKG_NAME__).version(__PKG_VERSION__);
program.addCommand(install);
program.parse();