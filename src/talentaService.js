import { safeRequest, safeMultipart } from './apiClient.js'
import { getRandomImage } from './randomImage.js'
import { config } from './config.js'
import { log } from './logger.js'
import { sendText } from './whatsapp.js'
import pRetry, { AbortError } from 'p-retry'

const RETRY_OPTIONS = {
    retries: 3,
    minTimeout: 10000,
    onFailedAttempt: (error) => {
        log(`Attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left. Error: ${error.message}`)
    }
}

async function withRetry(fn, notifLabel) {
    try {
        return await pRetry(fn, RETRY_OPTIONS)
    } catch (err) {
        const msg = `[GAGAL] ${notifLabel} gagal setelah 3x percobaan. Error: ${err.message}`
        log(msg)
        await sendText('1541163367', msg).catch(log)
        throw err
    }
}

export async function getCompanyId() {
    return withRetry(async () => {
        const req = await safeRequest(`/v1/dashboard/user`, {}, 'GET')
        const response = req.data

        if (response.status != 200) throw new AbortError(`Request failed`)

        return {
            company_id: response.data.company_id,
            organization_id: response.data.organization_id
        }
    }, 'getCompanyId')
}

export async function getCurrentShift(date) {
    return withRetry(async () => {
        const req = await safeRequest(
            `/v1/attendance/companies/${config.COMPANY_ID}/attendance_schedules/active`,
            { device_time: date, show_multiple: true },
            'GET'
        )
        const response = req.data

        if (response.status != 200) throw new Error(`Failed to get current shift`)

        const shiftId = response.data[0].current_shift_id
        const settingId = response.data[0].attendance_office_hour_setting_id

        if (!shiftId || !settingId) throw new AbortError(`Shift ID not found in response`)

        return {
            id: shiftId,
            setting_id: settingId,
            name: response.data[0].current_shift_name ?? '-'
        }
    }, 'getCurrentShift')
}

export async function submitAttendance(shiftId, settingId, date, event) {
    let image = null
    try {
        image = await getRandomImage()
    } catch (e) {
        log(e)
    }

    return withRetry(async () => {
        const req = await safeMultipart(
            `/v3/attendance/organisations/${config.COMPANY_ID}/attendance_clocks`,
            {
                filePath: image,
                fields: {
                    notes: '',
                    latitude: config.LATITUDE,
                    longitude: config.LONGITUDE,
                    source: 'mobileapp',
                    schedule_date: date,
                    attendance_clock_type: 'attendance',
                    attendance_office_hour_id: shiftId,
                    on_live_tracking: false,
                    event_type: event,
                    'mixpanel[Entry point]': 'Home',
                    end_live_tracking: false,
                    attendance_office_hour_setting_id: settingId
                },
                method: 'POST',
                fileFieldName: 'selfie_photo',
                headers: { V3: 'true' }
            }
        )
        const response = req.data

        if (response.status != 200) throw new Error(`Request failed`)

        await sendText('1541163367', `Berhasil ${event}`)
    }, `submitAttendance (${event})`)
}

export async function getAttendance(date) {
    return withRetry(async () => {
        const req = await safeRequest(
            `/v1/attendance/companies/${config.COMPANY_ID}/attendance_schedules/active`,
            { device_time: date, show_multiple: true },
            'GET'
        )
        const response = req.data
        console.log(response)

        if (response.status != 200) throw new Error(`Failed to get current shift`)

        return {
            clock_in: response.data[0].is_check_in ?? false,
            clock_out: response.data[0].is_check_out ?? false
        }
    }, 'getAttendance')
}