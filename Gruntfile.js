var liveReload = true;
var cssFiles = ['public/css/macondoregular/macondo-font.css',
				'public/css/styles.css']

module.exports = function (grunt) {
	grunt.initConfig({
		connect: {
			server: {
				options: {
					keepalive: false,
					livereload: liveReload,
					port: 8000,
					base: 'public'
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
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-fest');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default', ['connect', 'watch']);
}
