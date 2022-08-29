const binarySensorDeviceClasses = [
    'battery',
    'battery_charging',
    'co',
    'cold',
    'connectivity',
    'door',
    'garage_door',
    'gas',
    'heat',
    'light',
    'lock',
    'moisture',
    'motion',
    'moving',
    'occupancy',
    'opening',
    'plug',
    'power',
    'presence',
    'problem',
    'running',
    'safety',
    'smoke',
    'sound',
    'tamper',
    'update',
    'vibration',
    'window',
] as const;

const sensorDeviceClasses = [
    'apparent_power',
    'aqi',
    'battery',
    'carbon_dioxide',
    'carbon_monoxide',
    'current',
    'date',
    'duration',
    'energy',
    'frequency',
    'gas',
    'humidity',
    'illuminance',
    'monetary',
    'nitrogen_dioxide',
    'nitrogen_monoxide',
    'nitrous_oxide',
    'ozone',
    'pm1',
    'pm25',
    'pm10',
    'power',
    'power_factor',
    'pressure',
    'reactive_power',
    'signal_strength',
    'sulphur_dioxide',
    'temperature',
    'timestamp',
    'volatile_organic_compounds',
    'voltage',
] as const;

//  ISO 4217	Monetary value with a currency.
// prettier-ignore
const monetaryList = [
    'AED','AFN','ALL','AMD','ANG','AOA','ARS','AUD','AWG','AZN','BAM','BBD','BDT','BGN','BHD','BIF','BMD','BND','BOB','BOV','BRL','BSD','BTN','BWP','BYN','BZD','CAD','CDF','CHE','CHF','CHW','CLF','CLP','COP','COU','CRC','CUC','CUP','CVE','CZK','DJF','DKK','DOP','DZD','EGP','ERN','ETB','EUR','FJD','FKP','GBP','GEL','GHS','GIP','GMD','GNF','GTQ','GYD','HKD','HNL','HRK','HTG','HUF','IDR','ILS','INR','IQD','IRR','ISK','JMD','JOD','JPY','KES','KGS','KHR','KMF','KPW','KRW','KWD','KYD','KZT','LAK','LBP','LKR','LRD','LSL','LYD','MAD','MDL','MGA','MKD','MMK','MNT','MOP','MRU','MUR','MVR','MWK','MXN','MXV','MYR','MZN','NAD','NGN','NIO','NOK','NPR','NZD','OMR','PAB','PEN','PGK','PHP','PKR','PLN','PYG','QAR','RON','RSD','CNY','RUB','RWF','SAR','SBD','SCR','SDG','SEK','SGD','SHP','SLL','SOS','SRD','SSP','STN','SVC','SYP','SZL','THB','TJS','TMT','TND','TOP','TRY','TTD','TWD','TZS','UAH','UGX','USD','USN','UYI','UYU','UYW','UZS','VED','VES','VND','VUV','WST','XAF','XAG','XAU','XBA','XBB','XBC','XBD','XCD','XDR','XOF','XPD','XPF','XPT','XSU','XTS','XUA','XXX','YER','ZAR','ZMW','ZWL',
];

export const sensorUnitOfMeasurement: Record<
    typeof sensorDeviceClasses[number],
    null | string[]
> = {
    apparent_power: ['VA'],
    aqi: null,
    battery: ['%'],
    carbon_dioxide: ['ppm'],
    carbon_monoxide: ['ppm'],
    current: ['A'],
    date: null,
    duration: ['d', 'h', 'min', 's'],
    energy: ['Wh', 'kWh', 'MWh'],
    frequency: ['Hz', 'kHz', 'MHz', 'GHz'],
    gas: ['m³', 'ft³'],
    humidity: ['%'],
    illuminance: ['lx', 'lm'],
    monetary: monetaryList, // ISO 4217	Monetary value with a currency.
    nitrogen_dioxide: ['µg/m³'],
    nitrogen_monoxide: ['µg/m³'],
    nitrous_oxide: ['µg/m³'],
    ozone: ['µg/m³'],
    pm1: ['µg/m³'],
    pm25: ['µg/m³'],
    pm10: ['µg/m³'],
    power: ['W', 'kW'],
    power_factor: ['%'],
    pressure: ['cbar', 'bar', 'hPa', 'inHg', 'kPa', 'mbar', 'Pa', 'psi'],
    reactive_power: ['var'],
    signal_strength: ['dB', 'dBm'],
    sulphur_dioxide: ['µg/m³'],
    temperature: ['°C', '°F'],
    timestamp: null,
    volatile_organic_compounds: ['µg/m³'],
    voltage: ['V'],
};

export const defaultHaConfigOptions = [
    { id: 'name', type: 'string' },
    { id: 'icon', type: 'string' },
];

export const haConfigOptions = {
    button: [
        {
            id: 'device_class',
            type: 'select',
            values: ['', 'restart', 'update'],
        },
    ],
    binary_sensor: [
        {
            id: 'device_class',
            type: 'select',
            values: ['', ...binarySensorDeviceClasses],
        },
    ],
    sensor: [
        {
            id: 'device_class',
            type: 'select',
            values: ['', ...sensorDeviceClasses],
        },
        { id: 'unit_of_measurement', type: 'sensor_uom' },
        {
            id: 'state_class',
            type: 'select',
            values: ['', 'measurement', 'total', 'total_increasing'],
        },
        { id: 'last_reset', type: 'datetime' },
    ],
    switch: [],
};
