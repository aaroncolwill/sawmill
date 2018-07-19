var sawmill         = function(){};
global.sawmill      = sawmill;
const fs            = require('fs');
const path          = require('path');
var _currentfile    = {};
var _filenames      = [];
var _filepaths      = {};
var _toconsole      = false;
var _cached         = false;

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
    if(config.toconsole != null)
        _toconsole = config.toconsole;
    if(config.cached != null)
        throw "Not Implemented yet";
    if(config.directory != null)
        if (!fs.existsSync(path.join(__dirname, "/../", config.directory)))
            fs.mkdirSync(path.join(__dirname, "/../", config.directory));
    if(config.name != null) {
        if(config.directory == null) config.directory = "logs/";
        let filepath = path.join(__dirname, "/../", config.directory, "/", config.name + ".log");
        _filenames.push(config.name);
        _filepaths[config.name] = {
            firstline: true,
            file: `${config.name}.log"`,
            path: filepath,
            tags: (config.tags != null) ? config.tags : "none"
        }
        _currentfile = _filepaths[config.name];

        // cache and write
        sawmill.localCache(sawmill.firstLineFormatter());
        fs.writeFileSync(_currentfile.path, sawmill.firstLineFormatter());
    }
    else console.log(`Name (${config.name}) invalid`);
    return global.logger;
}

sawmill.localCache = function(data) {
    _log_cache_ += data;
}

sawmill.createFormatter = function(formatter) {
    _formatter = formatter;
}

sawmill.firstLineFormatter = function() {
    return `[`;
}

sawmill.nextLineFormatter = function(line) {
    return `,\n${line}`;
}

sawmill.write = function(message, type) {
    var formatted_message
    var type = (type != null) ? type : "info";

    // cache and write
    if(_toconsole) console.log(`${message}`);
    if(_cached) sawmill.localCache(formatted_message);

    // write by tags
    _filenames.forEach(element => {
        _filepaths[element].tags.forEach(tag => {
            if(tag == "*" || tag == type) {
                if(_filepaths[element].firstline) 
                    formatted_message = _formatter(new Date().toISOString(), message, type), _filepaths[element].firstline = false;
                else 
                    formatted_message = sawmill.nextLineFormatter(_formatter(new Date().toISOString(), message, type));
                
                fs.appendFileSync(_filepaths[element].path, formatted_message);
            }
        });
    });
    return global.logger;
}

/**
 * Get logfile from in-memory cache or disk
 * 
 * @param {String} name Name of log file 
 * @param {Boolean} from_cache Read from local cache 
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

String.prototype.log = function() {
    sawmill.write(this);
}
String.prototype.log = function(type) {
    if(type != null)    sawmill.write(this, type);
    else                sawmill.write(this);
}
String.prototype.log = function(type, logname) {
    if(logname != null) _currentfile = _filepaths[logname];
    if(type != null)    sawmill.write(this, type);
    else                sawmill.write(this);
}
String.prototype.info = function(logname) {
    this.log(`${this, "info"}`, logname);
}
String.prototype.warn = function(logname) {
    this.log(`${this, "warn"}`, logname);
}
String.prototype.debug = function(logname) {
    this.log(`${this, "debug"}`, logname);
}
String.prototype.error = function(logname) {
    this.log(`${this, "error"}`, logname);
}
String.prototype.critical = function(logname) {
    this.log(`${this, "critical"}`, logname);
}

module.exports = sawmill;