export const useAutosize = (element: Ref<HTMLTextAreaElement | null>, source: () => unknown) => {
  const resize = () => {
    const node = element.value

    if (!node) return

    node.style.height = 'auto'

    const borders = node.offsetHeight - node.clientHeight

    node.style.height = `${node.scrollHeight + borders}px`
  }

  onMounted(() => {
    resize()
    window.addEventListener('resize', resize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resize)
  })

  watch(source, () => nextTick(resize))

  return { resize }
}
