#!/usr/bin/env node
'use strict'

const path = require('path')

function parseArgument (args) {
  const validDirections = ['TB', 'TD', 'BT', 'RL', 'LR']
  const length = args.length

  const opts = {
    showLabels: false,
    direction: 'LR'
  }

  for (let i = 0; i < length; i++) {
    const arg = args[i]

    if (/^[^-]/.test(arg)) {
      continue
    }

    switch (arg) {
      case '-l':
        opts.showLabels = true
        break
      case '-p':
        opts.planPath = args[i + 1]
        break
      case '-d':
        opts.direction = args[i + 1]?.toUpperCase()
        break
      default:
        throw new Error(`Invalid argument: ${arg}`)
    }
  }

  if (!opts.planPath) {
    throw new TypeError(`Missing plan path (-p), for example:
-p my-plan.js`)
  }

  if (!validDirections.includes(opts.direction)) {
    throw new TypeError(`Invalid direction (-d), must be one of the following:
  TB - top to bottom
  TD - top-down, same as top to bottom
  BT - bottom to top
  RL - right to left
  LR - left to right`)
  }

  return opts
}

function planToMermaid (plan, showLabels = false, direction = 'LR') {
  const p = plan instanceof Function ? plan() : plan

  if (p.constructor.name !== 'Plan') {
    throw new TypeError('Invalid Plan, file must be a Plan or a function that returns a Plan')
  }

  const graph = p.getGraphStructure()
  let mermaid = `graph ${direction}`

  for (const key of Object.keys(graph._edgeObjs)) {
    const edge = graph._edgeObjs[key]

    if (edge.name === 'next') {
      const label = showLabels && graph._edgeLabels[key].label
      mermaid = `${mermaid}\n  ${edge.v} -->${label ? `|${label}|` : ''} ${edge.w}`
    }
  }

  return mermaid
}

function outputMermaid (p, args) {
  const { planPath, showLabels, direction } = parseArgument(args)
  const plan = require(path.resolve(planPath))
  const mermaid = planToMermaid(plan, showLabels, direction)

  p.stdout.write(`${mermaid}\n`)
  p.exit(0)
}

function outputError (p, error) {
  const message = (error.code === 'MODULE_NOT_FOUND')
    ? 'Invalid plan path, file could not be found'
    : error.message

  p.stderr.write(`${message}\n`)
  p.exit(1)
}

if (require.main === module) {
  try {
    outputMermaid(process, process.argv.slice(2))
  } catch (error) {
    outputError(process, error)
  }
}

module.exports.parseArgument = parseArgument
module.exports.planToMermaid = planToMermaid
module.exports.outputMermaid = outputMermaid
module.exports.outputError = outputError
