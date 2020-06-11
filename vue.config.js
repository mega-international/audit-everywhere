module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/audit-everywhere/' : '/HOPEX-audit-mission/',
  pwa: {
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      importWorkboxFrom: 'local',
      globIgnores: [
        '**/config.json'
      ],
      exclude: [ /\.config$/, /\.json$/, /\.json.example$/, /service-worker\.js$/, /\.map$/ ],
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [ {
        urlPattern: new RegExp('http://localhost'),
        handler: 'StaleWhileRevalidate'
      } ]
    }
  }
};
