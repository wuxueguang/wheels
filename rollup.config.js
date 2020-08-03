export default [{
  input: 'src/Promise/index',
  output: {
    file: 'dist/cjs/Promise.development.js',
    format: 'cjs'
  }
}, {
  input: 'src/Promise/index',
  output: {
    name: 'Promise.development',
    file: 'dist/umd/Promise.development.js',
    format: 'umd'
  }
}, {
  input: 'test/EventEmitter.test',
  output: {
    file: 'dist/test/EventEmitter.test.js',
    format: 'cjs'
  }
}];