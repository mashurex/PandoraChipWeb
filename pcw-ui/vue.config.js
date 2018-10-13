// vue.config.js
module.exports = {
  devServer: {
    proxy: {
      '/api/stats': {
        target: 'http://localhost:3000',
        ws: true,
        // changeOrigin: true,
        pathRewrite: {
          '^/api/stats': '/stats'
        },
        logLevel: 'debug'
      }
    }
  }
};
