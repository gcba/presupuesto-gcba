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
        },

        uglify: {
            my_target: {
              files: {
                'js/presupuesto.min.js': ['js/presupuesto.js']
              }
            }
        }

    });


    //Register modules to user    
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    //Register tasks
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('deploy', ['cssmin', 'uglify']);
};