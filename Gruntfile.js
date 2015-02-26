module.exports = function(grunt) {

	var config = {
		dev: {
			serverurl: 'http://localhost:7000/channel'
		},
		dist: {
			serverurl: 'http://enigmatic-citadel-9501.herokuapp.com/channel'
		}
	};

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		
		copy: {
			dist: {
				files: [
					//kopier index.html - bliver overskrevet af minificeret udgave i dist
					{ src: 'src/index.html', dest: 'dist/index.html' },
					//kopier simpel webserver der bruges til heroku
					{ src: 'src/index.js', dest: 'dist/index.js' },
					//kopier bootstrap skrifttyper (glyphicons)
					{ expand: true, flatten: false, cwd: 'bower_components/bootstrap/dist/', src: ['fonts/**'], dest: 'dist' },
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
					transform: ['uglifyify'] // minifyify!
				}
			}
		},

		clean: {
			dist: {
				src: [
					'dist/'/*,
					'!dist/components/**',
					'dist/components/*',
					'!dist/components/MathJax/**'*/
				]
			}
		},

		watch: {
			dist: {
				files: [ 'Gruntfile.js', 'package.json', 'src/**', '!src/node_modules/**/*' ],
				tasks: [ 'watchbase'],
				options: {
					livereload: true
				}
			}
		},

		connect: {
			options: {
				port: 9000,
				hostname: '0.0.0.0'
			},
			rules: [
				{ from: '/d/([0-9]+)/?$', to: '/index.html' }
			],
			server: {
				options: {
					middleware: function (connect) {
						return [
							require('connect-livereload')(),
							connect.static('dist')
						];
					}

				}
			}
		},

		replace: {
			dev: {
				src: [ './src/config.js' ],
				dest: './src/config.dev.js',
				replacements: [{
					from: '\'@@config\'',
					to: function (match) {
						return JSON.stringify(config.dev);
					}
				}]
			},
			dist: {
				src: [ './src/config.js' ],
				dest: './src/config.dev.js',
				replacements: [{
					from: '\'@@config\'',
					to: function (match) {
						return JSON.stringify(config.dist);
					}
				}]
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
					'src/css/style.css']}
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
		    all: [ 'Gruntfile.js', 'src/**/*.js' ]
		}

	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-text-replace');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('default', [ 'jshint', 'clean:dist', 'copy:dist', 'replace:dev', 'browserify:dev', 'cssmin', 'connect:server', 'watch' ]);
	grunt.registerTask('watchbase', [ 'jshint', 'copy:dist', 'replace:dev', 'cssmin', 'browserify:dev' ]);
	grunt.registerTask('heroku', [ 'jshint', 'clean:dist', 'copy:dist', 'replace:dist', 'browserify:dist', 'cssmin', 'htmlmin' ]);

};