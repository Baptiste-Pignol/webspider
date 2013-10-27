// Part 1 -Implement Event Emitter (Observer design pattern)

// function constructor
module.exports.EventEmitter = function EventEmitter(){
 // HashMap [ event -> [fn1, fn2, ...] ]
 this.callbacks = {};
 if (!this instanceof EventEmitter) {
	return new EventEmitter();
 }
}

module.exports.EventEmitter.prototype = {
	// add an event
  on: function(event, fn){
    this.callbacks[event] == undefined ? this.callbacks[event] = new Array() : null;
    this.callbacks[event].push(fn);
    return this;
  },

  once:function(event, fn){
	this.on(event, fn);
   	this.callbacks[event][this.callbacks[event].indexOf(fn)].once = true;
	return this;
  },

 times:function(event, t, fn){
	this.on(event, fn);
   	this.callbacks[event].time = t;
	return this;
  },

  // remove an event
  off: function(event, fn){
    if (!fn) {
    	event == undefined ? this.callbacks = {} : delete this.callbacks[event];
    }
    else {
	if(this.callbacks[event]){
		this.callbacks[event].splice(this.callbacks[event].indexOf(fn),1);
	}
    }
    return this;
  },

  // emit an event
  emit: function(event){
    var me = this;
    if(this.callbacks[event]){
      var args = Array.prototype.slice.call(arguments);
      args.shift();
      this.callbacks[event].forEach(function(fn){
      	fn.apply(this, args);
	fn.once ? me.off(event, fn) : null;
      });
      (this.callbacks[event].time && --(this.callbacks[event].time) <= 0) ? me.off(event) : null;
    }
     return this;
  }
};





