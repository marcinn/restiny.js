# restiny.js


This is a damn simple / tiny / clever REST client for Javascript.

Please note: this is an early alpha version, developed in quarter of
hour, not tested, and not reliable. But extremely simple to use :)


## Usage


An example of hitting GitHub API and fetching my followers (using jQuery).

```javascript

var github = new Restiny('https://api.github.com');

github.get('users/marcinn').then(function(user) {
    github.get(user.followers_url).then(function(followers) {
        console.log(followers);
    });
});

```

An example of hitting GitHub API and fetching my followers (using
Angular).

```javascript

angular.module('restinyDemo', [
    'restiny'
])
.run(function(restiny) {
    var github = restiny.api('https://api.github.com');

    github.get('users/marcinn').then(function(resp) {
        github.get(resp.data.followers_url).then(function(resp) {
            console.log(resp.data);
        });
    });
});
```


## Author and license

Author:
    Marcin Nowak <marcin (dot) j (dot) nowak (at) gmail (dot) com>

License:
    BSD (see LICENSE file)


