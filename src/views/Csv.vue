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
                v-focus
              />
            </form>
            <button class="btn btn-sm btn-danger m-1" @click="clear">
              clear
            </button>
            <div class="font-monospace mt-3">{{ uploadedFileName }}</div>
          </div>
        </div>
      </div>

      <div class="col-2"></div>
    </div>

    <div class="row mt-5">
      <div class="col-12">
        <table class="table table-bordered table-hover">
          <thead>
            <tr>
              <th scope="col" v-for="header in csvheaders" :key="header">
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody class="table-group-divider">
            <tr
              v-for="(row, index) in csvdata"
              :key="row.ExternalId"
              class="mt-3"
            >
              <td>
                <!-- <clicktoedit :value="row.FirstName" /> -->
                <input
                  v-if="this.editing === `${index}, FirstName`"
                  v-model="row.FirstName"
                  type="text"
                  @blur="editing = false"
                  @keyup.enter="editing = false"
                  v-focus
                />
                <div
                  v-if="this.editing !== `${index}, FirstName`"
                  @click="this.editing = `${index}, FirstName`"
                >
                  {{ row.FirstName }}
                </div>
              </td>
              <td>
                {{ row.LastName }}
              </td>
              <td>
                {{ row.Email }}
              </td>
              <td>
                {{ row.ExternalId }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
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
      editing: [],
    };
  },
  computed: {},
  methods: {
    qtest() {
      console.log(this.editing);
      console.log(JSON.parse(JSON.stringify(this.editing)));
      console.log([0, "FirstName"]);
      if (JSON.parse(JSON.stringify(this.editing)) === [0, "FirstName"]) {
        console.log("wow");
      }
    },
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
    isFileTypeValid(fileExtention) {
      if (this.accept.split(",").includes(fileExtention)) {
        console.log("File type is valid");
      } else {
        this.errors.push(`File type should be ${this.accept}`);
      }
    },
  },
  directives: {
    focus: {
      inserted(el) {
        el.focus();
        console.log(el);
      },
    },
  },
};
</script>
