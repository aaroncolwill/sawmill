/**
 *  Sawmill.js - 2018
 *  Simple synchronous logging to JSON
 *  @author Aaron Colwill
 *  @license MIT
 */

const fs            = require('fs');
const path          = require('path');

var sawmill         = function(){};
global.sawmill      = sawmill;

var _currentfile    = {};
var _filenames      = [];
var _filepaths      = {};
var _toconsole      = false;

/**
 *  Default formatter
 *  This is the default formatter which outputs each line 
 *  as valid JSON.
 *  
 *  @param {ISOString} timestamp timestamp for log
 *  @param {String} message message for log
 *  @param {String} type logging type
 */
var _formatter      = (timestamp, message, type) => {
    return `{ "time": "${timestamp}", "message": "${message}", "type": "${type}" }`;
};

/**
 *  Create a new logfile with the provided
 *  configuration.
 * 
 *  @param {String} config.name Log name
 *  @param {String} config.directory Where logs are saved
 *  @param {String} config.file Log file name
 *  @param {Boolean} config.toconsole Write to console (true/false)
 */
sawmill.createLog = function(config) {
    sawmill.extendString();
    if(config.extendObject)     sawmill.extendObject();
    if(config.toconsole)        _toconsole = config.toconsole;
    if(config.tags == null)     config.tags = ['*'];
    if(config.directory)        if (!fs.existsSync(config.directory)) fs.mkdirSync(config.directory);
    if(config.name) {
        if(config.directory == null) config.directory = "logs/";
        var filepath = path.join(config.directory, "/", config.name + ".log");
        _filenames.push(config.name);
        _filepaths[config.name] = {
            firstline: true,
            file: `${config.name}.log"`,
            path: filepath,
            tags: (config.tags != null) ? config.tags : "none"
        }
        _currentfile = _filepaths[config.name];
        fs.writeFileSync(_currentfile.path, sawmill.firstLineFormatter()); // write new file to disk
    }
    else console.log(`Name (${config.name}) invalid`);
    return this;
}

/**
 *  Create a default formatter 
 * 
 *  @param {String} line 
 */
sawmill.createFormatter = function(formatter) {
    _formatter = formatter;
}

/**
 *  Format the beginning of the first line
 *  in the log file 
 */
sawmill.firstLineFormatter = function() {
    return `[`;
}

/**
 *  Format the beginning of the next line 
 * 
 *  @param {String} line 
 */
sawmill.nextLineFormatter = function(line) {
    return `,\n${line}`;
}

/**
 *  Write the contents to the log
 * 
 *  @param {String} message message to log
 *  @param {String} type type of message
 */
sawmill.write = function(message, type) {
    var formatted_message = null;
    var clean_message = null;
    var type = (type != null) ? type : "message";

    clean_message = message.replace(/\"/g,'\\"');

    // write to disk
    if(_toconsole) console.log(`${clean_message}`);

    // write by tags
    _filenames.forEach(element => {
        _filepaths[element].tags.forEach(tag => {
            if(tag == "*" || tag == type) {
                if(_filepaths[element].firstline) 
                    formatted_message = _formatter(new Date().toISOString(), clean_message, type), _filepaths[element].firstline = false;
                else 
                    formatted_message = sawmill.nextLineFormatter(_formatter(new Date().toISOString(), clean_message, type));
                
                fs.appendFileSync(_filepaths[element].path, formatted_message);
            }
        });
    });
    return global.logger;
}

/**
 * Get logfile from disk
 * 
 * @param {String} name Name of log file 
 * @param {Function} result Callback result 
 */
sawmill.get = function(name, result) {
    _currentfile = _filepaths[name];
    if(_currentfile != null) {
        fs.readFile(_currentfile.path, (err, data) => {
            if(err) result(err, null);
            else result(null, `${data.toString('utf8')}]`);
        });
    }
}

/**
 *  Extend the String prototype with
 *  new sawmill functions
 */
sawmill.extendString = function() {
    String.prototype.log = function(type) {
        if(type != null)    sawmill.write(this, type);
        else                sawmill.write(this, "~");
    }
    String.prototype.info = function() {
        this.log("info");
    }
    String.prototype.warn = function() {
        this.log("warn");
    }
    String.prototype.debug = function() {
        this.log("debug");
    }
    String.prototype.error = function() {
        this.log("error");
    }
    String.prototype.critical = function() {
        this.log("critical");
    }
}

/**
 *  Extend the Object prototype with
 *  new sawmill functions
 */
sawmill.extendObject = function() {
    Object.prototype.info = function() {
        if(!this.hasOwnProperty("__core-js_shared__") 
        && !this.hasOwnProperty("_index")) JSON.stringify(this).log("info");
    }
    Object.prototype.warn = function() {
        if(!this.hasOwnProperty("__core-js_shared__") 
        && !this.hasOwnProperty("_index")) JSON.stringify(this).log("warn");
    }
    Object.prototype.debug = function() {
        if(!this.hasOwnProperty("__core-js_shared__") 
        && !this.hasOwnProperty("_index")) JSON.stringify(this).log("debug");
    }
    Object.prototype.error = function() {
        if(!this.hasOwnProperty("__core-js_shared__") 
        && !this.hasOwnProperty("_index")) JSON.stringify(this).log("error");
    }
    Object.prototype.critical = function() {
        if(!this.hasOwnProperty("__core-js_shared__") 
        && !this.hasOwnProperty("_index")) JSON.stringify(this).log("critical");
    }
}

module.exports = sawmill;