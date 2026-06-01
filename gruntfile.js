module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    projectFiles: ['src/litegraph.js',
      'src/nodes/base.js',
      'src/nodes/events.js',
      'src/nodes/interface.js',
      'src/nodes/input.js',
      'src/nodes/math.js',
      'src/nodes/logic.js',
      'src/nodes/image.js',
      'src/nodes/gltextures.js',
      'src/nodes/glfx.js',
      'src/nodes/midi.js',
      'src/nodes/audio.js',
      'src/nodes/network.js',
      'src/nodes/waterjade.js'
    ],
    concat: {
      build: {
        src: '<%= projectFiles %>',
        dest: 'build/litegraph.js'
      }
    },
    terser: {
      build: {
        files: {
          'build/litegraph.min.js': ['<%= projectFiles %>']
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-terser')

  grunt.registerTask('build', ['concat:build', 'terser:build'])
}
