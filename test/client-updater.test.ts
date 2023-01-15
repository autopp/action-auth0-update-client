import { mock, MockProxy } from 'jest-mock-extended'
import { ClientUpdater, ManagementClient, UpdateParams, UpdateResult } from '../src/client-updater'

describe('ClientUpdater', () => {
  let clientUpdater: ClientUpdater
  let mockClient: MockProxy<ManagementClient>
  const clientId = 'client-id'
  const existingCallbackUrl = 'https://example.com/callback'
  const newCallbackUrl = 'https://new.example.com/callback'
  const existingLogoutUrl = 'https://example.com/logout'
  const newLogoutUrl = 'https://new.example.com/logout'
  const existingOrigin = 'https://example.com'
  const newOrigin = 'https://new.example.com'
  const existingWebOrigin = 'https://web.example.com'
  const newWebOrigin = 'https://web.new.example.com'

  beforeEach(() => {
    mockClient = mock()
    mockClient.getClient.mockResolvedValue({
      client_id: clientId,
      callbacks: [existingCallbackUrl],
      allowed_logout_urls: [existingLogoutUrl],
      allowed_origins: [existingOrigin],
      web_origins: [existingWebOrigin],
    })

    clientUpdater = new ClientUpdater(mockClient)
  })

  describe('.add()', () => {
    it.each<[string, UpdateParams, UpdateResult, Record<string, unknown>]>([
      [
        'adds given callback url',
        { callbackUrl: newCallbackUrl },
        {
          callbackUrl: true,
          logoutUrl: false,
          origin: false,
          webOrigin: false,
        },
        { callbacks: [existingCallbackUrl, newCallbackUrl] },
      ],
      [
        'adds given logout url',
        { logoutUrl: newLogoutUrl },
        {
          callbackUrl: false,
          logoutUrl: true,
          origin: false,
          webOrigin: false,
        },
        { allowed_logout_urls: [existingLogoutUrl, newLogoutUrl] },
      ],
      [
        'adds given origin',
        { origin: newOrigin },
        {
          callbackUrl: false,
          logoutUrl: false,
          origin: true,
          webOrigin: false,
        },
        { allowed_origins: [existingOrigin, newOrigin] },
      ],
      [
        'adds given web origin',
        { webOrigin: newWebOrigin },
        {
          callbackUrl: false,
          logoutUrl: false,
          origin: false,
          webOrigin: true,
        },
        { web_origins: [existingWebOrigin, newWebOrigin] },
      ],
      [
        'adds given all parameters',
        {
          callbackUrl: newCallbackUrl,
          logoutUrl: newLogoutUrl,
          origin: newOrigin,
          webOrigin: newWebOrigin,
        },
        { callbackUrl: true, logoutUrl: true, origin: true, webOrigin: true },
        {
          callbacks: [existingCallbackUrl, newCallbackUrl],
          allowed_logout_urls: [existingLogoutUrl, newLogoutUrl],
          allowed_origins: [existingOrigin, newOrigin],
          web_origins: [existingWebOrigin, newWebOrigin],
        },
      ],
    ])('%s', async (_, params, expectedResult, expectedApiParams) => {
      // Act
      const actual = await clientUpdater.add(clientId, params)

      // Assert
      expect(actual).toEqual(expectedResult)
      expect(mockClient.updateClient.mock.calls).toEqual([[{ client_id: clientId }, expectedApiParams]])
    })

    it.each<[string, UpdateParams, UpdateResult]>([
      [
        'dose not add given callback url when it is duplicated',
        { callbackUrl: existingCallbackUrl },
        {
          callbackUrl: false,
          logoutUrl: false,
          origin: false,
          webOrigin: false,
        },
      ],
      [
        'dose not add given logout url when it is duplicated',
        { logoutUrl: existingLogoutUrl },
        {
          callbackUrl: false,
          logoutUrl: false,
          origin: false,
          webOrigin: false,
        },
      ],
      [
        'dose not add given origin when it is duplicated',
        { origin: existingOrigin },
        {
          callbackUrl: false,
          logoutUrl: false,
          origin: false,
          webOrigin: false,
        },
      ],
      [
        'dose not add given web origin when it is duplicated',
        { webOrigin: existingWebOrigin },
        {
          callbackUrl: false,
          logoutUrl: false,
          origin: false,
          webOrigin: false,
        },
      ],
      [
        'dose not add given any parameters when there are duplicated',
        {
          callbackUrl: existingCallbackUrl,
          logoutUrl: existingLogoutUrl,
          origin: existingOrigin,
          webOrigin: existingWebOrigin,
        },
        {
          callbackUrl: false,
          logoutUrl: false,
          origin: false,
          webOrigin: false,
        },
      ],
    ])('%s', async (_, params, expectedResult) => {
      // Act
      const actual = await clientUpdater.add(clientId, params)

      // Assert
      expect(actual).toEqual(expectedResult)
      expect(mockClient.updateClient).not.toHaveBeenCalled()
    })
  })

  describe('.remove()', () => {
    it.each<[string, UpdateParams, UpdateResult, Record<string, unknown>]>([
      [
        'removes given callback url',
        { callbackUrl: existingCallbackUrl },
        {
          callbackUrl: true,
          logoutUrl: false,
          origin: false,
          webOrigin: false,
        },
        { callbacks: [] },
      ],
      [
        'removes given logout url',
        { logoutUrl: existingLogoutUrl },
        {
          callbackUrl: false,
          logoutUrl: true,
          origin: false,
          webOrigin: false,
        },
        { allowed_logout_urls: [] },
      ],
      [
        'removes given origin',
        { origin: existingOrigin },
        {
          callbackUrl: false,
          logoutUrl: false,
          origin: true,
          webOrigin: false,
        },
        { allowed_origins: [] },
      ],
      [
        'removes given web origin',
        { webOrigin: existingWebOrigin },
        {
          callbackUrl: false,
          logoutUrl: false,
          origin: false,
          webOrigin: true,
        },
        { web_origins: [] },
      ],
      [
        'removes given all parameters',
        {
          callbackUrl: existingCallbackUrl,
          logoutUrl: existingLogoutUrl,
          origin: existingOrigin,
          webOrigin: existingWebOrigin,
        },
        { callbackUrl: true, logoutUrl: true, origin: true, webOrigin: true },
        {
          callbacks: [],
          allowed_logout_urls: [],
          allowed_origins: [],
          web_origins: [],
        },
      ],
    ])('%s', async (_, params, expectedResult, expectedApiParams) => {
      // Act
      const actual = await clientUpdater.remove(clientId, params)

      // Assert
      expect(actual).toEqual(expectedResult)
      expect(mockClient.updateClient.mock.calls).toEqual([[{ client_id: clientId }, expectedApiParams]])
    })

    it.each<[string, UpdateParams, UpdateResult]>([
      [
        'dose not remove given callback url when it is not registered',
        { callbackUrl: newCallbackUrl },
        {
          callbackUrl: false,
          logoutUrl: false,
          origin: false,
          webOrigin: false,
        },
      ],
      [
        'dose not remove given logout url when it is not registered',
        { logoutUrl: newLogoutUrl },
        {
          callbackUrl: false,
          logoutUrl: false,
          origin: false,
          webOrigin: false,
        },
      ],
      [
        'dose not remove given origin when it is not registered',
        { origin: newOrigin },
        {
          callbackUrl: false,
          logoutUrl: false,
          origin: false,
          webOrigin: false,
        },
      ],
      [
        'dose not remove given web origin when it is not registered',
        { webOrigin: newWebOrigin },
        {
          callbackUrl: false,
          logoutUrl: false,
          origin: false,
          webOrigin: false,
        },
      ],
      [
        'dose not remove given any parameters when there are registered',
        {
          callbackUrl: newCallbackUrl,
          logoutUrl: newLogoutUrl,
          origin: newOrigin,
          webOrigin: newWebOrigin,
        },
        {
          callbackUrl: false,
          logoutUrl: false,
          origin: false,
          webOrigin: false,
        },
      ],
    ])('%s', async (_, params, expectedResult) => {
      // Act
      const actual = await clientUpdater.remove(clientId, params)

      // Assert
      expect(actual).toEqual(expectedResult)
      expect(mockClient.updateClient).not.toHaveBeenCalled()
    })
  })
})
