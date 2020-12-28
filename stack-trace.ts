function throwDummyException() {
  const array = [1, 2, 3]
  array.map((n) => {
    if (n === 2) throw Error('dummy exception')
    return n
  })
}

const arrow = async (depth: number) => {
  if (depth === 0) throwDummyException()
  return named(depth - 1)
}

async function named(depth: number) {
  if (depth === 0) throwDummyException()
  await arrow(depth - 1)
}

async function main() {
  await named(5)
}

main().catch(console.error)
