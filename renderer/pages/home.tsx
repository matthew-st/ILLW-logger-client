import React from 'react'
import Head from 'next/head'
import Typography from '@mui/material/Typography'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import { SnackbarCloseReason, styled } from '@mui/material'
const Root = styled('div')(({ theme }) => {
  return {
    textAlign: 'center',
    paddingTop: theme.spacing(4),
  }
})

export default function HomePage() {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("")
  const [severity, setSeverity] = React.useState("success")
  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };
  const handleChange = (event) => {
    setMessage(event.target.value)
  }
  const handleSeverity = (event) => {
    setSeverity(event.target.value)
  }

  return (
    <React.Fragment>
      <Head>
        <title>ILLW logging software</title>
      </Head>
      <Root>
        <Typography>
          ILLW logger testing page
        </Typography>
        <TextField id="filled-basic" label="Message text" variant="filled" onChange={handleChange} />
        <br/><br/>
        <FormControl fullWidth={false}>
          <InputLabel id="demo-simple-select-label">Severity</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={severity}
            label="Severity"
            onChange={handleSeverity}
          >
            
            <MenuItem value={"success"}>success</MenuItem>
            <MenuItem value={"info"}>info</MenuItem>
            <MenuItem value={"warning"}>warning</MenuItem>
            <MenuItem value={"error"}>error</MenuItem>
          </Select>
        </FormControl>
        <div>
          <Button onClick={handleClick}>Open Snackbar</Button>
          <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
            <Alert
              onClose={handleClose}
              //@ts-ignore
              severity={severity}
              variant="filled"
              sx={{ width: '100%' }}
            >
              {message}
            </Alert>
          </Snackbar>
        </div>
      </Root>
    </React.Fragment>
  )
}
