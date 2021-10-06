'use strict'

const { test } = require('tap')
const { outputMermaid } = require('../mermaid-plan.js')

const graph = `graph TD
  page-a --> page-b
  page-b --> page-c
  page-c -->|yes| page-d
  page-c -->|no| page-e
`

test('write mermaid output', (t) => {
  t.plan(2)

  const p = {
    stdout: {
      write(output) {
        t.same(output, graph)
      }
    },
    exit(code) {
      t.same(code, 0)
    }
  }

  outputMermaid(p, [
    '-p', './test/helpers/test-plan.js',
    '-d', 'TD',
    '-l'
  ])
})
