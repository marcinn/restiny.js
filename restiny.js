/* 
 * restiny.js - Damn simple / tiny / clever REST client
 *
 * Author: marcin.j.nowak@gmail.com
 * License: BSD (see LICENSE file)
 *
 */

var Restiny = function(url, config) {
    var absoluteUrlPattern = /^https?:\/\//i,
        self=this;

    this._config = config || {};
    this._defaultHeaders = this._config.headers || {};
    this._url = url;

    function isAbsoluteUrl(url) {
        return absoluteUrlPattern.test(url);
    }

    function resourceToUrl(resource) {
        resource = resource || '';
        if(isAbsoluteUrl(resource)) {
            return resource;
        } else {
            return self._url+'/'+resource;
        }
    }

    function makeResponseObject(jqXhr, data) {
        var headers = {},
            headersList = jqXhr.getAllResponseHeaders().split('\r\n');
        $.each(headersList, function(i, headerStr) {
            var headerTuple = headerStr.split(': ');
            if(headerTuple[0]) {
                headers[headerTuple[0].toLowerCase()] = headerTuple[1];
            }
        });
        return {
            status: jqXhr.status,
            statusText: jqXhr.statusText,
            headers: headers,
            data: data 
        };
    }

    function doMethod(type, resource, data, headers) {
        var dfr = $.Deferred(),
            completeHeaders = $.extend({}, self._defaultHeaders, headers);

        $.ajax({
            url: resourceToUrl(resource),
            type: type,
            dataType: type=='GET' ? null : 'json',
            contentType: type=='GET' ? null : 'application/json',
            headers: completeHeaders,
            data: typeof(data)!=='undefined' && data!==null ? (type=='GET' ? data : JSON.stringify(data)) : null
        }).then(function(respData,respStatus,jqXhr) {
            dfr.resolve(respData, makeResponseObject(jqXhr, respData));
        }, function(jqXhr) {
            dfr.reject(makeResponseObject(jqXhr));
        });
        return dfr.promise();
    };

    
    this.get = function(resource, params, headers) {
        return doMethod('GET', resource, params, headers);
    }

    this.post = function(resource, payload, headers) {
        return doMethod('POST', resource, payload, headers);
    }

    this.put = function(resource, payload, headers) {
        return doMethod('PUT', resource, payload, headers);
    }

    this.patch = function(resource, payload, headers) {
        return doMethod('PATCH', resource, payload, headers);
    }

    this['delete'] = function(resource, headers) {
        return doMethod('DELETE', resource, null, headers);
    }
}

