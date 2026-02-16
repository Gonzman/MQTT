import type { paths } from '@/types/schema'
import createClient from 'openapi-fetch'

const client = createClient<paths>({ baseUrl: 'https://api.mqtt.tobi.tintuc.de' })

export default client
