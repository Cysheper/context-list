<script setup>
import { computed, ref } from 'vue'
import AppIcon from './AppIcon.vue'
import ContestCalendar from './ContestCalendar.vue'
import { phase, phaseLabels, registration, date, monthDay, countdown, sortContests, DEMO_NOW } from '../lib/contests'
const props = defineProps({ contests: Array, bookmarks: Array, savedView: Boolean })
defineEmits(['bookmark'])
const query = ref('')
const filter = ref('all')
const family = ref('all')
const families = computed(() => [...new Set(props.contests.map(c => c.series))])
const base = computed(() => props.savedView ? props.contests.filter(c => props.bookmarks.includes(c.id)) : props.contests)
const tabs = computed(() => [
  { id: 'all', label: '全部比赛', count: base.value.length },
  { id: 'upcoming', label: '即将开始', count: base.value.filter(c => ['upcoming', 'live'].includes(phase(c))).length },
  { id: 'open', label: '可报名', count: base.value.filter(c => registration(c) === '报名中').length },
  { id: 'ended', label: '往期回顾', count: base.value.filter(c => phase(c) === 'ended').length },
])
const visible = computed(() => base.value.filter(c => {
  const q = query.value.trim().toLowerCase()
  return (!q || `${c.name} ${c.series} ${c.introduction}`.toLowerCase().includes(q)) &&
    (family.value === 'all' || c.series === family.value) &&
    (filter.value === 'all' || filter.value === 'upcoming' && ['live', 'upcoming'].includes(phase(c)) || filter.value === 'open' && registration(c) === '报名中' || filter.value === 'ended' && phase(c) === 'ended')
}).sort(sortContests))
const deadlines = computed(() => props.contests.filter(c => registration(c) === '报名中' && c.registrationDeadline).sort((a, b) => new Date(a.registrationDeadline) - new Date(b.registrationDeadline)).slice(0, 3))
const upcomingCount = computed(() => props.contests.filter(c => ['live', 'upcoming'].includes(phase(c))).length)
function deadlineDays(c) { return Math.max(1, Math.ceil((new Date(c.registrationDeadline) - DEMO_NOW) / 86400000)) }
function reset() { query.value = ''; filter.value = 'all'; family.value = 'all' }
</script>

<template>
  <section class="page-heading">
    <div><p class="eyebrow">{{ savedView ? 'YOUR SHORTLIST' : 'CODE. COMPETE. GROW.' }}</p><h1>{{ savedView ? '我的收藏' : '下一场挑战，从这里开始。' }}</h1><p class="lead">{{ savedView ? '把感兴趣的比赛放在一起，按自己的节奏准备。' : '赛程、报名、校内选拔与比赛回顾，一处掌握。' }}</p></div>
    <div class="heading-stat"><span>{{ savedView ? bookmarks.length : upcomingCount.toString().padStart(2, '0') }}</span><div>{{ savedView ? '场比赛已收藏' : '场比赛即将开始' }}<small>{{ savedView ? '保存在当前浏览器' : '保持好奇，准备出发' }}</small></div></div>
  </section>
  <div class="list-layout">
    <section class="contest-section" aria-label="比赛列表">
      <div class="list-controls">
        <div class="tabs" aria-label="比赛状态"><button v-for="tab in tabs" :key="tab.id" :class="{ selected: filter === tab.id }" :aria-pressed="filter === tab.id" @click="filter = tab.id">{{ tab.label }}<span>{{ tab.count }}</span></button></div>
        <div class="search-row"><label class="search-input"><AppIcon name="search" :size="18" /><input v-model="query" type="search" placeholder="搜索比赛名称或关键词…" aria-label="搜索比赛" /></label><select v-model="family" aria-label="筛选赛事系列"><option value="all">全部赛事</option><option v-for="item in families" :key="item" :value="item">{{ item }}</option></select></div>
      </div>
      <div class="list-caption"><span>共 {{ visible.length }} 场比赛</span><span><AppIcon name="clock" :size="13" /> 按比赛时间排序 · 往期倒序</span></div>
      <div v-if="!visible.length" class="empty-state"><AppIcon :name="savedView && !bookmarks.length ? 'bookmark' : 'search'" :size="30" /><h3>{{ savedView && !bookmarks.length ? '还没有收藏比赛' : '没有找到符合条件的比赛' }}</h3><p>{{ savedView && !bookmarks.length ? '点击比赛右侧的收藏图标，把下一场挑战留在这里。' : '试试其他关键词，或清除筛选条件。' }}</p><a v-if="savedView && !bookmarks.length" href="#/" class="button">去发现比赛</a><button v-else class="button" @click="reset">清除筛选</button></div>
      <article v-for="c in visible" :key="c.id" class="contest-row" :class="{ past: phase(c) === 'ended' }">
        <div class="date-block"><span>{{ c.startAt ? date(c.startAt).slice(0, 4) : '赛程' }}</span><strong>{{ monthDay(c.startAt) }}</strong><small>{{ phase(c) === 'upcoming' ? countdown(c.startAt) : phaseLabels[phase(c)] }}</small></div>
        <div class="contest-content"><div class="row-tags"><span class="series-tag">{{ c.series }}</span><span class="status" :class="phase(c) === 'ended' ? 'neutral' : registration(c) === '报名中' ? 'green' : 'neutral'"><span v-if="registration(c) === '报名中'" class="dot"></span>{{ phase(c) === 'ended' ? '已结束' : registration(c) }}</span><span v-if="c.selection.required && phase(c) !== 'ended'" class="selection-tag">需校内选拔</span></div>
          <h2><a :href="`#/contest/${c.id}`">{{ c.name }}</a></h2><p class="row-intro">{{ c.introduction }}</p>
          <div class="row-meta"><span><AppIcon name="users" :size="14" />{{ c.format }}</span><span><AppIcon name="pin" :size="14" />{{ c.location }}</span><span class="difficulty"><i v-for="n in 5" :key="n" :class="{ filled: n <= Math.ceil(c.difficulty / 2) }"></i><span>难度 {{ c.difficulty }}/10</span></span></div>
          <div class="row-foot"><span v-if="phase(c) === 'ended'" class="result-summary"><AppIcon name="trophy" :size="14" />{{ c.resultSummary }}</span><span v-else>建议基础：<strong>{{ c.level }}</strong></span><a :href="`#/contest/${c.id}`">{{ phase(c) === 'ended' ? '查看回顾' : '查看详情' }}<AppIcon name="arrow" :size="15" /></a></div>
        </div>
        <button class="icon-button bookmark-button" :class="{ bookmarked: bookmarks.includes(c.id) }" :aria-label="`${bookmarks.includes(c.id) ? '取消收藏' : '收藏'}${c.name}`" :aria-pressed="bookmarks.includes(c.id)" @click="$emit('bookmark', c.id)"><AppIcon name="bookmark" :size="19" /></button>
      </article>
      <p v-if="visible.length" class="list-end">已展示全部 {{ visible.length }} 场比赛 <span>·</span> 每一次参赛，都是一次成长</p>
    </section>
    <aside class="list-sidebar">
      <ContestCalendar :contests="contests" :bookmarks="bookmarks" :saved-view="savedView" />
      <section class="deadline-panel"><div class="panel-title"><span class="title-icon"><AppIcon name="clock" :size="18" /></span><h2>别错过报名</h2><span class="live-dot"></span></div><p class="muted small">先记住截止时间，再慢慢准备。</p><a v-for="c in deadlines" :key="c.id" :href="`#/contest/${c.id}`" class="deadline-item"><div><span class="deadline-label">{{ c.series }}</span><span class="days-left">剩 {{ deadlineDays(c) }} 天</span></div><h3>{{ c.name }}</h3><p>{{ date(c.registrationDeadline, true) }} 截止<AppIcon name="arrow" :size="15" /></p></a><p v-if="!deadlines.length" class="muted">暂无开放报名的比赛。</p><div class="sidebar-note"><AppIcon name="info" :size="15" /><span>校内报名可能早于官方截止时间，请留意学校通知。</span></div></section>
      <section class="starter-panel"><span class="eyebrow">FIRST CONTEST?</span><h2>第一次参加比赛？</h2><p>不用等到“准备好了”。<br />从一场适合自己的比赛开始。</p><ul><li><span>01</span> 看参赛要求，确认适合的组别</li><li><span>02</span> 留意校内选拔与报名截止</li><li><span>03</span> 做一套往年题，找到自己的节奏</li></ul><p class="starter-foot">CF 分数仅作参考，不是参赛门槛。</p></section>
      <div class="sidebar-bottom"><AppIcon name="calendar" :size="17" /><span>少一点寻找，多一点准备。</span></div>
    </aside>
  </div>
</template>
