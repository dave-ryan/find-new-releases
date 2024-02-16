<template>
  <div class="container text-center mt-5">
    <!-- Info/Tools -->
    <div class="row">
      <div class="col-2"></div>
      <div class="col">
        <div class="row">
          <div class="col-12">
            <transition name="right">
              <div v-if="!downloadStarted">
                <h2>
                  Upload A
                  <router-link to="/csv" class="text-dark">.csv</router-link>
                  File Of Your Collection
                </h2>
                <h2>See What Albums You've Been Missing</h2>
                <button
                  type="button"
                  class="btn btn-sm btn-light"
                  data-bs-toggle="modal"
                  data-bs-target="#faqmodal"
                >
                  What? I need help...
                </button>
              </div>
            </transition>
          </div>
          <transition name="left">
            <div v-if="!downloadStarted">
              <form class="mt-4">
                <label for="csvUpload" class="btn btn-lg btn-outline-primary">
                  Upload MusicBee CSV
                </label>
                <input
                  type="file"
                  class="d-none input-group"
                  @change="musicCollectionUpload($event)"
                  accept=".csv"
                  id="csvUpload"
                />
              </form>
              <div class="font-monospace">{{ uploadedFileName }}</div>
            </div>
          </transition>

          <transition name="right">
            <div v-if="readyToDownloadInfo && !downloadStarted">
              <button
                class="btn btn-primary btn-lg fw-bold mt-1"
                @click="startDownload()"
              >
                Begin Download
              </button>
            </div>
          </transition>
          <transition name="right">
            <div v-if="!downloadStarted" class="mb-5"></div>
          </transition>
        </div>
        <div class="row">
          <div class="col-12">
            <transition name="left">
              <form
                v-if="!downloadStarted"
                @submit.prevent="discogsQuery(query.toLowerCase())"
              >
                <div class="input-group">
                  <span class="input-group-text">Individual Artist Search</span>
                  <input
                    type="text"
                    v-model="query"
                    class="form-control"
                    id="queryinput"
                    placeholder=""
                  />
                  <button class="btn btn-outline-primary" type="submit">
                    Search!
                  </button>
                </div>
              </form>
            </transition>
            <transition name="left">
              <div v-if="!downloadStarted">
                <form class="m-3">
                  <label
                    for="previousSearchUpload"
                    class="btn btn-outline-secondary"
                  >
                    Upload the results from previous search
                  </label>
                  <input
                    type="file"
                    class="d-none input-group"
                    @change="previousSearchUpload($event)"
                    accept=".csv"
                    id="previousSearchUpload"
                  />
                </form>
              </div>
            </transition>
          </div>
        </div>
      </div>
      <div class="col-2"></div>
    </div>

    <div class="row mb-3">
      <div class="col">
        <div class="form-check form-switch form-check-inline">
          <label class="form-check-label" for="logCheckbox">Display Logs</label>
          <input
            class="form-check-input"
            type="checkbox"
            role="switch"
            id="logCheckbox"
            v-model="displayLogs"
          />
        </div>
      </div>
      <div class="col">
        <div class="form-check form-switch form-check-inline">
          <label class="form-check-label" for="albumcheckbox">Album Art</label>
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
      <div class="col">
        <div class="input-group-sm input-group">
          <span class="input-group-text" id="basic-addon1">Released Since</span>
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

    <transition name="right">
      <div v-if="displayLogs" class="row logs_and_errors mb-3">
        <div class="col-6 bg-light font-monospace p-1 rounded-start">
          <div class="border-bottom border-dark">Logs:</div>
          <div class="loggybox" id="logs-div">
            <div v-for="(log, index) in logs" :key="index">
              {{ log }}
            </div>
          </div>
        </div>

        <div class="col-6 bg-dark text-danger font-monospace p-1 rounded-end">
          <div class="border-bottom border-light">Errors:</div>
          <div class="loggybox p-0" id="errors-div">
            <div v-for="(error, index) in errors" :key="index">
              {{ error.message }}
              <a
                :href="`https://www.discogs.com/search/?q=${error.artist.replace(
                  /\s/g,
                  '+'
                )}&type=all`"
                target="_blank"
                v-if="error.artist"
                >(manual search)
              </a>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="upload">
      <div v-if="computedFiltered.length > 0" class="row mb-5">
        <div class="col">
          <button class="btn btn-success" type="button" @click="downloadCSV">
            Download Results
          </button>
        </div>
        <div class="col">
          <button class="btn btn-danger" type="button" @click="clearResults">
            Clear Results
          </button>
        </div>
      </div>
    </transition>
    <div class="row mb-5" v-if="downloadComplete && downloadStarted">
      <div class="col">
        <form @submit.prevent="discogsQuery(query.toLowerCase())">
          <div class="input-group">
            <span class="input-group-text">Individual Artist Search</span>
            <input
              type="text"
              v-model="query"
              class="form-control"
              id="queryinput"
              placeholder=""
            />
            <button class="btn btn-outline-primary" type="submit">
              Search!
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Albums -->
    <transition name="upload">
      <div class="row" v-if="computedFiltered.length > 0">
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
                  <td>
                    <a
                      :href="
                        'https://www.discogs.com/master/' + album.master_id
                      "
                      target="_blank"
                      >{{ album.id }}</a
                    >
                  </td>
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
              <strong>Artist</strong> and <strong>Album</strong>. You don't have
              to use a header but you can if you want to.
            </p>
            <p>
              If you are using MusicBee (you should) and you have a large
              collection, you can use several tools. First is the
              <a
                href="https://www.getmusicbee.com/addons/plugins/49/additional-tagging-amp-reporting-tools/"
                target="_blank"
                >Additional Tagging & Reporting Tools Plugin</a
              >. By using the Library Report feature, you can easily export a
              .csv of all the artists and all the albums you have. If you want
              to narrow this down to only artists that you actually listen to,
              you can use the custom display fields to show many plays the
              artist has. Use the formula
              <span class="font-monospace">{{ musicBeeFormula }}</span> to see
              how many plays per artist you have.
            </p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Close
            </button>
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
  height: 300px;
  overflow-y: auto;
}

.left-enter-active {
  transition: all 0.3s ease-out;
}

.left-leave-active {
  transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
}

.left-enter-from,
.left-leave-to {
  transform: translateX(-50px);
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
      query: "",
      errors: [],
      errorsDiv: null,
      logs: [],
      logsDiv: null,
      downloadedArtists: [],
      searchedArtists: [],
      uploadedFileName: "",
      uploadedAlbums: [],
      downloadStarted: false,
      downloadComplete: false,
      displayAlbums: true,
      displayCollected: true,
      displayLogs: false,
      readyToDownloadInfo: false,
      queryCount: 0,
      filteredYear: 1900,
      musicBeeFormula: "$Sum(<play count>, <album artist>)",
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
    musicCollectionUpload(e) {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0],
          fileSize = Math.round((file.size / 1024 / 1024) * 100) / 100,
          fileExtention = file.name.split(".").pop(),
          fileName = file.name.split(".").shift();
        this.uploadedFileName = fileName + "." + fileExtention;
        console.log(fileSize, fileExtention, fileName);

        if (fileExtention === "csv") {
          Papa.parse(file, {
            skipEmptyLines: true,

            complete: function (results) {
              this.uploadedAlbums = results.data;
              this.readyToDownloadInfo = true;
            }.bind(this),
          });
        }
      }
    },
    previousSearchUpload(e) {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0],
          fileSize = Math.round((file.size / 1024 / 1024) * 100) / 100,
          fileExtention = file.name.split(".").pop(),
          fileName = file.name.split(".").shift();
        this.uploadedFileName = fileName + "." + fileExtention;
        console.log(fileSize, fileExtention, fileName);

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
      this.downloadStarted = true;
      this.downloadComplete = false;
      this.downloadEngine();
    },
    downloadEngine: function () {
      if (this.queryCount < this.uploadedAlbums.length) {
        // console.log(this.queryCount, this.uploadedAlbums.length);
        this.discogsQuery(this.uploadedAlbums[this.queryCount][0]);
        this.queryCount += 1;
      } else {
        this.logs.push("Download Complete!");
        if (this.logs.length > 5) {
          this.scrolly(this.logsDiv);
        }
        this.downloadComplete = true;
        console.log("Uploaded Albums:", this.uploadedAlbums);
        console.log("Downloaded Albums:", this.downloadedArtists);
        // this.logsDiv.scrollIntoView(false);
      }
    },
    scrolly(div) {
      setTimeout(function () {
        div.scrollTop = div.scrollHeight;
      }, 1050);
    },
    discogsQuery: function (artist) {
      this.logsDiv = document.getElementById("logs-div");
      this.errorsDiv = document.getElementById("errors-div");
      if (!this.duplicationCheck(artist)) {
        this.searchedArtists.push([artist, ""]);
        this.logs.push(`Downloading Info on '${artist}'...`);
        if (this.logs.length > 5) {
          this.scrolly(this.logsDiv);
        }

        var self = this;
        setTimeout(function () {
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
                album.title.split(" - ")[0].toUpperCase() ===
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
            if (this.errors.length > 5) {
              this.scrolly(this.errorsDiv);
            }
          });
      } else {
        // console.log("dupe detected, and ignored");
        self = this;
        setTimeout(function () {
          // console.log("Executed after 1 second");
          self.downloadEngine();
        }, 200);
      }
    },
    downloadCSV() {
      var csv = [];
      this.computedFiltered.forEach((artist) => {
        console.log("?", artist);
        artist.forEach((album) => {
          let row = {
            artist: album.title.split(" - ")[0],
            album: album.title.split(" - ")[1],
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
        this.downloadStarted = false;
        this.downloadComplete = false;
      }
    },
  },
};
</script>
