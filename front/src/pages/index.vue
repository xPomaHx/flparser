<template>
  <div class="bro-container">
    <nav>
      <a href="http://192.168.1.35:9998/rescan">rescan</a>
    </nav>
    <ul>
      <li v-for="post in postsWithoutViewed" :key="post.url">
        <table>
          <tbody>
            <tr v-for="(value, name, index) in post.contacts" :key="index">
              <td>{{name}}</td>
              <td>{{value}}</td>
            </tr>
          </tbody>
        </table>
        <h3>
          <a :href="post.url">{{post.title}}</a>
        </h3>
        <button @click="handlerRemovePost(post)">remove</button>
        <div class="p" v-html="post.content"></div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      posts: [],
      viewedUrls: {}
    }
  },
  async asyncData() {
    let posts = await fetch('http://192.168.1.35:9997/api/posts').then(_ =>
      _.json()
    )
    return {
      posts
    }
  },
  computed: {
    postsWithoutViewed() {
      return this.posts
        .filter(({ url }) => !this.viewedUrls[url])
        .map(post => {
          let { skype, telegram, email, phone, vk } = post
          post.contacts = {
            skype,
            telegram,
            email,
            phone,
            vk
          }
          return post
        })
    }
  },
  created() {
    if (!process.browser) return
    if (localStorage.viewedUrls) {
      let urls = JSON.parse(localStorage.viewedUrls)
      this.viewedUrls = urls.reduce((el, next) => {
        el[next] = true
        return el
      }, {})
    }
  },
  methods: {
    handlerRemovePost(post) {
      if (localStorage.viewedUrls) {
        let urls = JSON.parse(localStorage.viewedUrls)
        this.viewedUrls = urls.reduce((el, next) => {
          el[next] = true
          return el
        }, {})
      }
      this.$set(this.viewedUrls, post.url, true)
      localStorage.viewedUrls = JSON.stringify(Object.keys(this.viewedUrls))
    }
  }
}
</script>

<style>
.bro-container {
  width: 60%;
  margin: auto;
  color: #222;
}
.p {
  font-size: 16px;
  line-height: 1.56;
  font-family: '-apple-system', BlinkMacSystemFont, Arial, sans-serif;
}
a {
  color: #464646;
  text-decoration: none;
}
li {
  border-bottom: 1px solid #d4dddf;
  margin: 30px 0;
}
a:hover {
  color: #548eaa;
}
</style>
