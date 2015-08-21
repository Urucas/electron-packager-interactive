module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.initConfig({
    babel: {
      options: { sourceMap: false },
      dist: {
        files: [{
          cwd: './',
          src: ['*.es6.js'],
          dest: './',
          ext: '.js',
          expand: true
        }]
      }
    }
  });
  grunt.registerTask('build', ['babel']);
}
