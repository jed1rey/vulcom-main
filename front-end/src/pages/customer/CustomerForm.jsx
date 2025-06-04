import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import React from 'react'
import InputMask from 'react-input-mask'
import { useNavigate, useParams } from 'react-router-dom'
import myfetch from '../../lib/myfetch'
import useConfirmDialog from '../../ui/useConfirmDialog'
import useNotification from '../../ui/useNotification'
import useWaiting from '../../ui/useWaiting'
import Car from '../../models/Car' // <--- IMPORT HERE
import { ZodError } from 'zod'

export default function CarForm() {
  const formDefaults = {
    brand: '',
    model: '',
    color: '',
    year_manufacture: '',
    imported: false,
    plates: '',
    selling_date: null,
    selling_price: '', // Set to empty string for TextField to be controlled
    customer_id: '',
  }

  const [state, setState] = React.useState({
    car: { ...formDefaults },
    formModified: false,
    customers: [],
    inputErrors: {},
  })
  const { car, customers, formModified, inputErrors } = state

  const params = useParams()
  const navigate = useNavigate()

  const { askForConfirmation, ConfirmDialog } = useConfirmDialog()
  const { notify, Notification } = useNotification()
  const { showWaiting, Waiting } = useWaiting()

  const colors = [
    { value: 'AMARELO', label: 'AMARELO' },
    { value: 'AZUL', label: 'AZUL' },
    { value: 'BRANCO', label: 'BRANCO' },
    { value: 'CINZA', label: 'CINZA' },
    { value: 'DOURADO', label: 'DOURADO' },
    { value: 'LARANJA', label: 'LARANJA' },
    { value: 'MARROM', label: 'MARROM' },
    { value: 'PRATA', label: 'PRATA' },
    { value: 'PRETO', label: 'PRETO' },
    { value: 'ROSA', label: 'ROSA' },
    { value: 'ROXO', label: 'ROXO' },
    { value: 'VERDE', label: 'VERDE' },
    { value: 'VERMELHO', label: 'VERMELHO' },
  ]

  const plateMaskFormatChars = {
    9: '[0-9]', // somente dígitos
    $: '[0-9A-J]', // dígito de 0 a 9 ou uma letra de A a J.
    A: '[A-Z]', //  letra maiúscula de A a Z.
  }

  const currentYear = new Date().getFullYear()
  const minYear = 1960
  const years = []
  for (let year = currentYear; year >= minYear; year--) {
    years.push(year)
  }

  function handleFieldChange(event) {
    const { name, value, checked, type } = event.target
    const carCopy = { ...car }

    // Para checkbox, use 'checked', caso contrário use 'value'
    carCopy[name] = type === 'checkbox' ? checked : value

    setState({ ...state, car: carCopy, formModified: true })
  }

  async function handleFormSubmit(event) {
    event.preventDefault() // Evita que a página seja recarregada
    showWaiting(true) // Exibe a tela de espera

    try {
      // Cria uma cópia do objeto car para transformar valores antes da validação Zod
      const carToSend = { ...car }

      // Zod espera um número para selling_price, então transforma string vazia para null se for opcional
      if (carToSend.selling_price === '') {
        carToSend.selling_price = null
      } else {
        // Converte para número se não for string vazia
        carToSend.selling_price = parseFloat(carToSend.selling_price);
      }
      
      // Converte year_manufacture para número se for uma string
      carToSend.year_manufacture = parseInt(carToSend.year_manufacture)

      // Valida com Zod
      Car.parse(carToSend)

      // PUT se estiver editando
      if (params.id) await myfetch.put(`/cars/${params.id}`, carToSend)
      // POST se for novo
      else await myfetch.post('/cars', carToSend)

      // Feedback de sucesso e redirecionamento
      notify('Item salvo com sucesso.', 'success', 4000, () => {
        navigate('..', { relative: 'path', replace: true })
      })
    } catch (error) {
      console.error(error)

      if (error instanceof ZodError) {
        const errorMessages = {}
        for (let issue of error.issues) {
          errorMessages[issue.path[0]] = issue.message
        }

        setState({ ...state, inputErrors: errorMessages })
        notify('Há campos com valores inválidos. Verifique.', 'error')
      } else {
        notify(error.message, 'error')
      }
    } finally {
      showWaiting(false)
    }
  }

  /*
    useEffect() que é executado apenas uma vez, no carregamento do componente.
    Verifica se a rota tem parâmetro. Caso tenha, significa que estamos vindo
    do componente de listagem por meio do botão de editar, e precisamos chamar
    a função loadData() para buscar no back-end os dados do cliente a ser editado
  */
  React.useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    showWaiting(true)
    try {
      let car = { ...formDefaults },
        customers = []

      // Busca a lista de clientes para preencher o combo de escolha
      // do cliente que comprou o carro
      customers = await myfetch.get('/customers')

      // Se houver parâmetro na rota, precisamos buscar o carro para
      // ser editado
      if (params.id) {
        car = await myfetch.get(`/cars/${params.id}`)

        // Converte o formato de data armazenado no banco de dados
        // para o formato reconhecido pelo componente DatePicker
        if (car.selling_date) {
          car.selling_date = parseISO(car.selling_date)
        }
      }

      setState({ ...state, car, customers })
    } catch (error) {
      console.error(error)
      notify(error.message, 'error')
    } finally {
      showWaiting(false)
    }
  }

  async function handleBackButtonClick() {
    if (
      formModified &&
      !(await askForConfirmation(
        'Há informações não salvas. Deseja realmente sair?'
      ))
    )
      return // Sai da função sem fazer nada

    // Navega de volta para a página de listagem
    navigate('..', { relative: 'path', replace: true })
  }

  function handleKeyDown(event) {
    if (event.key === 'Delete') {
      const stateCopy = { ...state }
      stateCopy.car.customer_id = '' // Changed to empty string to match formDefaults
      setState(stateCopy)
    }
  }

  return (
    <>
      <ConfirmDialog />
      <Notification />
      <Waiting />

      <Typography variant='h1' gutterBottom>
        {params.id ? `Editar carro #${params.id}` : 'Cadastrar novo carro'}
      </Typography>

      <Box className='form-fields'>
        <form onSubmit={handleFormSubmit}>
          <TextField
            name='brand'
            label='Marca do carro'
            variant='filled'
            required
            fullWidth
            autoFocus // Added autoFocus for better UX
            value={car.brand}
            onChange={handleFieldChange}
            helperText={inputErrors?.brand}
            error={Boolean(inputErrors?.brand)} // Use Boolean for error prop
          />
          <TextField
            name='model'
            label='Modelo do carro'
            variant='filled'
            required
            fullWidth
            value={car.model}
            onChange={handleFieldChange}
            helperText={inputErrors?.model}
            error={Boolean(inputErrors?.model)}
          />

          <TextField
            name='color'
            label='Cor'
            variant='filled'
            required
            fullWidth
            value={car.color}
            onChange={handleFieldChange}
            select
            helperText={inputErrors?.color}
            error={Boolean(inputErrors?.color)}
          >
            {colors.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            name='year_manufacture'
            label='Ano de fabricação'
            variant='filled'
            required
            fullWidth
            select
            value={car.year_manufacture}
            onChange={handleFieldChange}
            helperText={inputErrors?.year_manufacture}
            error={Boolean(inputErrors?.year_manufacture)}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </TextField>

          <div>
            <FormControlLabel
              control={
                <Checkbox
                  name='imported'
                  checked={car.imported} // Use car.imported directly
                  onChange={handleFieldChange} // Use generic handleFieldChange
                  color='primary'
                />
              }
              label='Importado'
            />
          </div>

          <InputMask
            mask='AAA-9$99'
            formatChars={plateMaskFormatChars}
            maskChar=' '
            value={car.plates}
            onChange={handleFieldChange}
          >
            {() => (
              <TextField
                name='plates'
                label='Placa'
                variant='filled'
                 fullWidth
                helperText={inputErrors?.plates}
                error={Boolean(inputErrors?.plates)}
              />
            )}
          </InputMask>

          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={ptBR}
          >
            <DatePicker
              label='Data de venda'
              value={car.selling_date}
              onChange={(value) =>
                handleFieldChange({
                  target: { name: 'selling_date', value },
                })
              }
              slotProps={{
                textField: {
                  variant: 'filled',
                  fullWidth: true,
                  helperText: inputErrors?.selling_date,
                  error: Boolean(inputErrors?.selling_date),
                },
              }}
            />
          </LocalizationProvider>

          <TextField
            name='selling_price'
            label='Preço de venda'
            variant='filled'
            type='number'
            fullWidth
            value={car.selling_price}
            onChange={handleFieldChange}
            helperText={inputErrors?.selling_price}
            error={Boolean(inputErrors?.selling_price)}
          />

          <TextField
            name='customer_id'
            label='Cliente'
            variant='filled'
            required
            fullWidth
            value={car.customer_id}
            onChange={handleFieldChange}
            onKeyDown={handleKeyDown}
            select
            helperText={inputErrors?.customer_id || 'Tecle DEL para limpar o cliente'}
            error={Boolean(inputErrors?.customer_id)}
          >
            {customers.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-around',
              width: '100%',
            }}
          >
            <Button variant='contained' color='secondary' type='submit'>
              Salvar
            </Button>
            <Button variant='outlined' onClick={handleBackButtonClick}>
              Voltar
            </Button>
          </Box>

          {/* Uncomment for debugging */}
          {/*
          <Box sx={{ fontFamily: 'monospace', display: 'flex', flexDirection: 'column', width: '100%' }}>
            <pre>{JSON.stringify(car, null, 2)}</pre>
            <hr />
            <pre>{JSON.stringify(inputErrors, null, 2)}</pre>
          </Box>
          */}
        </form>
      </Box>
    </>
  )
}