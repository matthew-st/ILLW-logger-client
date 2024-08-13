import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import { DialogTitle, Icon } from '@mui/material';
export default function NotesDialog({state, set}) {
    return (
        <React.Fragment>
            <Dialog
                open={state[0]}
                onClose={() => set([false, state[1]])}
            >
                <DialogContent>
                    <DialogTitle>Notes for QSO with {state[1]?.call}</DialogTitle>
                    <DialogContentText>{state[1]?.notes}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => set([false, state[1]])}><Icon>close</Icon></Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
