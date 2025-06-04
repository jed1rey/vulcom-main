import { z } from 'zod'

const currentYear = new Date().getFullYear()
const today = new Date()
const shopOpeningDate = new Date('2020-01-01')

const validColors = [
  'PRETO', 'BRANCO', 'CINZA', 'PRATA', 'VERMELHO',
  'AZUL', 'VERDE', 'AMARELO', 'MARROM', 'BEGE', 'ROXO', 'LARANJA'
]

const Car = z.object({
  brand: z.string()
    .trim()
    .min(1, { message: 'A marca deve ter, no mínimo, 1 caractere.' })
    .max(25, { message: 'A marca pode ter, no máximo, 25 caracteres.' }),

  model: z.string()
    .trim()
    .min(1, { message: 'O modelo deve ter, no mínimo, 1 caractere.' })
    .max(25, { message: 'O modelo pode ter, no máximo, 25 caracteres.' }),

  color: z.enum(validColors, {
    message: 'Cor inválida.'
  }),

  year_manufacture: z.number()
    .int({ message: 'O ano de fabricação deve ser um número inteiro.' })
    .min(1960, { message: 'O ano de fabricação não pode ser anterior a 1960.' })
    .max(currentYear, { message: 'O ano de fabricação não pode ser maior que o ano atual.' }),

  imported: z.boolean({
    required_error: 'O campo "importado" é obrigatório.',
    invalid_type_error: 'O campo "importado" deve ser verdadeiro ou falso.'
  }),

  plates: z.string()
    .length(8, { message: 'A placa deve conter exatamente 8 caracteres.' }),

  selling_date: z.coerce.date()
    .min(shopOpeningDate, { message: 'A data de venda não pode ser anterior a 01/01/2020.' })
    .max(today, { message: 'A data de venda não pode ser futura.' })
    .optional(),

  selling_price: z.coerce.number()
    .min(1000, { message: 'O preço de venda não pode ser inferior a R$ 1.000,00.' })
    .max(5000000, { message: 'O preço de venda não pode ser superior a R$ 5.000.000,00.' })
    .optional()
})

export default Car
