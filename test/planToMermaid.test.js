'use strict'

const Plan = require('@dwp/govuk-casa/lib/Plan.js')
const { test } = require('tap')
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
