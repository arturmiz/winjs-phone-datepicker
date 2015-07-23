module.exports = function (grunt) {
    var webpack = require("webpack"),
        filename = "<%= pkg.name %>.<%= pkg.version %>"; 

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                jshintrc: true
            },
            files: {
                src: "src/**/*.js"
            }
        },
        webpack: {
            build: {
                entry: "./src/datepicker.js",
                output: {
                    libraryTarget: "var",
                    library: "WinJSPhoneDatepicker",
                    path: "dist/",
                    filename: filename + ".min.js"  
                },
                externals: {
                    "winjs": "WinJS",
                    "windows": "Windows"
                },
                plugins: [
					new webpack.optimize.UglifyJsPlugin()
                ]
            }
        },
        cssmin: {
            build: {
                src: "src/*.css",
                dest: "dist/" + filename + ".min.css" 
            }
        },
        bom: {
            options: {
                add: true
            },
            build: {
                src: "dist/" + filename + ".*"
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks("grunt-webpack");
    grunt.loadNpmTasks('grunt-byte-order-mark');

    grunt.registerTask('build', [
        'jshint',
        'webpack',
        'cssmin',
        'bom'
    ]);
};
