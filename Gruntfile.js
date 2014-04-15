var liveReload = true;
var jsFiles = ['public/js/**/*.js'];

module.exports = function (grunt) {
	grunt.initConfig({
		express: {
            server: {
                options: {
                    port: 8000,
                    script: 'app.js'
                }
            }
        },
		fest: {
			templates: {
				files: [{
					expand: true,
					cwd: 'templates',
					src: '*.xml',
					dest: 'public/js/tmpl'
				}],
				options: {
					template: function (data) {
                        return grunt.template.process(
                            'define(function () { return <%= contents %> ; });',
                            {data: data}
                        );
                    }
				}
			}
		},
		sass: {
			css: {
				files: [{
					expand: true,
					cwd: 'public/css',
					src: '*.scss',
					dest: 'public/css',
					ext: '.css'
				}]
			}
		},
		requirejs: {
			build: {
				options: {
					almond: true,
					baseUrl: 'public/js',
					mainConfigFile: 'public/js/main.js',
					name: 'main',
					optimize: 'none',
					out: 'public/js/build/main.js'
				}
			}
		},
		concat: {
			options: {
				separator: ';\n'
			},
			build: {
				src: ['public/js/lib/almond.js', 'public/js/build/main.js'],
				dest: 'public/js/build/build.js'
			}
		},
		uglify: {
			build: {
				files: [{
			        src: ['public/js/build/build.js'],
			        dest: 'public/js/build/build.min.js'
			    }]
			}
		},
		watch: {
			express: {
                files:  [
                    'routes/**/*.js',
                    'app.js'
                ],
                tasks:  [ 'express' ],
                options: {
                    spawn: false,
                    atBegin: true

                }
            },
			fest: {
			    files: ['templates/*.xml'],
			    tasks: ['fest'],
			    options: {
			        atBegin: true,
			        livereload: liveReload
			    }
			},
            frontend: {
                files: jsFiles.concat(['public/css/*.css']),
                tasks: [],
                options: {
                    interrupt: true,
			        livereload: liveReload
                }
            },
            scss: {
                files: ['public/css/*.scss'],
                tasks: ['sass'],
                options: {
                	atBegin: true,
                	livereload: false
                }
            }
		}
	});
	grunt.loadNpmTasks('grunt-fest');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-express-server');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	
	
	grunt.registerTask('default', ['express', 'watch']);

	grunt.registerTask(
	    'build',
	    [
	        'fest', 'requirejs:build',
	        'concat:build', 'uglify:build'
	    ]
	);
}
