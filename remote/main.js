let Users = {};
Users.cache = null;

Users.setUserState = function(permissionLevel) {
    document.body.rmtr("data-perm-manage").rmtr("data-perm-configure", true).rmtr("data-perm-admin", true);
    if (typeof permissionLevel != "number") return;

    if (permissionLevel >= 0) document.body.attr("data-perm-manage", true);
    if (permissionLevel >= 10) document.body.attr("data-perm-configure", true);
    if (permissionLevel >= 20) document.body.attr("data-perm-admin", true);
};

let Home = {};
Home.servers = {};
Home.files = {};
Home.self = {};
Home.script = {};
Home.users = {};

Home.servers.list = function() {
    return new Promise(async (resolve, reject) => {
        try {
            let servers = JSON.parse(await Comms.post("list", {}));
            resolve(servers);
        } catch (err) {
            resolve(null);
        }
    });
};

Home.servers.get = function(id) {
    return new Promise(async (resolve, reject) => {
        try {
            let servers = JSON.parse(await Comms.post("getserver", JSON.stringify({id: id})));
            resolve(servers);
        } catch (err) {
            resolve(null);
        }
    });
};

Home.servers.update = function(payload) {
    return new Promise(async (resolve, reject) => {
        try {
            let servers = JSON.parse(await Comms.post("update", JSON.stringify(payload)));
            resolve(servers);
        } catch (err) {
            resolve(null);
        }
    });
};

Home.servers.new = function(payload) {
    return new Promise(async (resolve, reject) => {
        try {
            let servers = JSON.parse(await Comms.post("new", JSON.stringify(payload)));
            resolve(servers);
        } catch (err) {
            resolve(null);
        }
    });
};

Home.servers.start = function(type, id) {
    return new Promise(async (resolve, reject) => {
        try {
            await Comms.post("start", JSON.stringify({ type, id }));
            resolve(true);
        } catch (err) {
            resolve(false);
        }
    });
};

Home.servers.stop = function(type, id) {
    return new Promise(async (resolve, reject) => {
        try {
            await Comms.post("stop", JSON.stringify({ type, id }));
            resolve(true);
        } catch (err) {
            resolve(false);
        }
    });
};

Home.servers.restart = function(type, id) {
    return new Promise(async (resolve, reject) => {
        try {
            await Comms.post("restart", JSON.stringify({ type, id }));
            resolve(true);
        } catch (err) {
            resolve(false);
        }
    });
}

Home.servers.logs = function(type, id) {
    return new Promise(async (resolve, reject) => {
        try {
            let logs = JSON.parse(await Comms.post("serverlog", JSON.stringify({ type, id })));
            resolve(logs);
        } catch (err) {
            resolve([]);
        }
    });
};

Home.script.npm = function(type, id, args) {
    return new Promise(async (resolve, reject) => {
        try {
            let logs = JSON.parse(await Comms.post("runnpm", JSON.stringify({ type, id, args: args })));
            resolve(logs);
        } catch (err) {
            resolve([]);
        }
    });
};

Home.script.git = function(type, id, args) {
    return new Promise(async (resolve, reject) => {
        try {
            let logs = JSON.parse(await Comms.post("rungit", JSON.stringify({ type, id, args: args })));
            resolve(logs);
        } catch (err) {
            resolve([]);
        }
    });
};

Home.self.logs = function() {
    return new Promise(async (resolve, reject) => {
        try {
            let logs = JSON.parse(await Comms.post("ownlogs", ""));
            resolve(logs);
        } catch (err) {
            resolve([]);
        }
    });
};

Home.users.login = function(username, password) {
    return new Promise(async (resolve, reject) => {
        try {
            let result = JSON.parse(await Comms.post("user-login", JSON.stringify({ username, password: window.sha256(password) })));
            resolve(result);
        } catch (err) {
            resolve({});
        }
    });
};

Home.users.logout = function() {
    return new Promise(async (resolve, reject) => {
        try {
            let result = JSON.parse(await Comms.post("user-logout", ""));
            resolve(result);
        } catch (err) {
            resolve({});
        }
    });
};

Home.users.verify = function() {
    return new Promise(async (resolve, reject) => {
        try {
            let result = JSON.parse(await Comms.post("user-verify", ""));
            resolve(result);
        } catch (err) {
            resolve({});
        }
    });
};

Home.users.create = function(username, access) {
    return new Promise(async (resolve, reject) => {
        try {
            let result = JSON.parse(await Comms.post("user-create", JSON.stringify({ username, access })));
            resolve(result);
        } catch (err) {
            resolve({});
        }
    });
};

Home.users.changePassword = function(old_password, new_password, repeat_password) {
    return new Promise(async (resolve, reject) => {
        try {
            let result = JSON.parse(await Comms.post("user-password-change", JSON.stringify({ 
                old_password: window.sha256(old_password),
                new_password: window.sha256(new_password),
                repeat_password: window.sha256(repeat_password),                 
            })));
            resolve(result);
        } catch (err) {
            resolve({});
        }
    });

};

Home.users.resetPassword = function(username) {
    return new Promise(async (resolve, reject) => {
        try {
            let result = JSON.parse(await Comms.post("user-password-reset", JSON.stringify({ username })));
            resolve(result);
        } catch (err) {
            resolve({});
        }
    });
};

Home.users.edit = function(username, access) {
    return new Promise(async (resolve, reject) => {
        try {
            let result = JSON.parse(await Comms.post("user-edit", JSON.stringify({ username, access })));
            resolve(result);
        } catch (err) {
            resolve({});
        }
    });
};

Home.users.delete = function() {
    return new Promise(async (resolve, reject) => { resolve() });
};


Home.users.get = async function(username) {
    return new Promise(async (resolve, reject) => {
        try {
            let result = JSON.parse(await Comms.post("user-get", JSON.stringify({ username })));
            resolve(result);
        } catch (err) {
            resolve({});
        }
    });
};

Home.users.list = async function() {
    return new Promise(async (resolve, reject) => {
        try {
            let result = JSON.parse(await Comms.post("user-list", ""));
            resolve(result);
        } catch (err) {
            resolve({});
        }
    });
};

Users.handle403 = async function() {
    if (Users.cache) {
        let { username } = await Home.users.verify();
        if (username) {
            find("div.splash.insufficient-perms").attr("data-active", true);
            return;
        }
    } 

    Users.setUserState();
    find("div.splash.users").attr("data-active", true).attr("data-page", "login");
    window.localStorage.removeItem("nsm-login-token");
};

Comms.error403 = Users.handle403;

Users.autopopulate = function(selectEL, access) {
    let data = { 
        1: "Manage",
        10: "Configure",
        20: "Admin"
    }

    for (let i in data) {
        let option = document.createElement("option").chng("innerText", data[i]).attr("data-access-level", i);
        if (access == i) option.chng("selected", true);
        selectEL.append(option);
    }

    return selectEL;
};

Users.userLine = function(username, access) {
    let root = document.createElement("div").chng("className", "users-manage-line-root").attr("data-username", username);

    let usernameEL = document.createElement("div").chng("className", "users-manage-chunk-username").chng("innerText", username);
    let accessSELECT = Users.autopopulate(document.createElement("select").chng("className", "select action users-manage-chunk-access"), access);
    let resetButton = document.createElement("button").chng("className", "button action users-manage-chunk-reset-password").attr("data-username", username);
    let deleteButton = document.createElement("button").chng("className", "button action users-manage-chunk-delete-account").attr("data-username", username);

    root.append(usernameEL, accessSELECT, resetButton, deleteButton);
    return root;
};

Users.populateUsersCanvas = function(list) {
    let canvas = find("div.users-canvas")
    canvas.innerHTML = "";

    for (let i in list) {
        let { username, access } = list[i];
        canvas.append(Users.userLine(username, access));
    }
};

Users.showManage = async function() {
    let list = await Home.users.list();
    if (list && Object.keys(list).length > 0) {
        Users.populateUsersCanvas(list);

        find("div.splash.users").attr("data-page", "management");
    }
};

Users.testAccess = function(permsLevel) {
    if (Users.cache) {
        if (Users.cache.access && typeof Users.cache.access == "number") {
            if (Users.cache.access >= permsLevel) {
                return true;
            }
            find("div.splash.insufficient-perms").attr("data-active", true);
            return false;
        }
    }

    find("div.splash.users").attr("data-active", true).attr("data-page", "login");

    return false;
};

Users.logoutSuccess = async function() {
    Users.cache = null;
    window.localStorage.removeItem("nsm-login-token");
    Users.setUserState();
    
    find("div.splash.users .users-page.login input.input.action").chng("value", "");
    find("div.splash.users").attr("data-page", "login");
};

Users.loginSuccess = async function(token) {
    Users.cache = await Home.users.get("@");
    Users.setUserState(Users.cache.access);
    window.localStorage.setItem("nsm-login-token", token);

    find("div.user-details-username").chng("innerText", "User: " + Users.cache.username);
    let accessLevelText = "Manage";
    if (Users.cache.access >= 10) accessLevelText = "Configure";
    if (Users.cache.access >= 20) accessLevelText = "Admin";
    find("span.user-details-access").chng("innerText", accessLevelText);

    find("div.splash.users").attr("data-page", "basic");
};

Users.handleStartup = async function() {
    let token = window.localStorage.getItem("nsm-login-token");
    if (token) {
        Comms.token = token;
        let { username } = await Home.users.verify();

        if (username) {
            Users.loginSuccess(token);
        } else {
            Comms.token = null;
            Users.setUserState();
        }
    }
};

Users.handleStartup();

let Auth = {};

Auth.login = async function() {
    document.activeElement.blur();
    find("div.user-login-error").chng("innerText", "");
    let username = find("input.input.action.users-login-username").value;
    let password = find("input.input.action.users-login-password").value;
    let { error, token } = await Home.users.login(username, password);

    if (error) {
        find("div.user-login-error").chng("innerText", error);
    } else {
        Comms.token = token;
        Users.loginSuccess(token);
    }
};

Auth.logout = async function() {
    document.activeElement.blur();
    let result = await Home.users.logout();

    Users.logoutSuccess();
};

Auth.changePassword = async function() {
    document.activeElement.blur();

    find("div.user-password-error").chng("innerText", "");
    let old_password = find("input.input.action.users-change-password-old").value;
    let new_password = find("input.input.action.users-change-password-new").value;
    let repeat_password = find("input.input.action.users-change-password-repeat").value;
    let { error } = await Home.users.changePassword(old_password, new_password, repeat_password);

    if (error) {
        find("div.user-password-error").chng("innerText", error);
    } else {
        Users.logoutSuccess();
        find("div.user-login-error").chng("innerText", "Your password has been changed. Please log in again.");
    }
};

Auth.show = function(page) {
    find("div.splash.users").attr("data-active", true);
    if (page) find("div.splash.users").attr("data-page", page);
    if (find("div.splash.users").getr("data-page", page) == "login") find("input.input.action.users-login-username").focus();
    find("div.splash.users .users-page.login input.input.action").chng("value", "");
};

find("button.button.user-manage-open").when("click", () => {
    Auth.show();
});

find("input.input.action.users-login-password").when("keydown", (e) => {
    if (e.key.toLowerCase() == "enter") find("button.button.action.user-login-go").click();
});

find("button.button.action.user-login-go").when("click", Auth.login);
find("button.button.action.user-logout-go").when("click", Auth.logout);

find("button.button.action.user-password-page-go").when("click", () => {
    find("div.splash.users .users-page.password input.input.action").chng("value", "");
    find("div.splash.users").attr("data-page", "password");
});

find("button.button.action.user-management-show").when("click", () => {
    if (!Users.testAccess(20)) { return; }
    Users.showManage();
});

find("button.button.action.user-change-password-cancel").when("click", () => {
    find("div.splash.users").attr("data-page", "basic");
});

find("button.button.action.user-management-cancel").when("click", () => {
    find("div.splash.users").attr("data-page", "basic");
});

find("button.button.action.user-change-password-go").when("click", Auth.changePassword);

let UI = {};
UI.events = [];
UI.editing;
UI.managing = { id: null, type: null }
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
    editEL.when("click", () => {
        if (!Users.testAccess(10)) return;
        UI.showEdit(payload.id);
    });

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
    if (!Users.testAccess(10)) { return; }
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

find("button.button.action.manager.return").when("click", UI.showConfig);

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
    if (!Users.testAccess(10)) { return; }
    let mode = find("div.splash.server-editor").getr("data-mode")
    let id = find("input.editor.id").value;
    let port = parseInt(find("input.editor.port").value);
    let runonboot = find("input.editor.runonboot").checked;
    let runfile = find("input.editor.runfile").value;
    let giturl = find("input.editor.gitrepo").value;
    let work = { id, port, runonboot, runfile, giturl };

    if (mode == "create") {
        UI.edit.createServer(work);
    } else if (mode == "edit") {
        UI.edit.updateInfo(work);
    }
    
};

find("button.button.action.confirm-edit").when("click", UI.edit.read);

UI.showManage = async function(type, id) {
    try {
        let goals = await Home.servers.get(id);

        find(".manage-telegraph-type").chng("innerText", type);
        find(".manage-telegraph-id").chng("innerText", id);
        find("a.manage-telegraph-id").chng("href", "http://" + window.location.hostname + ":" + ((type == "test") ? 30000 + goals.port : goals.port));

        if (goals.running[type]) {
            find("div.manage").attr("data-running", true);
        } else {
            find("div.manage").rmtr("data-running");
        }

        let container = find("div.logs-canvas");
        let list = await Home.servers.logs(type, id);

        UI.managing.id = id;
        UI.managing.type = type;
        UI.editing = goals;

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

UI.script = {};

UI.script.npmCIProduction = function() {
    let { type, id } = UI.managing;
    UI.runScript(type, id, "npm ci --production --no-optional");
};

UI.script.gitPull = function() {
    let { type, id } = UI.managing;
    UI.runScript(type, id, "git pull");
};

UI.script.gitClone = function() {
    let { type, id } = UI.managing;
    let repo = UI.editing.giturl;
    UI.runScript(type, id, `git clone ${repo} ${id}`);
};

find("button.button.editor.start").when("click", () => { if (!Users.testAccess(1)) { return; } Home.servers.start(UI.managing.type, UI.managing.id) });
find("button.button.editor.stop").when("click", () => { if (!Users.testAccess(1)) { return; } Home.servers.stop(UI.managing.type, UI.managing.id) });
find("button.button.editor.restart").when("click", () => { if (!Users.testAccess(1)) { return; } Home.servers.restart(UI.managing.type, UI.managing.id) });

find("button.button.action.logger.runtime.npm-ci-production").when("click", () => { if (!Users.testAccess(10)) { return; } UI.script.npmCIProduction() });
find("button.button.action.logger.runtime.git-pull").when("click", () => { if (!Users.testAccess(10)) { return; } UI.script.gitPull() });
find("button.button.action.logger.runtime.git-clone").when("click", () => { if (!Users.testAccess(10)) { return; } UI.script.gitClone() });

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
    console.log(data);
    let mode = document.body.getr("data-mode");
    if (mode == "config") {
        UI.showConfig();
    } else if (mode == "manage") {
        if (UI.managing.id == data.target && UI.managing.type == data.space) {
            UI.showManage(UI.managing.type, UI.managing.id);
        }
    }
});

Socket.on("stop", (data) => {
    console.log(data);
    let mode = document.body.getr("data-mode");
    if (mode == "config") {
        UI.showConfig();
    } else if (mode == "manage") {
        if (UI.managing.id == data.target && UI.managing.type == data.space) {
            UI.showManage(UI.managing.type, UI.managing.id);
        }
    }
});

Socket.on("log", (data) => {
    let mode = document.body.getr("data-mode");
    if (mode == "manage") {
        if (UI.managing.id == data.target && UI.managing.type == data.space) {
            UI.Components.logline(find("div.logs-canvas"), data.message);
        }
    }
});

UI.showConfig();