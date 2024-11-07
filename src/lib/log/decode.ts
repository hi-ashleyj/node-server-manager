import type { LogFile } from "$lib/log/common";

export const decodeLogFile = (file: string): [ [ string | null, Partial<LogFile> & Pick<LogFile, "logs"> ], null ] | [ null, string ] => {
    let lines = file.split("\n");
    const parsed: Partial<LogFile> & Pick<LogFile, "logs"> = {
        logs: [],
    };
    let run: string | null = null;
    while (lines.length > 0) {
        const work = lines.shift()!;
        const args = work.split(" ");
        switch (args[0]) {
            case "RUN": {
                if (run) return [ null, "Run was specified twice" ];
                run = args[1];
                break;
            }
            case "START": {
                if (parsed.start) return [ null, "Start time was specified twice" ];
                try {
                    parsed.start = parseInt(args[1]);
                } catch (_) {
                    return [ null, "Failed to parse start time"];
                }
                break;
            }
            case "END": {
                if (parsed.end) return [ null, "End time was specified twice" ];
                try {
                    parsed.end = parseInt(args[1]);
                } catch (_) {
                    return [ null, "Failed to parse end time"];
                }
                break;
            }
            case "REASON": {
                if (parsed.circumstance) return [ null, "Circumstance was specified twice" ];
                parsed.circumstance = work.slice(7) as LogFile["circumstance"];
                break;
            }
            case "LOG":
            case "ERROR": {
                try {
                    const at = parseInt(args[1]);
                    const count = parseInt(args[2]);
                    const type = args[0].toLowerCase() as "log" | "error";
                    const messageItems = lines.splice(0, count);
                    parsed.logs.push({ type, at, message: messageItems.join("\n") });
                } catch (_) {
                    [ null, "Failed to parse number in log" ];
                }
                break;
            }
            default: {
                return [ null, "Found Invalid Code in File" ];
            }
        }
    }

    return [ [ run, parsed as LogFile ], null ];

}