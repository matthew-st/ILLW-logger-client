import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
export default function DeleteDialog({state, set, op}) {
    return (
        <React.Fragment>
            <Dialog
                open={state[0]}
                onClose={() => set([false, state[1]])}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        window.ipc.send('delete_qso', {qso: state[1], opCall: op})
                        set([false, state[1]]);
                    },
                }}
            >
                <DialogContent>
                    <DialogContentText>Are you sure you want to delete QSO {state[1]?.id || ''} with {state[1]?.call || ''}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => set([false, state[1]])}>Cancel</Button>
                    <Button type="submit" variant='contained' color='error'>Submit</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
