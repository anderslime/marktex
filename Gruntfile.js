module.exports = function(grunt) {
	
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'src/<%= pkg.name %>.js',
				dest: 'build/<%= pkg.name %>.min.js'
			}
		},

		copy: {
			dist: {
				files: [
					{ src: 'src/index.html', dest: 'dist/index.html'},
					{ src: 'src/index.js', dest: 'dist/index.js'},
					{ expand: true, flatten: false, cwd: 'src/', src: ['css/**'], dest: 'dist'},
					{ expand: true, flatten: false, cwd: 'src/', src: ['components/**'], dest: 'dist'},
					{ expand: true, flatten: false, cwd: 'bower_components/ace-builds/src-min-noconflict/', src: ['theme-twilight.js', 'mode-markdown.js'], dest: 'dist/components/ace/'},
					{ expand: true, flatten: false, cwd: 'bower_components/bootstrap/dist/', src: ['fonts/**'], dest: 'dist/components/bootstrap/'},

					{ src: 'bower_components/ace-builds/src-min-noconflict/ace.js', dest: 'dist/components/ace/ace.js' },
					{ src: 'bower_components/jquery/dist/jquery.min.js', dest: 'dist/components/jquery.js' },
					{ src: 'bower_components/angular/angular.min.js', dest: 'dist/components/angular.js' },
					{ src: 'bower_components/angular-sanitize/angular-sanitize.min.js', dest: 'dist/components/angular-sanitize.js' },
					{ src: 'bower_components/angular-route/angular-route.min.js', dest: 'dist/components/angular-route.js' },
					{ src: 'bower_components/angular-ui-ace/ui-ace.min.js', dest: 'dist/components/ui-ace.js' },
					{ src: 'bower_components/showdown/compressed/Showdown.min.js', dest: 'dist/components/showdown.js' },
					{ src: 'bower_components/angular-markdown-directive/markdown.js', dest: 'dist/components/angular-markdown-directive-markdown.js' },
					{ src: 'bower_components/bootstrap/dist/js/bootstrap.min.js', dest: 'dist/components/bootstrap/js/bootstrap.js' },
					{ src: 'bower_components/bootstrap/dist/css/bootstrap.min.css', dest: 'dist/components/bootstrap/css/bootstrap.css' },
					{ src: 'bower_components/bootstrap/dist/css/bootstrap-theme.min.css', dest: 'dist/components/bootstrap/css/bootstrap-theme.css' },
					{ src: 'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js', dest: 'dist/components/ui-bootstrap-tpls.js' },
					{ src: 'bower_components/raf/index.js', dest: 'dist/components/raf.js' },
					{ src: 'bower_components/angular-ui-layout/ui-layout.js', dest: 'dist/components/angular-ui-layout/ui-layout.js' },
					{ src: 'bower_components/angular-ui-layout/ui-layout.css', dest: 'dist/components/angular-ui-layout/ui-layout.css' }
				]
			},
			jax: {
				files: [
					{expand: true, flatten: false, cwd: 'bower_components/', src: ['MathJax/**'], dest: 'dist/components'},
				]
			}
		},

		'useminPrepare': {
			options: {
				dest: 'dist'
			},
			html: 'index.html'
		},

		usemin: {
			html: ['dist/index.html']
		},

		browserify: {
			dist: {
				src: 'src/main.js',
				dest: 'dist/main.js',
			}
		},

		concat: {
		    options: {
		    	separator: ';',
		    },
		    dist: {
		    	//todo 
		    	src: ['dist/components/**'],
		    	dest: 'dist/components.js',
		    },
		},

		clean: {
			dist: {
				src: [
					'dist/*',
					'!dist/components/**',
					'dist/components/*',
					'!dist/components/MathJax/**'
				]
			},
			jax: {
				src: [ 'dist/components/MathJax']
			}
		},

		watch: {
			dist: {
				files: ['Gruntfile.js', 'src/**', '!src/node_modules/**/*' ],
				tasks: ['watchbase'],
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
				{from: '/d/([0-9]+)/?$', to: '/index.html'}
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
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', [ 'clean:dist', 'copy:dist', 'browserify:dist', 'connect:server', 'watch:dist']);
	grunt.registerTask('watchbase', [ 'copy:dist', 'browserify:dist' ]);
	grunt.registerTask('jax', [ 'clean:jax','copy:jax']);
	grunt.registerTask('heroku', [ 'clean:dist', 'copy:dist', 'browserify:dist']);

};