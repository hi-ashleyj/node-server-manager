import type { Log, LogFile } from "$lib/log/common";

export const encodeHeader = (run: string, start: LogFile["start"]): string => {
    return `RUN ${run}\nSTART ${start.toString()}\n`;
}

export const encodeFooter = (end: LogFile["end"], circumstance: LogFile["circumstance"]): string => {
    return `REASON ${circumstance}\nEND ${end.toString()}`;
}

export const encodeLog = (log: Log): string => {
    const count = log.message.trim().split("\n").length;
    switch (log.type) {
        case "log": {
            return `LOG ${log.at.toString()} ${count}\n${log.message.trim()}\n`;
        }
        case "error": {
            return `ERROR ${log.at.toString()} ${count}\n${log.message.trim()}\n`;
        }
    }
}

export const encodeLogFile = (run: string, file: LogFile): string => {
    return encodeHeader(run, file.start) + file.logs.map(it => encodeLog(it)).join("") + encodeFooter(file.end, file.circumstance);
}