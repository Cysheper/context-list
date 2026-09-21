<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
const props = defineProps({ source: { type: String, default: '' } })
const html = computed(() => {
  const fragment = DOMPurify.sanitize(marked.parse(props.source, { gfm: true }), {
    RETURN_DOM_FRAGMENT: true,
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['form', 'style', 'button', 'textarea', 'select'],
    FORBID_ATTR: ['style', 'id', 'name'],
  })
  fragment.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href') || ''
    if (/^https?:\/\//i.test(href)) {
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
    }
  })
  fragment.querySelectorAll('img').forEach(img => {
    img.loading = 'lazy'
    img.decoding = 'async'
  })
  fragment.querySelectorAll('input').forEach(input => {
    if (input.type === 'checkbox') input.disabled = true
    else input.remove()
  })
  fragment.querySelectorAll('table').forEach(table => {
    const wrapper = document.createElement('div')
    wrapper.className = 'markdown-table'
    table.replaceWith(wrapper)
    wrapper.append(table)
  })
  const container = document.createElement('div')
  container.append(fragment)
  return container.innerHTML
})
function imageError(event) {
  const image = event.target
  if (image.tagName !== 'IMG') return
  const fallback = document.createElement('span')
  fallback.className = 'article-image-fallback'
  fallback.textContent = `图片暂未加载${image.alt ? `：${image.alt}` : ''}`
  image.replaceWith(fallback)
}
</script>

<template><div class="markdown-content" @error.capture="imageError" v-html="html"></div></template>
