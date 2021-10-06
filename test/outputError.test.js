'use strict'

const { test } = require('tap')
const { outputError } = require('../mermaid-plan.js')

test('output error message', (t) => {
  t.plan(2)

  const testMessage = 'test message'
  const error = new Error(testMessage)

  const p = {
    stderr: {
      write(output) {
        t.same(output, `${testMessage}\n`)
      }
    },
    exit(code) {
      t.same(code, 1)
    }
  }

  outputError(p, error)
})

test('output require error message', (t) => {
  t.plan(2)

  const error = new Error('error')
  error.code = 'MODULE_NOT_FOUND'

  const p = {
    stderr: {
      write(output) {
        t.same(output, 'Invalid plan path, file could not be found\n')
      }
    },
    exit(code) {
      t.same(code, 1)
    }
  }

  outputError(p, error)
})
