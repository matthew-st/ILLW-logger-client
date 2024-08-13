import React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Icon from '@mui/material/Icon';
import { MenuItem, Stack } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import moment from 'moment';
import { nanoid } from 'nanoid';
export default function EditDialog({ state, set, op }) {
    if (state[1] == null) {
        state[1] = { add: true }
    }
    return (
        <React.Fragment>
            <Dialog
                open={state[0]}
                onClose={() => set([false, state[1]])}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        if (!state[1].time) state[1].time = Date.now()
                        if (state[1].add) {
                            state[1].id = nanoid(9)
                            state[1].operatorCall = op
                            delete state[1].add
                            window.ipc.send('add_qso', {
                                qso: state[1],
                                opCall: op
                            })
                        } else {
                            window.ipc.send('edit_qso', {
                                qso: state[1],
                                opCall: op
                            })
                        }
                        set([false, {}]);
                    },
                }}
            >
                <DialogTitle>{!(state[1]?.add) ? <>Editing QSO with {state[1].call}</> : <>Adding new QSO</>}</DialogTitle>
                <DialogContent>
                    <Stack>
                        <div style={{ display: 'flex', alignContent: 'center', justifyContent: 'center' }}>
                            <TextField
                                autoFocus
                                required
                                margin="normal"
                                id="call"
                                name="call"
                                label="Callsign"
                                type="text"
                                variant="outlined"
                                value={state[1]?.call || ''}
                                onChange={(ev) => {
                                    state[1].call = ev.target.value.toUpperCase()
                                    set([state[0], state[1]])
                                }}
                            />&nbsp;
                            <div style={{ marginTop: '16px' }}>
                                <LocalizationProvider dateAdapter={AdapterMoment}>
                                    <DateTimePicker
                                        name="time"
                                        label="Date time"
                                        value={moment(state[1]?.time || Date.now())}
                                        onChange={(ev) => {
                                            state[1].time = new Date(ev.valueOf()).getTime()
                                            set([state[0], state[1]])
                                        }} />
                                </LocalizationProvider>
                            </div>
                        </div>
                        <div style={{ marginBottom: '8px', display: 'flex', alignContent: 'center', justifyContent: 'center' }}>
                            <TextField
                                required
                                margin="normal"
                                id="freq"
                                name="freq"
                                label="Frequency (kHz)"
                                type="number"
                                aria-valuemin={0}
                                variant="outlined"
                                value={state[1]?.freq}
                                onChange={(ev) => {
                                    state[1].freq = ev.target.value
                                    set([state[0], state[1]])
                                }}
                            />&nbsp;
                            <TextField
                                required
                                margin='normal'
                                id='rstSent'
                                name='rstSent'
                                label='Sent'
                                variant='outlined'
                                value={state[1]?.rstSent || ''}
                                style={{ width: '21%' }}
                                onChange={(ev) => {
                                    state[1].rstSent = ev.target.value
                                    set([state[0], state[1]])
                                }}
                            />
                            <TextField
                                required
                                margin='normal'
                                id='rstRcvd'
                                name='rstRcvd'
                                label='Rcvd'
                                variant='outlined'
                                value={state[1]?.rstRcvd || ''}
                                onChange={(ev) => {
                                    state[1].rstRcvd = ev.target.value
                                    set([state[0], state[1]])
                                }}
                                style={{ width: '21%' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignContent: 'center', justifyContent: 'center' }}>
                            <TextField
                                required
                                select
                                label='Mode'
                                id='mode'
                                name='mode'
                                variant='outlined'
                                value={state[1]?.mode || ''}
                                style={{ width: '35.5%' }}
                                onChange={(ev) => {
                                    state[1].mode = ev.target.value
                                    set([state[0], state[1]])
                                }}
                            >
                                <MenuItem value='CW'>CW</MenuItem>
                                <MenuItem value='USB'>USB</MenuItem>
                                <MenuItem value='LSB'>LSB</MenuItem>
                                <MenuItem value='FM'>FM</MenuItem>
                                <MenuItem value='FT8'>FT8</MenuItem>
                            </TextField>&nbsp;
                            <TextField
                                required
                                select
                                label='Band'
                                id='band'
                                name='band'
                                variant='outlined'
                                value={state[1]?.band || ''}
                                onChange={(ev) => {
                                    state[1].band = ev.target.value
                                    set([state[0], state[1]])
                                }}
                                style={{ width: '42%' }}
                            >
                                <MenuItem value="160m">160m</MenuItem>
                                <MenuItem value="80m">80m</MenuItem>
                                <MenuItem value="40m">40m</MenuItem>
                                <MenuItem value="30m">30m</MenuItem>
                                <MenuItem value="20m">20m</MenuItem>
                                <MenuItem value="17m">17m</MenuItem>
                                <MenuItem value="15m">15m</MenuItem>
                                <MenuItem value="12m">12m</MenuItem>
                                <MenuItem value="10m">10m</MenuItem>
                                <MenuItem value="6m">6m</MenuItem>
                                <MenuItem value="4m">4m</MenuItem>
                                <MenuItem value="2m">2m</MenuItem>
                                <MenuItem value="70cm">70cm</MenuItem>
                                <MenuItem value="QO-100">QO-100</MenuItem>
                            </TextField>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                            <TextField
                                label='Notes'
                                id='notes'
                                margin='normal'
                                name='notes'
                                multiline
                                variant='outlined'
                                value={state[1]?.notes || ''}
                                onChange={(ev) => {
                                    state[1].notes = ev.target.value
                                    set([state[0], state[1]])
                                }}
                                style={{ width: '78.5%' }}
                            />
                        </div>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => set([false, state[1]])}>Cancel</Button>
                    <Button type="submit" variant='contained'>{(!state[1]?.add) ? <><Icon>edit</Icon> Edit</> : <><Icon>add</Icon> Add</>}</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
