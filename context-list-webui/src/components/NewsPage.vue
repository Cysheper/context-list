<script setup>
import { computed, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import MarkdownContent from './MarkdownContent.vue'
import { articles, loadArticle } from '../content/news'
import { date } from '../lib/contests'

const props = defineProps({ articleId: { type: String, default: null } })
const query = ref('')
const category = ref('全部资讯')
const categories = ['全部资讯', '获奖喜报', '赛事回顾', '备赛动态']
const article = computed(() => articles.find(item => item.id === props.articleId))
const visible = computed(() => articles.filter(item =>
  (category.value === '全部资讯' || item.category === category.value) &&
  `${item.title} ${item.summary} ${item.series}`.toLowerCase().includes(query.value.trim().toLowerCase())))
const related = computed(() => articles.filter(item => item.id !== props.articleId).slice(0, 3))
const body = ref('')
const loading = ref(false)
const error = ref(false)
let requestVersion = 0
async function readArticle() {
  const version = ++requestVersion
  body.value = ''; error.value = false; loading.value = false
  if (!article.value) return
  loading.value = true
  try {
    const text = await loadArticle(article.value.id)
    if (version === requestVersion) body.value = text
  } catch { if (version === requestVersion) error.value = true }
  finally { if (version === requestVersion) loading.value = false }
}
watch(() => props.articleId, readArticle, { immediate: true })
function reset() { query.value = ''; category.value = '全部资讯' }
</script>

<template>
  <template v-if="!articleId">
    <section class="page-heading">
      <div><p class="eyebrow">STORIES FROM OUR CAMPUS</p><h1>记录每一份热爱与收获。</h1><p class="lead">获奖喜报、赛场瞬间与备赛故事，看见身边的竞赛力量。</p></div>
      <div class="heading-stat"><span>{{ articles.length.toString().padStart(2, '0') }}</span><div>篇校园赛事资讯<small>每一段经历，都值得记录</small></div></div>
    </section>
    <div class="news-layout">
      <section aria-label="新闻列表" class="news-list">
        <div class="list-controls"><div class="tabs" aria-label="新闻分类"><button v-for="item in categories" :key="item" :class="{ selected: category === item }" :aria-pressed="category === item" @click="category = item">{{ item }}</button></div><div class="search-row"><label class="search-input"><AppIcon name="search" :size="18" /><input v-model="query" type="search" aria-label="搜索新闻" placeholder="搜索标题、赛事或关键词…" /></label></div></div>
        <div class="list-caption"><span>共 {{ visible.length }} 篇资讯</span><span>按发布时间倒序</span></div>
        <div v-if="!visible.length" class="empty-state"><AppIcon name="search" :size="30" /><h3>没有找到相关资讯</h3><p>换个关键词，或看看其他分类。</p><button class="button" @click="reset">清除筛选</button></div>
        <article v-for="item in visible" :key="item.id" class="news-card">
          <a :href="`#/news/${item.id}`" class="news-cover" tabindex="-1" aria-hidden="true"><img :src="item.cover" alt="" width="960" height="480" loading="lazy" referrerpolicy="no-referrer" /><span>示意配图</span></a>
          <div class="news-card-body"><div class="row-tags"><span class="news-category" :class="{ honor: item.category === '获奖喜报' }">{{ item.category }}</span><span class="series-tag">{{ item.series }}</span><span class="demo-tag">演示资讯</span></div><h2><a :href="`#/news/${item.id}`">{{ item.title }}</a></h2><p class="news-summary">{{ item.summary }}</p><div class="news-card-footer"><span><time :datetime="item.publishedAt">{{ date(item.publishedAt) }}</time> · {{ item.author }}</span><a :href="`#/news/${item.id}`" :aria-label="`阅读：${item.title}`">阅读全文<AppIcon name="arrow" :size="14" /></a></div></div>
        </article>
        <p v-if="visible.length" class="list-end">已展示全部 {{ visible.length }} 篇资讯 · 让热爱，有迹可循</p>
      </section>
      <aside class="news-sidebar"><section class="news-intro"><span class="eyebrow">ON CAMPUS</span><AppIcon name="trophy" :size="32" /><h2>成绩之外，还有故事。</h2><p>记录奖项，也记录第一次参赛的勇气、并肩作战的队友，以及赛场之外的成长。</p><div class="news-category-count" v-for="item in categories.slice(1)" :key="item"><span>{{ item }}</span><strong>{{ articles.filter(a => a.category === item).length }} 篇</strong></div></section><section class="source-card"><h3><AppIcon name="info" :size="17" />关于本栏目</h3><p>当前为“示例大学”的演示文章，成绩与人物均为虚构；配图为插画，并非真实赛事照片。</p></section><a class="back-list" href="#/"><AppIcon name="calendar" :size="17" />查看近期比赛</a></aside>
    </div>
  </template>
  <template v-else-if="article">
    <div class="breadcrumb"><a href="#/news"><AppIcon name="back" :size="16" />赛事新闻</a><span>/</span><span>{{ article.category }}</span></div>
    <div class="news-layout article-layout">
      <article class="article-paper"><header class="article-header"><div class="row-tags"><span class="news-category" :class="{ honor: article.category === '获奖喜报' }">{{ article.category }}</span><span class="series-tag">{{ article.series }}</span><span class="demo-tag">演示资讯</span></div><h1>{{ article.title }}</h1><div class="article-meta"><span>{{ article.author }}</span><time :datetime="article.publishedAt">{{ date(article.publishedAt) }}</time></div><p class="article-summary">{{ article.summary }}</p></header>
        <div v-if="loading" class="article-loading" role="status"><span class="loader"></span><p>正在读取文章…</p></div>
        <div v-else-if="error" class="empty-state" role="alert"><h2>文章暂时无法加载</h2><p>请稍后重试。</p><button class="button" @click="readArticle">重新加载</button></div>
        <MarkdownContent v-else :source="body" />
        <footer class="article-footer"><span>— 感谢阅读 —</span><a href="#/news"><AppIcon name="back" :size="15" />返回赛事新闻</a></footer>
      </article>
      <aside class="news-sidebar"><section v-if="article.contestId" class="action-card"><span class="eyebrow">RELATED CONTEST</span><h2>文中赛事</h2><p class="related-contest-name">{{ article.contestName }}</p><a class="button primary full" :href="`#/contest/${article.contestId}`">查看比赛详情<AppIcon name="arrow" :size="16" /></a></section><section class="related-news"><h2>更多校园资讯</h2><a v-for="item in related" :key="item.id" :href="`#/news/${item.id}`"><span>{{ item.category }} · {{ date(item.publishedAt) }}</span><h3>{{ item.title }}</h3><AppIcon name="arrow" :size="15" /></a></section></aside>
    </div>
  </template>
  <div v-else class="state-panel"><AppIcon name="info" :size="32" /><h2>没有找到这篇文章</h2><p>链接可能有误，看看其他校园资讯吧。</p><a class="button primary" href="#/news">返回赛事新闻</a></div>
</template>
