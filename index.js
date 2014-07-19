var views = require('co-views');
var koa = require('koa');
var static = require('koa-static');
var route = require('koa-route');
var fs = require('fs');
var ejs = require('ejs');


// Settings

var settings = {
  viewsExt: 'ejs',
  baseDir: __dirname + '/../..',
	viewsDir: 'views',
  modulesDir: 'frontend/modules'
};

// Creating app & Setup

var app = koa();
var render = views(__dirname + '/views', { ext: settings.viewsExt });


// Routing

app.use(route.get('/', list));
app.use(route.get('/show/:id', show));
app.use(static('.'));


// Helpers

var getLayoutFileName = function (moduleName) {
  return settings.baseDir + '/' + settings.modulesDir + '/' + moduleName + '/' + moduleName + '.html';
};

var getScripts = function (moduleName) {
  var moduleFiles = fs.readdirSync(settings.baseDir + '/' + settings.modulesDir + '/' + moduleName);

  return moduleFiles.filter(function (file) {
    return file.match(/\.js$/);
  }).map(function (file) {
    return '/' + settings.modulesDir + '/' + moduleName + '/' + file;
  });
};

var getMasterViewData = function (moduleName) {
  var path = getLayoutFileName(moduleName);
  var body = fs.existsSync(path) ? fs.readFileSync(path, {encoding:'utf8'}) : '';
  return {
    title: moduleName,
    scripts: getScripts(moduleName),
    body: body
  };
};

var getViewFileName = function (viewName) {
	return settings.baseDir + '/' + settings.viewsDir + '/' + viewName + '.' + settings.viewsExt;
}

var existsOverridingView = function (viewName) {
  return fs.existsSync(getViewFileName(viewName));
};  


// Controllers

function *list() {
  this.body = yield render('list', {
    modules: fs.readdirSync(settings.baseDir + '/' + settings.modulesDir)
  });
}

function *show(moduleName) {
	var viewName = 'master';
	if (!existsOverridingView(viewName))
		this.body = yield render(viewName, getMasterViewData(moduleName))
	else {
		var content = fs.readFileSync(getViewFileName(viewName), {encoding: 'utf8'});
		this.body = ejs.render(content, getMasterViewData(moduleName));
	}
}

exports.start = function (config) {
	config = config || {};
	for (p in config)
		settings[p] = config[p];

	app.listen(config.port || 4000);
}



