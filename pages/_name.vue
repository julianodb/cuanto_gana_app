<template>
  <div class="column">
    <h1 class="title">
      {{ personid }}
    </h1>
    <div class="subtitle">
      {{ personData }}
    </div>
  </div>
</template>

<script>

export default {
  async asyncData (context) {
    const personid = context.params.name
    const personData = await context.$axios.$get(`https://storage.scrapinghub.com/items/434931/1/20/${personid}`, {
      auth:
       {
         username: context.env.apiKey,
         password: ''
       }
    })
    return { personid, personData }
  }
}
</script>
