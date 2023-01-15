import { ClientParams, Client, Data } from 'auth0'

export interface ManagementClient {
  getClient(params: ClientParams): Promise<Client>
  updateClient(params: ClientParams, data: Data): Promise<Client>
}

export interface UpdateParams {
  callbackUrl?: string
  logoutUrl?: string
  origin?: string
  webOrigin?: string
}

export interface UpdateResult {
  callbackUrl: boolean
  logoutUrl: boolean
  origin: boolean
  webOrigin: boolean
}

export class ClientUpdater {
  constructor(private readonly management: ManagementClient) {}

  async add(clientId: string, params: UpdateParams): Promise<UpdateResult> {
    const { callbackUrl, logoutUrl, origin, webOrigin } = params

    const client = await this.management.getClient({ client_id: clientId })

    const apiParams: Record<string, unknown> = {}
    if (callbackUrl !== undefined && !client.callbacks?.includes(callbackUrl)) {
      apiParams.callbacks = [...(client.callbacks || []), callbackUrl]
    }

    if (logoutUrl !== undefined && !client.allowed_logout_urls?.includes(logoutUrl)) {
      apiParams.allowed_logout_urls = [...(client.allowed_logout_urls || []), logoutUrl]
    }

    if (origin !== undefined && !client.allowed_origins?.includes(origin)) {
      apiParams.allowed_origins = [...(client.allowed_origins || []), origin]
    }

    if (webOrigin !== undefined && !client.web_origins?.includes(webOrigin)) {
      apiParams.web_origins = [...(client.web_origins || []), webOrigin]
    }

    if (Object.keys(apiParams).length === 0) {
      return {
        callbackUrl: false,
        logoutUrl: false,
        origin: false,
        webOrigin: false,
      }
    }

    await this.management.updateClient({ client_id: clientId }, apiParams)

    return {
      callbackUrl: apiParams.callbacks !== undefined,
      logoutUrl: apiParams.allowed_logout_urls !== undefined,
      origin: apiParams.allowed_origins !== undefined,
      webOrigin: apiParams.web_origins !== undefined,
    }
  }

  async remove(clientId: string, params: UpdateParams): Promise<UpdateResult> {
    const { callbackUrl, logoutUrl, origin, webOrigin } = params

    const client = await this.management.getClient({ client_id: clientId })

    const apiParams: Record<string, unknown> = {}
    const removedCallbackUrls = client.callbacks?.filter(x => x !== callbackUrl)
    if (removedCallbackUrls?.length !== client.callbacks?.length) {
      apiParams.callbacks = removedCallbackUrls
    }

    const removedLogoutUrls = client.allowed_logout_urls?.filter(x => x !== logoutUrl)
    if (removedLogoutUrls?.length !== client.allowed_logout_urls?.length) {
      apiParams.allowed_logout_urls = removedLogoutUrls
    }

    const removedOrigins = client.allowed_origins?.filter(x => x !== origin)
    if (removedOrigins?.length !== client.allowed_origins?.length) {
      apiParams.allowed_origins = removedOrigins
    }

    const removedWebOrigins = client.web_origins?.filter(x => x !== webOrigin)
    if (removedWebOrigins?.length !== client.web_origins?.length) {
      apiParams.web_origins = removedWebOrigins
    }

    if (Object.keys(apiParams).length === 0) {
      return {
        callbackUrl: false,
        logoutUrl: false,
        origin: false,
        webOrigin: false,
      }
    }

    await this.management.updateClient({ client_id: clientId }, apiParams)

    return {
      callbackUrl: apiParams.callbacks !== undefined,
      logoutUrl: apiParams.allowed_logout_urls !== undefined,
      origin: apiParams.allowed_origins !== undefined,
      webOrigin: apiParams.web_origins !== undefined,
    }
  }
}
