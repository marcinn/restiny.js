/* 
 * restiny.js - Damn simple / tiny / clever REST client
 *
 * Author: marcin.j.nowak@gmail.com
 * License: BSD (see LICENSE file)
 *
 */

(function(window) {

    function restinyExtendObject(dest, source) {
        for (var attr in source) {
            if (source.hasOwnProperty(attr)) {
                dest[attr] = source[attr];
            }
        }
        return dest;
    }

    var jqueryAdapter = function(restiny) {
        var makeResponseObject = function(jqXhr, data) {
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
        };

        this.doMethod = function(type, url, data, headers) {
            var dfr = $.Deferred(),
            completeHeaders = $.extend({}, restiny._defaultHeaders, headers);

            $.ajax({
                url: url,
                type: type,
                dataType: type=='GET' ? null : 'json',
                contentType: type=='GET' ? null : 'application/json',
                headers: completeHeaders,
                data: typeof(data)!=='undefined' && data!==null ? (type=='GET' ? data : JSON.stringify(data)) : null
            }).done(function(respData,respStatus,jqXhr) {
                if(jqXhr.status >= 200 && jqXhr.status<300) {
                    dfr.resolve(respData, makeResponseObject(jqXhr, respData));
                } else {
                    dfr.reject(makeResponseObject(jqXhr));
                }
            });
            return dfr.promise();
        }
    };


    var Restiny = function(url, config, adapter) {
        var absoluteUrlPattern = /^https?:\/\//i,
        self=this,
        adapter = adapter || jqueryAdapter;

        this._config = config || {};
        this._adapter = new adapter(this);
        this._adapterCls = adapter;
        this._defaultHeaders = this._config.headers || {};
        this._url = url;

        function isAbsoluteUrl(url) {
            return absoluteUrlPattern.test(url);
        }

        function isObject(value) {
            return value != null && typeof value === 'object';
        }

        function render_url(tpl, params) {
            var args = tpl.match(/\/:[a-zA-Z]+/g),
            url = tpl;

            args.map(function(x) {
                var key = x.substr(2),
                val = params[key];

                if(typeof val !== 'undefined') {
                    url = url.replace(x, '/'+val);
                }
            });
            return url;
        }


        function resourceToUrl(resource) {
            resource = resource || '';
            if(isObject(resource)) {
                return render_url(self._url, resource);
            } else {
                if(isAbsoluteUrl(resource)) {
                    return resource;
                } else {
                    return self._url+'/'+resource;
                }
            }
        }

        function doMethod(type, resource, data, headers) {
            return self._adapter.doMethod(type, resourceToUrl(resource), data, headers);
        };

        this.resource = function(path) {
            var newConfig = restinyExtendObject({}, this._config);
            return new Restiny(this._url+path, newConfig, this._adapterCls);
        }

        this.headers = function(headers) {
            var newHeaders = restinyExtendObject({}, this._defaultHeaders),
            newConfig = restinyExtendObject({}, this._config);

            restinyExtendObject(newHeaders, headers);
            restinyExtendObject(newConfig, {
                headers: newHeaders
            });

            return new Restiny(this._url, newConfig, this._adapterCls);
        }

        this.accept = function(contentType) {
            return this.headers({accept: contentType});
        }

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
    };

    window.angular ? angular.module('restiny', [])
        .factory('restiny', ['$http', '$q', function($http, $q) {
            var angularRestinyAdapter = function(restiny) {
                this.doMethod = function(type, url, data, headers) {
                    var dfr = $q.defer(),
                    completeHeaders = angular.extend({}, restiny._defaultHeaders, headers),
                    params = type.toLowerCase()=='get';

                    $http({
                        method: type,
                        url: url,
                        headers: completeHeaders,
                        data: params ? null : data,
                        params: params ? data : null
                    }).then(function(resp) {
                        dfr.resolve(resp);
                    }, function(resp) {
                        dfr.reject(resp);
                    });
                    return dfr.promise;
                }
            };
            return {
                api: function(path, config) {
                    return new Restiny(path, config, angularRestinyAdapter);
                }
            };
        }]) : window.Restiny=Restiny;

})(this);
