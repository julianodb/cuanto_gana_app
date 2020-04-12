import {
  Stitch,
  AnonymousCredential,
  RemoteMongoClient
} from 'mongodb-stitch-server-sdk'
const client = Stitch.hasAppClient('cuantoganachile-cdttj') ? Stitch.defaultAppClient : Stitch.initializeDefaultAppClient('cuantoganachile-cdttj')
const mongodb = client.getServiceClient(
  RemoteMongoClient.factory,
  'mongodb-atlas'
)
export default ({ app }, inject) => {
  app.stitchDB = mongodb.db('remuneracion')
  app.stitchLogin = client.auth.loginWithCredential(new AnonymousCredential())
}
