import React from 'react'
import Head from 'next/head'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Icon from '@mui/material/Icon'
import { SnackbarCloseReason, styled } from '@mui/material'
import { InitPacket, QSO, SnackbarData } from '../lib/types'
import QSOTable from '../components/QSOTable'
import ConfigDialog from '../components/ConfigDialog'
import DeleteDialog from '../components/DeleteDialog'
import EditDialog from '../components/EditDialog'
const Root = styled('div')(({ theme }) => {
  return {
    textAlign: 'center',
    paddingTop: theme.spacing(4),
  }
})


export default function HomePage() {
  const [snackbarState, setSnackbarState] = React.useState<[boolean, SnackbarData]>([false, { message: '', severity: ''}])
  const [deleteDialogState, setDeleteDialogState] = React.useState<[boolean, QSO]>([false, null])
  const [logDialogState, setLogDialogState] = React.useState<[boolean, QSO]>([false, null])
  const [qsos, setQSOs] = React.useState<Array<QSO>>([])
  const [operator, setOperator] = React.useState('')

  React.useEffect(() => {
    window.ipc.on('qso_made', (new_qso: QSO) => {
      setQSOs((qso_arr) => [
        ...qso_arr,
        new_qso
      ])
    })

    window.ipc.on('delete', (qso: QSO) => {
      if (logDialogState[0]) {
        setLogDialogState([false, logDialogState[1]])
      }
      setDeleteDialogState([true, qso])
    })

    window.ipc.on('edit', (qso: QSO | null) => {
      if (deleteDialogState[0]) {
        setDeleteDialogState([false, deleteDialogState[1]])
      }
      setLogDialogState([true, qso])
    })

    window.ipc.on('init', (init_packet: InitPacket) => {
      console.log(`Recieved chunk ${init_packet.chunk_status[0]} of ${init_packet.chunk_status[1]}. Loading ${init_packet.total_amount} QSO(s)`)
      setQSOs((qso_arr) => [...qso_arr, ...init_packet.qso_list])
    })

    window.ipc.on('snackbar', (data: SnackbarData) => {
      setSnackbarState([false, data])
      setSnackbarState([true, data])
    })
  }, [])

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      setSnackbarState([false, snackbarState[1]]);
      return;
    }
    setSnackbarState([false, snackbarState[1]]);
  };
  return (
    <React.Fragment>
      <Head>
        <title>ILLW logging software</title>
      </Head>
      <Root>
        <QSOTable data={qsos}></QSOTable>
        <br/>
        <div style={{display: 'flex', flexDirection: 'row', alignContent: 'center', justifyContent: 'space-around'}}>
        <TextField label="Current operator" onChange={(ev) => setOperator(ev.target.value)}></TextField>
        <Button onClick={() => {window.ipc.send('edit', null)}}><Icon>add</Icon> Manual log</Button>
        </div>
        <ConfigDialog/>
        <DeleteDialog state={deleteDialogState} set={setDeleteDialogState}/>
        <EditDialog state={logDialogState} set={setLogDialogState} op={operator}/>
        <div>
          <Snackbar open={snackbarState[0]} autoHideDuration={6000} onClose={handleClose}>
            <Alert
              onClose={handleClose}
              //@ts-ignore
              severity={snackbarState[1].severity}
              icon={snackbarState[1] ? <Icon>{snackbarState[1]?.icon}</Icon> : null}
              variant="filled"
              sx={{ width: '100%' }}
            >
              {snackbarState[1].message}
            </Alert>
          </Snackbar>
        </div>
      </Root>
    </React.Fragment>
  )
}
