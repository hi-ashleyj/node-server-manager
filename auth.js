let fsSync = require("fs");
let fs = fsSync.promises;
let path = require("path");
let { sha256 } = require("./remote/lib/sha256.js");

let hugeNumber = function() {
    return (Math.random() + "").split(".")[1];
};

let Auth = {};
Auth.storeLocation;
Auth.store = {};
Auth.tokens = {};

Auth.saveScheduled = false;
Auth.actuallySave = async function() {
    await fs.writeFile(path.resolve(Auth.storeLocation, "users.json"), JSON.stringify(Auth.store), { encoding: "utf-8" });
    Auth.saveScheduled = false;
};

Auth.save = function() {
    if (!Auth.saveScheduled) {
        Auth.saveScheduled = true;
        setTimeout(Auth.actuallySave, 1000);
    }
};

Auth.getTokenFromHeaders = function(headers) {
    if (!headers.authorization) return false;
    let spleet = headers.authorization.split(" ");
    if (spleet[0].toLowerCase() != "token") return false;
    return spleet[1];
};

Auth.verify = function(token) {
    if (!Auth.tokens[token]) return false;
    let nowish = (new Date()).valueOf();
    
    if (Auth.tokens[token].expiry < nowish) {
        Auth.tokens[token] = undefined;
        delete Auth.tokens[token];
        return false;
    }

    Auth.tokens[token].expiry = nowish + (1000 * 60 * 60);
    return Auth.tokens[token].username;
};

Auth.verifyHeaders = function(headers, accessNeeded) {
    return Auth.verify(Auth.getTokenFromHeaders(headers), accessNeeded);
};

Auth.checkAccess = function(token, accessNeeded) {
    let username = Auth.verify(token);
    if (!username) return false;
    if (!Auth.store[username]) return false;
    return (Auth.store[username].access >= accessNeeded);
};

Auth.checkHeaders = function(headers, accessNeeded) {
    return Auth.checkAccess(Auth.getTokenFromHeaders(headers), accessNeeded);
};

Auth.issueToken = function(username) {
    let token = sha256(hugeNumber() + hugeNumber() + hugeNumber());
    let nowish = (new Date()).valueOf();
    let expiry = nowish + (1000 * 60 * 60);
    Auth.tokens[token] = {
        username,
        expiry
    }

    return token;
};

Auth.revokeToken = function(token) {
    if (Auth.tokens[token]) {
        Auth.tokens[token] = undefined;
        delete Auth.tokens[token];
    }
};

Auth.revokeAllTokens = function(username) {
    let list = Object.keys(Auth.tokens).filter((tkn) => { return Auth.tokens[tkn].username == username });

    for (let token of list) {
        Auth.revokeToken[token];
    }
};

Auth.revokeExpiredTokens = function() {
    let nowish = (new Date()).valueOf();
    for (let token in Auth.tokens) {
        if (Auth.tokens[token].expiry < nowish) {
            Auth.tokens[token] = undefined;
            delete Auth.tokens[token];
        }
    }
};

Auth.purgeTokens = function() {
    Auth.tokens = {};
};

Auth.login = function(username, password) {
    if (!Auth.store[username]) return { error: "Couldn't find that user" };
    let salty = sha256(sha256(password) + Auth.store[username].salt);
    if (Auth.store[username].hash != salty) return { error: "Incorrect Password" };
    Auth.revokeExpiredTokens();

    return { token: Auth.issueToken(username) };
};

Auth.logout = function(token) {
    Auth.revokeToken(token);
    Auth.revokeExpiredTokens();
    return true;    
};

Auth.create = function(username, access) {
    if (Auth.store[username]) return "Username already exists";
    let salt = sha256(hugeNumber() + hugeNumber() + hugeNumber());
    let uobj = {
        username,
        access,
        salt,
        hash: sha256(sha256(sha256("password")) + salt)
    }

    Auth.store[username] = uobj;
    Auth.save();
    return null;
};

Auth.changePassword = function(username, old_password, new_password, repeat_password) {
    if (!Auth.store[username]) return "User does not exist";
    if (new_password !== repeat_password) return "Passwords do not match";
    let user = Auth.store[username];
    if (sha256(sha256(old_password) + user.salt) != user.hash) return "Incorrect Password";

    Auth.store[username].salt = sha256(hugeNumber() + hugeNumber() + hugeNumber());
    Auth.store[username].hash = sha256(sha256(new_password) + Auth.store[username].salt);

    Auth.revokeAllTokens(username);
    Auth.save();

    return null;
};

Auth.resetPassword = function(username) {
    if (!Auth.store[username]) return "User does not exist";

    Auth.store[username].salt = sha256(hugeNumber() + hugeNumber() + hugeNumber());
    Auth.store[username].hash = sha256(sha256(sha256("password")) + Auth.store[username].salt);

    Auth.revokeAllTokens(username);
    Auth.save();
    
    return null;
};

Auth.edit = function(username, access) {
    if (!Auth.store[username]) return "User does not exist";
    
    Auth.store[username].access = access;
    Auth.save();
    return null;
};

Auth.delete = function(username) {
    // TODO - ENSURE AT LEAST ONE ADMIN ACCOUNT EXISTS
    Auth.store[username] = undefined;
    delete Auth.store[username];
    Auth.save();
    return null;
};

Auth.get = function(uname) {
    if (!Auth.store[uname]) return {};
    
    let { username, access } = Auth.store[uname];

    return { username, access };
};

Auth.list = function() {
    let answer = {};

    for (let i in Auth.store) {
        let { username, access } = Auth.store[i];
        answer[i] = { username, access }
    }

    return answer;
};

Auth.load = function() {
    if (fsSync.existsSync(path.resolve(Auth.storeLocation, "users.json"))) {
        try {
            Auth.store = JSON.parse(fsSync.readFileSync(path.resolve(Auth.storeLocation, "users.json"), { encoding: "utf-8" }));
        } catch (_err) {}
    } else {
        Auth.create("admin", 20);
        Auth.changePassword("admin", sha256("password"), sha256("administrator"), sha256("administrator"));
        Auth.save();
    }
};


module.exports = function(loc) {
    Auth.storeLocation = loc;
    Auth.load();

    return Auth;
};