let os = require("os");
let fsSync = require("fs");
let fs = fsSync.promises;
let path = require("path");
let url = require("url");
let http = require("http");
let child_process = require("child_process");
let ws = require("ws");
let ownLogs = [];
let criticalException = false;

let logxtra = function(...line) {
    for (let lx of line) {
        ownLogs.push({type: "log", data: lx});
    }
    while (ownLogs.length > 100) {
        ownLogs.shift();
    }
    console.log(...line);
};

let logerror = function(...line) {
    for (let lx of line) {
        ownLogs.push({type: "err", data: lx});
    }
    while (ownLogs.length > 100) {
        ownLogs.shift();
    }
    console.error(...line);
};

let r403 = function(res) {
    res.writeHead(403, http.STATUS_CODES[403]);
    res.end();
};

let networkingPort = 7436;
let remoteServer;

let remoteSend = async function(cl, type, data) {
    let msg = JSON.stringify({ type, data });
    if (cl) {
        cl.send(msg);
    } else {
        remoteServer.clients.forEach(function each(client) {
            if (client.readyState === ws.OPEN) {
                client.send(msg);
            }
        });
    }
};

let Manager = {};
Manager.servers = {};
Manager.autoStartOnce = false;
Manager.restartCounters = {};
Manager.autoStart;
Manager.broadcast;
Manager.listServers;
Manager.getServer;

/**
 * servers: {
 *      id: "",
 *      port: "",
 *      runatboot: (true|false),
 *      runfile: "app.js" (or similar array of path)
 * }
 */

Manager.runningServers = { test: {}, production: {} };

let SpawnedServer = function(type, id, process, silent) {
    this.type = type;
    this.id = id;
    this.log = [];
    this.running = true;
    this.process = process;
    this.events = [];
    this.isMisbehaving = true;

    this.on = function(type, call) {
        this.events.push({ type, call });
    }

    this.fire = function(type, data) {
        for (e of this.events) {
            if (e.type == type) {
                e.call(data);
            }
        }
    };

    let u = this;

    this.process.stdout.on("data", (chunk) => {
        let entry = { type: "log", data: chunk.toString() };
        u.log.push(entry);
        if (!silent) {
            Manager.broadcast("log", u.id, u.type, entry);
        }
        
        while (u.log.length > 100) {
            u.log.shift();
        }
    });

    this.process.stderr.on("data", (chunk) => {
        let entry = { type: "err", data: chunk.toString() };
        u.log.push(entry);
        if (!silent) {
            Manager.broadcast("log", u.id, u.type, entry);
        }

        while (u.log.length > 100) {
            u.log.shift();
        }
    });

    this.process.on("exit", (code, signal) => {
        if (typeof code == "number") {
            // Exited itself
            u.log.push({type: "log", data: "Exited by itself" + ((code == 0) ? "" : " (code " + code + "). Error Information may be available above.")});
            u.fire("exit", code);
        } else if (typeof signal == "string") {
            u.log.push({type: "log", data: "Terminated by signal: " + signal});
            u.fire("stop", (typeof signal == "string"));
        }

        u.running = false;
        if (!silent) {
            Manager.broadcast("stop", u.id, u.type);
        }

        if (u.isMisbehaving) {
            Manager.misbehaved(u);
        }
    });

    this.process.on("error", (...args) => {
        console.error(...args);
    });

    this.stop = function() {
        u.isMisbehaving = false;
        u.process.kill();
    };

    return this;
};

let rootFolder = path.resolve(__dirname, "..");
let storeFolder = path.resolve(rootFolder, "store");

if (!fsSync.existsSync(storeFolder)) { // Create folders and default users
    try {
        fs.mkdir(storeFolder).then(async function() {
            await fs.writeFile(path.resolve(storeFolder, "servers.json"), "{}");
        });
    } catch (_err) {
        
    }
} else {
    fs.readFile(path.resolve(storeFolder, "servers.json"), {encoding: "utf8"}).then((data) => {
        Manager.servers = JSON.parse(data);
        if (typeof Manager.autoStart == "function") {
            Manager.autoStart();
        }
    });
}

if (!fsSync.existsSync(path.resolve(rootFolder, "test"))) {
    try {
        fs.mkdir(path.resolve(rootFolder, "test"));
    } catch (_err) { }
}

if (!fsSync.existsSync(path.resolve(rootFolder, "production"))) {
    try {
        fs.mkdir(path.resolve(rootFolder,"production"));
    } catch (_err) { }
}

let Auth = require("./auth.js")(storeFolder);

Manager.save = async function() {
    try {
        await fs.writeFile(path.resolve(storeFolder, "servers.json"), JSON.stringify(Manager.servers));
    } catch (err) {
        
    }
    
}; 

Manager.broadcast = function(type, ...data) {
    let output = { servers: Manager.listServers() };

    if (type == "start" || type == "stop") {
        output.target = data[0];
        output.space = data[1];
    } else if (type == "log") {
        output.target = data[0];
        output.space = data[1];
        output.message = data[2];
    } else if (type == "script-complete") {
        Object.assign(output, data[0]);
    }

    remoteSend(null, type, output);
};

Manager.stopServer = function(type, id) {
    return new Promise(async (resolve, _reject) => {
        if (Manager.runningServers[type][id]) {
            if (Manager.runningServers[type][id].running) {
                Manager.runningServers[type][id].on("stop", (_stopped) => {
                    resolve();
                });

                Manager.runningServers[type][id].stop();
            } else {
                resolve();
            }
        } else {
            resolve();
        }
    })
};

Manager.spawnServer = function(type, id) {
    if (Manager.servers[id].runfile.length == 0) {
        return;
    }
    let options = {};
    let args = [];

    args.push(Manager.servers[id].runfile);
    args.push("port:" + (((type == "test") ? 30000 : 0) + Manager.servers[id].port));

    options.cwd = path.resolve(rootFolder, type, "" + id);

    let process = child_process.spawn("node", args, options);

    Manager.runningServers[type][id] = new SpawnedServer(type, id, process);
    Manager.broadcast("start", id, type);
};

Manager.autoStart = function() {
    if (Manager.autoStartOnce) {
        logxtra("Autostart stopped");
        return;
    } else {
        logxtra("Found " + Object.keys(Manager.servers).length + " production server" + ((Object.keys(Manager.servers).length !== 1) ? "s" : ""));
        Manager.autoStartOnce = true;

        for (let id in Manager.servers) {
            if (Manager.servers[id].runonboot) {
                Manager.spawnServer("production", id);
                logxtra("Starting server \"" + id + "\"");
            } else {
                logxtra("Didn't start server \"" + id + "\"");
            } 
        }
    }
};

Manager.newServer = async function(payload) {
    // payload is a server payload lol

    if (payload && payload.id && payload.port && payload.giturl) {
        let config = {
            id: payload.id,
            port: payload.port,
            runatboot: (payload.runatboot) ? true : false,
            runfile: (payload.runfile) ? payload.runfile : "app.js",
            giturl: payload.giturl,
            cloned: { test: false, production: false }
        }

        Manager.servers[config.id] = config;

        await Manager.save();
        await fs.mkdir(path.resolve(rootFolder, "test", config.id));
        await fs.mkdir(path.resolve(rootFolder, "production", config.id));

        return config;
    } else {
        return null;
    }
};

Manager.updateServer = async function(payload) {
    if (payload && payload.id && Manager.servers[payload.id]) {
        Object.assign(Manager.servers[payload.id], payload);

        await Manager.save();
        return Manager.servers[payload.id];
    } else {
        return null;
    }
};

Manager.listFiles = async function(type, id, loc) {
    try {
        let sevn = await fs.readdir(path.resolve(rootFolder, type, id, ...loc), { encoding: "utf8", withFileTypes: true });
        let output = { id: id, path: loc, files: []};
    
        for (let dirent of sevn) {
            let work = {};
            if (dirent.isFile()) {
                work.type = "file";
            }
            if (dirent.isDirectory()) {
                work.type = "folder";
            }
            if (work.type) {
                work.name = dirent.name;
                work.path = [].concat(loc, dirent.name);
                output.files.push(work);
            }
        }
    
        return output;
    } catch (err) {
        return null;
    }
};

Manager.storeFile = async function(type, id, loc, dataBase64) {
    try {
        if (dataBase64 == "folder") {
            await fs.mkdir(path.resolve(rootFolder, type, id, ...loc));
        } else {
            await fs.writeFile(path.resolve(rootFolder, type, id, ...loc), dataBase64, "base64");
        }

        return await Manager.listFiles(id, loc.slice(0, -1));
    } catch (err) {
        return null;
    }
};

Manager.removeFile = async function(type, id, loc) {
    try {
        let stat = await fs.stat(path.resolve(rootFolder, type, id, ...loc));
        if (stat.isDirectory()) {
            await fs.rmdir(path.resolve(rootFolder, type, id, ...loc), {recursive: true});
        } else if (stat.isFile()) {
            await fs.unlink(path.resolve(rootFolder, type, id, ...loc));
        } else {
            throw "ERR|RMF: Fuck.";
        }

        return await Manager.listFiles(id, loc.slice(0, -1));
    } catch (err) {
        return null;
    }
    
};

Manager.getServer = function(id) {
    if (id) {
        let work = Object.assign({}, Manager.servers[id]);
        work.running = {
            test: (Object.keys(Manager.runningServers.test).includes(id) && Manager.runningServers.test[id].running),
            production: (Object.keys(Manager.runningServers.production).includes(id) && Manager.runningServers.production[id].running)
        };
        return work;
    } else {
        return null;
    }
};

Manager.listServers = function() {
    let work = JSON.parse(JSON.stringify(Manager.servers));
    for (let id in work) {
        work[id].running = {
            test: (Object.keys(Manager.runningServers.test).includes(id) && Manager.runningServers.test[id].running),
            production: (Object.keys(Manager.runningServers.production).includes(id) && Manager.runningServers.production[id].running)
        };
    }
    return work;
};

Manager.getLogfile = function(type, id, temp) {
    if (Manager.runningServers[type][id]) {
        return Manager.runningServers[type][id].log;
    }
    return [];
};

Manager.runNPM = function(type, id, args) {
    return new Promise(async (resolve, reject) => {
        if (args.length > 0) {
            let options = {};
        
            options.cwd = path.resolve(rootFolder, type, "" + id);

            let npmLoc = path.resolve(rootFolder, "node", "npm.cmd");
        
            let process = child_process.spawn(npmLoc, args, options);

            let instance = new SpawnedServer(type, id, process);

            instance.on("stop", (code) => {
                let logs = instance.log;

                let res = { type, id, logs: logs, root: "npm" };
                Manager.broadcast("script-complete", res);
                resolve(res);
            });

            instance.on("exit", (code) => {
                let logs = instance.log;

                let res = { type, id, logs: logs, root: "npm" };
                Manager.broadcast("script-complete", res);
                resolve(res);
            });
        } else {
            resolve(null);
        }
    }); 
};

Manager.runGit = function(type, id, args) {
    return new Promise(async (resolve, reject) => {
        if (args.length > 0) {
            let options = {};
        
            options.cwd = path.resolve(rootFolder, type, (args.includes("clone")) ? ("") : ("" + id));

            let gitLoc = path.resolve(rootFolder, "git", "bin", "git.exe");
        
            let process = child_process.spawn(gitLoc, args, options);

            let instance = new SpawnedServer(type, id, process);

            instance.on("stop", (code) => {
                let logs = instance.log;

                let res = { type, id, logs: logs, root: "git" };
                Manager.broadcast("script-complete", res);
                resolve(res);
            });

            instance.on("exit", (code) => {
                let logs = instance.log;

                let res = { type, id, logs: logs, root: "git" };
                Manager.broadcast("script-complete", res);
                resolve(res);
            });
        } else {
            resolve(null);
        }
    }); 
};

Manager.misbehaved = function(server) {
    let type = server.type;
    let id = server.id;
    let logs = server.log;

    if (Manager.runningServers[type][id] == server && type == "production") {
        if (!Manager.restartCounters[id]) Manager.restartCounters[id] = [];
        Manager.restartCounters[id].push((new Date()).toISOString());

        let fiveMinutesAgoish = (new Date()).valueOf() - (1000 * 60 * 5);

        for (let i = Manager.restartCounters[id].length - 1; i >= 0; i--) {
            if ((new Date(Manager.restartCounters[id][i])).valueOf() < fiveMinutesAgoish) {
                Manager.restartCounters[id].splice(i, 1);
            }
        }

        if (Manager.restartCounters[id].length < 3) {
            setTimeout(() => { 
                Manager.spawnServer(type, id);
            }, 1000);
        }

        fs.writeFile(path.resolve(storeFolder, `log-${type}-${id}-${(new Date()).toISOString().split(":").join("-")}.txt`), `${logs.map((val) => { return val.type.toUpperCase() + " | " + val.data.split("\n").join("\n      ") }).join("\n")}`);
    }
};

// --- HTTP STUFF --- //

let Requests = {};

Requests.path = function(req, res) {
    // This handles sending the pages required.
    let parseIt = url.parse(req.url, true);
    let pathed = path.parse(req.url);
    let needsIndex = (pathed.base) ? "" : "index.html";
    let pathpath = __dirname + "/remote" + parseIt.pathname + needsIndex;

    if (fsSync.existsSync(pathpath)) {
        try {
            if (pathed.ext == ".html") {
                res.setHeader("Content-Type", "text/html");
            } else if (pathed.ext == ".js") {
                res.setHeader("Content-Type", "application/js");
            } else if (pathed.ext == ".css") {
                res.setHeader("Content-Type", "text/css");
            } else if (pathed.ext == ".png") {
                res.setHeader("Content-Type", "image/png");
            } else if (pathed.ext == ".svg") {
                res.setHeader("Content-Type", "image/svg+xml");
            } else if (pathed.ext == ".ttf") {
                res.setHeader("Content-Type", "application/font");
            }
    
            let stream = fsSync.createReadStream(pathpath);
            stream.on("open", () => {
                stream.pipe(res);
            });
    
            stream.on("error", () => {
                res.statusCode = 404;
                logxtra(`app.js/path: Wrote error 404 in response to ${req.url}`);
                res.end("Not Found");
            });
        } catch {
            res.statusCode = 404;
            logxtra(`app.js/path: Wrote error 404 in response to ${req.url}`);
            res.end("Not Found");
        }
        
        
    } else {
        // Test if this should be a redirect endpoint
        let id;
        let type;
        for (var i in Manager.servers) {
            if (parseIt.pathname == ("/test/" + i)) {
                id = i;
                type = "test";
                break;
            }
            if (parseIt.pathname == ("/production/" + i)) {
                id = i;
                type = "production"
            }
        }

        if (id) { // If it is
            res.setHeader("Location", "http://" + req.headers.host + ":" + (((type == "test") ? 30000 : 0) + Manager.servers[id].port) + "/");
            res.writeHead(307, http.STATUS_CODES[307]);
            res.end();
        } else { // If it isn't
            logxtra(`app.js/path: Wrote error 404 in response to ${req.url}`);
            res.end();
        }
    }
};

Requests.Users = {};

Requests.Users.login = function(_req, res, data) {
    let { username, password } = JSON.parse(data.toString());
    let response = Auth.login(username, password);

    res.end(JSON.stringify(response));
};

Requests.Users.logout = function(req, res, data) {
    let token = Auth.getTokenFromHeaders(req.headers);
    Auth.revokeToken(token);

    res.writeHead(204, http.STATUS_CODES[204]);
    res.end();
};

Requests.Users.verify = function(req, res, data) {
    let username = Auth.verifyHeaders(req.headers);
    if (username) {
        res.end(JSON.stringify({ username }));
        return;
    }

    res.end("{}");
};

Requests.Users.create = function(req, res, data) {
    if (!Auth.checkHeaders(req.headers, 20)) { r403(res); return; }
    let { username, access } = JSON.parse(data.toString());

    let error = Auth.create(username, access);
    res.end(JSON.stringify({ error }));
};

Requests.Users.changePassword = function(req, res, _data) {
    let username = Auth.verifyHeaders(req.headers);
    let { old_password, new_password, repeat_password } = JSON.parse(data.toString());
    let error = Auth.changePassword(username, old_password, new_password, repeat_password);

    if (error) {
        res.end(JSON.stringify({ error }));
    } else {
        res.end(JSON.stringify({ error: null }));
    }
};

Requests.Users.resetPassword = function(req, res, data) {
    let { username } = JSON.parse(data.toString());
    
    if (!Auth.checkHeaders(req.headers, 20)) { r403(res); return; }

    Auth.resetPassword(username);
    res.end();
};

Requests.Users.edit = function(req, res, data) {
    let { access, username } = JSON.parse(data.toString());
    
    if (!Auth.checkHeaders(req.headers, 20)) { r403(res); return; }

    Auth.edit(username, access);
    res.end();
};

Requests.Users.delete = function(req, res, data) {
    let { username } = JSON.parse(data.toString());
    
    if (!Auth.checkHeaders(req.headers, 20)) { r403(res); return; }

    Auth.delete(username);
    res.end();
};

Requests.Users.get = function(req, res, data) {
    let payload = JSON.parse(data.toString());

    let askingUser = Auth.verifyHeaders(req.headers);

    if (!askingUser) { r403(res); return; }

    if (payload.username == "@" || Auth.checkHeaders(req.headers, 20) || (askingUser == payload.username)) {
        res.end(JSON.stringify(Auth.get((payload.username == "@") ? askingUser : payload.username)));
        return;
    }
    
    r403(res);
};

Requests.Users.list = function(req, res, _data) {
    if (Auth.checkHeaders(req.headers, 20)) {
        res.end(JSON.stringify(Auth.list));
        return;
    }
    
    r403(res);
};

Requests.startServer = function(_req, res, data) {
    let body = JSON.parse(data.toString("utf8"));
    if (body.id) {
        Manager.spawnServer(body.type, body.id);
        if (body.type == "production") Manager.restartCounters[body.id] = [];
        res.writeHead(200, http.STATUS_CODES[200]); 
        res.end("{}");
    } else {
        res.writeHead(404, http.STATUS_CODES[404]);
        res.end();
    }
};

Requests.stopServer = function(_req, res, data) {
    let body = JSON.parse(data.toString("utf8"));
    if (body.id) {
        Manager.stopServer(body.type, body.id).then(() => { 
            res.writeHead(200, http.STATUS_CODES[200]); 
            res.end("{}"); 
        });
    } else {
        res.writeHead(404, http.STATUS_CODES[404]);
        res.end();
    }
};

Requests.restartServer = function(_req, res, data) {
    let body = JSON.parse(data.toString("utf8"));
    if (body.id) {
        Manager.stopServer(body.type, body.id).then(() => { 
            setTimeout(() => {
                Manager.spawnServer(body.id);
                res.writeHead(200, http.STATUS_CODES[200]); 
                res.end(); 
            }, 750);
        });
    } else {
        res.writeHead(404, http.STATUS_CODES[404]);
        res.end();
    }
};

Requests.getLogs = function(_req, res, data) {
    let body = JSON.parse(data.toString("utf8"));
    if (body.id) {
        let logs = Manager.getLogfile(body.type, body.id);
        
        res.writeHead(200, http.STATUS_CODES[200]); 
        res.end(JSON.stringify(logs)); 
    } else {
        res.writeHead(404, http.STATUS_CODES[404]);
        res.end();
    }
}

Requests.listServers = function(_req, res, _data) {
    res.end(JSON.stringify(Manager.listServers()));
};

Requests.getServer = function(_req, res, data) {
    let body = JSON.parse(data.toString("utf8"));
    res.end(JSON.stringify(Manager.getServer(body.id)));
}

Requests.newServer = function(_req, res, data) {
    let body = JSON.parse(data.toString("utf8"));
    let resss = Manager.newServer(body);

    if (resss) {
        res.end(JSON.stringify(resss));
    } else {
        r403(res);
    }
}

Requests.updateServer = async function(req, res, data) {
    let body = JSON.parse(data.toString("utf8"));
    let resss = await Manager.updateServer(body);

    if (resss) {
        res.end(JSON.stringify(resss));
    } else {
        r403(res);
    }
};

Requests.listFiles = async function(req, res, data) {
    let body = JSON.parse(data.toString("utf8"));
    let resss = await Manager.listFiles(body.type, body.id, body.path);

    if (resss) {
        res.end(JSON.stringify(resss));
    } else {
        r403(res);
    }
};

Requests.uploadFile = async function(req, res, data) {
    let body = JSON.parse(data.toString("utf8"));
    let resss = await Manager.storeFile(body.type, body.id, body.path, body.dataBase64);

    if (resss) {
        res.end(JSON.stringify(resss));
    } else {
        r403(res);
    }
};

Requests.deleteFile = async function(req, res, data) {
    let body = JSON.parse(data.toString("utf8"));
    let resss = await Manager.removeFile(body.type, body.id, body.path);

    if (resss) {
        res.end(JSON.stringify(resss));
    } else {
        r403(res);
    }
};

Requests.runNPM = async function(req, res, data) {
    let body = JSON.parse(data.toString("utf8"));
    let resss = await Manager.runNPM(body.type, body.id, body.args);

    if (resss) {
        res.end(JSON.stringify(resss));
    } else {
        r403(res);
    }
};

Requests.runGit = async function(req, res, data) {
    let body = JSON.parse(data.toString("utf8"));
    let resss = await Manager.runGit(body.type, body.id, body.args);

    if (resss) {
        res.end(JSON.stringify(resss));
    } else {
        r403(res);
    }
};

Requests.selfLogs = function(_req, res, _data) {
    res.end(JSON.stringify(ownLogs));
}

let requestHandler = async function(req, res) {
    let parseIt = url.parse(req.url, true);

    let type = 400;
    let callback;

    if (req.method == "GET" && !parseIt.search) {
        type = "page";
        Requests.path(req, res);
    } else if (parseIt.query !== null && typeof parseIt.query == "object" && Object.keys(parseIt.query).length > 0) {
        // This is a server method
        let method = parseIt.query.method;
        type = method;

        if (req.method == "POST") {
            // Always use post for server functions
            if (criticalException) {
                if (method == "ownlogs") {
                    callback = Requests.selfLogs;
                } else {
                    type = 418;
                    callback = (_req, res, _data) => { res.end(JSON.stringify({ error: "ERR|CRT", message: "Main Process encountered a critical exception", logs: ownLogs })) };
                }
            } else {
                switch (method) {
                    case ("ownlogs"): callback = Requests.selfLogs; break;
                    case ("newserver"): callback = Requests.newServer; break;
                    case ("getserver"): callback = Requests.getServer; break;
                    case ("list"): callback = Requests.listServers; break;
                    case ("new"): callback = Requests.newServer; break;
                    case ("update"): callback = Requests.updateServer; break;
                    case ("listfiles"): callback = Requests.listFiles; break;
                    case ("uploadfile"): callback = Requests.uploadFile; break;
                    case ("deletefile"): callback = Requests.deleteFile; break;
                    case ("start"): callback = Requests.startServer; break;
                    case ("stop"): callback = Requests.stopServer; break;
                    case ("restart"): callback = Requests.restartServer; break;
                    case ("serverlog"): callback = Requests.getLogs; break;
                    case ("runnpm"): callback = Requests.runNPM; break;
                    case ("rungit"): callback = Requests.runGit; break;
                    case ("throwerror"): callback = (_req, res) => { res.end(); throw new Error("This is a test error.") }; break;
                    case ("runnpm"): callback = Requests.runNPM; break;
                    case ("user-create"): callback = Requests.Users.create; break;
                    case ("user-get"): callback = Requests.Users.get; break;
                    case ("user-list"): callback = Requests.Users.list; break;
                    case ("user-edit"): callback = Requests.Users.edit; break;
                    case ("user-delete"): callback = Requests.Users.delete; break;
                    case ("user-login"): callback = Requests.Users.login; break;
                    case ("user-logout"): callback = Requests.Users.logout; break;
                    case ("user-password-change"): callback = Requests.Users.changePassword; break;
                    case ("user-password-reset"): callback = Requests.Users.resetPassword; break;
                    case ("user-verify"): callback = Requests.Users.verify; break;
                    default: type = 400; 
                }
            }
        }
    }
    
    if (type == "page")  return;

    if (typeof type == "number") {
        res.writeHead(type, http.STATUS_CODES[type]);
        res.end();
        logerror(`app.js/requestHandler: Wrote error ${type} in response to ${req.url}`);
    } else {
        let buffer = Buffer.from([]);
        req.on("data", (chunk) => {
            buffer = Buffer.concat([buffer, chunk]);
        });
        req.on("end", (e) => {
            callback(req, res, buffer);
        });
    }
};

let serverboi = http.createServer(requestHandler);

let handleWSRequest = async function(cl, msg) {
    let { type, data } = msg;

    if (type == "hello") {
        remoteSend(cl, "hello", "hi");
    }
};

remoteServer = new ws.Server({server: serverboi});

remoteServer.on('connection', function (cl) {
    cl.on('message', function (msg) {
        handleWSRequest(cl, JSON.parse(msg));
    });
});

serverboi.listen({
    port: networkingPort
}, () => {logxtra("Listening on port " + networkingPort + " (http://localhost" + ((networkingPort == 80) ? "" : ":" + networkingPort) + ")")});

if (Object.keys(Manager.servers).length > 0) {
    Manager.autoStart();
}

process.on("uncaughtException", (err) => {
    ownLogs.push({ type: "err", data: err.name });
    ownLogs.push({ type: "err", data: err.message });
    criticalException = true;
    console.error(err);
});