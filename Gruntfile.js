module.exports = function(grunt) {
	var rewriteUtils = require('./components/rewrite-utils');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		config: {
			dev: {
				logging: true,
				persistentLogging: true,
				urls: {
					logout: 'http://localhost:3000/logout',
					sharejscollab: 'http://localhost:7000',
					me: 'http://localhost:3000/me',
					facebookIdsToUsers: 'http://localhost:3000/facebookIdsToUsers',
					logging: 'http://localhost:3000/logging',
					fbCallbackUrl: 'http://localhost:3000/auth/facebook/callback',
					document: 'http://localhost:3000/docs',
					documentHistory: 'http://localhost:3000/dochistory'
				},
				facebook: {
					appID: '878282388901735'
				}
			},
			dist: {
				logging: false,
				persistentLogging: true,
				urls: {
					logout: 'http://api.dtu.ninja/logout',
					document: 'http://api.dtu.ninja/docs',
					sharejscollab: 'http://livecollab.dtu.ninja',
					me: 'http://api.dtu.ninja/me',
					facebookIdsToUsers: 'http://api.dtu.ninja/facebookIdsToUsers',
					logging: 'http://api.dtu.ninja/logging',
					fbCallbackUrl: 'http://api.dtu.ninja/auth/facebook/callback'
				},
				facebook: {
					appID: '878282012235106'
				}
			}
		},

		copy: {
			dist: {
				files: [
					//kopier index.html - bliver overskrevet af minificeret udgave i dist
					{ src: 'src/index.html', dest: 'dist/index.html' },
					{ src: 'loaderio-441728208ec60f57d75602a3e9158492.html', dest: 'dist/loaderio-441728208ec60f57d75602a3e9158492.html' },
					//kopier simpel webserver der bruges til heroku
					{ src: 'src/index.js', dest: 'dist/index.js' },
					//kopier bootstrap skrifttyper (glyphicons)
					{ expand: true, flatten: false, cwd: 'bower_components/bootstrap/dist/', src: ['fonts/**'], dest: 'dist' },

					{ expand: true, flatten: false, cwd: 'components/katex/', src: ['fonts/**'], dest: 'dist/css' },
					//kopier component mappe
					{ expand: true, flatten: false, src: ['components/**'], dest: 'dist' },
					//kopier skrifttyper
					{ expand: true, flatten: false, cwd: 'src/', src: ['fonts/**'], dest: 'dist' }
				]
			},
			jax: {
				files: [
					{ expand: true, flatten: false, cwd: 'bower_components/', src: ['MathJax/**'], dest: 'dist/components' },
				]
			}
		},

		browserify: {
			dev: {
				src: 'src/main.js',
				dest: 'dist/main.min.js'
			},
			dist: {
				src: 'src/main.js',
				dest: 'dist/main.min.js',
				options: {
					sourcemap: false,
					transform: ['uglifyify'] // minifyify!
				}
			}
		},

		clean: {
			dist: {
				src: [
					'dist/'
				]
			},
			tmp: {
				src: [
					'tmp/'
				]
			}
		},

		watch: {
			dist: {
				files: [ 'Gruntfile.js', '.jshintrc', 'package.json', 'src/**', /*THIS MESSES UP WATCH TASK!?' components/**',*/ '!src/node_modules/**/*' ],
				tasks: [ 'watchbase'],
				options: {
					livereload: 35728
				}
			}
		},

		connect: {
			options: {
				port: 9000,
				hostname: '0.0.0.0'
			},
			rules: [
				{ from: '^(?!.*\\.js|.*\\.css|.*\\.woff2).*', to: '/index.html' },
				{ from: '(^.*(\.js|\.css|\.woff2).*$)', to: '/$1' }
			],
			server: {
				options: {
					middleware: function (connect) {
						return [
							require('connect-livereload')({ port: 35728 }),
							rewriteUtils.rewriteRequest,
							connect.static('dist')
						];
					}

				}
			}
		},

		cssmin: {
			dist: {
				options: {
					shorthandCompacting: false,
					roundingPrecision: -1
				},
				files:{ 'dist/css/style.min.css': [
					'bower_components/bootstrap/dist/css/bootstrap.min.css',
					'bower_components/bootstrap/dist/css/bootstrap-theme.min.css',
					'components/angular-ui-layout/ui-layout.css',
					'components/ui-select/select.css',
					'components/ui-select/select2.css',
					//'components/katex/katex.min.css',
					'src/css/bootstrap-sandstone.css',
					'src/css/style.css',
					'tmp/css/main.css'
				]}
			}
		},

		htmlmin: {
			dist: {
				options: {
					removeComments: true,
					collapseWhitespace: true
				},
				files: {
					'./dist/index.html': './src/index.html'
				}
			}
		},

		jshint: {
			all: {
				options: {
					jshintrc: true
				},
				files: {
					src: [ 'Gruntfile.js', 'src/**/*.js' ]
				}
			}
		},

		'git-describe': {
			options: {
				// nothing to see here. move along...
			},
			all: {

			}
		},

		ngtemplates:  {
			texapp: {
				cwd: './src/',
				src: 'templates/**/*.html',
				dest: './tmp/templates.js'
			}
		},

		'file-creator': {
			dev: {
				'tmp/config.js': function(fs, fd, done) {
					fs.writeSync(fd, 'module.exports = ' + JSON.stringify(grunt.config('config.dev')) + ';');
					done();
				}
			},
			dist: {
				'tmp/config.js': function(fs, fd, done) {
					fs.writeSync(fd, 'module.exports = ' + JSON.stringify(grunt.config('config.dist')) + ';');
					done();
				}
			}
		},

		compass: {
			all: {
				options: {
					sassDir: './src/sass',
					cssDir: './tmp/css'
				}
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-git-describe');
	grunt.loadNpmTasks('grunt-angular-templates');
	grunt.loadNpmTasks('grunt-file-creator');
	grunt.loadNpmTasks('grunt-connect-rewrite');
	grunt.loadNpmTasks('grunt-contrib-compass');

	grunt.event.once('git-describe', function (rev) {
		grunt.log.writeln("Git Revision: " + rev);
		grunt.option('gitRevision', rev);
		grunt.config('config.dev.gitrev', rev[0]);
		grunt.config('config.dist.gitrev', rev[0]);
	});

	grunt.registerTask('configureRewriteCustomRules', 'Configure connect rewriting rules.', function () {
        var options = this.options({
            rulesProvider: 'connect.rules'
        });
        rewriteUtils.log = grunt.log;
        (grunt.config(options.rulesProvider) || []).forEach(function (rule) {
            rule = rule || {};
            var registeredRule = rewriteUtils.registerRule({from: rule.from, to: rule.to, redirect: rule.redirect});
            if (registeredRule) {
                grunt.log.ok('Rewrite rule created for: [' + registeredRule + '].');
            } else {
                grunt.log.error('Wrong rule given.');
            }
        });
    });

	grunt.registerTask('default', [ 'jshint', 'git-describe', 'configureRewriteCustomRules', 'clean:dist', 'copy:dist', 'file-creator:dev', 'ngtemplates', 'browserify:dev', 'compass', 'cssmin', 'clean:tmp', 'connect:server', 'watch' ]);
	grunt.registerTask('watchbase', [ 'jshint', 'git-describe', 'configureRewriteCustomRules', 'copy:dist', 'file-creator:dev', 'compass', 'cssmin', 'ngtemplates', 'browserify:dev', 'clean:tmp' ]);
	grunt.registerTask('build', [ 'jshint', 'clean:dist', 'copy:dist', 'file-creator:dist', 'ngtemplates', 'browserify:dist', 'compass', 'cssmin', 'htmlmin', 'clean:tmp' ]);

};
