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
			main_game: {
				files: [{
					expand: true,
					cwd: 'public/css',
					src: '*.scss',
					dest: 'public/css',
					ext: '.css'
				}]
			},

            joystick: {
                files: [{
                    expand: true,
                    cwd: 'public/css/joystick',
                    src: '*.scss',
                    dest: 'public/css/joystick',
                    ext: '.css'
                }]
            }
		},
		requirejs: {
			build_main_game: {
				options: {
					almond: true,
					baseUrl: 'public/js',
					mainConfigFile: 'public/js/main.js',
					name: 'main',
					optimize: 'none',
					out: 'public/js/build/main.js'
				}
			},

            build_joystick: {
                options: {
                    almond: true,
                    baseUrl: 'public/js',
                    mainConfigFile: 'public/js/main_joystick.js',
                    name: 'main_joystick',
                    optimize: 'none',
                    out: 'public/js/joystick/build/main.js'
                }
            }
		},
		concat: {
			options: {
				separator: ';\n'
			},
            build_main_game: {
				src: ['public/js/lib/almond.js', 'public/js/build/main.js'],
				dest: 'public/js/build/build.js'
			},

            build_joystick: {
                src: ['public/js/lib/almond.js', 'public/js/joystick/build/main.js'],
                dest: 'public/js/joystick/build/build.js'
            }
		},
		uglify: {
            build_main_game: {
				files: [{
			        src: ['public/js/build/build.js'],
			        dest: 'public/js/build/build.min.js'
			    }]
			},
            build_joystick: {
                files: [{
                    src: ['public/js/joystick/build/build.js'],
                    dest: 'public/js/joystick/build/build.min.js'
                }]
            }
		},
        cssmin: {
            main_game: {
                expand: true,
                cwd: 'public/css/',
                src: ['*.css', '!*.min.css'],
                dest: 'public/css/',
                ext: '.min.css'
            },
            joystick: {
                expand: true,
                cwd: 'public/css/joystick',
                src: ['*.css', '!*.min.css'],
                dest: 'public/css/joystick',
                ext: '.min.css'
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
                files: ['public/js/**/*.js',
                        'public/css/*.css'],
                tasks: ['cssmin:main_game'],
                options: {
                    interrupt: true,
			        livereload: liveReload
                }
            },
            joystick: {
                files: ['public/js/joystick/**/*.js',
                        'public/css/joystick/*.css'],
                tasks: ['cssmin:joystick'],
                options: {
                    interrupt: true,
                    livereload: liveReload
                }
            },
            scss_main: {
                files: ['public/css/*.scss'],
                tasks: ['sass:main_game'],
                options: {
                    atBegin: true,
                    livereload: false
                }
            },
            scss_joystick: {
                files: ['public/css/joystick/*.scss'],
                tasks: ['sass:joystick'],
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
    grunt.loadNpmTasks('grunt-contrib-cssmin');
	
	
	grunt.registerTask('default', ['express', 'cssmin', 'watch']);

	grunt.registerTask(
	    'build_main',
	    [
	        'fest', 'requirejs:build_main_game',
	        'concat:build_main_game', 'uglify:build_main_game',
            'cssmin:main_game'
	    ]
	);

    grunt.registerTask(
        'build_joystick',
        [
            'requirejs:build_joystick',
            'concat:build_joystick', 'uglify:build_joystick',
            'cssmin:joystick'
        ]
    );

    grunt.registerTask(
        'build',
        [
            'build_joystick',
            'build_main'
        ]
    );

}
