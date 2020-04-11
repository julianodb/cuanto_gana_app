<template>
  <div class="container">
    <h1 class="title">
      {{ name }}
    </h1>
    <h2 class="subtitle">
      {{ personData }}
    </h2>
    <div class="column">
      {{ lols }}
    </div>
  </div>
</template>

<script>

export default {
  async asyncData (context) {
    const name = context.params.name
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
    const personData = await Promise.all(lols.flatMap(person =>
      person.ids.map(itemId =>
        context.$axios.$get(`https://storage.scrapinghub.com/items/434931/1${itemId}`, {
          auth:
          {
            username: context.env.apiKey,
            password: ''
          }
        })
      )
    ))
    return { name, personData, lols }
  }
}
</script>
