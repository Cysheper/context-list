const beijingDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
})

export function calendarDate(value = new Date()) {
  const time = new Date(value)
  if (!Number.isFinite(time.getTime())) return null
  const parts = Object.fromEntries(beijingDate.formatToParts(time).map(part => [part.type, part.value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function shiftMonth(month, offset) {
  const [year, number] = month.split('-').map(Number)
  return new Date(Date.UTC(year, number - 1 + offset, 1)).toISOString().slice(0, 7)
}

export function monthCells(month) {
  const [year, number] = month.split('-').map(Number)
  const first = new Date(Date.UTC(year, number - 1, 1))
  const offset = (first.getUTCDay() + 6) % 7
  const days = new Date(Date.UTC(year, number, 0)).getUTCDate()
  return Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, index) => {
    const value = new Date(Date.UTC(year, number - 1, 1 - offset + index))
    const key = value.toISOString().slice(0, 10)
    return { key, day: value.getUTCDate(), inMonth: key.startsWith(month) }
  })
}

export function contestDays(contest) {
  if (!contest.startAt) return null
  const start = calendarDate(contest.startAt)
  if (!start) return null
  // An event ending exactly at midnight does not occupy the following day.
  const endTime = new Date(contest.endAt).getTime()
  const startTime = new Date(contest.startAt).getTime()
  const end = Number.isFinite(endTime) && endTime > startTime ? calendarDate(endTime - 1) : start
  return { start, end }
}
