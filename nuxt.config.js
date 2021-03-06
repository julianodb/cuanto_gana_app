import {
  Stitch,
  AnonymousCredential,
  RemoteMongoClient
} from 'mongodb-stitch-server-sdk'
import axiosRetry from 'axios-retry';
const client = Stitch.hasAppClient('cuantoganachile-cdttj') ? Stitch.defaultAppClient : Stitch.initializeDefaultAppClient('cuantoganachile-cdttj')
const mongodb = client.getServiceClient(
  RemoteMongoClient.factory,
  'mongodb-atlas'
)
client.auth.loginWithCredential(new AnonymousCredential())

export default {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~/plugins/stitch.js'
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    ['@nuxtjs/eslint-module', { fix: true }],
    '@nuxtjs/fontawesome'
  ],
  fontawesome: {
    icons: {
      solid: ['faAngleDown', 'faAngleUp']
    }
  },
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://github.com/nuxt-community/modules/tree/master/packages/bulma
    '@nuxtjs/bulma',
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios'
  ],
  axios: {
    retry: {
      retries: 3,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response.status === 429
      }
    }
  },
  env: {
    apiKey: process.env.API_KEY
  },
  generate: {
    fallback: true,
    interval: 200,
    routes () {
      return mongodb.db('remuneracion').collection('05')
        .aggregate([
          {
            $group: {
              _id: {
                name: '$name'
              }
            }
          }]).toArray().then(result => result.map(item => '/' + encodeURIComponent(item._id.name))
        )
    }
  },
  /*
  ** Build configuration
  */
  build: {
    postcss: {
      preset: {
        features: {
          customProperties: false
        }
      }
    },
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
      config.node = { fs: 'empty' }
      if (!ctx.isServer) {
        config.resolve.alias = {
          ...config.resolve.alias,
          'mongodb-stitch-server-sdk': 'mongodb-stitch-browser-sdk'
        }
      }
      return config
    }
  }
}
