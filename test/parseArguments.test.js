'use strict'

const { test } = require('tap')
const { parseArgument } = require('../mermaid-plan.js')

test('parse arguments', (t) => {
  t.plan(4)

  const args = parseArgument([
    '-p', 'plan.js',
    '-d', 'td',
    '-l',
    '-h'
  ])

  t.same(args.planPath, 'plan.js')
  t.same(args.direction, 'TD')
  t.same(args.showLabels, true)
  t.same(args.showHelp, true)
})

test('parse long arguments', (t) => {
  t.plan(4)

  const args = parseArgument([
    '--plan', 'plan.js',
    '--direction', 'td',
    '--labels',
    '--help'
  ])

  t.same(args.planPath, 'plan.js')
  t.same(args.direction, 'TD')
  t.same(args.showLabels, true)
  t.same(args.showHelp, true)
})

test('parse arguments with defaults', (t) => {
  t.plan(3)

  const args = parseArgument([
    '-p', 'plan.js'
  ])

  t.same(args.planPath, 'plan.js')
  t.same(args.direction, 'LR')
  t.same(args.showLabels, false)
})

test('throw on invalid direction', (t) => {
  t.plan(1)

  t.throws(() => {
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

test('throw on missing plan path', (t) => {
  t.plan(1)

  t.throws(() => {
    parseArgument([])
  }, 'Missing plan path (-p), for example:\n -p my-plan.js')
})

test('throw on invalid argument', (t) => {
  t.plan(1)

  t.throws(() => {
    parseArgument([
      '-z'
    ])
  }, 'Invalid argument: -z')
})
