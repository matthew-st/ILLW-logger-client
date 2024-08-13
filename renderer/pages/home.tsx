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
import NotesDialog from '../components/NotesDialog'
const Root = styled('div')(({ theme }) => {
  return {
    textAlign: 'center',
    paddingTop: theme.spacing(4),
  }
})


export default function HomePage() {
  const [snackbarState, setSnackbarState] = React.useState<[boolean, SnackbarData]>([false, { message: '', severity: '' }])
  const [deleteDialogState, setDeleteDialogState] = React.useState<[boolean, QSO]>([false, null])
  const [logDialogState, setLogDialogState] = React.useState<[boolean, QSO]>([false, null])
  const [notesDialogState, setNotesDialogState] = React.useState<[boolean, QSO]>([false, null])
  const [qsos, setQSOs] = React.useState<Array<QSO>>([])
  const [operator, setOperator] = React.useState('GB0CSL')

  React.useEffect(() => {
    window.ipc.on('qso_made', (new_qso: QSO) => {
      setQSOs((qso_arr) => {
        let idx = qso_arr.findIndex((qso) => qso.id == new_qso.id)
        if (idx !== -1) {
          qso_arr[idx] = new_qso
          return qso_arr
        }
        return [
          ...qso_arr,
          new_qso
        ]
      })
    })

    window.ipc.on('qso_edit', (new_qso: QSO) => {
      setQSOs((qso_arr) => {
        let idx = qso_arr.findIndex((qso) => qso.id == new_qso.id)
        let new_qso_arr = Array.from(qso_arr)
        if (idx !== -1) {
          new_qso_arr[idx] = new_qso
          return new_qso_arr
        }
        return [
          ...qso_arr,
          new_qso
        ]
      })
    })

    window.ipc.on('qso_delete', (del_qso: QSO) => {
      setQSOs((qso_arr) => {
        let idx = qso_arr.findIndex((qso) => qso.id == del_qso.id)
        let new_qso_arr = Array.from(qso_arr)
        console.log(qso_arr, idx)
        if (idx !== -1) {
          new_qso_arr.splice(idx, 1)
        }
        return new_qso_arr
      })
    })

    window.ipc.on('delete', (qso: QSO) => {
      if (logDialogState[0]) setLogDialogState([false, logDialogState[1]])
      if (notesDialogState[0]) setNotesDialogState([false, notesDialogState[1]])
      setDeleteDialogState([true, qso])
    })

    window.ipc.on('edit', (qso: QSO | null) => {
      if (deleteDialogState[0]) setDeleteDialogState([false, deleteDialogState[1]])
      if (notesDialogState[0]) setNotesDialogState([false, notesDialogState[1]])
      setLogDialogState([true, qso])
    })

    window.ipc.on('notes', (qso: QSO) => {
      if (logDialogState[0]) setLogDialogState([false, logDialogState[1]])
      if (deleteDialogState[0]) setDeleteDialogState([false, deleteDialogState[1]])
      setNotesDialogState([true, qso])
    })

    window.ipc.on('init', (init_packet: InitPacket) => {
      if (init_packet.chunk_status[0] == 1) { setQSOs([]) }
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
        <br />
        <div style={{ display: 'flex', flexDirection: 'row', alignContent: 'center', justifyContent: 'space-around' }}>
          <TextField label="Current operator" onChange={(ev) => setOperator(ev.target.value)} value={operator}></TextField>
          <Button onClick={() => { window.ipc.send('edit', null) }}><Icon>add</Icon> Manual log</Button>
        </div>
        <ConfigDialog />
        <DeleteDialog state={deleteDialogState} set={setDeleteDialogState} op={operator} />
        <EditDialog state={logDialogState} set={setLogDialogState} op={operator} />
        <NotesDialog state={notesDialogState} set={setNotesDialogState}></NotesDialog>
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
