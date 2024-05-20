'use strict'

const test = require('node:test')
const { equal, throws } = require('node:assert/strict')
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

test('throw if labels not a boolean', () => {
  throws(() => {
    planToMermaid(testPlan(), 'true')
  }, {
    message: 'labels must be a boolean, got: string'
  })
})

test('throw if direction not valid', () => {
  throws(() => {
    planToMermaid(testPlan(), false, 'UP')
  }, {
    message: 'direction must be string of TB, TD, BT, RL or LR, got: UP'
  })
})

test('throw if title not a string', () => {
  throws(() => {
    planToMermaid(testPlan(), true, 'LR', 0)
  }, {
    message: 'title must be a string, got: number'
  })
})

test('returns mermaid notation for given plan', () => {
  const plan = testPlan()
  const mermaid = planToMermaid(plan)
  equal(mermaid, `flowchart LR
  page-a --> page-b
  page-b --> page-c
  page-c --> page-d
  page-c --> page-e`)
})

test('returns mermaid notation for function returning a plan', () => {
  const mermaid = planToMermaid(testPlan)
  equal(mermaid, `flowchart LR
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
  equal(mermaid, `flowchart LR
  page-a --> 0["class"]
  0 --> 1["subgraph"]
  1 --> 2["dead-end"]
  2 --> 3["end-of"]
  3 --> page-b`)
})

test('returns mermaid notation with title', () => {
  const mermaid = planToMermaid(testPlan, false, 'LR', 'My journey')
  equal(mermaid, `\
---
title: My journey
---
flowchart LR
  page-a --> page-b
  page-b --> page-c
  page-c --> page-d
  page-c --> page-e`)
})

test('returns mermaid notation with specified direction', () => {
  const mermaid = planToMermaid(testPlan, false, 'TD')
  equal(mermaid, `flowchart TD
  page-a --> page-b
  page-b --> page-c
  page-c --> page-d
  page-c --> page-e`)
})

test('returns mermaid notation with edge labels', () => {
  const mermaid = planToMermaid(testPlan, true)
  equal(mermaid, `flowchart LR
  page-a --> page-b
  page-b --> page-c
  page-c -->|yes| page-d
  page-c -->|no| page-e`)
})
