<template>
  <div class="card">
    <div class="card-content">
      <div class="content">
        <div class="table-container">
          <table class="table is-bordered is-narrow is-striped is-hoverable">
            <thead>
              <tr>
                <th />
                <th
                  v-for="date_payment in resultItem.pays_per_date"
                  :key="date_payment._id.str"
                  :colspan="date_payment.pays_per_organism.length"
                  class="has-text-centered"
                >
                  <abbr
                    :title="date_payment['Mes'] + ' de ' + date_payment['Año']"
                  >
                    {{ date_payment["Mes_number"] }}&nbsp;/&nbsp;{{
                      date_payment["Año"]
                    }}
                  </abbr>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Organismo</th>
                <td
                  v-for="payment in resultItem.pays_per_date.flatMap(
                    o => o.pays_per_organism
                  )"
                  :key="payment._id.str"
                >
                  {{ payment.Organismo }}
                </td>
              </tr>
              <tr v-for="key in resultItem.indeces" :key="key">
                <th>{{ key | removeNumberEnding }}</th>
                <td
                  v-for="payment in resultItem.pays_per_date.flatMap(
                    o => o.pays_per_organism
                  )"
                  :key="payment._id.str"
                >
                  {{ payment[key] | formatCurrency }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentTable',
  filters: {
    removeNumberEnding (value) {
      if (!value) { return '' }
      value = value.toString()
      return value.slice(0, -'_number'.length)
    },
    formatCurrency (value) {
      if (!value) { return '$\xA00' }
      return '$\xA0' + value.toLocaleString('es-CL')
    }
  },
  props: {
    resultItem: {
      type: Object,
      default () { return {} }
    }
  }
}
</script>
