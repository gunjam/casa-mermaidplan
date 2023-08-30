'use strict'

const test = require('node:test')
const { strictEqual, throws } = require('node:assert')
const { parseArgument } = require('../mermaid-plan.js')

test('parse arguments', () => {
  const args = parseArgument([
    '-p', 'plan.js',
    '-d', 'td',
    '-l',
    '-h'
  ])

  strictEqual(args.planPath, 'plan.js')
  strictEqual(args.direction, 'TD')
  strictEqual(args.showLabels, true)
  strictEqual(args.showHelp, true)
})

test('parse long arguments', () => {
  const args = parseArgument([
    '--plan', 'plan.js',
    '--direction', 'td',
    '--labels',
    '--help'
  ])

  strictEqual(args.planPath, 'plan.js')
  strictEqual(args.direction, 'TD')
  strictEqual(args.showLabels, true)
  strictEqual(args.showHelp, true)
})

test('parse arguments with defaults', () => {
  const args = parseArgument([
    '-p', 'plan.js'
  ])

  strictEqual(args.planPath, 'plan.js')
  strictEqual(args.direction, 'LR')
  strictEqual(args.showLabels, false)
})

test('throw on invalid direction', () => {
  throws(() => {
    parseArgument([
      '-p', 'plan.js',
      '-d', 'invalid'
    ])
  }, `Invalid direction (-d), must be one of the following:
TB - top to bottom
TD - top-down, same as top to bottom
BT - bottom to top
RL - right to left
LR - left to right`)
})

test('throw on missing plan path', () => {
  throws(() => {
    parseArgument([])
  }, 'Missing plan path (-p), for example:\n -p my-plan.js')
})

test('throw on invalid argument', () => {
  throws(() => {
    parseArgument([
      '-z'
    ])
  }, { message: 'Invalid argument: -z' })
})
