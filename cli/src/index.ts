#!/usr/bin/env node

import { program } from "commander";
import { install } from "./commands/install/index.js";
import { uninstall } from "./commands/uninstall/index.js";

program.name(__PKG_NAME__).version(__PKG_VERSION__);
program.addCommand(install);
program.addCommand(uninstall);
program.parse();