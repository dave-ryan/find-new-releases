<template>
  <div class="container text-center mt-5">
    <div class="row">
      <div class="col-2"></div>
      <div class="col submission-column">
        <div class="row">
          <div class="col-8">
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
              </div>
            </form>
          </div>
          <div class="col">
            <button class="btn btn-danger" type="button" @click="clearResults">
              Clear Results
            </button>
          </div>
          <div class="col-12">
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
                v-if="readyToDownloadInfo"
                @click="downloadEngine()"
              >
                Find New Releases
              </button>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <div class="form-check form-switch">
              <label class="form-check-label" for="artcheckbox"
                >Display Album Art</label
              >
              <input
                class="form-check-input"
                type="checkbox"
                role="switch"
                id="artcheckbox"
                checked
                v-model="displayAlbums"
              />
            </div>
          </div>
          <div class="col">
            <div class="input-group mb-3">
              <span class="input-group-text" id="basic-addon1"
                >Only display albums released since:</span
              >
              <input
                v-model="filteredYear"
                type="number"
                class="form-control"
                aria-label="Year"
                aria-describedby="basic-addon1"
              />
            </div>
          </div>
        </div>
        <div class="row bg-light font-monospace" v-if="logs.length > 0">
          <div class="col-12">Log:</div>
          <div class="col-12">
            <div v-for="(log, index) in logs" :key="index">
              {{ log }}
            </div>
          </div>
        </div>
        <div
          class="row bg-dark text-danger font-monospace"
          v-if="errors.length > 0"
        >
          <div class="col-12">Errors:</div>
          <div class="col-12">
            <div v-for="(error, index) in errors" :key="index">
              {{ error }}
            </div>
          </div>
        </div>
      </div>
      <div class="col-2"></div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th scope="col">Artist</th>
          <th scope="col">Album</th>
          <th scope="col">Year</th>
          <th scope="col">Id</th>

          <th scope="col" v-if="displayAlbums">Cover</th>
        </tr>
      </thead>
      <tbody class="table-group-divider">
        <template v-for="artist in computedFiltered" :key="artist.artist">
          <tr
            v-for="album in artist"
            :key="album.id"
            class="mt-3"
            :class="{ collected: album.collected }"
          >
            <td v-if="album.title">
              {{ album.title.split(" - ")[0] }}
            </td>
            <td v-if="album.title">
              {{ album.title.split(" - ")[1] }}
            </td>
            <td>
              {{ album.year }}
            </td>
            <td>{{ album.id }}</td>
            <td v-if="displayAlbums">
              <a
                :href="'https://www.discogs.com/master/' + album.master_id"
                target="_blank"
              >
                <img :src="album.thumb" alt="" />
              </a>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style>
.collected {
  color: gray;
  font-weight: 200;
  text-decoration: line-through;
}
</style>

<script>
import axios from "axios";
import Papa from "papaparse";

export default {
  data: function () {
    return {
      query: "",
      errors: [],
      logs: [],
      downloadedArtists: [],
      searchedArtists: [],
      uploadedAlbums: [],
      displayAlbums: true,
      readyToDownloadInfo: false,
      queryCount: 0,
      filteredYear: 1900,
    };
  },
  computed: {
    computedFiltered() {
      return this.downloadedArtists.map((artist) => {
        return artist.albums.filter((album) => {
          return album.year >= this.filteredYear;
        });
      });
    },
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
            // console.log("results", results);
            // this.uploadedAlbums.map((album) => {
            //   album.collected = true;
            // });

            this.uploadedAlbums = results.data;
            this.readyToDownloadInfo = true;

            // console.log("string", JSON.stringify(results.data));
            // this.downloadEngine(results.data);
          }.bind(this),
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
      var s = JSON.stringify(this.searchedArtists);
      if (s.indexOf(artist) != -1) {
        return true;
      } else {
        return false;
      }
    },
    downloadEngine: function () {
      if (this.queryCount < this.uploadedAlbums.length) {
        console.log(this.queryCount, this.uploadedAlbums.length);
        this.discogsQuery(this.uploadedAlbums[this.queryCount][0]);
        this.queryCount += 1;
      } else {
        console.log("no more albums to search", this.uploadedAlbums);
      }
      // this.uploadedAlbums.forEach((row) => {
      //   this.discogsQuery(row[0]);
      // });
    },
    discogsQuery: function (artist) {
      if (!this.duplicationCheck(artist)) {
        this.searchedArtists.push([artist, ""]);
        // console.log(`downloading info on ${artist}...`);
        this.logs.push(`downloading info on ${artist}...`);

        var self = this;
        setTimeout(function () {
          // console.log("Executed after 1 second");
          self.downloadEngine();
        }, 1000);

        axios
          .get(
            `https://api.discogs.com/database/search?type=master&artist=${artist.replace(
              /\s/g,
              "+"
            )}&format=album&token=vwbBWENsiqyNVUgWWlunGyTKRxXHVSHJNHosZUyj`
          )
          .then((response) => {
            // console.log("discogs response", response);
            // this.queryCount += 1;

            if (response.data.results.length === 0) {
              this.errors.push(`Unable to find ${artist}`);
              return;
            }

            var selectedAlbums = response.data.results.filter((album) => {
              if (
                album.title.split(" - ")[0].toLowerCase() ===
                artist.toLowerCase()
              ) {
                return album;
              }
            });

            var sortedAlbums = selectedAlbums.sort((a, b) => {
              return a.year > b.year ? 1 : -1;
            });

            var newArtist = {
              artist: artist,
              albums: sortedAlbums,
            };
            this.downloadedArtists.push(newArtist);
            this.downloadedArtists = this.downloadedArtists.sort((a, b) => {
              return a.artist > b.artist ? 1 : -1;
            });
            if (artist === this.query) {
              this.query = "";
            }
          })
          .catch((errors) => {
            console.log("error!", errors);
            // console.log("ERROR!!", this.queryCount);
            // this.downloadEngine;
          });
      } else {
        console.log("dupe detected, and ignored");
        self = this;
        setTimeout(function () {
          // console.log("Executed after 1 second");
          self.downloadEngine();
        }, 200);
      }
    },
    clearResults: function () {
      this.downloadedArtists = [];
      this.uploadedAlbums = [];
    },
  },
};
</script>
