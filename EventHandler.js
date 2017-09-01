'use strict';

/**
*		@namespace EventHandler
*/

/**
 *    @copyright 2017
 *    @author Sebastian Conrad <http://www.sebcon.de/>
 *    @version 1.0 - 31. August 2017
 *    @see http://www.github.com/sebcon
 *    @license Available under MIT license <https://mths.be/mit>
 *    @fileoverview EventHandler - register callbacks for browser/self-created events, handling and executing callbacks
 */


/**
*		@class EventHandler
*
*		@constructor
*		@param {document}	document document object
*		@param {window} window window object
*		@param {console} console console object
**/

var EventHandler = (function(window, document, console) {
  var regElement = {};
  var broadcastElement = {};
  var logging = {};
  var minPrio = 0;
  var maxPrio = 3;
  var isBlock = false;
  var eventList = ["CLICK","DBLCLICK", "KEYDOWN", "KEYUP", "KEYPRESS", "DRAGDROP", "FOCUS", "BLUR", "CHANGE", "SCROLL",
    "DISABLED", "ENABLED", "SHOW", "HIDDEN", "SETERROR", "UNSETERROR", "SELECTTEXT", "DESELECTTEXT"];


  // register for all events in eventList the EventHandler check routine, call checkListener
  eventList.forEach(function(ev) {
    document.body.addEventListener(ev.toLowerCase(), function(e) {
      var src = e.srcElement || e.target;
      if (e.type.toLowerCase() === 'click') {
        //console.warn(src.id);
      }
      if (!src.id) {
        var temp = HTMLHelper.getParentId(src);
        if (temp) {
          src.id = HTMLHelper.getParentId(temp);
        }
      }

      checkListener(e, false);
      checkListener(e, true);
    }, true);
  });


  /** register new event if is not existing
  *		@function registerNewEvent
  *		@param {string} event event name
  *
  **/
  var registerNewEvent = function(event) {
    if (event && !existsEvent(event)) {
      eventList.push(event);
    } else {
      console.warn('cannot add new event: '+event);
    }
  };


  var existsEvent = function(event) {
    var found = false;
    if (event) {
      var k = 0;
      while (!found && k < eventList.length) {
        found = (eventList[k].toLowerCase() === event.toLowerCase());
        k++;
      }
    }

    return found;
  };


  /** cancel event propagation
  *		@function stopEvent
  *		@param {string} event event name
  *
  **/
  var stopEvent = function(event) {
    event = event || window.event; // cross-browser event
    if (event.stopPropagation) {
      // W3C standard variant
      event.stopPropagation();
    } else {
      // IE variant
      event.cancelBubble = true;
    }

    if (event.preventDefault) {
      event.preventDefault();
    }
  };


  var checkEvent = function(event) {
    var result =  (event && ((event.target && (event.target.id || event.target.tagName)) || event.tagName) && event.type);
    return result;
  };


  var existsHideClass = function(elem) {
    var isHidden = false;
    if (elem) {
      var cl = elem.classList;
      if (cl) {
        isHidden = (cl.contains('ng-hide'));
      }
      elem = elem.parentNode;

      if (isHidden) {
        console.warn('found hidden class!');
      }
    }

  };


  var executeCallback = function(nArr, e) {
    if (nArr.EventCallback) {
      if (Array.isArray(nArr.EventCallback)) {
        for (var prio=minPrio; prio <= maxPrio; prio++) {
          for (var j=0; j < nArr.EventCallback.length; j++) {
            //console.log('execute '+nArr.EventCallback[j]);
            //console.warn('execute '+nArr.id+' prio: '+nArr.prio);
            //console.log('execute '+elemId+tevent);
            if (nArr.prio === prio && typeof nArr.EventCallback[j] === 'function') {
              nArr.EventCallback[j](e);
            }
          }
        }
      } else {
        if (typeof nArr.EventCallback === 'function') {
          nArr.EventCallback(e);
        }
      }

    } else {
      console.warn('found no entry for event: '+nArr.id);
    }
  };


  // {boolean} byId - checking for id or for element tag
  var checkListener = function(e, byId) {
    var found = false;

    if (checkEvent(e)) {
      var elem = e.target || e.srcElement;
      var elemId = '';
      if (!byId) {
        elemId = (elem.tagName.toLowerCase() || e.tagName.toLowerCase());
      } else {
        elemId = elem.id;
      }

      if (elemId && !existsHideClass(elem)) {
        var tevent = e.type.toLowerCase();
        var tid = regElement[elemId + tevent];
        if (logging[elemId]) {
          console.log('call callback id: '+elemId);
        }

        if (tid && tid.length > 0) {
          for (var i=0; i < tid.length; i++) {
            var nArr = tid[i];
            if (nArr.id === elemId && nArr.type && nArr.type.toLowerCase() === tevent) {
              found = true;
              executeCallback(nArr, e);
            }
          }
        }
      }
    }

    return found;
  };


  /** register callback for element id and event type
  *		@function registerElementById
  *		@param {string} id element id
  *   @param {string} type event name
  *   @param {function} EventCallback callback function
  *   @param {number} prio priority
  *   @param {string} section section name
  *   @param {boolean} only executing only this callback
  *
  **/
  var registerElementById = function(id, type, EventCallback, prio, section, only) {
    if (id && type) {
      type = type.toLowerCase();
      if (existsEvent(type)) {
        var nId = '' + id + '' + type;

        if (!prio || Number.isInteger(prio)) {
          prio = minPrio;
        }
        if (regElement[nId] !== null && regElement[nId] !== undefined && regElement[nId].length > 0) {
        } else {
          regElement[nId] = [];
        }

        if (!section) {
          section = '';
        }

        if (only !== undefined && only !== null && only) {
          regElement[nId][0] = {id: id, EventCallback : EventCallback, type : type, prio : prio, section : section};
        } else {
          regElement[nId].push({id: id, EventCallback : EventCallback, type : type, prio : prio, section : section});
        }
      }
    } else {
    }

  };


  /** delete all callbacks for element id
  *		@function deleteAllElementsByID
  *		@param {string} id element id
  *
  **/
  var deleteAllElementsByID = function(id) {
    if (id) {
      for (var key in regElement) {
        var found = false;
        var k = 0;
        while (!found && k < regElement[key].length) {
          found = (regElement[key][k].id && regElement[key][k].id.toLowerCase() === id.toLowerCase());
          k++;
        }
        if (found) {
          regElement[key] = [];
        }
      }
    }
  };


  /** delete all callbacks for section
  *		@function deleteAllElementsBySection
  *		@param {string} section section name
  *
  **/
  var deleteAllElementsBySection = function(section) {
    // hier werden alle sections gelöscht
    if (section) {
      var deleteID = [];
      for (var key in regElement) {
        var found = false;
        var k = 0;
        while (!found && k < regElement[key].length) {
          found = (regElement[key][k].section && regElement[key][k].section.toLowerCase() === section.toLowerCase());
          k++;
        }
        if (found) {
          if (regElement[key][0] && regElement[key][0].id) {
            var id = regElement[key][0].id;
            if (deleteID.indexOf(id) < 0) {
              this.deleteAllElementsByID(id);
              this.deleteAllElementsByID(id + 'Arrow');
              deleteID.push(id);
            }
          }
          regElement[key] = [];
        }
      }
    }
  };


  /** register callback for element and event type
  *		@function registerElement
  *		@param {string} element element, tag name
  *   @param {string} type event name
  *   @param {function} EventCallback callback function
  *   @param {number} prio priority
  *
  **/
  var registerElement = function(element, type, EventCallback, prio) {
    if (element && type) {
      type = type.toLowerCase();
      if (existsEvent(type)) {
        var nId = '' + element.toLowerCase() + '' + type;

        if (!prio) {
          prio = minPrio;
        }
        if (!regElement[nId]) {
          regElement[nId] = [];
          regElement[nId][0] = {id: element, EventCallback : EventCallback, type : type, prio : prio};
        }

      }
    } else {
      console.warn('cannot add event: '+type+' to id: '+element);
    }
  };


  /** trigger event for element id and event type
  *		@function triggerEvent
  *		@param {string} ids elements id
  *   @param {string} type event name
  *
  **/
  var triggerEvent = function(ids, type) {
    if (type) {
      type = type.toLowerCase();
      if (existsEvent(type) && ids && Array.isArray(ids)) {
        for (var i=0; i < ids.length; i++) {
          var id = ids[i];
          var e = {
            target : {id: id, tagName : ''},
            type: type,
          };
          checkListener(e, true);
        }
      }
    }
  };


  /** trigger broadcast
  *		@function triggerBroadcast
  *   @param {string} type event name
  *
  **/
  var triggerBroadcast = function(type) {
    if (type && existsEvent(type)) {
      var tid = broadcastElement[type];
      if (tid) {
        for (var i = 0; i < tid.length; i++) {
          executeCallback(tid[i], null);
        }
      }
    }
  };


  /** register callback for broadcast
  *		@function registerBroadcast
  *		@param {string} id element id
  *   @param {string} type event name
  *   @param {function} EventCallback callback function
  *
  **/
  var registerBroadcast = function(id, type, EventCallback) {
    if (type && existsEvent(type)) {
      if (!broadcastElement[type]) {
        broadcastElement[type] = [];
      }
      broadcastElement[type].push({id : id, type : type, EventCallback : EventCallback});
    }
  };




  return {
    registerElementById : registerElementById,
    registerElement : registerElement,
    triggerEvent : triggerEvent,
    triggerBroadcast : triggerBroadcast,
    registerBroadcast : registerBroadcast,
    registerNewEvent : registerNewEvent,
    stopEvent : stopEvent,
    deleteAllElementsByID : deleteAllElementsByID,
    deleteAllElementsBySection : deleteAllElementsBySection
  };

}(window, document, console));
