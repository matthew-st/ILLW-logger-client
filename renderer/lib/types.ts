import { OverridableComponent } from "@mui/material/OverridableComponent";
import { SvgIconTypeMap } from "@mui/material/SvgIcon/SvgIcon";

export interface SnackbarData {
    message: string,
    severity: string,
    icon?: string
}

export interface QSO {
    id: number,
    call: String,
    freq: number,
    band: String,
    mode: String
    submode?: String
    time: number
    notes?: String
    operatorCall: String
    rstSent: number
    rstRcvd: number
    emailed?: Boolean
}

export interface InitPacket {
    qso_list: QSO[]
    chunk_status: [number,number]
    total_amount: number
}