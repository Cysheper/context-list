export const articles = [
  {
    id: 'autumn-training', category: '备赛动态', series: '校园竞赛',
    title: '新学期，和队友一起准备下一场比赛',
    summary: '从第一次组队到限时模拟，算法协会整理了一份秋季备赛清单，送给正在准备出发的你。',
    publishedAt: '2026-09-18T10:00:00+08:00', author: '示例大学 · 算法协会',
    cover: '/news/training.svg', coverAlt: '备赛笔记插画（示意图，非实拍）',
    contestId: 'ccpc-online-2026', contestName: 'CCPC 网络预选赛',
  },
  {
    id: 'icpc-summer-recap', category: '赛事回顾', series: 'ICPC',
    title: '五小时的并肩作战：ICPC 夏季邀请赛圆满收官',
    summary: '两支队伍带着一银一铜回到校园。记录赛场上的思考、配合，以及比赛结束之后的成长。',
    publishedAt: '2026-08-18T14:30:00+08:00', author: '示例大学 · 校竞赛队',
    cover: '/news/contest.svg', coverAlt: '团队比赛工位插画（示意图，非实拍）',
    contestId: 'icpc-summer-2026', contestName: 'ICPC 全国邀请赛 · 夏季回顾',
  },
  {
    id: 'lanqiao-national-awards', category: '获奖喜报', series: '蓝桥杯',
    title: '东华理工大学在第十七届蓝桥杯全国 大学生软件和信息技术大赛（软件类）国赛中获佳绩',
    summary: '一等奖、二等奖、三等奖各一项。从日常训练到全国赛场，每一份坚持都有了回响。',
    publishedAt: '2026-09-21T09:00:00+08:00', author: '东华理工大学 · 软件学院',
    cover: 'https://cynite.oss-cn-guangzhou.aliyuncs.com/uploads/mmexport1789965246773.jpg', coverAlt: '获奖奖杯插画（示意图，非实拍）',
    contestId: 'lanqiao-final-2026', contestName: '蓝桥杯 · 全国总决赛回顾',
  },
  {
    id: 'spring-campus-recap', category: '赛事回顾', series: '校内赛事',
    title: '从第一行代码出发，春季校园程序设计交流赛落幕',
    summary: '一次面向新同学的程序设计体验。有人第一次提交通过，有人找到了志同道合的队友。',
    publishedAt: '2026-05-24T16:00:00+08:00', author: '示例大学 · 算法协会',
    cover: '/news/contest.svg', coverAlt: '校园比赛工位插画（示意图，非实拍）',
  },
].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))

const documents = import.meta.glob('./*.md', { query: '?raw', import: 'default' })
export async function loadArticle(id) {
  const loader = documents[`./${id}.md`]
  if (!loader) throw new Error('文章正文不存在')
  return loader()
}
