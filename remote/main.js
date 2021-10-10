let radioInputRepeat = function(el) {
    if (el.parentElement.tagName.toLowerCase() == "label") {
        if (el.checked) {
            el.parentElement.attr("data-checked", true);
        } else {
            el.parentElement.rmtr("data-checked");
        }
    }
};

let radioInputHandler = function(e) {
    let name = e.target.name;
    let targets = document.querySelectorAll(`input[type="radio"][name="${name}"]`);
    for (let i = 0; i < targets.length; i ++) {
        radioInputRepeat(targets[i]);
    }
};

find("div.radio-lines-styles input[type=\"radio\"]").when("change", radioInputHandler).when("input", radioInputHandler);
let getRadio = function(name) {
    let matchingRadios = document.querySelectorAll(`input[type="radio"][name="${name}"]`);
    let value = null;
    for (let i = 0; i < matchingRadios.length; i++) {
        if (matchingRadios[i].checked) {
            value = matchingRadios[i].value;
            break;
        }
    }
    return value;
};

let setRadio = function(name, value) {
    let matchingRadios = document.querySelectorAll(`input[type="radio"][name="${name}"]`);
    for (let i = 0; i < matchingRadios.length; i++) {
        if (matchingRadios[i].value == value) {
            matchingRadios[i].checked = true;
        }
    }
    for (let i = 0; i < matchingRadios.length; i++) { matchingRadios[i].dispatchEvent(new InputEvent("change"))}
};

let Auth = {};
let Users = {};
Users.cache = null;
Users.PERMISSION_LEVELS = { 
    1: "Manage",
    10: "Configure",
    20: "Admin"
}

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

Home.users.delete = function(username) {
    return new Promise(async (resolve, reject) => { 
        try {
            let result = JSON.parse(await Comms.post("user-delete", JSON.stringify({ username })));
            resolve(result);
        } catch (err) {
            resolve({});
        }
    });
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
    for (let i in Users.PERMISSION_LEVELS) {
        let option = document.createElement("option").chng("innerText", Users.PERMISSION_LEVELS[i]).attr("data-access-level", i);
        if (access == i) option.chng("selected", true);
        selectEL.append(option);
    }

    return selectEL;
};

Users.userLine = function(username, access, isOnlyAdmin) {
    let root = document.createElement("div").chng("className", "users-manage-line-root").attr("data-username", username);

    let usernameEL = document.createElement("div").chng("className", "users-manage-chunk-username").chng("innerText", username);
    // let accessTelegraphEL = document.createElement("div").chng("className", "users-manage-chunk-access-show").chng("innerText", Users.PERMISSION_LEVELS[access]);
    let editAccessBUTTON = document.createElement("button").chng("className", "button action users-manage-chunk-access-edit").attr("data-username", username);
    let resetBUTTON = document.createElement("button").chng("className", "button action users-manage-chunk-reset-password").attr("data-username", username);
    let deleteBUTTON = document.createElement("button").chng("className", "button action users-manage-chunk-delete-account").attr("data-username", username);

    editAccessBUTTON.when("click", () => {
        Auth.editAccess(username, access);
    });

    resetBUTTON.when("click", () => {
        Auth.resetPassword(username);
    });

    deleteBUTTON.when("click", () => {
        Auth.deleteAccount(username);
    });

    if (isOnlyAdmin) editAccessBUTTON.disabled = true;
    if (isOnlyAdmin) deleteBUTTON.disabled = true;

    root.append(usernameEL, editAccessBUTTON, resetBUTTON, deleteBUTTON);
    return root;
};

Users.userGroup = function(access) {
    let root = document.createElement("div").chng("className", "users-manage-group-root").attr("data-access", access).attr("data-pretty-access", Users.PERMISSION_LEVELS[access]);

    return root;
};

Users.populateUsersCanvas = function(list) {
    let canvas = find("div.users-canvas")
    canvas.innerHTML = "";

    let keys = Object.keys(list);
    keys.sort();

    let copy = Object.assign({}, Users.PERMISSION_LEVELS);
    let show = Object.assign({}, Users.PERMISSION_LEVELS);
    for (let i in show) show[i] = false;
    let permLevels = Object.keys(copy).map((val) => { return (typeof val == "number") ? val : parseInt(val) });
    permLevels.sort((a, b) => { return b - a; });

    for (let i in copy) {
        copy[i] = Users.userGroup(i);
    }

    let isOnlyAdmin = (keys.filter((val) => { return list[val].access == 20; }).length) <= 1;

    for (let i = 0; i < keys.length; i++) {
        let { username, access } = list[keys[i]];
        if (copy[access]) copy[access].append(Users.userLine(username, access, (access == 20 && isOnlyAdmin)));
        if (typeof show[access] != "undefined") show[access] = true;
    }

    for (let i = 0; i < permLevels.length; i ++) {
        if (show[permLevels[i]]) canvas.append(copy[permLevels[i]]);
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

    if (find("input.input.action.users-login-password").value == "password") {
        find("div.splash.users").attr("data-page", "password");
    } else {
        find("div.splash.users").attr("data-page", "basic");
    }
    
    find("div.splash.users .users-page.login input.input.action").chng("value", "");
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

Auth.createAccountActually = async function() {
    if (!Users.testAccess(20)) return;
    let username = find("input.input.action.create-user-username").value;
    let access = getRadio("create-user-radio");
    if (typeof access == "string") access = parseInt(access);

    let { error } = await Home.users.create(username, access);

    if (error) {
        find("div.user-create-error").chng("innerText", error);
    } else {
        find("div.splash.create-user").rmtr("data-active");
        find("input.input.action.create-user-username").value = "";
        setRadio("create-user-radio", 1);
        Users.showManage();
    }
};

Auth.createAccount = function() {
    find("div.user-create-error").chng("innerText", "");
    find("div.splash.create-user").attr("data-active", true);
    find("input.input.action.create-user-username").value = "";
    setRadio("create-user-radio", 1);
};

find("button.button.action.confirm-create-user-yes").when("click", Auth.createAccountActually);
find("button.button.action.confirm-create-user-no").when("click", () => { find("div.splash.create-user").rmtr("data-active"); });
find("button.button.action.user-management-create").when("click", Auth.createAccount);
find("input.input.action.create-user-username").when("input", (e) => {
    if (e.target.value.split(" ").length > 1) {
        e.target.value = e.target.value.split(" ").join("-");
    }
});

Auth.editAccessActually = async function() {
    if (!Users.testAccess(20)) return;
    let username = find("div.splash.change-access").getr("data-username");
    let access = getRadio("change-access-level-radio");
    if (typeof access == "string") access = parseInt(access);
    let result = await Home.users.edit(username, access);
    console.log(result);
    find("div.splash.change-access").rmtr("data-active");
    Users.showManage();
};

Auth.editAccess = function(username, access) {
    find("div.splash.change-access").attr("data-active", true).attr("data-username", username);
    find("span.change-access-username").chng("innerText", username);
    setRadio("change-access-level-radio", access);
};

find("button.button.action.confirm-change-access-yes").when("click", Auth.editAccessActually);
find("button.button.action.confirm-change-access-no").when("click", () => { find("div.splash.change-access").rmtr("data-active"); });

Auth.deleteAccountActually = async function() {
    if (!Users.testAccess(20)) return;
    let username = find("div.splash.delete-account").getr("data-username");
    let result = await Home.users.delete(username);
    console.log(result);
    find("div.splash.delete-account").rmtr("data-active");
    Users.showManage();
};

Auth.deleteAccount = function(username) {
    find("div.splash.delete-account").attr("data-active", true).attr("data-username", username);
    find("span.delete-account-username").chng("innerText", username);
};

find("button.button.action.confirm-delete-account-yes").when("click", Auth.deleteAccountActually);
find("button.button.action.confirm-delete-account-no").when("click", () => { find("div.splash.delete-account").rmtr("data-active"); });

Auth.resetPasswordActually = async function() {
    if (!Users.testAccess(20)) return;
    let username = find("div.splash.reset-password").getr("data-username");
    let result = await Home.users.resetPassword(username);
    console.log(result);
    find("div.splash.reset-password").rmtr("data-active");
    Users.showManage();
};

Auth.resetPassword = function(username) {
    find("div.splash.reset-password").attr("data-active", true).attr("data-username", username);
    find("span.reset-password-username").chng("innerText", username);
};

find("button.button.action.confirm-reset-password-yes").when("click", Auth.resetPasswordActually);
find("button.button.action.confirm-reset-password-no").when("click", () => { find("div.splash.reset-password").rmtr("data-active"); });

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
    if (Users.cache) {
        Auth.show("basic");
    } else {
        Auth.show("login");
    }
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

let Telemetry = {};

Telemetry.get = function(endpoint) {
    return new Promise(async (resolve, reject) => {
        let request = new XMLHttpRequest();
        request.open("GET", endpoint);
        request.addEventListener("load", () => {
            if (request.status < 400) {
                resolve(request.responseText);
            } else {
                reject(request.status);
            }
        });
        request.addEventListener("error", () => {
            reject(request.status);
        });
        if (body) {
            request.send(body);
        } else {
            request.send();
        }
    });
};

Telemetry.zone = function(endpoint, name, areas, canvas) {
    let root = document.createElement("div").chng("className", "telemetry-rooter");

    let title = document.createElement("div").chng("className", "telemetry-title").chng("innerText", name.toUpperCase());
    let graph = document.createElement("canvas").chng("className", "telemetry-graph");
    graph.width = 1000;
    graph.height = 500;

    /**
     * @type {CanvasRenderingContext2D}
     */
    let ctx = graph.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, graph.width, graph.height);

    let total = document.createElement("div").chng("className", "telemetry-details-requests");
    let msaverage = document.createElement("div").chng("className", "telemetry-details-response");
    let failed = document.createElement("div").chng("className", "telemetry-details-failed");

    let key = document.createElement("div").chng("className", "telemetry-key");
    root.append(title, graph, total, msaverage, failed, key);

    canvas.append(root);

    let reqTotal = 0;
    let reqfail = 0;
    let mstotal = 0;

    let colours = {};
    for (let i = 0; i < areas.length; i++) {
        const area = areas[i]
        colours[area] = `hsl(${Math.floor(i * 360/ areas.length)}, 100%, 60%)`;

        let keyEntry = document.createElement("div").chng("className", "telemetry-key-entry").chng("innerText", areas[i]).styl("backgroundColor", colours[areas[i]]);
        key.append(keyEntry);

        Telemetry.get(endpoint + `?zone=${zone}&area=${area}`).then((val) => {
            sevn = JSON.parse(val);

            let plotdata = {};
            
            reqTotal += Object.keys(sevn.success).length + Object.keys(sevn.fail).length;
            reqfail += Object.keys(sevn.fail).length;
            let nowish = new Date();
            let vbef = nowish.valueOf() - (7 * 24 * 60 * 60 * 1000);

            for (let time in sevn.success) {
                let ddd = new Date(time);
                if (ddd.valueOf() < vbef) continue;
                let day = ddd.getDay();
                let hour = ddd.getHours();

                if (!plotdata[day]) { plotdata[day] = {} }
                if (!plotdata[day][hour]) plotdata[day][hour] = [];
                plotdata[day][hour].push(sevn.success[time]);

                mstotal += sevn.success[time];
            }

            for (let time in sevn.fail) {
                let ddd = new Date(time);
                if (ddd.valueOf() < vbef) continue;
                let day = ddd.getDay();
                let hour = ddd.getHours();

                if (!plotdata[day]) { plotdata[day] = {} }
                if (!plotdata[day][hour]) plotdata[day][hour] = [];
                plotdata[day][hour].push(sevn.fail[time]);

                mstotal += sevn.fail[time];
            }
            
            let day = nowish.getDay();
            let hour = nowish.getHours();

            ctx.strokeStyle = colours[area];
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, graph.height);

            let steps = 7 * 24;

            for (let i = 0; i < steps; i ++) {
                hour += 1;
                let next = hour != hour % 24;
                if (next) day += 1;
                hour %= 24;
                day %= 7;

                let xPos = Math.floor(i * graph.width / steps); 
                let avg = (plotdata[day] && plotdata[day][hour]) ? plotdata[day][hour].reduce((prev, cur) => prev + cur) / plotdata[day][hour].length : 0;
                let yPos = Math.floor(graph.height - (avg * graph.height / 150));
                
                ctx.lineTo(xPos, yPos);
            }

            ctx.stroke();
            total.innerText = reqTotal;
            failed.innerText = reqfail;
            msaverage.innerText = Math.floor(mstotal * 100 / reqTotal) / 100;
        });
    }
};

Telemetry.display = function(base) {
    let endpoint = base + "/api/telemetry";
    let canvas = find("div.telemetry-canvas").chng("innerHTML", "").styl("display", "none");
    
    // FETCH ZONES
    Telemetry.get(endpoint).then((val) => {
        let zones = JSON.parse(val);

        for (let zone in zones) {
            Telemetry.zone(endpoint, zone, zones[zone], canvas);
        }
    });
};



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
            Telemetry.display("http://" + window.location.hostname + ":" + ((type == "test") ? 30000 + goals.port : goals.port));
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
    if (e.target.classList.contains("splash") && !UI.broken) {
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