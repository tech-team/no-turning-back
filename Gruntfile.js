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
	
	
	grunt.registerTask('default', ['express', 'watch']);
}
