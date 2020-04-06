<template>
  <div class="container">
    <h1 class="title">
      {{ name }}
    </h1>
    <div class="subtitle">
      {{ personData }}
    </div>
    <div class="column">
      {{ lols }}
    </div>
  </div>
</template>

<script>

export default {
  async asyncData (context) {
    const name = context.params.name
    const itemId = '/20/1'
    const personData = await context.$axios.$get(`https://storage.scrapinghub.com/items/434931/1${itemId}`, {
      auth:
       {
         username: context.env.apiKey,
         password: ''
       }
    })
    const lols = await context.app.stitchDB.collection('05')
      .aggregate([
        {
          $match: {
            name: encodeURIComponent(name)
          }
        },
        {
          $group: {
            _id: {
              name: '$name'
            },
            ids: { $push: '$id' }
          }
        }]).toArray()
    return { name, personData, lols }
  }
}
</script>
