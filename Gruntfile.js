'use strict';
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            dist: {
                files: {
                    'css/base.css': 'css/base.scss'
                }
            }
        },
        watch: {
            css: {
                files: '**/*.scss',
                tasks: ['sass']
            },
            options: {
                livereload: true
            }
        },
        cssmin: {
            css:{
                src: 'css/base.css',
                dest: 'css/base.min.css'
            }
        }

    });


    //Register modules to user    
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    //Register tasks
    grunt.registerTask('default', ['watch']);
};