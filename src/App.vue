<template>
  <div class="container text-center mt-5">
    <div class="row">
      <div class="col-2"></div>
      <div class="col submission-column">
        <div class="row mb-5">
          <div class="col-12">
            <h2>Upload a .csv File</h2>
            <h2>See What Albums You've Been Missing</h2>
            <button
              type="button"
              class="btn btn-sm btn-light mb-5"
              data-bs-toggle="modal"
              data-bs-target="#faqmodal"
            >
              What? I need help...
            </button>
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
        <div class="row mb-5">
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

        <transition name="upload">
          <div v-if="logs.length > 0" id="controls">
            <div class="row mb-3">
              <div class="col">
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
              <div class="col align-middle">
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
                  <span class="input-group-text" id="basic-addon1"
                    >Released Since</span
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

            <div class="row logs_and_errors mb-3">
              <div class="col-6 bg-light font-monospace">
                <div>Logs:</div>
                <div class="loggybox" id="logs-div">
                  <div v-for="(log, index) in logs" :key="index">
                    {{ log }}
                  </div>
                </div>
              </div>

              <div class="col-6 bg-dark text-danger font-monospace p-0">
                <div>Errors:</div>
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

            <div class="row mb-5">
              <div class="col">
                <button
                  class="btn btn-danger"
                  type="button"
                  @click="clearResults"
                >
                  Clear Results
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <div class="col-2"></div>
    </div>
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
                      <img :src="album.thumb" alt="" />
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

img {
  height: 125px;
  width: 125px;
}

.loggybox {
  height: 300px;
  overflow-y: scroll;
}

.upload-enter-active {
  transition: all 0.3s ease-out;
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
              this.errors.push({
                message: `Unable to find ${artist}`,
                artist: artist,
              });
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
      if (confirm("ARE YOU SURE!?")) {
        this.downloadedArtists = [];
        this.uploadedAlbums = [];
        this.searchedArtists = [];
        this.logs = [];
        this.errors = [];
      }
    },
  },
};
</script>
