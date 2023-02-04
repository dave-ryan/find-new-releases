<template>
  <div class="">
    <button @click="testquery" class="btn btn-primary">Click Me!</button>
    <div>
      {{ output }}
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
export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  data: function () {
    return { ouput: "test" };
  },
  methods: {
    testquery: function () {
      axios
        .get("https://api.discogs.com/artists/1/releases?page=2&per_page=75")
        .then((response) => {
          this.output = response.data;
          console.log(response);
        });
    },
  },
};
</script>
