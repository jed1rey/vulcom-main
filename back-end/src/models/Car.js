import { z } from "zod"

const allowedColors = ["vermelho", "azul", "preto", "branco", "cinza"]

const currentYear = new Date().getFullYear()
const today = new Date()
const lojaAbertura = new Date("2020-01-01")

const Car = z.object({
  brand: z.string()
    .min(1, { message: "A marca deve conter pelo menos 1 caractere" })
    .max(25, { message: "A marca deve conter no máximo 25 caracteres" }),

  model: z.string()
    .min(1, { message: "O modelo deve conter pelo menos 1 caractere" })
    .max(25, { message: "O modelo deve conter no máximo 25 caracteres" }),

  color: z.enum(allowedColors, {
    errorMap: () => ({ message: "Cor inválida" })
  }),

  year_manufacture: z.number()
    .int({ message: "Ano de fabricação deve ser um número inteiro" })
    .min(1960, { message: "Ano mínimo é 1960" })
    .max(currentYear, { message: `Ano máximo é ${currentYear}` }),

  imported: z.boolean({ required_error: "Campo 'imported' é obrigatório" }),

  plates: z.string()
    .length(8, { message: "Placa deve conter exatamente 8 caracteres" }),

  selling_date: z
    .union([
      z.string().transform(str => new Date(str)),
      z.date()
    ])
    .refine(date => date >= lojaAbertura && date <= today, {
      message: "Data de venda deve estar entre 01/01/2020 e hoje"
    })
    .optional(),

  selling_price: z
    .number()
    .min(1000, { message: "Preço mínimo é R$ 1.000,00" })
    .max(5000000, { message: "Preço máximo é R$ 5.000.000,00" })
    .optional(),
})

export default Car
