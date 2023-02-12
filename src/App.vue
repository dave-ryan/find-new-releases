<template>
  <div class="">
    <div class="row">
      <div class="col-2"></div>
      <div class="col submission-column">
        <form @submit.prevent="testquery">
          <div class="input-group mb-3">
            <div class="input-group-prepend">
              <span class="input-group-text">Artist Search</span>
            </div>
            <input
              type="text"
              v-model="query"
              class="form-control"
              id="queryinput"
              placeholder="example: interpol"
            />
            <div class="input-group-apend">
              <button class="btn btn-primary" type="submit">Search!</button>
            </div>
          </div>
        </form>

        <div class="input-group mb-3">
          <input
            type="file"
            class="form-control"
            id="inputGroupFile04"
            aria-describedby="inputGroupFileAddon04"
            aria-label="Upload"
          />
          <button
            class="btn btn-outline-primary"
            type="button"
            id="inputGroupFileAddon04"
          >
            Upload CSV
          </button>
        </div>
      </div>
      <div class="col-2"></div>
    </div>

    <div v-for="album in albums" :key="album.id" class="mt-3">
      {{ album.title }}, {{ album.year }}
      <a
        :href="'https://www.discogs.com/master/' + album.master_id"
        target="_blank"
      >
        <img :src="album.thumb" alt="" />
      </a>
    </div>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

<script>
import axios from "axios";
export default {
  data: function () {
    return { albums: [], query: "" };
  },
  methods: {
    testquery: function () {
      axios
        .get(
          `https://api.discogs.com/database/search?type=master&artist=${this.query.replace(
            /\s/g,
            "+"
          )}&format=album&token=vwbBWENsiqyNVUgWWlunGyTKRxXHVSHJNHosZUyj`,
          {
            // headers: {
            //   "user-agent":
            //     "FindMissingAlbums/1.0 +http://www.findyouralbums.com",
            // },
          }
        )
        .then((response) => {
          this.albums = response.data.results.filter((release) =>
            release.title.toLowerCase().includes(this.query.toLowerCase())
          );
          this.albums = this.albums.sort((a, b) => {
            return parseInt(a.year) > parseInt(b.year) ? 1 : -1;
          });
          console.log(response);
        });
    },
  },
};
</script>
