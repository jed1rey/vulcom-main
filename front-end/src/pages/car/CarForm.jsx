import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import React from 'react';
import InputMask from 'react-input-mask';
import { useNavigate, useParams } from 'react-router-dom';
import myfetch from '../../lib/myfetch';
import useConfirmDialog from '../../ui/useConfirmDialog';
import useNotification from '../../ui/useNotification';
import useWaiting from '../../ui/useWaiting';
import Car from '../../models/Car';
import { ZodError } from 'zod';

export default function CarForm() {
  const formDefaults = {
    brand: '',
    model: '',
    color: '',
    year_manufacture: '',
    imported: false,
    plates: '',
    selling_date: null,
    selling_price: '',
    customer_id: ''
  };

  const [state, setState] = React.useState({
    car: { ...formDefaults },
    formModified: false,
    customers: [],
    inputErrors: {},
  });
  const { car, customers, formModified, inputErrors } = state;

  const params = useParams();
  const navigate = useNavigate();

  const { askForConfirmation, ConfirmDialog } = useConfirmDialog();
  const { notify, Notification } = useNotification();
  const { showWaiting, Waiting } = useWaiting();

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
  ];

  const plateMaskFormatChars = {
    9: '[0-9]',
    $: '[0-9A-J]',
    A: '[A-Z]',
  };

  const currentYear = new Date().getFullYear();
  const minYear = 1960;
  const years = [];
  for (let year = currentYear; year >= minYear; year--) {
    years.push(year);
  }

  const [imported, setImported] = React.useState(false);

  const handleImportedChange = (event) => {
    setImported(event.target.checked);
  };

  function handleFieldChange(event) {
    const carCopy = { ...car };
    carCopy[event.target.name] = event.target.value;
    setState({ ...state, car: carCopy, formModified: true });
  }

  async function handleFormSubmit(event) {
    event.preventDefault();
    showWaiting(true);
    try {
      if (car.selling_price === '') car.selling_price = null;
      car.imported = imported; // sincroniza checkbox

      // ✅ Validação do formulário com Zod
      Car.parse(car);

      if (params.id) await myfetch.put(`/cars/${params.id}`, car);
      else await myfetch.post('/cars', car);

      notify('Item salvo com sucesso.', 'success', 4000, () => {
        navigate('..', { relative: 'path', replace: true });
      });
    } catch (error) {
      console.error(error);

      if (error instanceof ZodError) {
        const errorMessages = {};
        for (let i of error.issues) errorMessages[i.path[0]] = i.message;
        setState({ ...state, inputErrors: errorMessages });
        notify('Há campos com valores inválidos. Verifique.', 'error');
      } else {
        notify(error.message, 'error');
      }
    } finally {
      showWaiting(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    showWaiting(true);
    try {
      let car = { ...formDefaults }, customers = [];

      customers = await myfetch.get('/customers');

      if (params.id) {
        car = await myfetch.get(`/cars/${params.id}`);
        if (car.selling_date) {
          car.selling_date = parseISO(car.selling_date);
        }
        setImported(car.imported ?? false);
      }

      setState({ ...state, car, customers });
    } catch (error) {
      console.error(error);
      notify(error.message, 'error');
    } finally {
      showWaiting(false);
    }
  }

  async function handleBackButtonClick() {
    if (
      formModified &&
      !(await askForConfirmation('Há informações não salvas. Deseja realmente sair?'))
    )
      return;

    navigate('..', { relative: 'path', replace: true });
  }

  function handleKeyDown(event) {
    if (event.key === 'Delete') {
      const stateCopy = { ...state };
      stateCopy.car.customer_id = null;
      setState(stateCopy);
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
            value={car.brand}
            onChange={handleFieldChange}
            helperText={inputErrors?.brand}
            error={Boolean(inputErrors?.brand)}
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

          <div className='MuiFormControl-root'>
            <FormControlLabel
              control={
                <Checkbox
                  name='imported'
                  variant='filled'
                  checked={imported}
                  onChange={handleImportedChange}
                  color='primary'
                />
              }
              label='Importado'
            />
            {inputErrors?.imported && (
              <Typography color="error" variant="caption">
                {inputErrors.imported}
              </Typography>
            )}
          </div>

          <InputMask
            formatChars={plateMaskFormatChars}
            value={car.plates}
            onChange={handleFieldChange}
          >
            {() => (
              <TextField
                name='plates'
                label='Placa'
                variant='filled'
                required
                fullWidth
                helperText={inputErrors?.plates}
                error={Boolean(inputErrors?.plates)}
              />
            )}
          </InputMask>

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
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

          <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
            <Button variant='contained' color='secondary' type='submit'>
              Salvar
            </Button>
            <Button variant='outlined' onClick={handleBackButtonClick}>
              Voltar
            </Button>
          </Box>
        </form>
      </Box>
    </>
  );
}
