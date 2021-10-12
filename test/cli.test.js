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

test('cli help', (t) => {
  t.plan(2)

  const child = exec(`node ${filePath} -h`)

  let response = ''

  child.stdout.on('data', (chunk) => {
    response += chunk
  })

  child.on('close', (code) => {
    t.same(response, `Usage: mermaidplan [opts]

Available options:
  -p/--plan
      Path to plan file to load, file must be a Plan or a function that returns a Plan.
  -l/--labels
      Label graph edges with route condition function names.
  -d/--direction
      Direction of graph, must be either:
      TB - top to bottom
      TD - top-down, same as top to bottom
      BT - bottom to top
      RL - right to left
      LR - left to right
  -h/--help
      Print this menu.\n`)
    t.same(code, 0)
    t.end()
  })
})

test('cli with defined error', (t) => {
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

test('cli with plan read error', (t) => {
  t.plan(2)

  const child = exec(`node ${filePath} -p not-there.js`)

  let response = ''

  child.stderr.on('data', (chunk) => {
    response += chunk
  })

  child.on('close', (code) => {
    t.same(code, 1)
    t.same(response, 'Invalid plan path, file could not be found\n')
    t.end()
  })
})
