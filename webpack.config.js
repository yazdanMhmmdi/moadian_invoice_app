const path = require('path');

module.exports = {
  mode: 'production', // Minify output
  entry: './dist/example.js', // Input file (compiled TS)
  target: 'node', // Optimize for Node.js environment
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js', // Output bundle
    clean: false // Keep other dist files
  },
  resolve: {
    extensions: ['.js'] // Resolve .js files
  },
  module: {
    rules: [

    ]
  }
};