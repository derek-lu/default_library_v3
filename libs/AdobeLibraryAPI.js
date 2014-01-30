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

    /**
 * Creates an instance of the Bridge class.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * AdobePatentID="2472US01"
 * @class Class used to communicate with the native application.
 * @private
 */
function Bridge() {
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
 * 				is the total number of data parts.
 * @param data A string of partial data. If 'execute' is true, data
 * 				is the endpoint selector to be executed.
 * @param execute If false, 'data' is stored in the bridge. If true,
 * 				the data parts are concatenated and a JSON object is created
 * 				from the string. The input function is called with the endpoint
 * 				(passed in the data parameter).
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
 * The singleton of the Bridge.
 * @static
 * @name instance
 * @memberOf adobeDPS-Bridge
 */
Bridge.instance = new Bridge();

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
 * @class Class used for logging within the Adobe Library API.
 */
function Log() {

    /**
     * Enable logging service. Defaults to true. If it is false
     * all calls to the Logging service will be disabled
     * @type Boolean
     * @memberOf adobeDPS-Log.prototype
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
 */
Log.instance = new Log();

/**
 * The log levels that may be used.
 * @memberOf adobeDPS-Log.prototype
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
     * Start profiling bridge initialization
     */
    Log.instance.profile("InitializationTime");

	// Base classes
	
/**
 * @import Wrapper.js
 *
 * Create an instance of a class.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class Base class for all classes using inheritance
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
	 */
	active : true,

	/**
	 * Default parameters passed to listener during `Signal.dispatch` and `SignalBinding.execute`. (curried parameters)
	 * @type Array|null
	 */
	params : null,

	/**
	 * Call listener passing arbitrary parameters.
	 * <p>If binding was added using `Signal.addOnce()` it will be automatically removed from signal dispatch queue, this method is used internally for the signal dispatch.</p>
	 * @param {Array} [paramsArr] Array of parameters that should be passed to the listener
	 * @return {*} Value returned by the listener.
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
	 */
	detach : function () {
		return this.isBound()? this._signal.remove(this._listener, this.context) : null;
	},

	/**
	 * @return {Boolean} `true` if binding is still bound to the signal and have a listener.
	 */
	isBound : function () {
		return (!!this._signal && !!this._listener);
	},

	/**
	 * @return {Function} Handler function bound to the signal.
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
	 */
	isOnce : function () {
		return this._isOnce;
	},

	/**
	 * @return {String} String representation of the object.
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
/** @lends adobeDPS-Signal.prototype */
{


	/**
	 * If Signal should keep record of previously dispatched parameters and
	 * automatically execute listener during `add()`/`addOnce()` if Signal was
	 * already dispatched before.
	 * @type Boolean
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
	 */
	getNumListeners : function () {
		return this._bindings.length;
	},

	/**
	 * Stop propagation of the event, blocking the dispatch to next listeners on the queue.
	 * <p><strong>IMPORTANT:</strong> should be called only during signal dispatch, calling it before/after dispatch won't affect signal broadcast.</p>
	 * @see adobeDPS-Signal.prototype.disable
	 */
	halt : function () {
		this._shouldPropagate = false;
	},

	/**
	 * Dispatch/Broadcast Signal to all listeners added to the queue.
	 * @param {...*} [params] Parameters that should be passed to each handler.
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
	 */
	forget : function(){
		this._prevParams = null;
	},

	/**
	 * Remove all bindings from signal and destroy any reference to external objects (destroy Signal object).
	 * <p><strong>IMPORTANT:</strong> calling any method on the signal instance after calling dispose will throw errors.</p>
	 */
	dispose : function () {
		this.removeAll();
		delete this._bindings;
		delete this._prevParams;
	},

	/**
	 * @return {String} String representation of the object.
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
 */
var TransactionErrorType = {
	/** 
	 * <strong>Value: -100</strong>
	 * <br/>Indicates the Library could not connect to the Internet to complete a transaction.
	 */
	TransactionCannotConnectToInternetError:-100,
	/** 
	 * <strong>Value: -110</strong>
	 * <br/>Indicates the Library could not connect to the particular server needed to complete a transaction. 
	 */
	TransactionCannotConnectToServerError:-110,
	/** 
	 * <strong>Value: -150</strong>
	 * <br/>Indicates the provided credentials were not recognized by the entitlement server. 
	 */
	TransactionAuthenticationUnrecognizedCredentialsError: -150,
	/** 
	 * <strong>Value: -200</strong>
	 * <br/>Indicates folio and subscription purchasing is disabled on this device.
	 */
	TransactionFolioPurchasingDisabledError: -200,
	/** 
	 * <strong>Value: -210</strong>
	 * <br/>Indicates a single folio purchase transaction failed because an error occurred communicating with the in-app purchase system. 
	 */
	TransactionFolioCannotPurchaseError: -210,
	/** 
	 * <strong>Value: -220</strong>
	 * <br/>Indicates a subscription purchase transaction failed because an error occurred communicating with the in-app purchase system.
	 */
	TransactionSubscriptionCannotPurchaseError: -220,
	/** 
	 * <strong>Value: -225</strong>
	 * <br/>Indicates there was an error attempting to resolve the valid date ranges for a subscription. 
	 */
	TransactionSubscriptionResolveError: -225,
	/** 
	 * <strong>Value: -250</strong>
	 * <br/>Indicates a restore purchases transaction failed because an error occurred communicating with the in-app purchase system.
	 */
	TransactionRestorePurchasesError: -250,
	/** 
	 * <strong>Value: -300</strong>
	 * <br/>Indicates the user attempted to purchase or download a folio when the publisher's download quota has been exceeded.
	 */
	TransactionQuotaExceededError: -300,
	/** 
	 * <strong>Value: -400</strong>
	 * <br/>Indicates the user attempted to purchase or download a folio that is incompatible with the current Viewer.
	 */
	TransactionFolioIncompatibleError: -400,
	/** 
	 * <strong>Value: -500</strong>
	 * <br/>Indicates the user attempted to download a folio that was larger than the space available on the device. 
	 */
	TransactionFolioNotEnoughDiskSpaceError: -500,
	/** 
	 * <strong>Value: -510</strong>
	 * <br/>Indicates there was an error downloading the folio that was not network related.
	 */
	TransactionFolioCannotDownloadError: -510,
	/** 
	 * <strong>Value: -520</strong>
	 * <br/>Indicates the folio being downloaded was either corrupted or became unavailable
	 */
	TransactionFolioFileMissingOrInvalid: -520,
	/** 
	 * <strong>Value: -530</strong>
	 * <br/>Indicates there was an error during the the installation of the folio
	 */
	TransactionFolioCannotInstallItemError: -530,
    /**
     * <strong>Value: -540</strong>
     * <br/>Indicates the preview download failed because there was no preview of the folio available
     */
    TransactionFolioNoPreviewAvailable: -540,
	/** 
	 * <strong>Value: -900</strong>
	 * <br/>Indicates a transaction failed because of an error that occurred in the LibraryAPI 
	 */
	TransactionInternalError: -900,
	
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
 */
function TransactionError() {
	if (!(this instanceof TransactionError)) {
		throw new Error('TransactionError initialized without new keyword!');
	}

	/**
	 * Code for this TransactionError
	 * @memberOf adobeDPS-TransactionError.prototype
	 * @type adobeDPS-TransactionErrorType
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
 */
var TransactionState = {
	/** 
	 * <strong>Value: -100</strong>
	 * <br/>The Transaction has failed. The {@link adobeDPS-Transaction#error} field should be populated.
	 * <br/><em>This is a final Transaction state.</em>
	 */
	FAILED: -100,
	/** 
	 * <strong>Value: -1</strong>
	 * <br/>The Transaction has been canceled by the user.
	 * <br/><em>This is a final Transaction state.</em>
	 */
	CANCELED: -1,
	/** 
	 * <strong>Value: 0</strong>
	 * <br/>The initial state of the Transaction before it is started.
	 */
	INITIALIZED: 0,
	/** 
	 * <strong>Value: 100</strong>
	 * <br/>The Transaction has been temporarily paused by the user.
	 */
	PAUSED: 100,
	/** 
	 * <strong>Value: 200</strong>
	 * <br/>The Transaction is currently ongoing. 
	 */
	ACTIVE: 200,
	/** 
	 * <strong>Value: 400</strong>
	 * <br/>The transaction has completed without any errors.
	 * <br/><em>This is a final Transaction state.</em>
	 */
	FINISHED: 400,
	
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
	 */
	this.stateChangedSignal = new Signal();
	
	/**
	 * Signal to indicate that the transaction has completed. This could mean that it finished,
	 * failed, or been canceled. You will need to check the state and the error field to check the results.
	 * <br/><em>Callback Signature: transactionCompletedHandler({@link adobeDPS-Transaction})</em>
	 * @memberOf adobeDPS-Transaction.prototype
	 * @type adobeDPS-Signal
	 */
	this.completedSignal = new Signal();
	
	/**
	 * Signal to indicate transaction progress. Will only be dispatched if `isDeterminate` is true.
	 * Sends `this.progress` to the handlers.
	 * <br/><em>Callback Signature: progressHandler({@link adobeDPS-Transaction})</em>
	 * @memberOf adobeDPS-Transaction.prototype
	 * @type adobeDPS-Signal
	 */
	this.progressSignal = new Signal();
	
	/**
	 * The Unique id of this Transaction. Will be set when the Transaction is registered with the
	 * TransactionManager.
	 * @memberOf adobeDPS-Transaction.prototype
	 * @type String
	 */
	this.id = null;
	
	/**
	 * The state of this Transaction.
	 * @memberOf adobeDPS-Transaction.prototype
	 * @default {adobeDPS-TransactionState#INITIALIZED}
	 * @type adobeDPS-TransactionState
	 */
	this.state = 0; 
	
	/**
	 * The progress of this Transaction.
	 * <br/>Represented as a 100-based percentage ( values between 0 and 100).
	 * <br/><em>NOTE: Will remain 0 if `isDeterminate` is false</em>
	 * @memberOf adobeDPS-Transaction.prototype
	 * @type Number
	 */
	this.progress = 0;
	
	/**
	 * The TransactionError associated with this transaction, assuming an error has occurred.	 
	 * @memberOf adobeDPS-Transaction.prototype
	 * @type adobeDPS-TransactionError
	 */
	this.error = new TransactionError();
	
	/**
	 * Whether this Transaction can be canceled.
	 * @memberOf adobeDPS-Transaction.prototype
	 * @default false
	 * @type Boolean
	 */
	this.isCancelable = false;
	
	/**
	 * Whether this Transaction can be paused.
	 * @memberOf adobeDPS-Transaction.prototype
	 * @default false
	 * @type Boolean
	 */
	this.isPausable = false;
	
	/**
	 * Whether this Transaction is determinate (has progress). If true, you can expect to
	 * receive progressSignals from this transaction. 
	 * @memberOf adobeDPS-Transaction.prototype
	 * @default false
	 * @type Boolean
	 */
	this.isDeterminate = false;
	
	/**
	 * Whether failure of the transaction is a terminal state. When this is true, the
	 * completedSignal will be dispatched when the state changes to FAILED. Otherwise, 
	 * FAILED should be treated like PAUSED and can be resumed.
	 * @memberOf adobeDPS-Transaction.prototype
	 * @default false
	 * @type Boolean
	 */
	this.isFailureTerminal = true;
}

Class.extend(Transaction);

/**
 * Whether this transaction is of type FolioStateChangingTransaction
 * @memberOf adobeDPS-Transaction.prototype
 * @returns {adobeDPS-Transaction} true or false
 */
Transaction.prototype.isFolioStateChangingTransaction = function () {
	return this instanceof FolioStateChangingTransaction;
};

/**
 * Start this transaction.
 * @memberOf adobeDPS-Transaction.prototype
 * @returns {adobeDPS-Transaction} The started transaction
 * @throws {Error} If the transaction wasn't properly initialized
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
 */
function ModifySubscriptionsListTransaction(addedSubscriptions, removedSubscriptions) {

    /**
     * The subscription products to be added to the available subscriptions
     * @type Array
     * @see adobeDPS-Subscription
     */
	this.addedSubscriptions = addedSubscriptions;

    /**
     * The subscription products to be removed from the available subscriptions
     * @type Array
     * @see adobeDPS-Subscription
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
 */
function SubscribeTransaction(productId) {
	/**
	 * The productId of the subscription to purchase.
	 * @memberOf adobeDPS-SubscribeTransaction.prototype
	 * @type String
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
 */
function UserSigninTransaction(username, password, token) {
	if (!token && (!username || !password)) {
		throw new Error('A token or a username and password must be provided for a UserSigninTransaction');
	}
	
	/**
	 * The username to use to login.
	 * @memberOf adobeDPS-UserSigninTransaction.prototype
	 * @type String
	 */
	this.username = username;
	
	/**
	 * The password to use to login.
	 * @memberOf adobeDPS-UserSigninTransaction.prototype
	 * @type String
	 */
	this.password = password;
	
	/**
	 * The token to use to login.
	 * @memberOf adobeDPS-UserSigninTransaction.prototype
	 * @type String
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
 */
function TransactionManager() {
	/**
	 * Signal to indicate that a new transaction has arrived from the native code.
	 * <br/><em>Callback Signature: newTransactionsAvailableHandler([ {@link adobeDPS-Transaction}, ... ])</em>
	 * @memberOf adobeDPS-TransactionManager.prototype
	 * @type adobeDPS-Signal
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
	 */
	this.transactionStates = TransactionState;
	
	/**
	 * This is the user-accessible location to access TransactionErrorType constants.
	 * @memberOf adobeDPS-TransactionManager.prototype
	 * @type adobeDPS-TransactionErrorType
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
 */
TransactionManager.instance = new TransactionManager();

	/**
 * Enum for the state of the Folio.
 * @see adobeDPS-Folio#state
 * @namespace
 * @enum {Number}
 */
var FolioState = {
	/** 
	 * <strong>Value: 0</strong>
	 * <br/>Indicates an internal or server error. Typically, this indicates that the Folio is not configured correctly. 
	 */
	INVALID: 0,
	/** 
	 * <strong>Value: 50</strong>
	 * <br/>Folio is not available from the broker. It still may be available via direct entitlement when the user authenticates. */
	UNAVAILABLE: 50,
	/** 
	 * <strong>Value: 100</strong>
	 * <br/> Folio is ready to be purchased. 
	 */
	PURCHASABLE: 100,
	/** 
	 * <strong>Value: 101</strong>
	 * <br/> Folio is currently being purchased. 
	 */
	PURCHASING: 101,
	/** 
	 * <strong>Value: 200</strong>
	 * <br/> Folio is entitled but not downloaded. 
	 */
	ENTITLED: 200,
	/** 
	 * <strong>Value: 201</strong>
	 * <br/> Folio is currently being downloaded. 
	 */
	DOWNLOADING: 201,
	/** 
	 * <strong>Value: 400</strong>
	 * <br/> Folio will soon be extracted. 
	 * <br/><em>NOTE: This state will only occur momentarily, if at all. It will not occur if progressive download is enabled.</em> 
	 */
	EXTRACTABLE: 400,
	/** 
	 * <strong>Value: 401</strong>
	 * <br/> Folio is currently be extracted. 
	 * <br/><em>NOTE: You will never see this state if progressive download is enabled.</em> 
	 */
	EXTRACTING: 401,
	/** 
	 * <strong>Value: 1000</strong>
	 * <br/> Folio is finished installing and is complete. 
	 */
	INSTALLED: 1000
};

/**
 * Enum for the content preview state of the Folio.
 * @see adobeDPS-Folio#contentPreviewState
 * @namespace
 * @enum {Number}
 */
var FolioContentPreviewState = {
    /**
     * <strong>Value: 0</strong>
     * <br/>Indicates preview content availability information has not been requested.
     */
    NOT_REQUESTED: 0,
    /**
     * <strong>Value: 1</strong>
     * <br/>Indicates preview content availability information is being requested.
     * */
    REQUESTED: 1,
    /**
     * <strong>Value: 2</strong>
     * <br/> Indicates the folio is not previewable.
     */
    UNAVAILABLE: 2,
    /**
     * <strong>Value: 3</strong>
     * <br/> Indicates the folio can be previewed.
     */
    AVAILABLE: 3,
    /**
     * <strong>Value: 4</strong>
     * <br/> Indicates the folio is not previewable because this feature is not enabled for this account.
     */
    DISABLED: 4
};

/**
 * Creates an instance of a BaseFolio.
 *
 * @class Representation of a BaseFolio object.
 * @extends adobeDPS-Class
 */
function BaseFolio() {
	
	/**
	 * Signal to indicate that this BaseFolio has been updated. It will pass an
	 * array of Strings containing the names of the properties that have been
	 * updated.
	 * <br/><em>Callback Signature: updatedHandler([String, ...])</em>
	 * @memberOf adobeDPS-BaseFolio.prototype
	 * @type adobeDPS-Signal
	 */
	this.updatedSignal = new Signal();
	
	/**
	 * The Unique id of this BaseFolio.
	 * @memberOf adobeDPS-BaseFolio.prototype
	 * @type String
	 */
	this.id = null;
	
	/**
	 * The current transactions acting on this BaseFolio. This will be an array of
	 * {@link adobeDPS-FolioTransactions}. Only one of these {@link adobeDPS-Transactions}
	 * may be a {@link adobeDPS-FolioStateChangingTransaction}, but this may consist of
	 * multiple {@link adobeDPS-FolioTransactions}.
	 * @memberOf adobeDPS-BaseFolio.prototype
	 * @type Array
	 */
	this.currentTransactions = [];
	
	/**
	 * The size of this BaseFolio in Bytes. This value will not be available until the download process actually
      * begins.
	 * @memberOf adobeDPS-BaseFolio.prototype
	 * @type Number
	 */
	this.downloadSize = null;
	
	/**
	 * The State of this BaseFolio.
	 * @memberOf adobeDPS-BaseFolio.prototype
	 * @default adobeDPS-FolioState.INVALID
	 * @type adobeDPS-FolioState
	 */
	this.state = FolioState.INVALID;
	
	/**
	 * The local file URL of the preview image for this BaseFolio.
	 * @memberOf adobeDPS-BaseFolio.prototype
	 * @type String
	 */
	this.previewImageURL = null;
	
	/**
	 * The title of this BaseFolio. This will be exact value that is entered at publish time.
	 * @memberOf adobeDPS-BaseFolio.prototype
	 * @type String
	 */
	this.title = null;
	
    /**
     * This indicates whether this BaseFolio is compatible with this version of the viewer.
     * @memberOf adobeDPS-BaseFolio.prototype
     * @type Boolean
     */
    this.isCompatible = false;
	
	/** 
	 * Whether the BaseFolio is currently able to be downloaded. When this is true, calling
	 * download will cause the BaseFolio to begin downloading. This property should always be
	 * used to determine whether {@link adobeDPS-BaseFolio#download} may be called.
	 * @memberOf adobeDPS-BaseFolio.prototype
	 * @type Boolean
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
	 */
	this.isViewable = false;
	
	/**
	 * Whether the BaseFolio is currently able to be archived. This is provided since it is
	 * not always apparent when a BaseFolio may be archived. This property should be used
	 * (as opposed to the baseFolio state) to determine whether {@link adobeDPS-BaseFolio#archive}
	 * may be called.
	 * @memberOf adobeDPS-BaseFolio.prototype
	 * @type Boolean
	 */
	this.isArchivable = false;
	
	/**
	 * This indicates whether this BaseFolio is currently updatable. When this is true, you
	 * may call {@link adobeDPS-BaseFolio#update} to update this baseFolio.
	 * @memberOf adobeDPS-BaseFolio.prototype
	 * @type Boolean
	 */
	this.isUpdatable = false;
}

Service.extend(BaseFolio);

/**
 * Start a download transaction on this BaseFolio. Requires that {@link adobeDPS-BaseFolio#isDownloadable} be true.
 * @memberOf adobeDPS-BaseFolio.prototype
 * @returns {adobeDPS-DownloadTransaction} The started download transaction
 * @throws {Error} If the BaseFolio is in the wrong state or has another active transaction
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
 */
function Folio() {

    BaseFolio.call(this);
	/**
	 * The id used to identify this Folio to the broker.
	 * @memberOf adobeDPS-Folio.prototype
	 * @type String
	 */
	this.productId = null;
	
	/**
	 * The folioNumber field of this Folio. This will be the exact value that is
	 * entered at publish time.
	 * @memberOf adobeDPS-Folio.prototype
	 * @type String
	 */
	this.folioNumber = null;
	
	/**
	 * The date this Folio was published.
	 * @memberOf adobeDPS-Folio.prototype
	 * @type Date
	 */
	this.publicationDate = null;

    /**
     * The description field of this Folio. This will be the exact value that is
     * entered at publish time.
     * @memberOf adobeDPS-Folio.prototype
     * @type String
     */
    this.folioDescription = null;
	
	/**
	 * The description field of this Folio. If the folio is free it is the same as the
     * {@link adobeDPS-Folio#folioDescription}. On iOS, if the folio is retail, it is the description provided
     * to the broker.
	 * @memberOf adobeDPS-Folio.prototype
	 * @type String
	 */
	this.description = null;

	/**
	 * The localized price of this Folio. This value is a string that is already localized
	 * and contains the currency symbol. 
	 * @memberOf adobeDPS-Folio.prototype
	 * @type String
	 */
	this.price = null;
	
	/**
	 * The broker currently associated with this Folio.
	 * @memberOf adobeDPS-Folio.prototype
	 * @type String
	 */
	this.broker = null;
	
	/**
	 * The filter field of this Folio. This will be the exact value that is entered at publish time.
	 * @memberOf adobeDPS-Folio.prototype
	 * @type String
	 */
	this.filter = null;
	
	/**
	 * Indicates whether this Folio is entitled by an entitlement server.
	 * @memberOf adobeDPS-Folio.prototype
	 * @type Boolean
	 */
	this.isThirdPartyEntitled = false;
	
	/**
	 * The target device dimensions of this Folio.
	 * @memberOf adobeDPS-Folio.prototype
	 * @type String
	 */
	this.targetDimensions = null;

    /**
     * If a folio can be purchased
     * @memberOf adobeDPS-Folio.prototype
     * @type Boolean
     */
    this.isPurchasable = false;

    /**
     * If a folio has free articles that can be downloaded
     * without any folio entitlement. Will always be false unless
     * verifyContentPreviewSupported is called.
     * @memberOf adobeDPS-Folio.prototype
     * @type Boolean
     */
    this.supportsContentPreview = false;
	
	/**
	 * The receipt associated with this Folio.
	 * @memberOf adobeDPS-Folio.prototype
	 * @type adobeDPS-Receipt
	 */
	this.receipt = null;

    /**
     * The EntitlementType of this Folio.
     * @memberOf adobeDPS-Folio.prototype
     * @default adobeDPS-EntitlementType.UNKNOWN
     * @type adobeDPS-EntitlementType
     */
    this.entitlementType = EntitlementType.UNKNOWN;
    
    /**
     * This indicates whether this folio has sections.
     * @memberOf adobeDPS-Folio.prototype
     * @type Boolean
     */
    this.hasSections = false;

    /**
     * The FolioContentPreviewState of this Folio.
     * @memberOf adobeDPS-Folio.prototype
     * @default adobeDPS-FolioContentPreviewState.NOT_REQUESTED
     * @type adobeDPS-FolioContentPreviewState
     */
    this.contentPreviewState = FolioContentPreviewState.NOT_REQUESTED;
    
	/**
	 * An associative array containing the sections, indexed by {@link adobeDPS-BaseFolio#id}.
	 * @memberOf adobeDPS-Folio.prototype
	 * @type {@link adobeDPS-DocumentMap#id}
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
 */
function Section() {
    BaseFolio.call(this);
    
    /**
	 * The designated parent Folio of this section.
	 * @memberOf adobeDPS-Section.prototype
	 * @type Boolean
	 */
    this.parentFolio = null;
    
    /**
	 * Indicates whether this Section is at the head of the download queue.
	 * @memberOf adobeDPS-Section.prototype
	 * @type Boolean
	 */
	this.isAtHeadOfDownloadQueue = false;
	
	/**
	 * The index of this section in native sections array.
	 * @memberOf adobeDPS-Section.prototype
	 * @type Number
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
 */
function DocumentMap() {
	/**
	 * Signal indicating that documents have been added to internal.
	 * <br/><em>Callback Signature: documentsAddedHandler([ {@link Object}, ...])</em>
	 * @memberOf adobeDPS-DocumentMap.prototype
	 * @type adobeDPS-Signal
	 */
	this.addedSignal = new Signal();
	
	/**
	 * Signal indicating that documents have been removed from internal.
	 * <br/><em>Callback Signature: documentsRemovedHandler([ {@link Object}, ...])</em>
	 * @memberOf adobeDPS-DocumentMap.prototype
	 * @type adobeDPS-Signal
	 */
	this.removedSignal = new Signal();
	
	/**
	 * An associative array containing the documents, indexed by id.
	 * @memberOf adobeDPS-DocumentMap.prototype
	 * @type Object
	 */
	this.internal = {};
}

/**
 * Function to sort the map using a sort function and return a new Array of objects.
 * @memberOf adobeDPS-DocumentMap.prototype
 * @param {function} sortFunc A function to sort the Map. This function can be any function accepted by the `Array.sort()` function.
 * @returns {Array} The sorted array of Objects
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
 */
function LibraryService() {
	/**
	 * Signal to indicate updates to the model not associated with the DocumentMap. This will
	 * typically indicate a change in the `currentTransaction` property.
	 * <br/><em>Callback Signature: updatedHandler()</em>
	 * @memberOf adobeDPS-LibraryService.prototype
	 * @type adobeDPS-Signal
	 */
	this.updatedSignal = new Signal();
	
	/**
	 * Object containing the map of folios by id
	 * @memberOf adobeDPS-LibraryService.prototype
	 * @type adobeDPS-DocumentMap
	 */
	this.folioMap = new DocumentMap();
	
	/**
	 * Folio states enum accessor.
	 * <br/>This is where you should access the {@link adobeDPS-FolioState} enums from.
	 * @memberOf adobeDPS-LibraryService.prototype
	 * @type adobeDPS-FolioState
	 */
	this.folioStates = FolioState;

    /**
     * Folio content preview state enum accessor.
     * <br/>This is where you should access the {@link adobeDPS-FolioContentPreviewState} enums from.
     * @memberOf adobeDPS-LibraryService.prototype
     * @type adobeDPS-FolioContentPreviewState
     */
    this.folioContentPreviewStates = FolioContentPreviewState;
	
	/**
	 * The current transaction acting on the model. This is most likely a {@link adobeDPS-LibraryUpdateTransaction}.
	 * @memberOf adobeDPS-LibraryService.prototype
	 * @type adobeDPS-Transaction
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
 * The singleton of the LibraryService.
 * @static
 * @name instance
 * @memberOf adobeDPS-LibraryService
 */
LibraryService.instance = new LibraryService();


	/**
 * Create a FolioTransaction
 * @class Transaction associated with a BaseFolio
 * @param {adobeDPS-BaseFolio} folio The folio that this transaction is acting on
 * @extends adobeDPS-Transaction
 * @throws {Error} If the folio passed in is invalid or not a BaseFolio
 */
function FolioTransaction(folio) {
	/**
	 * The BaseFolio that this transaction is acting on
	 * @memberOf adobeDPS-FolioTransaction.prototype
	 * @type adobeDPS-BaseFolio
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
 */
var EntitlementType = {
    /**
     * <strong>Value: 0</strong>
     * <br/>Indicates no entitlement.
     */
    UNKNOWN: 0,
    /**
     * <strong>Value: 0</strong>
     * <br/>Indicates free entitlement.
     */
    FREE: 1,
    /**
     * <strong>Value: 2</strong>
     * <br/>Entitled via single in-app purchase. */
    SINGLE: 2,
    /**
     * <strong>Value: 3</strong>
     * <br/> Entitled via subscription in-app purchase.
     */
    SUBSCRIPTION: 3,
    /**
     * <strong>Value: 4</strong>
     * <br/> Entitled via third-party entitlement server.
     */
    THIRD_PARTY: 4,
    /**
     * <strong>Value: 5</strong>
     * <br/> Entitled via internal entitlement service.
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
 */
function Receipt(broker, productId, token) {
	
	/**
	 * The broker that this receipt was issued by.
	 * @memberOf adobeDPS-Receipt.prototype
	 * @type String
	 */
	this.broker = broker;
	
	/**
	 * The productId that this receipt is associated with.
	 * @memberOf adobeDPS-Receipt.prototype
	 * @type String
	 */
	this.productId = productId;
	
	/**
	 * The validation token for this receipt.
	 * @memberOf adobeDPS-Receipt.prototype
	 * @type String
	 */
	this.token = token;
	
	/**
	 * Whether this receipt is a subscription receipt.
	 * @memberOf adobeDPS-Receipt.prototype
	 * @type Boolean
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
 */
function Subscription(productId, title, duration, price, isOwned) {

	/**
	 * Signal to indicate that this Subscription has been updated. It will pass an
	 * array of Strings containing the names of the properties that have been
	 * updated.
	 * <br/><em>Callback Signature: updatedHandler([String, ...])</em>
	 * @memberOf adobeDPS-Subscription.prototype
	 * @type adobeDPS-Signal
	 */
	this.updatedSignal = new Signal();
	
	/**
	 * The productId (aka SKU or Subscription SKU) of this subscription.
	 * @memberOf adobeDPS-Subscription.prototype
	 * @type String
	 */
	this.productId = productId;
	
	/**
	 * The localized title of this subscription.
	 * @memberOf adobeDPS-Subscription.prototype
	 * @type String
	 */
	this.title = title;
	
	/**
	 * The localized duration of this subscription.
	 * @memberOf adobeDPS-Subscription.prototype
	 * @type String
	 */
	this.duration = duration;
	
	/**
	 * The localized price of this subscription.
	 * @memberOf adobeDPS-Subscription.prototype
	 * @type String
	 */
	this.price = price;
	
	/**
	 * Whether this subscription is currently owned by the user.
	 * @memberOf adobeDPS-Subscription.prototype
	 * @type String
	 */
	this.isOwned = isOwned || false;
	
	/**
	 * The latest receipt associated with this subscription.
	 * @memberOf adobeDPS-Subscription.prototype
	 * @type SubscriptionReceipt
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
 */
function SubscriptionReceipt(broker, productId, token, startDate, endDate) {
	/**
	 * The date the subscription period begins
	 * @memberOf adobeDPS-SubscriptionReceipt.prototype
	 * @type Date
	 */
	this.startDate = startDate;
	
	/**
	 * The date the subscription period ends
	 * @memberOf adobeDPS-SubscriptionReceipt.prototype
	 * @type Date
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
 */
var ApplicationStateType = {
	/** 
	 * Indicates a native application state. 
	 */
	NATIVE: "builtin",
	
	/** 
	 * Indicates an HTML application state. 
	 */
	WEBVIEW: "webview"
};

/**
 * Creates an instance of the Application state class.
 * @class Representation of an Application state within the API.
 * @extends adobeDPS-Class
 */
function ApplicationState() {
	/**
	 * The file URL to the up image associated with this state.
	 * @memberOf adobeDPS-ApplicationState.prototype
	 * @type String
	 */
	this.buttonUpImage = null;
	
	/**
	 * The file URL to the down image associated with this state.
	 * @memberOf adobeDPS-ApplicationState.prototype
	 * @type String
	 */
	this.buttonDownImage = null;
	
	/**
	 * The file URL to the disabled image associated with this state.
	 * @memberOf adobeDPS-ApplicationState.prototype
	 * @type String
	 */
	this.buttonDisabledImage = null;
	
	/**
	 * The label used to identify this state.
	 * @memberOf adobeDPS-ApplicationState.prototype
	 * @type String
	 */
	this.label = null;
	
	/**
	 * The type of this application state.
	 * @memberOf adobeDPS-ApplicationState.prototype
	 * @type adobeDPS-ApplicationStateType
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
	newState.label = json.label;
	newState.type = json.stateType;
	newState.orientation = json.orientation;
	return newState;
};

/**
 * Function used to go to the application state
 * @memberOf adobeDPS-ApplicationState.prototype
 * @param {String} stateLabel The label of this state
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
 */
function PreviewImageTransaction(folio, isPortrait, width, height) {
	/**
	 * Whether the image requested should be portrait or landscape.
	 * @memberOf adobeDPS-PreviewImageTransaction.prototype
	 * @type Boolean
	 */
	this.isPortrait = isPortrait;
	
	/**
	 * The requested width of the preview image.
	 * @memberOf adobeDPS-PreviewImageTransaction.prototype
	 * @type Number
	 */
	this.width = width;
	
	/**
	 * The requested height of the preview image.
	 * @memberOf adobeDPS-PreviewImageTransaction.prototype
	 * @type Number
	 */
	this.height = height;
	
	/**
	 * The resulting image URL of this transaction. This property will be populated once
	 * this transaction is completed successfully.
	 * @memberOf adobeDPS-PreviewImageTransaction.prototype
	 * @type String
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
 * Create an instance of a Setting.
 * <br />- <strong>This is an abstract constructor and shouldn't be called by regular users.</strong>
 * @class Parent class of all Settings.
 * @extends adobeDPS-Service
 */
function Setting() {
	/**
	 * Signal to indicate that this setting has been updated.
	 * <br/><em>Callback Signature: updatedHandler()</em>
	 * @memberOf adobeDPS-Setting.prototype
	 * @type adobeDPS-Signal
	 */
	this.updatedSignal = new Signal();
}

Service.extend(Setting);
	/**
 * Create an instance of the AutoArchive class.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class Class used to control all AutoArchive Settings
 * @extends adobeDPS-Setting
 */
function AutoArchive() {
	/**
	 * Whether this feature is supported on this platform.
	 * @memberOf adobeDPS-AutoArchive.prototype
	 * @type Boolean
	 */
	this.isSupported = false;
	
	/**
	 * Whether this feature is currently enabled.
	 * @memberOf adobeDPS-AutoArchive.prototype
	 * @type Boolean
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
 * Create an instance of the AnalyticsService.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular 
 * users.</strong>
 * @class Service for sending custom analytics events.
 * <br/><strong>Accessible from adobeDPS.analyticsService</strong>
 * @extends adobeDPS-Service
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
	"customVariable1", // 46
	"customVariable2", // 47
	"customVariable3", // 48
	"customVariable4", // 49
	"customVariable5" // 50
];

/**
 * The list of allowed custom events. These events can be aliased but you must use one of
 * these events when sending custom events.
 * @static
 * @name ALLOWED_EVENTS
 * @memberOf adobeDPS-AnalyticsService
 */
AnalyticsService.ALLOWED_EVENTS = [
	"customEvent1", // 46
	"customEvent2", // 47
	"customEvent3", // 48
	"customEvent4", // 49
	"customEvent5" // 50
];

/**
 * The list of allowed categories for all purchase events.
 * @static
 * @name PURCHASE_CATEGORIES
 * @memberOf adobeDPS-AnalyticsService
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
	customVariable1: "customVariable1",
	customVariable2: "customVariable2",
	customVariable3: "customVariable3",
	customVariable4: "customVariable4",
	customVariable5: "customVariable5"
};

/**
 * The list of current aliases used for analytics events. These can be updated
 * using {@link adobeDPS-AnalyticsService#setCustomEventAlias}.
 * @memberOf adobeDPS-AnalyticsService.prototype
 */
AnalyticsService.prototype._eventAliases = {
	customEvent1: "customEvent1", // 71
	customEvent2: "customEvent2", // 72
	customEvent3: "customEvent3", // 73
	customEvent4: "customEvent4", // 74
	customEvent5: "customEvent5" // 75
};

/**
 * Function used to set a custom alias for an analytics property. After setting the new
 * alias, that alias can be used in subsequent calls to track events when sending 
 * properties.
 * @memberOf adobeDPS-AnalyticsService.prototype
 * @param {String} realName The real name of the analytics event property as defined in ALLOWED_VARIABLES.
 * @param {String} alias The alias to use for the real property.
 * @see adobeDPS-AnalyticsService#ALLOWED_VARIABLES
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
 * @param {String} variables OTher variables to be assigned to the event
 * @see adobeDPS-AnalyticsService#ALLOWED_VARIABLES
 * @see adobeDPS-AnalyticsService#PURCHASE_CATEGORIES
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
 * @param {String} variables Other variables to be assigned to the event
 * @see adobeDPS-AnalyticsService#ALLOWED_VARIABLES
 * @see adobeDPS-AnalyticsService#PURCHASE_CATEGORIES
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
 * @param {String} variables Other variables to be assigned to the event
 * @see adobeDPS-AnalyticsService#ALLOWED_VARIABLES
 * @see adobeDPS-AnalyticsService#PURCHASE_CATEGORIES
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
 */
AnalyticsService.instance = new AnalyticsService();
	/**
 * Create an instance of the AuthenticationService.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class Service for sending custom analytics events.
 * <br/><strong>Accessible from adobeDPS.authenticationService</strong>
 * @extends adobeDPS-Service
 */
function AuthenticationService() {

    /**
     * Signal to indicate updates to the AuthenticationService.
     * Updates about isUserAuthenticated,
     * userName, and token are signaled.
     * <br/><em>Callback Signature: updatedHandler([String, ...])</em>
     * @memberOf adobeDPS-AuthenticationService.prototype
     * @type adobeDPS-Signal
     */
    this.updatedSignal = new Signal();

	/**
	 * Signal to indicate that the user's authentication state has changed.
	 * <br/><em>Callback Signature: userAuthenticationChangedHandler(Boolean)</em>
	 * @memberOf adobeDPS-AuthenticationService.prototype
	 * @type adobeDPS-Signal
	 */
	this.userAuthenticationChangedSignal = new Signal();
	
	/**
	 * The current authentication transaction, if applicable.
	 * @memberOf adobeDPS-AuthenticationService.prototype
	 * @type adobeDPS-Transaction
	 * @see adobeDPS-UserSigninTransaction
	 * @see adobeDPS-UserSignoutTransaction
	 */
	this.currentTransaction = null;
	
	/**
	 * Whether a user is currently authenticated.
	 * @memberOf adobeDPS-AuthenticationService.prototype
	 * @type Boolean
	 */
	this.isUserAuthenticated = false;
	
	/**
	 * The username of that user. Will be `null` if `isUserAuthenticated` is false.
	 * @memberOf adobeDPS-AuthenticationService.prototype
	 * @type String
	 */
	this.userName = null;
	
	/**
	 * If a user is authenticated, the token for this session.
	 * @memberOf adobeDPS-AuthenticationService.prototype
	 * @type String
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
 */
AuthenticationService.instance = new AuthenticationService();
	/**
 * Create an instance of the ConfigurationService.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class Service for accessing information about the viewer configuration.
 * <br/><strong>Accessible from adobeDPS.configurationService</strong>
 * @extends adobeDPS-Service
 */
function ConfigurationService() {
	/**
	 * The list of states that this application supports.
	 * @type Array
	 * @see adobeDPS-ApplicationState
	 */
	this.applicationStates = {};
	
	/**
	 * This is the user-accessible location to access ApplicationStateType constants.
	 * @memberOf adobeDPS-ConfigurationService.prototype
	 * @type adobeDPS-ApplicationStateType
	 */
	this.applicationStateTypes = ApplicationStateType;
	
	/**
	 * The ID of this application as configured in Viewer Builder.
	 * @memberOf adobeDPS-ConfigurationService.prototype
	 * @type String
	 */
	this.applicationID = null;
	
	/**
	 * The version of this application as configured in Viewer Builder.
	 * @memberOf adobeDPS-ConfigurationService.prototype
	 * @type String
	 */
	this.applicationVersion = null;
	
	Service.call(this);
}

Service.extend(ConfigurationService);

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
	}
	else
	{
        Log.instance.warn("ConfigurationService._initialize called without update");
	}
};

/**
 * Function used to go to a new application state
 * @memberOf adobeDPS-ConfigurationService.prototype
 * @param {String} stateLabel The label of this state
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
 * The singleton of the ConfigurationService.
 * @static
 * @name instance
 * @memberOf adobeDPS-ConfigurationService
 */
ConfigurationService.instance = new ConfigurationService();
	
/**
 * Create an instance of the DialogService.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class Service for detecting if the API is hosted as a dialog and dismissing the current dialog.
 * <br/><strong>Accessible from adobeDPS.dialogService</strong>
 * @extends adobeDPS-Service
 */
function DialogService() {

    /**
     * Signal to indicate that this service has been updated. It will pass an array of Strings containing the names of
     * the properties that have been updated.
     * <br/><em>Callback Signature: updatedHandler([String, ...])</em>
     * @memberOf adobeDPS-DialogService.prototype
     * @type adobeDPS-Signal
     */
    this.updatedSignal = new Signal();

    /** 
     * Whether a custom dialog is currently displaying
     * @memberOf adobeDPS-DialogService.prototype
     * @type Boolean
     */
    this.isCustomDialogDisplaying = false;

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
 * Ask the dialog service to present the url with a slide up web view. 
 * NOTE: url only could be external URLs, like http://www.adobe.com, not support relative URLs.
 * @memberOf adobeDPS-DialogService.prototype
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
 * The singleton of the DialogService.
 * @static
 * @name instance
 * @memberOf adobeDPS-DialogService
 */
DialogService.instance = new DialogService();

	/**
 * Enum for the type of network.
 * <br/>This offers more granularity than HTML's window.navigator.onLine boolean property.
 * @see adobeDPS-DeviceService#networkType
 * @namespace
 * @enum {String}
 */
var NetworkType = {
    /**
     * Indicates an unknown network type.
     */
    UNKNOWN: "unknown",

    /**
     * Indicates there's a connection to a Wi-Fi network.
     */
    WIFI: "wifi",

    /**
     * Indicates there's a connection to a mobile network.
     */
    MOBILE: "mobile"
};

/**
 * Create an instance of the DeviceService.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class Service for accessing information about the device.
 * <br/><strong>Accessible from adobeDPS.deviceService</strong>
 * @extends adobeDPS-Service
 */
function DeviceService() {

    /**
     * Signal to indicate that this service has been updated. It will pass an array of Strings containing the names of
     * the properties that have been updated.
     * <br/><em>Callback Signature: updatedHandler([String, ...])</em>
     * @memberOf adobeDPS-DeviceService.prototype
     * @type adobeDPS-Signal
     */
    this.updatedSignal = new Signal();

	/**
	 * The unique id of this device.
	 * @memberOf adobeDPS-DeviceService.prototype
	 * @type String
	 */
	this.deviceId = null;
	
	/**
	 * The operating system running on this device.
	 * @memberOf adobeDPS-DeviceService.prototype
	 * @type String
	 */
	this.os = null;

	/**
	 * The name of this device according to /system/build.prop.
	 * This value will only be available on Android devices.
     * @memberOf adobeDPS-DeviceService.prototype
	 * @type String
	 */
	this.deviceName = null;

    /**
     * Whether in-app purchasing is currently enabled. If this is false, you will not be able to initiate purchases.
     * @memberOf adobeDPS-DeviceService.prototype
     * @type Boolean
     */
    this.isPurchasingEnabled = false;

    /**
     * Whether the device is connected to the internet or not.
     * Note: HTML5's navigator.onLine property and "offline" and "online" events should be used in most cases.
     * This property exists for certain platforms that don't have such functionality.
     * @memberOf adobeDPS-DeviceService.prototype
     * @type Boolean
     */
    this.isOnline = false;

    /**
     * The type of the network the device is connected to.
     * @memberOf adobeDPS-DeviceService.prototype
     * @type adobeDPS-NetworkType
     */
    this.networkType = null;

    /**
     * Network types enum accessor.
     * <br/>This is where you should access the {@link adobeDPS-NetworkType} enums from.
     * @memberOf adobeDPS-DeviceService.prototype
     * @type adobeDPS-NetworkType
     */
    this.networkTypes = NetworkType;

	/**
	 * The push notification token of this device.
	 * @memberOf adobeDPS-DeviceService.prototype
	 * @type String
	 */
	this.pushNotificationToken = null;

    /**
     * The Omniture visitor id of this device.
     * @memberOf adobeDPS-DeviceService.prototype
     * @type String
     */
    this.omnitureVisitorId = null;

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

        // Send the update signal to indicate what has changed
        this.updatedSignal.dispatch(updates);
    } else {
        Log.instance.warn("DeviceService._update called without update");
    }
};

/**
 * The singleton of the DeviceService.
 * @static
 * @name instance
 * @memberOf adobeDPS-DeviceService
 */
DeviceService.instance = new DeviceService();
	/**
 * Create an instance of the ReceiptService.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class Service for accessing receipt information.
 * <br/><strong>Accessible from adobeDPS.receiptService</strong>
 * @extends adobeDPS-Service
 */
function ReceiptService() {
	/**
	 * Signal to indicate that new receipt(s) are available.
	 * <br/><em>Callback Signature: newReceiptsAvailable([ {@link adobeDPS-Receipt}, ...])</em>
	 * @memberOf adobeDPS-ReceiptService.prototype
	 * @type adobeDPS-Signal
	 */
	this.newReceiptsAvailableSignal = new Signal();
	
	/**
	 * An associative array containing all the single folio receipts, indexed by {@link adobeDPS-Receipt#productId}.
	 * @memberOf adobeDPS-ReceiptService.prototype
	 * @type Object.<adobeDPS-Receipt>
	 */
	this.receipts = {};
	
	/**
	 * An associative array containing all the subscription receipts, indexed by {@link adobeDPS-SubscriptionReceipt#productId} + {@link adobeDPS-SubscriptionReceipt#startDate}.
	 * @memberOf adobeDPS-ReceiptService.prototype
	 * @type Object.<adobeDPS-SubscriptionReceipt>
	 */
	this.subscriptionReceipts = {};
	
	/**
	 * An associative array containing all the available subscriptions, indexed by {@link adobeDPS-Subscription#productId}.
	 * @memberOf adobeDPS-ReceiptService.prototype
	 * @type Object.<adobeDPS-Subscription>
	 */
	this.availableSubscriptions = {};

    /**
     * Signal to indicate that new subscription(s) have been added to availableSubscriptions.
     * <br/><em>Callback Signature: documentsAddedHandler([ {@link adobeDPS-Subscription}, ...])</em>
     * @memberOf adobeDPS-ReceiptService.prototype
     * @type adobeDPS-Signal
     */
    this.subscriptionsAddedSignal = new Signal();

    /**
     * Signal to indicate that subscription(s) have been removed from availableSubscriptions.
     * <br/><em>Callback Signature: documentsRemovedHandler([ {@link adobeDPS-Subscription}, ...])</em>
     * @memberOf adobeDPS-ReceiptService.prototype
     * @type adobeDPS-Signal
     */
    this.subscriptionsRemovedSignal = new Signal();

    /**
     * Entitlement Type enum accessor.
     * <br/>This is where you should access the {@link adobeDPS-EntitlementType} enums from.
     * @memberOf adobeDPS-ReceiptService.prototype
     * @type adobeDPS-EntitlementType
     */
    this.entitlementTypes = EntitlementType;
	
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
		
		id = receipt.productId + receipt.startDate.getTime().toString();
		
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
 * Initialize the Receipt Service with a JSON update from native.
 * @memberOf adobeDPS-ReceiptService.prototype
 */
ReceiptService.prototype._initialize = function (data) {
    var update, adds, productId, subscriptionReceiptId, splitId, vo, receipt, id, subscription;
	if (data.hasOwnProperty("update")) {
		update = data.update;
		adds = [];
		
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
				id = receipt.productId + receipt.startDate.getTime().toString();
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
				id = receipt.productId + receipt.startDate.getTime().toString();
                subscription = this.availableSubscriptions[receipt.productId];
				
				if (subscription && (subscription.receipt === null || subscription.receipt.endDate < receipt.endDate)) {
                    subscription.receipt = receipt;
                    subscription.isOwned = true;
				}
                Log.instance.debug("\nReceiptService updated with Subscription Receipt: " + JSON.stringify(receipt));
				this.registerNewReceipt(receipt, true);
				receiptAdds.push(receipt);
			}else if (vo.type == "Subscription") {
                subscription = new Subscription(vo.productId,vo.title,vo.duration,vo.price,false);
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
    } else if (data.hasOwnProperty("update") && data.path.indexOf("availableSubscriptions") > -1) {
		update = data.update;
		idEndIndex = data.path.indexOf("']");
		// 24 is the number of characters in availableSubscriptions plus the [' before the id
		id = data.path.substring(24,idEndIndex);
        subscription = this.availableSubscriptions[id];
		
		if (subscription) {
            subscription._updateFromJSON(update);
		} else {
            Log.instance.warn("ReceiptService._update called with unknown Sub: " + id);
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
 */
ReceiptService.instance = new ReceiptService();

	/**
 * Create a new SettingsService.
 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
 * @class Service to manage the state and updating of application settings.
 * <br/><strong>Accessible from adobeDPS.settingsService</strong>
 * @extends adobeDPS-Service
 */
function SettingsService() {
	/**
	 * Auto-archive settings manager.
	 * @memberOf adobeDPS-SettingsService.prototype
	 * @type adobeDPS-AutoArchive
	 */
	this.autoArchive = AutoArchive.instance;
	
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
		default:
            Log.instance.warn("SettingsService._update called with an unknown destination: " + path);
			break;
	}
};

/**
 * The singleton of the SettingsService.
 * @static
 * @name instance
 * @memberOf adobeDPS-SettingsService
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
 */
 function Coordinates(lat, lng, alt, acc, head, vel, altacc) {
	/**
	 * The latitude in decimal degrees. 
	 * Positive values indicate latitudes north of the equator. Negative values indicate latitudes south of the equator.
	 * @memberOf adobeDPS-Coordinates.prototype
	 * @type double
	 */
    this.latitude = lat;

	/**
	 * The longitude in decimal degrees. 
	 * Measurements are relative to the zero meridian, with positive values extending east of the meridian and negative values extending west of the meridian. 
	 * @memberOf adobeDPS-Coordinates.prototype
	 * @type double
	 */
    this.longitude = lng;

	/**
	 * The accuracy level of the latitude and longitude coordinates, specified in meters. The value is a non-negative real number.  
	 * @memberOf adobeDPS-Coordinates.prototype
	 * @type double
	 */
    this.accuracy = acc;

	/**
	 * The altitude specified in meters. 
	 * If the implementation cannot provide altitude information, the value of this attribute is null. 
	 * @memberOf adobeDPS-Coordinates.prototype
	 * @type double
	 */
    this.altitude = (alt !== undefined ? alt : null);

	/**
	 * The direction of travel of the device specified in degrees, where 0° ≤ heading < 360°, counting clockwise relative to the true north. 
	 * If the implementation cannot provide heading information, the value of this attribute can be null or negative number (-1). 
	 * If the hosting device is stationary (i.e. the value of the speed attribute is 0), then the value of the heading attribute is NaN.  
	 * @memberOf adobeDPS-Coordinates.prototype
	 * @type double
	 */
    this.heading = (head !== undefined ? head : null);

	/**
	 * The magnitude of the horizontal component of the hosting device's current velocity, specified in meters per second. 
	 * A valid speed value is a non-negative real number.
	 * If the implementation cannot provide speed information, the value of this attribute can be null or negative number (-1).  
	 * @memberOf adobeDPS-Coordinates.prototype
	 * @type double
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
	 */
    this.altitudeAccuracy = (altacc !== undefined) ? altacc : null;
};

/**
 * Create a geolocation Position object.
 * @class This class represents the geolocation position information
 * <br/>This is compatible with the <a href="http://www.w3.org/TR/geolocation-API/#position_interface">WebKit Position interface</a>
 * @param {adobeDPS-Coordinates} coords The location coordinates. 
 * @param {Date} timestamp The timestamp
 */
 var Position = function(coords, timestamp) {
	/**
	 * The location coordinates
	 * @memberOf adobeDPS-Position.prototype
	 * @type adobeDPS-Coordinates
	 */
    this.coords = coords;

	/**
	 * The time when the location was retrieved
	 * @memberOf adobeDPS-Position.prototype
	 * @type Date
	 */
    this.timestamp = (timestamp === undefined ? new Date() : ((timestamp instanceof Date) ? timestamp : new Date(timestamp)))
};


/**
 * Create a geolocation PositionError object.
 * @class This class represents the geolocation position error
 * <br/>This is compatible with the <a href="http://www.w3.org/TR/geolocation-API/#position_error_interface">WebKit PositionError interface</a>
 * @param {Number} code The error code 
 * @param {String} message The error message corresponding to the error code
 */
 function PositionError(code, message) {
	/**
	 * The error code 
	 * @memberOf adobeDPS-PositionError.prototype
	 * @type Number
	 */
    this.code = code || null;

	/**
	 * The error message corresponding to the error code 
	 * @memberOf adobeDPS-PositionError.prototype
	 * @type String
	 */
    this.message = message || '';
};

/**
 * Permission denied error code
 * @static
 * @name PERMISSION_DENIED
 * @memberOf adobeDPS-PositionError
 */
PositionError.PERMISSION_DENIED = 1;

/**
 * Position unavailable error code
 * @static
 * @name POSITION_UNAVAILABLE
 * @memberOf adobeDPS-PositionError
 */
PositionError.POSITION_UNAVAILABLE = 2;

/**
 * Location request timeout error code
 * @static
 * @name TIMEOUT
 * @memberOf adobeDPS-PositionError
 */
PositionError.TIMEOUT = 3;

/**
 * Create a geolocation PositionOptions object.
 * @class This class represents the options passed to the geolocation API
 * <br/>This is compatible with the <a href="http://www.w3.org/TR/geolocation-API/#position_options_interface">WebKit PositionOptions interface</a>
 */
 function PositionOptions() {
	/**
	 * A boolean indicating that best possible results are required.
	 * A value of true may result in slower response times or increased power consumption. 
	 * @memberOf adobeDPS-PositionOptions.prototype
	 * @type boolean
	 */
    this.enableHighAccuracy = false;

	/**
	 * The maximum time (milliseconds) allowed to retrieve a cached position whose age is not greater than the time specified
	 * @memberOf adobeDPS-PositionOptions.prototype
	 * @type Number
	 */
    this.maximumAge = 0;
    
	/**
	 * The time (milliseconds) allowed to pass from the call to getCurrentPosition() or watchPosition() until the corresponding successCallback is invoked.
	 * If the implementation is unable to successfully acquire a new Position before the given timeout elapses, and no other errors have occurred in this interval, then the corresponding errorCallback must be invoked with a adobeDPS-PositionError object whose code attribute is set to TIMEOUT
	 * @memberOf adobeDPS-PositionOptions.prototype
	 * @type Number
	 */
    this.timeout = Infinity;    
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
        if (options.maximumAge !== undefined && !isNaN(options.maximumAge) && options.maximumAge > 0) {
            opt.maximumAge = options.maximumAge;
        }
        if (options.enableHighAccuracy !== undefined) {
            opt.enableHighAccuracy = options.enableHighAccuracy;
        }
        if (options.timeout !== undefined && !isNaN(options.timeout)) {
            if (options.timeout < 0) {
                opt.timeout = 0;
            } else {
                opt.timeout = options.timeout;
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
            if (options.timeout !== Infinity) {
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
					maximumAge: options.maximumAge
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
 */ 
 GeolocationService.prototype.watchPosition = function (successCallback, errorCallback, options) {
	throw new Error('geolocation.watchPosition API is currently not supported!');
 }
 
/**
 * Function used to stop monitoring the location changes initiated through watchPosition(). This is compatible with the WebKit geolocation API.
 * <br/><strong> Currently this API is not supported. Any attempt to call it will throw an exception.</strong>
 * @memberOf adobeDPS-GeolocationService.prototype
 * @param {Number} watchId The Id of a watchPosition operation to be cancelled. 
 */ 
 GeolocationService.prototype.clearWatch = function (watchId) {
	throw new Error('geolocation.clearWatch API is currently not supported!');
}

/**
 * The singleton of the GeolocationService.
 * @static
 * @name instance
 * @memberOf adobeDPS-GeolocationService
 */
GeolocationService.instance = new GeolocationService();

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
		this.version = 1.2;

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
