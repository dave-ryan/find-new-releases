<template>
  <div class="">
    <div class="row">
      <div class="col-2"></div>
      <div class="col submission-column">
        <form @submit.prevent="discogsQuery(query.toLowerCase())">
          <div class="input-group mb-3">
            <span class="input-group-text">Artist Search</span>
            <input
              type="text"
              v-model="query"
              class="form-control"
              id="queryinput"
              placeholder="example: interpol"
            />
            <button class="btn btn-primary" type="submit">Search!</button>
            <div
              class="file-upload__error mb-1"
              v-for="(error, index) in errors"
              :key="index"
            >
              <span>{{ error }}</span>
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
            @change="handleFileChange($event)"
          />
          <button
            class="btn btn-outline-primary"
            type="submit"
            id="inputGroupFileAddon04"
          >
            Upload CSV
          </button>
        </div>
        <div>
          <button class="btn btn-danger" type="button" @click="clearResults">
            Clear Results
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
import Papa from "papaparse";

export default {
  data: function () {
    return { albums: [], query: "", errors: [], myCollection: [] };
  },
  methods: {
    handleFileChange(e) {
      // Check if file is selected
      if (e.target.files && e.target.files[0]) {
        // Get uploaded file
        const file = e.target.files[0],
          // Get file size
          fileSize = Math.round((file.size / 1024 / 1024) * 100) / 100,
          // Get file extension
          fileExtention = file.name.split(".").pop(),
          // Get file name
          fileName = file.name.split(".").shift(),
          // Check if file is an image
          isImage = ["jpg", "jpeg", "png", "gif"].includes(fileExtention);
        // Print to console
        console.log(fileSize, fileExtention, fileName, isImage);
        Papa.parse(file, {
          skipEmptyLines: true,

          complete: function (results) {
            console.log("results", results);
            this.myCollection = results.data;
            console.log("string", JSON.stringify(results.data));
          },
        });
      }
    },
    isFileTypeValid(fileExtention) {
      if (this.accept.split(",").includes(fileExtention)) {
        console.log("File type is valid");
      } else {
        this.errors.push(`File type should be ${this.accept}`);
      }
    },
    duplicationCheck: function (artist) {
      var s = JSON.stringify(this.myCollection);
      if (s.indexOf(artist) != -1) {
        return true;
      } else {
        return false;
      }
    },
    discogsQuery: function (artist) {
      if (!this.duplicationCheck(artist)) {
        this.myCollection.push([artist, ""]);
        axios
          .get(
            `https://api.discogs.com/database/search?type=master&artist=${artist.replace(
              /\s/g,
              "+"
            )}&format=album&token=vwbBWENsiqyNVUgWWlunGyTKRxXHVSHJNHosZUyj`
          )
          .then((response) => {
            response.data.results.forEach((album) => {
              this.albums.push(album);
            });
            this.albums = this.albums.sort((a, b) => {
              return a.title > b.title ? 1 : -1;
            });
            console.log(response);
            if (artist === this.query) {
              this.query = "";
            }
          });
      }
    },
    clearResults: function () {
      this.albums = [];
      this.myCollection = [];
    },
  },
};
</script>
