#!/usr/bin/env node
'use strict'

const path = require('node:path')
const { pathToFileURL } = require('node:url')
const { parseArgs } = require('node:util')

function isValidDirection (direction) {
  const validDirections = ['TB', 'TD', 'BT', 'RL', 'LR']
  return validDirections.includes(direction)
}

function parseArgument (args) {
  const options = {
    help: {
      type: 'boolean',
      short: 'h',
      default: false,
    },
    labels: {
      type: 'boolean',
      short: 'l',
      default: false,
    },
    plan: {
      type: 'string',
      short: 'p',
    },
    direction: {
      type: 'string',
      short: 'd',
      default: 'LR',
    },
    title: {
      type: 'string',
      short: 't',
    },
  }

  const opts = parseArgs({ args, options }).values
  opts.direction = opts.direction.toUpperCase()

  if (opts.help) {
    return opts
  }

  if (!opts.plan) {
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

function planToMermaid (plan, labels = false, direction = 'LR', title = '') {
  const p = plan instanceof Function ? plan() : plan

  if (p.constructor.name !== 'Plan') {
    throw new TypeError('Invalid Plan, file must export a Plan or a function that returns a Plan')
  }

  if (typeof labels !== 'boolean') {
    throw new TypeError(`labels must be a boolean, got: ${typeof labels}`)
  }

  if (!isValidDirection(direction)) {
    throw new TypeError(`direction must be string of TB, TD, BT, RL or LR, got: ${direction}`)
  }

  if (typeof title !== 'string') {
    throw new TypeError(`title must be a string, got: ${typeof title}`)
  }

  const escaped = new Map()

  function escapeKeywords (edge) {
    if (escaped.has(edge)) {
      return escaped.get(edge)
    }

    if (/class|end|graph/.test(edge)) {
      escaped.set(edge, escaped.size)
      return `${escaped.get(edge)}["${edge}"]`
    }

    return edge
  }

  const graph = p.getGraphStructure()
  let mermaid = `flowchart ${direction}`

  if (title) {
    mermaid = `---\ntitle: ${title}\n---\n${mermaid}`
  }

  for (const edge of graph.edges()) {
    if (edge.name === 'next') {
      const label = labels && graph.edge(edge).conditionName
      const source = escapeKeywords(edge.v)
      const target = escapeKeywords(edge.w)
      mermaid += `\n  ${source} -->${label ? `|${label}|` : ''} ${target}`
    }
  }

  return mermaid
}

async function outputMermaid (args) {
  const { help, plan: planPath, labels, direction, title } = parseArgument(args)

  if (help) {
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
  const mermaid = planToMermaid(plan, labels, direction, title)

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
  /* c8 ignore next 3 */
  } catch (error) {
    outputError(error)
  }
}

if (require.main === module) {
  run()
}

module.exports = planToMermaid
module.exports.parseArgument = parseArgument
