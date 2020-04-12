<template>
  <div class="container">
    <About />
    <div class="column is-half is-offset-one-quarter  ">
      <div class="field has-addons">
        <div class="control is-expanded">
          <input
            v-model="searchCriteria"
            class="input"
            type="text"
            placeholder="Nombre, cargo u otros"
            @keyup.enter="newSearch"
          >
        </div>
        <div class="control">
          <a
            class="button is-link"
            :class="{ 'is-loading': isLoading }"
            @click="newSearch"
          >
            Buscar
          </a>
        </div>
      </div>
    </div>
    <div class="list is-hoverable">
      <nuxt-link
        v-for="name in searchResult"
        :key="name.uri"
        :to="name.uri"
        class="list-item"
      >
        {{ name.str }}
      </nuxt-link>
    </div>
    <nav
      class="pagination is-centered"
      role="navigation"
      aria-label="pagination"
      :class="{ 'is-hidden': totalPages == 0 }"
    >
      <a
        class="pagination-previous"
        :disabled="currentPage <= 1"
        @click="gotoPage(currentPage - 1)"
      >Anterior</a>
      <a
        class="pagination-next"
        :disabled="currentPage >= totalPages"
        @click="gotoPage(currentPage + 1)"
      >Siguiente</a>
      <ul class="pagination-list">
        <li>
          <a
            class="pagination-link"
            :class="{
              'is-current': currentPage == 1,
              'is-hidden': totalPages == 0
            }"
            aria-label="Goto page 1"
            @click="gotoPage(1)"
          >1</a>
        </li>
        <li>
          <span
            class="pagination-ellipsis"
            :class="{ 'is-hidden': currentPage <= pagesAroundCurrent + 2 }"
          >&hellip;</span>
        </li>
        <li v-for="n in paginationRange()" :key="n">
          <a
            class="pagination-link"
            :class="{ 'is-current': currentPage == n }"
            @click="gotoPage(n)"
          >{{ n }}</a>
        </li>
        <li>
          <span
            class="pagination-ellipsis"
            :class="{
              'is-hidden': currentPage >= totalPages - pagesAroundCurrent - 1
            }"
          >&hellip;</span>
        </li>
        <li>
          <a
            class="pagination-link"
            :class="{
              'is-current': currentPage == totalPages,
              'is-hidden': totalPages <= 1
            }"
            @click="gotoPage(totalPages)"
          >{{ totalPages }}</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import {
  Stitch,
  AnonymousCredential,
  RemoteMongoClient
} from 'mongodb-stitch-server-sdk'
import About from '~/components/About.vue'

const client = Stitch.hasAppClient('cuantoganachile-cdttj') ? Stitch.defaultAppClient : Stitch.initializeDefaultAppClient('cuantoganachile-cdttj')
const mongodb = client.getServiceClient(
  RemoteMongoClient.factory,
  'mongodb-atlas'
)
const db = mongodb.db('remuneracion')
const resultsPerPage = 10

export default {
  components: {
    About
  },
  data () {
    return {
      searchResult: [],
      searchCriteria: '',
      currentCriteria: null,
      currentPage: 0,
      clickedPage: 0,
      performingSearch: false,
      totalPages: 0,
      pagesAroundCurrent: 2
    }
  },
  computed: {
    isLoading () {
      return this.clickedPage !== this.currentPage || this.performingSearch
    }
  },
  methods: {
    updateSearch (updateTotalPages = false) {
      db.collection('05')
        .aggregate([
          {
            $match: {
              name: { $regex: this.searchCriteria, $options: 'i' }
            }
          },
          {
            $group: {
              _id: {
                name: '$name'
              }
            }
          },
          { $skip: resultsPerPage * (this.clickedPage - 1) },
          { $limit: resultsPerPage }
        ]).toArray()
        .then((items) => {
          if (updateTotalPages) {
            db.collection('05')
              .aggregate([
                {
                  $match: {
                    name: { $regex: this.searchCriteria, $options: 'i' }
                  }
                },
                {
                  $group: {
                    _id: {
                      name: '$name'
                    }
                  }
                },
                {
                  $count: 'total'
                }
              ])
              .toArray()
              .then((counts) => {
                const total = counts[0].total
                const lastPageCount = total % resultsPerPage
                this.totalPages =
                    (total - lastPageCount) / resultsPerPage + 1
                this.currentCriteria = this.searchCriteria
              })
          }
          this.updatePagination()
          this.searchResult = items.map((item) => {
            return {
              uri: '/' + encodeURIComponent(item._id.name),
              str: item._id.name
            }
          })
          this.performingSearch = false
        })
    },
    search (updateTotalPages = false) {
      if (client.auth.isLoggedIn) { this.updateSearch(updateTotalPages) } else {
        client.auth
          .loginWithCredential(new AnonymousCredential())
          .then(this.updateSearch(updateTotalPages))
          .catch((err) => {
            console.error(err)
            this.clickedPage = this.currentPage
            this.performingSearch = false
          })
      }
    },
    gotoPage (page) {
      if (page < 1) { return }
      if (page > this.totalPages) { return }
      if (this.currentPage === page) { return }
      this.clickedPage = page
      this.search()
    },
    newSearch () {
      if (this.currentCriteria === this.searchCriteria) { return }
      this.clickedPage = 1
      this.performingSearch = true
      this.search(true)
    },
    updatePagination () {
      this.currentPage = this.clickedPage
    },
    paginationRange () {
      const start = Math.max(2, this.currentPage - this.pagesAroundCurrent)
      const end = Math.min(
        this.totalPages - 1,
        this.currentPage + this.pagesAroundCurrent
      )
      if (end >= start) { return [...Array(end - start + 1).keys()].map(i => i + start) } else { return [] }
    }
  }
}
</script>
