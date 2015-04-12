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
    var router = {
        map: {},
        current: null,
        isCurrentUrl: function(url){
            return url === location.hash;
        },
        when: function(url, params){
            
            // сохраняем в map для использования при изменении ссылки
            this.map[url] = {};
            this.map[url].controller = params.controller;

            if(this.isCurrentUrl(url)){
                this.current = url;   
            }
            return this;
        },
        otherwise: function(params){
            if( ! this.current){
                this.current = params.redirectTo;
                window.history.pushState(null, null, params.redirectTo);    
            }

            return this;
        },
        change: function(url){
            
            // нет контроллера в параметрах
            if( ! this.map[url] || ! this.map[url].controller){
                throw new Error('Unknown controller');
            }

            // не соответствует текущему хешу - ничего не делаем
            if( ! this.isCurrentUrl(url)) return this;
            window.history.pushState(null, null, url);

            // специальная функции в контроллере, которая отрисовывает вид
            window[this.map[url].controller]['$index']();

            return this;
        },
        run: function(){
            if(this.current){
                this.change(this.current);   
            }
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
        get: function(url, onsucess, onerror){
            var xhr = $.ajax();
            xhr.open('GET', url, true);
            xhr.onload = function (e) {
                if (this.status === 200) {
                    results = JSON.parse(this.responseText);
                    onsucess(results);
                }
            };
            xhr.onerror = function (e) {
                onerror(e);
            };
            xhr.send(null);
        },
        post:function(url, data, headers, onsucess, onerror){
            var xhr = $.ajax();
            xhr.open('POST', url, true);
            parseHeaders(xhr, headers);
            xhr.onload = function (e) {
                if (this.status === 200) {
                    results = JSON.parse(this.responseText);
                    onsucess(results);
                }
            };
            xhr.onerror = function (e) {
                onerror(e);
            };
            xhr.send(data);
        },
        delete: function(url, data, headers, onsucess, onerror){
            var xhr = $.ajax();
            xhr.open('DELETE', url, true);
            parseHeaders(xhr, headers);
            xhr.onload = function (e) {
                if (this.status === 200) {
                    results = JSON.parse(this.responseText);
                    onsucess(results);
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