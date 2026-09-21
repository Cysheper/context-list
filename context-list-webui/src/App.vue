<script setup>
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import ListPage from './components/ListPage.vue'
import ContextPage from './components/ContextPage.vue'
import AppIcon from './components/AppIcon.vue'
import { articles } from './content/news'
const NewsPage = defineAsyncComponent(() => import('./components/NewsPage.vue'))
const newsView = computed(() => route.value === '#/news' || route.value.startsWith('#/news/'))
const articleId = computed(() => route.value.startsWith('#/news/') ? route.value.slice(7) : null)
const contests = ref([])
const loading = ref(true)
const error = ref('')
const route = ref(location.hash)
const storageWarning = ref(false)
const toast = ref('')
let toastTimer
function readBookmarks() {
  try { const ids = JSON.parse(localStorage.getItem('contest-bookmarks') || '[]'); return Array.isArray(ids) ? ids.filter(id => typeof id === 'string') : [] }
  catch { return [] }
}
const bookmarks = ref(readBookmarks())
const selectedId = computed(() => route.value.startsWith('#/contest/') ? route.value.slice(10) : null)
const selected = computed(() => contests.value.find(c => c.id === selectedId.value))
const savedView = computed(() => route.value === '#/saved')
function changeRoute() { route.value = location.hash; window.scrollTo({ top: 0 }); }
function focusContent() { document.getElementById('main')?.focus() }
function toggleBookmark(id) {
  const exists = bookmarks.value.includes(id)
  bookmarks.value = exists ? bookmarks.value.filter(x => x !== id) : [...bookmarks.value, id]
  try { localStorage.setItem('contest-bookmarks', JSON.stringify(bookmarks.value)) } catch { storageWarning.value = true }
  toast.value = exists ? '已取消收藏' : '已收藏，可在“我的收藏”中查看'
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2600)
}
async function load() {
  loading.value = true; error.value = ''
  try {
    const response = await fetch('/api/get_all_contexts', { signal: AbortSignal.timeout(10000) })
    if (!response.ok) throw new Error('无法读取比赛数据')
    const data = await response.json()
    if (!Array.isArray(data) || data.some(c => !c.id || !c.name)) throw new Error('比赛数据格式不正确')
    contests.value = data
  } catch { error.value = '暂时无法获取比赛，请确认后端服务已启动后重试。' }
  finally { loading.value = false }
}
watch([route, selected], () => {
  if (newsView.value) {
    const article = articles.find(item => item.id === articleId.value)
    document.title = articleId.value ? `${article?.title || '文章未找到'} · 赛事新闻` : '赛事新闻 · 竞赛日历'
  } else {
    document.title = selected.value ? `${selected.value.name} · 竞赛日历` : '竞赛日历 · 找到你的下一场比赛'
  }
}, { immediate: true })
onMounted(() => { load(); window.addEventListener('hashchange', changeRoute) })
onUnmounted(() => { window.removeEventListener('hashchange', changeRoute); clearTimeout(toastTimer) })
</script>

<template>
  <a class="skip-link" href="#main" @click.prevent="focusContent">跳转至内容</a>
  <header class="site-header">
    <div class="header-inner">
      <a href="#/" class="brand"><span class="brand-icon"><AppIcon name="calendar" :size="23" /></span><span>竞赛日历<small>CONTEST CALENDAR</small></span></a>
      <nav aria-label="主导航"><a href="#/" :class="{ active: !savedView && !newsView }">发现比赛</a><a href="#/news" :class="{ active: newsView }">赛事新闻</a><a href="#/saved" :class="{ active: savedView }">我的收藏 <span class="nav-count">{{ bookmarks.length }}</span></a></nav>
      <span class="header-note"><span class="dot"></span> 为每一次出发做好准备</span>
    </div>
  </header>
  <div class="demo-bar"><AppIcon name="info" :size="15" /><span>当前为演示预览 · 赛事数据为虚构示例 · 列表状态基准：2026.09.20 · 月历使用实际日期（北京时间）</span></div>
  <main id="main" class="shell" tabindex="-1">
    <NewsPage v-if="newsView" :article-id="articleId" />
    <div v-else-if="loading" class="state-panel" role="status"><span class="loader"></span><h2>正在读取比赛</h2><p>下一场挑战，即将出现。</p></div>
    <div v-else-if="error" class="state-panel" role="alert"><AppIcon name="info" :size="32" /><h2>比赛信息暂未加载</h2><p>{{ error }}</p><button class="button primary" @click="load">重新加载</button></div>
    <template v-else-if="selectedId">
      <ContextPage v-if="selected" :contest="selected" :saved="bookmarks.includes(selected.id)" @bookmark="toggleBookmark(selected.id)" />
      <div v-else class="state-panel"><h2>没有找到这场比赛</h2><p>链接可能有误，回到列表看看其他比赛吧。</p><a class="button primary" href="#/">返回比赛列表</a></div>
    </template>
    <ListPage v-else :contests="contests" :bookmarks="bookmarks" :saved-view="savedView" @bookmark="toggleBookmark" />
    <p v-if="storageWarning" role="status" class="storage-warning">浏览器无法保存收藏，当前收藏仅在本次打开期间有效。</p>
  </main>
  <footer class="site-footer"><span>竞赛日历 <span class="footer-separator">/</span> 让热爱，有迹可循。</span><span>演示版本 · 实际安排请以官方通知为准</span></footer>
  <div class="toast" role="status" aria-live="polite"><template v-if="toast"><AppIcon name="check" :size="17" />{{ toast }}</template></div>
</template>
