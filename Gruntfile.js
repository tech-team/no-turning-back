var liveReload = true;

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
                files: 'public/css/**/*.css',
                tasks: [],
                options: {
                    atBegin: true,
			        livereload: liveReload
                }
            }
		}
	});
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-fest');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default', ['connect', 'watch']);
}
