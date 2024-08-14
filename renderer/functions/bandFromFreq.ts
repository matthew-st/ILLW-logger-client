export function getBandFromMhz(num) {
    if (!parseFloat(num)) return ""
    num = parseFloat(num)
    let band = ''
    if (num >= 1.8 && num <= 2) band = "160m";
    else if (num >= 3.5 && num <= 3.8) band = "80m";
    else if (num >= 7 && num <= 7.2) band = "40m";
    else if (num >= 10 && num <= 10.15) band = "30m";
    else if (num >= 14 && num <= 14.35) band = "20m";
    else if (num >= 18.06 && num <= 18.17) band = "17m";
    else if (num >= 21 && num <= 21.45) band = "15m";
    else if (num >= 24.89 && num <= 24.99) band = "12m";
    else if (num >= 28 && num <= 29.7) band = "10m";
    else if (num >= 50 && num <= 52) band = "6m";
    else if (num >= 70 && num <= 70.5) band = "4m";
    else if (num >= 144 && num <= 147) band = "2m";
    else if (num >= 420 && num <= 440) band = "70cm";
    return band;
}