<template>
  <div class="">
    <button class="btn btn-primary">Click Me!</button>
    <div>
      {{ output }}
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  data: function () {
    return { ouput: "" };
  },
  methods: {
    testquery: function () {},
  },
};
</script>
