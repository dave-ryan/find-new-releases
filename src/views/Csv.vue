<template>
  <div class="container text-center mt-5">
    <div class="row">
      <div class="col submission-column">
        <div>
          <button
            type="button"
            class="btn btn-lg btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#upload-modal"
            @click="this.uploadstatus = 1"
          >
            Begin Upload
          </button>
        </div>
      </div>
    </div>

    <!--  Modal -->
    <div
      class="modal fade modal-xl"
      id="upload-modal"
      tabindex="-1"
      aria-labelledby="modalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h2
              class="modal-title"
              id="modalLabel"
              v-if="uploadedFileName.length > 0 && this.uploadstatus === 1"
            >
              File Uploaded:
              <span class="font-monospace"> {{ uploadedFileName }}</span>
            </h2>
            <h2 v-if="this.uploadstatus === 2">Header Mappings</h2>
            <h2 v-if="this.uploadstatus === 3">Data Manipulation</h2>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              @click="clear"
            ></button>
          </div>
          <div class="modal-body">
            <!-- UPLOAD START -->
            <div v-if="uploadstatus === 1">
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
            </div>

            <!-- HEADER MAPPING -->
            <div v-if="uploadstatus === 2" class="row">
              <div class="col-5">
                <div v-for="header in rawheaders" :key="header" class="m-2">
                  <button class="btn btn-secondary" disabled>
                    {{ header }}
                  </button>
                </div>
              </div>
              <div class="col-2">
                <div v-for="header in rawheaders" :key="header" class="m-3">
                  <i class="bi bi-arrow-right-circle-fill m-1"></i>
                </div>
              </div>
              <div class="col-5">
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

            <div v-if="uploadstatus === 3">
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
                      <input
                        v-if="this.editing === `${index}, LastName`"
                        v-model="row.LastName"
                        type="text"
                        @blur="editing = false"
                        @keyup.enter="editing = false"
                        v-focus
                      />
                      <div
                        v-if="this.editing !== `${index}, LastName`"
                        @click="this.editing = `${index}, LastName`"
                      >
                        {{ row.LastName }}
                      </div>
                    </td>
                    <td>
                      <input
                        v-if="this.editing === `${index}, Email`"
                        v-model="row.Email"
                        type="text"
                        @blur="editing = false"
                        @keyup.enter="editing = false"
                        v-focus
                      />
                      <div
                        v-if="this.editing !== `${index}, Email`"
                        @click="this.editing = `${index}, Email`"
                      >
                        {{ row.Email }}
                      </div>
                    </td>
                    <td>
                      <input
                        v-if="this.editing === `${index}, ExternalId`"
                        v-model="row.ExternalId"
                        type="text"
                        @blur="editing = false"
                        @keyup.enter="editing = false"
                        v-focus
                      />
                      <div
                        v-if="this.editing !== `${index}, ExternalId`"
                        @click="this.editing = `${index}, ExternalId`"
                      >
                        {{ row.ExternalId }}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-outline-danger"
              v-if="this.uploadstatus > 1"
              @click="this.uploadstatus -= 1"
            >
              Previous
            </button>
            <button
              type="button"
              class="btn btn-outline-success"
              v-if="rawdata.length > 0 && this.uploadstatus < 3"
              @click="this.uploadstatus += 1"
            >
              Next
            </button>
            <a
              href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              target="_blank"
            >
              <button
                type="button"
                class="btn btn-success"
                v-if="this.uploadstatus === 3"
              >
                Complete Feed Upload!
              </button>
            </a>
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
      rawheaders: [],
      rawdata: [],
      uploadedFileName: "",
      editing: [],
      uploadstatus: 0,
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
      this.uploadstatus = 1;
      this.rawdata = [];
      this.rawheaders = [];
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
              this.csvheaders = results.meta.fields;
              this.csvdata = results.data;
              this.rawheaders = results.meta.fields;
              this.rawdata = results.data;

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
