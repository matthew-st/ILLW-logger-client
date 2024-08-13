import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Button, Icon } from '@mui/material';
const columns: GridColDef[] = [
	{
		field: "button",
		headerName: "",
		width: 168,
		sortable: false,
		renderCell: (params) => (
			<>
				<Button style={{ minWidth: 32 }} onClick={() => {window.ipc.send('edit', params.row)}}><Icon style={{ minWidth: 32 }}>edit</Icon></Button>
				<Button style={{ minWidth: 32 }} onClick={() => {window.ipc.send('delete', params.row)}}><Icon style={{ minWidth: 32 }}>delete</Icon></Button>
				<Button style={{ minWidth: 32 }} onClick={() => {window.ipc.send('notes', params.row)}}><Icon style={{minWidth: 32}}>description</Icon></Button>
			</>
		)
	},
	{
		field: 'time', headerName: 'Time', width: 200, type: 'dateTime',
		valueGetter: (value) => new Date(value)
	},
	{ field: 'call', headerName: 'Callsign', width: 130 },
	{ field: 'band', headerName: 'Band', width: 90 },
	{
		field: 'mode', headerName: 'Mode', width: 90,
	},
	{ field: 'rstSent', headerName: 'RST sent', width: 90, type: 'number' },
	{ field: 'rstRcvd', headerName: 'RST rcvd', width: 90, type: 'number' },
	{ field: 'operatorCall', headerName: 'Operator', width: 100 }
];

export default function QSOTable({ data }) {
	return (
		<>
			<div style={{ display: 'flex', alignContent: 'center', justifyContent: 'center' }}>
				<div style={{ height: '400', width: '90%' }}>
					<DataGrid
						rows={data}
						columns={columns}
						initialState={{
							pagination: {
								paginationModel: {
									page: 0,
									pageSize: 5
								}
							},
							sorting: {
								sortModel: [
									{
										field: 'time',
										sort: 'desc'
									}
								]
							}
						}}
						disableRowSelectionOnClick
					/>
				</div>
			</div>
		</>
	);
}
