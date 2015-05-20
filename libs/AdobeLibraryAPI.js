/**
* This is the access-point for all calls into the API.
* <strong>An instance of this class, named adobeDPS, is automatically created in the global namespace.</strong>
* @namespace <strong>ADOBE CONFIDENTIAL</strong>
* <br/>________________________________________________
*
* <br/>Copyright 2012 Adobe Systems Incorporated
* <br/>All Rights Reserved.
* <br/>
* <br/>NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and may be covered by U.S. and Foreign Patents,
* patents in process, and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
*
* AdobePatentID="2472US01"
* <br/><br/>
* To begin working with the API, you must include the Library and Store API script in your HTML. The AdobeLibraryAPI.js can be included with your store files in the viewer or loaded from your server.
* Once that is done, you can work with the API through the use of one of the service objects. Some examples of available service objects are:
@example
    adobeDPS.libraryService         //Used to retrieve folios and to update the library.
    adobeDPS.authenticationService  //Used for authentication.
    adobeDPS.deviceService          //Used to get device information such as OS or network status.
    adobeDPS.receiptService         //Used to retrieve receipts and get subscription information.
    adobeDPS.settingsService        //Used to retrieve settings for the viewer.
    adobeDPS.analyticsService       //Used to send custom analytics events.
    adobeDPS.configurationService   //Used to retrieve application properties and to navigate between tabs.
    adobeDPS.dialogService          //Used to control dialogs.
*
**/
var adobeDPS = (function () {
    "use strict";

    // Directives for JSLint
    /*global window */
    /*global document */
    /*global printStackTrace */
    /*global setTimeout */
    /*global clearTimeout */

    /**
     * This particular directive is added because the Interface is used everywhere and will be initialized by the time
     * it is called, but because of the dependencies involved, it cannot be defined before it is used in the code.
     */
    /*global Interface */

    // Base classes
    
/**
 * @import Wrapper.js
 *
 * Create an instance of a class.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class Base class for all classes using inheritance
 * @platform iOS
 * @platform Android 
 * @platform Windows
 */
function Class() {
    throw new Error('Class object should never be directly constructed');
}

/**
 * Gets the string representation of this instance. By default, this will just be the
 * name of the class. If the class has an id property, it will be in the format: name[id].
 * @override
 * @return {String} The string representation of this instance. 
 * @memberOf adobeDPS-Class.prototype
 * @platform iOS
 * @platform Android 
 * @platform Windows
 */
Class.prototype.toString = function () {
    var className = /(\w+)\(/.exec(this.constructor.toString())[1];

    if (this.hasOwnProperty('id')) {
        className += '[' + this.id + ']';
    }

    return className;
};

/**
 * Used to extend this class with another class. The class that is passed in will be
 * given the extend function as well.
 * @private
 * @param {function} clazz A class to extend this class
 */
Class.extend = function (clazz) {
    var _super, fakeClass, prototype;
    // Setup a fake class so we can create a prototype instance without calling the
    // parent constructor
    _super = this.prototype;
    fakeClass = function () {};
    fakeClass.prototype = _super;

    // Create our prototype instance
    prototype = new fakeClass();

    // Setup the prototype and the constructor
    clazz.prototype = prototype;
    clazz.prototype.constructor = clazz;

    // Make sure the new class has the static extend method
    clazz.extend = Class.extend;
};

    /**
 * Create a single log message to be added to the log.
 * @Class Object used to store a single log message.
 * @private
 */
function LogMessage(lvl, msg) {
    this.lvl = lvl;
    this.msg = msg;
    this.timestamp = new Date();
}

/**
 * Creates an instance of the Log class.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class Class used for logging within the Adobe Library API. The Adobe Library API logs many of its
 * actions, so users of the API can debug issues with their usage of the API by calling Log.print() 
 * @example
 * // Usage Example
 * Log.instance.info("Received response from server");
 * Log.instance.warn("Bad response from server");
 * // Will return a string containing all logs of type WARN, INFO without timestamps
 * var logString = Log.instance.print(Log.instance.logLevels.WARN,Log.instance.logLevels.INFO,false);
 * console.log(logString);
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
function Log() {

    /**
     * Enable logging service. Defaults to true. If it is false
     * all calls to the Logging service will be disabled
     * @type Boolean
     * @memberOf adobeDPS-Log.prototype
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.enableLogging = true;

    /**
     * An object to keep track of all the profile timers currently in use.
     * @memberOf adobeDPS-Log.prototype
     */
    this._profileTimers = {};

    /**
     * This is the log used by the entire Library API. New log messages will be appended here.
     * @memberOf adobeDPS-Log.prototype
     */
    this._logList = [];
}

/**
 * Log an error. This will also try to print a stackTrace if printStackTrace is
 * available.
 * @memberOf adobeDPS-Log.prototype
 * @param {Error} error The error that you wish to log
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
Log.prototype.error = function (error) {
    if (this.enableLogging) {
        var _logged = false;
        try {
            if (error) {
                this._logList.push(new LogMessage(this.logLevels.ERROR, error.message + "\n" + printStackTrace({e: error}).join("\n")));
            } else {
                this._logList.push(new LogMessage(this.logLevels.ERROR, error.message + "\n" + printStackTrace().join("\n")));
            }
            _logged = true;
        } catch (e) {
            // no-op
        } finally {
            if (!_logged) {
                this._logList.push(new LogMessage(this.logLevels.ERROR, error.message));
            }
        }
    }
};

/**
 * Log an message at warning level.
 * @memberOf adobeDPS-Log.prototype
 * @param {String} msg The message that you wish to log
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
Log.prototype.warn = function (msg) {
    if (this.enableLogging) {
        this._logList.push(new LogMessage(this.logLevels.WARN, msg));
    }
};

/**
 * Log an message at info level.
 * @memberOf adobeDPS-Log.prototype
 * @param {String} msg The message that you wish to log
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
Log.prototype.info = function (msg) {
    if (this.enableLogging) {
        this._logList.push(new LogMessage(this.logLevels.INFO, msg));
    }
};

/**
 * Log an message at debug level.
 * @memberOf adobeDPS-Log.prototype
 * @param {String} msg The message that you wish to log
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
Log.prototype.debug = function (msg) {
    if (this.enableLogging) {
        this._logList.push(new LogMessage(this.logLevels.DEBUG, msg));
    }
};

/**
 * Function used to create and execute profilers. Each profiler is given an id. When this is called again with the same
 * id, the profiler will be executed and the time between calls will be logged along with the id of the profiler. For
 * this reason, id's should be used that are descriptive of what is being profiled.
 * @memberOf adobeDPS-Log.prototype
 * @param {String} id The id of the profiler to be created or executed
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
Log.prototype.profile = function (id) {
    if (this.enableLogging) {
        var time;
        if (this._profileTimers.hasOwnProperty(id)) {
            time = Date.now() - this._profileTimers[id];
            this._logList.push(new LogMessage(this.logLevels.PROFILE, id + ': ' + time + 'ms'));
        } else {
            this._profileTimers[id] = Date.now();
        }
    }
};

/**
 * Function used to send bridge specific log information. This should only be used within the API to log all
 * communications across the bridge. This should not be used outside of the API because it will pollute the bridge
 * specific logs.
 * @memberOf adobeDPS-Log.prototype
 * @param msg The message that you wish to log
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
Log.prototype.bridge = function (msg) {
    if (this.enableLogging) {
        this._logList.push(new LogMessage(this.logLevels.BRIDGE, msg));
    }
};

/**
 * Function used to get log information for some subset of the available LogLevels. Multiple levels can be requested by
 * creating a bitmask of the LogLevels to be returned. I.E. LogLevels.ERROR | LogLevels.WARN.
 * @memberOf adobeDPS-Log.prototype
 * @param {Number} lvls The bitmask of the levels that should be returned
 * @param {Boolean} timestamp Whether the log messages should be timestamped
 * @example
 * // Will return a string containing all logs of type ERROR, WARN, INFO, DEBUG
 * Log.instance.print(Log.instance.logLevels.ERROR | Log.instance.logLevels.WARN | Log.instance.logLevels.INFO | Log.instance.logLevels.DEBUG)
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
Log.prototype.print = function (lvls, timestamp) {
    if (this.enableLogging) {
        var i, log, ret = '';
        for (i = 0; i < this._logList.length; i++) {
            log = this._logList[i];
            if (lvls & log.lvl) {
                ret += this._lvlToStr(log.lvl);
                if (timestamp) {
                    ret += " [" + log.timestamp.getTime() + "] ";
                } else {
                    ret += " - ";
                }
                ret += log.msg + "\n";
            }
        }
        return ret;
    } else {
        return '';
    }
};
/**
 * Function used to clear the log
 * @memberOf adobeDPS-Log.prototype
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
Log.prototype.clear = function () {
    if (this.enableLogging) {
        this._logList.length = 0;
    }
};

/**
 * Function to generate the log level string associated with each log message. Used by the print function when
 * outputting the log string.
 * @param lvl
 * @return {String}
 * @private
 */
Log.prototype._lvlToStr = function (lvl) {
    switch (lvl) {
        case this.logLevels.BRIDGE:
            return "BRIDGE";
        case this.logLevels.DEBUG:
            return "DEBUG";
        case this.logLevels.PROFILE:
            return "PROFILE";
        case this.logLevels.INFO:
            return "INFO";
        case this.logLevels.WARN:
            return "WARN";
        case this.logLevels.ERROR:
            return "ERROR";
        default:
            return "LOG";
    }
};

/**
 * The singleton of the Log.
 * @static
 * @name instance
 * @memberOf adobeDPS-Log
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
Log.instance = new Log();

/**
 * The log levels that may be used.
 * They are used as bit-masks with the print() function to determine which logs to produce.
 * @memberOf adobeDPS-Log.prototype
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
Log.prototype.logLevels = {
    /**
     * Log level to specifically log all bridge communications
     */
    BRIDGE: 0x1,

    /**
     * Low-level information about all incoming messages.
     */
    DEBUG: 0x2,

    /**
     * Information about initialization times, throughput, and performance.
     */
    PROFILE: 0x4,

    /**
     * Info about any processes that may be of interest.
     */
    INFO: 0x8,

    /**
     * Warnings, usually to indicate potential misuse of the API.
     */
    WARN: 0x10,

    /**
     * Errors which are thrown.
     */
    ERROR: 0x20
};

    /**
 * Creates an instance of the Bridge class.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * AdobePatentID="2472US01"
 * @class Class used to communicate with the native application.
 * @private
 */
function Bridge() {
    if (!(this instanceof Bridge)) {
        throw new Error('Bridge initialized without new keyword!');
    }

    var that;
    this.BRIDGE_PREFIX_URI = "bridge://";
    this.bridgeBusy = true;
    this.bridgeMessageQueue = [];
    this.messageBuffer = [];

    // Performance Metrics
    this.sentData = 0;
    this.sendTime = 0;
    this.totalSends = 0;
    this.metrics = [Infinity, -Infinity, 0];
    this.metricsLogTimeout = null;


    // Would be nice to auto-detect this at some point
    this.location = "adobeDPS._bridge";

    // Don't allow bridge communication until DOM has finished loading
    if (document.body !== null) {
        this.bridgeBusy = false;

        this.out({event: {type: "BridgeInitialized", bridgeLocation: this.location}});
        Log.instance.info("BridgeInitialized - LOC: " + this.location);
    } else {
        that = this;
        window.addEventListener("DOMContentLoaded",
            function () {
                that.handleDomLoaded.call(that);
            }
        );
    }
}

Class.extend(Bridge);

/**
 * Function to handle the dom loading when the bridge initializes before the document body.
 * This should almost always be the case.
 * @memberOf adobeDPS-Bridge
 */
Bridge.prototype.handleDomLoaded = function () {
    this.bridgeBusy = false;
    this.out({event: {type: "BridgeInitialized", bridgeLocation: this.location}});
    Log.instance.info("BridgeInitialized - LOC: " + this.location);
};

/**
 * Sends a JSON object to the JSBridgingWebView via a special URL protocol.
 * Since only one object can be sent at a time using document.location, if
 * the bridge is busy, the object is queued until the bridge is free.
 * @memberOf adobeDPS-Bridge
 */
Bridge.prototype.out = function (data, force) {
    var i, stringData;

    // if this is the web viewer, just return
    if (window.boolAdobeDPSWebViewer === true) {
        return;
    }
        // approx 1Kb of data
//        garbage = "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvw" +
//            "xyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz" +
//            "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabc" +
//            "defghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdef" +
//            "ghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghi" +
//            "jklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijkl" +
//            "mnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmno" +
//            "pqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqr" +
//            "stuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstu" +
//            "vwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwx" +
//            "yzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz";
    if (!this.bridgeBusy || force) {
        this.bridgeBusy = true;
        if (data instanceof Array) {
            stringData = "[";
            for (i = 0; i < data.length; i++) {
//                data.garbage = (new Array(1024 * 2 + 1)).join(garbage);
                stringData += JSON.stringify(data[i]) + (i < data.length - 1 ? "," : "");
            }
            stringData += "]";
        } else {
//            data.garbage = (new Array(1024 * 2 + 1)).join(garbage);
            stringData = JSON.stringify(data);
        }
        // Update sentData, sendTime, and totalSends
        this.sentData = stringData.length;
        this.sendTime = (new Date()).getTime();
        this.totalSends++;

        window.location = this.BRIDGE_PREFIX_URI + encodeURIComponent(stringData);
        Log.instance.bridge("OUT - " + stringData);
    } else {
        this.bridgeMessageQueue.push(data);
    }
};

/**
 * Function used to accept incoming communication from the Bridge in partial strings. When
 * the 'execute' parameter is false, the 'data' string is stored for the 'messageid' in the
 * 'index' position. When the 'execute' parameter is true, the 'messageid' stored strings
 * are concatenated up to the 'index' parameter. The concatenated string is parsed into a
 * JSON object and passed to the Bridge input function using the endpoint passed in the
 * 'data' parameter.
 * @param messageid A unique identifier for the whole message.
 * @param index The index of the data part. If 'execute' is true, index
 *              is the total number of data parts.
 * @param data A string of partial data. If 'execute' is true, data
 *              is the endpoint selector to be executed.
 * @param execute If false, 'data' is stored in the bridge. If true,
 *              the data parts are concatenated and a JSON object is created
 *              from the string. The input function is called with the endpoint
 *              (passed in the data parameter).
 */
Bridge.prototype.partialInput = function (messageid, index, data, execute) {
    var messageString = "";

    try {
        if (execute === true) {
            // concatenate all of the data parts into one message string
            if (this.messageBuffer[messageid] && this.messageBuffer[messageid].length) {
                for (var i = 0; i < index; ++i) {
                    messageString += this.messageBuffer[messageid][i];
                }
                Log.instance.bridge("EXECUTE (" + messageid + " [ " + index.toString() + " ]) - " + data);

                // parse the string into a JSON object and call input
                // with the selector passed in the data parameter
                this.input(JSON.parse(messageString), data);
                this.messageBuffer[messageid].length = 0;
            }
        }
        else {
            // if this is a new message, create an array to hold it
            if (!this.messageBuffer[messageid]) {
                this.messageBuffer[messageid] = new Array();
            }
            Log.instance.bridge("APPEND (" + messageid + " [ " + index.toString() + " ]) - " + data.length.toString());

            // store the data in the array at the index
            this.messageBuffer[messageid][index] = data;
         }
    } catch (e) {
        Log.instance.error(e);
    }
};


/**
 * Function used to accept incoming communication from the Bridge and send the data to certain
 * endpoints on the interface. Although it is typically easy to call methods directly on the
 * interface, this dynamic bottleneck will allow the Interface instance to be renamed in the
 * global namespace without preventing the Bridge from communicating.
 * @param data Data to be sent to the bridge from native
 * @param endpoint The endpoint that should accept the data to be sent, as defined on the Interface
 */
Bridge.prototype.input = function (data, endpoint) {
    // if this is the web viewer, just return
    if (window.boolAdobeDPSWebViewer === true) {
        return;
    }

    try {
        Log.instance.bridge("INPUT(" + endpoint + ") - " + JSON.stringify(data));
        switch(endpoint) {
            case "_initialize":
                Interface.instance._initialize(data);
                break;
            case "_update":
                Interface.instance._update(data);
                break;
            default:
                Log.instance.warn("Bridge.input received call for unknown endpoint: " + endpoint);
                break;
        }
    } catch (e) {
        Log.instance.error(e);
    }
};

/**
 * Callback function from JSBridgingWebView. The web view must call this
 * function to notify that it receive the last JSON object and that the
 * bridge is now free to use.
 * @memberOf adobeDPS-Bridge
 */
Bridge.prototype.notifyReceivedBridgeData = function () {
    this.bridgeBusy = false;
    this.updateMetrics();
    this.processQueue();
};

Bridge.prototype.updateMetrics = function () {
    var transmitTime, dataSize, throughput;

    transmitTime = ((new Date()).getTime() - this.sendTime) / 1000; // seconds
    dataSize = this.sentData / 1024; // Bs -> KBs
    throughput = dataSize / transmitTime;

    if (this.metrics[0] > throughput) {
        this.metrics[0] = throughput;
    }

    if (this.metrics[1] < throughput) {
        this.metrics[1] = throughput;
    }

    // Calculate new average
    this.metrics[2] = ((this.metrics[2] * (this.totalSends - 1)) + throughput) / this.totalSends;

    this.logMetrics();
};

Bridge.prototype.logMetrics = function () {
    if (this.metricsLogTimeout) {
        clearTimeout(this.metricsLogTimeout);
    }

    var that = this;
    // If we haven't been updated in over a second, print out the metrics to the log. The idea here is that the metrics
    // will be printer out after a bunch of communication completes. This way, hopefully we are giving a good
    // representation of actual performance.
    this.metricsLogTimeout = setTimeout(
        function () {
            // Reset the average metric. This will basically just make future throughputs have more weight so that if bridge
            // speed increases, we will see the increase in the logs.
            that.totalSends = 1;

            Log.instance.info("Bridge BW - Min: " + that.metrics[0].toFixed(2) + "KB/s, Max: " + that.metrics[1].toFixed(2) + "KB/s, Avg: " + that.metrics[2].toFixed(2) + "KB/s");
        }
    , 1000);
};

/**
 * Function to process and send the next message in the bridge queue.
 * @memberOf adobeDPS-Bridge
 */
Bridge.prototype.processQueue = function () {
    if (this.bridgeMessageQueue.length > 0) {
        this.out(this.bridgeMessageQueue);
        this.bridgeMessageQueue.length = 0;
    }
};

/**
 * Creates an instance of the AndroidBridge class.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class Class used to communicate with an Android native application.
 * @private
 */
function AndroidBridge() {
    if (!(this instanceof AndroidBridge)) {
        throw new Error('AndroidBridge initialized without new keyword!');
    }

    // Would be nice to auto-detect this at some point
    this.location = "adobeDPS._bridge";

    this.out({event: {type: "BridgeInitialized", bridgeLocation: this.location}});
    Log.instance.info("BridgeInitialized - LOC: " + this.location);
}

Bridge.extend(AndroidBridge);

/**
 * Sends a JSON object to the Java side via a native JavascriptInterface.
 * @memberOf adobeDPS-AndroidBridge
 */
AndroidBridge.prototype.out = function (data, force) {
    var i, stringData;

    // if this is the web viewer, just return
    if (window.boolAdobeDPSWebViewer === true) {
        return;
    }

    if (data instanceof Array) {
        stringData = "[";
        for (i = 0; i < data.length; i++) {
            stringData += JSON.stringify(data[i]) + (i < data.length - 1 ? "," : "");
        }
        stringData += "]";
    } else {
        stringData = JSON.stringify(data);
    }

    _adobedps_native_bridge.out(stringData);

    Log.instance.bridge("OUT - " + stringData);
};

/**
 * The singleton of the Bridge.
 * @static
 * @name instance
 * @memberOf adobeDPS-Bridge
 */
if (typeof _adobedps_native_bridge !== "undefined") {
    Log.instance.info("Using Android Bridge");
    Bridge.instance = new AndroidBridge();
} else {
    Log.instance.info("Using Location Bridge");
    Bridge.instance = new Bridge();
}


    /**
     * Start profiling bridge initialization
     */
    Log.instance.profile("InitializationTime");

    //Signals
    /**
 * Object that represents a binding between a Signal and a listener function.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * <br />- inspired by Joa Ebert AS3 SignalBinding and Robert Penner's Slot classes.
 * @author Miller Medeiros
 * @constructor
 * @param {adobeDPS-Signal} signal Reference to Signal object that listener is currently bound to.
 * @param {Function} listener Handler function bound to the signal.
 * @param {boolean} isOnce If binding should be executed just once.
 * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
 * @param {Number} [priority] The priority level of the event listener. (default = 0).
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
function SignalBinding(signal, listener, isOnce, listenerContext, priority) {

    /**
     * Handler function bound to the signal.
     * @type Function
     * @private
     */
    this._listener = listener;

    /**
     * If binding should be executed just once.
     * @type boolean
     * @private
     */
    this._isOnce = isOnce;

    /**
     * Context on which listener will be executed (object that should represent the `this` variable inside listener function).
     * @memberOf adobeDPS-SignalBinding.prototype
     * @name context
     * @type Object|undefined|null
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.context = listenerContext;

    /**
     * Reference to Signal object that listener is currently bound to.
     * @type signals.Signal
     * @private
     */
    this._signal = signal;

    /**
     * Listener priority
     * @type Number
     * @private
     */
    this._priority = priority || 0;
}

SignalBinding.prototype = /** @lends adobeDPS-SignalBinding.prototype */ {

    /**
     * If binding is active and should be executed.
     * @type Boolean
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    active : true,

    /**
     * Default parameters passed to listener during `Signal.dispatch` and `SignalBinding.execute`. (curried parameters)
     * @type Array|null
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    params : null,

    /**
     * Call listener passing arbitrary parameters.
     * <p>If binding was added using `Signal.addOnce()` it will be automatically removed from signal dispatch queue, this method is used internally for the signal dispatch.</p>
     * @param {Array} [paramsArr] Array of parameters that should be passed to the listener
     * @return {*} Value returned by the listener.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    execute : function (paramsArr) {
        var handlerReturn, params;
        if (this.active && !!this._listener) {
            params = this.params? this.params.concat(paramsArr) : paramsArr;
            var context = (this.context !== undefined) ? this.context : window;
            handlerReturn = this._listener.apply(context, params);
            if (this._isOnce) {
                this.detach();
            }
        }
        return handlerReturn;
    },

    /**
     * Detach binding from signal.
     * - alias to: mySignal.remove(myBinding.getListener());
     * @return {Function|null} Handler function bound to the signal or `null` if binding was previously detached.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    detach : function () {
        return this.isBound()? this._signal.remove(this._listener, this.context) : null;
    },

    /**
     * @return {Boolean} `true` if binding is still bound to the signal and have a listener.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    isBound : function () {
        return (!!this._signal && !!this._listener);
    },

    /**
     * @return {Function} Handler function bound to the signal.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    getListener : function () {
        return this._listener;
    },

    /**
     * Delete instance properties
     * @private
     */
    _destroy : function () {
        delete this._signal;
        delete this._listener;
        delete this.context;
    },

    /**
     * @return {Boolean} If SignalBinding will only be executed once.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    isOnce : function () {
        return this._isOnce;
    },

    /**
     * @return {String} String representation of the object.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    toString : function () {
        return '[SignalBinding isOnce:' + this._isOnce +', isBound:'+ this.isBound() +', active:' + this.active + ']';
    }

};

    /**
 * Custom event broadcaster
 * <br />- inspired by Robert Penner's AS3 Signals.
 * @author Miller Medeiros
 * @constructor
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
function Signal() {
    /**
     * @type Array.<adobeDPS-SignalBinding>
     * @private
     */
    this._bindings = [];
    this._prevParams = null;
}

Signal.validateListener = function (listener, fnName) {
    if (typeof listener !== 'function') {
        throw new Error( 'listener is a required param of {fn}() and should be a Function.'.replace('{fn}', fnName) );
    }
};


Signal.prototype = 
/** @lends adobeDPS-Signal.prototype
*/
{


    /**
     * If Signal should keep record of previously dispatched parameters and
     * automatically execute listener during `add()`/`addOnce()` if Signal was
     * already dispatched before.
     * @type Boolean
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    memorize : false,

    /**
     * @type Boolean
     * @private
     */
    _shouldPropagate : true,

    /**
     * If Signal is active and should broadcast events.
     * <p><strong>IMPORTANT:</strong> Setting this property during a dispatch will only affect the next dispatch, if you want to stop the propagation of a signal use `halt()` instead.</p>
     * @type Boolean
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    active : true,

    /**
     * @param {Function} listener
     * @param {Boolean} isOnce
     * @param {Object} [listenerContext]
     * @param {Number} [priority]
     * @return {adobeDPS-SignalBinding}
     * @private
     */
    _registerListener : function (listener, isOnce, listenerContext, priority) {

        var prevIndex = this._indexOfListener(listener, listenerContext),
            binding;

        if (prevIndex !== -1) {
            binding = this._bindings[prevIndex];
            if (binding.isOnce() !== isOnce) {
                throw new Error('You cannot add'+ (isOnce? '' : 'Once') +'() then add'+ (!isOnce? '' : 'Once') +'() the same listener without removing the relationship first.');
            }
        } else {
            binding = new SignalBinding(this, listener, isOnce, listenerContext, priority);
            this._addBinding(binding);
        }

        if(this.memorize && this._prevParams){
            binding.execute(this._prevParams);
        }

        return binding;
    },

    /**
     * @param {adobeDPS-SignalBinding} binding
     * @private
     */
    _addBinding : function (binding) {
        //simplified insertion sort
        var n = this._bindings.length;
        do { --n; } while (this._bindings[n] && binding._priority <= this._bindings[n]._priority);
        this._bindings.splice(n + 1, 0, binding);
    },

    /**
     * @param {Function} listener
     * @return {Number}
     * @private
     */
    _indexOfListener : function (listener, context) {
        var n = this._bindings.length,
            cur;
        while (n--) {
            cur = this._bindings[n];
            if (cur._listener === listener && cur.context === context) {
                return n;
            }
        }
        return -1;
    },

    /**
     * Check if listener was attached to Signal.
     * @param {Function} listener
     * @param {Object} [context]
     * @return {Boolean} if Signal has the specified listener.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    has : function (listener, context) {
        return this._indexOfListener(listener, context) !== -1;
    },

    /**
     * Add a listener to the signal.
     * @param {Function} listener Signal handler function.
     * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
     * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
     * @return {adobeDPS-SignalBinding} An Object representing the binding between the Signal and listener.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    add : function (listener, listenerContext, priority) {
        Signal.validateListener(listener, 'add');
        return this._registerListener(listener, false, listenerContext, priority);
    },

    /**
     * Add listener to the signal that should be removed after first execution (will be executed only once).
     * @param {Function} listener Signal handler function.
     * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
     * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
     * @return {adobeDPS-SignalBinding} An Object representing the binding between the Signal and listener.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    addOnce : function (listener, listenerContext, priority) {
        Signal.validateListener(listener, 'addOnce');
        return this._registerListener(listener, true, listenerContext, priority);
    },

    /**
     * Remove a single listener from the dispatch queue.
     * @param {Function} listener Handler function that should be removed.
     * @param {Object} [context] Execution context (since you can add the same handler multiple times if executing in a different context).
     * @return {Function} Listener handler function.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    remove : function (listener, context) {
        Signal.validateListener(listener, 'remove');

        var i = this._indexOfListener(listener, context);
        if (i !== -1) {
            this._bindings[i]._destroy(); //no reason to a SignalBinding exist if it isn't attached to a signal
            this._bindings.splice(i, 1);
        }
        return listener;
    },

    /**
     * Remove all listeners from the Signal.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    removeAll : function () {
        var n = this._bindings.length;
        while (n--) {
            this._bindings[n]._destroy();
        }
        this._bindings.length = 0;
    },

    /**
     * @return {Number} Number of listeners attached to the Signal.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    getNumListeners : function () {
        return this._bindings.length;
    },

    /**
     * Stop propagation of the event, blocking the dispatch to next listeners on the queue.
     * <p><strong>IMPORTANT:</strong> should be called only during signal dispatch, calling it before/after dispatch won't affect signal broadcast.</p>
     * @see adobeDPS-Signal.prototype.disable
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    halt : function () {
        this._shouldPropagate = false;
    },

    /**
     * Dispatch/Broadcast Signal to all listeners added to the queue.
     * @param {...*} [params] Parameters that should be passed to each handler.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    dispatch : function (params) {
        if (! this.active) {
            return;
        }

        var paramsArr = Array.prototype.slice.call(arguments),
            n = this._bindings.length,
            bindings;

        if (this.memorize) {
            this._prevParams = paramsArr;
        }

        if (! n) {
            //should come after memorize
            return;
        }

        bindings = this._bindings.slice(); //clone array in case add/remove items during dispatch
        this._shouldPropagate = true; //in case `halt` was called before dispatch or during the previous dispatch.

        //execute all callbacks until end of the list or until a callback returns `false` or stops propagation
        //reverse loop since listeners with higher priority will be added at the end of the list
        do { n--; } while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== false);
    },

    /**
     * Forget memorized arguments.
     * @see adobeDPS-Signal.memorize
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    forget : function(){
        this._prevParams = null;
    },

    /**
     * Remove all bindings from signal and destroy any reference to external objects (destroy Signal object).
     * <p><strong>IMPORTANT:</strong> calling any method on the signal instance after calling dispose will throw errors.</p>
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    dispose : function () {
        this.removeAll();
        delete this._bindings;
        delete this._prevParams;
    },

    /**
     * @return {String} String representation of the object.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    toString : function () {
        return '[Signal active:'+ this.active +' numListeners:'+ this.getNumListeners() +']';
    }

};


    /**
 * Enum for the possible errors coming from the LibraryAPI transactions
 * @see adobeDPS-TransactionError#code
 * @namespace
 * @enum {Number}
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
var TransactionErrorType = {
    /** 
     * <strong>Value: -100</strong>
     * <br/>Indicates the Library could not connect to the Internet to complete a transaction.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    TransactionCannotConnectToInternetError:-100,
    /** 
     * <strong>Value: -110</strong>
     * <br/>Indicates the Library could not connect to the particular server needed to complete a transaction. 
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    TransactionCannotConnectToServerError:-110,
    /** 
     * <strong>Value: -150</strong>
     * <br/>Indicates the provided credentials were not recognized by the entitlement server. 
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    TransactionAuthenticationUnrecognizedCredentialsError: -150,
    /** 
     * <strong>Value: -200</strong>
     * <br/>Indicates folio and subscription purchasing is disabled on this device.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    TransactionFolioPurchasingDisabledError: -200,
    /** 
     * <strong>Value: -210</strong>
     * <br/>Indicates a single folio purchase transaction failed because an error occurred communicating with the in-app purchase system. 
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    TransactionFolioCannotPurchaseError: -210,
    /** 
     * <strong>Value: -220</strong>
     * <br/>Indicates a subscription purchase transaction failed because an error occurred communicating with the in-app purchase system.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    TransactionSubscriptionCannotPurchaseError: -220,
    /** 
     * <strong>Value: -225</strong>
     * <br/>Indicates there was an error attempting to resolve the valid date ranges for a subscription. 
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    TransactionSubscriptionResolveError: -225,
    /** 
     * <strong>Value: -250</strong>
     * <br/>Indicates a restore purchases transaction failed because an error occurred communicating with the in-app purchase system.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    TransactionRestorePurchasesError: -250,
    /** 
     * <strong>Value: -300</strong>
     * <br/>Indicates the user attempted to purchase or download a folio when the publisher's download quota has been exceeded.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    TransactionQuotaExceededError: -300,
    /** 
     * <strong>Value: -400</strong>
     * <br/>Indicates the user attempted to purchase or download a folio that is incompatible with the current Viewer.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    TransactionFolioIncompatibleError: -400,
    /** 
     * <strong>Value: -500</strong>
     * <br/>Indicates the user attempted to download a folio that was larger than the space available on the device. 
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    TransactionFolioNotEnoughDiskSpaceError: -500,
    /** 
     * <strong>Value: -510</strong>
     * <br/>Indicates there was an error downloading the folio that was not network related.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    TransactionFolioCannotDownloadError: -510,
    /** 
     * <strong>Value: -520</strong>
     * <br/>Indicates the folio being downloaded was either corrupted or became unavailable
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    TransactionFolioFileMissingOrInvalid: -520,
    /** 
     * <strong>Value: -530</strong>
     * <br/>Indicates there was an error during the the installation of the folio
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    TransactionFolioCannotInstallItemError: -530,
    /**
     * <strong>Value: -540</strong>
     * <br/>Indicates the preview download failed because there was no preview of the folio available
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    TransactionFolioNoPreviewAvailable: -540,
    /**
     * <strong>Value: -550</strong>
     * <br/>Indicates the requested folio is not found on the server
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    TransactionFolioNotFoundOnServer: -550,
    /**
     * <strong>Value: -560</strong>
     * <br/>Indicates the folio call is unsupported
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    TransactionFolioCallNotApplicable: -560,
    /**
     * <strong>Value: -900</strong>
     * <br/>Indicates a transaction failed because of an error that occurred in the LibraryAPI 
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    TransactionInternalError: -900,
    
    /**
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    toErrorType: function(num) {
        switch(parseInt(num, 10)) {
            case -100:
                return TransactionErrorType.TransactionCannotConnectToInternetError;
            case -110:
                return TransactionErrorType.TransactionCannotConnectToServerError;
            case -150:
                return TransactionErrorType.TransactionAuthenticationUnrecognizedCredentialsError;
            case -151:
                return TransactionErrorType.TransactionAuthenticationCancelError;
            case -200:
                return TransactionErrorType.TransactionFolioPurchasingDisabledError;
            case -210:
                return TransactionErrorType.TransactionFolioCannotPurchaseError;
            case -211:
                return TransactionErrorType.TransactionFolioPurchaseCancelError;
            case -220:
                return TransactionErrorType.TransactionSubscriptionCannotPurchaseError;
            case -221:
                return TransactionErrorType.TransactionSubscriptionPurchaseCancelError;
            case -225:
                return TransactionErrorType.TransactionSubscriptionResolveError;
            case -250:
                return TransactionErrorType.TransactionRestorePurchasesError;
            case -251:
                return TransactionErrorType.TransactionRestorePurchaseCancelError;
            case -300:
                return TransactionErrorType.TransactionQuotaExceededError;
            case -400:
                return TransactionErrorType.TransactionFolioIncompatibleError;
            case -500:
                return TransactionErrorType.TransactionFolioNotEnoughDiskSpaceError;
            case -510:
                return TransactionErrorType.TransactionFolioCannotDownloadError;
            case -520:
                return TransactionErrorType.TransactionFolioFileMissingOrInvalid;
            case -530:
                return TransactionErrorType.TransactionFolioCannotInstallItemError;
            case -540:
                return TransactionErrorType.TransactionFolioNoPreviewAvailable;
            case -550:
                return TransactionErrorType.TransactionFolioNotFoundOnServer;
            case -560:
                return TransactionErrorType.TransactionFolioCallNotApplicable;
            case -900:
                return TransactionErrorType.TransactionInternalError;
            default:
                throw new Error("Invalid TransactionError: " + num);
        }
    }
};

/**
 * Create a new TransactionError
 * @class The base Transaction
 * @extends adobeDPS-Class
 * @throws {Error} If the constructor was not called with new
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
function TransactionError() {
    if (!(this instanceof TransactionError)) {
        throw new Error('TransactionError initialized without new keyword!');
    }

    /**
     * Code for this TransactionError
     * @memberOf adobeDPS-TransactionError.prototype
     * @type adobeDPS-TransactionErrorType
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.code = 0;
}

Class.extend(TransactionError);


/**
 * Enum for the state of the Transaction. 
 * <br/>States that are noted as final transaction states will be the last state that a 
 * transaction will have before it is destroyed.
 * @see adobeDPS-Transaction#state
 * @namespace
 * @enum {Number}
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
var TransactionState = {
    /** 
     * <strong>Value: -100</strong>
     * <br/>The Transaction has failed. The {@link adobeDPS-Transaction#error} field should be populated.
     * <br/><em>This is a final Transaction state.</em>
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    FAILED: -100,
    /** 
     * <strong>Value: -1</strong>
     * <br/>The Transaction has been canceled by the user.
     * <br/><em>This is a final Transaction state.</em>
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    CANCELED: -1,
    /** 
     * <strong>Value: 0</strong>
     * <br/>The initial state of the Transaction before it is started.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    INITIALIZED: 0,
    /** 
     * <strong>Value: 100</strong>
     * <br/>The Transaction has been temporarily paused by the user.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    PAUSED: 100,
    /** 
     * <strong>Value: 200</strong>
     * <br/>The Transaction is currently ongoing. 
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    ACTIVE: 200,
    /** 
     * <strong>Value: 400</strong>
     * <br/>The transaction has completed without any errors.
     * <br/><em>This is a final Transaction state.</em>
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    FINISHED: 400,
    /**
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    toState: function(num) {
        switch(parseInt(num, 10)) {
            case -100:
                return TransactionState.FAILED;
            case -1:
                return TransactionState.CANCELED;
            case 0:
                return TransactionState.INITIALIZED;
            case 100:
                return TransactionState.PAUSED;
            case 200:
                return TransactionState.ACTIVE;
            case 400:
                return TransactionState.FINISHED;
            default:
                throw new Error("Invalid TransactionState: " + num);
        }
    }
};

/**
 * Create a new Transaction
 * @class The base Transaction
 * @extends adobeDPS-Class
 * @throws {Error} If the constructor was not called with new
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
function Transaction() {
    if (!(this instanceof Transaction)) {
        throw new Error('Transaction initialized without new keyword!');
    }

    /**
     * Signal to indicate that the state of this transaction has changed.
     * <br/><em>Callback Signature: stateChangedHandler({@link adobeDPS-Transaction})</em>
     * @memberOf adobeDPS-Transaction.prototype
     * @type adobeDPS-Signal
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.stateChangedSignal = new Signal();
    
    /**
     * Signal to indicate that the transaction has completed. This could mean that it finished,
     * failed, or been canceled. You will need to check the state and the error field to check the results.
     * <br/><em>Callback Signature: transactionCompletedHandler({@link adobeDPS-Transaction})</em>
     * @memberOf adobeDPS-Transaction.prototype
     * @type adobeDPS-Signal
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.completedSignal = new Signal();
    
    /**
     * Signal to indicate transaction progress. Will only be dispatched if `isDeterminate` is true.
     * Sends `this.progress` to the handlers.
     * <br/><em>Callback Signature: progressHandler({@link adobeDPS-Transaction})</em>
     * @memberOf adobeDPS-Transaction.prototype
     * @type adobeDPS-Signal
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.progressSignal = new Signal();
    
    /**
     * The Unique id of this Transaction. Will be set when the Transaction is registered with the
     * TransactionManager.
     * @memberOf adobeDPS-Transaction.prototype
     * @type String
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.id = null;
    
    /**
     * The state of this Transaction.
     * @memberOf adobeDPS-Transaction.prototype
     * @default {adobeDPS-TransactionState#INITIALIZED}
     * @type adobeDPS-TransactionState
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.state = 0; 
    
    /**
     * The progress of this Transaction.
     * <br/>Represented as a 100-based percentage ( values between 0 and 100).
     * <br/><em>NOTE: Will remain 0 if `isDeterminate` is false</em>
     * @memberOf adobeDPS-Transaction.prototype
     * @type Number
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.progress = 0;
    
    /**
     * The TransactionError associated with this transaction, assuming an error has occurred.    
     * @memberOf adobeDPS-Transaction.prototype
     * @type adobeDPS-TransactionError
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.error = new TransactionError();
    
    /**
     * Whether this Transaction can be canceled.
     * @memberOf adobeDPS-Transaction.prototype
     * @default false
     * @type Boolean
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.isCancelable = false;
    
    /**
     * Whether this Transaction can be paused.
     * @memberOf adobeDPS-Transaction.prototype
     * @default false
     * @type Boolean
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.isPausable = false;
    
    /**
     * Whether this Transaction is determinate (has progress). If true, you can expect to
     * receive progressSignals from this transaction. 
     * @memberOf adobeDPS-Transaction.prototype
     * @default false
     * @type Boolean
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.isDeterminate = false;
    
    /**
     * Whether failure of the transaction is a terminal state. When this is true, the
     * completedSignal will be dispatched when the state changes to FAILED. Otherwise, 
     * FAILED should be treated like PAUSED and can be resumed.
     * @memberOf adobeDPS-Transaction.prototype
     * @default false
     * @type Boolean
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.isFailureTerminal = true;
}

Class.extend(Transaction);

/**
 * Whether this transaction is of type FolioStateChangingTransaction
 * @memberOf adobeDPS-Transaction.prototype
 * @returns {adobeDPS-Transaction} true or false
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
Transaction.prototype.isFolioStateChangingTransaction = function () {
    return this instanceof FolioStateChangingTransaction;
};

/**
 * Start this transaction.
 * @memberOf adobeDPS-Transaction.prototype
 * @returns {adobeDPS-Transaction} The started transaction
 * @throws {Error} If the transaction wasn't properly initialized
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
Transaction.prototype.start = function () {
    if (this.state != TransactionState.INITIALIZED) {
        throw new Error('Attempting to start an ongoing Transaction! State: ' + this.state);
    } else {
        Interface.instance._send(
            {action: "call", 
                path: "transactionManager._allTransactions['"+this.id+"']",
                data: {
                    method: "start"
                }
            }
         );
         return this;
    }
};

/**
 * Pauses a transaction. `isPausable` must be true.
 * @memberOf adobeDPS-Transaction.prototype
 * @returns {adobeDPS-Transaction} The paused transaction
 * @throws {Error} If `isPausable` is false or if `isPausable` is true and this function is not overridden
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
Transaction.prototype.pause = function () {
    if (!this.isPausable) {
        throw new Error('Attempting to pause a non-pausable Transaction!');
    } else {
        Interface.instance._send(
            {action: "call", 
                path: "transactionManager._allTransactions['"+this.id+"']",
                data: {
                    method: "pause"
                }
            }
         );
    }
    return this;
};

/**
 * Resumes a paused transaction. `state` must be {@link adobeDPS-TransactionState#PAUSED}.
 * @memberOf adobeDPS-Transaction.prototype
 * @returns {adobeDPS-Transaction} The now-active transaction
 * @throws {Error} If the Transaction is not currently paused or if it is and this function is not overridden
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
Transaction.prototype.resume = function () {
    if (this.state != TransactionState.PAUSED) {
        throw new Error('Attempting to resume a non-paused Transaction! State: ' + this.state);
    } else {
        Interface.instance._send(
            {action: "call", 
                path: "transactionManager._allTransactions['"+this.id+"']",
                data: {
                    method: "resume"
                }
            }
         );
    }
    return this;
};

/**
 * Cancels a transaction. The transaction must be ongoing and `isCancelable` must be true.
 * @memberOf adobeDPS-Transaction.prototype
 * @returns {adobeDPS-Transaction} The canceled transaction
 * @throws {Error} If `isCancelable` is false or if `isCancelable` is true and this function is not overridden
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
Transaction.prototype.cancel = function () {
    if (!this.isCancelable) {
        throw new Error('Attempting to cancel a non-cancelable Transaction!');
    } else {
        Interface.instance._send(
            {action: "call",
                path: "transactionManager._allTransactions['"+this.id+"']",
                data: {
                    method: "cancel"
                }
            }
        );
    }
    return this;
};

/**
 * Whether this Transaction can be suspended.
 * @memberOf adobeDPS-Transaction.prototype
 * @returns {Boolean} If the transaction is suspendable
 * @private
 */
Transaction.prototype._isSuspendable = function () {
    return false;
}

/**
 * Suspends a transaction. `_isSuspendable()` must be true.
 * @memberOf adobeDPS-Transaction.prototype
 * @returns {adobeDPS-Transaction} The suspended transaction
 * @throws {Error} If `_isSuspendable()` is false
 * @private
 */
Transaction.prototype._suspend = function () {
    if (!this._isSuspendable()) {
        throw new Error('Attempting to suspend a non-suspendable Transaction!');
    } else {
        Interface.instance._send(
            {action: "call", 
                path: "transactionManager._allTransactions['"+this.id+"']",
                data: {
                    method: "suspend"
                }
            }
         );
    }
    return this;
};

/**
 * The name of this class used by JSON messages.
 * @memberOf adobeDPS-Transaction.prototype
 * @private
 */
Transaction.prototype.jsonClassName = "Transaction";

/**
 * Function used to serialize this class into a JSON object to be sent over the brdige.
 * @memberOf adobeDPS-Transaction.prototype
 * @returns {Object} The JSON object to represent this transaction
 * @private
 */
Transaction.prototype._toJSON = function () {
    return {
        type: this.jsonClassName,
        id: this.id
    };
};

/**
 * Function used to update this transaction using a JSON object sent over the bridge.
 * @memberOf adobeDPS-Transaction.prototype
 * @private
 */
Transaction.prototype._updateFromJSON = function (json) {
    var newState, newProgress, errorJSON;

    if (this.id === null && json.hasOwnProperty("id")) {
        this.id = json.id;
    }
    
    if (json.hasOwnProperty("error")) {
        errorJSON = json.error;
        if (errorJSON !== null && errorJSON.hasOwnProperty("code")) {
            this.error = new TransactionError();
            try {
                this.error.code = TransactionErrorType.toErrorType(errorJSON.code);
                Log.instance.warn(this.jsonClassName + " error: " + this.error.code);
            } catch (error) {
                // We are catching here because we want to continue processing the update
                // despite the invalid information received in an attempt to recover.
                Log.instance.error(error);
            }
        }
    }
    
    if (json.hasOwnProperty("isCancelable")) {
        this.isCancelable = json.isCancelable;
    }
    
    if (json.hasOwnProperty("isPausable")) {
        this.isPausable = json.isPausable;
    }
    
    if (json.hasOwnProperty("isDeterminate")) {
        this.isDeterminate = json.isDeterminate;
    }
    
    if (json.hasOwnProperty("state")) {
        newState = this.state;
        try {
            newState = TransactionState.toState(json.state);
        } catch (error) {
            // We are catching here because we want to continue processing the update
            // despite the invalid information received in an attempt to recover.
            Log.instance.error(error);
        }
        
        if (this.state != newState) {
            this.state = newState;
            this.stateChangedSignal.dispatch(this);
        }
    }
    
    if (json.hasOwnProperty("progress")) {
        newProgress = Number(json.progress);
        if (this.progress != newProgress) {
            this.progress = newProgress;
            this.progressSignal.dispatch(this);
        }
    }
};

    /**
 * Create a Library Update Transaction
 * @class A Transaction that is used to update the library. When this transaction is completed, the library will be
 * finished being updated from the fulfillment server. However, this does not mean that entitlements will be updated
 * from the entitlement server (if applicable). The entitlements will be updated sometime after the library update
 * completes.
 * @extends adobeDPS-Transaction
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
function LibraryUpdateTransaction() {
    Transaction.call(this);
}

Transaction.extend(LibraryUpdateTransaction);

/**
 * Class name to use for JSON messages.
 * @memberOf adobeDPS-LibraryUpdateTransaction.prototype
 * @private
 */
LibraryUpdateTransaction.prototype.jsonClassName = "LibraryUpdateTransaction";
    /**
 * Create a Restore Purchases Transaction
 * @class A Transaction that is used to restore a users previous purchases.
 * @extends adobeDPS-Transaction
 * @platform iOS
 */
function RestorePurchasesTransaction() {
    Transaction.call(this);
}

Transaction.extend(RestorePurchasesTransaction);

/**
 * Class name to use for JSON messages.
 * @memberOf adobeDPS-RestorePurchasesTransaction.prototype
 * @private
 */
RestorePurchasesTransaction.prototype.jsonClassName = "RestorePurchasesTransaction";
    /**
 * Create a ModifySubscriptionsListTransaction Transaction
 * @class A Transaction used to modify the list of subscriptions available for purchase
 * by the user. This will add and remove subscriptions from the available list of subscriptions.
 * Added subscriptions will be validated with the appropriate authority. New subscriptions
 * that are not validated will be discarded. The transaction will  also revalidate any existing subscriptions.
 * @param {Array} addedSubscriptions The subscription products to be added to the available subscriptions
 * @param {Array} removedSubscriptions The subscription products to be removed from the available subscriptions
 * @extends adobeDPS-Transaction
 * @platform iOS
 */
function ModifySubscriptionsListTransaction(addedSubscriptions, removedSubscriptions) {

    /**
     * The subscription products to be added to the available subscriptions
     * @type Array
     * @see adobeDPS-Subscription
     * @platform iOS
     */
    this.addedSubscriptions = addedSubscriptions;

    /**
     * The subscription products to be removed from the available subscriptions
     * @type Array
     * @see adobeDPS-Subscription
     * @platform iOS
     */
    this.removedSubscriptions = removedSubscriptions;


    Transaction.call(this);
}

Transaction.extend(ModifySubscriptionsListTransaction);

/**
 * Class name to use for JSON messages.
 * @memberOf adobeDPS-ModifySubscriptionsListTransaction.prototype
 * @private
 */
ModifySubscriptionsListTransaction.prototype.jsonClassName = "ModifySubscriptionsListTransaction";

/**
 * Add the added and removed subscriptions to the JSON message to send to native.
 * @memberOf adobeDPS-Transaction.prototype
 */
ModifySubscriptionsListTransaction.prototype._toJSON = function () {
    var i, json, subscription, addedJSON, removedJSON;
    json = Transaction.prototype._toJSON.call(this);
     addedJSON = [];
    for (i=0;i<this.addedSubscriptions.length;i++) {
        subscription = this.addedSubscriptions[i];
        addedJSON.push(subscription._toJSON());
    }
    
    json.addedSubscriptions = addedJSON;

     json.removedSubscriptions = this.removedSubscriptions;
    return json;
};

    /**
 * Create a Subscribe Transaction
 * @class A Transaction that is used to subscribe.
 * @param {String} productId The productId of the subscription 
 * @extends adobeDPS-Transaction
 * @platform iOS
 */
function SubscribeTransaction(productId) {
    /**
     * The productId of the subscription to purchase.
     * @memberOf adobeDPS-SubscribeTransaction.prototype
     * @type String
     * @platform iOS
     */
    this.productId = productId;
    
    Transaction.call(this);
}

Transaction.extend(SubscribeTransaction);

/**
 * Class name to use for JSON messages.
 * @memberOf adobeDPS-SubscribeTransaction.prototype
 * @private
 */
SubscribeTransaction.prototype.jsonClassName = "SubscribeTransaction";

/**
 * Add productId to the JSON message to send to native.
 * @memberOf adobeDPS-SubscribeTransaction.prototype
 * @private
 */
SubscribeTransaction.prototype._toJSON = function () {
    var json = Transaction.prototype._toJSON.call(this);
    json.productId = this.productId;
    return json;
};

/**
 * Get the productId from the JSON message.
 * @memberOf adobeDPS-SubscribeTransaction.prototype
 * @param {Object} json The JSON object to parse for updates
 * @private
 */
SubscribeTransaction.prototype._updateFromJSON = function (json) {
    Transaction.prototype._updateFromJSON.call(this,json);

    if (json.hasOwnProperty("productId")) {
        this.productId = json.productId;
    }
};
    /**
 * Create a User Sign-in Transaction. You must either pass in both a username and password
 * or a token in order to sign-in.
 * @class A Transaction that is used to sign-in a user.
 * @param {String} username The username to use to login
 * @param {String} password The password to use to login
 * @param {String} token The token to use to login
 * @extends adobeDPS-Transaction
 * @throws {Error} If a token or a username/password combination is not provided
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
function UserSigninTransaction(username, password, token) {
    if (!token && (!username || !password)) {
        throw new Error('A token or a username and password must be provided for a UserSigninTransaction');
    }
    
    /**
     * The username to use to login.
     * @memberOf adobeDPS-UserSigninTransaction.prototype
     * @type String
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.username = username;
    
    /**
     * The password to use to login.
     * @memberOf adobeDPS-UserSigninTransaction.prototype
     * @type String
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.password = password;
    
    /**
     * The token to use to login.
     * @memberOf adobeDPS-UserSigninTransaction.prototype
     * @type String
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.token = token;
    
    Transaction.call(this);
}

Transaction.extend(UserSigninTransaction);

/**
 * Class name to use for JSON messages.
 * @memberOf adobeDPS-UserSigninTransaction.prototype
 * @private
 */
UserSigninTransaction.prototype.jsonClassName = "UserSigninTransaction";

/**
 * Add username, password, and token to the JSON message to send to native.
 * @memberOf adobeDPS-UserSigninTransaction.prototype
 * @private
 */
UserSigninTransaction.prototype._toJSON = function () {
    var json = Transaction.prototype._toJSON.call(this);
    json.username = this.username;
    json.password = this.password;
    json.token = this.token;
    return json;
};

/**
 * Get the username, password, and token from the JSON message.
 * @memberOf adobeDPS-UserSigninTransaction.prototype
 * @param {Object} json The JSON object to parse for updates
 * @private
 */
UserSigninTransaction.prototype._updateFromJSON = function (json) {
    Transaction.prototype._updateFromJSON.call(this,json);

    if (json.hasOwnProperty("username")) {
        this.username = json.username;
    }
    
    if (json.hasOwnProperty("password")) {
        this.password = json.password;
    }
    
    if (json.hasOwnProperty("token")) {
        this.token = json.token;
    }
};
    /**
 * Create a User Sign-out Transaction.
 * @class A Transaction that is used to sign-out a user.
 * @extends adobeDPS-Transaction
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
function UserSignoutTransaction() {
    Transaction.call(this);
}

Transaction.extend(UserSignoutTransaction);

/**
 * Class name to use for JSON messages.
 * @memberOf adobeDPS-UserSignoutTransaction.prototype
 * @private
 */
UserSignoutTransaction.prototype.jsonClassName = "UserSignoutTransaction";

     /**
 * Create an instance of a Service.
 * <br />- <strong>This is an abstract constructor and shouldn't be called by regular users.</strong>
 * @class Parent class of all Services.
 * @extends adobeDPS-Class
 * @platform iOS
 * @platform Android
 */
function Service() {}

Class.extend(Service);

/**
 * This function is used to process a path and return the first element.
 * i.e. path = libraryService.folioMap, this will return libraryService
 * @memberOf adobeDPS-Service.prototype
 * @param {String} path The path to process
 * @returns {String} The first path element
 */
Service.prototype._getNextPathElement = function (path) {
    var breakIndex = path.indexOf(".");
    if (breakIndex > -1) {
        return path.substring(0,breakIndex);
    } else {
        return path;
    }
};

/**
 * This function is used to process a path and return all elements after
 * the first one.
 * i.e. path = libraryService.folioMap, this will return folioMap
 * @memberOf adobeDPS-Service.prototype
 * @param {String} path The path to process
 * @returns {String} The child path element
 */
Service.prototype._getChildPath = function (path) {
    var breakIndex = path.indexOf(".");
    if (breakIndex > -1) {
        return path.substring(breakIndex + 1);
    } else {
        return "";
    }
};

/**
 * Initialize the Service with a JSON update from native.
 * @memberOf adobeDPS-Service.prototype
 */
Service.prototype._initialize = function (data) {
    // No-op
};

/**
 * Update the Service with a JSON update from native.
 * @memberOf adobeDPS-Service.prototype
 */
Service.prototype._update = function (data) {
    // No-op
};
    /**
 * Create an instance of the TransactionManager.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class Class used for managing incoming and outgoing transactions within the application
 * <br/><strong>Accessible from adobeDPS.transactionManager</strong>
 * @extends adobeDPS-Service
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
function TransactionManager() {
    /**
     * Signal to indicate that a new transaction has arrived from the native code.
     * <br/><em>Callback Signature: newTransactionsAvailableHandler([ {@link adobeDPS-Transaction}, ... ])</em>
     * @memberOf adobeDPS-TransactionManager.prototype
     * @type adobeDPS-Signal
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.newTransactionsAvailableSignal = new Signal();

    /**
     * An associative array of all registered transactions by id.
     * @memberOf adobeDPS-TransactionManager.prototype
     * @private
     * @type Object
     */
    this._allTransactions = {};
    
    /**
     * The last UID that was issued to a transaction. This value is used to make sure that
     * two transactions are not given the same id.
     * @memberOf adobeDPS-TransactionManager.prototype
     * @private
     * @type String
     * @see adobeDPS-TransactionManager._lastUID
     */
    this._lastUID = null;
    
    /**
     * This is a counter of how many times an issued UID was used. UID are generated based
     * on the time that a transaction is registered, therefore it is conceivable that a
     * UID could be used several times before enough time passes to generate a new unique
     * one. This counter makes sure that each new UID will be an actual unique value.
     * @memberOf adobeDPS-TransactionManager.prototype
     * @private
     * @type adobeDPS-Signal
     */
    this._lastUIDCounter = 0;
    
    /**
     * This is the user-accessible location to access TransactionState constants.
     * @memberOf adobeDPS-TransactionManager.prototype
     * @type adobeDPS-TransactionState
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.transactionStates = TransactionState;
    
    /**
     * This is the user-accessible location to access TransactionErrorType constants.
     * @memberOf adobeDPS-TransactionManager.prototype
     * @type adobeDPS-TransactionErrorType
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.transactionErrorTypes = TransactionErrorType;
    
    Service.call(this);
}

Service.extend(TransactionManager);

/**
 * Generates the current list of active transactions. Since this list is generated
 * each time that this function is called, the user is free to sort or change the list
 * in any way they see fit.
 * @memberOf adobeDPS-TransactionManager.prototype
 * @returns {adobeDPS-Transaction[]} The list of active transactions
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
TransactionManager.prototype.activeTransactions = function () {
    var active = {}, id, trans;
    for (id in this._allTransactions) {
        trans = this._allTransactions[id];
        if (trans.state == Transaction.ACTIVE) {
            active[id] = this._allTransactions[id];
        }
    }
    return active;
};

/**
 * Generates the current list of all registered  transactions. Since this list is 
 * generated each time that this function is called, the user is free to sort or
 * change the list in any way they see fit.
 * @memberOf adobeDPS-TransactionManager.prototype
 * @returns {adobeDPS-Transaction[]} The list of all transactions
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
TransactionManager.prototype.allTransactions = function () {
    var all = {}, id;
    for (id in this._allTransactions) {
        all[id] = this._allTransactions[id];
    }
    return all;
};

/**
 * Registers a new transaction with the application and sends it to the native side for
 * so that it exists on both sides of the bridge. An ID will be added to the transaction
 * byt this function if it doesn't already have one.
 * @param {adobeDPS-Transaction} trans The transaction to register
 * @param {Boolean} isInitializing Whether the application is currently initializing. This will cause new Transactions not to be registered with the native side, if true.
 * @memberOf adobeDPS-TransactionManager.prototype
 * @returns {adobeDPS-Transaction} The transaction that was registered
 */
TransactionManager.prototype._registerTransaction = function (trans, isInitializing) {
    // This function will register the transaction with the native app
    if (!trans.hasOwnProperty("id") || trans.id === null) {
        trans.id = this._generateUID();
    }
    this._allTransactions[trans.id] = trans;
    
    // Add a completedSignal handler so we can remove the transaction when it is
    // done. Make sure priority is very low so we can guarantee that we are last to know
    // so we don't delete the transaction before other code is done using it.
    trans.completedSignal.add(
        function (transaction) {
            Log.instance.debug("Transaction " + transaction.id + " completed");
            delete this._allTransactions[transaction.id];
        }, this, -Infinity
    );
    
    // Check if this transaction originated on the native side
    // NOTE: All native transaction ids begin with an N.
    // If it came from the native side, we don't want to send an
    // add for it back to the native side.
    if (this._didOriginateHere(trans) && !isInitializing) {
        Interface.instance._send(
            {action: "add",
                path: "transactionManager",
                data: trans._toJSON()
            }
        );
        Log.instance.debug("Registered transaction " + trans.id + " with native app");
    }
    
    return trans;
};

/**
 * Function used to determine if a transaction originated from this instance
 * of the API.
 * @private
 * @memberOf adobeDPS-TransactionManager.prototype 
 * @param {adobeDPS-Transaction} transaction The transaction to check
 * @returns {Boolean} Whether the transaction originated here
 */
TransactionManager.prototype._didOriginateHere = function (transaction) {
    var parts = transaction.id.split("-");
    
    if (parts.length > 0) {
        if (parts[0] == Interface.instance.uid) {
            return true;
        }
    }
    
    return false;
};

TransactionManager.prototype._generateUID = function () {
    // The ids always start with this instance's uid
    var ret = Interface.instance.uid + "-",
        time = (new Date()).getTime();
    
    if (time != this._lastUID) {
        this._lastUID = time;
        this._lastUIDCounter = 0;
        return ret + time.toString();
    } else {
        this._lastUIDCounter++;
        return ret + time.toString() + this._lastUIDCounter;
    }
};

TransactionManager.prototype._transactionVOProcess = function (vo) {
    var newTrans = null;
    switch (vo.type) {
        case "DownloadTransaction":
            newTrans = new DownloadTransaction();
            break;
        case "ArchiveTransaction":
            newTrans = new ArchiveTransaction();
            break;
        case "LibraryUpdateTransaction":
            newTrans = new LibraryUpdateTransaction();
            break;
        case "PreviewImageTransaction":
            newTrans = new PreviewImageTransaction();
            break;
        case "PurchaseTransaction":
            newTrans = new PurchaseTransaction(); 
            break;
        case "RestorePurchasesTransaction":
            newTrans = new RestorePurchasesTransaction();
            break;
        case "ModifySubscriptionsListTransaction":
            newTrans = new ModifySubscriptionsListTransaction([],[]);
            break;
        case "SubscribeTransaction":
            newTrans = new SubscribeTransaction();
            break;
        case "UserSigninTransaction":
            newTrans = new UserSigninTransaction();
            break;
        case "UserSignoutTransaction":
            newTrans = new UserSignoutTransaction();
            break;
        case "ViewTransaction":
            newTrans = new ViewTransaction();
            break;
        case "UpdateTransaction":
            newTrans = new UpdateTransaction();
            break;
        case "CheckPreviewAvailabilityTransaction":
            newTrans = new ContentPreviewAvailabilityTransaction();
            break;
        case "PreviewTransaction":
            newTrans = new PreviewContentTransaction();
            break;
        case "FolioSectionListUpdateTransaction":
            newTrans = new FolioSectionListUpdateTransaction();
            break;
        case "FolioInfoTransaction":
            newTrans = new FolioInfoTransaction();
            break;
        default:
            Log.instance.info("TransactionManager received unknown Transaction: " + vo.type);
            break;
    }
    
    if (newTrans !== null) {
        newTrans._updateFromJSON(vo);
    }
    
    return newTrans;
};

/**
 * Update the Transaction Manager with a JSON update from native.
 * @memberOf adobeDPS-TransactionManager.prototype
 */
TransactionManager.prototype._update = function (data) {
    var list, changeList, i, transaction, update, end, id;
    if (data.hasOwnProperty("add")) {
        list = data.add;
        changeList = [];
        for (i = 0; i < list.length; i++) {
            transaction = this._transactionVOProcess(list[i]);
            
            if (transaction !== null) {
                this._registerTransaction(transaction);
                changeList.push(transaction);
            }
        }
        
        if (changeList.length > 0) {
            this.newTransactionsAvailableSignal.dispatch(changeList);
            Log.instance.debug("TransactionManager._update added " + changeList.length + " transactions");
        } else {
            Log.instance.warn("TransactionManager._update (add) called with add that didn't add any transactions");
        }
    } else if (data.hasOwnProperty("remove")) {
        id = data.remove;
        
        transaction = this._allTransactions[id];
        
        if (transaction) {
            transaction.completedSignal.dispatch(transaction);
            Log.instance.debug("TransactionManager._update removed " + transaction.id);
        } else {
            Log.instance.warn('TransactionManager._update (remove) called with unknown Transaction: ' + id);
        }
    } else if (data.hasOwnProperty("update") && data.path.indexOf("_allTransactions") > -1) {
        update = data.update;
        end = data.path.indexOf("']");
        // 18 is the number of characters in _allTransactions plus the [' before the id
        id = data.path.substring(18,end);
        transaction = this._allTransactions[id];
        
        if (transaction) {
            transaction._updateFromJSON(update);
        } else {
            Log.instance.warn('TransactionManager._update called with unknown Transaction: ' + id);
        }
    } else {
        Log.instance.warn("TransactionManager._update (update) cannot parse update: " + JSON.stringify(data));
    }
};

/**
 * Initialize the Transaction Manager with a JSON update from native.
 * @memberOf adobeDPS-TransactionManager.prototype
 */
TransactionManager.prototype._initialize = function (data) {
    var update, changesList, i, vo, transaction;
    if (data.hasOwnProperty("update")) {
        update = data.update;
        
        if (update.hasOwnProperty("_allTransactions")) {
            changesList = [];
            for (i = 0; i < update._allTransactions.length; i++) {
                vo = update._allTransactions[i];
                transaction = this._transactionVOProcess(vo);
                
                if (transaction !== null) {
                    changesList.push(transaction);
                    this._registerTransaction(transaction, true);
                }
            }
            
            if (changesList.length > 0) {
                Log.instance.debug("TransactionManager._initialize registered " + changesList.length + " new Transactions");
                this.newTransactionsAvailableSignal.dispatch(changesList);
            }
        }
    } else {
        Log.instance.warn("TransactionManager._initialize called without update");
    }
};

/**
 * The singleton of the TransactionManager.
 * @static
 * @name instance
 * @memberOf adobeDPS-TransactionManager
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
TransactionManager.instance = new TransactionManager();

    /**
 * Enum for the state of the Folio.
 * @see adobeDPS-Folio#state
 * @namespace
 * @enum {Number}
 * @platform iOS
 * @platform Android
 */
var FolioState = {
    /** 
     * <strong>Value: 0</strong>
     * <br/>Indicates an internal or server error. Typically, this indicates that the Folio is not configured correctly. 
     * @platform iOS
     * @platform Android
     */
    INVALID: 0,
    /** 
     * <strong>Value: 50</strong>
     * <br/>Folio is not available from the broker. It still may be available via direct entitlement when the user authenticates.
     * @platform iOS
     * @platform Android
     */
    UNAVAILABLE: 50,
    /** 
     * <strong>Value: 100</strong>
     * <br/> Folio is ready to be purchased. 
     * @platform iOS
     * @platform Android
     */
    PURCHASABLE: 100,
    /** 
     * <strong>Value: 101</strong>
     * <br/> Folio is currently being purchased. 
     * @platform iOS
     * @platform Android
     */
    PURCHASING: 101,
    /** 
     * <strong>Value: 200</strong>
     * <br/> Folio is entitled but not downloaded. 
     * @platform iOS
     * @platform Android
     */
    ENTITLED: 200,
    /** 
     * <strong>Value: 201</strong>
     * <br/> Folio is currently being downloaded. 
     * @platform iOS
     * @platform Android
     */
    DOWNLOADING: 201,
    /** 
     * <strong>Value: 400</strong>
     * <br/> Folio will soon be extracted. 
     * <br/><em>NOTE: This state will only occur momentarily, if at all. It will not occur if progressive download is enabled.</em> 
     * @platform iOS
     * @platform Android
     */
    EXTRACTABLE: 400,
    /** 
     * <strong>Value: 401</strong>
     * <br/> Folio is currently be extracted. 
     * <br/><em>NOTE: You will never see this state if progressive download is enabled.</em> 
     * @platform iOS
     * @platform Android
     */
    EXTRACTING: 401,
    /** 
     * <strong>Value: 1000</strong>
     * <br/> Folio is finished installing and is complete. 
     * @platform iOS
     * @platform Android
     */
    INSTALLED: 1000
};

/**
 * Enum for the content preview state of the Folio.
 * @see adobeDPS-Folio#contentPreviewState
 * @namespace
 * @enum {Number}
 * @platform iOS
 */
var FolioContentPreviewState = {
    /**
     * <strong>Value: 0</strong>
     * <br/>Indicates preview content availability information has not been requested.
     * @platform iOS
     */
    NOT_REQUESTED: 0,
    /**
     * <strong>Value: 1</strong>
     * <br/>Indicates preview content availability information is being requested.
     * @platform iOS
     */
    REQUESTED: 1,
    /**
     * <strong>Value: 2</strong>
     * <br/> Indicates the folio is not previewable.
     * @platform iOS
     */
    UNAVAILABLE: 2,
    /**
     * <strong>Value: 3</strong>
     * <br/> Indicates the folio can be previewed.
     * @platform iOS
     */
    AVAILABLE: 3,
    /**
     * <strong>Value: 4</strong>
     * <br/> Indicates the folio is not previewable because this feature is not enabled for this account.
     * @platform iOS
     */
    DISABLED: 4
};

/**
 * Creates an instance of a BaseFolio.
 *
 * @class Representation of a BaseFolio object.
 * @extends adobeDPS-Class
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
function BaseFolio() {
    
    /**
     * Signal to indicate that this BaseFolio has been updated. It will pass an
     * array of Strings containing the names of the properties that have been
     * updated.
     * <br/><em>Callback Signature: updatedHandler([String, ...])</em>
     * @memberOf adobeDPS-BaseFolio.prototype
     * @type adobeDPS-Signal
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.updatedSignal = new Signal();
    
    /**
     * The Unique id of this BaseFolio.
     * @memberOf adobeDPS-BaseFolio.prototype
     * @type String
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.id = null;
    
    /**
     * The current transactions acting on this BaseFolio. This will be an array of
     * {@link adobeDPS-FolioTransactions}. Only one of these {@link adobeDPS-Transactions}
     * may be a {@link adobeDPS-FolioStateChangingTransaction}, but this may consist of
     * multiple {@link adobeDPS-FolioTransactions}.
     * @memberOf adobeDPS-BaseFolio.prototype
     * @type Array
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.currentTransactions = [];
    
    /**
     * The size of this BaseFolio in Bytes. This value will not be available until the download process actually
      * begins.
     * @memberOf adobeDPS-BaseFolio.prototype
     * @type Number
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.downloadSize = null;
    
    /**
     * The State of this BaseFolio.
     * @memberOf adobeDPS-BaseFolio.prototype
     * @default adobeDPS-FolioState.INVALID
     * @type adobeDPS-FolioState
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.state = FolioState.INVALID;
    
    /**
     * The local file URL of the preview image for this BaseFolio.
     * @memberOf adobeDPS-BaseFolio.prototype
     * @type String
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.previewImageURL = null;
    
    /**
     * The title of this BaseFolio. This will be exact value that is entered at publish time.
     * @memberOf adobeDPS-BaseFolio.prototype
     * @type String
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.title = null;
    
    /**
     * This indicates whether this BaseFolio is compatible with this version of the viewer.
     * @memberOf adobeDPS-BaseFolio.prototype
     * @type Boolean
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.isCompatible = false;
    
    /** 
     * Whether the BaseFolio is currently able to be downloaded. When this is true, calling
     * download will cause the BaseFolio to begin downloading. This property should always be
     * used to determine whether {@link adobeDPS-BaseFolio#download} may be called.
     * @memberOf adobeDPS-BaseFolio.prototype
     * @type Boolean
     * @platform iOS
     * @platform Android
     * @platform Windows
     */ 
    this.isDownloadable = false;
    
    /**
     * Whether the BaseFolio is currently able to be viewed. When this is true, calling view
     * will cause the baseFolio to begin viewing. This property may change to true during a
     * download if the device supports progressive-download or it may not be true until the
     * baseFolio has been completely installed. In either case, this property should always be
     * used to determine whether {@link adobeDPS-BaseFolio#view} may be called.
     * @memberOf adobeDPS-BaseFolio.prototype
     * @type Boolean
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.isViewable = false;
    
    /**
     * Whether the BaseFolio is currently able to be archived. This is provided since it is
     * not always apparent when a BaseFolio may be archived. This property should be used
     * (as opposed to the baseFolio state) to determine whether {@link adobeDPS-BaseFolio#archive}
     * may be called.
     * @memberOf adobeDPS-BaseFolio.prototype
     * @type Boolean
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.isArchivable = false;
    
    /**
     * This indicates whether this BaseFolio is currently updatable. When this is true, you
     * may call {@link adobeDPS-BaseFolio#update} to update this baseFolio.
     * @memberOf adobeDPS-BaseFolio.prototype
     * @type Boolean
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.isUpdatable = false;
}

Service.extend(BaseFolio);

/**
 * Start a download transaction on this BaseFolio. Requires that {@link adobeDPS-BaseFolio#isDownloadable} be true.
 * @memberOf adobeDPS-BaseFolio.prototype
 * @returns {adobeDPS-DownloadTransaction} The started download transaction
 * @throws {Error} If the BaseFolio is in the wrong state or has another active transaction
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
BaseFolio.prototype.download = function () {
    if (!this.isDownloadable) {
        throw new Error('Attempting to download a baseFolio that is not downloadable');
    }

    if(!this.isCompatible) {
        throw new Error('Attempting to download an incompatible baseFolio.');
    }
    
    var trans = new DownloadTransaction(this);
    if (trans) {
        TransactionManager.instance._registerTransaction(trans);
        Log.instance.debug("Starting new DownloadTransaction on " + this.id);
        
        try {
            return trans.start();
        } catch (e) {
            // remove the transaction
            delete TransactionManager.instance._allTransactions[trans.id];
            
            // propagate error
            throw e;
        }
    } else {
        // This shouldn't happen since we would expect the constructor to throw if it
        // if it isn't going to return, but just in case...
        throw new Error('There was a problem creating the DownloadTransaction.');
    }
};

/**
 * Start a view transaction on this BaseFolio. Requires that {@link adobeDPS-BaseFolio#isViewable}
 * be true.
 * @memberOf adobeDPS-BaseFolio.prototype
 * @returns {adobeDPS-ViewTransaction} The started view transaction
 * @throws {Error} If {@link adobeDPS-BaseFolio#isViewable} is false.
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
BaseFolio.prototype.view = function () {
    if (!this.isViewable) {
        throw new Error('Attempting to view a baseFolio that is not viewable! You must check isViewable before attempting to view a baseFolio.');
    }

    if(!this.isCompatible) {
        throw new Error('Attempting to view an incompatible baseFolio.');
    }
    
    var trans = new ViewTransaction(this);
    if (trans) {
        TransactionManager.instance._registerTransaction(trans);
        Log.instance.debug("Starting new ViewTransaction on " + this.id);
        
        try {
            return trans.start();
        } catch (e) {
            // remove the transaction
            delete TransactionManager.instance._allTransactions[trans.id];
            
            // propagate error
            throw e;
        }
    } else {
        // This shouldn't happen since we would expect the constructor to throw if it
        // if it isn't going to return, but just in case...
        throw new Error('There was a problem creating the ViewTransaction.');
    }
};

/**
 * Start a preview image transaction on this BaseFolio.
 * @memberOf adobeDPS-BaseFolio.prototype
 * @param {Number} width The requested width of the preview image
 * @param {Number} height The requested height of the preview image
 * @returns {adobeDPS-PreviewImageTransaction} The started preview image transaction
 * @throws {Error} If the BaseFolio has another active transaction
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
BaseFolio.prototype.getPreviewImage = function (width, height, isPortrait) {
    var trans = new PreviewImageTransaction(this, isPortrait, width, height);
    if (trans) {
        TransactionManager.instance._registerTransaction(trans);
        Log.instance.debug("Starting new PreviewImageTransaction on " + this.id);
        
        try {
            return trans.start();
        } catch (e) {
            // remove the transaction
            delete TransactionManager.instance._allTransactions[trans.id];
            
            // propagate error
            throw e;
        }
    } else {
        // This shouldn't happen since we would expect the constructor to throw if it
        // if it isn't going to return, but just in case...
        throw new Error('There was a problem creating the PreviewImageTransaction.');
    }
};

/**
 * Helper method to discover the current state changing transaction on a BaseFolio (if any)
 * @memberOf adobeDPS-BaseFolio.prototype
 * @returns {adobeDPS-Transaction} The current state changing transaction
 * @platform iOS
 * @platform Android
 */
BaseFolio.prototype.currentStateChangingTransaction = function () {
    var i, transaction;
    for (i = 0; i < this.currentTransactions.length; i++) {
        transaction = this.currentTransactions[i];
        if (transaction instanceof FolioStateChangingTransaction) {
            return transaction;
        }
    }
    return null;
}

/**
 * Update this item with a JSON update from native.
 * @memberOf adobeDPS-BaseFolio.prototype
 */
BaseFolio.prototype._update = function(data) {
    if(data.hasOwnProperty("update")) {
        this._updateFromJSON(data.update);
    } else {
        Log.instance.warn("BaseFolio._update (" + this.id + ") cannot parse update: " + data);
    }
};

/**
 * Update this baseFolio object using a JSON message. This method should be called when the
 * BaseFolio needs to be updated due to a model change on the native side.
 * @memberOf adobeDPS-BaseFolio.prototype
 * @param {String} json The JSON message to process for updates
 */
BaseFolio.prototype._updateFromJSON = function (json) {
    // The property should map directly, so just update based
    // on the json property name.
    var prop, update, changes = [];
    for (prop in json) {
        if (prop in this) {
            update = this._processPropertyUpdate(json[prop], prop);
            if (this[prop] != update) {
                this[prop] = update;
                changes.push(prop);
            }
        } else {
            Log.instance.warn("Found invalid property in baseFolio update: " + prop + '-' + json[prop]);
        }
    }
    
    if (changes.length > 0) {
        this.updatedSignal.dispatch(changes);
    }
};

/**
 * This is a simple function to convert certain types of incoming update into complex
 * objects. I.E. the currentTransaction will be converted from an ID into a Transaction.
 * @memberOf adobeDPS-BaseFolio.prototype
 * @param {*} newValue The new value to be assigned to the property
 * @param {String} prop The name of the property that is being updated
 * @returns {*} The value to be assigned to the property
 */
BaseFolio.prototype._processPropertyUpdate = function (newValue, prop) {
    var _arr = [], numTrans, trans, i;
    switch (prop) {
        case "currentTransactions":
            _arr = [];
            numTrans = newValue.length;
            for (i = 0; i < numTrans; i++) {
                trans = TransactionManager.instance._allTransactions[newValue[i]];
                // If we have the trans, update the transaction as well
                if (trans && trans.folio !== this) {
                    trans.folio = this;
                }
                
                if (trans) {
                    _arr.push(trans);
                }
            }
            return _arr;
        default:
            return newValue;
    }
};

/**
 * Create a new BaseFolio from a JSON update. This is used when new Folios are added via a
 * a native call from the bridge.
 * @memberOf adobeDPS-BaseFolio.prototype
 * @param {String} json The JSON that represents the new BaseFolio
 * @returns {adobeDPS-BaseFolio} The new baseFolio created from the JSON
 */
BaseFolio._fromJSON = function (json) {
    var newFolio = new BaseFolio();
    newFolio._updateFromJSON(json);
    return newFolio;
};

    /**
 * Creates an instance of a Folio.
 *
 * @class Representation of a Folio object.
 * @extends adobeDPS-BaseFolio
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
function Folio() {

    BaseFolio.call(this);
    /**
     * The id used to identify this Folio to the broker.
     * @memberOf adobeDPS-Folio.prototype
     * @type String
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.productId = null;
    
    /**
     * The folioNumber field of this Folio. This will be the exact value that is
     * entered at publish time.
     * @memberOf adobeDPS-Folio.prototype
     * @type String
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.folioNumber = null;
    
    /**
     * The date this Folio was published.
     * @memberOf adobeDPS-Folio.prototype
     * @type Date
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.publicationDate = null;

    /**
     * The description field of this Folio. This will be the exact value that is
     * entered at publish time.
     * @memberOf adobeDPS-Folio.prototype
     * @type String
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.folioDescription = null;
    
    /**
     * The description field of this Folio. If the folio is free it is the same as the
     * {@link adobeDPS-Folio#folioDescription}. On iOS, if the folio is retail, it is the description provided
     * to the broker.
     * @memberOf adobeDPS-Folio.prototype
     * @type String
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.description = null;

    /**
     * The localized price of this Folio. This value is a string that is already localized
     * and contains the currency symbol. 
     * @memberOf adobeDPS-Folio.prototype
     * @type String
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.price = null;
    
    /**
     * The broker currently associated with this Folio.
     * @memberOf adobeDPS-Folio.prototype
     * @type String
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.broker = null;
    
    /**
     * The filter field of this Folio. This will be the exact value that is entered at publish time.
     * @memberOf adobeDPS-Folio.prototype
     * @type String
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.filter = null;
    
    /**
     * Indicates whether this Folio is entitled by an entitlement server.
     * @memberOf adobeDPS-Folio.prototype
     * @type Boolean
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.isThirdPartyEntitled = false;
    
    /**
     * The target device dimensions of this Folio.
     * @memberOf adobeDPS-Folio.prototype
     * @type String
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.targetDimensions = null;

    /**
     * If a folio can be purchased
     * @memberOf adobeDPS-Folio.prototype
     * @type Boolean
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.isPurchasable = false;

    /**
     * If a folio has free articles that can be downloaded
     * without any folio entitlement. Will always be false unless
     * verifyContentPreviewSupported is called.
     * @memberOf adobeDPS-Folio.prototype
     * @type Boolean
     * @platform iOS
     * @platform Windows
     */
    this.supportsContentPreview = false;
    
    /**
     * The receipt associated with this Folio.
     * @memberOf adobeDPS-Folio.prototype
     * @type adobeDPS-Receipt
     * @platform iOS
     * @platform Windows
     */
    this.receipt = null;

    /**
     * The EntitlementType of this Folio.
     * @memberOf adobeDPS-Folio.prototype
     * @default adobeDPS-EntitlementType.UNKNOWN
     * @type adobeDPS-EntitlementType
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.entitlementType = EntitlementType.UNKNOWN;
    
    /**
     * This indicates whether this folio has sections.
     * @memberOf adobeDPS-Folio.prototype
     * @type Boolean
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.hasSections = false;

    /**
     * The FolioContentPreviewState of this Folio.
     * @memberOf adobeDPS-Folio.prototype
     * @default adobeDPS-FolioContentPreviewState.NOT_REQUESTED
     * @type adobeDPS-FolioContentPreviewState
     * @platform iOS
     * @platform Windows
     */
    this.contentPreviewState = FolioContentPreviewState.NOT_REQUESTED;
    
    /**
     * Object containing the map of sections of a folio indexed by {@link adobeDPS-BaseFolio#id}
     * @memberOf adobeDPS-Folio.prototype
     * @type adobeDPS-DocumentMap
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.sections = new DocumentMap();
}

BaseFolio.extend(Folio);

/**
 * Start a ContentPreviewAvailabilityTransaction on this Folio.
 * @memberOf adobeDPS-Folio.prototype
 * @returns {adobeDPS-ContentPreviewAvailabilityTransaction} A new started transaction or the
 * existing transaction if the folio has a ContentPreviewAvailabilityTransaction acting on it.
 * @throws {Error} If the transaction could not be created or started
 * @platform iOS
 * @platform Android
 */
Folio.prototype.verifyContentPreviewSupported = function () {
    var i, transaction;

    for (i = 0; i < this.currentTransactions.length; i++) {
        transaction = this.currentTransactions[i];
        if (transaction instanceof ContentPreviewAvailabilityTransaction) {
            return transaction;
        }
    }

    var trans = new ContentPreviewAvailabilityTransaction(this);
    if (trans) {
        TransactionManager.instance._registerTransaction(trans);
        Log.instance.debug("Starting new ContentPreviewAvailabilityTransaction on " + this.id);

        try {
            return trans.start();
        } catch (e) {
            // remove the transaction
            delete TransactionManager.instance._allTransactions[trans.id];

            // propagate error
            throw e;
        }
    } else {
        // This shouldn't happen since we would expect the constructor to throw if it
        // if it isn't going to return, but just in case...
        throw new Error('There was a problem creating the ContentPreviewAvailabilityTransaction.');
    }
}

/**
 * Whether a {adobeDPS-PreviewContentTransaction} can be started on this folio.
 * @memberOf adobeDPS-Folio.prototype
 * @returns {Boolean} True if the Folio can be Preview Downloaded
 * @platform iOS
 */
Folio.prototype.canDownloadContentPreview = function () {
    return this.supportsContentPreview &&
        !this.hasSections &&
        this.isPurchasable &&
        this.isCompatible &&
        !this.isArchivable &&
        (this.currentStateChangingTransaction() == null);
}

/**
 * Start a PreviewContentTransaction on this Folio. Requires that {@link adobeDPS-Folio#canDownloadContentPreview()}
 * be true.
 * @memberOf adobeDPS-Folio.prototype
 * @returns {adobeDPS-PreviewContentTransaction} The started preview transaction
 * @throws {Error} If {@link adobeDPS-Folio#canDownloadContentPreview()} is false.
 * @platform iOS
 */
Folio.prototype.downloadContentPreview = function () {
    if (!this.canDownloadContentPreview()) {
        throw new Error('Attempting to preview a Folio that cannot be previewed! You must check canDownloadContentPreview()' +
            ' before attempting to preview a Folio.');
    }

    var trans = new PreviewContentTransaction(this);
    if (trans) {
        TransactionManager.instance._registerTransaction(trans);
        Log.instance.debug("Starting new PreviewContentTransaction on " + this.id);

        try {
            return trans.start();
        } catch (e) {
            // remove the transaction
            delete TransactionManager.instance._allTransactions[trans.id];

            // propagate error
            throw e;
        }
    } else {
        // This shouldn't happen since we would expect the constructor to throw if it
        // if it isn't going to return, but just in case...
        throw new Error('There was a problem creating the PreviewContentTransaction.');
    }
};

/**
 * Start a purchase transaction on this Folio. Requires that {@link adobeDPS-Folio#isPurchasable}
 * be true.
 * @memberOf adobeDPS-Folio.prototype
 * @returns {adobeDPS-PurchaseTransaction} The started purchase transaction
 * @throws {Error} If {@link adobeDPS-Folio#isPurchasable} is false or has another active transaction
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
Folio.prototype.purchase = function () {
    if (!this.isPurchasable) {
        throw new Error('Attempting to purchase a folio that is not purchasable');
    }

    if(!this.isCompatible) {
        throw new Error('Attempting to purchase an incompatible folio.');
    }

    var trans = new PurchaseTransaction(this);
    if (trans) {
        TransactionManager.instance._registerTransaction(trans);
        Log.instance.debug("Starting new PurchaseTransaction on " + this.id);
        
        try {
            return trans.start();
        } catch (e) {
            // remove the transaction
            delete TransactionManager.instance._allTransactions[trans.id];
            
            // propagate error
            throw e;
        }
    } else {
        // This shouldn't happen since we would expect the constructor to throw if it
        // if it isn't going to return, but just in case...
        throw new Error('There was a problem creating the PurchaseTransaction.');
    }
};

/**
 * Determine whether this Folio is free. Returns true if the folio is free.
 * @memberOf adobeDPS-Folio.prototype
 * @returns {Boolean} Whether the Folio is free
 * @platform iOS
 * @platform Android
 */
Folio.prototype.isFree = function () {
    return (this.broker == "noChargeStore");
};

/**
 * Start an update transaction on this Folio. Requires that {@link adobeDPS-BaseFolio#isUpdatable}
 * be true.
 * @memberOf adobeDPS-Folio.prototype
 * @returns {adobeDPS-UpdateTransaction} The started update transaction
 * @throws {Error} If {@link adobeDPS-Folio#isUpdatable} is false.
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
Folio.prototype.update = function () {
    if (!this.isUpdatable) {
        throw new Error('Attempting to update a Folio that is not updatable! You must check isUpdatable before attempting to update a Folio.');
    }

    if(!this.isCompatible) {
        throw new Error('Attempting to update an incompatible Folio.');
    }

    var trans = new UpdateTransaction(this);
    if (trans) {
        TransactionManager.instance._registerTransaction(trans);
        Log.instance.debug("Starting new UpdateTransaction on " + this.id);

        try {
            return trans.start();
        } catch (e) {
            // remove the transaction
            delete TransactionManager.instance._allTransactions[trans.id];

            // propagate error
            throw e;
        }
    } else {
        // This shouldn't happen since we would expect the constructor to throw if it
        // if it isn't going to return, but just in case...
        throw new Error('There was a problem creating the UpdateTransaction.');
    }
};

/**
 * Start an archive transaction on this Folio. Requires that {@link adobeDPS-Folio#isViewable} be true.
 * @memberOf adobeDPS-Folio.prototype
 * @returns {adobeDPS-ArchiveTransaction} The started archive transaction
 * @throws {Error} If the Folio is in the wrong state or has another active transaction
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
Folio.prototype.archive = function () {
    if (!this.isArchivable) {
        throw new Error('Attempting to archive a Folio that is not archivable! You must always check isArchivable before attempting to archive a Folio.');
    }

    if(!this.isCompatible) {
        throw new Error('Attempting to archive an incompatible Folio.');
    }

    var trans = new ArchiveTransaction(this);
    if (trans) {
        TransactionManager.instance._registerTransaction(trans);
        Log.instance.debug("Starting new ArchiveTransaction on " + this.id);

        try {
            return trans.start();
        } catch (e) {
            // remove the transaction
            delete TransactionManager.instance._allTransactions[trans.id];

            // propagate error
            throw e;
        }
    } else {
        // This shouldn't happen since we would expect the constructor to throw if it
        // if it isn't going to return, but just in case...
        throw new Error('There was a problem creating the ArchiveTransaction.');
    }
};

/**
 * Start a FolioSectionsList transaction on this Folio. Requires that hasSections on the Folio
 * be true.
 * @memberOf adobeDPS-Folio.prototype
 * @returns {adobeDPS-FolioSectionListUpdateTransaction} The started sectionsList transaction
 * @throws {Error} If the folio does not have sections
 * @platform iOS
 * @platform Android
 */
Folio.prototype.getSections = function () {
    if (!this.hasSections) {
        throw new Error('Attempting to get sections on a folio that does not have sections');
    }

    var trans = new FolioSectionListUpdateTransaction(this);
    if (trans) {
        TransactionManager.instance._registerTransaction(trans);
        Log.instance.debug("Starting new FolioSectionListUpdateTransaction on " + this.id);
        
        try {
            return trans.start();
        } catch (e) {
            // remove the transaction
            delete TransactionManager.instance._allTransactions[trans.id];
            
            // propagate error
            throw e;
        }
    } else {
        // This shouldn't happen since we would expect the constructor to throw if it
        // if it isn't going to return, but just in case...
        throw new Error('There was a problem creating the FolioSectionListUpdateTransaction.');
    }
};

/**
 * This is a simple function to convert certain types of incoming update into complex
 * objects. I.E. the currentTransaction will be converted from an ID into a Transaction.
 * @memberOf adobeDPS-Folio.prototype
 * @param {*} newValue The new value to be assigned to the property
 * @param {String} prop The name of the property that is being updated
 * @returns {*} The value to be assigned to the property
 */
Folio.prototype._processPropertyUpdate = function (newValue, prop) {
    var i, sectionVO, section;
    switch (prop) {
        case "publicationDate":
            return new Date(parseInt(newValue, 10));
        case "sections":
            for (i = 0; i < newValue.length; i++) {
                sectionVO = newValue[i];
                if (sectionVO.type == "Section") {
                    // Don't pass the type since it is implied
                    delete sectionVO.type;
                    section =  Section._fromJSON(sectionVO);
                    section.parentFolio = this;
                    this.sections.internal[sectionVO.id] = section;
                }
            }
            return this.sections;
        default:
            // call the super class
            return BaseFolio.prototype._processPropertyUpdate.call(this, newValue, prop);
    }
};

/**
 * Update this item with a JSON update from native.
 * @memberOf adobeDPS-Folio.prototype
 */
Folio.prototype._update = function(data) {
    var list, changesList, sectionVO, section, i, path, idEndIndex, sectionId;

    // First lets check if this update is intended for a section
    path = this._getNextPathElement(data.path);
    if(path.indexOf("sections") > -1) {
        idEndIndex = path.indexOf("']");
        // 10 is the number of characters in sections plus the [' before the id
        sectionId = path.substring(10,idEndIndex);
        section = this.sections.internal[sectionId];

        if(section) {
            // Pass it on
            data.path = this._getChildPath(data.path);
            section._update(data);
            return;
        }
    }

    if(data.hasOwnProperty("update")) {
        this._updateFromJSON(data.update);
    } else if(data.hasOwnProperty("add")) {
        list = data.add;
        changesList = [];
        for (i = 0; i < list.length; i++) {
            sectionVO = list[i];
            section = null;
            if (sectionVO.type == "Section") {
                // Don't pass the type since it is implied
                delete sectionVO.type;
                section = Section._fromJSON(sectionVO);
            } else {
                Log.instance.warn("Folio._update (" + this.id + ") called with an invalid typed add: " + sectionVO.type);
            }

            if (section !== null) {
                section.parentFolio = this;
                this.sections.internal[sectionVO.id] = section;
                changesList.push(section);
            } else {
                Log.instance.warn("Folio._update (" + this.id + ") failed to parse added folio: " + folioVO.id);
            }
        }

        if (changesList.length > 0) {
            this.sections.addedSignal.dispatch(changesList);
            Log.instance.debug("Folio._update (" + this.id + ") added " + changesList.length + " sections");
        } else {
            Log.instance.warn("Folio._update (" + this.id + ") called with add that didn't add any sections");
        }
    } else if(data.hasOwnProperty("remove")) {
        list = data.remove;
        changesList = [];
        for (i = 0; i < list.length; i++) {
            section = this.sections.internal[list[i]];

            if(section !== null) {
                delete this.sections.internal[section.id];
                changesList.push(section);
            } else {
                Log.instance.warn("Folio._update (" + this.id + ") failed to parse removed section: " + list[i]);
            }
        }

        if (changesList.length > 0) {
            this.sections.removedSignal.dispatch(changesList);
            Log.instance.debug("Folio (" + this.id + ") removed " + changesList.length + " sections");
        } else {
            Log.instance.warn("Folio._update (" + this.id + ") called with remove that didn't remove any sections");
        }
    } else {
        Log.instance.warn("Folio._update (" + this.id + ") cannot parse update: " + data);
    }
};


/**
 * Create a new Folio from a JSON update. This is used when new Folios are added via a
 * a native call from the bridge.
 * @memberOf adobeDPS-Folio.prototype
 * @param {String} json The JSON that represents the new Folio
 * @returns {adobeDPS-Folio} The new folio created from the JSON
 */
Folio._fromJSON = function (json) {
    var newFolio = new Folio();
    newFolio._updateFromJSON(json);
    return newFolio;
};

    
/**
 * Creates an instance of a Section.
 *
 * @class Representation of a Section object.
 * @extends adobeDPS-BaseFolio
 * @platform iOS
 */
function Section() {
    BaseFolio.call(this);
    
    /**
     * The designated parent Folio of this section.
     * @memberOf adobeDPS-Section.prototype
     * @type Boolean
     * @platform iOS
     */
    this.parentFolio = null;
    
    /**
     * Indicates whether this Section is at the head of the download queue.
     * @memberOf adobeDPS-Section.prototype
     * @type Boolean
     * @platform iOS
     */
    this.isAtHeadOfDownloadQueue = false;
    
    /**
     * The index of this section in native sections array.
     * @memberOf adobeDPS-Section.prototype
     * @type Number
     * @platform iOS
     */
    this.index = 0;
}

BaseFolio.extend(Section);

/**
 * Create a new Section from a JSON update. This is used when new Sections are added via a
 * a native call from the bridge.
 * @memberOf adobeDPS-Section.prototype
 * @param {String} json The JSON that represents the new Section
 * @returns {adobeDPS-Section} The new Section created from the JSON
 */
Section._fromJSON = function (json) {
    var newSection = new Section();
    newSection._updateFromJSON(json);
    return newSection;
};




    /**
 * Create a new map of documents by id.
 * @class A map of Documents to ids with update signals.
 * <br/><strong>Accessible from adobeDPS.libraryService.folioMap</strong>
 * @see adobeDPS-Folio
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
function DocumentMap() {
    /**
     * Signal indicating that documents have been added to internal.
     * <br/><em>Callback Signature: documentsAddedHandler([ {@link Object}, ...])</em>
     * @memberOf adobeDPS-DocumentMap.prototype
     * @type adobeDPS-Signal
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.addedSignal = new Signal();
    
    /**
     * Signal indicating that documents have been removed from internal.
     * <br/><em>Callback Signature: documentsRemovedHandler([ {@link Object}, ...])</em>
     * @memberOf adobeDPS-DocumentMap.prototype
     * @type adobeDPS-Signal
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.removedSignal = new Signal();
    
    /**
     * An associative array containing the documents, indexed by id.
     * @memberOf adobeDPS-DocumentMap.prototype
     * @type Object
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.internal = {};
}

/**
 * Function to sort the map using a sort function and return a new Array of objects.
 * @memberOf adobeDPS-DocumentMap.prototype
 * @param {function} sortFunc A function to sort the Map. This function can be any function accepted by the `Array.sort()` function.
 * @returns {Array} The sorted array of Objects
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
DocumentMap.prototype.sort = function (sortFunc) {
    var ret = [], id;
    for (id in this.internal) {
        ret.push(this.internal[id]);
    }
    
    ret.sort(sortFunc);
    
    return ret;
};

/**
 * Get a document from the list by its productId, if it has such a field. Returns `null` if a document with
 * the provided `productId` cannot be found.
 * @memberOf adobeDPS-DocumentMap.prototype
 * @param {String} productId The productId of the Folio requested.
 * @returns {Object} The Document with the requested productId or null
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
DocumentMap.prototype.getByProductId = function (productId) {
    var id, item;
    for (id in this.internal) {
        item = this.internal[id];
        if (item.productId == productId) {
            return item;
        }
    }

    Log.instance.warn("Unknown productId requested: " + productId );
    return null;
};

    /**
 * Create a new LibraryService.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class The service that maintains state information about the library.
 * <br/><strong>Accessible from adobeDPS.libraryService</strong>
 * @extends adobeDPS-Service
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
function LibraryService() {
    /**
     * Signal to indicate updates to the model not associated with the DocumentMap. This will
     * typically indicate a change in the `currentTransaction` property.
     * <br/><em>Callback Signature: updatedHandler()</em>
     * @memberOf adobeDPS-LibraryService.prototype
     * @type adobeDPS-Signal
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.updatedSignal = new Signal();
    
    /**
     * Object containing the map of folios by id
     * @memberOf adobeDPS-LibraryService.prototype
     * @type adobeDPS-DocumentMap
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.folioMap = new DocumentMap();
    
    /**
     * Folio states enum accessor.
     * <br/>This is where you should access the {@link adobeDPS-FolioState} enums from.
     * @memberOf adobeDPS-LibraryService.prototype
     * @type adobeDPS-FolioState
     * @platform iOS
     * @platform Android
     */
    this.folioStates = FolioState;

    /**
     * Folio content preview state enum accessor.
     * <br/>This is where you should access the {@link adobeDPS-FolioContentPreviewState} enums from.
     * @memberOf adobeDPS-LibraryService.prototype
     * @type adobeDPS-FolioContentPreviewState
     * @platform iOS
     */
    this.folioContentPreviewStates = FolioContentPreviewState;
    
    /**
     * The current transaction acting on the model. This is most likely a {@link adobeDPS-LibraryUpdateTransaction}.
     * @memberOf adobeDPS-LibraryService.prototype
     * @type adobeDPS-Transaction
     * @platform iOS
     * @platform Android
     */
    this.currentTransaction = null;
    
    Service.call(this);
}

Service.extend(LibraryService);

/**
 * Start a library update transaction. This may only be called if there is not already an
 * ongoing library update transaction. When the update transaction is completed, the library will be finished being
 * updated from the fulfillment server. However, this does not mean that entitlements will be updated from the
 * entitlement server. The entitlements will be updated sometime after the library update completes.
 * @memberOf adobeDPS-LibraryService.prototype
 * @returns {adobeDPS-LibraryUpdateTransaction} The started library update transaction.
 * @throws {Error} If there is already an active library update transaction.
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
LibraryService.prototype.updateLibrary = function () {
    if (this.currentTransaction !== null) {
        throw new Error('Attempting to update when Library is already being updated.');
    }

    var trans = new LibraryUpdateTransaction();
    if (trans) {
        TransactionManager.instance._registerTransaction(trans);
        Log.instance.debug("Starting new LibraryUpdateTransaction");

        try {
            return trans.start();
        } catch (e) {
            // remove the transaction
            delete TransactionManager.instance._allTransactions[trans.id];

            // propagate error
            throw e;
        }
    } else {
        // This shouldn't happen since we would expect the constructor to throw if it
        // if it isn't going to return, but just in case...
        throw new Error('There was a problem creating the LibraryUpdateTransaction.');
    }
};

/**
 * Initialize the Library Service with a JSON update from native.
 * @memberOf adobeDPS-LibraryService.prototype
 */
LibraryService.prototype._initialize = function (data) {
    var update, i, folioVO;
    if (data.hasOwnProperty("update")) {
        update = data.update;
        if (update.hasOwnProperty("folioMap")) {
            for (i = 0; i < update.folioMap.length; i++) {
                folioVO = update.folioMap[i];
                if (folioVO.type == "Folio") {
                    // Don't pass the type since it is implied
                    delete folioVO.type;
                    this.folioMap.internal[folioVO.id] = Folio._fromJSON(folioVO);
                }
            }
            Log.instance.debug("LibraryService._initialize added " + update.folioMap.length + " folios");
        } else {
            Log.instance.warn("LibraryService._initialize called without a folioMap");
        }
    } else {
        Log.instance.warn("LibraryService._initialize called without an update element");
    }
};

/**
 * Update the Library Service with a JSON update from native.
 * @memberOf adobeDPS-LibraryService.prototype
 */
LibraryService.prototype._update = function (data) {
    Log.instance.debug("LibraryService._update called: " + JSON.stringify(data));
    var list, changesList, i, folioVO, folio, idEndIndex, folioId, path;

    // First lets check if this update is intended for a folio
    path = this._getNextPathElement(data.path);
    if(path.indexOf("folioMap") > -1) {
        idEndIndex = path.indexOf("']");
        // 10 is the number of characters in folioMap plus the [' before the id
        folioId = path.substring(10,idEndIndex);
        folio = this.folioMap.internal[folioId];

        if(folio) {
            // Pass it on
            data.path = this._getChildPath(data.path);
            folio._update(data);
            return;
        }
    }

    // Since we have determined that this update was not intended for a folio, lets try to handle it
    if (data.hasOwnProperty("add")) {
        list = data.add;
        changesList = [];
        for (i = 0; i < list.length; i++) {
            folioVO = list[i];
            folio = null;
            if (folioVO.type == "Folio") {
                // Don't pass the type since it is implied
                delete folioVO.type;
                folio = Folio._fromJSON(folioVO);
            } else {
                Log.instance.warn("LibraryService._update called with an invalid typed add: " + folioVO.type);
            }

            if (folio !== null) {
                this.folioMap.internal[folioVO.id] = folio;
                changesList.push(folio);
            } else {
                Log.instance.warn("LibraryService._update failed to parse added folio: " + folioVO.id);
            }
        }
        
        if (changesList.length > 0) {
            this.folioMap.addedSignal.dispatch(changesList);
            Log.instance.debug("LibraryService._update added " + changesList.length + " folios");
        } else {
            Log.instance.warn("LibraryService._update called with add that didn't add any folios");
        }
    } else if (data.hasOwnProperty("remove")) {
        list = data.remove;
        changesList = [];
        for (i = 0; i < list.length; i++) {
            folio = this.folioMap.internal[list[i]];
            
            if(folio !== null) {
                delete this.folioMap.internal[folio.id];
                changesList.push(folio);
            } else {
                Log.instance.warn("LibraryService._update failed to parse removed folio: " + list[i]);
            }
        }
        
        if (changesList.length > 0) {
            this.folioMap.removedSignal.dispatch(changesList);
            Log.instance.debug("Removed " + changesList.length + " folios");
        } else {
            Log.instance.warn("LibraryService._update called with remove that didn't remove any folios");
        }
    } else {
        Log.instance.warn("LibraryService._update cannot parse update: " + data);
    }
};

/**
 * Start a Folio Info transaction.
 * @memberOf adobeDPS-LibraryService.prototype
 * @param {String} productId The productId of the folio to fetch information.
 * @returns {adobeDPS-FolioInfoTransaction} The started folio info transaction.
 * @throws {Error} If there is already an active folio info transaction.
 */
LibraryService.prototype._internalGetFolioInfo = function (productId) {
    
    var trans = new FolioInfoTransaction(productId);
    if (trans) {
        TransactionManager.instance._registerTransaction(trans);
        Log.instance.debug("Starting new FolioInfoTransaction");
        
        try {
            return trans.start();
        } catch (e) {
            // remove the transaction
            delete TransactionManager.instance._allTransactions[trans.id];
            
            // propagate error
            throw e;
        }
    } else {
        // This shouldn't happen since we would expect the constructor to throw error.
        // This is just in case.
        throw new Error('There was a problem creating the FolioInfoTransaction.');
    }
};

/**
 * Start a Folio Info transaction. This API will only return folio information 
 * if the 'Custom library or store manages issues' setting
 * is enabled in App Builder, otherwise it will fail with an error.
 * If this API is called using an R30 viewer or later, entitlement information
 * will always be requested remotely for the given productId.
 * <p>
 * On Android: If there is already an active folio info transaction, subsequent calls
 * to getFolioInfo will not return correct results.
 * @memberOf adobeDPS-LibraryService.prototype
 * @param {String} productId The productId of the folio to fetch information.
 * @returns {adobeDPS-FolioInfoTransaction} The started folio info transaction.
 * @throws {Error} If there is already an active folio info transaction. (iOS)
 * @platform iOS
 * @platform Android
 */
LibraryService.prototype.getFolioInfo = function (productId) {

    return this._internalGetFolioInfo(productId);
};

/**
 * Start a Folio Info transaction. This API will only return folio information 
 * if the 'Custom library or store manages issues' setting
 * is enabled in App Builder, otherwise it will fail with an error.
 * @deprecated If this API is called using an R30 viewer or later, 
 * there is no difference between this API and the getFolioInfo() API.
 * The subscriberInfo passed into this method will be ignored and will instead 
 * be populated by values found in the remote entitlement service.
 * @memberOf adobeDPS-LibraryService.prototype
 * @param {String} productId The productId of the folio to fetch information.
 * @param {Dictionary} subscriberInfo The subscriberInfo of the folio to fetch information. 
 * This parameter is optional. Current supported fields are subscriberID and subscriberType.
 * @returns {adobeDPS-FolioInfoTransaction} The started folio info transaction.
 * @throws {Error} If there is already an active folio info transaction.
 * @platform iOS
 */
LibraryService.prototype.getFolioInfoAsEntitled = function (productId, subscriberInfo) {
    
    return this.getFolioInfo(productId);
};

/**
 * The singleton of the LibraryService.
 * @static
 * @name instance
 * @memberOf adobeDPS-LibraryService
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
LibraryService.instance = new LibraryService();


    /**
 * Create a FolioTransaction
 * @class Transaction associated with a BaseFolio
 * @param {adobeDPS-BaseFolio} folio The folio that this transaction is acting on
 * @extends adobeDPS-Transaction
 * @throws {Error} If the folio passed in is invalid or not a BaseFolio
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
function FolioTransaction(folio) {
    /**
     * The BaseFolio that this transaction is acting on
     * @memberOf adobeDPS-FolioTransaction.prototype
     * @type adobeDPS-BaseFolio
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.folio = folio;
    Transaction.call(this);
    
    this.completedSignal.add(this._completedHandler, this);
}

Transaction.extend(FolioTransaction);

/**
 * Start a folio transaction. This will also result in this transaction being added to
 * the currentTransactions array of the BaseFolio associated with this transaction.
 * @override
 * @memberOf adobeDPS-FolioTransaction.prototype
 * @returns {adobeDPS-FolioTransaction} The started transaction
 * @throws {Error} If called when folio is in the wrong state
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
FolioTransaction.prototype.start = function () {
    if (this.folio.currentTransactions.indexOf(this) == -1) {
        this.folio.currentTransactions.push(this);
        this.folio.updatedSignal.dispatch(["currentTransactions"]);
    }
    
    // Call start on parent
    return Transaction.prototype.start.call(this);
};

/**
 * Callback when the transaction state change to handle association and dissociation with the BaseFolio.
 * @memberOf adobeDPS-FolioTransaction.prototype
 * @private
 * @param {adobeDPS-TransactionState} state The new state of the Transaction
 */
FolioTransaction.prototype._completedHandler = function (transaction) {
    var index;
    if (transaction.state == TransactionState.FINISHED ||
        transaction.state == TransactionState.FAILED ||
        transaction.state == TransactionState.CANCELED) {
        // Remove this transaction from the folio
        index = transaction.folio.currentTransactions.indexOf(this);
        
        if (index > -1) {
            transaction.folio.currentTransactions.splice(index, 1);
            transaction.folio.updatedSignal.dispatch(["currentTransactions"]);

            Log.instance.debug("Transaction " + this.id + " finished: " + this.state);
        }
    }
};

/**
 * Class name to use for JSON messages.
 * @memberOf adobeDPS-FolioTransaction.prototype
 * @private
 */
FolioTransaction.prototype.jsonClassName = "FolioTransaction";

/**
 * Add the associated folio's id to the JSON message to send to native.
 * @memberOf adobeDPS-FolioTransaction.prototype
 */
FolioTransaction.prototype._toJSON = function () {
    var json = Transaction.prototype._toJSON.call(this);
    json.folio = this.folio.id;
    return json;
};

/**
 * Get the folio id from the JSON message and attempt to associate the referenced folio
 * with this transaction.
 * @memberOf adobeDPS-FolioTransaction.prototype
 * @param {Object} json The JSON object to parse for updates
 */
FolioTransaction.prototype._updateFromJSON = function (json) {
    Transaction.prototype._updateFromJSON.call(this, json);

    if (json.hasOwnProperty("folio")) {
        var folio;
        if ( typeof LibraryService != "undefined") {
            folio = LibraryService.instance.folioMap.internal[json.folio];
        } else if ( typeof ReadingService != "undefined") {
            if (ReadingService.instance.currentFolio.id == json.folio) {
                folio = ReadingService.instance.currentFolio;
            }
        }

        if (folio) {
            this.folio = folio;
            //update the folio as well
            if (folio.currentTransactions.indexOf(this) == -1) {
                folio.currentTransactions.push(this);
                folio.updatedSignal.dispatch(["currentTransactions"]);
            }
        }
    }
};


    /**
 * Create a FolioStateChangingTransaction
 * @class Transaction associated with a BaseFolio that changes the state of a folio. Only one of these may be acting on a folio at any given time.
 * @param {adobeDPS-BaseFolio} folio The folio that this transaction is acting on
 * @extends adobeDPS-FolioTransaction
 * @throws {Error} If the folio passed in is invalid or not a BaseFolio
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
function FolioStateChangingTransaction(folio) {
    FolioTransaction.call(this, folio);
}

FolioTransaction.extend(FolioStateChangingTransaction);

/**
 * Class name to use for JSON messages.
 * @memberOf adobeDPS-FolioTransaction.prototype
 * @private
 */
FolioTransaction.prototype.jsonClassName = "FolioStateChangingTransaction";

/**
 * Start a folio transaction. This will also result in this transaction being added to
 * the currentTransactions array of the BaseFolio associated with this transaction.
 * @override
 * @memberOf adobeDPS-FolioStateChangingTransaction.prototype
 * @returns {adobeDPS-FolioStateChangingTransaction} The started transaction
 * @throws {Error} If called when the BaseFolio already has another FolioStateChangingTransaction acting on it.
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
FolioStateChangingTransaction.prototype.start = function () {
    var i, transaction;
    // Check to make sure that another FolioStateChangingTransaction is not acting on the folio
    for (i = 0; i < this.folio.currentTransactions.length; i++) {
        transaction = this.folio.currentTransactions[i];

        // Assume that if the other transaction is suspendable, it will be suspended before this new transaction starts
        if (transaction !== this && transaction instanceof FolioStateChangingTransaction && !transaction._isSuspendable()) {
            throw new Error('Attempting to start a FolioStateChangingTransaction on a folio that already has another FolioStateChangingTransaction acting on it: ' + transaction.id);
        }
    }
    
    // Call start on parent
    return FolioTransaction.prototype.start.call(this);
};


    /**
 * Enum for the type of entitlement.
 * @see adobeDPS-Folio#entitlementType
 * @namespace
 * @enum {Number}
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
var EntitlementType = {
    /**
     * <strong>Value: 0</strong>
     * <br/>Indicates no entitlement.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    UNKNOWN: 0,
    /**
     * <strong>Value: 1</strong>
     * <br/>Indicates free entitlement.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    FREE: 1,
    /**
     * <strong>Value: 2</strong>
     * <br/>Entitled via single in-app purchase. 
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    SINGLE: 2,
    /**
     * <strong>Value: 3</strong>
     * <br/> Entitled via subscription in-app purchase.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    SUBSCRIPTION: 3,
    /**
     * <strong>Value: 4</strong>
     * <br/> Entitled via third-party entitlement server.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    THIRD_PARTY: 4,
    /**
     * <strong>Value: 5</strong>
     * <br/> Entitled via internal entitlement service.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    PROMOTIONAL: 5
};

/**
 * Create a Receipt object.
 * @class An object that wraps a broker receipt.
 * @extends adobeDPS-Class
 * @param {String} broker The broker that this receipt is from.
 * @param {String} productId The productId that this receipt is associated with.
 * @param {String} token The receipt token, which is used to validate the receipt.
 * @platform iOS
 */
function Receipt(broker, productId, token) {
    
    /**
     * The broker that this receipt was issued by.
     * @memberOf adobeDPS-Receipt.prototype
     * @type String
     * @platform iOS
     */
    this.broker = broker;
    
    /**
     * The productId that this receipt is associated with.
     * @memberOf adobeDPS-Receipt.prototype
     * @type String
     * @platform iOS
     */
    this.productId = productId;
    
    /**
     * The validation token for this receipt.
     * @memberOf adobeDPS-Receipt.prototype
     * @type String
     * @platform iOS
     */
    this.token = token;
    
    /**
     * Whether this receipt is a subscription receipt.
     * @memberOf adobeDPS-Receipt.prototype
     * @type Boolean
     * @platform iOS
     */
    this.isSubscription = false;
}

Class.extend(Receipt);

    /**
 * Create a Subscription.
 * @class An representation of an available subscription product.
 * @param {String} productId The productId that this receipt is associated with
 * @param {String} [title] The title of this subscription
 * @param {String} [duration] The localized representation of subscription duration
 * @param {String} [price] The localized representation of the price returned by the broker
 * @param {Boolean} [isOwned=false] Whether this subscription is currently owned by the user
 * @platform iOS
 */
function Subscription(productId, title, duration, price, isOwned) {

    /**
     * Signal to indicate that this Subscription has been updated. It will pass an
     * array of Strings containing the names of the properties that have been
     * updated.
     * <br/><em>Callback Signature: updatedHandler([String, ...])</em>
     * @memberOf adobeDPS-Subscription.prototype
     * @type adobeDPS-Signal
     * @platform iOS
     */
    this.updatedSignal = new Signal();
    
    /**
     * The productId (aka SKU or Subscription SKU) of this subscription.
     * @memberOf adobeDPS-Subscription.prototype
     * @type String
     * @platform iOS
     */
    this.productId = productId;
    
    /**
     * The localized title of this subscription.
     * @memberOf adobeDPS-Subscription.prototype
     * @type String
     * @platform iOS
     */
    this.title = title;
    
    /**
     * The localized duration of this subscription.
     * @memberOf adobeDPS-Subscription.prototype
     * @type String
     * @platform iOS
     */
    this.duration = duration;
    
    /**
     * The localized price of this subscription.
     * @memberOf adobeDPS-Subscription.prototype
     * @type String
     * @platform iOS
     */
    this.price = price;
    
    /**
     * Whether this subscription is currently owned by the user.
     * @memberOf adobeDPS-Subscription.prototype
     * @type String
     * @platform iOS
     */
    this.isOwned = isOwned || false;
    
    /**
     * The latest receipt associated with this subscription.
     * @memberOf adobeDPS-Subscription.prototype
     * @type SubscriptionReceipt
     * @platform iOS
     */
    this.receipt = null;
}

Subscription.prototype.jsonClassName = "Subscription";

/**
 * Start a subscription purchase transaction on this Subscription. Requires that this 
 * `isActive()` be false.
 * @memberOf adobeDPS-Subscription.prototype
 * @returns {adobeDPS-SubscribeTransaction} The started subscription purchase transaction
 * @throws {Error} If the Subscription is currently active
 * @platform iOS
 */
Subscription.prototype.purchase = function () {
    if (this.isActive()) {
        throw new Error('Subscription ' + this.productId + ' has already been purchased.');
    }
    
    var trans = new SubscribeTransaction(this.productId);
    if (trans) {
        TransactionManager.instance._registerTransaction(trans);
        
        try {
            return trans.start();
        } catch (e) {
            // remove the transaction
            delete TransactionManager.instance._allTransactions[trans.id];
            
            // propagate error
            throw e;
        }
    } else {
        // This shouldn't happen since we would expect the constructor to throw if it
        // if it isn't going to return, but just in case...
        throw new Error('There was a problem creating the SubscribeTransaction.');
    }
};

/**
 * Tells whether this subscription `isOwned` and the subscription window covers today.
 * @memberOf adobeDPS-Subscription.prototype
 * @returns {Boolean} Whether this subscription is owned and contains today
 * @platform iOS
 */
Subscription.prototype.isActive = function () {
    //Check if we own it and it contains now
    if (this.isOwned && this.receipt.contains(new Date())) {
        return true;
    }
    
    return false;
};

/**
 * Function used to serialize this class into a JSON object to be sent over the brdige.
 * @memberOf adobeDPS-Subscription.prototype
 * @returns {Object} The JSON object to represent this transaction
 * @private
 */
Subscription.prototype._toJSON = function () {
    return {
        type: this.jsonClassName,
        productId: this.productId,
        title: this.title,
        duration: this.duration,
        price: this.price,
        isOwned: this.isOwned
    };
};

/**
 * Update this sub object using a JSON message. This method should be called when the
 * Sub needs to be updated due to a model change on the native side.
 * @memberOf adobeDPS-Subscription.prototype
 * @param {String} json The JSON message to process for updates
 * @private
 */
Subscription.prototype._updateFromJSON = function (json) {
    // The property should map directly, so just update based
    // on the json property name.
    var changes = [], prop;
    for (prop in json) {
        if (this.hasOwnProperty(prop)) {
            if (this[prop] != json[prop]) {
                this[prop] = this._processPropertyUpdate(json[prop], prop);
                changes.push(prop);
            }
        } else {
            Log.instance.warn("Found invalid property in subscription update: " + prop + '-' + json[prop]);
        }
    }
    
    if (changes.length > 0) {
        this.updatedSignal.dispatch(changes);
    }
};

/**
 * This is a simple function to convert certain types of incoming update into complex
 * objects.
 * @memberOf adobeDPS-Subscription.prototype
 * @param {*} newValue The new value to be assigned to the property
 * @param {String} prop The name of the property that is being updated
 * @returns {*} The value to be assigned to the property
 */
Subscription.prototype._processPropertyUpdate = function(newValue, prop) {
    return newValue;
};

/**
 * Create a new Subscription from a JSON update. This is used when new Subscriptions are added via a
 * a native call from the bridge.
 * @memberOf adobeDPS-Subscription.prototype
 * @param {String} json The JSON that represents the new Subscription
 * @returns {adobeDPS-Subscription} The new subscription created from the JSON
 */
Subscription._fromJSON = function (json) {
    var newSub = new Subscription();
    newSub._updateFromJSON(json);
    return newSub;
};

    /**
 * Create a new subscription receipt.
 * @class An object that wraps a broker subscription receipt.
 * @extends adobeDPS-Receipt
 * @param {String} broker The broker that this receipt is from.
 * @param {String} productId The productId that this receipt is associated with.
 * @param {String} token The receipt token, which is used to validate the receipt.
 * @param {Date} startDate The date the subscription begins
 * @param {Date} [endDate] The date the subscription expires
 * @platform iOS
 */
function SubscriptionReceipt(broker, productId, token, startDate, endDate) {
    /**
     * The date the subscription period begins
     * @memberOf adobeDPS-SubscriptionReceipt.prototype
     * @type Date
     * @platform iOS
     */
    this.startDate = startDate;
    
    /**
     * The date the subscription period ends
     * @memberOf adobeDPS-SubscriptionReceipt.prototype
     * @type Date
     * @platform iOS
     */
    this.endDate = endDate;
    
    Receipt.call(this, broker, productId, token);
    this.isSubscription = true;
}

Receipt.extend(SubscriptionReceipt);

/**
 * Whether the subscription period of this subscription receipt covers the date provided.
 * @memberOf adobeDPS-SubscriptionReceipt.prototype
 * @param {Date} date The date to check if this subscription receipt covers
 * @returns {Boolean} Whether the date is covered by this receipt
 * @platform iOS
 */
SubscriptionReceipt.prototype.contains = function (date) {
    if (date >= this.startDate && date <= this.endDate) {
        return true;
    }
    return false;
};

    /**
 * Enum for the ApplicationState types.
 * @see adobeDPS-ApplicationState#type
 * @namespace
 * @enum {String}
 * @platform iOS
 */
var ApplicationStateType = {
    /** 
     * Indicates a native application state. 
     * @platform iOS
     */
    NATIVE: "builtin",
    
    /** 
     * Indicates an HTML application state. 
     * @platform iOS
     */
    WEBVIEW: "webview"
};

/**
 * Creates an instance of the Application state class.
 * @class Representation of an Application state within the API.
 * @extends adobeDPS-Class
 * @platform iOS
 */
function ApplicationState() {
    /**
     * The file URL to the button image associated with this state.
     * @memberOf adobeDPS-ApplicationState.prototype
     * @type String
     * @platform iOS
     */
    this.buttonImage = null;

    /**
     * The file URL to the button up image associated with this state.
     * @memberOf adobeDPS-ApplicationState.prototype
     * @type String
     * @platform iOS
     */
    this.buttonUpImage = null;

    /**
     * The file URL to the button down image associated with this state.
     * @memberOf adobeDPS-ApplicationState.prototype
     * @type String
     * @platform iOS
     */
    this.buttonDownImage = null;

    /**
     * The file URL to the button disabled image associated with this state.
     * @memberOf adobeDPS-ApplicationState.prototype
     * @type String
     * @platform iOS
     */
    this.buttonDisabledImage = null;

    /**
     * The label used to identify this state.
     * @memberOf adobeDPS-ApplicationState.prototype
     * @type String
     * @platform iOS
     */
    this.label = null;
    
    /**
     * The title used for button UI.
     * @memberOf adobeDPS-ApplicationState.prototype
     * @type String
     * @platform iOS
     */
    this.buttonTitle = null;
    
    /**
     * The type of this application state.
     * @memberOf adobeDPS-ApplicationState.prototype
     * @type adobeDPS-ApplicationStateType
     * @platform iOS
     */
    this.type = null;
    
    /**
     * The orientations this view supports.
     * <br/>Supported Values:
     * <br/>landscape
     * <br/>portrait
     * <br/>both (default)
     * @memberOf adobeDPS-ApplicationState.prototype
     * @type String
     * @platform iOS
     */
    this.orientation = null;
}

Class.extend(ApplicationState);

/**
 * Create a new ApplicationState from a JSON update.
 * @memberOf adobeDPS-ApplicationState
 * @param {String} json The JSON that represents the new ApplicationState
 * @returns {adobeDPS-ApplicationState} The new state created from the JSON
 */
ApplicationState._fromJSON = function (json) {
    var newState = new ApplicationState();
    newState.buttonUpImage = json.upImage;
    newState.buttonDownImage = json.downImage;
    newState.buttonDisabledImage = json.disabledImage;
    newState.buttonImage = json.imagePath;
    newState.label = json.label;
    newState.buttonTitle = json.buttonTitle;
    newState.type = json.stateType;
    newState.orientation = json.orientation;
    return newState;
};

/**
 * Function used to go to the application state
 * @memberOf adobeDPS-ApplicationState.prototype
 * @param {String} stateLabel The label of this state
 * @platform iOS
 */
ApplicationState.prototype.gotoState = function() {
    ConfigurationService.instance.gotoState(this.label);
}



    /**
 * Create a Check Preview Download Availability Transaction
 * @class A Transaction that is used to discover the availability of a Folio preview for a specific folio.
 * @param {adobeDPS-Folio} folio The folio that this transaction is acting on
 * @extends adobeDPS-FolioTransaction
 * @throws {Error} If the folio passed in is invalid or not a Folio
 * @platform iOS
 */
function ContentPreviewAvailabilityTransaction(folio) {
    FolioTransaction.call(this, folio);
}

FolioTransaction.extend(ContentPreviewAvailabilityTransaction);

/**
 * Pull the previewAvailable value and place it on the transaction
 * @memberOf adobeDPS-ContentPreviewAvailabilityTransaction.prototype
 * @private
 */
ContentPreviewAvailabilityTransaction.prototype._updateFromJSON = function (json) {
    FolioTransaction.prototype._updateFromJSON.call(this, json);
    if (json.hasOwnProperty("previewAvailable")) {
        if (this.folio.supportsContentPreview != json.previewAvailable) {
            this.folio.supportsContentPreview = json.previewAvailable;
            this.folio.updatedSignal.dispatch(['supportsContentPreview']);
        }
    }
};

/**
 * Class name to use for JSON messages.
 * @memberOf adobeDPS-ContentPreviewAvailabilityTransaction.prototype
 * @private
 */
ContentPreviewAvailabilityTransaction.prototype.jsonClassName = "CheckPreviewAvailabilityTransaction";

    /**
 * Create an ArchiveTransaction
 * @class Transaction used to archive a BaseFolio
 * @param {adobeDPS-BaseFolio} folio The folio that this transaction is acting on
 * @extends adobeDPS-FolioStateChangingTransaction
 * @throws {Error} If the folio passed in is invalid or not a BaseFolio
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
function ArchiveTransaction(folio) {
    FolioStateChangingTransaction.call(this, folio);
}

FolioStateChangingTransaction.extend(ArchiveTransaction);

/**
 * Class name to use for JSON messages.
 * @memberOf adobeDPS-ArchiveTransaction.prototype
 * @private
 */
ArchiveTransaction.prototype.jsonClassName = "ArchiveTransaction";
    /**
 * Create a Download Transaction
 * @class A Transaction that is used to download a BaseFolio.
 * @param {adobeDPS-BaseFolio} folio The folio that this transaction is acting on
 * @extends adobeDPS-FolioStateChangingTransaction
 * @throws {Error} If the folio passed in is invalid or not a BaseFolio
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
function DownloadTransaction(folio) {
    FolioStateChangingTransaction.call(this, folio);
    
    /**
     * The current step of the download that is taking place. The step is represented by an
     * integer. Depending on the platform and the content that is being downloaded, you may
     * never see certain steps.
     * The following are possible step values:
     * 0 - Initialized
     * 1 - Downloading
     * 2 - Installing
     * @memberOf adobeDPS-DownloadTransaction.prototype
     * @type Integer
     * @platform iOS
     * @platform Android
     */
    this.step = 0;
    
    this.isPausable = true;
    this.isCancelable = true;
    this.isDeterminate = true;
    this.isFailureTerminal = false;
}

FolioStateChangingTransaction.extend(DownloadTransaction);

/**
 * Add the step to the JSON object created for native messages.
 * @memberOf adobeDPS-DownloadTransaction.prototype
 * @private
 */
DownloadTransaction.prototype._updateFromJSON = function (json) {
     // This needs to be done before updating with super because super will send an update before we have a chance to
     // update the step property. Since updating the step doesn't send it's own update, this shouldn't be a problem.
     if (json.hasOwnProperty("step")) {
        this.step = json.step;
     }

     FolioStateChangingTransaction.prototype._updateFromJSON.call(this, json);
};

/**
 * Class name to use for JSON messages.
 * @memberOf adobeDPS-DownloadTransaction.prototype
 * @private
 */
DownloadTransaction.prototype.jsonClassName = "DownloadTransaction";
    /**
 * Create a Preview Image Transaction
 * @class A Transaction that is used to download a BaseFolio Preview Image.
 * @param {adobeDPS-BaseFolio} folio The folio that this transaction is acting on
 * @param {Boolean} isPortrait Whether the preview should be portrit or landscape
 * @param {Number} width The requested width of the image
 * @param {Number} height The requested height of the image
 * @extends adobeDPS-FolioTransaction
 * @throws {Error} If the folio passed in is invalid or not a BaseFolio
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
function PreviewImageTransaction(folio, isPortrait, width, height) {
    /**
     * Whether the image requested should be portrait or landscape.
     * @memberOf adobeDPS-PreviewImageTransaction.prototype
     * @type Boolean
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.isPortrait = isPortrait;
    
    /**
     * The requested width of the preview image.
     * @memberOf adobeDPS-PreviewImageTransaction.prototype
     * @type Number
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.width = width;
    
    /**
     * The requested height of the preview image.
     * @memberOf adobeDPS-PreviewImageTransaction.prototype
     * @type Number
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.height = height;
    
    /**
     * The resulting image URL of this transaction. This property will be populated once
     * this transaction is completed successfully.
     * @memberOf adobeDPS-PreviewImageTransaction.prototype
     * @type String
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.previewImageURL = null;
    
    FolioTransaction.call(this, folio);
}

FolioTransaction.extend(PreviewImageTransaction);

/**
 * Class name to use for JSON messages.
 * @memberOf adobeDPS-PreviewImageTransaction.prototype
 * @private
 */
PreviewImageTransaction.prototype.jsonClassName = "PreviewImageTransaction";

/**
 * Add isPortrait, width and height to the JSON message to send to native.
 * @memberOf adobeDPS-PreviewImageTransaction.prototype
 * @private
 */
PreviewImageTransaction.prototype._toJSON = function () {
    var json = FolioTransaction.prototype._toJSON.call(this);
    json.isPortrait = this.isPortrait;
    json.width = this.width;
    json.height = this.height;
    return json;
};

/**
 * Get the isPortrait, width, and height from the JSON message. Also will set the result
 * variable, previewImageURL if it has been set.
 * @memberOf adobeDPS-PreviewImageTransaction.prototype
 * @param {Object} json The JSON object to parse for updates
 * @private
 */
PreviewImageTransaction.prototype._updateFromJSON = function (json) {
    FolioTransaction.prototype._updateFromJSON.call(this,json);

    if (json.hasOwnProperty("isPortrait")) {
        this.isPortait = json.isPortrait;
    }
    
    if (json.hasOwnProperty("width")) {
        this.width = json.width;
    }
    
    if (json.hasOwnProperty("height")) {
        this.height = json.height;
    }
    
    if (json.hasOwnProperty("previewImageURL")) {
        this.previewImageURL = json.previewImageURL;
    }
};
    /**
 * Create a Purchase Transaction
 * @class A Transaction that is used to purchase a Folio.
 * @param {adobeDPS-Folio} folio The folio that this transaction is acting on
 * @extends adobeDPS-FolioStateChangingTransaction
 * @throws {Error} If the folio passed in is invalid or not a Folio
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
function PurchaseTransaction(folio) {
    FolioStateChangingTransaction.call(this, folio);
}

FolioStateChangingTransaction.extend(PurchaseTransaction);

/**
 * Class name to use for JSON messages.
 * @memberOf adobeDPS-PurchaseTransaction.prototype
 * @private
 */
PurchaseTransaction.prototype.jsonClassName = "PurchaseTransaction";
    /**
 * Create a View Transaction.
 * @class A Transaction that is used to view a BaseFolio.
 * @extends adobeDPS-FolioTransaction
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
function ViewTransaction(folio) {
    FolioTransaction.call(this, folio);
}

FolioTransaction.extend(ViewTransaction);

/**
 * Class name to use for JSON messages.
 * @memberOf adobeDPS-ViewTransaction.prototype
 * @private
 */
ViewTransaction.prototype.jsonClassName = "ViewTransaction";
    /**
 * Create an Update Transaction
 * @class A Transaction that is used to update a BaseFolio.
 * @param {adobeDPS-BaseFolio} folio The folio that this transaction is acting on
 * @extends adobeDPS-FolioStateChangingTransaction
 * @throws {Error} If the folio passed in is invalid or not a BaseFolio
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
function UpdateTransaction(folio) {
    FolioStateChangingTransaction.call(this, folio);
    
    /**
     * The current step of the update that is taking place. The step is represented by an
     * integer. Depending on the platform and the content that is being downloaded, you may
     * never see certain steps.
     * <br/>The following are possible step values:
     * <br/>0 - Initialized
     * <br/>1 - Downloading
     * <br/>2 - Installing
     * @memberOf adobeDPS-UpdateTransaction.prototype
     * @type Integer
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.step = 0;
    
    this.isPausable = true;
    this.isCancelable = true;
    this.isDeterminate = true;
    this.isFailureTerminal = false;
}

FolioStateChangingTransaction.extend(UpdateTransaction);

/**
 * Add the step to the JSON object created for native messages.
 * @memberOf adobeDPS-DownloadTransaction.prototype
 * @private
 */
UpdateTransaction.prototype._updateFromJSON = function (json) {
    FolioStateChangingTransaction.prototype._updateFromJSON.call(this, json);

    if (json.hasOwnProperty("step")) {
        this.step = json.step;
    }
};

/**
 * Class name to use for JSON messages.
 * @memberOf adobeDPS-DownloadTransaction.prototype
 * @private
 */
UpdateTransaction.prototype.jsonClassName = "UpdateTransaction";
    /**
 * Create a Preview Content Transaction
 * @class A Transaction that is used to Preview Download a Folio.
 * @param {adobeDPS-Folio} folio The folio that this transaction is acting on
 * @extends adobeDPS-DownloadTransaction
 * @throws {Error} If the folio passed in is invalid or not a Folio
 * @platform iOS
 */
function PreviewContentTransaction(folio) {
    DownloadTransaction.call(this, folio);
}

DownloadTransaction.extend(PreviewContentTransaction);

/**
 * Whether this Transaction can be suspended.
 * @memberOf adobeDPS-PreviewContentTransaction.prototype
 * @returns {Boolean} If the transaction is suspendable
 * @private
 */
PreviewContentTransaction.prototype._isSuspendable = function () {
    return true;
};

/**
 * Intercept the update to see if we have failed.
 * @memberOf adobeDPS-PreviewContentTransaction.prototype
 * @private
 */
PreviewContentTransaction.prototype._updateFromJSON = function (json) {
    DownloadTransaction.prototype._updateFromJSON.call(this, json);
    if (this.error.code == TransactionErrorType.TransactionFolioNoPreviewAvailable) {
        this.folio.supportsContentPreview = false;
        adobeDPS.log.debug("Transaction failed with error:TransactionFolioNoPreviewAvailable");
        this.folio.updatedSignal.dispatch(['supportsContentPreview']);
    }
};

/**
 * Class name to use for JSON messages.
 * @memberOf adobeDPS-PreviewContentTransaction.prototype
 * @private
 */
PreviewContentTransaction.prototype.jsonClassName = "PreviewTransaction";
    /**
 * Create a Section Download Transaction
 * @class A Transaction that is used to download the list of Sections for a given Folio.
 * @param {adobeDPS-BaseFolio} folio The folio that this transaction is acting on
 * @extends adobeDPS-FolioTransaction
 * @throws {Error} If the folio passed in is invalid or not a BaseFolio
 * @platform iOS
 */
function FolioSectionListUpdateTransaction(folio) {
    FolioTransaction.call(this, folio);
}

FolioTransaction.extend(FolioSectionListUpdateTransaction);

/**
 * Class name to use for JSON messages.
 * @memberOf adobeDPS-PreviewImageTransaction.prototype
 * @private
 */
FolioSectionListUpdateTransaction.prototype.jsonClassName = "FolioSectionListUpdateTransaction";
    /**
 * Create a FolioInfo Transaction
 * @class A Transaction that is used to get folio information.
 * @param {String} productId The productId of the folio to fetch information.
 * @extends adobeDPS-Transaction
 * @platform iOS
 * @platform Android
 */
function FolioInfoTransaction(productId) {
    
    if (!productId || productId == '') {
        throw new Error('A non-empty productId has to be provided to get folio information.');
    }
    
    /**
     * The productId used to fetch folio information.
     * @memberOf adobeDPS-FolioInfoTransaction.prototype
     * @type String
     * @platform iOS
     * @platform Android
     */
    this.productId = productId;
    
    /**
     * The folios with the giving productId. This will be an array of {@link adobeDPS-Folio}.
     * @memberOf adobeDPS-FolioInfoTransaction.prototype
     * @type Array
     * @platform iOS
     * @platform Android
     */
    this.folios = [];
    
    Transaction.call(this);
}

Transaction.extend(FolioInfoTransaction);

/**
 * Class name to use for JSON messages.
 * @memberOf adobeDPS-FolioInfoTransaction.prototype
 * @private
 */
FolioInfoTransaction.prototype.jsonClassName = "FolioInfoTransaction";

/**
 * Add productId to the JSON message to send to native.
 * @memberOf adobeDPS-FolioInfoTransaction.prototype
 * @private
 */
FolioInfoTransaction.prototype._toJSON = function () {
    var json = Transaction.prototype._toJSON.call(this);
    json.productId = this.productId;
    json.folios = this.folios;
    return json;
};

/**
 * Get the folios from the JSON message.
 * @memberOf adobeDPS-FolioInfoTransaction.prototype
 * @param {Object} json The JSON object to parse for updates
 * @private
 */
FolioInfoTransaction.prototype._updateFromJSON = function (json) {
    Transaction.prototype._updateFromJSON.call(this,json);
    
    if (json.hasOwnProperty("folios")) {
        for (var i = 0; i < json.folios.length; ++i) {
            var folioUUID = json.folios[i];
            var folio = LibraryService.instance.folioMap.internal[folioUUID];
            if (folio)
            {
                this.folios.push(folio);
            }
        }
    }
};


    /**
 * Create an instance of a Setting.
 * <br />- <strong>This is an abstract constructor and shouldn't be called by regular users.</strong>
 * @class Parent class of all Settings.
 * @extends adobeDPS-Service
 * @platform iOS
 */
function Setting() {
    /**
     * Signal to indicate that this setting has been updated.
     * <br/><em>Callback Signature: updatedHandler()</em>
     * @memberOf adobeDPS-Setting.prototype
     * @type adobeDPS-Signal
     * @platform iOS
     */
    this.updatedSignal = new Signal();
}

Service.extend(Setting);
    /**
 * Create an instance of the AutoArchive class.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class Class used to control all AutoArchive Settings
 * @extends adobeDPS-Setting
 * @platform iOS
 */
function AutoArchive() {
    /**
     * Whether this feature is supported on this platform.
     * @memberOf adobeDPS-AutoArchive.prototype
     * @type Boolean
     * @platform iOS
     */
    this.isSupported = false;
    
    /**
     * Whether this feature is currently enabled.
     * @memberOf adobeDPS-AutoArchive.prototype
     * @type Boolean
     * @platform iOS
     */
    this.isEnabled = false;
    
    Setting.call(this);
}

Setting.extend(AutoArchive);

/**
 * Function used to toggle the AutoArchive function on and off. Pass true to turn it on
 * and false to turn it off.
 * @param {Boolean} enable Whether the feature should be enabled
 * @memberOf adobeDPS-AutoArchive.prototype
 * @platform iOS
 */
AutoArchive.prototype.toggle = function (enable) {
    if (this.isSupported && enable != this.isEnabled) {
        Log.instance.debug("Setting autoArchive to: "+ enable);
        // Not really sure yet what the call should look like
        Interface.instance._send(
            {action: "call", 
                path: "settingsService.autoArchive",
                data: {
                    method: "toggle"
                }
            }
         );
    }
};

/**
 * Update the AutoArchive Setting with a JSON update from native.
 * @memberOf adobeDPS-AutoArchive.prototype
 */
AutoArchive.prototype._update = function (data) {
    var update, updates;
    if (data.hasOwnProperty("update")) {
        updates = [], update = data.update;

        if (update.hasOwnProperty("isSupported")) {
            this.isSupported = update.isSupported;
            updates.push("isSupported");
        }
    
        if (update.hasOwnProperty("isEnabled")) {
            this.isEnabled = update.isEnabled;
            updates.push("isEnabled");
        }
        
        if (updates.length > 0) {
            // Send the update signal to indicate what has changed
            this.updatedSignal.dispatch(updates);
        }
    } else {
        Log.instance.warn("AutoArchive._update cannot parse update: " + JSON.stringify(data));
    }
};

/**
 * Initialize the AutoArchive Setting with a JSON update from native.
 * @memberOf adobeDPS-AutoArchive.prototype
 */
AutoArchive.prototype._initialize = function (data) {
    this._update(data);
};

AutoArchive.instance = new AutoArchive();
    /**
 * Create an instance of the Analytics class.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class Class used to control all Analytics Settings
 * @extends adobeDPS-Setting
 * @platform Android
 */
function Analytics() {
    /**
     * Whether this feature is supported on this platform.
     * @memberOf adobeDPS-Analystic.prototype
     * @type Boolean
     * @platform Android
     */
    this.isSupported = false;
    
    /**
     * Whether this feature is currently enabled.
     * @memberOf adobeDPS-Analystic.prototype
     * @type Boolean
     * @platform Android
     */
    this.isEnabled = false;
    
    Setting.call(this);
}

Setting.extend(Analytics);

/**
 * Update the AutoArchive Setting with a JSON update from native.
 * @memberOf adobeDPS-Analytics.prototype
 */
Analytics.prototype._update = function (data) {
    var update, updates;
    if (data.hasOwnProperty("update")) {
        updates = [], update = data.update;

        if (update.hasOwnProperty("isSupported")) {
            this.isSupported = update.isSupported;
            updates.push("isSupported");
        }
    
        if (update.hasOwnProperty("isEnabled")) {
            this.isEnabled = update.isEnabled;
            updates.push("isEnabled");
        }
        
        if (updates.length > 0) {
            // Send the update signal to indicate what has changed
            this.updatedSignal.dispatch(updates);
        }
    } else {
        Log.instance.warn("Analytics._update cannot parse update: " + JSON.stringify(data));
    }
};

/**
 * Initialize the Analytics Setting with a JSON update from native.
 * @memberOf adobeDPS-Analytics.prototype
 */
Analytics.prototype._initialize = function (data) {
    this._update(data);
};

Analytics.instance = new Analytics();


    /**
 * Create an instance of the AnalyticsService.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular 
 * users.</strong>
 * @class Service for sending custom analytics events.
 * <br/><strong>Accessible from adobeDPS.analyticsService</strong>
 * @extends adobeDPS-Service
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
function AnalyticsService() {
    /**
     * Variables that are added to this object will be sent with all subsequent analytics
     * calls. I.E. analyticsService.variables['productId'] = 'test1234' will cause all
     * subsequent analytics tracking calls to have the productId variable set to 
     * 'test1234'. The only exception would be if the event that is sent after the
     * variable is sent contains the variable as well. In this case, the variable value
     * will be overridden by the value sent in the event.
     * @memberOf adobeDPS-AnalyticsService.prototype
     * @type Object
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.variables = {};
    
    Service.call(this);
}

Service.extend(AnalyticsService);

/**
 * The list of allowed variables for use within analytics events. These variables can be
 * aliased or used within the variables object.
 * @static
 * @name ALLOWED_VARIABLES
 * @memberOf adobeDPS-AnalyticsService
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
AnalyticsService.ALLOWED_VARIABLES = [
    "stackId", // 5
    "screenId", // 6
    "stackTitle", // 7, 15, 17
    "overlayId", // 8
    "overlayType", // 9
    "isOnline", // 10
    "folioManifestId", // 14
    "isAdView",
    "productId",
    "entitlementCategory",
    "purchasePrice",
    "purchaseUnits",
    "isAutoStarted",
    "customVariable1",
    "customVariable2",
    "customVariable3",
    "customVariable4",
    "customVariable5",
    "customVariable6", 
    "customVariable7", 
    "customVariable8",
    "customVariable9", 
    "customVariable10" 
];

/**
 * The list of allowed custom events. These events can be aliased but you must use one of
 * these events when sending custom events.
 * @static
 * @name ALLOWED_EVENTS
 * @memberOf adobeDPS-AnalyticsService
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
AnalyticsService.ALLOWED_EVENTS = [
    "customEvent1",
    "customEvent2",
    "customEvent3",
    "customEvent4",
    "customEvent5",
    "customEvent6",
    "customEvent7",
    "customEvent8",
    "customEvent9",
    "customEvent10" 
];

/**
 * The list of allowed categories for all purchase events.
 * @static
 * @name PURCHASE_CATEGORIES
 * @memberOf adobeDPS-AnalyticsService
 * @platform iOS
 * @platform Android 
 */
AnalyticsService.PURCHASE_CATEGORIES = {
    subscription: "subscription",
    single: "single",
    free: "free",
    external: "external"
};

/**
 * The list of current aliases used for analytics event properties. These can be updated
 * using {@link adobeDPS-AnalyticsService#setCustomVariableAlias}.
 * @memberOf adobeDPS-AnalyticsService.prototype
 */
AnalyticsService.prototype._variableAliases = {
    stackIndex: "stackId",
    stackId: "stackId",
    screenIndex: "screenId",
    screenId: "screenId",
    adTitle: "stackTitle",
    articleTitle: "stackTitle",
    stackTitle: "stackTitle",
    overlayId: "overlayId",
    overlayType: "overlayType",
    isOnline: "isOnline",
    issueName: "folioManifestId",
    folioManifestId: "folioManifestId",
    isAdView: "isAdView",
    productId: "productId",
    entitlementCategory: "entitlementCategory",
    purchasePrice: "purchasePrice",
    purchaseUnits: "purchaseUnits",
    isAutoStarted: "isAutoStarted",
    customVariable1: "customVariable1",
    customVariable2: "customVariable2",
    customVariable3: "customVariable3",
    customVariable4: "customVariable4",
    customVariable5: "customVariable5",
    customVariable6: "customVariable6",
    customVariable7: "customVariable7",
    customVariable8: "customVariable8",
    customVariable9: "customVariable9",
    customVariable10: "customVariable10"
};

/**
 * The list of current aliases used for analytics events. These can be updated
 * using {@link adobeDPS-AnalyticsService#setCustomEventAlias}.
 * @memberOf adobeDPS-AnalyticsService.prototype
 */
AnalyticsService.prototype._eventAliases = {
    customEvent1: "customEvent1",
    customEvent2: "customEvent2",
    customEvent3: "customEvent3",
    customEvent4: "customEvent4",
    customEvent5: "customEvent5",
    customEvent6: "customEvent6",
    customEvent7: "customEvent7",
    customEvent8: "customEvent8",
    customEvent9: "customEvent9",
    customEvent10: "customEvent10"
};

/**
 * Function used to set a custom alias for an analytics property. After setting the new
 * alias, that alias can be used in subsequent calls to track events when sending 
 * properties.
 * @memberOf adobeDPS-AnalyticsService.prototype
 * @param {String} realName The real name of the analytics event property as defined in ALLOWED_VARIABLES.
 * @param {String} alias The alias to use for the real property.
 * @see adobeDPS-AnalyticsService#ALLOWED_VARIABLES
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
AnalyticsService.prototype.setCustomVariableAlias = function (realName, alias) {
    if (AnalyticsService.ALLOWED_VARIABLES.indexOf(realName) > -1) {
        this._variableAliases[alias] = realName;
    } else {
        throw new Error("AnalyticsService.setCustomVariableAlias called with invalid realName: " + realName);
    }
};

/**
 * Function used to set a custom alias for an analytics event. After setting the new
 * alias, that alias can be used in subsequent calls to track events.
 * @memberOf adobeDPS-AnalyticsService.prototype
 * @param {String} realName The real name of the analytics event as defined in ALLOWED_EVENTS.
 * @param {String} alias The alias to use for the real property.
 * @see adobeDPS-AnalyticsService#ALLOWED_EVENTS
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
AnalyticsService.prototype.setCustomEventAlias = function (realName, alias) {
    if (AnalyticsService.ALLOWED_EVENTS.indexOf(realName) > -1) {
        this._eventAliases[alias] = realName;
    } else {
        throw new Error("AnalyticsService.setCustomEventAlias called with invalid realName:" + realName);
    }
};

/**
 * Function used to track a purchase start event.
 * <br/><b>WARNING: Purchase events will be tracked automatically for purchases of Folios
 * through the API. This function should only be used to track purchases outside of the API
 * </b>
 * @memberOf adobeDPS-AnalyticsService.prototype
 * @param {String} category The type of purchase event this is. Must be valued defined in PURCHASE_CATEGORIES
 * @param {String} productId The productId of the item being purchased
 * @param {Object} variables Other variables to be assigned to the event (key-value pairs)
 * @see adobeDPS-AnalyticsService#ALLOWED_VARIABLES
 * @see adobeDPS-AnalyticsService#PURCHASE_CATEGORIES
 * @platform iOS
 * @platform Android 
 */
AnalyticsService.prototype.trackPurchaseStart = function (category, productId, variables) {
    variables["entitlementCategory"] = category;
    variables["productId"] = productId;
    var event = {analyticsEvent: "kFolioPurchaseStartedAnalyticsEvent", analyticsEventName: "", variables: variables};
    Interface.instance._send(
        {action: "call", 
            path: "analyticsService",
            data: {
                method: "trackPurchaseStart",
                event: event
            }
        }
    );
};

/**
 * Function used to track a purchase complete event.
 * <br/><b>WARNING: Purchase events will be tracked automatically for purchases of Folios
 * through the API. This function should only be used to track purchases outside of the API
 * </b>
 * @memberOf adobeDPS-AnalyticsService.prototype
 * @param {String} category The type of purchase event this is. Must be valued defined in PURCHASE_CATEGORIES
 * @param {String} productId The productId of the item being purchased
 * @param {String} price The price of the item that was purchased
 * @param {Object} variables Other variables to be assigned to the event (key-value pairs)
 * @see adobeDPS-AnalyticsService#ALLOWED_VARIABLES
 * @see adobeDPS-AnalyticsService#PURCHASE_CATEGORIES
 * @platform iOS
 * @platform Android 
 */
AnalyticsService.prototype.trackPurchaseComplete = function (category, productId, units, price, variables) {
    variables["entitlementCategory"] = category;
    variables["productId"] = productId;
    variables["purchasePrice"] = price;
    variables["purchaseUnits"] = units;
    var event = {analyticsEvent: "kFolioPurchaseCompletedAnalyticsEvent", analyticsEventName: "", variables: variables};
    Interface.instance._send(
        {action: "call", 
            path: "analyticsService",
            data: {
                method: "trackPurchaseComplete",
                event: event
            }
        }
    );
};

/**
 * Function used to track a custom event.
 * @memberOf adobeDPS-AnalyticsService.prototype
 * @param {String} eventName The name of this event
 * @param {Object} variables Other variables to be assigned to the event (key-value pairs)
 * @see adobeDPS-AnalyticsService#ALLOWED_VARIABLES
 * @see adobeDPS-AnalyticsService#PURCHASE_CATEGORIES
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
AnalyticsService.prototype.trackCustomEvent = function (eventName, variables) {
    if (AnalyticsService.ALLOWED_EVENTS.indexOf(this._eventAliases[eventName]) != -1) {
        var event = {analyticsEvent: this._eventAliases[eventName], analyticsEventName: eventName, variables: variables};
        Interface.instance._send(
            {action: "call", 
                path: "analyticsService",
                data: {
                    method: "trackCustomEvent",
                    event: event
                }
            }
        );
    } else {
        throw new Error("AnalyticsService.trackCustomEvent called with invalid eventName: " + eventName);
    }
};

/**
 * The singleton of the AnalyticsService.
 * @static
 * @name instance
 * @memberOf adobeDPS-AnalyticsService
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
AnalyticsService.instance = new AnalyticsService();

    /**
 * Create an instance of the AuthenticationService.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class Service for sending custom analytics events.
 * <br/><strong>Accessible from adobeDPS.authenticationService</strong>
 * @extends adobeDPS-Service
 * @platform iOS
 * @platform Android (Library API Only)
 * @platform Windows (Library API Only)
 */
function AuthenticationService() {

    /**
     * Signal to indicate updates to the AuthenticationService.
     * Updates about isUserAuthenticated,
     * userName, and token are signaled.
     * <br/><em>Callback Signature: updatedHandler([String, ...])</em>
     * @memberOf adobeDPS-AuthenticationService.prototype
     * @type adobeDPS-Signal
     * @platform iOS
     * @platform Android (Library API Only)
     * @platform Windows (Library API Only)
     */
    this.updatedSignal = new Signal();

    /**
     * Signal to indicate that the user's authentication state has changed.
     * <br/><em>Callback Signature: userAuthenticationChangedHandler(Boolean)</em>
     * @memberOf adobeDPS-AuthenticationService.prototype
     * @type adobeDPS-Signal
     * @platform iOS
     * @platform Android (Library API Only)
     * @platform Windows (Library API Only)
     */
    this.userAuthenticationChangedSignal = new Signal();
    
    /**
     * The current authentication transaction, if applicable.
     * @memberOf adobeDPS-AuthenticationService.prototype
     * @type adobeDPS-Transaction
     * @see adobeDPS-UserSigninTransaction
     * @see adobeDPS-UserSignoutTransaction
     * @platform iOS
     * @platform Android (Library API Only)
     */
    this.currentTransaction = null;
    
    /**
     * Whether a user is currently authenticated.
     * @memberOf adobeDPS-AuthenticationService.prototype
     * @type Boolean
     * @platform iOS
     * @platform Android (Library API Only)
     * @platform Windows (Library API Only)
     */
    this.isUserAuthenticated = false;
    
    /**
     * The username of that user. Will be `null` if `isUserAuthenticated` is false.
     * @memberOf adobeDPS-AuthenticationService.prototype
     * @type String
     * @platform iOS
     * @platform Android (Library API Only)
     * @platform Windows (Library API Only)
     */
    this.userName = null;
    
    /**
     * If a user is authenticated, the token for this session.
     * @memberOf adobeDPS-AuthenticationService.prototype
     * @type String
     * @platform iOS
     * @platform Android (Library API Only)
     * @platform Windows (Library API Only)
     */
    this.token = null;
     
    Service.call(this);
}

Service.extend(AuthenticationService);

/**
 * Start a login transaction on this Folio. Requires that `isUserAuthenticated` be false.
 * @memberOf adobeDPS-AuthenticationService.prototype
 * @param {String} username The username of the user to sign-in (null if token is provided)
 * @param {String} password The password of the user to sign-in (null if token is provided)
 * @param {String} [token] The token of the user to sign-in
 * @returns {adobeDPS-UserSigninTransaction} The started sign-in transaction
 * @throws {Error} If a user is already authenticated or a username/password combination or token wasn't provided
 * @platform iOS
 * @platform Android (Library API Only)
 * @platform Windows (Library API Only)
 */
AuthenticationService.prototype.login = function (username, password, token) {
    if (!this.isUserAuthenticated) {
        var trans = new UserSigninTransaction(username, password, token);
        if (trans) {
            TransactionManager.instance._registerTransaction(trans);
            Log.instance.debug("Starting new UserSigninTransaction");
            
            try {
                return trans.start();
            } catch (e) {
                // remove the transaction
                delete TransactionManager.instance._allTransactions[trans.id];
                
                // propagate error
                throw e;
            }
        } else {
            // This shouldn't happen since we would expect the constructor to throw if it
            // if it isn't going to return, but just in case...
            throw new Error('There was a problem creating the UserSigninTransaction.');
        }
    } else {
        throw new Error('Login failed. User is already authenticated.');
    }
};

/**
 * Start a logout transaction on this Folio. Requires that `isUserAuthenticated` be true.
 * @memberOf adobeDPS-AuthenticationService.prototype
 * @returns {adobeDPS-UserSignoutTransaction} The started sign-out transaction
 * @throws {Error} If a user is not authenticated
 * @platform iOS
 * @platform Android (Library API Only)
 * @platform Windows (Library API Only)
 */
AuthenticationService.prototype.logout = function () {
    if (this.isUserAuthenticated) {
        var trans = new UserSignoutTransaction();
        if (trans) {
            TransactionManager.instance._registerTransaction(trans);
            Log.instance.debug("Starting new UserSignoutTransaction");
            
            try {
                return trans.start();
            } catch (e) {
                // remove the transaction
                delete TransactionManager.instance._allTransactions[trans.id];
                
                // propagate error
                throw e;
            }
        } else {
            // This shouldn't happen since we would expect the constructor to throw if it
            // if it isn't going to return, but just in case...
            throw new Error('There was a problem creating the UserSignoutTransaction.');
        }
    } else {
        throw new Error('Logout failed. User is not authenticated.');
    }
};

/**
 * Update the Authentication Service with a JSON update from native.
 * @memberOf adobeDPS-AuthenticationService.prototype
 */
AuthenticationService.prototype._update = function (data) {
    Log.instance.debug("AuthenticationService.prototype._update called:"+JSON.stringify(data));
    if (data.hasOwnProperty("update")) {
        var update, changes, trans;
        update = data.update;
        changes = [];
        if (update.hasOwnProperty("currentTransaction")) {
            trans = TransactionManager.instance._allTransactions[update.currentTransaction];
            if (this.currentTransaction != trans) {
                this.currentTransaction = trans;
                changes.push("currentTransaction");
            }
        }
        
        if (update.hasOwnProperty("userName")) {
            if (this.userName != update.userName) {
                this.userName = update.userName;
                changes.push("userName");
            }
        }
        
        if (update.hasOwnProperty("token")) {
            Log.instance.debug("old:"+this.token+" new:"+update.token);
            if (this.token != update.token) {
                this.token = update.token;
                changes.push("token");
            }
        }
        
        if (update.hasOwnProperty("isUserAuthenticated")) {
            if (this.isUserAuthenticated != update.isUserAuthenticated) {
                this.isUserAuthenticated = update.isUserAuthenticated;
                this.userAuthenticationChangedSignal.dispatch(this.isUserAuthenticated);
                changes.push("isUserAuthenticated");
            }
        }

        if (changes.length > 0) {
            this.updatedSignal.dispatch(changes);
        }
    } else {
        Log.instance.warn("AuthenticationService._update called without update");
    }
};

/**
 * Ask the authentication service to present the native sign in UI.
 * If currently authenticating or already signed in, UI is not shown.
 * @memberOf adobeDPS-AuthenticationService.prototype
 * @platform iOS
 * @platform Android (Library API Only)
 * @platform Windows (Library API Only)
 */
AuthenticationService.prototype.displaySignIn = function () {
    Log.instance.debug("AuthenticationService.prototype.displaySignIn called.");

    Interface.instance._send({
        action: "call",
        path: "authenticationService",
        data: {
            method: "displaySignIn"
        }
    });
};

/**
 * Initialize the Authentication Service with a JSON update from native.
 * @memberOf adobeDPS-AuthenticationService.prototype
 */
AuthenticationService.prototype._initialize = function (data) {
    this._update(data);

};

/**
 * The singleton of the AuthenticationService.
 * @static
 * @name instance
 * @memberOf adobeDPS-AuthenticationService
 * @platform iOS
 * @platform Android (Library API Only)
 * @platform Windows (Library API Only)
 */
AuthenticationService.instance = new AuthenticationService();
    /**
 * ApplicationContext class.
 * @class This class represents the context under which the application is launched 
 * @platform iOS
 */
 function ApplicationContext() {
    /**
     * The external application bundleID used to launch / activate the viewer. Ex: com.apple.mobilesafari (Safari browser)
     * @memberOf adobeDPS-ApplicationContext.prototype
     * @type String
     * @example
     *  //Sample code to get bundleID.
     * var sourceAppBundleId = adobeDPS.configurationService.applicationContext.sourceApplication;  
     * alert(sourceAppBundleId);    //com.apple.mobilesafari
     * @platform iOS
     */
    this.sourceApplication = null;

    /**
     * The viewer URL scheme used to launch / activate the viewer.
     * @memberOf adobeDPS-ApplicationContext.prototype
     * @type String
     * @example
     *  //Sample code to get the viewer app URL scheme. Viewer app was created with the URL Scheme, com.adobe.CustomDPSViewer, using the Adobe DPS App Builder.
     * var appURLScheme = adobeDPS.configurationService.applicationContext.urlScheme;   
     * alert(appURLScheme); //com.adobe.CustomDPSViewer
     * @platform iOS
     */
    this.urlScheme = null;
    
    /**
     * The URL host. The value should always be "v1".
     * @memberOf adobeDPS-ApplicationContext.prototype
     * @type String
     * @platform iOS
     */
    this.urlHost = null;   

    /**
     * The URL path. The value should always be "slot/<slot_name>"
     * @memberOf adobeDPS-ApplicationContext.prototype
     * @type String
     * @platform iOS
     */
    this.urlPath = null; 

    /**
     * The URL query string containing key/value pairs delimited by &.
     * This is an object of structure {key:value ...}. It may be undefined as query strings are optional
     * @memberOf adobeDPS-ApplicationContext.prototype
     * @type Object
     * @example
     *  //Sample code to get a parameter from the query string, com.adobe.CustomDPSViewer://v1/slot/store?companyName=Adobe
     * var companyName = adobeDPS.configurationService.applicationContext.urlQueryString.companyName;
     * alert(companyName);  //Alert box will appear with 'Adobe' in the description
     * @platform iOS
     */
    this.urlQueryString = undefined;
};

/**
 * Create an instance of the ConfigurationService.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class Service for accessing information about the viewer configuration.
 * <br/><strong>Accessible from adobeDPS.configurationService</strong>
 * @extends adobeDPS-Service
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
function ConfigurationService() {
    /**
     * The list of states that this application supports.
     * @type Array
     * @see adobeDPS-ApplicationState
     * @platform iOS
     */
    this.applicationStates = {};
    
    /**
     * This is the user-accessible location to access ApplicationStateType constants.
     * @memberOf adobeDPS-ConfigurationService.prototype
     * @type adobeDPS-ApplicationStateType
     * @platform iOS
     */
    this.applicationStateTypes = ApplicationStateType;
    
    /**
     * The ID of this application as configured in App Builder.
     * @memberOf adobeDPS-ConfigurationService.prototype
     * @type String
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.applicationID = null;
    
    /**
     * The version of this application as configured in App Builder.
     * @memberOf adobeDPS-ConfigurationService.prototype
     * @type String
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.applicationVersion = null;


    /**
     * The version specified by Adobe each release (e.g. 30.1.0). 
     * It is not the application version set by App Builder in the app manifest.
     * @memberOf adobeDPS-ConfigurationService.prototype
     * @type String
     * @platform Android
     * @platform Windows
     */
    this.adobeApplicationVersion = null;
        
    /**
     * An array of callbacks registered with the service 
     * @private
     * @memberOf adobeDPS-ConfigurationService.prototype
     * @type Object
     */
    this.callbacks = {}; 

    /**
     * The context under which the application was launched or activated.
     * @memberOf adobeDPS-ConfigurationService.prototype
     * @type adobeDPS-ApplicationContext
     * @platform iOS
     */
    this.applicationContext = null;
    
    /**
     * Signal to indicate that the application activation context has been updated. 
     * @memberOf adobeDPS-ConfigurationService.prototype
     * @type adobeDPS-Signal
     * @platform iOS
     */
    this.applicationContextUpdatedSignal = new Signal();
    
    Service.call(this);
}

Service.extend(ConfigurationService);

// This is the base random Id identifying a callback in the array of callbacks
var callbackId =  Math.floor(Math.random() * 2000000000);    

/**
 * Initialize the Device Service with a JSON update from native.
 * @memberOf adobeDPS-ConfigurationService.prototype
 */
ConfigurationService.prototype._initialize = function (data) {
    var i, json, state;
    if (data.hasOwnProperty("update")) {
        var update = data.update;
        
        if (update.hasOwnProperty("applicationID")) {
            this.applicationID = update.applicationID;
        }
        
        if (update.hasOwnProperty("applicationVersion")) {
            this.applicationVersion = update.applicationVersion;
        }
        
        if (update.hasOwnProperty("adobeApplicationVersion")) {
            this.adobeApplicationVersion = update.adobeApplicationVersion;
        }
        
        if (update.hasOwnProperty("applicationStates")) {
            for (i = 0; i < update.applicationStates.length; i++) {
                json = update.applicationStates[i];

                // Confirm that the data is of the expected type
                if(json.hasOwnProperty("type") && json.type == "ApplicationState") {
                    state = ApplicationState._fromJSON(json);
                    
                    // Filter out states that aren't WebView or Native states
                    if(state.type == ApplicationStateType.NATIVE || state.type == ApplicationStateType.WEBVIEW) {
                        this.applicationStates[state.label] = state;
                    }
                }
            }
        }
        
        if (update.hasOwnProperty("applicationContext")) {
            this.applicationContext = update.applicationContext;
        }
    }
    else
    {
        Log.instance.warn("ConfigurationService._initialize called without update");
    }
};

/**
 * Update the Configuration Service with the application context JSON update from native.
 * @memberOf adobeDPS-ConfigurationService.prototype
 */
ConfigurationService.prototype._update = function (data) {
    if (data.hasOwnProperty("update")) {
        if (data.update.hasOwnProperty("callbackId")) {
            var callbackInfo = this.callbacks[data.update.callbackId];
            if (callbackInfo.hasOwnProperty("nativeData") && callbackInfo.nativeData.method == "canOpenURL") {
                callbackInfo.callbackFunction(callbackInfo.nativeData.url, data.update.urlCanBeOpened);
                delete this.callbacks[data.update.callbackId];
            }
        } 
        else {
            this.applicationContext = data.update;
        
            // Send the update signal to indicate what has changed
            this.applicationContextUpdatedSignal.dispatch();
        }
    } else {
        Log.instance.warn("ConfigurationService._update called without update");
    }
};

/**
 * Function used to go to a new application state
 * @memberOf adobeDPS-ConfigurationService.prototype
 * @param {String} stateLabel The label of this state
 * @platform iOS
 */
ConfigurationService.prototype.gotoState = function (stateLabel) {
    if(this.applicationStates.hasOwnProperty(stateLabel)) {
        var state = this.applicationStates[stateLabel];
        Interface.instance._send(
            {
                action:"call",
                path: "configurationService",
                data: state
            }
        );
    } else {
        throw new Error("ConfigurationService.gotoState called with invalid state label: " + stateLabel);
    }
};

/**
 * Function used to check if a URL can be opened by an application.  The scheme name of the specified URL is checked to determine if there
 * is an application installed on the device that can process a URL that begins with that scheme name.
 * @memberOf adobeDPS-ConfigurationService.prototype
 * @param {String} urlValue The URL containing the scheme name to be checked.
 * @param {Function} callbackFunction The callback function that provides the boolean results of the check. 
 * <br/><em>Callback Signature: callbackFunction(urlValue, urlCanBeOpened)</em>
 * @platform iOS
 * @platform Android
 */
ConfigurationService.prototype.canOpenURL = function (urlValue, callbackFunction) {
    var nativeData = {
        method: "canOpenURL",
        url: urlValue,
        callbackId: callbackId
    };
    var callbackInfo = {
        callbackFunction: callbackFunction,
        nativeData: nativeData
    };
    this.callbacks[callbackId] = callbackInfo;
    Interface.instance._send(
        {
            action:"call",
            path: "configurationService",
            data: nativeData
        }
    );
    callbackId++;
};

/**
 * The singleton of the ConfigurationService.
 * @static
 * @name instance
 * @memberOf adobeDPS-ConfigurationService
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
ConfigurationService.instance = new ConfigurationService();

    
/**
 * Create an instance of the DialogService.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class Service for detecting if the API is hosted as a dialog and dismissing the current dialog.
 * <br/><strong>Accessible from adobeDPS.dialogService</strong>
 * @extends adobeDPS-Service
 * @platform iOS
 * @platform Android 
 * @platform Windows
 */
function DialogService() {

    /**
     * Signal to indicate that this service has been updated. It will pass an array of Strings containing the names of
     * the properties that have been updated.
     * <br/><em>Callback Signature: updatedHandler([String, ...])</em>
     * @memberOf adobeDPS-DialogService.prototype
     * @type adobeDPS-Signal
     * @platform iOS
     */
    this.updatedSignal = new Signal();

    /** 
     * Whether a custom dialog is currently displaying
     * @memberOf adobeDPS-DialogService.prototype
     * @type Boolean
     * @platform iOS
     */
    this.isCustomDialogDisplaying = false;

    this.isWelcomeScreenDisplaying = false;
    
    this.isCustomWebviewDisplaying = false;

    Service.call(this);
}

Service.extend(DialogService);

/**
 * Initialize the Dialog Service with a JSON update from native.
 * @memberOf adobeDPS-DialogService.prototype
 */
DialogService.prototype._initialize = function (data) {
    if (data.hasOwnProperty("update")) {
        var update = data.update;

        if (update.hasOwnProperty("isCustomDialogDisplaying")) {
            this.isCustomDialogDisplaying = update.isCustomDialogDisplaying;
        }

        if (update.hasOwnProperty("isWelcomeScreenDisplaying")) {
            this.isWelcomeScreenDisplaying = update.isWelcomeScreenDisplaying;
        }
        
        if (update.hasOwnProperty("isCustomWebviewDisplaying")) {
            this.isCustomWebviewDisplaying = update.isCustomWebviewDisplaying;
        }
    } else {
        Log.instance.warn("DialogService._initialize called without update");
    }
};

/**
 * Update the Dialog Service with a JSON update from native.
 * @memberOf adobeDPS-DialogService.prototype
 */
DialogService.prototype._update = function (data) {
    if (data.hasOwnProperty("update")) {
        var updates = [],
            update = data.update;

        if (update.hasOwnProperty("isCustomDialogDisplaying") && this.isCustomDialogDisplaying != update.isCustomDialogDisplaying) {
            this.isCustomDialogDisplaying = update.isCustomDialogDisplaying;
            updates.push("isCustomDialogDisplaying");
        }

        if (update.hasOwnProperty("isWelcomeScreenDisplaying") && this.isWelcomeScreenDisplaying != update.isWelcomeScreenDisplaying) {
            this.isWelcomeScreenDisplaying = update.isWelcomeScreenDisplaying;
            updates.push("isWelcomeScreenDisplaying");
        }


        // Send the update signal to indicate what has changed
        this.updatedSignal.dispatch(updates);
    } else {
        Log.instance.warn("DialogService._update called without update");
    }
};

/**
 * Ask the dialog service to present the custom dialog.
 * @memberOf adobeDPS-DialogService.prototype
 * @throws Error if isCustomDialogDisplaying == true
 * @platform iOS
 */
DialogService.prototype.displayCustomDialog = function () {
    if (this.isCustomDialogDisplaying) {
        throw new Error('displayCustomDialog called while a dialog is displaying!');
    }
    
    Interface.instance._send({
        action: "call",
        path: "dialogService",
        data: {
            method: "displayCustomDialog"
        }
    });
}



/** 
 * Ask the dialog service to dismiss the currently displaying dialog
 * NOTE: The current dialog will almost always be the one hosting this JS API.
 * @memberOf adobeDPS-DialogService.prototype
 * @platform iOS
 */
DialogService.prototype.dismissCustomDialog = function () {
    if (!this.isCustomDialogDisplaying) {
        throw new Error('dismissCustomDialog called but no dialog is displaying');
    }

    Interface.instance._send({
        action: "call",
        path: "dialogService",
        data: {
            method: "dismissCustomDialog"
        }
    });
}

/**
 * Ask the dialog service to dismiss the Welcome Screen
 * @memberOf adobeDPS-DialogService.prototype
 * @platform iOS
 */
DialogService.prototype.dismissWelcomeScreen = function () {
    if (!this.isWelcomeScreenDisplaying) {
        throw new Error('dismissWelcomeScreen called but no Welcome Screen is displaying');
    }

    Interface.instance._send({
        action: "call",
        path: "dialogService",
        data: {
            method: "dismissWelcomeScreen"
        }
    });
}

/**
 * Ask the dialog service to present the transparent custom webview.
 * NOTE: url should be a remote url.
 *       If requested url is the same as the one already displaying, the request is ignored;
 *       otherwise, the existing displaying webview is dismissed first.
 * @memberOf adobeDPS-DialogService.prototype
 * @platform iOS
 */
DialogService.prototype.displayCustomWebview = function (url) {
    adobeDPS.log.info("DialogService.displayCustomWebview: " + url);
    
    Interface.instance._send({
                             action: "call",
                             path: "dialogService",
                             data: {
                                method: "displayCustomWebview",
                                url: url
                             }
                             });
}


/**
 * Ask the dialog service to dismiss a transparent custom webview with the given url
 * @memberOf adobeDPS-DialogService.prototype
 * @platform iOS
 */
DialogService.prototype.dismissCustomWebview = function () {
    if (!this.isCustomWebviewDisplaying) {
        throw new Error('dismissCustomWebview called but no custom webview is displaying');
    }
    
    Interface.instance._send({
                             action: "call",
                             path: "dialogService",
                             data: {
                                method: "dismissCustomWebview"
                             }
                             });
}

/**
 * Ask the dialog service to present the url with a slide up web view. 
 * NOTE: url only could be external URLs, like http://www.adobe.com, not support relative URLs.
 * @memberOf adobeDPS-DialogService.prototype
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
DialogService.prototype.open = function (url) {
    adobeDPS.log.info("DialogService.open " + url);
    if( url.toLowerCase().search(/^https{0,1}:\/\//) == -1 ) {
        adobeDPS.log.error(new Error('DialogService.open does not support relative URLs'));
        return;
    }

    Interface.instance._send({
        action: "call",
        path: "dialogService",
        data: {
            method: "open",
            url: url
        }
    });
}

/**
 * Ask the dialog service to close any open slide up web view. 
 * @memberOf adobeDPS-DialogService.prototype
 * @platform iOS
 */
DialogService.prototype.close = function() {
    adobeDPS.log.info("DialogService.close");
    
    Interface.instance._send({
        action: "call",
        path: "dialogService",
        data: {
            method: "close"
        }
    });
}

/**
 * Ask the dialog service to present the url with the external browser. 
 * NOTE: url only could be external URLs, like http://www.adobe.com, not support relative URLs.
 * @memberOf adobeDPS-DialogService.prototype
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
DialogService.prototype.openExternal = function (url) {
    adobeDPS.log.info("DialogService.openExternal " + url);
    if( url.toLowerCase().search(/^https{0,1}:\/\//) == -1 ) {
        adobeDPS.log.error(new Error('DialogService.open does not support relative URLs'));
        return;
    }

    Interface.instance._send({
        action: "call",
        path: "dialogService",
        data: {
            method: "openExternal",
            url: url
        }
    });
}

/**
 * The singleton of the DialogService.
 * @static
 * @name instance
 * @memberOf adobeDPS-DialogService
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
DialogService.instance = new DialogService();

    /**
 * Enum for the type of network.
 * <br/>This offers more granularity than HTML's window.navigator.onLine boolean property.
 * @see adobeDPS-DeviceService#networkType
 * @namespace
 * @enum {String}
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
var NetworkType = {
    /**
     * Indicates an unknown network type.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    UNKNOWN: "unknown",

    /**
     * Indicates there's a connection to a Wi-Fi network.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    WIFI: "wifi",

    /**
     * Indicates there's a connection to a mobile network.
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    MOBILE: "mobile"
};

/**
 *  The status code returned in the update function
 */
var DeviceStatus = {
    ERROR: 0,
    SUCCESS: 1,
    UNKNOWN: -1
};

/**
 * Enum for the background app refresh state.
 * <br/>Represents the Background App Refresh settings state in iOS7 or later. In iOS6, this represents the Newsstand setting.
 * <br/>Note: The RESTRICTED value is only applicable to iOS7 and later.
 * @namespace
 * @enum {Number}
 * @platform iOS
 */
var BackgroundRefreshState = {
    /**
     * Indicates background updates are unavailable and the user cannot enable them again. For example, this status can occur when parental controls are in effect for the current user. Do not warn the user when this is the current state. A restricted user does not have the ability to enable Background App Refresh for the app.
     * @platform iOS
     */
    RESTRICTED: 0,

    /**
     * Indicates the user explicitly disabled background updates for this app or the whole system.
     * @platform iOS
     */
    DISABLED: 1,

    /**
     * Indicates background updates are available for the app.
     * @platform iOS
     */
    ENABLED: 2,

    /**
     * Indicates background updates are not supported for the app.
     * @platform iOS
     */
    NOTSUPPORTED: 3
};

/**
 * This is the base random Id identifying a callback in the array of callbacks
 */
var callbackId =  Math.floor(Math.random() * 2000000000);

/**
 * Create an instance of the DeviceService.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class Service for accessing information about the device.
 * <br/><strong>Accessible from adobeDPS.deviceService</strong>
 * @extends adobeDPS-Service
 * @platform iOS
 * @platform Android 
 * @platform Windows
 */
function DeviceService() {

    /**
     * Signal to indicate that this service has been updated. It will pass an array of Strings containing the names of
     * the properties that have been updated.
     * <br/><em>Callback Signature: updatedHandler([String, ...])</em>
     * @memberOf adobeDPS-DeviceService.prototype
     * @type adobeDPS-Signal
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.updatedSignal = new Signal();

    /**
     * The unique id of this device.
     * @memberOf adobeDPS-DeviceService.prototype
     * @type String
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.deviceId = null;
    
    /**
     * The operating system running on this device.
     * @memberOf adobeDPS-DeviceService.prototype
     * @type String
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.os = null;

    /**
     * The name of this device according to /system/build.prop.
     * This value will only be available on Android devices.
     * @memberOf adobeDPS-DeviceService.prototype
     * @type String
     * @platform iOS
     * @platform Android
     * @platform Windows
     */
    this.deviceName = null;

    /**
     * Whether in-app purchasing is currently enabled. If this is false, you will not be able to initiate purchases.
     * @memberOf adobeDPS-DeviceService.prototype
     * @type Boolean
     * @platform iOS
     * @platform Android 
     * @platform Windows
     */
    this.isPurchasingEnabled = false;

    /**
     * Whether the device is connected to the internet or not.
     * Note: HTML5's navigator.onLine property and "offline" and "online" events should be used in most cases.
     * This property exists for certain platforms that don't have such functionality.
     * @memberOf adobeDPS-DeviceService.prototype
     * @type Boolean
     * @platform iOS
     * @platform Android 
     * @platform Windows
     */
    this.isOnline = false;

    /**
     * The type of the network the device is connected to.
     * @memberOf adobeDPS-DeviceService.prototype
     * @type adobeDPS-NetworkType
     * @platform iOS
     * @platform Android 
     * @platform Windows
     */
    this.networkType = null;

    /**
     * Network types enum accessor.
     * <br/>This is where you should access the {@link adobeDPS-NetworkType} enums from.
     * @memberOf adobeDPS-DeviceService.prototype
     * @type adobeDPS-NetworkType
     * @platform iOS
     * @platform Android 
     * @platform Windows
     */
    this.networkTypes = NetworkType;

    /**
     * The push notification token of this device.
     * @memberOf adobeDPS-DeviceService.prototype
     * @type String
     * @platform iOS
     */
    this.pushNotificationToken = null;

    /**
     * The Omniture visitor id of this device.
     * @memberOf adobeDPS-DeviceService.prototype
     * @type String
     * @platform iOS
     * @platform Android 
     * @platform Windows
     */
    this.omnitureVisitorId = null;

    /**
     * Uniquely identifies a device to the app's vendor.
     * @memberOf adobeDPS-DeviceService.prototype
     * @type String
     * @platform iOS
     */
    this.identifierForVendor = null;

    /**
     * An alphanumeric string unique to each device, used only for serving advertisements.
     * <br/>Note: <strong>Supported on iOS only.</strong>
     * <br/>Usage: Prior to checking this property, you must call enableAdvertisingFramework() first in order to specifically enable the Advertising Framework on iOS. If you do not, the property will always return an empty string.
     * See the Apple documentation for the <a href="https://developer.apple.com/library/ios/documentation/AdSupport/Reference/ASIdentifierManager_Ref/ASIdentifierManager.html"> ASIdentifierManager Class</a> and the <a href="https://developer.apple.com/library/ios/documentation/iPhone/Conceptual/iPhoneOSProgrammingGuide/Introduction/Introduction.html">Apple iOS Programming Guide</a> under Basics > Privacy for additional details on proper usage of advertisingIdentifier in your application. This identifier has restricted usage for privacy reasons, and failure to comply with Apple usage guidelines may result in your app being rejected for publication in the Apple App Store.

     * @memberOf adobeDPS-DeviceService.prototype
     * @type String
     * @platform iOS
     */
    this.advertisingIdentifier = null;

    /**
     * A Boolean value that indicates whether the user has limited ad tracking on the device (user setting on iOS devices).
     * <br/>Note: <strong>Supported on iOS only.</strong>
     * <br/>Usage: Prior to checking this property, you must call enableAdvertisingFramework() first in order to specifically enable the Advertising Framework on iOS. If you do not, the property will always return false.
     * See the Apple documentation for the <a href="https://developer.apple.com/library/ios/documentation/AdSupport/Reference/ASIdentifierManager_Ref/ASIdentifierManager.html"> ASIdentifierManager Class</a> and the <a href="https://developer.apple.com/library/ios/documentation/iPhone/Conceptual/iPhoneOSProgrammingGuide/Introduction/Introduction.html">Apple iOS Programming Guide</a> under Basics > Privacy for additional details on proper usage of advertisingTrackingEnabled in your application. This property has restricted usage for privacy reasons, and failure to comply with Apple usage guidelines may result in your app being rejected for publication in the Apple App Store.
     * @memberOf adobeDPS-DeviceService.prototype
     * @type Boolean
     * @platform iOS
     */
    this.isAdvertisingTrackingEnabled = false;

    /**
     * The state of the Background App Refresh setting on the device. Reflects whether the app can be launched into the background to fetch new content.
     * <br/>Note: For iOS6 this property represents the Newsstand setting.
     * @memberOf adobeDPS-DeviceService.prototype
     * @type adobeDPS-BackgroundRefreshState
     * @platform iOS
     */
    this.backgroundRefreshState = null;

    /**
     * Background App Refresh state types enum accessor.
     * <br/>This is where you should access the {@link adobeDPS-BackgroundRefreshState} enums from.
     * @memberOf adobeDPS-DeviceService.prototype
     * @type adobeDPS-BackgroundRefreshState
     * @platform iOS
     */
    this.backgroundRefreshStates = BackgroundRefreshState;

    this.callbacks = {};

    Service.call(this);
}

Service.extend(DeviceService);

/**
 * Initialize the Device Service with a JSON update from native.
 * @memberOf adobeDPS-DeviceService.prototype
 */
DeviceService.prototype._initialize = function (data) {
    if (data.hasOwnProperty("update")) {
        var update = data.update;
        
        if (update.hasOwnProperty("deviceId")) {
            this.deviceId = update.deviceId;
        }
        
        if (update.hasOwnProperty("os")) {
            this.os = update.os;
        }
        
        if (update.hasOwnProperty("deviceName")) {
            this.deviceName = update.deviceName;
        }

        if (update.hasOwnProperty("isPurchasingEnabled")) {
            this.isPurchasingEnabled = update.isPurchasingEnabled;
        }

        if (update.hasOwnProperty("isOnline")) {
            this.isOnline = update.isOnline;
        }

        if (update.hasOwnProperty("networkType")) {
            this.networkType = update.networkType;
        }
        
        if (update.hasOwnProperty("pushNotificationToken")) {
            this.pushNotificationToken = update.pushNotificationToken;
        }

        if (update.hasOwnProperty("omnitureVisitorId")) {
            this.omnitureVisitorId = update.omnitureVisitorId;
        }

        if (update.hasOwnProperty("identifierForVendor")) {
            this.identifierForVendor = update.identifierForVendor;
        }

        if (update.hasOwnProperty("advertisingIdentifier")) {
            this.advertisingIdentifier = update.advertisingIdentifier;
        }

        if (update.hasOwnProperty("isAdvertisingTrackingEnabled")) {
            this.isAdvertisingTrackingEnabled = update.isAdvertisingTrackingEnabled;
        }

        if (update.hasOwnProperty("backgroundRefreshState")) {
            this.backgroundRefreshState = update.backgroundRefreshState;
        }
    } else {
        Log.instance.warn("DeviceService._initialize called without update");
    }
};

/**
 * Update the Device Service with a JSON update from native.
 * @memberOf adobeDPS-DeviceService.prototype
 */
DeviceService.prototype._update = function (data) {
    if (data.hasOwnProperty("update")) {
        var updates = [],
            update = data.update;

        if (update.hasOwnProperty("status")) {
            Log.instance.enableLogging = true;

            var callback = this.callbacks[update.callbackId];
            this.status = update.status;
            if (this.status == DeviceStatus.SUCCESS) {
            }
            else {
                callback.fail(update.errorCode, update.errorMessage);
            }
            delete this.callbacks[update.callbackId];
        }

        if (update.hasOwnProperty("deviceId") && this.deviceId != update.deviceId) {
            this.deviceId = update.deviceId;
            updates.push("deviceId");
        }

        if (update.hasOwnProperty("os") && this.os != update.os) {
            this.os = update.os;
            updates.push("os");
        }

        if (update.hasOwnProperty("deviceName") && this.deviceName != update.deviceName) {
            this.deviceName = update.deviceName;
            updates.push("deviceName");
        }

        if (update.hasOwnProperty("isPurchasingEnabled") && this.isPurchasingEnabled != update.isPurchasingEnabled) {
            this.isPurchasingEnabled = update.isPurchasingEnabled;
            updates.push("isPurchasingEnabled");
        }

        if (update.hasOwnProperty("isOnline") && this.isOnline != update.isOnline) {
            this.isOnline = update.isOnline;
            updates.push("isOnline");
        }

        if (update.hasOwnProperty("networkType") && this.networkType != update.networkType) {
            this.networkType = update.networkType;
            updates.push("networkType");
        }
        
        if (update.hasOwnProperty("pushNotificationToken") && this.pushNotificationToken != update.pushNotificationToken) {
            this.pushNotificationToken = update.pushNotificationToken;
            updates.push("pushNotificationToken");
        }

        if (update.hasOwnProperty("omnitureVisitorId") && this.omnitureVisitorId != update.omnitureVisitorId) {
            this.omnitureVisitorId = update.omnitureVisitorId;
            updates.push("omnitureVisitorId");
        }

        if (update.hasOwnProperty("identifierForVendor") && this.identifierForVendor != update.identifierForVendor) {
            this.identifierForVendor = update.identifierForVendor;
            updates.push("identifierForVendor");
        }

        if (update.hasOwnProperty("advertisingIdentifier") && this.advertisingIdentifier != update.advertisingIdentifier) {
            this.advertisingIdentifier = update.advertisingIdentifier;
            updates.push("advertisingIdentifier");
        }

        if (update.hasOwnProperty("isAdvertisingTrackingEnabled") && this.isAdvertisingTrackingEnabled != update.isAdvertisingTrackingEnabled) {
            this.isAdvertisingTrackingEnabled = update.isAdvertisingTrackingEnabled;
            updates.push("isAdvertisingTrackingEnabled");
        }

        if(update.hasOwnProperty("backgroundRefreshState") && this.backgroundRefreshState != update.backgroundRefreshState) {
            this.backgroundRefreshState = update.backgroundRefreshState;
            updates.push("backgroundRefreshState");
        }

        // Send the update signal to indicate what has changed
        this.updatedSignal.dispatch(updates);
    } else {
        Log.instance.warn("DeviceService._update called without update");
    }
};

/**
 * Function used to enable the Advertising Framework. It's necessary to call this method if you are using advertising
 * and wish to be able to use advertising info provided by system. This method will need to be called when the webview is
 * initialized so the advertising properties can be updated accordingly. When the call is successful, the advertising properties
 * will be updated and the signal will be sent to all the registered update handlers. If the call fails, the message will be sent
 * to the supplied errorCallback handler and the advertising properties will not be updated.
 * <br/>Note:<strong>Supported on iOS only</strong>
 * @memberOf adobeDPS-DeviceService.prototype
 * @param {Function} [errorCallback] The callback function that handles the error when operation fails. <br/><em>Callback Signature: errorHandler(errorCode, errorMessage)</em>
 * @platform iOS
 */
DeviceService.prototype.enableAdvertisingFramework = function (errorCallback) {

    this.callbacks[callbackId] = {fail: errorCallback};
    Interface.instance._send(
        {action: "call",
            path: "deviceService",
            data: {
                method: "enableAdvertisingFramework",
                callbackId: callbackId
            }
        }
    );
    callbackId++;
}

/**
 * The singleton of the DeviceService.
 * @static
 * @name instance
 * @memberOf adobeDPS-DeviceService
 * @platform iOS
 * @platform Android
 * @platform Windows
 */
DeviceService.instance = new DeviceService();

    /**
 * Create an instance of the ReceiptService.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class Service for accessing receipt information.
 * <br/><strong>Accessible from adobeDPS.receiptService</strong>
 * @extends adobeDPS-Service
 * @platform iOS
 * @platform Windows
 */
function ReceiptService() {
    /**
     * Signal to indicate that new receipt(s) are available.
     * <br/><em>Callback Signature: newReceiptsAvailable([ {@link adobeDPS-Receipt}, ...])</em>
     * @memberOf adobeDPS-ReceiptService.prototype
     * @type adobeDPS-Signal
     * @platform iOS
     */
    this.newReceiptsAvailableSignal = new Signal();
    
    /**
     * Signal to indicate that this service has been updated. It will pass an array of Strings containing the names of
     * the properties that have been updated.
     * <br/><em>Callback Signature: updatedHandler([String, ...])</em>
     * @memberOf adobeDPS-ReceiptService.prototype
     * @type adobeDPS-Signal
     * @platform iOS
     */
    this.updatedSignal = new Signal();
    
    /**
     * An associative array containing all the single folio receipts, indexed by {@link adobeDPS-Receipt#productId}.
     * @memberOf adobeDPS-ReceiptService.prototype
     * @type Object.<adobeDPS-Receipt>
     * @platform iOS
     */
    this.receipts = {};
    
    /**
     * An associative array containing all the subscription receipts, indexed by {@link adobeDPS-SubscriptionReceipt#productId} + {@link adobeDPS-SubscriptionReceipt#endDate}.
     * @memberOf adobeDPS-ReceiptService.prototype
     * @type Object.<adobeDPS-SubscriptionReceipt>
     * @platform iOS
     */
    this.subscriptionReceipts = {};
    
    /**
     * An associative array containing all the available subscriptions, indexed by {@link adobeDPS-Subscription#productId}.
     * @memberOf adobeDPS-ReceiptService.prototype
     * @type Object.<adobeDPS-Subscription>
     * @platform iOS
     */
    this.availableSubscriptions = {};

    /**
     * Signal to indicate that new subscription(s) have been added to availableSubscriptions.
     * <br/><em>Callback Signature: documentsAddedHandler([ {@link adobeDPS-Subscription}, ...])</em>
     * @memberOf adobeDPS-ReceiptService.prototype
     * @type adobeDPS-Signal
     * @platform iOS
     */
    this.subscriptionsAddedSignal = new Signal();

    /**
     * Signal to indicate that subscription(s) have been removed from availableSubscriptions.
     * <br/><em>Callback Signature: documentsRemovedHandler([ {@link adobeDPS-Subscription}, ...])</em>
     * @memberOf adobeDPS-ReceiptService.prototype
     * @type adobeDPS-Signal
     * @platform iOS
     */
    this.subscriptionsRemovedSignal = new Signal();

    /**
     * Entitlement Type enum accessor.
     * <br/>This is where you should access the {@link adobeDPS-EntitlementType} enums from.
     * @memberOf adobeDPS-ReceiptService.prototype
     * @type adobeDPS-EntitlementType
     * @platform iOS
     * @platform Windows
     */
    this.entitlementTypes = EntitlementType;
    
    /**
     * Property will be populated when there is an active subscription.
     * @memberOf adobeDPS-ReceiptService.prototype
     * @type Object.<adobeDPS-Subscription>
     * @platform iOS
     */
    this.activeSubscription = null;
    
    Service.call(this);
}

Service.extend(ReceiptService);

/**
 * Registers a new incoming receipt with the service and sets the appropriate fields on the model.
 * @memberOf adobeDPS-ReceiptService.prototype
 * @private
 * @param {adobeDPS-Receipt} receipt The new receipt to register with the receipt service.
 * @param {Boolean} suppressSignal Whether to suppress the newReceiptAvailableSignal
 * @returns {adobeDPS-Receipt} The receipt that was passed in
 */
ReceiptService.prototype.registerNewReceipt = function (receipt, suppressSignal) {
    var sub, id, folio;
    if (receipt instanceof SubscriptionReceipt) {
        //Get the subscription
        sub = this.availableSubscriptions[receipt.productId];
        // If it is the latest receipt for the subscription, set it's properties too
        if (sub && (sub.receipt === null || sub.receipt.endDate < receipt.endDate)){
            sub.receipt = receipt;
            sub.isOwned = true;
        }
        
        id = receipt.productId + receipt.endDate.getTime().toString();
        
        if (!this.subscriptionReceipts.hasOwnProperty(id)){
            this.subscriptionReceipts[id] = receipt;
            
            if (!suppressSignal) {
                this.newReceiptsAvailableSignal.dispatch([receipt]);
            }
        }
    } else if (receipt instanceof Receipt) {
        folio = LibraryService.instance.folioMap.getByProductId(receipt.productId);
        if (folio) {
            folio.receipt = receipt;
        }
        
        if (!this.receipts.hasOwnProperty(receipt.productId)) {
            this.receipts[receipt.productId] = receipt;
            
            if (!suppressSignal) {
                this.newReceiptsAvailableSignal.dispatch([receipt]);
            }
        }
    } else {
        throw new Error("ReceiptService.registerNewReceipt received invalid receipt");
    }
    
    return receipt;
};

/**
 * Start a restore purchases transaction. 
 * <br/><em>WARNING: This function should be used sparingly as it may be limited by the 
 * broker.</em>
 * @memberOf adobeDPS-ReceiptService.prototype
 * @returns {adobeDPS-RestorePurchasesTransaction} The started restore purchase transaction
 * @platform iOS
 */
ReceiptService.prototype.restorePurchases = function () {
    var trans = new RestorePurchasesTransaction();
    if (trans) {
        TransactionManager.instance._registerTransaction(trans);
        Log.instance.debug("Starting new RestorePurchasesTransaction");
        
        try {
            return trans.start();
        } catch (e) {
            // remove the transaction
            delete TransactionManager.instance._allTransactions[trans.id];
            
            // propagate error
            throw e;
        }
    } else {
        // This shouldn't happen since we would expect the constructor to throw if it
        // if it isn't going to return, but just in case...
        throw new Error("There was a problem creating the RestorePurchasesTransaction.");
    }
};

/**
 * Add a single subscription product to the list of
 * subscriptions available for purchase
 * @memberOf adobeDPS-ReceiptService.prototype
 * @param {String} subscriptionProductId The product ID of the subscription to be added
 * @returns {adobeDPS-ModifySubscriptionsListTransaction} The started transaction
 * @throws {Error} If the subscription Id to be added is new
 * @platform iOS
 */
ReceiptService.prototype.addSubscription = function (subscriptionProductId) {
    if (toString.call(subscriptionProductId) == '[object String]' && subscriptionProductId != "") {
        return this.addSubscriptions([subscriptionProductId]);
    } else {
        throw new Error("ReceiptService.addSubscription received invalid product ID");
    }
};

/**
 * Add a list of subscription products to the list of
 * subscriptions available for purchase
 * @memberOf adobeDPS-ReceiptService.prototype
 * @param {Array} subscriptionProductIds The product IDs of the subscriptions to be added
 * @returns {adobeDPS-ModifySubscriptionsListTransaction} The started transaction
 * @throws {Error} If none of the subscription Ids to be added are new
 * @platform iOS
 */
ReceiptService.prototype.addSubscriptions = function (subscriptionProductIds) {
    var i, newSubscriptionList, productId;
    
    if (subscriptionProductIds instanceof Array) {
        // Add the new subscriptions indicated if we do not find an existing subscription
        // with the same productId
        newSubscriptionList = [];
        for (i=0;i<subscriptionProductIds.length;i++) {
            productId = subscriptionProductIds[i];
            if (toString.call(productId) == '[object String]' && productId != "") {
                if (this.availableSubscriptions[productId] == null) {
                    newSubscriptionList.push(new Subscription(productId, "", "", "", false));
                }
            } else {
                throw new Error("ReceiptService.addSubscriptions received invalid product ID");
            }
        }
        
        if (newSubscriptionList.length > 0) {
            return this._createModifySubscriptionsListTransaction(newSubscriptionList,[]);
        }  else {
            throw new Error("Tried to add subscription(s) that already existed");
        }
    } else {
        throw new Error("ReceiptService.addSubscriptions received invalid input");
    }
};

/**
 * Remove a single subscription product from the list of
 * subscriptions available for purchase
 * @memberOf adobeDPS-ReceiptService.prototype
 * @param {String} subscriptionProductId The product ID of the subscription to be added
 * @returns {adobeDPS-ModifySubscriptionsListTransaction} The started transaction
 * @throws {Error} If the subscription Id to be removed does not exist
 * @platform iOS
 */
ReceiptService.prototype.removeSubscription = function (subscriptionProductId) {
    if (toString.call(subscriptionProductId) == '[object String]' && subscriptionProductId != "") {
        return this.removeSubscriptions([subscriptionProductId]);
    } else {
        throw new Error("ReceiptService.removeSubscription received invalid product ID");
    }
};

/**
 * Remove a list of subscription products from the list of
 * subscriptions available for purchase
 * @memberOf adobeDPS-ReceiptService.prototype
 * @param {Array} subscriptionProductIds The product IDs of the subscriptions to be added
 * @returns {adobeDPS-ModifySubscriptionsListTransaction} The started transaction
 * @throws {Error} If none of the subscription Ids to be removed exist
 * @platform iOS
 */
ReceiptService.prototype.removeSubscriptions = function (subscriptionProductIds) {
    var i, newSubscriptionList, productId, existingSub;

    if (subscriptionProductIds instanceof Array) {
        newSubscriptionList = [];

        for (i=0;i<subscriptionProductIds.length;i++) {
            productId = subscriptionProductIds[i];
            if (toString.call(productId) == '[object String]' && productId != "") {
                existingSub = this.availableSubscriptions[productId];
                if (existingSub != null) {
                    newSubscriptionList.push(existingSub.productId);
                }
            } else {
                throw new Error("ReceiptService.removeSubscriptions received invalid product ID");
            }
        }

        if (newSubscriptionList.length > 0) {
            return this._createModifySubscriptionsListTransaction([], newSubscriptionList);
        } else {
            throw new Error("Tried to remove subscription(s) that did not exist");
        }
    } else {
        throw new Error("ReceiptService.removeSubscriptions received invalid input");
    }
};

/**
 * Set a single subscription product as the only subscription
 * available for purchase
 * @memberOf adobeDPS-ReceiptService.prototype
 * @param {String} subscriptionProductId The product ID of the subscription to be set
 * @returns {adobeDPS-ModifySubscriptionsListTransaction} The started transaction
 * @platform iOS
 */
ReceiptService.prototype.setSubscription = function (subscriptionProductId) {
    if (toString.call(subscriptionProductId) == '[object String]' && subscriptionProductId != "") {
        return this.setSubscriptions([subscriptionProductId]);
    } else {
        throw new Error("ReceiptService.setSubscription received invalid product ID");
    }
};

/**
 * Set a list of subscription products as the new list of subscriptions 
 * available for purchase
 * @memberOf adobeDPS-ReceiptService.prototype
 * @param {Array} subscriptionProductIds The product IDs of the subscriptions to be set
 * @returns {adobeDPS-ModifySubscriptionsListTransaction} The started transaction
 * @platform iOS
 */
ReceiptService.prototype.setSubscriptions = function (subscriptionProductIds) {
    var i, addedSubscriptions, removedSubscriptions, productId, existingSub;

    if (subscriptionProductIds instanceof Array) {
        addedSubscriptions = [];
        for (i=0;i<subscriptionProductIds.length;i++) {
            productId = subscriptionProductIds[i];
            if (toString.call(productId) == '[object String]' && productId != "") {
                existingSub = this.availableSubscriptions[productId];
                if (existingSub == null) {
                    addedSubscriptions.push(new Subscription(productId, "", "", "", false));
                }
            } else {
                throw new Error("ReceiptService.setSubscriptions received invalid product ID");
            }
        }

        removedSubscriptions = [];
        for (productId in this.availableSubscriptions) {
            if (subscriptionProductIds.indexOf(productId) == -1) {
                removedSubscriptions.push(productId);
            }
        }

        return this._createModifySubscriptionsListTransaction(addedSubscriptions, removedSubscriptions);
    }
    else {
        throw new Error("ReceiptService.setSubscriptions received invalid input");
    }
};

/**
 * Takes a list of subscriptions and create a ModifySubscriptionsListTransaction
 * to communicate with the model which subscription objects should be added and removed
 * from the list of available subscriptions
 * @memberOf adobeDPS-ReceiptService.prototype
 * @private
 * @param {Array} addedSubscriptions product IDs of the subscriptions to be added
 * @param {Array} removedSubscriptions product IDs of the subscriptions to be removed
 * @returns {adobeDPS-ModifySubscriptionsListTransaction} The started transaction
 */
ReceiptService.prototype._createModifySubscriptionsListTransaction = function (addedSubscriptions, removedSubscriptions) {
    var trans = new ModifySubscriptionsListTransaction(addedSubscriptions, removedSubscriptions);
    if (trans) {
        TransactionManager.instance._registerTransaction(trans);
        Log.instance.debug("Starting new ModifySubscriptionsListTransaction");
          Log.instance.debug("ADDING:" + JSON.stringify(addedSubscriptions));
          Log.instance.debug("REMOVING:" + JSON.stringify(removedSubscriptions));
        
        try {
            return trans.start();
        } catch (e) {
            // remove the transaction
            delete TransactionManager.instance._allTransactions[trans.id];
            
            // propagate error
            throw e;
        }
    } else {
        // This shouldn"t happen since we would expect the constructor to throw if it
        // if it isn"t going to return, but just in case...
        throw new Error("There was a problem creating the ModifySubscriptionsListTransaction.");
    }
};

/**
 * Ask the receipt service to present the subscribe dialog.
 * @memberOf adobeDPS-ReceiptService.prototype
 * @platform iOS
 */
ReceiptService.prototype.displaySubscribe = function () {
    Interface.instance._send({
         action: "call",
         path: "receiptService",
             data: {
                 method: "displaySubscribe"
             }
     });
};

/**
 * Initialize the Receipt Service with a JSON update from native.
 * @memberOf adobeDPS-ReceiptService.prototype
 */
ReceiptService.prototype._initialize = function (data) {
    var update, adds, productId, subscriptionReceiptId, splitId, vo, receipt, subscription;
    if (data.hasOwnProperty("update")) {
        update = data.update;
        adds = [];
        
        if (update.hasOwnProperty("activeSubscription")) {
            vo = update.activeSubscription;
            if (vo.type == "Subscription") {
                // Don't pass the type since it is implied
                delete vo.type;
                this.activeSubscription = Subscription._fromJSON(vo);
            } else {
                this.activeSubscription = null;
            }
        }

        if (update.hasOwnProperty("receipts")) {
            for (productId in update.receipts) {
                vo = update.receipts[productId];
                receipt = new Receipt(vo.broker, productId, vo.token);
                this.registerNewReceipt(receipt, true);
                adds.push(receipt);
            }
        }
        
        if (update.hasOwnProperty("availableSubscriptions")) {
            for (productId in update.availableSubscriptions) {
                vo = update.availableSubscriptions[productId];
                this.availableSubscriptions[vo.productId] = new Subscription(productId, vo.title, vo.duration, vo.price, vo.isOwned);
            }
        }
        
        if (update.hasOwnProperty("subscriptionReceipts")) {
            for (subscriptionReceiptId in update.subscriptionReceipts) {
                vo = update.subscriptionReceipts[subscriptionReceiptId];
                splitId = subscriptionReceiptId.split("+");
                if (splitId.length > 0) {
                    productId = splitId[0];
                } else {
                    productId = subscriptionReceiptId;
                }
                receipt = new SubscriptionReceipt(vo.broker, productId, vo.token, new Date(vo.startDate), (vo.endDate === null) ? null : new Date(vo.endDate));
                subscription = this.availableSubscriptions[receipt.productId];
                
                if (subscription && (subscription.receipt === null || subscription.receipt.endDate < receipt.endDate)) {
                    subscription.receipt = receipt;
                    subscription.isOwned = true;
                }
                this.registerNewReceipt(receipt, true);
                adds.push(receipt);
            }
        }
        
        if (adds.length > 0) {
            this.newReceiptsAvailableSignal.dispatch(adds);
            Log.instance.debug("ReceiptService._initialize added " + adds.length + " receipts");
        }
    } else {
        Log.instance.warn("ReceiptService._initialize called without update");
    }
};

/**
 * Update the Receipt Service with a JSON update from native.
 * @memberOf adobeDPS-ReceiptService.prototype
 */
ReceiptService.prototype._update = function (data) {
    var changes, list, update, receiptAdds, subscriptionChanges, i, vo, receipt, id, subscription, idEndIndex;
    Log.instance.debug("ReceiptService._update called: " + JSON.stringify(data));
    if (data.hasOwnProperty("add")) {
        changes = data.add;
        
        receiptAdds = [];
        subscriptionChanges = [];
        for (i = 0; i < changes.length; i++) {
            vo = changes[i];
            
            if (vo.type == "Receipt") {
                receipt = new Receipt(vo.broker, vo.productId, vo.token);
                this.registerNewReceipt(receipt, true);
                receiptAdds.push(receipt);
            } else if (vo.type == "SubscriptionReceipt") {
                receipt = new SubscriptionReceipt(vo.broker, vo.productId, vo.token, new Date(vo.startDate), (vo.endDate === null) ? null : new Date(vo.endDate));
                subscription = this.availableSubscriptions[receipt.productId];
                
                if (subscription && (subscription.receipt === null || subscription.receipt.endDate < receipt.endDate)) {
                    subscription.receipt = receipt;
                    subscription.isOwned = true;
                }
                Log.instance.debug("\nReceiptService updated with Subscription Receipt: " + JSON.stringify(receipt));
                this.registerNewReceipt(receipt, true);
                receiptAdds.push(receipt);
            }else if (vo.type == "Subscription") {
                // Don't pass the type since it is implied
                delete vo.type;
                subscription = Subscription._fromJSON(vo);
                this.availableSubscriptions[vo.productId] = subscription;
                subscriptionChanges.push(subscription);

            } else {
                Log.instance.warn("ReceiptService called with unknown add: " + vo.type);
            }
        }
        
        if (receiptAdds.length > 0) {
            this.newReceiptsAvailableSignal.dispatch(receiptAdds);
            Log.instance.debug("ReceiptService._update added " + receiptAdds.length + " receipts");
        }
        if (subscriptionChanges.length > 0) {
            this.subscriptionsAddedSignal.dispatch(subscriptionChanges);
            Log.instance.debug("ReceiptService._update added " + subscriptionChanges.length + " subscriptions");
        }

        if (receiptAdds.length == 0 && subscriptionChanges.length == 0) {
            Log.instance.warn("ReceiptService._update called with an add that resulted in no new receipts or subscriptions");
        }
    } else if (data.hasOwnProperty("remove")) {
        list = data.remove;
        changes = [];
        for (i = 0; i < list.length; i++) {
            subscription = this.availableSubscriptions[list[i]];

            if(subscription !== null) {
                delete this.availableSubscriptions[subscription.productId];
                changes.push(subscription);
            } else {
                Log.instance.warn("LibraryService._update failed to parse removed subscription: " + list[i]);
            }
        }

        if (changes.length > 0) {
            this.subscriptionsRemovedSignal.dispatch(changes);
            Log.instance.debug("Removed " + changes.length + " subscriptions");
        } else {
            Log.instance.warn("LibraryService._update called with remove that didn't remove any subscriptions");
        }
    } else if (data.hasOwnProperty("update")) {
        update = data.update;
        if (data.path.indexOf("availableSubscriptions") > -1) {
            idEndIndex = data.path.indexOf("']");
            // 24 is the number of characters in availableSubscriptions plus the [' before the id
            id = data.path.substring(24,idEndIndex);
            subscription = this.availableSubscriptions[id];

            if (subscription) {
                subscription._updateFromJSON(update);
            } else {
                Log.instance.warn("ReceiptService._update called with unknown Sub: " + id);
            }
        } else if (update.hasOwnProperty("activeSubscription")) {
            vo = update.activeSubscription;
            if (vo.type == "Subscription") {
                // Don't pass the type since it is implied
                delete vo.type;
                this.activeSubscription = Subscription._fromJSON(vo);
            } else {
                this.activeSubscription = null
            }
            this.updatedSignal.dispatch(["activeSubscription"]);
        }
    } else {
        Log.instance.warn("ReceiptService._update called without add");
    }
};

/**
 * The singleton of the ReceiptService.
 * @static
 * @name instance
 * @memberOf adobeDPS-ReceiptService
 * @platform iOS
 */
ReceiptService.instance = new ReceiptService();

    /**
 * Create a new SettingsService.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class Service to manage the state and updating of application settings.
 * <br/><strong>Accessible from adobeDPS.settingsService</strong>
 * @extends adobeDPS-Service
 * @platform iOS
 * @platform Android
 */
function SettingsService() {
    /**
     * Auto-archive settings manager.
     * @memberOf adobeDPS-SettingsService.prototype
     * @type adobeDPS-AutoArchive
     * @platform iOS
     */
    this.autoArchive = AutoArchive.instance;
    this.analytics = Analytics.instance;
    
    Service.call(this);
}

Service.extend(SettingsService);

/**
 * Initialize the Setting Service with a JSON update from native.
 * @memberOf adobeDPS-SettingService.prototype
 */
SettingsService.prototype._initialize = function (data) {
    var update, setting;
    if (data.hasOwnProperty("update")) {
        update = data.update;
        
        for (setting in update){
            Log.instance.debug("Found " + setting + " setting.");
            if (this.hasOwnProperty(setting)) {
                this[setting]._initialize(update[setting]);
            } else {
                Log.instance.warn("SettingsService._initialize called with unknown setting: " + setting);
            }
        }
    } else {
        Log.instance.warn("SettingsService._initialize called without update");
    }
};

/**
 * Update the Setting Service with a JSON update from native.
 * @memberOf adobeDPS-SettingService.prototype
 */
SettingsService.prototype._update = function (data) {
    var path = this._getNextPathElement(data.path);
    data.path = this._getChildPath(data.path);
    
    switch (path) {
        case "autoArchive":
            Log.instance.debug('Initializing SettingsService.AutoArchive...');
            this.autoArchive._update(data);
            break;
        case "analytics":
            Log.instance.debug('Initializing SettingsService.Analytics...');
            this.analytics._update(data);
            break;
        default:
            Log.instance.warn("SettingsService._update called with an unknown destination: " + path);
            break;
    }
};

/**
 * Display native settings dialog
 * @memberOf adobeDPS-SettingService.prototype
 * @platform Android
 */
SettingsService.prototype.displaySettingsDialog = function () {
    Interface.instance._send({
         action: "call",
         path: "settingsService",
             data: {
                 method: "displaySettingsDialog"
             }
     });
};

/**
 * The singleton of the SettingsService.
 * @static
 * @name instance
 * @memberOf adobeDPS-SettingsService
 * @platform iOS
 */
SettingsService.instance = new SettingsService();
    /**
 * Create a geolocation Coordinates object.
 * @class This class represents the geolocation coordinates. 
 * <br/>This is compatible with the <a href="http://www.w3.org/TR/geolocation-API/#coordinates_interface">WebKit Coordinates interface</a>
 * @param {double} lat The latitude of the position
 * @param {double} lng The longitude of the position
 * @param {double} alt The altitude of the position
 * @param {double} acc The accuracy of the position
 * @param {double} head The direction the device is moving at the position
 * @param {double} vel The velocity with which the device is moving at the position
 * @param {double} altacc The altitude accuracy of the position
 * @platform iOS
 */
 function Coordinates(lat, lng, alt, acc, head, vel, altacc) {
    /**
     * The latitude in decimal degrees. 
     * Positive values indicate latitudes north of the equator. Negative values indicate latitudes south of the equator.
     * @memberOf adobeDPS-Coordinates.prototype
     * @type double
     * @platform iOS
     */
    this.latitude = lat;

    /**
     * The longitude in decimal degrees. 
     * Measurements are relative to the zero meridian, with positive values extending east of the meridian and negative values extending west of the meridian. 
     * @memberOf adobeDPS-Coordinates.prototype
     * @type double
     * @platform iOS
     */
    this.longitude = lng;

    /**
     * The accuracy level of the latitude and longitude coordinates, specified in meters. The value is a non-negative real number.  
     * @memberOf adobeDPS-Coordinates.prototype
     * @type double
     * @platform iOS
     */
    this.accuracy = acc;

    /**
     * The altitude specified in meters. 
     * If the implementation cannot provide altitude information, the value of this attribute is null. 
     * @memberOf adobeDPS-Coordinates.prototype
     * @type double
     * @platform iOS
     */
    this.altitude = (alt !== undefined ? alt : null);

    /**
     * The direction of travel of the device specified in degrees, where 0Â° â‰¤ heading < 360Â°, counting clockwise relative to the true north. 
     * If the implementation cannot provide heading information, the value of this attribute can be null or negative number (-1). 
     * If the hosting device is stationary (i.e. the value of the speed attribute is 0), then the value of the heading attribute is NaN.  
     * @memberOf adobeDPS-Coordinates.prototype
     * @type double
     * @platform iOS
     */
    this.heading = (head !== undefined ? head : null);

    /**
     * The magnitude of the horizontal component of the hosting device's current velocity, specified in meters per second. 
     * A valid speed value is a non-negative real number.
     * If the implementation cannot provide speed information, the value of this attribute can be null or negative number (-1).  
     * @memberOf adobeDPS-Coordinates.prototype
     * @type double
     * @platform iOS
     */
    this.speed = (vel !== undefined ? vel : null);
    if (this.speed === 0 || this.speed === null) {
        this.heading = NaN;
    }

    /**
     * The accuracy of the altitude value in meters.
     * A valid altitudeAccuracy value is a non-negative real number. 
     * If the implementation cannot provide altitude information, the value of this attribute can be null or negative number (-1). 
     * @memberOf adobeDPS-Coordinates.prototype
     * @type double
     * @platform iOS
     */
    this.altitudeAccuracy = (altacc !== undefined) ? altacc : null;
};

/**
 * Create a geolocation Position object.
 * @class This class represents the geolocation position information
 * <br/>This is compatible with the <a href="http://www.w3.org/TR/geolocation-API/#position_interface">WebKit Position interface</a>
 * @param {adobeDPS-Coordinates} coords The location coordinates. 
 * @param {Date} timestamp The timestamp
 * @platform iOS
 */
 var Position = function(coords, timestamp) {
    /**
     * The location coordinates
     * @memberOf adobeDPS-Position.prototype
     * @type adobeDPS-Coordinates
     * @platform iOS
     */
    this.coords = coords;

    /**
     * The time when the location was retrieved
     * @memberOf adobeDPS-Position.prototype
     * @type Date
     * @platform iOS
     */
    this.timestamp = (timestamp === undefined ? new Date() : ((timestamp instanceof Date) ? timestamp : new Date(timestamp)))
};


/**
 * Create a geolocation PositionError object.
 * @class This class represents the geolocation position error
 * <br/>This is compatible with the <a href="http://www.w3.org/TR/geolocation-API/#position_error_interface">WebKit PositionError interface</a>
 * @param {Number} code The error code 
 * @param {String} message The error message corresponding to the error code
 * @platform iOS
 */
 function PositionError(code, message) {
    /**
     * The error code 
     * @memberOf adobeDPS-PositionError.prototype
     * @type Number
     * @platform iOS
     */
    this.code = code || null;

    /**
     * The error message corresponding to the error code 
     * @memberOf adobeDPS-PositionError.prototype
     * @type String
     * @platform iOS
     */
    this.message = message || '';
};

/**
 * Permission denied error code
 * @static
 * @name PERMISSION_DENIED
 * @memberOf adobeDPS-PositionError
 * @platform iOS
 */
PositionError.PERMISSION_DENIED = 1;

/**
 * Position unavailable error code
 * @static
 * @name POSITION_UNAVAILABLE
 * @memberOf adobeDPS-PositionError
 * @platform iOS
 */
PositionError.POSITION_UNAVAILABLE = 2;

/**
 * Location request timeout error code
 * @static
 * @name TIMEOUT
 * @memberOf adobeDPS-PositionError
 * @platform iOS
 */
PositionError.TIMEOUT = 3;


var MAX_INT = Math.pow(2,31)-1;

/**
 * Create a geolocation PositionOptions object.
 * @class This class represents the options passed to the geolocation API
 * <br/>This is compatible with the <a href="http://www.w3.org/TR/geolocation-API/#position_options_interface">WebKit PositionOptions interface</a>
 * @platform iOS
 */
 function PositionOptions() {
    /**
     * A boolean indicating that best possible results are required.
     * A value of true may result in slower response times or increased power consumption. 
     * @memberOf adobeDPS-PositionOptions.prototype
     * @type boolean
     * @platform iOS
     */
    this.enableHighAccuracy = false;

    /**
     * The maximum time (milliseconds) allowed to retrieve a cached position whose age is not greater than the time specified
     * @memberOf adobeDPS-PositionOptions.prototype
     * @type Number
     * @platform iOS
     */
    this.maximumAge = -1;
    
    /**
     * The time (milliseconds) allowed to pass from the call to getCurrentPosition() or watchPosition() until the corresponding successCallback is invoked.
     * If the implementation is unable to successfully acquire a new Position before the given timeout elapses, and no other errors have occurred in this interval, then the corresponding errorCallback must be invoked with a adobeDPS-PositionError object whose code attribute is set to TIMEOUT
     * @memberOf adobeDPS-PositionOptions.prototype
     * @type Number
     * @platform iOS
     */
    this.timeout = -1;    
};

var GeolocationStatus = {
        ERROR: 0,
        SUCCESS: 1,
        UNKNOWN: -1
};

// Returns default params, overrides if provided with values
function parseParameters(options) {
    var opt = new PositionOptions();
    if (options) {
        if (options.maximumAge !== undefined && !isNaN(options.maximumAge) && options.maximumAge >= 0) {
            opt.maximumAge = (options.maximumAge >= MAX_INT) ?  MAX_INT : options.maximumAge;
        }
        if (options.enableHighAccuracy !== undefined) {
            opt.enableHighAccuracy = options.enableHighAccuracy;
        }
        if (options.timeout !== undefined && !isNaN(options.timeout)) {
            if (options.timeout < 0) {
                opt.timeout = 0;
            } else {
                opt.timeout = (options.timeout >= MAX_INT) ?  -1 : options.timeout;
            }
        }
    }

    return opt;
}

// Returns a timeout failure, closed over a specified timeout value and error callback.
function createTimeout(callbackId, timeout) {
    var t = setTimeout(function() {
        var callback = GeolocationService.instance.callbacks[callbackId];
        clearTimeout(callback.timeout.timer);
        callback.timeout.timer = null;
        if (callback.fail) {
            callback.fail({
                code:PositionError.TIMEOUT,
                message:"Position retrieval timed out."
            });
        }
    }, timeout);
    return t;
}


/**
* This is the base random Id identifying a callback in the array of callbacks
*/
var callbackId =  Math.floor(Math.random() * 2000000000);    

/**
 * Create an instance of the GeolocationService.
 * <br/><strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class Service for accessing geolocation data.
 * <br/>This is compatible with the <a href="http://www.w3.org/TR/geolocation-API/#geolocation_interface">WebKit Geolocation interface</a>
 * <br/><strong>Accessible from adobeDPS.geolocation</strong>
 * @extends adobeDPS-Service
 * @platform iOS
 */
function GeolocationService() {

    /**
     * An array of callback pairs (success, fail} registered with the service 
     * @private
     * @memberOf adobeDPS-GeolocationService.prototype
     * @type Object
     */
    this.callbacks =  {}; 

    /**
     * The last cached position 
     * @private
     * @memberOf adobeDPS-GeolocationService.prototype
     * @type String
     */
    this.lastPosition = null;   
    
    Service.call(this);
}

Service.extend(GeolocationService);

/**
 * Update the Geolocation Service with a JSON update from native.
 * @memberOf adobeDPS-GeolocationService.prototype
 * @private
 */
GeolocationService.prototype._update = function (data) {
    if (data.hasOwnProperty("update")) {
       var update = data.update;
        if (update.hasOwnProperty("status")) 
        { 
            var callback = this.callbacks[update.callbackId];
            clearTimeout(callback.timeout.timer);
            
            if (update.status === GeolocationStatus.SUCCESS) {
                if (!(callback.timeout.timer)) {
                   // Timeout already happened, or native fired error callback for this geo request.
                   // Don't continue with success callback but remove the callback from the queue.
                   //return;
                }
                else {
                // Send the update signal with a valid location
                var coords = new Coordinates(update.latitude, update.longitude, update.altitude, update.accuracy, update.course, update.speed, update.altitudeAccuracy);
                var position = new Position(coords, update.timestamp);
                this.lastPosition = position;
                callback.success(position);
                }
            }
            else {
                callback.timeout.timer = null;
                if (callback.fail) 
                {           
                    // Send the update signal with an error
                    var error = new PositionError(update.errorCode, update.errorMessage);  
                    callback.fail(error);        
                }       
            }
            delete this.callbacks[update.callbackId];
        }
        else {
            Log.instance.warn("GeolocationService._update called without status");
        }        
    }   
    else {
        Log.instance.warn("GeolocationService._update called without update");
    }
};

/**
 * Function used to retrieve the current device location. This is compatible with the WebKit geolocation API.
 * @memberOf adobeDPS-GeolocationService.prototype
 * @param {Function} successCallback The callback function that handles the location data when operation succeeds. <br/><em>Callback Signature: successHandler({@link adobeDPS-Position})</em>
 * @param {Function} [errorCallback] The callback function that handles the error when operation fails. <br/><em>Callback Signature: errorHandler({@link adobeDPS-PositionError})</em>
 * @param {adobeDPS-PositionOptions} [options] The options considered when retrieving the position.
 * @throws {Error} If the successCallback is invalid
 * @platform iOS
 * @example
 // Call the API to get the current position.
 adobeDPS.geolocation.getCurrentPosition(
    // The success callback for getCurrentPosition().
    function(position) {
        var coords = position.coords;
        var lat = coords.latitude;
        var lon = coords.longitude;
        
        // Measured in meters. The reported position is within this amount of your location.
        var accuracy = coords.accuracy;
        
        // Altitude measured in meters.
        var altitude = coords.altitude;
        
        // Measured in meters. The reported altitude is within this amount of your location.
        var altitudeAccuracy = coords.altitudeAccuracy;
        
        //  Measure in degrees. -1 if the user is static or the value cannot be determined.
        var heading = coords.heading;
        
        // Measured in meters per second. -1 if the user is static or the value cannot be determined.
        var speed = coords.speed;
        
        // Output the values for getCurrentPosition().
        $("#output").append("latitude: " + lat + "<br>");
        $("#output").append("longitude: " + lon + "<br>");
        $("#output").append("accuracy: " + accuracy + "<br>");
        $("#output").append("altitude: " + altitude + "<br>");
        $("#output").append("altitudeAccuracy: " + altitudeAccuracy + "<br>");
        $("#output").append("heading: " + heading + "<br>");
        $("#output").append("speed: " + speed + "<br>");
    },
    // The error callback for getCurrentPosition().
    function(data) {
        $("#output").append("code: " + data.code + "<br>");
        $("#output").append("message: " + data.message);
    }
 }
 */ 
 GeolocationService.prototype.getCurrentPosition = function (successCallback, errorCallback, options) {
 
        // validate the successCallback
        if (successCallback === undefined || successCallback === null) {
            throw new Error('Invalid success callback function!');
        }
 
        options = parseParameters(options);

        // Timer var that will fire an error callback if no position is retrieved from native
        // before the "timeout" param provided expires
        var timeoutTimer = {timer:null};

        // Check our cached position, if its timestamp difference with current time is less than the maximumAge, then just
        // fire the success callback with the cached position.
        if (this.lastPosition && options.maximumAge && (((new Date()).getTime() - this.lastPosition.timestamp.getTime()) <= options.maximumAge)) {
            successCallback(this.lastPosition);
            return;
        // If the cached position check failed and the timeout was set to 0, error out with a TIMEOUT error object.
        } else if (options.timeout === 0) {
            errorCallback({
                code:PositionError.TIMEOUT,
                message:"timeout value in PositionOptions set to 0 and no cached Position object available, or cached Position object's age exceeds provided PositionOptions' maximumAge parameter."
            });
            return;
        // Otherwise we have to call into native to retrieve a position.
        } else {
            if (options.timeout !== -1) {
                // If the timeout value was not set to Infinity (default), then
                // set up a timeout function that will fire the error callback
                // if no successful position was retrieved before timeout expired.
                timeoutTimer.timer = createTimeout(callbackId, options.timeout);
            } else {
                // This is here so the check in the win function doesn't mess stuff up
                // may seem weird but this guarantees timeoutTimer is
                // always truthy before we call into native
                timeoutTimer.timer = true;
            }
        }

        this.callbacks[callbackId] = {success: successCallback, fail: errorCallback, timeout: timeoutTimer};        
        var enableHighAccuracy = (options && options.enableHighAccuracy !== undefined) ? options.enableHighAccuracy : false;
        
        Interface.instance._send(
            {action: "call", 
                path: "geolocationService",
                data: {
                    method: "getCurrentPosition",
                    callbackId: callbackId,
                    highAccuracy: enableHighAccuracy,
                    maximumAge: options.maximumAge,
                    timeout: options.timeout
                }
            }
         );
         
         callbackId++;
}

/**
 * Function used to monitor the location changes. This is compatible with the WebKit geolocation API.
 * <br/><strong> Currently this API is not supported. Any attempt to call it will throw an exception.</strong>
 * @memberOf adobeDPS-GeolocationService.prototype
 * @param {Function} successCallback The callback function that handles the location data when operation succeeds. <br/><em>Callback Signature: successHandler({@link adobeDPS-Position})</em>
 * @param {Function} [errorCallback] The callback function that handles the error when operation fails. <br/><em>Callback Signature: errorHandler({@link adobeDPS-PositionError})</em>
 * @param {adobeDPS-PositionOptions} [options] The options considered when retrieving the position.
 * @returns {Number} A unique ID of the location monitoring operation 
 * @throws {Error} If the successCallback is invalid
 * @platform iOS
 */ 
 GeolocationService.prototype.watchPosition = function (successCallback, errorCallback, options) {
    throw new Error('geolocation.watchPosition API is currently not supported!');
 }
 
/**
 * Function used to stop monitoring the location changes initiated through watchPosition(). This is compatible with the WebKit geolocation API.
 * <br/><strong> Currently this API is not supported. Any attempt to call it will throw an exception.</strong>
 * @memberOf adobeDPS-GeolocationService.prototype
 * @param {Number} watchId The Id of a watchPosition operation to be cancelled. 
 * @platform iOS
 */ 
 GeolocationService.prototype.clearWatch = function (watchId) {
    throw new Error('geolocation.clearWatch API is currently not supported!');
}

/**
 * The singleton of the GeolocationService.
 * @static
 * @name instance
 * @memberOf adobeDPS-GeolocationService
 * @platform iOS
 */
GeolocationService.instance = new GeolocationService();

    /**
 * Create an instance of the CalendarService.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class Service for accessing the user's calendar and reminders.
 * <br/><strong>Accessible from adobeDPS.calendarService</strong>
 * @extends adobeDPS-Service
 * @platform iOS
 */
function CalendarService() {
    /**
     * An array of callbacks registered with the service
     * @private
     * @memberOf adobeDPS-CalendarService.prototype
     * @type Object
     */
    this.callbacks = {};
  
    Service.call(this);
}
  
Service.extend(CalendarService);
  
// This is the base random Id identifying a callback in the array of callbacks.
var callbackId = Math.floor(Math.random() * 2000000000);
 
// This is the base random Id identifying an event if the eventId is omitted.
var defaultEventId = Math.floor(Math.random() * 2000000000);
 
/**
 * Initialize the Calendar Service with a JSON update from native.
 * @memberOf adobeDPS-CalendarService.prototype
 */
CalendarService.prototype._initialize = function (data) {
};
 
/**
 * Constructor to create an EventItem object.
 * <br/>An EventItem object represents common properties of calendar events and reminder events.
 * @methodOf adobeDPS-CalendarService.prototype
 * @param {String} summary The summary associated with this event item.
 * @param {String} [description] Optional description associated with this event item.
 * @param {String} [location] Optional location associated with this event item.
 * @param {Number[]} [alarms] Optional array of dates for the alarms to be associated with this event item.
 * <br/>Each value is a number of milliseconds such as the value returned by Date.getTime().
 * @platform iOS
 */
CalendarService.prototype.EventItem = function (summary, description, location, alarms) {
    /**
     * The summary associated with this event item.
     * @type String
     * @ignore
     */
    this.summary = summary;
     
    /**
     * The description associated with this event item.
     * @type String
     * @ignore
     */
    this.description = description || undefined;
     
    /**
     * The location associated with this event item.
     * @type String
     * @ignore
     */
    this.location = location || undefined;
     
    /**
     * An array of dates for the alarms to be associated with this event item.
     * <br/>Each value is a number of milliseconds such as the value returned by Date.getTime().
     * @type Array
     * @ignore
     */
    this.alarms = alarms || undefined;
};
  
/**
 * Constructor to create a CalendarEvent object.
 * <br/>A CalendarEvent object represents an event to be added to the user's default calendar.
 * @methodOf adobeDPS-CalendarService.prototype
 * @param {Object} eventItem An EventItem object containing the common event item properties for this calendar event.
 * @param {Number} startDate The start date for this calendar event.
 * <br/>The value is a number of milliseconds such as the value returned by Date.getTime().
 * @param {Number} endDate The end date for this calendar event.
 * <br/>The value is a number of milliseconds such as the value returned by Date.getTime().
 * @param {Boolean} [allDay=false] Indicator if this calendar event is an all-day event.
 * @param {Number} [eventId=an automatically generated number] A value that uniquely identifies this event.
 * @platform iOS
 */
CalendarService.prototype.CalendarEvent = function (eventItem, startDate, endDate, allDay, eventId) {
    /**
     * The common event item properties for this calendar event.
     * @type Object
     * @ignore
     */
    this.eventItem = new CalendarService.instance.EventItem(eventItem.summary, eventItem.description, eventItem.location, eventItem.alarms);
     
    /**
     * The start date for this calendar event.
     * <br/>The value is a number of milliseconds such as the value returned by Date.getTime().
     * @type Number
     * @ignore
     */
    this.startDate = startDate;
     
    /**
     * The end date for this calendar event.
     * <br/>The value is a number of milliseconds such as the value returned by Date.getTime().
     * @type Number
     * @ignore
     */
    this.endDate = endDate;
  
    /**
     * Indicator if this calendar event is an all-day event.
     * @type Boolean
     * @ignore
     */
    this.allDay = allDay || false;

    /**
     * A value that uniquely identifies this event.
     * @type Number
     * @ignore
     */
    this.eventId = eventId || defaultEventId++;
};
  
/**
 * Constructor to create a ReminderEvent object.
 * <br/>A ReminderEvent object represents a reminder event to be added to one of the user's reminder lists.
 * @methodOf adobeDPS-CalendarService.prototype
 * @param {Object} eventItem An EventItem object containing the common event item properties for this reminder event.
 * @param {String} [listTitle=the user's default reminder list] 
 * The title of the list to which this reminder event is to be added.
 * If a reminder list having this title does not already exist, one is created.
 * @param {Number} [dueDate=no due date] The due date for this reminder event.
 * <br/>The value is a number of milliseconds such as the value returned by Date.getTime().
 * @param {Number} [eventId=an automatically generated number] A value that uniquely identifies this event.
 * @platform iOS
 */
CalendarService.prototype.ReminderEvent = function (eventItem, listTitle, dueDate, eventId) {
    /**
     * The common event item properties for this reminder event.
     * @type Object
     * @ignore
     */
    this.eventItem = new CalendarService.instance.EventItem(eventItem.summary, eventItem.description, eventItem.location, eventItem.alarms);
  
    /**
     * The title of the reminder list to which this reminder event is to be added.
     * <br/>If a reminder list having this title does not already exist, one is created.
     * <br/>If listTitle is undefined, the reminder event is added to the user's default reminder list.
     * @type String
     * @ignore
     */
    this.listTitle = listTitle || undefined;

    /**
     * The due date for this reminder event.
     * <br/>The value is a number of milliseconds such as the value returned by Date.getTime().
     * @type Number
     * @ignore
     */
    this.dueDate = dueDate || undefined;

    /**
     * A value that uniquely identifies this event.
     * @type Number
     * @ignore
     */
    this.eventId = eventId || defaultEventId++;
};

/**
 * Internal constructor to create an EventResult object. <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * <br/>An EventResult object describes the result of attempting to add a calendar event or reminder event
 * to the user's calendar.  One EventResult object (for the addEvent method), or an array of EventResult objects (for the addEvents method),
 * is passed as an argument to a successCallback or errorCallback function.  Each parameter in the EventResult constructor
 * is also a property of the EventResult object, and the property has the same name and type as the parameter. 
 * @methodOf adobeDPS-CalendarService.prototype
 * @param {Boolean} success True if the event was successfully added to the user's calendar; otherwise false.
 * Always true in a successCallback function; always false in an errorCallback function.
 * @param {String} eventType "calendar" for a CalendarEvent event, "reminder" for a ReminderEvent event.
 * @param {Number} eventId The eventId, either passed into the CalendarEvent constructor or ReminderEvent constructor, or,
 * if omitted from a constructor, automatically generated, that is associated with this event.
 * @param {Number} [errorCode] In the errorCallback function, a value defined in the ErrorType enumeration
 * that indicates the type of error that occurred; otherwise undefined.
 * @param {String} [errorMessage] In the errorCallback function, a string describing the reason for failure; otherwise undefined.
 * @platform iOS
 */
CalendarService.prototype.EventResult = function (success, eventType, eventId, errorCode, errorMessage) {
    /**
     * @ignore
     */
    this.success = success;

    /**
     * @ignore
     */
    this.eventType = eventType;

    /**
     * @ignore
     */
    this.eventId = eventId;

    /**
     * @ignore
     */
    this.errorCode = errorCode;

    /**
     * @ignore
     */
    this.errorMessage = errorMessage;
};

/**
 * Update the Calendar Service with the application context JSON update from native.
 * @memberOf adobeDPS-CalendarService.prototype
 */
CalendarService.prototype._update = function (data) {
    if (data.hasOwnProperty("update")) {
        if (data.update.hasOwnProperty("callbackId")) {
            var resultsCount = 0;
            var callbackInfo = this.callbacks[data.update.callbackId];

            if (callbackInfo.hasOwnProperty("method")) {
                var results = null, isSingleEntryResult;

                if (callbackInfo.method == "addEvents") {
                    results = data.update.results;
                    isSingleEntryResult = false;
                } else if (callbackInfo.method == "addEvent") {
                    results = [ data.update.results ];
                    isSingleEntryResult = true;
                }
                
                if (results) {
                    resultsCount = results.length;
                    var i, successResults = [], errorResults = [];
                    var successResultsIdx = 0, errorResultsIdx = 0;
                    for (i = 0; i < resultsCount; i++) {
                        var result = results[i];
                        if (result.success) {
                            successResults[successResultsIdx++] = result;
                        } else {
                            errorResults[errorResultsIdx++] = result;
                        }
                    }
        
                    if (successResultsIdx > 0) {
                        if (isSingleEntryResult) {
                            callbackInfo.successCallback(successResults[0]);
                        } else {
                            callbackInfo.successCallback(successResults);
                        }
                    }
                        
                    if (errorResultsIdx > 0) {
                        if (isSingleEntryResult) {
                            callbackInfo.errorCallback(errorResults[0]);
                        } else {
                            callbackInfo.errorCallback(errorResults);
                        }
                    }
                }
            }
                
            // Some results may be deferred until the user gives permission, so don't
            // delete the callback info until all results have been received.
            callbackInfo.eventCount -= resultsCount;
            if (callbackInfo.eventCount == 0) {
                delete this.callbacks[data.update.callbackId];
            }
        } else {
            Log.instance.warn("CalendarService._update called without callbackId");
        }
    } else {
        Log.instance.warn("CalendarService._update called without update");
    }
};
  
/**
 * Defines error codes for calendar operations.
 * </br></br>
 * <table border="1" summary="Error Codes">
 * <tr><th align="left">Name</th><th align="left">Value</th><th align="left">Description</th></tr>
 * <tr><td>Unknown</td><td>0</td><td>an error other than the errors defined here has occurred</td></tr>
 * <tr><td>AccessToCalendarRestricted</td><td>1</td><td>the app is not authorized to access the user's calendar</td></tr>
 * <tr><td>AccessToRemindersRestricted</td><td>2</td><td>the app is not authorized to access the user's reminders</td></tr>
 * <tr><td>AccessToCalendarDenied</td><td>3</td><td>the user explicitly denied access to the user's calendar for the app</td></tr>
 * <tr><td>AccessToRemindersDenied</td><td>4</td><td>the user explicitly denied access to the user's reminders for the app</td></tr>
 * </table>
 * </br></br>
 * @fieldOf adobeDPS-CalendarService.prototype
 * @platform iOS
 */
CalendarService.prototype.ErrorType = {
    /** 
     * <strong>Value: 0</strong>, an error other than the errors defined here has occurred.
     * @static
     * @ignore
     */
    Unknown: 0,
    /** 
     * <strong>Value: 1</strong>, the app is not authorized to access the user's calendar.
     * @static
     * @ignore
     */
    AccessToCalendarRestricted: 1,
    /** 
     * <strong>Value: 2</strong>, the app is not authorized to access the user's reminders.
     * @static
     * @ignore
     */
    AccessToRemindersRestricted: 2,
    /** 
     * <strong>Value: 3</strong>, the user explicitly denied access to the user's calendar for the app.
     * @static
     * @ignore
     */
    AccessToCalendarDenied: 3,
    /** 
     * <strong>Value: 4</strong>, the user explicitly denied access to the user's reminders for the app.
     * @static
     * @ignore
     */
    AccessToRemindersDenied: 4
};

/**
 * Function to add one calendar event or reminder event to the user's calendar.
 * @memberOf adobeDPS-CalendarService.prototype
 * @param {Object} event A CalendarEvent or ReminderEvent object to be added to the user's calendar.
 * @param {Function} [successCallback] A callback function to be called with the result of a
 * successful attempt to add the event to the user's calendar.
 * <br/>If the caller does not need to process a successful result, this argument can be omitted.
 * <br/><em>Callback Signature: successCallback(result)</em>
 * <br/><em>result</em> is an EventResult object that describes the result of a successful attempt to add the event to the user's calendar.
 * See the EventResult constructor for a description of the EventResult object properties.
 * @param {Function} [errorCallback] A callback function to be called with the result of an
 * unsuccessful attempt to add the event to the user's calendar.
 * <br/>If the caller does not need to process an unsuccessful result, this argument can be omitted.
 * <br/><em>Callback Signature: errorCallback(result)</em>
 * <br/><em>result</em> is an EventResult object that describes the result of an unsuccessful attempt to add the event to the user's calendar.
 * See the EventResult constructor for a description of the EventResult object properties.
 * @example
// Sample code to create an event in the user's calendar
var hourMs = 1000 * 60 * 60;    // milliseconds in an hour for convenience
var gradStartTime = new Date("07/18/2014 13:00:00").getTime();
var gradEndTime = gradStartTime + (4 * hourMs);
var gradAlarmTime = gradStartTime - (1 * hourMs);
var gradEventItem = new adobeDPS.calendarService.EventItem("Bob's College Graduation", "Meet at the Science Center", "International University, New York", [ gradAlarmTime ]);
var gradCalendarEvent = new adobeDPS.calendarService.CalendarEvent(gradEventItem, gradStartTime, gradEndTime);
adobeDPS.calendarService.addEvent(gradCalendarEvent, function (result) {
    alert("Success!\nEvent Type: " + result.eventType + "\nEvent ID: " + result.eventId);
}, function (result) {
    alert("Failure!\nEvent Type: " + result.eventType + "\nEvent ID: " + result.eventId + "\nError Code: " + result.errorCode + "\nError Message: " + result.errorMessage);
});
 * @platform iOS
 */
CalendarService.prototype.addEvent = function (event, successCallback, errorCallback) {
    var nativeData = {
        method: "addEvent",
        event: event,
        callbackId: callbackId
    };
    var callbackInfo = {
        method: nativeData.method,
        eventCount: 1,
        successCallback: successCallback || function (results) {},
        errorCallback: errorCallback || function (results) {}
    };
    this.callbacks[callbackId] = callbackInfo;
    Interface.instance._send(
        {
            action:"call",
            path: "calendarService",
            data: nativeData
        }
    );
    callbackId++;
};

/**
 * Function to add one or more calendar events and reminder events to the user's calendar.
 * @memberOf adobeDPS-CalendarService.prototype
 * @param {Array} events An array of CalendarEvent and ReminderEvent objects for the
 * calendar events and reminder events to be added to the user's calendar.
 * @param {Function} [successCallback] A callback function to be called with the results of the
 * successful attempts to add calendar events and reminder events to the user's calendar.
 * <br/>If the caller does not need to process successful results, this argument can be omitted.
 * <br/><em>Callback Signature: successCallback(results)</em>
 * <br/><em>results</em> is an array of EventResult objects.  Each object describes the result of a
 * successful attempt to add a calendar event or reminder event to the user's calendar.
 * See the EventResult constructor for a description of the EventResult object properties.
 * @param {Function} [errorCallback] A callback function to be called with the results of the
 * unsuccessful attempts to add calendar events and reminder events to the user's calendar.
 * <br/>If the caller does not need to process unsuccessful results, this argument can be omitted.
 * <br/><em>Callback Signature: errorCallback(results)</em>
 * <br/><em>results</em> is an array of EventResult objects. Each object describes the result of an
 * unsuccessful attempt to add a calendar event or reminder event to the user's calendar.
 * See the EventResult constructor for a description of the EventResult object properties.
 * @example
// Sample code to create a reminder list of ingredients to make chocolate chip cookies
var groceryListName = "Chocolate Chip Cookie Ingredients";
var groceryList = [
    "2 1/4 cups all-purpose flour", "1 cup butter", "1 teaspoon baking soda", "1/2 teaspoon salt", "1 cup granulated sugar",
    "2/3 cup brown sugar", "1/2 teaspoon vanilla extract", "2 large eggs", "2 1/2 cups chocolate chips"
];
var groceryEventItem = new adobeDPS.calendarService.EventItem();
var groceryReminders = [];
var i;
for (i = 0; i < groceryList.length; i++) {
    groceryEventItem.summary = groceryList[i];
    groceryReminders[i] = new adobeDPS.calendarService.ReminderEvent(groceryEventItem, groceryListName);
}
adobeDPS.calendarService.addEvents(groceryReminders, function (results) {
    var i;
    for (i = 0; i < results.length; i++) {
        var result = results[i];
        alert("Event ID: " + result.eventId + " was successfully added." );
    }
}, function (results) {
    var i;
    for (i = 0; i < results.length; i++) {
        var result = results[i];
        alert("Event ID: " + result.eventId + " was not successfully added.  Error Code: " + result.errorCode +
              " Error Message: " + result.errorMessage);
    }
});
 * @platform iOS
 */
CalendarService.prototype.addEvents = function (events, successCallback, errorCallback) {
    var nativeData = {
        method: "addEvents",
        events: events,
        callbackId: callbackId
    };
    var callbackInfo = {
        method: nativeData.method,
        eventCount: events.length,
        successCallback: successCallback || function (results) {},
        errorCallback: errorCallback || function (results) {}
    };
    this.callbacks[callbackId] = callbackInfo;
    Interface.instance._send(
        {
            action:"call",
            path: "calendarService",
            data: nativeData
        }
    );
    callbackId++;
};

/**
 * The singleton of the CalendarService.
 * @static
 * @name instance
 * @memberOf adobeDPS-CalendarService
 * @platform iOS
 */
CalendarService.instance = new CalendarService();
    function isDefined(entity) {
    return !(entity === undefined || entity === null);
}

function isValidCallback(callback) {
    return (isDefined(callback) && (typeof callback === "function"));
}

function isValidOptionalCallback(callback) {
    return (isValidCallback(callback) || !isDefined(callback));
}

function throwErrorIfInvalid(callback, error) {
    if (!isValidCallback(callback)) {
         throw new Error(error);
    }    
}

function isValidRecordingId(recId) {
    return (isDefined(recId) && (typeof recId === "string") && (recId.length > 0) &&
            (recId.length < 65) && recId.search("[\'\"\\\n\r\t\b\f]+") === -1);
}

function isValidOptionalRecordingId(recId) {
    return (isValidRecordingId(recId) || !isDefined(recId) ||
            ((typeof recId === "string") && (recId.length === 0)));
}

function isValidConfig(config, supportedEventNames) {
    if (!isDefined(config)) {
        return false;   
    }

    if (!(config.hasOwnProperty('eventsFilter') && config.hasOwnProperty('enableRecordingStatusUI'))) {
        return false;
    }

    if (!(typeof config['enableRecordingStatusUI'] === 'boolean')) {
        return false;
    }
    
    var eFilter = config['eventsFilter'];
    for (var i in eFilter) {
        if (eFilter.hasOwnProperty(i)) {
            if (!(typeof eFilter[i] ==='string') || (supportedEventNames.indexOf(eFilter[i]) === -1)) {
                return false;
            }
        }
    }

    return true;
}

function call(func, data) {
    if (isValidCallback(func)) {
        func(data);
    }
}

var FolioActivityStatus = {
        ERROR: 0,
        SUCCESS: 1,
        UNKNOWN: -1
};

/**
 * Create a FolioActivityRecording object.
 * 
 * <br/><strong>This is an internal constructor and shouldn't be called by regular
 * users.</strong>
 * <p/>
 * An array of these instances is stored in the {@link adobeDPS-FolioActivityService} <em>recordings</em>
 * field.  This array is in time order, with the latest, current recording at index 0.
 * <p/>
 * The JavaScript context is destroyed when switching between the custom web view slot and the
 * library or folio viewing slots, but these objects persist, along with the activity history
 * itself, across the activation and deactivation of the service.  The most current recording must
 * be examined whenever the JavaScript application initializes itself in order to pick up from where
 * it left off.
 * <p/>
 * The <em>stateCode</em> field is set to one of the states defined by the
 * {@link adobeDPS-FolioActivityRecordingStates} object.
 *
 * @class This class encapsulates the state of a FolioActivityService recording.  
 * 
 * @param {Object} recording The folio activity recording.  This class is not directly
 * instantiated by the application.
 * 
 * <p/><strong>Accessible from adobeDPS.folioActivityRecording</strong>
 * @platform iOS
 * @platform Windows
 */
function FolioActivityRecording(recording) {
    /**
     * The state code. One of RECORDING_STARTED, RECORDING_STOPPED, or
     * RECORDING_STOPPED_BY_ERROR.
     * 
     * @memberOf adobeDPS-FolioActivityRecording.prototype
     * @type FolioActivityRecordingStates
     */
    this.stateCode = recording.stateCode;

    /**
     * The current recording identifier.  This is set by <em>startRecording()</em>.  All events recorded
     * will be associated with this recording identifer until a new one is supplied.
     * 
     * @memberOf adobeDPS-FolioActivityRecording.prototype
     * @type String
     */
    this.recordingId = recording.recordingId;

    /**
     * The number of events collected for the current recording so far.
     * 
     * @memberOf adobeDPS-FolioActivityRecording.prototype
     * @type Number
     */
    this.eventsCount = recording.eventsCount;

    /**
     * A list of any errors generated on the native side since JavaScript service deactivation.
     * These can't be immediately relayed to the JavaScript application, so they are cached for
     * examination by the application when the JavaScript context is re-established.
     * 
     * @memberOf adobeDPS-FolioActivityRecording.prototype
     * @type Array
     */
    this.errors = recording.errors;
    
    /**
     * The events filter in the form of an array of event names; if its value is defined then
     * only the events with the specified names in the filter will be recorded.  It may be left
     * undefined to record all supported events.
     * 
     * @memberOf adobeDPS-FolioActivityRecording.prototype
     * @type Array
     */
    this.eventsFilter = recording.eventsFilter;

    /**
     * If true then a recording status indicator will be provided in the folio viewer UI.
     * @memberOf adobeDPS-FolioActivityRecording.prototype
     * @type boolean
     */
    this.enableRecordingStatusUI = recording.enableRecordingStatusUI;
}

/**
 * This is an enumeration of the recording states that can be held by a
 * {@link adobeDPS-FolioActivityRecording} object.
 *
 * @namespace These values are used in the {@link adobeDPS-FolioActivityRecording} <em>stateCode</em> field.
 * @see adobeDPS-FolioActivityRecording#stateCode
 * @enum {Number}
 * @platform iOS
 * @platform Windows
 */
var FolioActivityRecordingStates = {
    /** 
     * <strong>Value: 1</strong>
     * <br/>The recording has started. 
     * It indicates that a recording is currently in progress. 
     * It is set as a result of user interaction. 
     */
    RECORDING_STARTED: 1,

    /** 
     * <strong>Value: 2</strong>
     * <br/>The recording has stopped. 
     * It indicates that no recording is currently in progress. 
     * It is set as a result of user interaction. 
     */
    RECORDING_STOPPED: 2,

    /** 
     * <strong>Value: 3</strong>
     * <br/>The recording was stopped by an error. 
     * It indicates that the recording was forcibly stopped due to a critical error while interacting with a folio. 
     * It is set as a result of a system error.
     */
    RECORDING_STOPPED_BY_ERROR: 3,

    /** 
     * <strong>Value: 4</strong>
     * <br/>The recording was stopped by application shutdown. 
     * It indicates that the recording was forcibly stopped due to the application shutdown. 
     */
    RECORDING_STOPPED_BY_APP_SHUTDOWN: 4
};

/**
 * @namespace This is an enumeration object defining all the supported
 * {@link adobeDPS-FolioActivityService} error codes.
 * @enum {Number}
 * @platform iOS
 * @platform Windows
 */
var FolioActivityErrorCodes = {
    /** 
     * <strong>Value: 1</strong>
     * <br/>The storage has run out of space. 
     * This error occurs when the internal storage runs out of space during event insertions.  This
     * is considered a critical error which will result in the recording being stopped.  The user
     * must get the existing events from the storage by calling getEvents(), use them for the app
     * purpose (upload to a server) and delete the events from storage.
     */
    STORAGE_OUT_OF_SPACE: 1,

    /** 
     * <strong>Value: 2</strong>
     * <br/>The storage operation encountered a I/O error. 
     * This error occurs when the internal storage encounters an I/O error during an event
     * insertion, retrieval or deletion.  The user must retry the operation that caused this error
     * (in the case of getEvents or deleteEvents) or retrieve the events, use them for the app
     * purpose and delete storage (in the case of insertions)
     */
    STORAGE_IO_ERROR: 2,

    /** 
     * <strong>Value: 11</strong>
     * <br/>The recording already started. 
     * This error indicates that a recording is already in progress. Only one recording is allowed
     * at a time. It occurs when 2 or more subsequent startRecording() calls are made without
     * explicitly stop the recording in between.  The user must stop the current recording prior to
     * calling startRecording.
     */
    RECORDING_ALREADY_STARTED: 11,

    /** 
     * <strong>Value: 12</strong>
     * <br/>The recording is not started. 
     * This error indicates that there is no recording in progress. It occurs when 2 or more
     * subsequent stopRecording() calls are made without starting the recording in between.  The
     * user must start a recording prior to calling stopRecording.
     */
    RECORDING_NOT_STARTED: 12,

    /** 
     * <strong>Value: 13</strong>
     * <br/>The recording ID is invalid. 
     * This error indicates an invalid recording Id provided to startRecording.  The user must
     * ensure the recording id is a reference to a non-empty JavaScript string of no more than 64
     * printable characters.  The special characters \' \" \\ \n \r \t \b \f are not allowed in the
     * recording identifier.
     */
    RECORDING_INVALID_ID: 13,
    
    /** 
     * <strong>Value: 14</strong>
     * <br/>The function parameter is invalid. 
     * This error indicates that an invalid argument has been provided.  
     */
    RECORDING_INVALID_ARGUMENT: 14
};

/**
 * Create an instance of FolioActivityConfig.
 * 
 * @class This class defines the configuration for the FolioActivityService event recording.  It is
 * used when calling <em>startRecording()</em>.
 * <br/><strong>Accessible from adobeDPS.folioActivityService.FolioActivityConfig.</strong>
 * @param {Array} eventsFilter The events filter in the form of an array of event names 
 * @param {boolean} enableRecordingStatusUI If true the user will be informed by a dialog about critical 
 * errors that may stop futher recordings of folio activity.
 * @platform iOS
 * @platform Windows
 */
function FolioActivityConfig(eventsFilter, enableRecordingStatusUI) {
    /**
     * The events filter in the form of an array of event names; if its value is defined then
     * only the events with the specified names in the filter will be recorded.  It may be left
     * undefined to record all supported events.
     * 
     * @memberOf adobeDPS-FolioActivityConfig.prototype
     * @type Array
     */
    this.eventsFilter = eventsFilter;

    /**
     * If set to true, the user will be informed via a dialog about critical errors that may stop 
     * the current recording of folio activity. This is useful information because during context 
     * browsing, JS application cannot receive such errors until the JS side of the service is 
     * reinitialized; the dialog could help the user to understand that folio activity might not 
     * be recorded if browsing continues.
     *
     * @memberOf adobeDPS-FolioActivityConfig.prototype
     * @type boolean
     */
    this.enableRecordingStatusUI = enableRecordingStatusUI;
}

/**
 * Create an instance of the FolioActivityService.
 * 
 * <br/><strong>This is an internal constructor and shouldn't be called by regular
 * users.</strong>
 * 
 * @class This class defines the service to monitor folio activity events.
 * <br/><strong>Accessible from adobeDPS.folioActivityService</strong>
 * @extends adobeDPS-Service
 * @platform iOS
 * @platform Windows
 */
function FolioActivityService() {   
    /**
     * The supported event names.  These are strings that can be used to filter for desired events by setting the
     * <em>eventsFilter</em> field in {@link adobeDPS-FolioActivityConfig}.
     * <p/>The supported event names are:
     * <ul>
     * <li>Issue Download Started</li>
     * <li>Issue Download Completed</li>
     * <li>Issue Download Terminal Error</li>
     * <li>Issue Download Cancelled</li>
     * <li>Content View</li>
     * <li>Content Browse</li>
     * <li>AD View</li>
     * <li>Edit view</li>
     * <li>Overlay Started</li>
     * <li>Overlay Stopped</li>
     * <li>URL clicks</li>
     * <li>Social Content Share</li>
     * <li>End of article reached</li>
     * <li>Custom Event 1</li>
     * <li>Custom Event 2</li>
     * <li>Custom Event 3</li>
     * <li>Custom Event 4</li>
     * <li>Custom Event 5</li>
     * <li>Custom Event 6</li>
     * <li>Custom Event 7</li>
     * <li>Custom Event 8</li>
     * <li>Custom Event 9</li>
     * <li>Custom Event 10</li>
     * </ul>
     * @memberOf adobeDPS-FolioActivityService.prototype
     * @type Array
     */
    this.supportedEventNames = null;

    /**
     * The supported event attributes.  These are the keys (as strings) that will be present in the
     * event objects return by <em>getEvents()</em>.  If the attribute is not present then its value
     * will be an empty string.
     * <p/>The supported event attributes are:
     * <ul>
     * <li>eventName</li>
     * <li>eventTime</li>
     * <li>appVersion</li>
     * <li>publicationId</li>
     * <li>issueId</li>
     * <li>stackId</li>
     * <li>screenId</li>
     * <li>contentTitle</li>
     * <li>overlayId</li>
     * <li>overlayType</li>
     * <li>networkStatus</li>
     * <li>deviceOrientation</li>
     * <li>issueName</li>
     * <li>adStackTitle</li>
     * <li>contentType</li>
     * <li>articleStackTitle</li>
     * <li>entitlementCategory</li>
     * <li>downloadError</li>
     * <li>downloadState</li>
     * <li>sharingMode</li>
     * <li>appStore</li>
     * <li>pushToken</li>
     * <li>viewerVersion</li>
     * <li>url</li>
     * <li>urlDestination</li>
     * <li>viewerType</li>
     * <li>findMethod</li>
     * <li>subscriberId</li>
     * <li>subscriberType</li>
     * <li>startupSource</li>
     * <li>engagementType</li>
     * <li>pushNotificationId</li>
     * <li>customVariable1</li>
     * <li>customVariable2</li>
     * <li>customVariable3</li>
     * <li>customVariable4</li>
     * <li>customVariable5</li>
     * <li>customVariable6</li>
     * <li>customVariable7</li>
     * <li>customVariable8</li>
     * <li>customVariable9</li>
     * <li>customVariable10</li>
     * </ul>
     * @memberOf adobeDPS-FolioActivityService.prototype
     * @type Array
     */
    this.supportedEventAttributes = null;
    
    /**
     * The current recording identfier. This is set to the recording in progress (started) or to the
     * last known recording if it was stopped by app shutdown.  It is always set to the last known
     * recording identifier from the native side when the JavaScript service is initialized.
     *
     * The recording represented by this identifier is always part of the <em>recordings</em> array if the
     * identifier is valid.
     * 
     * @memberOf adobeDPS-FolioActivityService.prototype
     * @type String
     */
    this.currentRecordingId = null;
    
    /**
     * The array of active recordings in the form of {@link adobeDPS-FolioActivityRecording}
     * objects. This represents the history of recordings that still have events associated with
     * them (eventsCount > 0).
     *
     * It contains previous non-empty recordings plus the current recording (started) in descending
     * chronological order. Thus the first element in the array is the last recording (currently
     * started or last stopped).
     *
     * @memberOf adobeDPS-FolioActivityService.prototype
     * @type Array
     */
    this.recordings = null;
    
    /**
     * The signal used to indicate that the recording service state has changed.  The state changes
     * in response to updates to any of the recording objects in the <em>recordings</em> field or
     * <em>currentRecordingId</em> field.
     * <p/>
     * This can be as a result of calling startRecording(), stopRecording(), deleteEvents(), and any
     * errors they generate.  An application may register a handler for this signal in order to
     * track the state of the recording.
     * 
     * @memberOf adobeDPS-FolioActivityService.prototype
     * @type Signal
     */
    this.stateChangedSignal = new Signal();
    
    /**
     * The supported recording states as an enum object.
     * @memberOf adobeDPS-FolioActivityService.prototype
     * @type Object
     */
    this.FolioActivityRecordingStates = FolioActivityRecordingStates;

    /**
     * The supported error codes as an enum object.
     * @memberOf adobeDPS-FolioActivityService.prototype
     * @type Object
     */
    this.FolioActivityErrorCodes = FolioActivityErrorCodes;

    /**
    * Internal - The base random Id identifying a callback in the array of callbacks.
    * @private
    */
    this.callbackId =  Math.floor(Math.random() * 2000000000);  

    /**
    * Internal - The array of callbacks.
    * @private
    */
    this.callbacks = {};  

    Service.call(this);
}

// Extend Service with FolioActivityService
Service.extend(FolioActivityService);

// The FolioActivityConfig constructor is available as adobeDPS.folioActivityService.FolioActivityConfig
FolioActivityService.prototype.FolioActivityConfig = FolioActivityConfig;

/**
 * Initialize the FolioActivity Service with a JSON update from native.
 * @memberOf adobeDPS-FolioActivityService.prototype
 * @platform iOS
 * @platform Windows
 */
FolioActivityService.prototype._initialize = function (data) {
    if (data.hasOwnProperty("update")) {
        var update = data.update;

        if (update.hasOwnProperty("supportedEventNames")) {
            this.supportedEventNames = update.supportedEventNames;
        }
        if (update.hasOwnProperty("supportedEventAttributes")) {
            this.supportedEventAttributes = update.supportedEventAttributes;
        }
        if (update.hasOwnProperty("recordings")) {
            this.recordings = update.recordings;
        }
        if (update.hasOwnProperty("currentRecordingId")) {
            this.currentRecordingId = update.currentRecordingId;
        }
    } else {
        Log.instance.warn("FolioActivityService._initialize called without update");
    }
};

/**
 * Update the FolioActivity Service with a JSON update from native.
 * @memberOf adobeDPS-FolioActivityService.prototype
 * @private
 */
FolioActivityService.prototype._update = function (data) {
    if (data.hasOwnProperty("update")) {
        var update = data.update;
        if (update.hasOwnProperty("status")) {
            var callback = this.callbacks[update.callbackId];
            delete this.callbacks[update.callbackId];
            
            // Update recordings if changed
            if ((update.currentRecordingId !== undefined && this.currentRecordingId !== update.currentRecordingId) ||
                (update.recordings !== undefined && this.recordings !== update.recordings))         
            {
                this.recordings = update.recordings;
                this.currentRecordingId = update.currentRecordingId;
                this.stateChangedSignal.dispatch();
            }

            if (update.status === FolioActivityStatus.SUCCESS) {
                if (isDefined(callback)) {
                    // The callback is valid only for responses to the API requests
                    switch (callback.type) {
                        case 'getEvents':
                            call(callback.successCB, {recordingId: update.recordingId, events: update.events});
                            break;
                        case 'deleteEvents':
                            call(callback.successCB, update.recordingId);
                            break;
                        default:
                            callback.successCB();
                            break;
                    }
                }
                else {
                    // The callback is invalid only for dynamic updates (such as new events) to the current recording 
                    if (!isDefined(update.eventsCount)) return;
                    for (var i=0; i<this.recordings.length; ++i) {
                        if (this.recordings[i].recordingId == update.recordingId) {
                            this.recordings[i].eventsCount = update.eventsCount;
                            this.stateChangedSignal.dispatch();
                            break;
                        }
                    }
                }
            }
            else {
                // Error response mainly valid for failed API requests (with valid callback)
                if (isDefined(callback)) {
                    if(update.storageSize === undefined) {
                        // recordingId might be null for some updates (such as resetService).
                        call(callback.errorCB, {recordingId: update.recordingId,
                                            error: {code: update.errorCode, message: update.errorMessage}});
                    }
                    else {
                        call(callback.errorCB, {recordingId: update.recordingId,
                            error: {code: update.errorCode, message: update.errorMessage, storageSize: update.storageSize}});
                    }
                }
            }
        }
    } else {
        Log.instance.warn("FolioActivityService._update called without update data");
    }
}

/**
 * Initiates recording of user-generated folio events.  The specified recording identifier is
 * associated with all subsequently generated events. The events and associated identifier are
 * recorded in persistent non-encrypted storage.
 * <p/>
 * If an event filter is not supplied in the config parameter or the events filter is an empty
 * array, then all events are recorded; otherwise, only the event names in the filter are
 * recorded.
 * <p/>
 * Only one active recording is permitted. If <em>startRecording()</em> is called while a recording is in
 * progress an error will be returned to the error handler with the code
 * FolioActivityErrorCodes.RECORDING_ALREADY_STARTED.
 * <p/>
 * The recordingId must be a valid non-empty JavaScript string of no more than 64 printable
 * characters.  The special characters \' \" \\ \n \r \t \b \f are not allowed in the recording
 * identifier.
 * 
 * @memberOf adobeDPS-FolioActivityService.prototype
 * @param {String} recordingId The recording identifier under which the events are stored.
 * @param {FolioActivityConfig} config The recording configuration.
 * See {@link adobeDPS-FolioActivityConfig}
 *
 * @param {Function} successCB The callback function that handles the success of the
 * request. <br/><em>Callback Signature: successCB()</em>
 *
 * @param {Function} errorCB The callback function that handles the error when request
 * fails. <br/><em>Callback Signature: errorCB({recordingId: String, error: Object})</em>
 * 
 * @throws {Error} If the errorCB is invalid
 * @platform iOS
 * @platform Windows
 */
FolioActivityService.prototype.startRecording = function(recordingId, config, successCB, errorCB) {
    throwErrorIfInvalid(errorCB, 'Undefined error callback function');
     
    if (!isValidConfig(config, this.supportedEventNames)) {
        var error = {code: FolioActivityErrorCodes.RECORDING_INVALID_ARGUMENT, message: "Invalid config"};
        errorCB({recordingId: recordingId, error: error});
        return;
    }
    
    if (!isValidRecordingId(recordingId)) {
        var error = {code: FolioActivityErrorCodes.RECORDING_INVALID_ID, message: "Invalid recordingId"};
        errorCB({recordingId: recordingId, error: error});
        return;
    }
 
    if (!isValidOptionalCallback(successCB)) {
        var error = {code: FolioActivityErrorCodes.RECORDING_INVALID_ARGUMENT, message: "Invalid success callback"};
        errorCB({recordingId: recordingId, error: error});
        return;
    }
                
    this.callbacks[this.callbackId] = {type: "startRecording", successCB: successCB, errorCB: errorCB};   
    Interface.instance._send(
        {action: "call", 
        path: "folioActivityService",
        data: {
            method: "startRecording",
            callbackId: this.callbackId,
            recordingId: recordingId,
            config: config
            }
        }
    );
    
    this.callbackId++;
}

/**
 * Function used to stop folio events recording for the current recording identifier. If
 * <em>stopRecording()</em> is called before any recording is started an error will be returned to the
 * error handler with the code FolioActivityErrorCodes.RECORDING_NOT_STARTED.
 * 
 * @memberOf adobeDPS-FolioActivityService.prototype
 * @param {Function} successCB The callback function that handles the success of the
 * request. <br/><em>Callback Signature: successCB()</em>
 * @param {Function} errorCB The callback function that handles the error when request
 * fails. <br/><em>Callback Signature: errorCB({recordingId: String, error: Object})</em>
 * @throws {Error} If the errorCB is invalid
 * @platform iOS
 * @platform Windows
 */
FolioActivityService.prototype.stopRecording = function(successCB, errorCB) {  
    throwErrorIfInvalid(errorCB, 'Undefined error callback function');
 
    if (!isValidOptionalCallback(successCB)) {
        var error = {code: FolioActivityErrorCodes.RECORDING_INVALID_ARGUMENT, message: "Invalid success callback"};
        errorCB({recordingId: undefined, error: error});
        return;
    } 
            
    this.callbacks[this.callbackId] = {type: "stopRecording", successCB: successCB, errorCB: errorCB};   
    Interface.instance._send(
        {action: "call", 
        path: "folioActivityService",
        data: {
            method: "stopRecording",
            callbackId: this.callbackId
            }
        }
    );
    
    this.callbackId++;
}

/**
 * Function used to retrieve the recorded events from the persistent storage for a given recording
 * identifier. <em>successCB()</em> is called with an array of all currently recorded events that
 * match the given recordingId.
 * <p/>
 * This does not delete the events from the storage. In order to delete them from the storage
 * <em>deleteEvents()</em> must be called.
 * <p/>
 * The recordingId must be a valid non-empty JavaScript string of no more than 64 characters;
 * otherwise an error is generated. The special characters \' \" \\ \n \r \t \b \f are not allowed
 * in the recording identifier.
 * 
 * @memberOf adobeDPS-FolioActivityService.prototype
 * @param {String} recordingId The recording identifier the events are requested for.
 *
 * @param {Function} successCB The callback function that handles the success of the
 * request. <br/><em>Callback Signature: successCB({recordingId: String, events: Array of
 * {attribute: value})</em> where <em>attribute</em> takes values from the
 * <em>supportedEventAttributes</em> array. The <em>eventName</em> and <em>eventTime</em> attributes
 * are mandatory and will be always present; the <em>eventTime</em> attribute is represented as a
 * string in ISO-8601 format with a 0 time zone offset (UTC).  The <em>value</em> takes string
 * values specific to the attribute. The values for <em>eventName</em> attribute are from the
 * <em>supportedEventNames</em> array.
 *
 * @param {Function} errorCB The callback function that handles the error when request
 * fails. <br/><em>Callback Signature: errorCB({recordingId: String, error: Object})
 * </em>
 *
 *
 * @throws {Error} If the errorCB is invalid
 * @platform iOS
 * @platform Windows
 */
FolioActivityService.prototype.getEvents = function(recordingId, successCB, errorCB) { 
    throwErrorIfInvalid(errorCB, 'Undefined error callback function');
    
    if (!isValidRecordingId(recordingId)) {
        var error = {code: FolioActivityErrorCodes.RECORDING_INVALID_ID, message: "Invalid recordingId"};
        errorCB({recordingId: recordingId, error: error});
        return;
    }
    
    if (!isValidCallback(successCB)) {
        var error = {code: FolioActivityErrorCodes.RECORDING_INVALID_ARGUMENT, message: "Invalid success callback function"};
        errorCB({recordingId: recordingId, error: error});
        return;
    }
 
    this.callbacks[this.callbackId] = {type: "getEvents", successCB: successCB, errorCB: errorCB};   
    Interface.instance._send(
        {action: "call", 
        path: "folioActivityService",
        data: {
            method: "getEvents",
            callbackId: this.callbackId,
            recordingId: recordingId
            }
        }
    );
    
    this.callbackId++;
}

/**
 * Releases all activity history associated with the specified recording identifier from the
 * persistent store.  The <em>recordingId</em> string may be undefined or empty to completely delete
 * the entire activity history for all recording identifiers, reducing the size of the activity
 * history to zero.
 * 
 * @memberOf adobeDPS-FolioActivityService.prototype
 * @param {String} [recordingId] The recording identifier the events are requested for.
 *
 * @param {Function} successCB The callback function that handles the success of the
 * request. <br/><em>Callback Signature: successCB(recordingId)</em>
 *
 *
 * @param {Function} errorCB The callback function that handles the error if the request
 * fails. <br/><em>Callback Signature: errorCB({recordingId: String, error: Object})
 * </em>
 *

 * @throws {Error} If the errorCB is invalid
 * @platform iOS
 * @platform Windows
 */
FolioActivityService.prototype.deleteEvents = function (recordingId, successCB, errorCB) { 
    throwErrorIfInvalid(errorCB, 'Undefined error callback function');
 
    if (!isValidOptionalRecordingId(recordingId)) {
        var error = {code: FolioActivityErrorCodes.RECORDING_INVALID_ID, message: "Invalid recordingId"};
        errorCB({recordingId: recordingId, error: error});
        return;
    }
            
    if (!isValidOptionalCallback(successCB)) {
        var error = {code: FolioActivityErrorCodes.RECORDING_INVALID_ARGUMENT, message: "Invalid success callback"};
        errorCB({recordingId: recordingId, error: error});
        return;
    }
            
    this.callbacks[this.callbackId] = {type: "deleteEvents", successCB: successCB, errorCB: errorCB};   
    Interface.instance._send(
        {action: "call", 
        path: "folioActivityService",
        data: {
            method: "deleteEvents",
            callbackId: this.callbackId,
            recordingId: recordingId
            }
        }
    );
    
    this.callbackId++;
}

/**
 * Resets the state of FolioActivityService to initial conditions.  All persistent storage used by
 * FolioActivityService â€“ including the entire activity history, recording state, and error state â€“
 * is deleted and reset to an empty state.  Any recording in progress is stopped.
 * <p/>
 * Calling this method should not normally be needed, but it may be useful during application
 * development, or if storage I/O errors or other external problems affect the stability or
 * integrity of the persistent storage.
 *
 * @memberOf adobeDPS-FolioActivityService.prototype
 * 
 * @param {Function} successCB The callback function that handles the success of the
 * request. 
 * <br/><em>Callback Signature: successCB()</em>
 *
 * @param {Function} errorCB The callback function that handles the error if the request
 * fails. <br/><em>Callback Signature: errorCB({recordingId: String, error: Object})
 * </em >
 *
 * @throws {Error} If the errorCB is invalid
 * @platform iOS
 * @platform Windows
 */
FolioActivityService.prototype.resetService = function (successCB, errorCB) { 
    throwErrorIfInvalid(errorCB, 'Undefined error callback function');
    
    if (!isValidOptionalCallback(successCB)) {
        var error = {code: FolioActivityErrorCodes.RECORDING_INVALID_ARGUMENT, message: "Invalid success callback"};
        errorCB({recordingId: undefined, error: error});
        return;
    }
                
    this.callbacks[this.callbackId] = {type: "resetService", successCB: successCB, errorCB: errorCB};   
    Interface.instance._send(
        {action: "call", 
        path: "folioActivityService",
        data: {
            method: "resetService",
            callbackId: this.callbackId
            }
        }
    );
    
    this.callbackId++;
}

/**
 * The singleton of the FolioActivityService.
 * @static
 * @name instance
 * @memberOf adobeDPS-FolioActivityService
 * @platform iOS
 * @platform Windows
 */
FolioActivityService.instance = new FolioActivityService();

    function isValidCallback(callback) {
    return (isValid(callback) && (typeof callback === "function"));
}

function isValid(entity) {
    return !(entity === undefined || entity === null);
}

var OAuthRedirectServiceStatus = {
        REQUEST_ERROR: 0,
        REQUEST_SUCCESS: 1,
        SERVER_SUCCESS: 2,
        SERVER_TIMEOUT: 3,
        UNKNOWN: -1
};

/**
 * Enum for the error codes of the OAuthRedirectService. 
 * @namespace
 * @enum {Number}
 * @platform iOS
 * @platform Windows
 */
var OAuthRedirectServiceErrorCodes = {
    /** 
     * <strong>Value: 1</strong>
     * <br/>Request already in progress. 
     * This error occurs when an API is called while there is another request in progress. 
     * @platform iOS
     * @platform Windows
     */
    OPERATION_IN_PROGRESS: 1,

    /** 
     * <strong>Value: 2</strong>
     * <br/>The authorization session is invalid. 
     * This error occurs when the internal clientId is not set which indicates an invalid session.  
     * @platform iOS
     * @platform Windows
     */
    INVALID_AUTH_SESSION: 2,

    /** 
     * <strong>Value: 3</strong>
     * <br/>At least one of the API arguments is invalid. 
     * This error occurs when an API is called with invalid arguments.  
     * @platform iOS
     * @platform Windows
     */
    INVALID_ARGUMENTS: 3
};

/**
 * Create an instance of the OAuthRedirectService.
 * <br/><strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class Service for handling OAuth2.0 authorization responses using HTTP redirection.
 * <br/><strong>Accessible from adobeDPS.oauthRedirectService</strong>
 * @extends adobeDPS-Service
 * @platform iOS
 * @platform Windows
 */
function OAuthRedirectService() {   
    
    /**
     * The client Id assigned to the connected app for the authorization host. 
     * It conforms to the OAuth spec for <a href="http://tools.ietf.org/html/rfc6749#section-2.2">client_id</a> field.
     * @memberOf adobeDPS-OAuthRedirectService.prototype
     * @type String
     * @platform iOS
     * @platform Windows
     */
    this.clientId = null;       

    /**
     * The redirect URI used by the authorization server to send responses back to the application. 
     * It conforms to the OAuth spec for <a href="http://tools.ietf.org/html/rfc6749#section-3.1.2">redirect_uri</a> field.
     * @memberOf adobeDPS-OAuthRedirectService.prototype
     * @type String
     * @platform iOS
     * @platform Windows
     */
    this.redirectURI = null;

    /**
     * The authorization data object associated with the authorization server (host) for the active session.
     * It contains key:value pairs of authorization data conforming to the <a href="http://tools.ietf.org/html/rfc6749#page-23">OAuth spec</a>.
     * It represents a union of the response fields from the authorization server for initial authorization request and subsequent token refresh requests.
     * @memberOf adobeDPS-OAuthRedirectService.prototype
     * @type Object
     * @platform iOS
     * @platform Windows
     */
    this.oauthData = null;      

    /**
     * The supported error codes as an enum object
     * @memberOf adobeDPS-OAuthRedirectService.prototype
     * @see adobeDPS-OAuthRedirectServiceErrorCodes
     * @type Object
     * @platform iOS
     * @platform Windows
     */
    this.OAuthRedirectServiceErrorCodes = OAuthRedirectServiceErrorCodes;

    /**
     * Internal: The callback of pending request
     * @private
     */
    this.callback = null;

    /**
     * Internal: The callback of the pending request
     * @private
     */
    this.responseHandler = null;
        
    /**
     * Internal: The authorization request timer
     * @private
    */
    this.timer = null;
    
    /**
     * Internal: The authorization request timeout in ms
     * @private
    */
    this.timeout = 2*60*1000;
    
    /**
    * Internal - The base random Id identifying a callback in the array of callbacks.
    * @private
    */
    this.callbackId = Math.floor(Math.random() * 2000000000); 

    Service.call(this);
}

Service.extend(OAuthRedirectService);

/**
 * Update the OAuthRedirectService with a JSON update from native.
 * @memberOf adobeDPS-OAuthRedirectService.prototype
 * @private
 */
OAuthRedirectService.prototype._update = function (data) {
    if (data.hasOwnProperty("update")) {
        var update = data.update;
        if (update.hasOwnProperty("status")) {
            // The data is the request status response
            if (update.status === OAuthRedirectServiceStatus.REQUEST_SUCCESS) {
                if (!isValid(update.callbackId)) return;
                var callback = this.callback;
                this.callback = null;
                if (update.hasOwnProperty("oauthData")) {
                    this.oauthData = update.oauthData;
                    if (this.oauthData == "") {this.oauthData = null;}
                }
                callback.successCB();
            }
            else if (update.status === OAuthRedirectServiceStatus.REQUEST_ERROR) {
                if (!isValid(update.callbackId)) return;
                var callback = this.callback;
                this.callback = null;
                callback.errorCB({code: update.errorCode, message: update.errorMessage});
            }
            else if (update.status === OAuthRedirectServiceStatus.SERVER_SUCCESS) {
                clearTimeout(this.timer);
                this.oauthData = update.oauthData;
                var responseHandler = this.responseHandler;
                this.responseHandler = null;
                responseHandler(this.oauthData);
            }
            else if (update.status === OAuthRedirectServiceStatus.SERVER_TIMEOUT) {
                clearTimeout(this.timer);
                var responseHandler = this.responseHandler;
                this.responseHandler = null;
                responseHandler({timeout: "Server timed out!"});
            }
        }
    } else {
        Log.instance.warn("OAuthRedirectService._update called without update data");
    }
};

/**
 * Initialises the authorization session and retrieves the cached auth data from native keychain into the internal oauthData
 * @memberOf adobeDPS-OAuthRedirectService.prototype
 * @param {Object} authSettings The authorization settings objects with the following format: 
 *      { authURL: String, clientId: String, redirectURI: String} where:
 *          <ul type="disc">
 *          <li>authURL - The authorization URL used in the REST API for authorization grant request. It cannot be undefined, null or empty.</li>
 *          <li>clientId - The client Id assigned to the app for a specific service provider. It conforms to the OAuth spec requirements for the <a href="http://tools.ietf.org/html/rfc6749#section-2.2">client_id</a> field. It cannot be undefined, null or empty.</li>
 *          <li>redirectURI - The callback URI used by the authorization server to return the result to the app. It conforms to the OAuth spec requirements for the <a href="http://tools.ietf.org/html/rfc6749#section-3.1.2">redirect_uri</a> field). It cannot be undefined, null or empty.</li>
 *          </ul>
 *  If authSettings or any of its properties is invalid the errorCB() is called with INVALID_ARGUMENTS error, if errorCB is defined. If errorCB is undefined, the 'Invalid error handler' exception is thrown. 
 * @param {Function} successCB The callback function that handles the success of the request. This function can use the oauthData property to access the tokens needed. It cannot be undefined or null. Signature: successCB() 
 * @param {Function} errorCB The error callback to handle the error codes below.  It cannot be undefined or null. Signature: errorCB(error)
 *          <ul type="disc">
 *              <li>INVALID_ARGUMENTS - when the API is used with invalid arguments. </li>
 *              <li>OPERATION_IN_PROGRESS - when another authorization session is in progress (startListening is use) or the previous API request did not complete. </li> 
 *          </ul>
 * @throws {Error} If the errorCB is invalid
 * @platform iOS
 * @platform Windows
 */
OAuthRedirectService.prototype.initAuthData = function(authSettings, successCB, errorCB) {
    if (!isValidCallback(errorCB)) { throw new Error('Invalid error handler!');}
    
    if (!isValid(authSettings) || (typeof authSettings !== "object")) {
        errorCB({code: OAuthRedirectServiceErrorCodes.INVALID_ARGUMENTS, message:"The authSettings is invalid."}); return;
    }
    
    if (!isValid(authSettings.authURL) || (typeof authSettings.authURL !== "string") || authSettings.authURL == "") {
        errorCB({code: OAuthRedirectServiceErrorCodes.INVALID_ARGUMENTS, message:"The authURL is invalid."}); return;
    }
    if (!isValid(authSettings.clientId) || (typeof authSettings.clientId !== "string") || authSettings.clientId == "") {
        errorCB({code: OAuthRedirectServiceErrorCodes.INVALID_ARGUMENTS, message:"The clientId is invalid."}); return;
    }       
    if (!isValid(authSettings.redirectURI) || (typeof authSettings.redirectURI !== "string") || authSettings.redirectURI == "") {
        errorCB({code: OAuthRedirectServiceErrorCodes.INVALID_ARGUMENTS, message:"The redirectURI is invalid."}); return;
    }
    if (!isValidCallback(successCB)) {
        errorCB({code: OAuthRedirectServiceErrorCodes.INVALID_ARGUMENTS, message:"The success callback is invalid."}); return;
    }
    if (isValid(this.callback) || isValid(this.responseHandler)) {
        errorCB({code: OAuthRedirectServiceErrorCodes.OPERATION_IN_PROGRESS, message:"An operation is already in progress."}); return;
    }
    
    this.clientId = authSettings.clientId;
    this.redirectURI = authSettings.redirectURI;
    this.oauthData = null;
    this.callback = {successCB: successCB, errorCB: errorCB};
    
    Interface.instance._send({
        action: "call", 
        path: "oauthRedirectService",
        data: {
            method: "init",
            callbackId: this.callbackId,
            authURL: authSettings.authURL,
            clientId: authSettings.clientId,
            redirectURI: authSettings.redirectURI
        }
    });
    
    this.callbackId++;
};

/**
 * Starts listening for authorization server response in preparation for an OAuth authorization request. 
 * It registers a response callback which is invoked when the server response with redirectURI scheme is received or server times out.
 * @memberOf adobeDPS-OAuthRedirectService.prototype
 * @param {Function} responseCB The callback function that handles the authorization server response object or a timeout message. This handler should be able to differentiate between success or error responses based on the object content according to <a href="http://tools.ietf.org/html/rfc6749#page-23">OAuth spec</a>. It cannot be undefined or null. Signature responseCB(data)
 * @param {Function} successCB  The success callback indicating the request is successful and the viewer is ready for server data. It cannot be undefined or null. The user should use this function to send the authorization request to the server. Signature: successCB()
 * @param {Function} errorCB The error callback to handle the error codes below.  It cannot be undefined or null. Signature: errorCB(error)
 *          <ul type="disc">
 *              <li>INVALID_ARGUMENTS - when the API is used with invalid arguments.</li> 
 *              <li>INVALID_AUTH_SESSION - when the clientId property of the adobeDPS.oauthRedirectService is invalid. It requires a call to initAuthData.</li>
 *              <li>OPERATION_IN_PROGRESS - when another authorization session is in progress (startListening is use) or the previous API request did not complete. </li>
 *          </ul>
 * @throws {Error} If the errorCB is invalid
 * @platform iOS
 */ 
OAuthRedirectService.prototype.startListening = function(responseCB, successCB, errorCB) {
    if (!isValidCallback(errorCB)) { throw new Error('Invalid error handler!');}

    if (!isValidCallback(successCB)) {
        errorCB({code: OAuthRedirectServiceErrorCodes.INVALID_ARGUMENTS, message:"The success callback is invalid."}); return;
    }
    if (!isValidCallback(responseCB)) {
        errorCB({code: OAuthRedirectServiceErrorCodes.INVALID_ARGUMENTS, message:"The response callback is invalid."}); return;
    }
    if (!isValid(this.clientId) || (typeof this.clientId !== "string") || this.clientId == "") {
        errorCB({code: OAuthRedirectServiceErrorCodes.INVALID_AUTH_SESSION, message:"The authorization session is invalid. initAuthData() must be called first."}); return;
    }           
    if (isValid(this.callback)  || isValid(this.responseHandler)) {
        errorCB({code: OAuthRedirectServiceErrorCodes.OPERATION_IN_PROGRESS, message:"An operation is already in progress."}); return;
    }

    this.callback = {successCB: successCB, errorCB: errorCB};
    this.responseHandler = responseCB;
    this.timer = setTimeout(function() { this.responseHandler = null; }, this.timeout);
    
    Interface.instance._send({
        action: "call", 
        path: "oauthRedirectService",
        data: {
            method: "startListening",
            clientId: this.clientId,
            callbackId: this.callbackId,
            timeout: this.timeout
        }
    });
    
    this.callbackId++;
};

/**
 * Stops listening for authorization server response. This will cancel the pending listening request for the for the current session (identified by clientId).
 * @memberOf adobeDPS-OAuthRedirectService.prototype
 * @param {Function} successCB  The success callback indicating the request is successful and the viewer is ready for server data. It cannot be undefined or null. Signature successCB()
 * @param {Function} errorCB The error callback to handle the error codes below.  It cannot be undefined or null. Signature: errorCB(error)
 *          <ul type="disc">
 *              <li>INVALID_ARGUMENTS - when the API is used with invalid arguments. </li>
 *              <li>INVALID_AUTH_SESSION - when the clientId property of the adobeDPS.oauthRedirectService is invalid. It requires a call to initAuthData.</li>
 *              <li>OPERATION_IN_PROGRESS - when another authorization session with different clientId is in progress (startListening is use) or the previous API request did not complete. </li>
 *          </ul>
 * @throws {Error} If the errorCB is invalid
 * @platform iOS
 */ 
OAuthRedirectService.prototype.stopListening = function(successCB, errorCB) {
    if (!isValidCallback(errorCB)) { throw new Error('Invalid error handler!');}

    if (!isValidCallback(successCB)) {
        errorCB({code: OAuthRedirectServiceErrorCodes.INVALID_ARGUMENTS, message:"The success callback is invalid."}); return;
    }
    if (!isValid(this.clientId) || (typeof this.clientId !== "string") || this.clientId == "") {
        errorCB({code: OAuthRedirectServiceErrorCodes.INVALID_AUTH_SESSION, message:"The authorization session is invalid. initAuthData() must be called first."}); return;
    }           
    if (isValid(this.callback)) {
        errorCB({code: OAuthRedirectServiceErrorCodes.OPERATION_IN_PROGRESS, message:"An operation is already in progress."}); return;
    }

    clearTimeout(this.timer);
    this.responseHandler = null;
    this.callback = {successCB: successCB, errorCB: errorCB};
    
    Interface.instance._send({
        action: "call", 
        path: "oauthRedirectService",
        data: {
            method: "stopListening",
            clientId: this.clientId,
            callbackId: this.callbackId
        }
    });
    
    this.callbackId++;
};

/**
 * Updates the cached authorization data for the current session (identified by clientId). This API is needed for OAuth flows that require refreshing the access token. 
 * The cached auth data (oauthData property) is updated with the fields from the authData. The authData object will be merged into the existing oauthData property object where fields existing on both objects will be updated with values from authData and new fields will be added.
 * @memberOf adobeDPS-OAuthRedirectService.prototype
 * @param {Object} authData The new authorization data obtained from the token endpoint with refreshed access token and optionally a new refresh token. It cannot be undefined, null or empty.
 * @param {Function} successCB The callback function indicating the success of the request. The handler can use oauthData to access the new tokens. It cannot be undefined or null. Signature successCB()
 * @param {Function} errorCB The error callback to handle the error codes below.  It cannot be undefined or null. Signature: errorCB(error)
 *          <ul type="disc">
 *              <li>INVALID_ARGUMENTS - when the API is used with invalid arguments. </li>
 *              <li>INVALID_AUTH_SESSION - when the clientId property of the adobeDPS.oauthRedirectService is invalid. It requires a call to initAuthData.</li>
 *              <li>OPERATION_IN_PROGRESS - when another authorization session is in progress (startListening is use) or the previous API request did not complete. </li>
 *          </ul>
 * @throws {Error} If the errorCB is invalid
 * @platform iOS
 * @platform Windows
 */
OAuthRedirectService.prototype.updateAuthData = function(authData, successCB, errorCB) {
    if (!isValidCallback(errorCB)) { throw new Error('Invalid error handler!');}

    if (!isValidCallback(successCB)) {
        errorCB({code: OAuthRedirectServiceErrorCodes.INVALID_ARGUMENTS, message:"The success callback is invalid."}); return;
    }
    if (!isValid(authData) || (typeof authData !== "object")) {
        errorCB({code: OAuthRedirectServiceErrorCodes.INVALID_ARGUMENTS, message:"The authData is invalid."}); return;
    }
    if (!isValid(this.clientId) || (typeof this.clientId !== "string") || this.clientId == "") {
        errorCB({code: OAuthRedirectServiceErrorCodes.INVALID_AUTH_SESSION, message:"The authorization session is invalid. initAuthData() must be called first."}); return;
    }           
    if (isValid(this.callback) || isValid(this.responseHandler)) {
        errorCB({code: OAuthRedirectServiceErrorCodes.OPERATION_IN_PROGRESS, message:"An operation is already in progress."}); return;
    }

    this.callback = {successCB: successCB, errorCB: errorCB};

    Interface.instance._send({
        action: "call", 
        path: "oauthRedirectService",
        data: {
            method: "update", 
            clientId: this.clientId,
            callbackId: this.callbackId,
            data: authData
        }
    });
    
    this.callbackId++;
};

/**
 * Resets the cached authorization data for the current session (identified by clientId). 
 * As a result the oauthData property object is set to null and the native counterpart is removed.
 * Additionally this logs out the user from the authorization server by deleting all the relevant cookies for the current session's main domain. 
 * Note: Multiple authorization sessions with the same main domain will share the cookies for that domain. Thus logging out a user for host.domain.com will also invalidate the login status for other same domain authorization sessions (anyhost.domain.com, anyhost.anysubdomain.domain.com).
 * @memberOf adobeDPS-OAuthRedirectService.prototype
 * @param {Function} successCB The callback function that handles the success of the request. It cannot be undefined or null.  Signature: successCB()
 * @param {Function} errorCB The error callback to handle the error codes below.  It cannot be undefined or null. Signature: errorCB(error)
 *          <ul type="disc">
 *              <li>INVALID_ARGUMENTS - when the API is used with invalid arguments. </li>
 *              <li>INVALID_AUTH_SESSION - when the clientId property of the adobeDPS.oauthRedirectService is invalid. It requires a call to initAuthData.</li>
 *              <li>OPERATION_IN_PROGRESS - when another authorization session is in progress (startListening is use) or the previous API request did not complete. </li>
 *          </ul>
 * @throws {Error} If the errorCB is invalid
 * @platform iOS
 * @platform Windows
 */
OAuthRedirectService.prototype.resetAuthData = function(successCB, errorCB) {
    if (!isValidCallback(errorCB)) { throw new Error('Invalid error handler!');}

    if (!isValidCallback(successCB)) {
        errorCB({code: OAuthRedirectServiceErrorCodes.INVALID_ARGUMENTS, message:"The success callback is invalid."}); return;
    }
    if (!isValid(this.clientId) || (typeof this.clientId !== "string") || this.clientId == "") {
        errorCB({code: OAuthRedirectServiceErrorCodes.INVALID_AUTH_SESSION, message:"The authorization session is invalid. initAuthData() must be called first."}); return;
    }           
    if (isValid(this.callback)  || isValid(this.responseHandler)) {
        errorCB({code: OAuthRedirectServiceErrorCodes.OPERATION_IN_PROGRESS, message:"An operation is already in progress."}); return;
    }

    this.callback = {successCB: successCB, errorCB: errorCB};

    Interface.instance._send({
        action: "call", 
        path: "oauthRedirectService",
        data: {
            method: "reset",
            clientId: this.clientId,
            callbackId: this.callbackId
        }
    });
    
    this.callbackId++;
};

/**
 * This is a Windows-specific API that replaces the function of the <em>startListening()</em> and
 * <em>stopListening()</em> APIs.  It is only available on Windows 8 or later.
 * <p/>
 * <em>authorize()</em> creates an instance of Windows Web Authentication Broker. It is designed by
 * Microsoft to provide support for authentication flows such as SSO (Single Sign-On) and variants
 * that pass back tokens back in the window title string.
 * <p/>
 * Windows Web Authentication Broker looks like a web view that is created on top of the calling
 * application. It contains UI elements that allow the user to cancel the login process and return to
 * the application. Once authentication is finished, the Windows Web Authentication Broker closes
 * itself and returns the data that the server sent to the <em>redirectURI</em> back to the calling
 * application.
 * <p/>
 * <em>authorize()</em> handles internally the functions of <em>startListening()</em> and
 * <em>stopListening()</em>. Once <em>authorize()</em> finishes, <em>successCB()</em> is called and
 * then the authorization data can be retrieved from the <em>oathData</em> instance variable of
 * <em>OauthRedirectService</em>.  The JavaScript workflow otherwise stays the
 * same. <em>initAuthData(), resetAuthData()</em> and <em>updateAuthData()</em> are still used on
 * the Windows platform.
 * 
 * @memberOf adobeDPS-OAuthRedirectService.prototype
 * 
 * @param {String} requestURI The full URI to call the authorization host with. The URI should
 * contain parameters required by the host such as <em>redirect_uri, response_type</em> and so
 * forth.  Please note that the <em>redirectURI</em> parameter given to <em>initAuthData()</em> is
 * used for capturing the response from authorization host.
 * 
 * @param {Boolean} useTitle By default the OS authorization API expects that the authorization host
 * returns authorization data in a query string sent to <em>redirectURI</em>. If the authorization
 * host sends data in the window title string instead, set <em>useTitle</em> to <em>true</em>.
 * 
 * @param {Boolean} persistCookies If set true, cookies received from authorization host are
 * preserved over app launches by the OS. This is commonly desired when SSO (single sign-on) is
 * used.
 * <p/>On Windows, <em>resetAuthData()</em> is unable to clear cookies. If <em>persistCookies</em>
 * is set true, the user may be permanently signed in as long as the cookies are valid.  If
 * <em>persistCookies</em> is set true, the <em>redirectURI</em> parameter that is used when calling
 * <em>initAuthData()</em> must be of the form <em>ms-app://SID</em>, where <em>SID</em> matches the
 * <em>SID</em> of the Windows app.
 * <p/>See <a href="http://msdn.microsoft.com/en-us/library/windows/apps/dn448955.aspx">Understanding
 * and debugging the web authentication broker workflow</a> for more documentation.
 * 
 * @param {Function} successCB The callback function that handles the success of the request. It
 * cannot be undefined or null. After <em>successCB()</em> is called then the authorization data
 * from the host can be retrieved from the <em>oauthData</em> instance variable of the
 * <em>OauthRedirectService</em> object.
 * <br/>Signature: successCB()
 * 
 * @param {Function} errorCB The error callback to handle the error codes below. It cannot be
 * undefined or null.
 * <br/>Signature: errorCB(error)
 *          <ul type="disc">
 *              <li>INVALID_ARGUMENTS - when the API is used with invalid arguments. </li>
 *              <li>INVALID_AUTH_SESSION - when the <em>clientId</em> property of the
 *                  <em>oauthRedirectService</em> is invalid. It requires a call to
 *                  <em>initAuthData()</em>.</li>
 *              <li>OPERATION_IN_PROGRESS - when another authorization session is in progress or the
 *                  previous API request did not complete. </li>
 *          </ul>
 * 
 * @throws {Error} If the errorCB is invalid
 * @platform Windows
 */
OAuthRedirectService.prototype.authorize = function (requestURI, useTitle, persistCookies, successCB, errorCB) {
    if (!isValidCallback(errorCB)) {
        throw new Error('Invalid error handler!');
    }
    if (!isValidCallback(successCB)) {
        errorCB({
            code: OAuthRedirectServiceErrorCodes.INVALID_ARGUMENTS,
            message: "The response callback is invalid."
        });
        return;
    }
    if (!isValid(requestURI) || (typeof requestURI !== "string") || requestURI == "") {
        errorCB({
            code: OAuthRedirectServiceErrorCodes.INVALID_ARGUMENTS,
            message: "The requestURI is invalid."
        });
        return;
    }
    if (!isValid(useTitle) || (typeof useTitle !== "boolean")) {
        errorCB({
            code: OAuthRedirectServiceErrorCodes.INVALID_ARGUMENTS,
            message: "The useTitle boolean is invalid."
        });
        return;
    }
    if (!isValid(persistCookies) || (typeof persistCookies !== "boolean")) {
        errorCB({
            code: OAuthRedirectServiceErrorCodes.INVALID_ARGUMENTS,
            message: "The persistCookies boolean is invalid."
        });
        return;
    }
    if (!isValid(this.clientId) || (typeof this.clientId !== "string") || this.clientId == "") {
        errorCB({
            code: OAuthRedirectServiceErrorCodes.INVALID_AUTH_SESSION,
            message: "The authorization session is invalid. initAuthData() must be called first."
        });
        return;
    }
    if (isValid(this.callback) || isValid(this.responseHandler)) {
        errorCB({
            code: OAuthRedirectServiceErrorCodes.OPERATION_IN_PROGRESS,
            message: "An operation is already in progress."
        });
        return;
    }

    this.callback = { successCB: successCB, errorCB: errorCB };

    Interface.instance._send({
        action: "call",
        path: "oauthRedirectService",
        data: {
            method: "authorize",
            clientId: this.clientId,
            callbackId: this.callbackId,
            requestURI: requestURI,
            useTitle: useTitle,
            persistCookies: persistCookies
        }
    });

    this.callbackId++;
};

            
/**
 * The singleton of the OAuthRedirectService.
 * @static
 * @name instance
 * @memberOf adobeDPS-OAuthRedirectService
 * @platform iOS
 * @platform Windows
 */
OAuthRedirectService.instance = new OAuthRedirectService();

    function isDefined(entity) {
    return !(entity === undefined || entity === null);
}

function isValidCallback(callback) {
    return isDefined(callback) && (typeof callback === "function");
}

var EncryptedStorageInvalidKeyRegExp = "[\'\"\\\\\n\r\t\b\f\v]+";

function isValidPassword(password) {
    return isDefined(password) && (typeof password == "string") && (password.length < 65);
}

function isValidNullPassword(password) {
    return !isDefined(password) || ((typeof password == "string") && (password.length == 0));
}

function isValidKey(key) {
    return isDefined(key) && (typeof key === "string") &&
        (key.length > 0) && (key.length < 65) && (key.search(EncryptedStorageInvalidKeyRegExp) === -1);
}

function throwErrorIfInvalid(callback, error) {
    if (!isValidCallback(callback)) {
         throw new Error(error);
    }    
}

function call(func, data) {
    if (isValidCallback(func)) {
        func(data);
    }
}

function updateState(target, state) {
    target.isOpen = state.isOpen;
    target.hasSecurePasswordStorage = state.hasSecurePasswordStorage;
    target.retainPassword = state.retainPassword;
    target.isPasswordAvailable = state.isPasswordAvailable;
    target.closeOnBackgrounding = state.closeOnBackgrounding;
}

/**
 * Internal - Error status passed back from native.
 * @private
 */
var EncryptedStorageStatus = {
    ERROR: 0,
    SUCCESS: 1,
    UNKNOWN: -1
};

/**
 * @namespace This is an enumeration object defining all the supported
 * {@link adobeDPS-EncryptedStorageService} error codes.
 * @enum {Number}
 *
 * @platform iOS
 */
var EncryptedStorageErrorCodes = {
    /** 
     * <strong>Value: 1</strong>
     * <br/>The encrypted store has run out of space. 
     * This error occurs when the encrypted store runs out of space during data
     * insertions.  This is considered a critical error which will abort the attempted
     * operation.  The user must remove items from the encrypted store or otherwise free
     * up space on the device.
     */
    STORAGE_OUT_OF_SPACE: 1,

    /** 
     * <strong>Value: 2</strong>
     * <br/>The storage operation encountered a I/O error. 
     * This error occurs when the encrypted store encounters an I/O error during an item
     * insertion, retrieval or deletion.  The user should retry the operation that caused
     * this error or delete items if an item insertion provoked the error.
     */
    STORAGE_IO_ERROR: 2,

    /** 
     * <strong>Value: 3</strong>
     * <br/>The password did not decrypt the store contents.
     * The provided password, either from the native secure password store or the
     * programming interface, did not decrypt the store contents.  The password should be
     * checked for validity and re-entered.  If no valid password can be provided, then
     * the contents of the store will be unavailable and the service should be reset.
     */
    STORAGE_DECRYPTION_ERROR: 3,

    /** 
     * <strong>Value: 11</strong>
     * <br/>The function parameter is invalid. 
     * This error indicates that an invalid argument has been provided.  
     */
    STORAGE_INVALID_ARGUMENT: 11,

    /** 
     * <strong>Value: 12</strong>
     * <br/>The encrypted store is not open.
     * This error indicates that the encrypted store needs to be open, but it is currently
     * closed.
     */
    STORAGE_NOT_OPEN: 12,

    /** 
     * <strong>Value: 13</strong>
     * <br/>The encrypted store is not closed.
     * This error indicates that the encrypted store needs to be closed, but it is
     * currently open.
     */
    STORAGE_NOT_CLOSED: 13,

    /** 
     * <strong>Value: 14</strong>
     * <br/>The password is invalid.
     * The encrypted store password must be less than 65 characters in length.
     */
    STORAGE_INVALID_PASSWORD: 14,

    /** 
     * <strong>Value: 15</strong>
     * <br/>The encrypted store password is unavailable.
     * A password has not been provided in either the command or the secure password store.
     */
    STORAGE_PASSWORD_NOT_AVAILABLE: 15,

    /** 
     * <strong>Value: 16</strong>
     * <br/>The data size of the specified value in a key/value pair is too large.
     * The size of the value object is computed as the length of the JSON representation of the object
     * in characters. It is limited to 16 million characters (1024*1024*16).
     */
    STORAGE_VALUE_SIZE_EXCEEDED: 16,

    /** 
     * <strong>Value: 16</strong>
     * <br/>An invalid key was specified.
     * The key must be a regular, printable JavaScript string with a maximum of 64
     * characters.  A null or empty string is not allowed. The special characters encoded
     * with escape notation are not allowed: \' \" \\ \n \r \v \t \b \f.  These are the
     * single quote, double quote, backslash, new line, carriage return, vertical tab,
     * tab, backspace, and form feed characters.
     */
    STORAGE_INVALID_KEY: 17,

    /**
     * <strong>Value: 18</strong>
     * <br/>Secure password storage is not supported.
     * An attempt was made to retain the encrypted store password in the native device
     * secure key store, but this is not supported on the current device.
     */
    STORAGE_NO_SECURE_PASSWORD_STORE: 18
};

/**
 * Create an instance of EncryptedStorageOptions.
 * 
 * @class This class defines the options for EncryptedStorageService sessions.  It is used when
 * calling <em>setSessionOptions()</em>.
 * <br/><strong>Accessible from adobeDPS.encryptedStorageService.EncryptedStorageOptions.</strong>
 * 
 * @param {boolean} retainPassword If true, then passwords supplied to open() and
 * changePassword() will be stored in the native secure password store for subsequent use;
 * otherwise passwords will not be saved and any password in the secure store will be
 * removed.
 *
 * @param {boolean} closeOnBackgrounding If true, then the encrypted store will
 * automatically be closed when the Viewer is sent to the background, and open() will need
 * to be called again to access its contents; otherwise no such automatic closing is
 * performed.
 *
 * @platform iOS
 */
function EncryptedStorageOptions(retainPassword, closeOnBackgrounding) {
    /**
     * If <em>true</em>, then passwords supplied to <em>open()</em> and <em>changePassword()</em>
     * will be stored in the native secure password store for subsequent use; otherwise passwords
     * will not be saved and any password in the secure store will be removed.
     * @memberOf adobeDPS-EncryptedStorageOptions.prototype
     * @type boolean
     */
    this.retainPassword = retainPassword;

    /**
     * If true, then the encrypted store will automatically be closed when the Viewer is sent to the
     * background, and <em>open()</em> will need to be called again to access its contents;
     * otherwise, no automatic closing is performed.
     * @memberOf adobeDPS-EncryptedStorageOptions.prototype
     * @type boolean
     */
    this.closeOnBackgrounding = closeOnBackgrounding;
}

/**
 * Create an instance of the EncryptedStorageService.
 * 
 * <br/><strong>This is an internal constructor and shouldn't be called by regular
 * users.</strong>
 * 
 * @class This class defines a service providing encrypted local storage.
 * <br/><strong>Accessible from adobeDPS.encryptedStorageService</strong>
 * @extends adobeDPS-Service
 *
 * @platform iOS
 */
function EncryptedStorageService() {    
    /**
     * This field is <em>true</em> if the encrypted store is open and <em>false</em> if closed. If
     * the encrypted store is closed then no access to its contents is possible.
     * @memberOf adobeDPS-EncryptedStorageService.prototype
     * @type Boolean
     */
    this.isOpen = false;

    /**
     * This field is <em>true</em> if secure password storage is supported by the device and
     * <em>false</em> otherwise.  On iOS devices the secure password store is provided by the device
     * KeyChain and this field is always <em>true</em>.
     * @memberOf adobeDPS-EncryptedStorageService.prototype
     * @type Boolean
     */
    this.hasSecurePasswordStorage = true;

    /**
     * This field is <em>true</em> if the password supplied to the service is to be retained in the
     * device secure password store. If this field is <em>false</em> then the password will not be
     * retained and must be supplied each time the store is opened.  This attribute is set by
     * calling <em>setSessionOptions().</em>
     * @memberOf adobeDPS-EncryptedStorageService.prototype
     * @type Boolean
     */
    this.retainPassword = false;

    /**
     * If there is a password retained in the device secure password store then this field will be
     * <em>true</em>; otherwise, the value is <em>false</em>.  The retained password allows the
     * encrypted store to be opened without supplying a password to the service.
     * @memberOf adobeDPS-EncryptedStorageService.prototype
     * @type Boolean
     */
    this.isPasswordAvailable = false;

    /**
     * This field is <em>true</em> if the encrypted store is to be closed whenever the Viewer is
     * sent to the background, and <em>false</em> otherwise.  The encrypted store is always closed
     * if the Viewer is killed.  This attribute is set by calling <em>setSessionOptions().</em>
     * @memberOf adobeDPS-EncryptedStorageService.prototype
     * @type Boolean
     */
    this.closeOnBackgrounding = false;

    /**
     * The signal used to indicate that the encrypted storage state has changed.  The state changes
     * in response to updates to any of the state attributes in EncryptedStorageService.  This can
     * be as a result of calling <em>open(), close(), setSessionOptions(), resetService(),
     * setItem(), removeItem()</em>, or <em>clear()</em>.
     * <p/>
     * If <em>changePassword()</em> is called with the <em>retainPassword</em> option set, and this
     * results in a password being stored when none was previously, then the signal will fire as a
     * result of <em>isPasswordAvailable</em> changing state; otherwise <em>changePassword</em> does
     * not generate a state change that can be detected by the application.
     * <p/>
     * An application may register a handler for this signal in order to track the state of the
     * store. When the handler is invoked the state attributes of the EncryptedStorageService can be
     * examined to determine what changed. There is currenly no automatic mechanism to determine
     * what changed; the application is responsible for examining the state and determining the
     * change.  The signal is fired only after any callbacks from the provoking function are called.
     * @memberOf adobeDPS-EncryptedStorageService.prototype
     * @type Signal
     */
    this.stateChangedSignal = new Signal();
    
    /**
     * The supported error codes as an enumeration object.
     * @memberOf adobeDPS-EncryptedStorageService.prototype
     * @type EncryptedStorageErrorCodes
     */
    this.encryptedStorageErrorCodes = EncryptedStorageErrorCodes;

    /**
    * Internal - The base random Id identifying a callback in the array of callbacks.
    * @private
    */
    this.callbackId =  Math.floor(Math.random() * 2000000000);  

    /**
    * Internal - The array of callbacks.
    * @private
    */
    this.callbacks = {};  

    Service.call(this);
}

// Extend Service with EncryptedStorageService
Service.extend(EncryptedStorageService);

// The EncryptedStorageOptions constructor is available as adobeDPS.encryptedStorageService.EncryptedStorageOptions
EncryptedStorageService.prototype.EncryptedStorageOptions = EncryptedStorageOptions;

/**
 * Initialize the EncryptedStorage Service with a JSON update from native.
 * @memberOf adobeDPS-EncryptedStorageService.prototype
 */
EncryptedStorageService.prototype._initialize = function (data) {
    if (data.hasOwnProperty("update")) {
        var update = data.update;
        if (update.hasOwnProperty("updatedState")) {
            updateState(this, update.updatedState);
        }
    } else {
        Log.instance.warn("EncryptedStorageService._initialize called without update");
    }
};

/**
 * Update the EncryptedStorage Service with a JSON update from native.
 * @memberOf adobeDPS-EncryptedStorageService.prototype
 * @private
 */
EncryptedStorageService.prototype._update = function (data) 
{
    if (data.hasOwnProperty("update")) {
        var update = data.update;

        // Update state before invoking any callback.
        if (update.hasOwnProperty("updatedState")) {
            updateState(this, update.updatedState);
        }

        // Invoke either the success or failure callback if any.
        if (update.callbackId != -1) {
            var callback = this.callbacks[update.callbackId];
            delete this.callbacks[update.callbackId];

            if (update.status === EncryptedStorageStatus.SUCCESS) {
                // setItem(), removeItem(), and clear() do not set the updatedState property, as we
                // do not mirror the actual content of the store on the JS side.  But they are are
                // defined as changing the state, so we dispatch the stateChanged signal for them.
                switch (callback.type) {
                case 'setItem':
                    call(callback.successCB, update.itemKey);
                    this.stateChangedSignal.dispatch();
                    break;
                case 'removeItem':
                    call(callback.successCB, update.itemKey);
                    this.stateChangedSignal.dispatch();
                    break;
                case 'clear':
                    call(callback.successCB);
                    this.stateChangedSignal.dispatch();
                    break;
                case 'getItem':
                    call(callback.successCB, update.itemValue);
                    break;
                case 'getKeys':
                    var keys = update.keys.length > 0 ? update.keys : null;
                    call(callback.successCB, keys);
                    break;
                default:
                    call(callback.successCB);
                    break;
                }
            }
            else {
                call(callback.errorCB, {code: update.errorCode, message: update.errorMessage});
            }
        }

        // Dispatch the changedState signal upon updated state after invoking any callback.
        if (update.hasOwnProperty("updatedState")) {
            this.stateChangedSignal.dispatch();
        }
    }
    else {
        Log.instance.warn("EncryptedStorageService._update called without update data");
    }
}

/**
 * Set the options for using the encrypted storage service.  The options argument is an instance of
 * EncryptedStorageOptions and defines all the options to be applied to the service.
 * <p/>
 * If <em>retainPassword</em> in the options argument is <em>true</em>, then the password supplied
 * to the next call to <em>open()</em> or <em>changePassword()</em> will be stored in the native
 * secure password store (the KeyChain in iOS) for subsequent use; if the device does not support
 * secure password storage, then <em>errorCB()</em> will be called with the error
 * <em>STORAGE_NO_SECURE_PASSWORD_STORE</em>. Whenever a encrypted storage password is stored it
 * will overwrite any other encrypted storage password that exists there.
 * <p/>
 * Support for secure password storage can be determined by examining the
 * <em>hasSecurePasswordStorage</em> field in the <em>EncryptedStorageService</em> class.
 * <p/>
 * If <em>retainPassword</em> in the <em>options</em> argument is <em>false</em>, then the password
 * will not be saved to the secure password store, and any password stored there will be removed.
 * <p/>
 * If <em>closeOnBackgrounding</em> in the <em>options</em> argument is <em>true</em>, then the
 * encrypted store will automatically be closed when the Viewer is sent to the background and
 * <em>open()</em> will need to be called again to access its contents; otherwise, no such automatic
 * closing is performed.
 * <p/>
 * If no errors are encountered then successCB() is called with no arguments.
 * 
 * @memberOf adobeDPS-EncryptedStorageService.prototype
 * 
 * @param {EncryptedStorageOptions} options The options to use.
 * See {@link adobeDPS-EncryptedStorageOptions}
 * 
 * @param {Function} successCB The callback function that handles the success of the
 * request. <br/><em>Callback Signature: successCB()</em>
 * 
 * @param {Function} errorCB The callback function that receives the error if the request
 * fails. <br/><em>Callback Signature: errorCB({code: Number, message: String})</em>
 * 
 * @throws {Error} If the errorCB is invalid
 * @platform iOS
 */ 
EncryptedStorageService.prototype.setSessionOptions = function(options, successCB, errorCB) {  
    throwErrorIfInvalid(errorCB, 'Undefined error callback function');

    if (!isValidCallback(successCB)) {
        var error = {code: EncryptedStorageErrorCodes.STORAGE_INVALID_ARGUMENT,
                     message: "Invalid success callback function"};
        errorCB(error);
        return;
    }
 
    if (!isDefined(options)) {
        var error = {code: EncryptedStorageErrorCodes.STORAGE_INVALID_ARGUMENT,
                     message: "Invalid options argument"};
        errorCB(error);
        return;
    }
 
    if (!options.hasOwnProperty('retainPassword')) {
        var error = {code: EncryptedStorageErrorCodes.STORAGE_INVALID_ARGUMENT,
                     message: "Invalid options argument: retainPassword property missing"};
        errorCB(error);
        return;
    }

    if (!options.hasOwnProperty('closeOnBackgrounding')) {
        var error = {code: EncryptedStorageErrorCodes.STORAGE_INVALID_ARGUMENT,
                     message: "Invalid options argument: closeOnBackgrounding property missing"};
        errorCB(error);
        return;
    }

    if (options.retainPassword) {
        options.retainPassword = true;
        this.retainPassword = true;
    } else {
        options.retainPassword = false;
        this.retainPassword = false;
    }       

    if (options.closeOnBackgrounding) {
        options.closeOnBackgrounding = true;
        this.closeOnBackgrounding = true;
    } else {
        options.closeOnBackgrounding = false;
        this.closeOnBackgrounding = false;
    }

    this.callbacks[this.callbackId] =
        {type: "setSessionOptions", successCB: successCB, errorCB: errorCB};   

    Interface.instance._send({
        action: "call", 
        path: "encryptedStorageService",
        data: {
            method: "setSessionOptions",
            options: options,
            callbackId: this.callbackId
            }
        }
    );
    
    this.callbackId++;
}

/**
 * Open the encrypted store with the specified password.  The password may contain up to 64
 * characters. If the password is longer than 64 characters then <em>errorCB()</em> is called with
 * the error <em>STORAGE_INVALID_PASSWORD</em>. If the encrypted store is already open then
 * <em>errorCB()</em> will be called with the error STORAGE_NOT_CLOSED.
 * <p/>
 * The <em>password</em> argument may be <em>null</em> or empty.  If so, then an attempt to retrieve
 * the password from the native secure password store is made. If the password does not exist there,
 * or secure password storage is not supported, then <em>errorCB()</em> will be called with the
 * error <em>STORAGE_PASSWORD_NOT_AVAILABLE</em>.
 * <p/>
 * If the password obtained in either way does not successfully decrypt the store, then
 * <em>errorCB()</em> will be called with the error <em>STORAGE_DECRYPTION_ERROR</em>.
 * <p/>
 * If this is the first usage of the encrypted store on the device, or if the encrypted store has
 * been reset, then this function will set the initial password. Once the encrypted store is closed,
 * this same password must be supplied either from the password argument of <em>open()</em>, or from
 * the device's secure password store, in order to access the contents of the store.  The password
 * may be changed with the <em>changePassword()</em> function.
 * <p/>
 * If the encrypted store is opened without problems then <em>successCB()</em> will be called
 * without any arguments.
 * <p/>
 * The options argument to <em>setSessionOptions()</em> determines the behavior of <em>open()</em>
 * with respect to password retention and application background behavior.
 * 
 * @memberOf adobeDPS-EncryptedStorageService.prototype
 * 
 * @param {String} password The password to open the encrypted store.
 * 
 * @param {Function} successCB The callback function that handles the success of the
 * request. <br/><em>Callback Signature: successCB()</em>
 * 
 * @param {Function} errorCB The callback function that receives the error if the request
 * fails. <br/><em>Callback Signature: errorCB({code: Number, message: String})</em>
 * 
 * @throws {Error} If the errorCB is invalid
 * @platform iOS
 */ 
EncryptedStorageService.prototype.open = function(password, successCB, errorCB) {  
    throwErrorIfInvalid(errorCB, 'Undefined error callback function');
 
    if (!isValidCallback(successCB)) {
        var error = {code: EncryptedStorageErrorCodes.STORAGE_INVALID_ARGUMENT,
                     message: "Invalid success callback function"};
        errorCB(error);
        return;
    }
 
    if (isValidNullPassword(password)) {
        password = "";
    }
    else if (!isValidPassword(password)) {
        var error = {code: EncryptedStorageErrorCodes.STORAGE_INVALID_PASSWORD,
                     message: "Specified password must be less than 65 valid characters."};
        errorCB(error);
        return;
    }

    this.callbacks[this.callbackId] =
        {type: "open", successCB: successCB, errorCB: errorCB};   

    Interface.instance._send({
        action: "call", 
        path: "encryptedStorageService",
        data: {
            method: "open",
            password: password,
            callbackId: this.callbackId
            }
        }
    );
    
    this.callbackId++;
}


/**
 * Change the encrypted store password to the specified password, which must be defined, non-null,
 * and non-empty.  The password may contain up to 64 characters. If the password is longer than 64
 * characters then <em>errorCB()</em> is called with the error
 * <em>STORAGE_INVALID_PASSWORD</em>. The store must already be open; if not, then
 * <em>errorCB()</em> is called with the error <em>STORAGE_NOT_OPEN</em>.
 * <p/>
 * If the password is changed without problems then <em>successCB()</em> is called without any
 * arguments.
 * <p/>
 * The </em>options</em> argument to <em>setSessionOptions()</em> determines the behavior of
 * <em>changePassword()</em> with respect to password retention.  If the <em>retainPassword</em>
 * field of the options argument is set to <em>true</em>, then the password passed to
 * <em>changePassword()</em> will be saved into the native secure password store; if the value is
 * <em>false</em>, then the password is not retained and will have to specified when calling
 * <em>open()</em>.
 * 
 * @memberOf adobeDPS-EncryptedStorageService.prototype
 * 
 * @param {String} password The password which will replace the current password.
 * @param {Function} successCB The callback function that handles the success of the
 * request. <br/><em>Callback Signature: successCB()</em>
 *
 * @param {Function} errorCB The callback function that receives the error if the request
 * fails. <br/><em>Callback Signature: errorCB({code: Number, message: String})</em>
 * 
 * @throws {Error} If the errorCB is invalid
 * @platform iOS
 */ 
EncryptedStorageService.prototype.changePassword = function(password, successCB, errorCB) {  
    throwErrorIfInvalid(errorCB, 'Undefined error callback function');
 
    if (!isValidCallback(successCB)) {
        var error = {code: EncryptedStorageErrorCodes.STORAGE_INVALID_ARGUMENT,
                     message: "Invalid success callback function"};
        errorCB(error);
        return;
    }
 
    if (!isValidPassword(password)) {
        var error = {code: EncryptedStorageErrorCodes.STORAGE_INVALID_PASSWORD,
                     message: "A non-empty password of up to 64 valid characters must be provided."};
        errorCB(error);
        return;
    }

    this.callbacks[this.callbackId] =
        {type: "changePassword", successCB: successCB, errorCB: errorCB};   

    Interface.instance._send({
        action: "call", 
        path: "encryptedStorageService",
        data: {
            method: "changePassword",
            password: password,
            callbackId: this.callbackId
            }
        }
    );
    
    this.callbackId++;
}

/**
 * The encrypted store is closed.  Further attempts to access its contents will result in
 * <em>STORAGE_NOT_OPEN</em> errors. If the store is already closed, then <em>errorCB()</em> will be
 * called with the error <em>STORAGE_NOT_OPEN</em>.  If the store is successfully closed then
 * <em>successCB()</em> will be called without any arguments.
 * <p/>
 * The <em>options</em> argument to <em>setSessionOptions()</em> provides the option to close the
 * encrypted store whenever the application is sent to the background.  If
 * <em>closeOnBackgrounding</em> in the <em>options</em> argument is <em>true</em>, then the store
 * will automatically be closed whenever the application is sent to the background, and
 * <em>open()</em> will need to be called again to access its contents.
 * 
 * @memberOf adobeDPS-EncryptedStorageService.prototype
 *
 * @param {Function} successCB The callback function that handles the success of the
 * request. <br/><em>Callback Signature: successCB()</em>
 *
 * @param {Function} errorCB The callback function that receives the error if the request
 * fails. <br/><em>Callback Signature: errorCB({code: Number, message: String})</em>
 * 
 * @throws {Error} If the errorCB is invalid
 * @platform iOS
 */ 
EncryptedStorageService.prototype.close = function(successCB, errorCB) {  
    throwErrorIfInvalid(errorCB, 'Undefined error callback function');
 
    if (!isValidCallback(successCB)) {
        var error = {code: EncryptedStorageErrorCodes.STORAGE_INVALID_ARGUMENT,
                     message: "Invalid success callback function"};
        errorCB(error);
        return;
    }
 
    this.callbacks[this.callbackId] =
        {type: "close", successCB: successCB, errorCB: errorCB};   

    Interface.instance._send({
        action: "call", 
        path: "encryptedStorageService",
        data: {
            method: "close",
            callbackId: this.callbackId
            }
        }
    );
    
    this.callbackId++;
}

/**
 * Resets the state of <em>EncryptedStorageService</em> to initial conditions.  All persistent
 * storage used by <em>EncryptedStorageService</em>, including the contents of the store and any
 * retained password in the native secure password store, is deleted and reset to an empty state.
 * <p/>
 * Calling this method should not normally be needed, but it may be useful during application
 * development, or if storage I/O errors or other external problems affect the stability or
 * integrity of the persistent storage.  <em>successCB()</em> is called without any arguments if the
 * service is successfully reset.
 * <p/>
 * <em>EncryptedStorageService</em> itself does not define any error codes for this API entry, but
 * the error callback may be called with OS-specific error codes generated from OS file operations.
 * 
 * @memberOf adobeDPS-EncryptedStorageService.prototype
 * 
 * @param {Function} successCB The callback function that handles the success of the
 * request. <br/><em>Callback Signature: successCB()</em>
 *
 * @param {Function} errorCB The callback function that receives the error if the request
 * fails. <br/><em>Callback Signature: errorCB({code: Number, message: String})</em>
 * 
 * @throws {Error} If the errorCB is invalid
 * @platform iOS
 */ 
EncryptedStorageService.prototype.resetService = function(successCB, errorCB) {  
    throwErrorIfInvalid(errorCB, 'Undefined error callback function');
 
    if (!isValidCallback(successCB)) {
        var error = {code: EncryptedStorageErrorCodes.STORAGE_INVALID_ARGUMENT,
                     message: "Invalid success callback function"};
        errorCB(error);
        return;
    }
 
    this.callbacks[this.callbackId] =
        {type: "resetService", successCB: successCB, errorCB: errorCB};   

    Interface.instance._send({
        action: "call", 
        path: "encryptedStorageService",
        data: {
            method: "resetService",
            callbackId: this.callbackId
            }
        }
    );
    
    this.callbackId++;
}

/**
 * The specified <em>key</em> is associated with the specified value. This is not an
 * <em>encryption</em> key but serves as an identifier for the value to be stored.
 * <p/>
 * The key must be a regular, printable JavaScript string with a maximum of 64 characters.  A null
 * or empty string is not allowed. The following special characters encoded with escape notation are
 * not allowed: \' \" \\ \n \r \v \t \b \f.  These are the single quote, double quote, backslash,
 * new line, carriage return, vertical tab, tab, backspace, and form feed characters.  If the key
 * does not conform to these rules then <em>errorCB()</em> is called with the error
 * <em>STORAGE_INVALID_KEY</em>.  This check is performed before any other operation.
 * <p/>
 * If the key already exists in the store then the new value will overwrite the old value. If the
 * encrypted store is not open, then <em>errorCB()</em> will be called with the error
 * <em>STORAGE_NOT_OPEN</em>.
 * <p/>
 * Unlike the JavaScript <em>localStorage</em> API, the specified value may be any JavaScript
 * object, including <em>null</em>, but it must not be <em>undefined</em>.  The object is subjected
 * to JSON serialization before passing it over the bridge to the native side, and is deserialized
 * upon return with <em>getItem()</em>. Note that if the value contains binary data, then that
 * binary data it must be encoded into text in order to be serialized into JSON and pass over the
 * JavaScript bridge successfully.
 * <p/>
 * The size of the value object is computed as the length of the JSON representation of the object
 * in characters. It is limited to 16 million characters (1024*1024*16).  If the value is larger
 * than this limit, then <em>errorCB()</em> will be called with the error
 * <em>STORAGE_VALUE_SIZE_EXCEEDED</em>.
 * <p/>
 * If <em>setItem()</em> succeeds, then <em>successCB()</em> is called back with the key used to
 * store the value.
 * 
 * @memberOf adobeDPS-EncryptedStorageService.prototype
 * 
 * @param {String} keyArg The key to be associated with the specified value.
 * @param {Object} valueArg The object to be associated with the key.
 * 
 * @param {Function} successCB The callback function that handles the success of the
 * request. <br/><em>Callback Signature: successCB(String key)</em>
 *
 * @param {Function} errorCB The callback function that receives the error if the request
 * fails. <br/><em>Callback Signature: errorCB({code: Number, message: String})</em>
 * 
 * @throws {Error} If the errorCB is invalid
 * @platform iOS
 */ 
EncryptedStorageService.prototype.setItem = function(keyArg, valueArg, successCB, errorCB) {
    throwErrorIfInvalid(errorCB, 'Undefined error callback function');
 
    if (!isValidCallback(successCB)) {
        var error = {code: EncryptedStorageErrorCodes.STORAGE_INVALID_ARGUMENT,
                     message: "Invalid success callback function"};
        errorCB(error);
        return;
    }
 
    if (!isValidKey(keyArg)) {
        var error = {code: EncryptedStorageErrorCodes.STORAGE_INVALID_KEY,
                     message: "The key must be less than 65 characters in length and contain valid characters."};
        errorCB(error);
        return;
    }

    if (valueArg === undefined) {
        var error = {code: EncryptedStorageErrorCodes.STORAGE_INVALID_ARGUMENT,
                     message: "The value must not be undefined."};
        errorCB(error);
        return;
    }

    var str = JSON.stringify(valueArg);
    if (str.length > 1024*1024*16 + 2) {
        // limit is 16 MB + two characters for enclosing brace or brackets
        var error = {code: EncryptedStorageErrorCodes.STORAGE_VALUE_SIZE_EXCEEDED,
                     message: "Value parameter size as JSON (" + str.length + " characters) exceeds limit."};
        errorCB(error);
        return;
    }

    this.callbacks[this.callbackId] =
        {type: "setItem", successCB: successCB, errorCB: errorCB};   

    Interface.instance._send({
        action: "call", 
        path: "encryptedStorageService",
        data: {
            method: "setItem",
            keyArg: keyArg,
            valueArg: valueArg,
            callbackId: this.callbackId
            }
        }
    );
    
    this.callbackId++;
}

/**
 * The decrypted value associated with the specified key is returned to the <em>successCB()</em>
 * function. The key is subject to the same restrictions as in <em>setItem()</em>. If there is no
 * value associated with the key, or if the key is not found, then <em>null</em> will be
 * returned. If the encrypted store is not open, then <em>errorCB()</em> will be called with the
 * error <em>STORAGE_NOT_OPEN</em>.
 * 
 * @memberOf adobeDPS-EncryptedStorageService.prototype
 * 
 * @param {String} keyArg The key associated with the value to be returned.
 * 
 * @param {Function} successCB The callback function that handles the success of the request. It
 * will receive the requested value. <br/><em>Callback Signature: successCB(Object value)</em>
 *
 * @param {Function} errorCB The callback function that receives the error if the request
 * fails. <br/><em>Callback Signature: errorCB({code: Number, message: String})</em>
 * 
 * @throws {Error} If the errorCB is invalid
 * @platform iOS
 */ 
EncryptedStorageService.prototype.getItem = function(keyArg, successCB, errorCB) {  
    throwErrorIfInvalid(errorCB, 'Undefined error callback function');
 
    if (!isValidCallback(successCB)) {
        var error = {code: EncryptedStorageErrorCodes.STORAGE_INVALID_ARGUMENT,
                     message: "Invalid success callback function"};
        errorCB(error);
        return;
    }
 
    if (!isValidKey(keyArg)) {
        var error = {code: EncryptedStorageErrorCodes.STORAGE_INVALID_KEY,
                     message: "The key must be less than 65 characters in length and contain valid characters."};
        errorCB(error);
        return;
    }

    this.callbacks[this.callbackId] =
        {type: "getItem", successCB: successCB, errorCB: errorCB};   

    Interface.instance._send({
        action: "call", 
        path: "encryptedStorageService",
        data: {
            method: "getItem",
            keyArg: keyArg,
            callbackId: this.callbackId
            }
        }
    );
    
    this.callbackId++;
}

/**
 * The specified <em>key</em> and its value are removed from the encrypted store. The key is subject
 * to the same restrictions as in <em>setItem()</em>. If the key does not exist, then this function
 * does nothing. If the encrypted store is not open, then <em>errorCB()</em> will be called with the
 * error <em>STORAGE_NOT_OPEN</em>.  If the operation is successful, then <em>successCB()</em> is
 * called back with the key that was removed.
 * 
 * @memberOf adobeDPS-EncryptedStorageService.prototype
 * 
 * @param {String} keyArg The key associated with the key/value pair to be removed.
 *
 * @param {Function} successCB The callback function that handles the success of the
 * request. <br/><em>Callback Signature: successCB(String key)</em>
 *
 * @param {Function} errorCB The callback function that receives the error if the request
 * fails. <br/><em>Callback Signature: errorCB({code: Number, message: String})</em>
 * 
 * @throws {Error} If the errorCB is invalid
 * @platform iOS
 */ 
EncryptedStorageService.prototype.removeItem = function(keyArg, successCB, errorCB) {  
    throwErrorIfInvalid(errorCB, 'Undefined error callback function');
 
    if (!isValidCallback(successCB)) {
        var error = {code: EncryptedStorageErrorCodes.STORAGE_INVALID_ARGUMENT,
                     message: "Invalid success callback function"};
        errorCB(error);
        return;
    }
 
    if (!isValidKey(keyArg)) {
        var error = {code: EncryptedStorageErrorCodes.STORAGE_INVALID_KEY,
                     message: "The key must be less than 65 characters in length and contain valid characters."};
        errorCB(error);
        return;
    }

    this.callbacks[this.callbackId] =
        {type: "removeItem", successCB: successCB, errorCB: errorCB};   

    Interface.instance._send({
        action: "call", 
        path: "encryptedStorageService",
        data: {
            method: "removeItem",
            keyArg: keyArg,
            callbackId: this.callbackId
            }
        }
    );
    
    this.callbackId++;
}

/**
 * All defined keys are returned to <em>successCB()</em> as an array of strings.  If the encrypted
 * store is not open, then <em>errorCB()</em> will be called with the error
 * <em>STORAGE_NOT_OPEN</em>. If there are no keys in the store then <em>successCB()</em> will be
 * called with <em>null</em>.
 * 
 * @memberOf adobeDPS-EncryptedStorageService.prototype
 * 
 * @param {Function} successCB The callback function that handles the success of the request. It
 * receives the array of currently defined keys or <em>null</em> if no keys are defined.
 * <br/><em>Callback Signature: successCB(Array keys)</em>
 *
 * @param {Function} errorCB The callback function that receives the error if the request
 * fails. <br/><em>Callback Signature: errorCB({code: Number, message: String})</em>
 * 
 * @throws {Error} If the errorCB is invalid
 * @platform iOS
 */ 
EncryptedStorageService.prototype.getKeys = function(successCB, errorCB) {  
    throwErrorIfInvalid(errorCB, 'Undefined error callback function');
 
    if (!isValidCallback(successCB)) {
        var error = {code: EncryptedStorageErrorCodes.STORAGE_INVALID_ARGUMENT,
                     message: "Invalid success callback function"};
        errorCB(error);
        return;
    }
 
    this.callbacks[this.callbackId] =
        {type: "getKeys", successCB: successCB, errorCB: errorCB};   

    Interface.instance._send({
        action: "call", 
        path: "encryptedStorageService",
        data: {
            method: "getKeys",
            callbackId: this.callbackId
            }
        }
    );
    
    this.callbackId++;
}

/**
 * The encrypted store is cleared of all data. If the encrypted store is not open, then
 * <em>errorCB()</em> will be called with the error <em>STORAGE_NOT_OPEN</em>. If the operation is
 * successful, then <em>successCB()</em> is called with an empty argument list.
 * 
 * @memberOf adobeDPS-EncryptedStorageService.prototype
 * 
 * @param {Function} successCB The callback function that handles the success of the
 * request. <br/><em>Callback Signature: successCB()</em>
 *
 * @param {Function} errorCB The callback function that receives the error if the request
 * fails. <br/><em>Callback Signature: errorCB({code: Number, message: String})</em>
 * 
 * @throws {Error} If the errorCB is invalid
 * @platform iOS
 */ 
EncryptedStorageService.prototype.clear = function(successCB, errorCB) {  
    throwErrorIfInvalid(errorCB, 'Undefined error callback function');
 
    if (!isValidCallback(successCB)) {
        var error = {code: EncryptedStorageErrorCodes.STORAGE_INVALID_ARGUMENT,
                     message: "Invalid success callback function"};
        errorCB(error);
        return;
    }
 
    this.callbacks[this.callbackId] =
        {type: "clear", successCB: successCB, errorCB: errorCB};   

    Interface.instance._send({
        action: "call", 
        path: "encryptedStorageService",
        data: {
            method: "clear",
            callbackId: this.callbackId
            }
        }
    );
    
    this.callbackId++;
}

/**
 * The singleton of the EncryptedStorageService.
 * @static
 * @name instance
 * @memberOf adobeDPS-EncryptedStorageService
 */
EncryptedStorageService.instance = new EncryptedStorageService();


    /**
 * @lends adobeDPS
 */
function Interface() {
    try {
        Log.instance.enableLogging = true;
        Log.instance.debug("Interface initialized");
        /**
         * The version of this LibraryAPI Interface
         * @type Number
         */
        this.version = 1.4;

        /**
         * A unique ID used to identify this instance of the API within the greater
         * application. This makes it so multiple webViews using this API could theoretically
         * be used in parallel. 
         * @type String
         */
        this.uid = this._generateUID();

        /**
         * A signal that indicates that the API has finished initializing. It is advisable
         * to wait for this signal to be dispatched before any further interaction with
         * the API.
         * <br/><em>Callback Signature: initializationCompleteHandler()</em>
         * @type adobeDPS-Signal
         */
        this.initializationComplete = new Signal();
        this.initializationComplete.memorize = true;

        /**
         * The instance of the bridge.
         * @type adobeDPS-Bridge
         * @private
         */
        this._bridge = Bridge.instance;

        /**
         * The main model object for the library.
         * @type adobeDPS-LibraryService
         */
        this.libraryService = LibraryService.instance;

        /**
         * The manager that handles incoming and outgoing transactions.
         * @type adobeDPS-TransactionManager
         */
        this.transactionManager = TransactionManager.instance;

        /**
         * The service to manage user authentication.
         * @type adobeDPS-AuthenticationService
         */
        this.authenticationService = AuthenticationService.instance;

        /**
         * The service that exposes information about the device that the viewer is
         * currently running on.
         * @type adobeDPS-DeviceService
         */
        this.deviceService = DeviceService.instance;

        /**
         * The service to manage the user's receipts.
         * @type adobeDPS-ReceiptService
         */
        this.receiptService = ReceiptService.instance;

        /**
         * Create a new settings service
         * @type adobeDPS-SettingsService
         */
        this.settingsService = SettingsService.instance;

        /**
         * The service to send custom analytics events.
         * @type adobeDPS-AnalyticsService
         */
        this.analyticsService = AnalyticsService.instance;

        /**
         * The service to get viewer configuration information.
         * @type adobeDPS-ConfigurationService
         */
        this.configurationService = ConfigurationService.instance;

        /**
         * The service to check if this is a dialog or dismiss a dialog.
         * @type adobeDPS-DialogService
         */
        this.dialogService = DialogService.instance;
        
        /**
         * The service handling the geolocation functionality
         * @type adobeDPS-GeolocationService
         */
        this.geolocation = null;

        /**
         * The service handling the calendar functionality
         * @type adobeDPS-CalendarService
         */
        this.calendarService = CalendarService.instance;

        /**
         * The service handling the OAuth authentication functionality
         * @type adobeDPS-OAuthRedirectService
         */
        this.oauthRedirectService = null;

        /**
         * The service handling the folio activity introspection service.
         * @type adobeDPS-FolioActivityService
         */
        this.folioActivityService = null;

        /**
         * The service handling the encrypted local service.
         * @type adobeDPS-EncryptedStorageService
         */
        this.encryptedStorageService = null;

        /**
         * The instance of our built-in logging mechanism.
         * @type adobeDPS-Log
         */
        this.log = Log.instance;

        Service.call(this);

        /**
         * Tell the viewer that we are ready
         */
        this._bridge.out({event: {type: "LibraryAPIReady", version: this.version, id: this.uid}});
        Log.instance.info("LibraryAPIReady - V: " + this.version + ", ID: " + this.uid);
    } catch (error) {
        Log.instance.error(error);
    }
}

Service.extend(Interface);

/**
 * Used to generate a UID for this instance of the API.
 * @memberOf adobeDPS
 */
Interface.prototype._generateUID = function () {
    return (Math.floor(Math.random() * 10000).toString() + new Date().getTime().toString());
};

/**
 * The method called to initialize the API. This should only ever be
 * called by the viewer when the API first initializes and should never
 * be used by the user of this API.
 * @memberOf adobeDPS
 */
Interface.prototype._initialize = function (data) {
    var i, update, path;

    try {
        Log.instance.debug("Interface._initialize called");

        if (!data.hasOwnProperty('length') || data.length <= 0) {
            Log.instance.warn('Interface._initialize called with no data');
        }

        for (i = 0; i < data.length; i++) {
            update = data[i];

            if (!update.hasOwnProperty("path")) {
                Log.instance.warn('Interface._initialize received update without path: ' + JSON.stringify(update));
            } else {
                path = this._getNextPathElement(update.path);
                update.path = this._getChildPath(update.path);

                switch (path) {
                    case "libraryService":
                        Log.instance.debug('Initializing libraryService...');
                        LibraryService.instance._initialize(update);
                        break;
                    case "transactionManager":
                        Log.instance.debug('Initializing transactionManager...');
                        TransactionManager.instance._initialize(update);
                        break;
                    case "authenticationService":
                        Log.instance.debug('Initializing authenticationService...');
                        AuthenticationService.instance._initialize(update);
                        break;
                    case "configurationService":
                        Log.instance.debug('Initializing configurationService...');
                        ConfigurationService.instance._initialize(update);
                        break;
                    case "deviceService":
                        Log.instance.debug('Initializing deviceService...');
                        DeviceService.instance._initialize(update);
                        break;
                    case "receiptService":
                        Log.instance.debug('Initializing receiptService...');
                        ReceiptService.instance._initialize(update);
                        break;
                    case "settingsService":
                        Log.instance.debug('Initializing settingsService...');
                        SettingsService.instance._initialize(update);
                        break;
                    case "analyticsService":
                        Log.instance.debug('Initializing analyticsService...');
                        AnalyticsService.instance._initialize(update);
                        break;
                    case "dialogService":
                        Log.instance.debug('Initializing dialogService...');
                        DialogService.instance._initialize(update);
                        break;
                    case "geolocationService":
                        Log.instance.debug('Initializing geolocationService...');
                        this.geolocation = GeolocationService.instance;
                        GeolocationService.instance._initialize(update);
                        break;                    
                    case "calendarService":
                        Log.instance.debug('Initializing calendarService...');
                        CalendarService.instance._initialize(update);
                        break;                    
                    case "oauthRedirectService":
                        Log.instance.debug('Initializing oauthRedirectService...');
                        this.oauthRedirectService = OAuthRedirectService.instance;
                        OAuthRedirectService.instance._initialize(update);
                        break;
                    case "folioActivityService":
                        Log.instance.debug('Initializing folioActivityService...');
                        this.folioActivityService = FolioActivityService.instance;
                        FolioActivityService.instance._initialize(update);
                        break;
                    case "encryptedStorageService":
                        Log.instance.debug('Initializing encryptedStorageService...');
                        this.encryptedStorageService = EncryptedStorageService.instance;
                        EncryptedStorageService.instance._initialize(update);
                        break;
                    default:
                        Log.instance.warn("Interface._initialize called with an unknown destination: " + path);
                        break;
                }
            }
        }

        // End the initialization timer
        Log.instance.profile("InitializationTime");
        this.initializationComplete.dispatch();
        Log.instance.info("Initialization complete");
    } catch (error) {
        Log.instance.error(error);
    }
};

/**
 * The method called to update parts of the API. This should only ever be
 * called by the viewer and should never be used by the user of this API.
 * @memberOf adobeDPS
 */
Interface.prototype._update = function (data) {
    var i, update, path;
    try {
        for (i = 0; i < data.length; i++) {
            update = data[i];
            if (!update.hasOwnProperty("path")) {
                Log.instance.warn('Interface._update received update without path: ' + JSON.stringify(update));
            } else {
                path = this._getNextPathElement(update.path);
                update.path = this._getChildPath(update.path);

                switch (path) {
                    case "libraryService":
                        LibraryService.instance._update(update);
                        break;
                    case "transactionManager":
                        TransactionManager.instance._update(update);
                        break;
                    case "authenticationService":
                        AuthenticationService.instance._update(update);
                        break;
                    case "configurationService":
                        ConfigurationService.instance._update(update);
                        break;
                    case "deviceService":
                        DeviceService.instance._update(update);
                        break;
                    case "receiptService":
                        ReceiptService.instance._update(update);
                        break;
                    case "settingsService":
                        SettingsService.instance._update(update);
                        break;
                    case "analyticsService":
                        AnalyticsService.instance._update(update);
                        break;
                    case "dialogService":
                        DialogService.instance._update(update);
                        break;
                    case "geolocationService":
                        GeolocationService.instance._update(update);
                        break;
                    case "calendarService":
                        CalendarService.instance._update(update);
                        break;
                    case "oauthRedirectService":
                        OAuthRedirectService.instance._update(update);
                        break;    
                    case "folioActivityService":
                        FolioActivityService.instance._update(update);
                        break;    
                    case "encryptedStorageService":
                        EncryptedStorageService.instance._update(update);
                        break;    
                    default:
                        Log.instance.warn("Interface._update called with an unknown destination: " + path);
                        break;
                }
            }
        }
    } catch (error) {
        Log.instance.error(error);
    }
};

/**
 * Helper function to send data over the bridge.
 * This could be used as a bottleneck for optimization of communication by
 * caching incoming actions. For now, we are sending each action individually.
 * @memberOf adobeDPS
 */
Interface.prototype._send = function (action) {
    try {
        this._bridge.out({event: {type: "LibraryAPIActions", actions: [action]}});
    } catch (error) {
        Log.instance.error(error);
    }
};

/**
 * The singleton of the Interface.
 * @static
 * @ignore
 */
Interface.instance = new Interface();


    return Interface.instance;
}());
