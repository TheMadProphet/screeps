module.exports = function (grunt) {
    const config = require("./.screeps.json");

    grunt.loadNpmTasks("grunt-screeps");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-string-replace");

    const dest = "dist/";
    // const dest = "/home/dimitri/.config/Screeps/scripts/screeps.com/defaultFlat/";

    grunt.initConfig({
        screeps: {
            options: {
                email: config.email,
                token: config.token,
                branch: config.branch,
                ptr: config.ptr
            },
            dist: {
                src: ["dist/*.js"]
            }
        },
        clean: {
            dist: [dest]
        },
        copy: {
            screeps: {
                files: [
                    {
                        expand: true,
                        cwd: "src/",
                        src: "**",
                        dest: dest,
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
                        src: dest + "*.js"
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

    grunt.registerTask("default", ["clean", "copy:screeps", "string-replace", "screeps"]);
    grunt.registerTask("non-prod", ["clean", "copy:screeps", "string-replace"]);
};
