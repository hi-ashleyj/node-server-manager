let fsSync = require("fs");
let fs = fsSync.promises;
let path = require("path");

let Auth = {};
Auth.storeLocation;
Auth.store = {};

Auth.load = function() {

};

Auth.save = function() {
    
};



module.exports = function(loc) {
    Auth.storeLocation = loc;
    Auth.load();

    return Auth;
};