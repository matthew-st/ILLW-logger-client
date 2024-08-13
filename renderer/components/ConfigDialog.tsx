import React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Fab from '@mui/material/Fab';
import Icon from '@mui/material/Icon';
export default function ConfigDialog() {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            <Fab size="small" color="secondary" aria-label="settings" style={{ position: 'absolute', bottom: 16, right: 16 }} onClick={handleClickOpen}>
                <Icon>key</Icon>
            </Fab>
            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries((formData as any).entries());
                        window.ipc.send('authToken', formJson.authToken)
                        handleClose();
                    },
                }}
            >
                <DialogContent>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="token"
                        name="authToken"
                        label="Authentication token"
                        type="text"
                        fullWidth
                        variant="standard"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Submit</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
