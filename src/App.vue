<template>
  <div class="">
    <form @submit.prevent="testquery">
      <div class="mb-3">
        <label for="queryinput" class="form-label"
          >Please enter an artist name</label
        >
        <input
          type="text"
          v-model="query"
          class="form-control"
          id="queryinput"
          placeholder="example: interpol"
        />
      </div>
      <button class="btn btn-primary" type="submit">Search!</button>
    </form>

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
