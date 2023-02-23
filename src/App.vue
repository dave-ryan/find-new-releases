<template>
  <div class="container text-center mt-5">
    <div class="row">
      <div class="col-2"></div>
      <div class="col submission-column">
        <div class="row mb-5">
          <div class="col-12">
            <h2>Upload a .csv file to see what albums you've been missing</h2>
            <div class="input-group">
              <input
                type="file"
                class="form-control fw-bold"
                id="inputGroupFile04"
                aria-describedby="inputGroupFileAddon04"
                aria-label="Upload"
                @change="handleFileChange($event)"
              />
              <button
                class="btn btn-outline-primary fw-bold"
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
            <div class="form-check form-switch form-check-inline">
              <label class="form-check-label" for="albumcheckbox"
                >Display Album Art</label
              >
              <input
                class="form-check-input"
                type="checkbox"
                role="switch"
                id="albumcheckbox"
                checked
                v-model="displayAlbums"
              />
            </div>
          </div>
          <div class="col">
            <div class="form-check form-switch form-check-inline">
              <label class="form-check-label" for="collectedcheckbox"
                >Display Collected Albums</label
              >
              <input
                class="form-check-input"
                type="checkbox"
                role="switch"
                id="collectedcheckbox"
                checked
                v-model="displayCollected"
              />
            </div>
          </div>
        </div>
        <div class="row mb-5">
          <div class="col">
            <div class="input-group">
              <span class="input-group-text" id="basic-addon1"
                >Only Display Albums Released Since</span
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
        <div class="row mb-3">
          <div class="col">
            <form @submit.prevent="discogsQuery(query.toLowerCase())">
              <div class="input-group">
                <span class="input-group-text">Individual Artist Search</span>
                <input
                  type="text"
                  v-model="query"
                  class="form-control"
                  id="queryinput"
                  placeholder="example: interpol"
                />
                <button class="btn btn-outline-primary" type="submit">
                  Search!
                </button>
              </div>
            </form>
          </div>
        </div>
        <div class="row bg-light font-monospace mb-3" v-if="logs.length > 0">
          <div class="col-12">Log:</div>
          <div
            class="col-12 overflow-scroll"
            style="max-height: 300px"
            id="logs-div"
          >
            <div v-for="(log, index) in logs" :key="index">
              {{ log }}
            </div>
          </div>
        </div>
        <div
          class="row bg-dark text-danger font-monospace mb-3"
          v-if="errors.length > 0"
        >
          <div class="col-12">Errors:</div>
          <div
            class="col-12 overflow-scroll"
            style="max-height: 300px"
            id="errors-div"
          >
            <div v-for="(error, index) in errors" :key="index">
              {{ error }}
            </div>
          </div>
        </div>
      </div>
      <div class="col-2"></div>
    </div>
    <div class="row">
      <div class="col">
        <button class="btn btn-danger" type="button" @click="clearResults">
          Clear Results
        </button>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
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
    </div>
  </div>
</template>

<style>
.collected {
  color: gray;
  font-weight: 200;
  text-decoration: line-through;
}

img {
  height: 125px;
  width: 125px;
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
      errorsDiv: {},
      logs: [],
      logsDiv: null,
      downloadedArtists: [],
      searchedArtists: [],
      uploadedAlbums: [],
      displayAlbums: true,
      displayCollected: true,
      readyToDownloadInfo: false,
      queryCount: 0,
      filteredYear: 1900,
    };
  },
  computed: {
    computedFiltered() {
      return this.downloadedArtists.map((artist) => {
        return artist.albums.filter((album) => {
          return (
            (album.year >= this.filteredYear &&
              album.collected === this.displayCollected) ||
            (album.year >= this.filteredYear && !album.collected)
          );
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
            // console.log(this.uploadedAlbums, "uploaded!");

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
        // console.log(this.queryCount, this.uploadedAlbums.length);
        this.discogsQuery(this.uploadedAlbums[this.queryCount][0]);
        this.queryCount += 1;
      } else {
        this.logs.push("Download Complete!");
        console.log("Download Complete!");
        console.log("Uploaded Albums:", this.uploadedAlbums);
        console.log("Downloaded Albums:", this.downloadedArtists);
      }
    },
    discogsQuery: function (artist) {
      if (!this.duplicationCheck(artist)) {
        this.searchedArtists.push([artist, ""]);
        this.logs.push(`downloading info on ${artist}...`);
        if (this.logsDiv) {
          this.logsDiv.scrollTop = this.logsDiv.scrollHeight;
        } else {
          this.logsDiv = document.getElementById("logs-div");
        }
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
              if (this.errorsDiv) {
                this.errorsDiv.scrollTop = this.errorsDiv.scrollHeight;
              } else {
                this.errorsDiv = document.getElementById("errors-div");
              }

              return;
            }

            //to avoid the wrong artist showing up, we make sure it's the one we search for
            var selectedAlbums = response.data.results.filter((album) => {
              if (
                album.title.split(" - ")[0].toUpperCase() ===
                artist.toUpperCase()
              ) {
                return album;
              }
            });

            //sort by release year
            var sortedAlbums = selectedAlbums.sort((a, b) => {
              return a.year > b.year ? 1 : -1;
            });

            //mark them collected if we uploaded them
            sortedAlbums.map((album) => {
              this.uploadedAlbums.forEach((upAlbum) => {
                if (
                  upAlbum[1].toUpperCase() ===
                  album.title.split(" - ")[1].toUpperCase()
                ) {
                  album.collected = true;
                }
              });
            });

            //add them to the list
            var newArtist = {
              artist: artist,
              albums: sortedAlbums,
            };
            this.downloadedArtists.push(newArtist);

            //alphabetize the list of artists
            this.downloadedArtists = this.downloadedArtists.sort((a, b) => {
              return a.artist > b.artist ? 1 : -1;
            });

            //clear out the search (for single search)
            if (artist === this.query) {
              this.query = "";
            }
          })
          .catch((errors) => {
            this.errors.push(`ERROR! ${errors}`);
            console.log(errors);
            if (this.errorsDiv) {
              this.errorsDiv.scrollTop = this.errorsDiv.scrollHeight;
            } else {
              this.errorsDiv = document.getElementById("errors-div");
            }
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
