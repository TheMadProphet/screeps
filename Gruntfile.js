module.exports = function (grunt) {
    const config = require("./.screeps.json");

    grunt.loadNpmTasks("grunt-screeps");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-string-replace");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.initConfig({
        screeps: {
            options: {
                email: config.email,
                token: config.token,
                branch: grunt.option("branch"),
                ptr: config.ptr
            },
            dist: {
                src: ["dist/*.js"]
            }
        },
        watch: {
            scripts: {
                files: ["src/**/*.js"],
                tasks: ["deploy"],
                options: {
                    spawn: false
                }
            }
        },
        clean: {
            dist: ["dist/"]
        },
        copy: {
            screeps: {
                files: [
                    {
                        expand: true,
                        cwd: "src/",
                        src: "**",
                        dest: "dist/",
                        filter: "isFile",
                        rename: function (dest, src) {
                            // Change the path name utilize underscores for folders
                            return dest + src.replace(/\//g, "_");
                        }
                    }
                ]
            }
        },
        "string-replace": {
            dist: {
                files: [
                    {
                        expand: true,
                        src: "dist/*.js"
                    }
                ],
                options: {
                    replacements: [
                        {
                            pattern: /require\(['"](.*?)['"]\)/g,
                            replacement: function (match, p1) {
                                return 'require("' + p1.replace(/\//g, "_") + '")';
                            }
                        }
                    ]
                }
            }
        }
    });

    grunt.registerTask("deploy", ["clean", "copy:screeps", "string-replace", "screeps"]);
};
