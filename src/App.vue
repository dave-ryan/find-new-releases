<template>
  <div class="">
    <div class="row">
      <div class="col-2"></div>
      <div class="col submission-column">
        <form @submit.prevent="testQuery">
          <div class="input-group mb-3">
            <div class="input-group-prepend">
              <span class="input-group-text">Artist Search</span>
            </div>
            <input
              type="text"
              v-model="query"
              class="form-control"
              id="queryinput"
              placeholder="example: interpol"
            />
            <div class="input-group-apend">
              <button class="btn btn-primary" type="submit">Search!</button>
            </div>
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
// import fs from "fs";

export default {
  data: function () {
    return { albums: [], query: "", errors: [] };
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
        console.log(file);
        // fs.createReadStream(file)
        //   .pipe(csvparser())
        //   .on("data", function (data) {
        //     try {
        //       console.log("Name is: " + data.NAME);
        //       console.log("Age is: " + data.AGE);

        //       //perform the operation
        //     } catch (err) {
        //       //error handler
        //     }
        //   })
        //   .on("end", function () {
        //     //some final operation
        //   });
        var reader = new FileReader();
        reader.onload = (e) => {
          var results = e.target.result.split(/\r?\n/);
          console.log(results);
          console.log(results[0]);
          console.log(results[0].split(",")[0]);
          this.query = results[0].split(",")[0];
          this.testQuery();
          // console.log(JSON.parse(e.target.result));
        };

        reader.readAsText(file);

        // var reader = fs.createReadStream(file, {
        //   flag: "a+",
        //   encoding: "UTF-8",
        //   start: 5,
        //   end: 64,
        //   highWaterMark: 16,
        // });

        // // Read and display the file data on console
        // reader.on("data", function (chunk) {
        //   console.log(chunk);
        // });
      }
    },
    isFileTypeValid(fileExtention) {
      if (this.accept.split(",").includes(fileExtention)) {
        console.log("File type is valid");
      } else {
        this.errors.push(`File type should be ${this.accept}`);
      }
    },
    testQuery: function () {
      axios
        .get(
          `https://api.discogs.com/database/search?type=master&artist=${this.query.replace(
            /\s/g,
            "+"
          )}&format=album&token=vwbBWENsiqyNVUgWWlunGyTKRxXHVSHJNHosZUyj`,
          {
            // headers: {
            //   "user-agent":
            //     "FindMissingAlbums/1.0 +http://www.findyouralbums.com",
            // },
          }
        )
        .then((response) => {
          this.albums = response.data.results.filter((release) =>
            release.title.toLowerCase().includes(this.query.toLowerCase())
          );
          this.albums = this.albums.sort((a, b) => {
            return parseInt(a.year) > parseInt(b.year) ? 1 : -1;
          });
          console.log(response);
        });
    },
  },
};
</script>
