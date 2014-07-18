var views = require('co-views');
var koa = require('koa');
var static = require('koa-static');
var route = require('koa-route');
var fs = require('fs');
var interpolate = require('interpolate');


// Creating app & Setup

var isDebug = false;
var app = koa();
var render = views(__dirname + '/views', { ext: 'ejs' });


// Routing

app.use(route.get('/', list));
app.use(route.get('/show/:id', show));
app.use(static('.'));


// Helpers

var getLayoutFileName = function (moduleName) {
  return interpolate('frontend/modules/{mod}/{mod}.html', { mod: moduleName });
};

var getScripts = function (moduleName) {
  var basePath = 'frontend/modules/' + moduleName;
  var allFiles = fs.readdirSync(basePath);
  var filter = function (file) {
    return file.match(/\.js$/);
  };
  var map = function (file) {
    return '/' + basePath + '/' + file;
  };

  return allFiles.filter(filter).map(map);
};


// Controllers

function *list() {
  this.body = yield render('list', {
    modules: fs.readdirSync('frontend/modules/')
  });
}

function *show(moduleName) {
  this.body = yield render('master', {
    title: moduleName,
    scripts: getScripts(moduleName),
    body: fs.readFileSync(getLayoutFileName(moduleName), {encoding:'utf8'})
  })
}

app.listen(4000);

