# Thematic Analysis of the Web Index

## Organization

- A static data API is located in the `data` branch and synced with heroku
- Exploratory data analysis is located on the `eda` branch
- Development happens on named feature/bug branches, which sync back up with `master` when ready.

## Using site assets

Grunt compiles build js and css files into `dist`. You should load them in the following order:

- `lib.css`
- `styles.css`
- `dependencies.js`
- `viz.js`

Once the assets are loaded, on page load the script will look for containers with the appropriate IDs to inject the interactives into.

For example, the gender graphic will look for `#gender`. The censorship map will look for `#censorship-and-surveillance`.

## Developing

If you need to develop on the site, you'll need node.js, npm, and grunt. You'll also need a way to open a webserver. For example,

    npm install
    grunt watch
    python -m SimpleHTTPServer
