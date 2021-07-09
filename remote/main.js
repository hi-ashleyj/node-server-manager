let Home = {};
Home.servers = {};
Home.files = {};
Home.self = {};
Home.script = {};

Home.servers.list = async function() {
    return new Promise(async (resolve, reject) => {
        try {
            let servers = JSON.parse(await Comms.post("list", {}));
            resolve(servers);
        } catch (err) {
            resolve(null);
        }
    });
};

Home.servers.get = async function(id) {
    return new Promise(async (resolve, reject) => {
        try {
            let servers = JSON.parse(await Comms.post("getserver", JSON.stringify({id: id})));
            resolve(servers);
        } catch (err) {
            resolve(null);
        }
    });
};

Home.servers.update = async function(payload) {
    return new Promise(async (resolve, reject) => {
        try {
            let servers = JSON.parse(await Comms.post("update", JSON.stringify(payload)));
            resolve(servers);
        } catch (err) {
            resolve(null);
        }
    });
};

Home.servers.new = async function(payload) {
    return new Promise(async (resolve, reject) => {
        try {
            let servers = JSON.parse(await Comms.post("new", JSON.stringify(payload)));
            resolve(servers);
        } catch (err) {
            resolve(null);
        }
    });
};

Home.servers.start = async function(type, id) {
    return new Promise(async (resolve, reject) => {
        try {
            await Comms.post("start", JSON.stringify({ type, id }));
            resolve(true);
        } catch (err) {
            resolve(false);
        }
    });
};

Home.servers.stop = async function(type, id) {
    return new Promise(async (resolve, reject) => {
        try {
            await Comms.post("stop", JSON.stringify({ type, id }));
            resolve(true);
        } catch (err) {
            resolve(false);
        }
    });
};

Home.servers.restart = async function(type, id) {
    return new Promise(async (resolve, reject) => {
        try {
            await Comms.post("restart", JSON.stringify({ type, id }));
            resolve(true);
        } catch (err) {
            resolve(false);
        }
    });
}

Home.servers.logs = async function(type, id) {
    return new Promise(async (resolve, reject) => {
        try {
            let logs = JSON.parse(await Comms.post("serverlog", JSON.stringify({ type, id })));
            resolve(logs);
        } catch (err) {
            resolve([]);
        }
    });
};

Home.script.npm = async function(type, id, args) {
    return new Promise(async (resolve, reject) => {
        try {
            let logs = JSON.parse(await Comms.post("runnpm", JSON.stringify({ type, id, args: args })));
            resolve(logs);
        } catch (err) {
            resolve([]);
        }
    });
};

Home.script.git = async function(type, id, args) {
    return new Promise(async (resolve, reject) => {
        try {
            let logs = JSON.parse(await Comms.post("runnpm", JSON.stringify({ type, id, args: args })));
            resolve(logs);
        } catch (err) {
            resolve([]);
        }
    });
};

Home.self.logs = async function() {
    return new Promise(async (resolve, reject) => {
        try {
            let logs = JSON.parse(await Comms.post("ownlogs", ""));
            resolve(logs);
        } catch (err) {
            resolve([]);
        }
    });
};

let UI = {};
UI.events = [];
UI.editing;
UI.Presets = {};
UI.edit = {};
UI.files = {};
UI.fileicons = ["folder","html", "js", "css", "jpg", "png", "svg", "ttf", "woff", "woff2", "json", "txt"];

UI.broken = false;

UI.breakIt = function() {
    document.body.attr("data-mode", "broken");
    find("button.button.self-logs-open").click();
};

Comms.on("broken", () => {
    UI.broken = true;
    UI.breakIt();
});

UI.on = function(type, call) {
    UI.events.push({type, call});
};

UI.fire = function(type, data) {
    for (var obj of UI.events) {
        if (obj.type == type) {
            obj.call((data) ? data : null);
        }
    }
}

UI.Components = {};

UI.Components.serverbox = function(type, id) {
    let box = document.createElement("div");
    box.className = "serverbox-root " + type;
    box.innerText = type[0].toUpperCase() + type.slice(1).toLowerCase();
    box.attr("data-type", type).attr("data-id", id);
    box.when("click", UI.manageHandler)
    return box;
};

UI.Components.serverLine = function(payload) {
    let root = document.createElement("div").attr("data-id", payload.id).chng("className", "server-line cont");
    
    let aliasEL = document.createElement("a").chng("className", "server-line id").chng("type", "text").chng("innerText", payload.id).chng("href", "/" + payload.alias).chng("target", "_blank").chng("rel", "nofollow");
    let portEL = document.createElement("div").chng("className", "server-line port").chng("type", "text").chng("innerText", payload.port);
    let testBox = UI.Components.serverbox("test", payload.id, payload.port);
    let productionBox = UI.Components.serverbox("production", payload.id);
    let editEL = document.createElement("button").chng("className", "button server-line edit").chng("innerText", "Edit").attr("data-id", payload.id);
    if (payload.running.test) {
        testBox.attr("data-running", true);
    }
    if (payload.running.production) {
        productionBox.attr("data-running", true);
    }
    editEL.when("click", () => {UI.showEdit(payload.id)});

    root.append(aliasEL, portEL, testBox, productionBox, editEL);

    find("div.configcanvas").append(root);
};

UI.Components.logline = function(container, line) {
    let root = document.createElement("div").chng("innerText", line.data);
    
    if (line.type == "log") {
        root.chng("className", "logs-line rooter info");
    } else if (line.type == "err") {
        root.chng("className", "logs-line rooter error");
    }

    container.append(root);
};

UI.showCreate = async function() {
    try {
        UI.editing = {};
        find("input.editor.id").chng("value", "").chng("disabled", false);
        find("input.editor.port").chng("value", "");
        find("input.editor.runonboot").chng("checked", false);
        find("input.editor.runfile").chng("value", "");
        find("input.editor.gitrepo").chng("value", "");
        
        find("div.splash.server-editor").attr("data-mode", "create").attr("data-active", true);
    } catch (err) {
        console.error(err);
    }
};

find("button.big-create-button").when("click", UI.showCreate);

UI.showEdit = async function(id) {
    try {
        let info = await Home.servers.get(id);
        UI.editing = info;
    
        find("input.editor.id").chng("value", info.id).chng("disabled", true);
        find("input.editor.port").chng("value", info.port);
        find("input.editor.runonboot").chng("checked", !(!(info.runonboot)));
        find("input.editor.runfile").chng("value", info.runfile);
        find("input.editor.gitrepo").chng("value", info.giturl);
        
        find("div.splash.server-editor").attr("data-mode", "edit").attr("data-active", true);
    } catch (err) {
        console.error(err);
    }
};

UI.showConfig = async function() {
    try {
        let ssvvrr = await Home.servers.list();
        find("div.configcanvas").innerHTML = "";
        for (let i in ssvvrr) {
            UI.Components.serverLine(ssvvrr[i]);
        }
        document.body.attr("data-mode", "config");
    } catch (err) {
        console.err(err);
    }
};

UI.edit.updateInfo = async function (payload) {
    try {
        let sevn = await Home.servers.update(payload);

        find("div.splash.server-editor").rmtr("data-active");
        UI.showConfig();
    } catch (err) { console.log(err); }
};

UI.edit.createServer = async function(payload) {
    try {
        let sevn = await Home.servers.new(payload);
    
        console.log(sevn);

        find("input.editor.id").value = "";
        find("input.editor.port").value = "";
        find("input.editor.runonboot").checked = false;
        find("input.editor.runfile").value = "";
        find("input.editor.gitrepo").value = "";

        find("div.splash.server-editor").rmtr("data-active");
        UI.showConfig()
    } catch (err) { console.log(err); }
};

UI.edit.read = function() {
    let mode = find("div.splash.server-editor").getr("data-mode")
    let id = find("input.editor.id").value;
    let port = parseInt(find("input.editor.port").value);
    let runonboot = find("input.editor.runonboot").checked;
    let runfile = find("input.editor.runfile").value;
    let giturl = find("input.editor.gitrepo").value;
    let work = { id, port, runonboot, runfile, giturl };

    if (mode == "create") {
        UI.edit.createServer(work);
    } else if (mode == "edit" && find("div.splash.server-editor").getr("data-id") == id) {
        UI.edit.updateInfo(work);
    }
    
};

find("button.button.action.confirm-edit").when("click", UI.edit.read);

UI.showManage = async function(type, id) {
    try {
        let container = find("div.logs-canvas");
        let list = await Home.servers.logs(type, id);

        container.innerHTML = "";
        for (let i in list) {
            UI.Components.logline(container, list[i]);
        }

        document.body.attr("data-mode", "manage");
    } catch (err) {
        console.err(err);
    }
};

UI.manageHandler = function(e) {
    let type = e.target.getr("data-type");
    let id = e.target.getr("data-id");
    UI.showManage(type, id);
}

UI.runScript = async function(type, id, command) {
    try {
        if (find("div.runtime-logs").getr("data-thinking")) return;

        let spleet = command.split(" ");
        if (!Home.script[spleet[0]]) return;

        let container = find("div.runtime-logs");
        find("input.logger.runtime.console").value = "";
        container.innerHTML = "";

        find("div.runtime-logs").attr("data-thinking", true);

        let body = await Home.script[spleet[0]](type, id, spleet.slice(1));

        find("div.runtime-logs").rmtr("data-thinking");

        let list = body.logs;
        console.log(list);
        for (let i in list) {
            UI.Components.logline(container, list[i]);
        }

    } catch (err) {
        console.err(err);
    }
};

find("button.button.editor.start").when("click", () => { Home.servers.start(UI.editing.id) });
find("button.button.editor.stop").when("click", () => { Home.servers.stop(UI.editing.id) });
find("button.button.editor.restart").when("click", () => { Home.servers.restart(UI.editing.id) });

find("div.splash").when("click", (e) => {
    if (e.target.classList.contains("splash")) {
        e.target.rmtr("data-active");
    }
});

find("button.button.self-logs-open").when("click", async () => {
    try {
        let container = find("div.logs-canvas-self");
        let list = await Home.self.logs();
        container.innerHTML = "";
        for (let i in list) {
            UI.Components.logline(container, list[i]);
        }
        find("div.splash.self-log").attr("data-active", true);
    } catch (err) {
        console.err(err);
    }
});

// Socket based refreshes
Socket.on("start", (data) => {
    let mode = document.body.getr("data-mode");
    if (mode == "config") {
        UI.showConfig();
    } else if (mode == "edit") {
        if (UI.editing.id == data.target) {
            UI.showEdit(UI.editing.id);
        }
    }
});

Socket.on("stop", (data) => {
    let mode = document.body.getr("data-mode");
    if (mode == "config") {
        UI.showConfig();
    } else if (mode == "edit") {
        if (UI.editing.id == data.target) {
            UI.showEdit(UI.editing.id);
        }
    }
});

Socket.on("log", (data) => {
    let mode = document.body.getr("data-mode");
    if (mode == "logs") {
        if (UI.editing.id == data.target) {
            UI.Components.logline(find("div.logs-canvas"), data.message);
        }
    }
});

UI.showConfig();