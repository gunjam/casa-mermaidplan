'use strict'

const { test } = require('tap')
const { Plan } = require('@dwp/govuk-casa')
const planToMermaid = require('../mermaid-plan.js')
const testPlan = require('./helpers/test-plan.js')

test('throw if not given a plan or a function', (t) => {
  t.plan(1)

  t.throws(() => {
    planToMermaid('fail')
  }, 'Invalid plan, file must export a plan or a function that returns a plan')
})

test('throw if given a function that does not return a plan', (t) => {
  t.plan(1)

  t.throws(() => {
    planToMermaid(() => 'fail')
  }, 'Invalid plan, file must export a plan or a function that returns a plan')
})

test('throw if showLabels not a boolean', (t) => {
  t.plan(1)

  t.throws(() => {
    planToMermaid(testPlan(), 'true')
  }, 'showLabels must be a boolean, got: string')
})

test('throw if direction not valid', (t) => {
  t.plan(1)

  t.throws(() => {
    planToMermaid(testPlan(), false, 'UP')
  }, 'direction must be string of TB, TD, BT, RL or LR, got: UP')
})

test('returns mermaid notation for given plan', (t) => {
  t.plan(1)

  const plan = testPlan()
  const mermaid = planToMermaid(plan)
  t.same(mermaid, `graph LR
  page-a --> page-b
  page-b --> page-c
  page-c --> page-d
  page-c --> page-e`)
})

test('returns mermaid notation for function returning a plan', (t) => {
  t.plan(1)

  const mermaid = planToMermaid(testPlan)
  t.same(mermaid, `graph LR
  page-a --> page-b
  page-b --> page-c
  page-c --> page-d
  page-c --> page-e`)
})

test('returns mermaid notation escaping protected terms', (t) => {
  t.plan(1)

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
  t.same(mermaid, `graph LR
  page-a --> 0["class"]
  0 --> 1["subgraph"]
  1 --> 2["dead-end"]
  2 --> 3["end-of"]
  3 --> page-b`)
})

test('returns mermaid notation with specified direction', (t) => {
  t.plan(1)

  const mermaid = planToMermaid(testPlan, false, 'TD')
  t.same(mermaid, `graph TD
  page-a --> page-b
  page-b --> page-c
  page-c --> page-d
  page-c --> page-e`)
})

test('returns mermaid notation with edge labels', (t) => {
  t.plan(1)

  const mermaid = planToMermaid(testPlan, true)
  t.same(mermaid, `graph LR
  page-a --> page-b
  page-b --> page-c
  page-c -->|yes| page-d
  page-c -->|no| page-e`)
})
