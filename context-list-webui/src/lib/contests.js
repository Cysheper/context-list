// A fixed, visible demo clock makes every sample state reproducible.
export const DEMO_NOW = new Date('2026-09-20T09:00:00+08:00')
export function phase(c) {
  if (!c.startAt) return 'pending'
  if (new Date(c.endAt) < DEMO_NOW) return 'ended'
  if (new Date(c.startAt) <= DEMO_NOW) return 'live'
  return 'upcoming'
}
export const phaseLabels = { pending: '时间待定', ended: '已结束', live: '进行中', upcoming: '即将开始' }
export function registration(c) {
  if (phase(c) === 'ended') return '报名已结束'
  if (c.registrationDeadline && new Date(c.registrationDeadline) < DEMO_NOW) return '报名已截止'
  return c.registrationOpen ? '报名中' : '报名未开放'
}
export function date(value, withTime = false) {
  if (!value) return '待公布'
  return new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', ...(withTime ? { hour: '2-digit', minute: '2-digit', hour12: false } : {}) }).format(new Date(value)).replaceAll('/', '.')
}
export function monthDay(value) {
  return value ? date(value).slice(5) : '待定'
}
export function countdown(value) {
  const dayInBeijing = time => Math.floor((new Date(time).getTime() + 8 * 3600000) / 86400000)
  const days = dayInBeijing(value) - dayInBeijing(DEMO_NOW)
  if (days <= 0) return '今天开赛'
  return days === 1 ? '明天开赛' : `${days} 天后`
}
export function sortContests(a, b) {
  const order = { live: 0, upcoming: 1, pending: 2, ended: 3 }
  const diff = order[phase(a)] - order[phase(b)]
  if (diff) return diff
  if (phase(a) === 'pending') return a.name.localeCompare(b.name, 'zh-CN')
  return phase(a) === 'ended' ? new Date(b.startAt) - new Date(a.startAt) : new Date(a.startAt) - new Date(b.startAt)
}
