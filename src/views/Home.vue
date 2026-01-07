<template>
  <div class="container text-center mt-5 mb-5">
    <!-- Info/Tools -->
    <div class="row">
      <div class="col">
        <div class="mb-5">
          <h2>
            Upload Your Collection
            <button
              type="button"
              class="btn btn-sm btn-light rounded-circle pt-0 pb-0 ps-2 pe-2"
              data-bs-toggle="modal"
              data-bs-target="#faqmodal"
            >
              ?
            </button>
          </h2>
          <h2>See What Albums You've Been Missing</h2>
        </div>

        <div class="mb-5">
          <form>
            <label for="csvUpload" class="btn btn-lg btn-outline-primary">
              Upload CSV
            </label>
            <input
              type="file"
              class="d-none input-group"
              @change="musicCollectionUpload($event)"
              accept=".csv"
              id="csvUpload"
            />
            <transition name="fade">
              <span v-if="uploadedFileName.length > 0">
                <span class="font-monospace"> - {{ uploadedFileName }} - </span>
                <button
                  class="btn btn-primary btn-lg fw-bold"
                  @click="startDownload()"
                  :disabled="engineRunning || downloading"
                >
                  Begin Download
                </button>
              </span>
            </transition>
          </form>
        </div>

        <transition name="fade">
          <div v-if="progress > 0" class="progress m-2">
            <div
              class="progress-bar"
              role="progressbar"
              :style="`width: ${progress}%`"
              :aria-valuenow="progress"
              aria-valuemin="0"
              aria-valuemax="100"
            >
              {{ progress }}%
            </div>
          </div>
        </transition>

        <div class="mb-5">
          <transition name="right">
            <div v-if="displayLogs" class="row mb-3">
              <div class="col-6 bg-light font-monospace p-1 rounded-start">
                <div class="border-bottom border-dark">Logs:</div>
                <div class="loggybox" id="logs-div">
                  <div v-for="(log, index) in logs" :key="index">
                    {{ log }}
                  </div>
                </div>
              </div>

              <div
                class="col-6 bg-light text-danger font-monospace p-1 rounded-end"
              >
                <div class="border-bottom border-dark">Errors:</div>
                <div class="loggybox p-0" id="errors-div">
                  <div v-for="(error, index) in errors" :key="index">
                    {{ error.message }}
                    <span v-if="error.artist"> - </span>
                    <a
                      :href="`https://www.discogs.com/search/?q=${error.artist.replace(
                        /\s/g,
                        '+'
                      )}&type=all`"
                      target="_blank"
                      v-if="error.artist"
                      >Find on Discogs
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </transition>
          <div class="row justify-content-md-center">
            <div class="col-md-auto">
              <button
                class="btn btn-sm btn-success m-2"
                type="button"
                @click="downloadCSV"
                :disabled="
                  engineRunning || downloading || computedFiltered.length < 1
                "
              >
                Download Results
              </button>
            </div>
            <div class="col-md-auto">
              <button
                class="btn btn-sm btn-danger m-2"
                type="button"
                @click="clearResults"
                :disabled="
                  engineRunning || downloading || computedFiltered.length < 1
                "
              >
                Clear Results
              </button>
            </div>
            <div class="col-md-auto">
              <form>
                <label
                  for="previousSearchUpload"
                  class="btn btn-sm btn-outline-secondary m-2"
                >
                  Upload Results
                </label>
                <input
                  type="file"
                  class="d-none input-group"
                  @change="previousSearchUpload($event)"
                  accept=".csv"
                  id="previousSearchUpload"
                  :disabled="engineRunning || downloading"
                />
              </form>
            </div>
          </div>
        </div>

        <br />

        <div class="row mb-5">
          <div class="col"></div>
          <div class="col-xs-10 col-sm-8 col-lg-6">
            <form @submit.prevent="discogsQuery(searchInput.toLowerCase())">
              <fieldset :disabled="engineRunning || downloading">
                <div class="input-group">
                  <span class="input-group-text">Artist Search</span>
                  <input
                    type="text"
                    v-model="searchInput"
                    class="form-control"
                    id="queryinput"
                    placeholder=""
                  />
                  <button class="btn btn-outline-primary" type="submit">
                    Search!
                  </button>
                </div>
              </fieldset>
            </form>
          </div>
          <div class="col"></div>
        </div>

        <div class="row justify-content-md-center mt-5">
          <div class="col-md-auto">
            <div class="form-check form-switch form-check-inline">
              <label class="form-check-label" for="logCheckbox"
                >Display Logs</label
              >
              <input
                class="form-check-input"
                type="checkbox"
                role="switch"
                id="logCheckbox"
                checked
                v-model="displayLogs"
              />
            </div>
          </div>
          <div class="col-md-auto">
            <div class="form-check form-switch form-check-inline">
              <label class="form-check-label" for="albumcheckbox"
                >Album Art</label
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
          <div class="col-md-auto">
            <div class="form-check form-switch form-check-inline">
              <label class="form-check-label" for="collectedcheckbox"
                >Collected Albums</label
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
        <div class="row justify-content-md-center mb-3">
          <div class="col-md-auto">
            <div class="input-group-sm input-group">
              <span class="input-group-text" id="basic-addon1"
                >Year Released >
              </span>
              <input
                v-model="filteredYear"
                type="number"
                class="form-control"
                aria-label="Year"
                aria-describedby="basic-addon1"
              />
            </div>
          </div>
          <div class="col-md-auto">
            <div class="input-group-sm input-group">
              <span class="input-group-text"
                >Custom Search URL
                <button
                  type="button"
                  class="btn btn-sm btn-light rounded-circle pt-0 pb-0 ps-2 pe-2 ms-2"
                  @click="displayExamples = !displayExamples"
                >
                  {{ displayExamples ? "x" : "?" }}
                </button></span
              >

              <input
                type="text"
                v-model="customSearchUrl"
                class="form-control"
                placeholder=""
              />
            </div>
            <transition name="fade">
              <ul
                class="list-group position-absolute shadow-lg popover"
                v-if="displayExamples"
              >
                <li class="list-group-item disabled">Examples</li>
                <li class="list-group-item">
                  youtube.com/results?search_query=
                </li>
                <li class="list-group-item">open.spotify.com/search/</li>
                <li class="list-group-item">www.google.com/search?q=</li>
              </ul>
            </transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Albums -->
    <transition name="upload">
      <div
        class="row position-relative"
        :class="engineRunning || downloading ? 'loadingrow' : 'loadedrow'"
        v-if="computedFiltered.length > 0"
      >
        <div class="col-12">
          <transition name="fade">
            <div id="spinner-wrapper" v-if="engineRunning || downloading">
              <div id="spinner"></div>
            </div>
          </transition>
          <table class="table">
            <thead>
              <tr>
                <th scope="col">Artist</th>
                <th scope="col">Album</th>
                <th scope="col">Year</th>
                <th scope="col">Id</th>
                <transition name="fade">
                  <th scope="col" v-if="displayAlbums">Cover</th>
                </transition>
                <transition name="fade">
                  <th scope="col" v-if="customSearchUrl">Search Link</th>
                </transition>
              </tr>
            </thead>
            <tbody class="table-group-divider align-middle">
              <template v-for="artist in computedFiltered" :key="artist.artist">
                <tr
                  v-for="album in artist"
                  :key="album.id"
                  class="mt-3"
                  :class="{ collected: album.collected }"
                >
                  <td>
                    {{ snippedArtist(album?.title) }}
                  </td>
                  <td>
                    {{ snippedAlbum(album?.title) }}
                  </td>
                  <td>
                    {{ album.year }}
                  </td>
                  <td>
                    <a
                      :href="
                        'https://www.discogs.com/master/' + album.master_id
                      "
                      target="_blank"
                      >{{ album.id }}</a
                    >
                  </td>
                  <transition name="fade">
                    <td v-if="displayAlbums">
                      <a
                        :href="
                          'https://www.discogs.com/master/' + album.master_id
                        "
                        target="_blank"
                      >
                        <img :src="album.thumb" alt="" class="album" />
                      </a>
                    </td>
                  </transition>
                  <transition name="fade">
                    <td v-if="customSearchUrl.length > 0">
                      <a
                        :href="
                          '//' +
                          customSearchUrl +
                          snippedArtist(album?.title).replace(/ /g, '+') +
                          '+' +
                          snippedAlbum(album?.title).replace(/ /g, '+')
                        "
                        target="_blank"
                        class="btn btn-sm btn-secondary"
                        >Find It!</a
                      >
                    </td>
                  </transition>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </transition>

    <!-- FAQ Modal -->
    <div
      class="modal fade"
      id="faqmodal"
      tabindex="-1"
      aria-labelledby="faqmodalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="faqmodalLabel">FAQ</h1>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <p>
              You will need to upload a .csv file with the columns
              <strong>Artist</strong> and <strong>Album</strong>
            </p>
            <table
              class="table table-sm table-bordered table-responsive caption-top"
            >
              <caption>
                Example
              </caption>
              <thead>
                <th scope="col">Artist</th>
                <th scope="col">Album</th>
                <th scope="col" style="width: 4em"></th>
              </thead>
              <tbody>
                <tr>
                  <td>Interpol</td>
                  <td>Turn on the Bright Lights</td>
                  <td></td>
                </tr>
                <tr>
                  <td>Have A Nice Life</td>
                  <td>Deathconsciousness</td>
                  <td></td>
                </tr>
                <tr>
                  <td>Bruce Springsteen</td>
                  <td>Nebraska</td>
                  <td></td>
                </tr>
                <tr>
                  <td>&nbsp;</td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
            <p>
              If you are using MusicBee (you should) and you have a large
              collection, you can use several tools. First is the
              <a
                href="https://www.getmusicbee.com/addons/plugins/49/additional-tagging-amp-reporting-tools/"
                target="_blank"
                >Additional Tagging & Reporting Tools Plugin</a
              >. By using the Library Report feature, you can easily export a
              .csv of all the artists and all the albums you have.
              <br />
              If you want to narrow this down to only artists that you actually
              listen to, you can use the custom display fields to show many
              plays the artist has. Use the formula
              <span class="font-monospace">{{ musicBeeFormula }}</span> to see
              how many plays per artist you have.
            </p>
          </div>
        </div>
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

.album {
  height: 125px;
  width: 125px;
}

.loggybox {
  max-height: 300px;
  overflow-y: auto;
}

.loadingrow {
  height: 30rem;
  overflow-y: hidden;
}

.loadedrow {
  height: 50rem;
  overflow-y: auto;
}

#spinner-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  background-color: rgb(255, 255, 255);
  --mask: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 1) 0,
      rgba(0, 0, 0, 1) 40%,
      rgba(0, 0, 0, 0) 100%,
      rgba(0, 0, 0, 0) 0
    )
    100% 50% / 100% 100% repeat-x;

  -webkit-mask: var(--mask);
  mask: var(--mask);
}
#spinner {
  display: block;
  position: relative;
  left: 50%;
  top: 150px;
  width: 100px;
  height: 100px;
  margin: -50px 0 0 -50px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #0d6efd;
  -webkit-animation: spin 2s linear infinite;
  animation: spin 2s linear infinite;
}

#spinner:before {
  content: "";
  position: absolute;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #198754;
  -webkit-animation: spin 3s linear infinite;
  animation: spin 3s linear infinite;
}

#spinner:after {
  content: "";
  position: absolute;
  top: 15px;
  left: 15px;
  right: 15px;
  bottom: 15px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #dc3545;
  -webkit-animation: spin 1.5s linear infinite;
  animation: spin 1.5s linear infinite;
}

@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

.popover {
  z-index: 1070;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.7s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.right-enter-active {
  transition: all 0.3s ease-out;
}

.right-leave-active {
  transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
}

.right-enter-from,
.right-leave-to {
  transform: translateX(50px);
  opacity: 0;
}

.upload-enter-active {
  transition: all 1.5s ease-out;
}

.upload-leave-active {
  transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
}

.upload-enter-from,
.upload-leave-to {
  transform: translateY(100px);
  opacity: 0;
}

.loggybox::-webkit-scrollbar {
  width: 20px;
}

.loggybox::-webkit-scrollbar-track {
  background-color: transparent;
}

.loggybox::-webkit-scrollbar-thumb {
  background-color: #d6dee1;
  border-radius: 20px;
  border: 6px solid transparent;
  background-clip: content-box;
}
.loggybox::-webkit-scrollbar-thumb:hover {
  background-color: #a8bbbf;
}
.loggybox::-webkit-scrollbar-corner {
  background: rgba(0, 0, 0, 0);
}
</style>

<script>
import axios from "axios";
import Papa from "papaparse";

export default {
  data: function () {
    return {
      customSearchUrl: "",
      downloadedArtists: [],
      downloading: false,
      displayAlbums: true,
      displayCollected: true,
      displayExamples: false,
      displayLogs: true,
      engineRunning: false,
      errors: [],
      errorsDiv: null,
      filteredYear: 1900,
      logs: [],
      logsDiv: null,
      musicBeeFormula: "$Sum(<play count>, <album artist>)",
      progress: 0,
      queryCount: 0,
      readyToDownloadInfo: false,
      searchInput: "",
      searchedArtists: [],
      uploadedFileName: "",
      uploadedAlbums: [],
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
  mounted() {
    this.logsDiv = document.getElementById("logs-div");
    this.errorsDiv = document.getElementById("errors-div");
  },
  methods: {
    snippedArtist(artistAlbumString) {
      return artistAlbumString?.split(" - ")[0];
    },
    snippedAlbum(artistAlbumString) {
      return artistAlbumString?.split(" - ")[1];
    },
    musicCollectionUpload(e) {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0],
          fileExtention = file.name.split(".").pop(),
          fileName = file.name.split(".").shift();
        this.uploadedFileName = fileName + "." + fileExtention;

        if (fileExtention === "csv") {
          Papa.parse(file, {
            skipEmptyLines: true,

            complete: function (results) {
              this.uploadedAlbums = results.data;
            }.bind(this),
          });
        }
      }
    },
    previousSearchUpload(e) {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0],
          fileExtention = file.name.split(".").pop(),
          fileName = file.name.split(".").shift();
        this.uploadedFileName = fileName + "." + fileExtention;

        if (fileExtention === "csv") {
          Papa.parse(file, {
            skipEmptyLines: true,
            header: true,
            complete: function (results) {
              this.downloadedArtists = [];
              var finalData = [{ albums: [] }];

              results.data?.forEach((album) => {
                let albumObj = {
                  title: `${album.artist} - ${album.album}`,
                  year: album.year,
                  master_id: album.master_id,
                  thumb: album.thumb,
                };
                finalData[0].albums.push(albumObj);
              });

              this.downloadedArtists = finalData;
            }.bind(this),
          });
        }
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
    startDownload() {
      this.engineRunning = true;
      this.downloadEngine();
    },
    downloadEngine: function () {
      if (this.queryCount < this.uploadedAlbums.length) {
        this.discogsQuery(this.uploadedAlbums[this.queryCount][0]);
        this.queryCount += 1;
        this.progress = Math.round(
          (100 * this.queryCount) / this.uploadedAlbums.length
        );
      } else {
        this.engineRunning = false;
        this.logs.push("Download Complete!");
        if (this.logs.length > 5) {
          this.scrolly(this.logsDiv);
          this.scrolly(this.errorsDiv);
        }
      }
    },
    scrolly(div) {
      setTimeout(function () {
        div.scrollTop = div.scrollHeight;
      }, 1050);
    },
    discogsQuery: function (artist) {
      this.searchInput = "";

      if (!this.duplicationCheck(artist)) {
        this.searchedArtists.push([artist, ""]);
        this.logs.push(`Downloading Info on '${artist}'...`);
        if (this.logs.length > 5) {
          this.scrolly(this.logsDiv);
        }

        if (this.engineRunning) {
          var self = this;
          setTimeout(function () {
            self.downloadEngine();
          }, 1300);
        }

        this.downloading = true;
        axios
          .get(
            `https://api.discogs.com/database/search?type=master&artist=${artist.replace(
              /\s/g,
              "+"
            )}&format=album&token=vwbBWENsiqyNVUgWWlunGyTKRxXHVSHJNHosZUyj`
          )
          .then((response) => {
            this.downloading = false;

            //check if it's unable to find anything
            if (response.data.results.length === 0) {
              this.errors.push({
                message: `Unable to find ${artist}`,
                artist: artist,
              });
              if (this.errors.length > 5) {
                this.scrolly(this.errorsDiv);
              }
              return;
            }

            //to avoid the wrong artist showing up, we make sure it's the one we search for
            var selectedAlbums = response.data.results.filter((album) => {
              if (
                this.snippedArtist(album.title).toUpperCase() ===
                artist.toUpperCase()
              ) {
                return album;
              }
            });

            //check if there's nothing there (i.e. it finds the artist but there are no albums, searching 'test' will do this.)
            if (selectedAlbums.length === 0) {
              this.errors.push({
                message: `Unable to find ${artist}`,
                artist: artist,
              });
              if (this.errors.length > 5) {
                this.scrolly(this.errorsDiv);
              }
              return;
            }

            //sort by release year
            var sortedAlbums = selectedAlbums.sort((a, b) => {
              return a.year > b.year ? 1 : -1;
            });

            //mark them collected if we uploaded them
            sortedAlbums.map((album) => {
              this.uploadedAlbums.forEach((upAlbum) => {
                if (
                  upAlbum[1].toUpperCase() ===
                  this.snippedAlbum(album.title).toUpperCase()
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
          })
          .catch((errors) => {
            this.downloading = false;
            this.errors.push({
              message: `ERROR! ${errors}`,
            });
            if (this.errors.length > 5) {
              this.scrolly(this.errorsDiv);
            }
          });
      } else {
        // already searched
        self = this;
        setTimeout(function () {
          self.downloadEngine();
        }, 200);
      }
    },
    downloadCSV() {
      var csv = [];
      this.computedFiltered.forEach((artist) => {
        artist.forEach((album) => {
          let row = {
            artist: this.snippedArtist(album.title),
            album: this.snippedAlbum(album.title),
            year: album.year,
            link: "https://www.discogs.com/master/" + album.master_id,
            master_id: album.master_id,
            thumb: album.thumb,
          };
          csv.push(row);
        });
      });
      var FileSaver = require("file-saver");
      var blob = new Blob([Papa.unparse(csv)], {
        type: "text/csv;charset=utf-8;",
      });
      FileSaver.saveAs(blob, "Album-Report.csv");
    },

    clearResults: function () {
      if (confirm("ARE YOU SURE!?")) {
        this.downloadedArtists = [];
        this.uploadedAlbums = [];
        this.searchedArtists = [];
        this.logs = [];
        this.errors = [];
        this.readyToDownloadInfo = false;
        this.searchInput = "";
        this.uploadedFileName = "";
        this.progress = 0;
      }
    },
  },
};
</script>
