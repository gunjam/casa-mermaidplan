'use strict'

const { test } = require('tap')
const { join } = require('path')
const { exec } = require('child_process')

const filePath = join(__dirname, '../mermaid-plan.js')
const planPath = join(__dirname, './helpers/test-plan.js')

const graph = `graph TD
  page-a --> page-b
  page-b --> page-c
  page-c -->|yes| page-d
  page-c -->|no| page-e
`

test('cli', (t) => {
  t.plan(2)

  const child = exec(`node ${filePath} -p ${planPath} -d td -l`)

  let response = ''

  child.stdout.on('data', (chunk) => {
    response += chunk
  })

  child.on('close', (code) => {
    t.same(response, graph)
    t.same(code, 0)
    t.end()
  })
})

test('cli with error', (t) => {
  t.plan(2)

  const child = exec(`node ${filePath} -p ${planPath} -z`)

  let response = ''

  child.stderr.on('data', (chunk) => {
    response += chunk
  })

  child.on('close', (code) => {
    t.same(code, 1)
    t.same(response, 'Invalid argument: -z\n')
    t.end()
  })
})
