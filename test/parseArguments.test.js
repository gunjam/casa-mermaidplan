'use strict'

const test = require('node:test')
const { equal, throws } = require('node:assert/strict')
const { parseArgument } = require('../mermaid-plan.js')

test('parse arguments', () => {
  const args = parseArgument([
    '-p', 'plan.js',
    '-d', 'td',
    '-t', 'My journey',
    '-l',
    '-h',
  ])

  equal(args.plan, 'plan.js')
  equal(args.direction, 'TD')
  equal(args.title, 'My journey')
  equal(args.labels, true)
  equal(args.help, true)
})

test('parse long arguments', () => {
  const args = parseArgument([
    '--plan', 'plan.js',
    '--direction', 'td',
    '--title', 'My journey',
    '--labels',
    '--help',
  ])

  equal(args.plan, 'plan.js')
  equal(args.direction, 'TD')
  equal(args.title, 'My journey')
  equal(args.labels, true)
  equal(args.help, true)
})

test('parse arguments with defaults', () => {
  const args = parseArgument([
    '-p', 'plan.js',
  ])

  equal(args.plan, 'plan.js')
  equal(args.direction, 'LR')
  equal(args.labels, false)
})

test('throw on invalid direction', () => {
  throws(() => {
    parseArgument([
      '-p', 'plan.js',
      '-d', 'invalid',
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
      '-z',
    ])
  }, { message: 'Unknown option \'-z\'' })
})
