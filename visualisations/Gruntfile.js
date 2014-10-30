'use strict';
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: ['dist/*'],

        concat: {
            build: {
                files: {
                    './dist/dependencies.js': [
                        './scripts/lib/*.js'
                    ],
                    './dist/viz.js': [
                        './scripts/*.js'
                    ],
                    './dist/lib.css': [
                        './styles/lib/*.css'
                    ],
                    './dist/styles.css': [
                        './styles/*.css'
                    ],
                },
            },
        },

        uglify: {
            build: {
                files: {
                    './dist/viz.dependencies.min.js': [
                        './dist/dependencies.js'
                    ],
                    './dist/viz.min.js': [
                        './dist/viz.js'
                    ],
                },
            },
        },

        watch : {
            files: [
                'scripts/*.js',
                'scripts/lib/*.js',
                'styles/*.css',
                'styles/lib/*.css'
            ],
            tasks: ['clean', 'concat:build']
        },
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('build', ['clean', 'concat:build']);

    grunt.registerTask('production', ['clean', 'concat:build', 'uglify:build']);
}
