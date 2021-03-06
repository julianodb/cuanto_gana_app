<template>
  <div class="container">
    <h1 class="title">
      {{ name }}
    </h1>
    <payment-table
      :result-item="paymentsData"
    />
  </div>
</template>

<script>
import PaymentTable from '~/components/PaymentTable.vue'

export default {
  components: {
    PaymentTable
  },
  async asyncData (context) {
    const name = context.params.name
    const paymentIds = await context.app.stitchCollection
      .aggregate([
        {
          $match: {
            name
          }
        },
        {
          $group: {
            _id: {
              name: '$name',
              job: '$job'
            },
            indeces: { $push: '$index' }
          }
        },
        {
          $group: {
            _id: {
              name: '$name'
            },
            jobs: { $push: '$$ROOT' }
          }
        }]).toArray()
    const paymentsDataPreliminary = await Promise.all(paymentIds.flatMap(person =>
      person.jobs.map((job) => {
        const indeces = job.indeces.map(i => `index=${i}`).join('&')
        const items = context.$axios.$get(`https://storage.scrapinghub.com/items/434931/1/${job._id.job}?${indeces}`, {
          auth:
            {
              username: context.env.apiKey,
              password: ''
            }
        })
        return items
      })
    ))
    const paymentsDataPerDate = Object.values(paymentsDataPreliminary.flat().reduce((acc, paymentData) => {
      const key = paymentData['Año'] + paymentData.Mes_number + paymentData['Nombre completo']
      acc[key] = acc[key] || {
        pays_per_organism: [],
        Año: paymentData['Año'],
        Mes: paymentData.Mes,
        Mes_number: paymentData.Mes_number,
        _id: key
      }
      paymentData._id = key + paymentData.Organismo
      acc[key].pays_per_organism.push(paymentData)
      return acc
    }, {})).sort((a, b) => 12 * a.Año.localeCompare(b.Año) + a.Mes_number - b.Mes_number)
    const paymentsData = {
      'Nombre completo': paymentsDataPreliminary.flat()[0]['Nombre completo'] || '',
      pays_per_date: paymentsDataPerDate,
      indeces: [
        ...new Set(
          paymentsDataPerDate
            .flatMap(datePayment =>
              datePayment.pays_per_organism.map(payment =>
                Object.keys(payment)
                  .filter((key) => {
                    const keepThese = ['_number']
                    const excludeThese = [
                      'fecha',
                      'Fecha',
                      'Año',
                      'Grado',
                      'Mes',
                      'Asignaciones especiales',
                      'Observa'
                    ]
                    return (
                      keepThese.some(fragment => key.includes(fragment)) &&
                        !excludeThese.some(fragment => key.includes(fragment))
                    )
                  })
                  .reduce((res, key) => { res[key] = payment[key]; return res }, {})
              )
            )
            .flatMap(Object.keys)
        )
      ].sort()
    }
    return { name, paymentsData, paymentsDataPreliminary }
  }
}
</script>
