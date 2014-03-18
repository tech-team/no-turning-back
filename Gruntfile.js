var liveReload = true;
var cssFiles = ['public/css/macondoregular/macondo-font.css',
				'public/css/styles.css'];
var commonCss = 'public/css/common.css';
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
		concat: {
		    css: {
		    	src: cssFiles,
		    	dest: 'public/css/common.css',
		    	options: {
			    	separator: '\n',
			    }
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
                files: jsFiles.concat([commonCss]),
                tasks: [],
                options: {
                    interrupt: true,
			        livereload: liveReload
                }
            },
            css: {
                files: cssFiles,
                tasks: ['concat:css'],
                options: {}
            }
		}
	});
	grunt.loadNpmTasks('grunt-fest');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-express-server');
	
	
	grunt.registerTask('default', ['express', 'watch']);
}
