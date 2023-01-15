import * as core from '@actions/core'
import { ManagementClient, ManagementClientOptions } from 'auth0'
import { ClientUpdater, UpdateParams, UpdateResult } from './client-updater'

async function run(): Promise<void> {
  try {
    const domain = core.getInput('domain', { required: true })
    const apiClientId = core.getInput('api_client_id', { required: true })
    const apiClientSecret = core.getInput('api_client_secret', {
      required: true,
    })
    const operation = core.getInput('operation', { required: true })
    if (operation !== 'add' && operation !== 'remove') {
      throw new Error('operation should be "add" or "remove"')
    }

    const clientId = core.getInput('client_id', { required: true })
    const callbackUrl = core.getInput('callback_url')
    const logoutUrl = core.getInput('logout_url')
    const webOrigin = core.getInput('web_origin')
    const origin = core.getInput('origin')
    const telemetry = core.getInput('telemetry') === '' ? false : core.getBooleanInput('telemetry')

    // TODO: remove cast after https://github.com/DefinitelyTyped/DefinitelyTyped/pull/63915 is merged
    const management = new ManagementClient({
      domain,
      clientId: apiClientId,
      clientSecret: apiClientSecret,
      scope: 'read:clients update:clients',
      telemetry,
    } as ManagementClientOptions)

    const clientUpdater = new ClientUpdater(management)
    const params: UpdateParams = {}
    if (callbackUrl !== '') {
      params['callbackUrl'] = callbackUrl
    }
    if (logoutUrl !== '') {
      params['logoutUrl'] = logoutUrl
    }
    if (webOrigin !== '') {
      params['webOrigin'] = webOrigin
    }
    if (origin !== '') {
      params['origin'] = origin
    }

    const result = await clientUpdater[operation](clientId, params)

    const updatedProps = (Object.keys(result) as (keyof UpdateResult)[]).filter(p => result[p])
    const message = updatedProps.length === 0 ? 'Nothing to do' : `Updated ${updatedProps.join(', ')}`
    core.info(message)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
