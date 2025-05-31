import prisma from '../database/client.js'
import Car from '../models/Car.js'  // Corrigido para usar como schema Zod
import { ZodError } from 'zod'

const controller = {}

// CREATE
controller.create = async function(req, res) {
  try {
    const parsed = Car.safeParse(req.body)

    if (!parsed.success) {
      return res.status(422).json({
        error: 'Dados inválidos',
        details: parsed.error.errors
      })
    }

    await prisma.car.create({ data: parsed.data })

    res.status(201).end()
  }
  catch(error) {
    console.error(error)
    res.status(500).end()
  }
}

// RETRIEVE ALL
controller.retrieveAll = async function(req, res) {
  try {
    const includedRels = req.query.include?.split(',') ?? []

    const result = await prisma.car.findMany({
      orderBy: [
        { brand: 'asc' },
        { model: 'asc' },
        { id: 'asc' }
      ],
      include: {
        customer: includedRels.includes('customer'),
        created_user: includedRels.includes('created_user'),
        updated_user: includedRels.includes('updated_user')
      }
    })

    res.send(result)
  }
  catch(error) {
    console.error(error)
    res.status(500).end()
  }
}

// RETRIEVE ONE
controller.retrieveOne = async function(req, res) {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).send({ error: 'ID inválido.' })

    const includedRels = req.query.include?.split(',') ?? []

    const result = await prisma.car.findUnique({
      where: { id },
      include: {
        customer: includedRels.includes('customer'),
        created_user: includedRels.includes('created_user'),
        updated_user: includedRels.includes('updated_user')
      }
    })

    if(result) res.send(result)
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)
    res.status(500).end()
  }
}

// UPDATE
controller.update = async function(req, res) {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).send({ error: 'ID inválido.' })

    const parsed = Car.safeParse(req.body)

    if (!parsed.success) {
      return res.status(422).json({
        error: 'Dados inválidos',
        details: parsed.error.errors
      })
    }

    await prisma.car.update({
      where: { id },
      data: parsed.data
    })

    res.status(204).end()
  }
  catch(error) {
    if(error?.code === 'P2025') {
      res.status(404).end()
    }
    else {
      console.error(error)
      res.status(500).end()
    }
  }
}

// DELETE
controller.delete = async function(req, res) {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).send({ error: 'ID inválido.' })

    await prisma.car.delete({
      where: { id }
    })

    res.status(204).end()
  }
  catch(error) {
    if(error?.code === 'P2025') {
      res.status(404).end()
    }
    else {
      console.error(error)
      res.status(500).end()
    }
  }
}

export default controller
