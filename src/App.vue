<script>


import home from "./components/home.vue"
import addSurvey from "./components/addSurvey.vue";
import showSurvey from "./components/showSurvey.vue";

const routes = {
  '/': home,
  '/addSurvey': addSurvey,
  '/showSurvey': showSurvey,
  
}

export default {
  data() {
    return {
      currentPath: window.location.hash
    }
  },
  computed: {
    currentView() {
      let path = this.currentPath.slice(1) || '/'
      if (path.indexOf("?") != -1) {
        path = path.slice(0, path.indexOf("?")) || "/"

      }
      console.log(path, ": path")
      return routes[path] || NotFound
    }
  },
  mounted() {
    window.addEventListener('hashchange', () => {
		  this.currentPath = window.location.hash
		})
  }
}

</script>

<template>
  <component :is="currentView" />
</template>

