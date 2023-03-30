<template>
  <div class="container text-center mt-5">
    <div class="row">
      <div class="col-2"></div>
      <div class="col submission-column">
        <div class="row">
          <div class="col-12"></div>
          <div>
            <form class="mt-4">
              <label for="csvUpload" class="btn btn-lg btn-outline-primary">
                Upload CSV
              </label>
              <input
                type="file"
                class="d-none input-group"
                @change="handleFileChange($event)"
                accept=".csv"
                id="csvUpload"
              />
            </form>
            <button class="btn btn-sm btn-danger m-1" @click="clear">
              clear
            </button>
            <div class="font-monospace">{{ uploadedFileName }}</div>
          </div>
        </div>
      </div>

      <div class="col-2"></div>
    </div>

    <transition name="upload">
      <div class="row">
        <div class="col-12">
          <table class="table">
            <thead>
              <tr>
                <th scope="col" v-for="header in csvheaders" :key="header">
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody class="table-group-divider">
              <tr v-for="row in csvdata" :key="row.ExternalId" class="mt-3">
                <td v-for="datacell in row" :key="datacell">
                  {{ datacell }}
                </td>
              </tr>
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
              artist has. Use the formula how many plays per artist you have.
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

<style></style>

<script>
import Papa from "papaparse";
// import { saveAs } from "file-saver";

export default {
  data: function () {
    return {
      csvheaders: [],
      csvdata: [],
      uploadedFileName: "",
    };
  },
  computed: {},
  methods: {
    clear() {
      this.csvdata = [];
      this.csvheaders = [];
      this.uploadedFileName = "";
    },
    handleFileChange(e) {
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
              this.csvdata = results.data;
              this.csvheaders = results.meta.fields;
              console.log(results);
            }.bind(this),
          });
        }
      }
    },
    updateJSON(event) {
      let str = event.target.result;
      let json = JSON.parse(str);
      // console.log("string", str);
      // console.log("json", json);
      this.downloadedArtists = json;
    },
    isFileTypeValid(fileExtention) {
      if (this.accept.split(",").includes(fileExtention)) {
        console.log("File type is valid");
      } else {
        this.errors.push(`File type should be ${this.accept}`);
      }
    },
  },
};
</script>
