<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { calendarDate, monthCells, shiftMonth, contestDays } from '../lib/calendar'
import { date } from '../lib/contests'

const props = defineProps({ contests: Array, bookmarks: Array, savedView: Boolean })
const today = ref(calendarDate())
const month = ref(today.value.slice(0, 7))
const scope = ref(props.savedView ? 'saved' : 'all')
const selectedDate = ref(today.value)
const weekdays = ['一', '二', '三', '四', '五', '六', '日']
let clockTimer

watch(() => props.savedView, saved => { scope.value = saved ? 'saved' : 'all' })
const monthLabel = computed(() => `${month.value.slice(0, 4)} 年 ${Number(month.value.slice(5))} 月`)
const entries = computed(() => props.contests
  .filter(c => scope.value === 'all' || props.bookmarks.includes(c.id))
  .map(contest => ({ contest, range: contestDays(contest) }))
  .filter(entry => entry.range)
  .sort((a, b) => new Date(a.contest.startAt) - new Date(b.contest.startAt)))
const days = computed(() => monthCells(month.value).map(day => ({
  ...day,
  events: day.inMonth ? entries.value.filter(({ range }) => range.start <= day.key && range.end >= day.key).map(({ contest }) => contest) : [],
})))
const monthCount = computed(() => new Set(days.value.flatMap(day => day.events.map(c => c.id))).size)
const selected = computed(() => days.value.find(day => day.key === selectedDate.value && day.inMonth))
const selectedLabel = computed(() => selected.value ? `${Number(month.value.slice(5))} 月 ${selected.value.day} 日` : '本月赛程')
const pendingCount = computed(() => props.contests.filter(c => !contestDays(c) && (scope.value === 'all' || props.bookmarks.includes(c.id))).length)

watch(days, cells => {
  const existing = cells.find(day => day.key === selectedDate.value && day.inMonth)
  if (existing?.events.length) return
  selectedDate.value = cells.find(day => day.events.length)?.key
    || cells.find(day => day.key === today.value && day.inMonth)?.key
    || cells.find(day => day.inMonth).key
}, { immediate: true })

function changeMonth(offset) { month.value = shiftMonth(month.value, offset) }
function goToday() { month.value = today.value.slice(0, 7); selectedDate.value = today.value }
function dayLabel(day) {
  return `${day.key}${day.key === today.value ? '，今天' : ''}，${day.events.length} 场比赛：${day.events.map(c => c.name).join('、')}`
}
function refreshToday() {
  const next = calendarDate()
  if (next === today.value) return
  if (month.value === today.value.slice(0, 7)) month.value = next.slice(0, 7)
  today.value = next
}
onMounted(() => {
  clockTimer = setInterval(refreshToday, 60000)
  document.addEventListener('visibilitychange', refreshToday)
})
onUnmounted(() => {
  clearInterval(clockTimer)
  document.removeEventListener('visibilitychange', refreshToday)
})
</script>

<template>
  <section class="calendar-panel" aria-label="赛事月历">
    <div class="panel-title"><span class="title-icon"><AppIcon name="calendar" :size="18" /></span><h2>赛事月历</h2><button class="calendar-today" @click="goToday">回到本月</button></div>
    <div class="calendar-scope" role="group" aria-label="月历赛事范围">
      <button :class="{ active: scope === 'all' }" :aria-pressed="scope === 'all'" @click="scope = 'all'">全部比赛</button>
      <button :class="{ active: scope === 'saved' }" :aria-pressed="scope === 'saved'" @click="scope = 'saved'">我的收藏</button>
    </div>
    <div class="calendar-month"><button class="icon-button" aria-label="上个月" @click="changeMonth(-1)"><AppIcon name="back" :size="16" /></button><h3 aria-live="polite">{{ monthLabel }}</h3><button class="icon-button" aria-label="下个月" @click="changeMonth(1)"><AppIcon name="arrow" :size="16" /></button></div>
    <div class="calendar-weekdays" aria-hidden="true"><span v-for="day in weekdays" :key="day">{{ day }}</span></div>
    <div class="calendar-grid">
      <template v-for="day in days" :key="day.key">
        <button v-if="day.events.length" class="calendar-day has-events" :class="{ today: day.key === today, chosen: day.key === selectedDate }" :aria-label="dayLabel(day)" :aria-pressed="day.key === selectedDate" :aria-current="day.key === today ? 'date' : undefined" aria-controls="calendar-day-events" @click="selectedDate = day.key"><span>{{ day.day }}</span><small v-if="day.events.length > 1">{{ day.events.length }}</small><i v-else class="calendar-event-dot"></i></button>
        <span v-else class="calendar-day" :class="{ outside: !day.inMonth, today: day.key === today }" :aria-current="day.key === today ? 'date' : undefined" :aria-label="`${day.key}${day.key === today ? '，今天' : ''}，无比赛`">{{ day.day }}</span>
      </template>
    </div>
    <div class="calendar-legend"><span><i class="calendar-event-dot"></i>比赛日</span><span><i class="calendar-today-ring"></i>今天</span><span>本月 {{ monthCount }} 场</span></div>
    <div id="calendar-day-events" class="calendar-agenda" aria-live="polite">
      <template v-if="selected?.events.length"><div class="calendar-agenda-title"><h3>{{ selectedLabel }}</h3><span>{{ selected.events.length }} 场比赛</span></div><a v-for="contest in selected.events" :key="contest.id" :href="`#/contest/${contest.id}`" class="calendar-event"><div><span>{{ contest.series }} · {{ date(contest.startAt, true) }}</span><strong>{{ contest.name }}</strong></div><AppIcon name="arrow" :size="15" /></a></template>
      <p v-else class="calendar-empty">{{ monthCount ? '今天没有比赛，点击标记日期查看当天比赛。' : scope === 'saved' ? '本月暂无已收藏比赛。收藏后，比赛日会在这里点亮。' : '本月暂无已确定时间的比赛，可切换月份查看。' }}</p>
    </div>
    <p class="calendar-caption">按实际日期显示 · 北京时间<span v-if="pendingCount"> · {{ pendingCount }} 场时间待定，未标入日历</span></p>
  </section>
</template>
