# restiny.js


This is a damn simple / tiny / clever REST client for Javascript.

Please note: this is an early alpha version, developed in quarter of
hour, not tested, and not reliable. But extremely simple to use :)


## Usage


An example of hitting GitHub API and fetching my followers.

```javascript

var github = new Restiny('https://api.github.com');

github.get('users/marcinn').then(function(user) {
    github.get(user.followers_url).then(function(followers) {
        console.log(followers);
    });
});

```

## Author and license

Author:
    Marcin Nowak <marcin (dot) j (dot) nowak (at) gmail (dot) com>

License:
    BSD (see LICENSE file)


