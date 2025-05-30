import dotenv from 'dotenv'
dotenv.config() // Carrega as variáveis de ambiente do arquivo .env

import express, { json, urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

const app = express()

// Desabilita o cabeçalho X-Powered-By para dificultar a identificação
// da tecnologia na qual o back-end foi desenvolvido
app.disable('x-powered-by')

import cors from 'cors'

// Configurando o CORS para que o back-end aceite
// requisições vindas das origens indicadas pela
// variável de ambiente ALLOWED_ORIGINS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  // Envia de fato quaisquer cookies gerados para o front-end
  credentials: true
}))

app.use(logger('dev'))
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser())

// Rate limiter: limita a quantidade de requisições que cada usuário/IP
// pode efetuar dentro de um determinado intervalo de tempo
import { rateLimit } from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 60 * 1000,    // Intervalo: 1 minuto
  limit: 20               // Máximo de 20 requisições
})

app.use(limiter)

/*********** ROTAS DA API **************/

// Middleware de verificação do token de autorização
import auth from './middleware/auth.js'
//app.use(auth)

import carsRouter from './routes/cars.js'
app.use('/cars', carsRouter)

import customersRouter from './routes/customers.js'
app.use('/customers', customersRouter)

import usersRouter from './routes/users.js'
app.use('/users', usersRouter)

export default app