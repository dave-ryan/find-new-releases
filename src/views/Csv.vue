<template>
  <div class="container text-center mt-5">
    <div class="row">
      <div class="col-2"></div>
      <div class="col submission-column">
        <div class="row">
          <div class="col-12">
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
              <div>{{ csvdata }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-2"></div>
    </div>

    <div class="row mt-5">
      <div class="col-12">
        <h1>Headers</h1>
        <div v-for="header in csvheaders" :key="header">
          <div class="dropdown m-2">
            <button
              class="btn btn-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {{ header }}
            </button>
            <ul class="dropdown-menu">
              <li v-for="trueheader in trueheaders" :key="trueheader">
                <div
                  class="dropdown-item"
                  @click="headerchange(trueheader, header)"
                >
                  {{ trueheader }}
                </div>
              </li>
            </ul>
            <i
              v-if="this.trueheaders.includes(header)"
              class="bi bi-check-circle-fill text-success ms-2"
            ></i>
            <i
              v-if="!this.trueheaders.includes(header)"
              class="bi bi-x-circle-fill text-danger ms-2"
            ></i>
          </div>
        </div>
      </div>
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
    <!--  Modal -->
    <div
      class="modal fade"
      id="modal"
      tabindex="-1"
      aria-labelledby="modalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="modalLabel">Title</h1>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body"></div>
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
      trueheaders: ["FirstName", "LastName", "Email", "ExternalId"],
      csvheaders: [],
      csvdata: [],
      rawdata: [],
      uploadedFileName: "",
      editing: [],
    };
  },
  computed: {},
  methods: {
    qtest() {
      console.log("wow");
    },
    headerchange(newheader, oldheader) {
      var newdata = [];
      this.csvdata.forEach((row) => {
        var newObject = {};
        for (let key in row) {
          if (key === oldheader) {
            newObject[newheader] = row[key];
          } else {
            newObject[key] = row[key];
          }
        }
        console.log(row, newObject);
        newdata.push(newObject);
      });

      this.csvdata = newdata;

      console.log("all done", this.csvdata);

      this.csvheaders = this.csvheaders.map((header) => {
        if (header === oldheader) {
          return newheader;
        } else {
          return header;
        }
      });
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
              this.rawdata = results.data;

              console.log(results);

              document.getElementById("modal").classList.remove("hidden");

              console.log(document.getElementById("modal"));
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
