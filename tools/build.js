var fs = require('fs'),
	cli = require('cli'),
	wrench = require('wrench'),
	AdmZip = require('adm-zip'),
	requirejs = require('requirejs'),
	source = __dirname + '/../Web',
	tmpRoot = __dirname + '/../tmp',
	tmp = tmpRoot + '/Web',
	sourceLanding = __dirname + '/../Landing',
	tmpLanding = tmpRoot + '/Landing',
	buildDir = __dirname + '/../build',
	version,
	files,
	i, j,
	options = cli.parse({
		debug: ['d', 'Build debug version'],
		release: ['r', 'Build release version'],
		project: ['c', 'Chosen project', 'string', ''],
		suffix: ['s', 'Suffix for war file names', 'string', ''],
		noversion: ['n', 'Don\'t include version info in js, css and html files']
	}),
	config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8')),
	target;

cli.main(function (args, options) {
	"use strict";

	if (fs.existsSync(tmpRoot)) {
		wrench.rmdirSyncRecursive(tmpRoot);
	}
	fs.mkdirSync(tmpRoot);

	if (!fs.existsSync(buildDir)) {
		fs.mkdirSync(buildDir);
	}

	getVersion();

	if (options.debug) {
		wrench.copyDirSyncRecursive(source, tmp);
		if (fs.exists(tmp + '/.idea')) {
			wrench.rmdirSyncRecursive(tmp + '/.idea');
		}
		if (!options.noversion) {
			setVersion(tmp);
		}
		packageFiles(tmp, 'kineticsweb');
		buildLandingPage();
	}

	if (options.release) {
		fs.mkdirSync(tmp);
		requirejs.optimize(config, function (buildResponse) {
			//cleanup
			//todo: a more graceful way of excluding files
			if (fs.exists(tmp + '/.idea')) {
				wrench.rmdirSyncRecursive(tmp + '/.idea');
			}
			files = fs.readdirSync(tmp + '/js');
			process.chdir(tmp + '/js');
			for (i = 0; i < files.length; i++) {
				if (fs.statSync(files[i]).isDirectory()) {
					wrench.rmdirSyncRecursive(files[i]);
				} else {
					if (files[i] !== 'main.js') {
						fs.unlinkSync(files[i]);
					}
				}
			}
			files = fs.readdirSync(tmp + '/assets');
			process.chdir(tmp + '/assets');
			for (i = 0; i < files.length; i++) {
				if (fs.statSync(files[i]).isFile()) {
					if (files[i] !== 'require.min.js') {
						fs.unlinkSync(files[i]);
					}
				}
			}
			if (!options.noversion) {
				setVersion(tmp);
			}
			packageFiles(tmp, 'kineticsweb');
			buildLandingPage();
		}, function (err) {
			console.log(err);
		});
	}

	function buildLandingPage() {
		//take care of landing page
		wrench.copyDirSyncRecursive(sourceLanding, tmpLanding);
		if (fs.exists(tmpLanding + '/.idea')) {
			wrench.rmdirSyncRecursive(tmpLanding + '/.idea');
		}
		if (!options.noversion) {
			setVersion(tmpLanding);
		}
		packageFiles(tmpLanding, 'ROOT');
	}

	function getVersion() {
		var oldVersion,
			now = (new Date()),
			month = now.getMonth() + 1,
			day = now.getDate(),
			year = now.getFullYear(),
			iteration = 1;

		if (fs.existsSync(__dirname + '/.oldversion')) {
			oldVersion = fs.readFileSync(__dirname + '/.oldversion', {encoding: 'utf8'});
			oldVersion = oldVersion.split('-');

			if (oldVersion && oldVersion.length === 4) {
				if (parseInt(oldVersion[0], 10) === month &&
					parseInt(oldVersion[1], 10) === day &&
					parseInt(oldVersion[2], 10) === year) {
					iteration = parseInt(oldVersion[3], 10) + 1;
				}
			}
		}
		version = month + '-' + day + '-' + year + '-' + iteration;
		fs.writeFileSync(__dirname + '/.oldversion', version, {encoding: 'utf8'});
		version += (options.release ? ' release ' : ' debug ') + options.project;
	}
	function setVersion(dir) {
		var files = wrench.readdirSyncRecursive(dir);
		for (i = 0; i < files.length; i++) {
			switch (true) {
			case /\.(?:css|js)$/.test(files[i]):
				fs.appendFileSync(dir + '/' + files[i], '\r\n/* ' + version + ' */');
				break;

			case (/\.html$/.test(files[i]) && !options.release):
				fs.appendFileSync(dir + '/' + files[i], '\r\n<!-- ' + version + ' -->');
				break;
			}
		}
	}

	function packageFiles(dir, name) {
		var zip = new AdmZip();
		if (!fs.existsSync(buildDir + '/' + version)) {
			fs.mkdirSync(buildDir + '/' + version);
		}
		process.chdir(dir);
		zip.addLocalFolder('.');
		zip.writeZip(buildDir + '/' + version + '/' + name + (options.suffix ? '-' + options.suffix : '') + '.war');
	}

	console.log('Version: ' + version);
});


