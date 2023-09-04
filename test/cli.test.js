'use strict'

const test = require('node:test')
const { strictEqual } = require('node:assert')
const { join } = require('path')
const { exec } = require('child_process')

const filePath = join(__dirname, '../mermaid-plan.js')
const planPath = join(__dirname, './fixtures/plan.js')
const pEsmPath = join(__dirname, './fixtures/plan.mjs')

const graph = `\
---
title: My journey
---
flowchart TD
  page-a --> page-b
  page-b --> page-c
  page-c -->|yes| page-d
  page-c -->|no| page-e
`

test('cli commonjs plan', (t, done) => {
  const child = exec(`node ${filePath} -p ${planPath} -d td -t "My journey" -l`)

  let response = ''

  child.stdout.on('data', (chunk) => {
    response += chunk
  })

  child.on('close', (code) => {
    strictEqual(response, graph)
    strictEqual(code, 0)
    done()
  })
})

test('cli esm plan', (t, done) => {
  const child = exec(`node ${filePath} -p ${pEsmPath} -d td -t "My journey" -l`)

  let response = ''

  child.stdout.on('data', (chunk) => {
    response += chunk
  })

  child.on('close', (code) => {
    strictEqual(response, graph)
    strictEqual(code, 0)
    done()
  })
})

test('cli help', (t, done) => {
  const child = exec(`node ${filePath} -h`)

  let response = ''

  child.stdout.on('data', (chunk) => {
    response += chunk
  })

  child.on('close', (code) => {
    strictEqual(response, `Usage: mermaidplan [opts]

Available options:
  -p/--plan
      Path to plan file, file must export a Plan or a function that returns a Plan.
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
    strictEqual(code, 0)
    done()
  })
})

test('cli with defined error', (t, done) => {
  const child = exec(`node ${filePath} -p ${planPath} -z`)

  let response = ''

  child.stderr.on('data', (chunk) => {
    response += chunk
  })

  child.on('close', (code) => {
    strictEqual(code, 1)
    strictEqual(response, 'Invalid argument: -z\n')
    done()
  })
})

test('cli with plan read error', (t, done) => {
  const child = exec(`node ${filePath} -p not-there.js`)

  let response = ''

  child.stderr.on('data', (chunk) => {
    response += chunk
  })

  child.on('close', (code) => {
    strictEqual(code, 1)
    strictEqual(response, 'Invalid plan path, file could not be found\n')
    done()
  })
})
