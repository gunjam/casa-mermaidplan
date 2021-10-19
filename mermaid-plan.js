#!/usr/bin/env node
'use strict'

const { pathToFileURL } = require('url')
const path = require('path')

function isValidDirection (direction) {
  const validDirections = ['TB', 'TD', 'BT', 'RL', 'LR']
  return validDirections.includes(direction)
}

function parseArgument (args) {
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
      case '--help':
      case '-h':
        opts.showHelp = true
        return opts
      case '--labels':
      case '-l':
        opts.showLabels = true
        break
      case '--plan':
      case '-p':
        opts.planPath = args[i + 1]
        break
      case '--direction':
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

  if (!isValidDirection(opts.direction)) {
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

  if (typeof showLabels !== 'boolean') {
    throw new TypeError(`showLabels must be a boolean, got: ${typeof showLabels}`)
  }

  if (!isValidDirection(direction)) {
    throw new TypeError(`direction must be string of TB, TD, BT, RL or LR, got: ${direction}`)
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

async function outputMermaid (args) {
  const { showHelp, planPath, showLabels, direction } = parseArgument(args)

  if (showHelp) {
    process.stdout.write(`Usage: mermaidplan [opts]

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
    process.exit(0)
  }

  const { default: plan } = await import(pathToFileURL(path.resolve(planPath)))
  const mermaid = planToMermaid(plan, showLabels, direction)

  process.stdout.write(`${mermaid}\n`)
  process.exit(0)
}

function outputError (error) {
  const message = (error.code?.indexOf('MODULE_NOT_FOUND') > -1)
    ? 'Invalid plan path, file could not be found'
    : error.message

  process.stderr.write(`${message}\n`)
  process.exit(1)
}

async function run () {
  try {
    await outputMermaid(process.argv.slice(2))
  } catch (error) {
    outputError(error)
  }
}

if (require.main === module) {
  run()
}

module.exports = planToMermaid
module.exports.parseArgument = parseArgument
