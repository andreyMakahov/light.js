window.$ = {};
window.$.gId = function(id, parent){
    parent = parent || document;
    return parent.getElementById(id);
};
window.$.gClass = function(className, parent){
    parent = parent || document;
    return document.getElementsByClassName(className);
};
window.$.gTag = function(tag, parent){
    parent = parent || document;
    return parent.getElementsByTagName(tag);
};
window.$.gQ = function(selector, parent){
    parent = parent || document;
    return document.querySelector(selector);
};
window.$.gQA = function(selector, parent){
    parent = parent || document;
    return document.querySelectorAll(selector);
};
window.$.ajax = function(){
    var xmlhttp;
    try {
        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
        try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (E) {
            xmlhttp = false;
        }
    }
    if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
        xmlhttp = new XMLHttpRequest();
    }
    return xmlhttp;
};
window.$.publisher = function(object){

    var Publisher = {
        subscribers: {
            any: []
        },
        subscribe: function(fn, type){
            type = type || 'any';
            if(typeof this.subscribers === 'undefined')
                this.subscribers = {};
            if(typeof this.subscribers[type] === 'undefined')
                this.subscribers[type] = [];
            this.subscribers[type].push(fn);
        },
        unsubscribe: function(fn, type){
            type = type || 'any';

            if(!this.subscribers || !this.subscribers[type]) return false;

            var subscribers = this.subscribers[type];
            for(var i=0; i<subscriberslength; i++){
                if(subscribers[i].toString() !== fn.toString()) continue;
                return subscribers.splice(i, 1);
            }
        },
        publish: function(event){
            var eventType, eventArguments, subscribers;

            var fireEvent = function(eventType, eventArguments, subscribers){
                for(var i=0; i<subscribers.length; i++){
                    subscribers[i](eventArguments);
                }
            };
            if(typeof event[0] === 'string'){
                eventType       = event[0];
                eventArguments  = event[1];
                subscribers     = this.subscribers[eventType];
                fireEvent(eventType, eventArguments, subscribers);
            } else {
                for(var i=0; i<event.length; i++){
                    eventType       = event[i][0];
                    eventArguments  = event[i][1];
                    subscribers     = this.subscribers[eventType];
                    fireEvent(eventType, eventArguments, subscribers);
                }
            }
        }
    };

    var F = function(){};
    F.prototype = Publisher;
    o = new F();

    for(var i in object){ 
        o[i] = object[i]; 
    }

    return o;
};


window.$.router = (function(){
    var isCurrentUrl = function(url){
        return url === location.hash;
    };
    var router = {
        map: {},
        default: null,
        when: function(url, params){
            var getArguments = function(url){
                var urlArray = [], argumentsObject = {};
                urlArray = url.split('/');
                urlArray.forEach(function(i, index){
                    if(i[0] === ':'){
                        argumentsObject[i.substr(1)] = {};
                        argumentsObject[i.substr(1)].index = index;
                    }
                });
                return argumentsObject;
            };

            // сохраняем в map для использования при изменении ссылки
            this.map[url] = {};
            this.map[url].controller = params.controller;
            this.map[url].action     = params.action || '$index';

            params.arguments = getArguments(url);

            this.map[url].arguments  = params.arguments;

            return this;
        },
        otherwise: function(params){
            this.default = params.redirectTo;
            return this;
        },
        change: function(url){

            var currentPath = this.getRoutePath(url),
                controller, action,
                self = this;

            if( ! currentPath){
                if(this.default){
                    this.change(this.default);   
                } else{
                    throw new Error('No default route');
                }    
            }

            window.history.pushState(null, null, url);
            controller = this.map[currentPath].controller;
            action     = this.map[currentPath].action || '$index';
            arguments  = (function(){
                var argv = {},
                    hash = location.hash.split('/'),
                    arguments = self.map[currentPath].arguments;
                for(var i in arguments){
                    argv[i] = hash[arguments[i].index];
                }
                return argv;
            })();

            // специальная функции в контроллере, которая отрисовывает вид
            window[controller][action](arguments);
            return this;
        },
        getRoutePath: function(url){
            var urlArray = [], mapItemArray = [];
            var isParam = function(param){
                return param[0] === ':';
            };
            urlArray = url.split('/');
            for(var i in this.map){
                mapItemArray = i.split('/');
                if(urlArray.length !== mapItemArray.length) continue;
                for(var j=0; j<mapItemArray.length; j++){
                    if(isParam(mapItemArray[j])){
                        if((j+1) === mapItemArray.length) return i;
                    } else {
                        if(mapItemArray[j] === urlArray[j]){
                            if((j+1) === mapItemArray.length) return i;
                        } else break;
                    }
                }
            }
            return false;
        },
        run: function(){
            this.change(location.hash);
            return this;
        }
    };

    // вешаем обработчик на изменение хеша
    window.onhashchange = function(){
        router.change(location.hash);
    };
    return router;
})();


window.$.http = (function(){
    var parseHeaders = function(xhr, headers){
        if(typeof headers === 'object'){
            for(var i in headers){
                xhr.setRequestHeader(i, headers[i]);
            }
        } else {
            throw new Error('param headers must be a object');
        }
    }
    var http = {
        get: function(url, onsuccess, onerror){
            var xhr = $.ajax();
            xhr.open('GET', url, true);
            xhr.onload = function (e) {
                if (this.status === 200) {
                    results = JSON.parse(this.responseText);
                    onsuccess(results);
                }
            };
            xhr.onerror = function (e) {
                onerror(e);
            };
            xhr.send(null);
        },
        post:function(url, data, headers, onsuccess, onerror){
            var xhr = $.ajax();
            xhr.open('POST', url, true);
            parseHeaders(xhr, headers);
            xhr.onload = function (e) {
                if (this.status === 200) {
                    results = JSON.parse(this.responseText);
                    onsuccess(results);
                }
            };
            xhr.onerror = function (e) {
                onerror(e);
            };
            xhr.send(data);
        },
        delete: function(url, data, headers, onsuccess, onerror){
            var xhr = $.ajax();
            xhr.open('DELETE', url, true);
            parseHeaders(xhr, headers);
            xhr.onload = function (e) {
                if (this.status === 200) {
                    results = JSON.parse(this.responseText);
                    onsuccess(results);
                }
            };
            xhr.onerror = function (e) {
                onerror(e);
            };
            xhr.send(null);
        }
    };
    return http;
})();

window.$.promise = function(callback){
    var queue = [];
    var _next = function(){
        var cb = queue.shift();
        if(cb) cb(_next);
    }
    setTimeout(_next, 0);
    var then = function(cb){
        queue.push(cb);
        return { then: then };
    }
    return then(callback);
};
