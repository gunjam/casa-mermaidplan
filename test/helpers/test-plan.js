'use strict'

const Plan = require('@dwp/govuk-casa/lib/Plan.js')

function testPlan () {
  const plan = new Plan({})
  plan.addSequence('page-a', 'page-b', 'page-c')
  plan.setRoute('page-c', 'page-d', function yes () {})
  plan.setRoute('page-c', 'page-e', function no () {})
  return plan
}

module.exports = testPlan
