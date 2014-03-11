var liveReload = true;
var cssFiles = ['public/css/macondoregular/macondo-font.css',
				'public/css/styles.css']

module.exports = function (grunt) {
	grunt.initConfig({
		express: {
            server: {
                options: {
                    livereload: true,
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
		concat: {
			options: {
		    	separator: '\n',
		    },
		    css: {
		    	src: cssFiles,
		    	dest: 'public/css/common.css',
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
                    spawn: false
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
            js: {
                files: 'public/js/**/*.js',
                tasks: [],
                options: {
                    atBegin: true,
                    interrupt: true,
			        livereload: liveReload
                }
            },
            css: {
                files: cssFiles,
                tasks: ['concat:css'],
                options: {
                    atBegin: true,
			        livereload: liveReload
                }
            }
		}
	});
	grunt.loadNpmTasks('grunt-fest');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-express-server');
	
	grunt.registerTask('default', ['express', 'watch']);
}
