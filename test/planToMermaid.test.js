'use strict'

const test = require('node:test')
const { strictEqual, throws } = require('node:assert')
const { Plan } = require('@dwp/govuk-casa')
const planToMermaid = require('../mermaid-plan.js')
const testPlan = require('./fixtures/plan.js')

test('throw if not given a plan or a function', () => {
  throws(() => {
    planToMermaid('fail')
  }, {
    message: 'Invalid Plan, file must export a Plan or a function that returns a Plan'
  })
})

test('throw if given a function that does not return a plan', () => {
  throws(() => {
    planToMermaid(() => 'fail')
  }, {
    message: 'Invalid Plan, file must export a Plan or a function that returns a Plan'
  })
})

test('throw if showLabels not a boolean', () => {
  throws(() => {
    planToMermaid(testPlan(), 'true')
  }, {
    message: 'showLabels must be a boolean, got: string'
  })
})

test('throw if direction not valid', () => {
  throws(() => {
    planToMermaid(testPlan(), false, 'UP')
  }, {
    message: 'direction must be string of TB, TD, BT, RL or LR, got: UP'
  })
})

test('returns mermaid notation for given plan', () => {
  const plan = testPlan()
  const mermaid = planToMermaid(plan)
  strictEqual(mermaid, `graph LR
  page-a --> page-b
  page-b --> page-c
  page-c --> page-d
  page-c --> page-e`)
})

test('returns mermaid notation for function returning a plan', () => {
  const mermaid = planToMermaid(testPlan)
  strictEqual(mermaid, `graph LR
  page-a --> page-b
  page-b --> page-c
  page-c --> page-d
  page-c --> page-e`)
})

test('returns mermaid notation escaping protected terms', () => {
  const plan = new Plan({})
  plan.addSequence(
    'page-a',
    'class',
    'subgraph',
    'dead-end',
    'end-of',
    'page-b'
  )

  const mermaid = planToMermaid(plan)
  strictEqual(mermaid, `graph LR
  page-a --> 0["class"]
  0 --> 1["subgraph"]
  1 --> 2["dead-end"]
  2 --> 3["end-of"]
  3 --> page-b`)
})

test('returns mermaid notation with specified direction', () => {
  const mermaid = planToMermaid(testPlan, false, 'TD')
  strictEqual(mermaid, `graph TD
  page-a --> page-b
  page-b --> page-c
  page-c --> page-d
  page-c --> page-e`)
})

test('returns mermaid notation with edge labels', () => {
  const mermaid = planToMermaid(testPlan, true)
  strictEqual(mermaid, `graph LR
  page-a --> page-b
  page-b --> page-c
  page-c -->|yes| page-d
  page-c -->|no| page-e`)
})
