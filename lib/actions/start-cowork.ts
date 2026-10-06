import { Crypto, FragmentData, type Not3Client, type P2PRoom } from '@not3/sdk'
import { OkDialog, TextInputDialog, YesNoDialog } from '~/lib/dialog'
import { activeCowork, coworkShareOpen, leaveCowork } from '~/lib/cowork/active'
import { CoworkSession, colorForPeer, type CoworkSessionKind, type CoworkKind } from '~/lib/cowork/session'
import { CoworkText } from '~/lib/cowork/text'
import { p2pApiFor } from '~/lib/transfer/p2p'

async function displayName(): Promise<string | null> {
  const store = useAppStore()
  const settings = useSettingsStore()
  if (settings.cowork.displayName.trim()) return settings.cowork.displayName.trim()
  return new Promise(resolve => {
    store.dialog = new TextInputDialog('Your name', 'Choose the name other participants will see.', 'Display name', '', value => {
      const name = value.trim()
      if (!name) { store.dialog = new OkDialog('Name required', 'Enter a name to join the cowork session.'); resolve(null); return }
      settings.cowork.displayName = name
      resolve(name)
    }, () => resolve(null))
  })
}

function showJoinError(error: unknown) {
  const store = useAppStore()
  const code = (error as { code?: string })?.code
  if (code === 'session-full' || code === 'not-found') {
    const title = code === 'session-full' ? 'Session full' : 'Session not found'
    store.dialog = new YesNoDialog(title, 'This cowork session is unavailable.', () => {
      void navigator.clipboard.writeText(store.content)
      leaveCowork()
      store.keepContent = true
      store.pushToRouter('/', true)
    }, () => {}, 'Copy content and open as plain note', 'Close')
  } else store.dialog = new OkDialog('Cowork error', error instanceof Error ? error.message : 'Could not connect to the cowork session.')
}

function buildSession(client: Not3Client, seed: string, name: string, initial: string, language: string | undefined, kind: CoworkSessionKind) {
  const store = useAppStore()
  let text: CoworkText | null = null
  const session = new CoworkSession({
    makeRoom: options => client.p2p().room(options) as P2PRoom,
    seed, kind, name, language,
    onKindMismatch: () => { store.dialog = new OkDialog('Cowork error', 'This link is for a different document kind.'); leaveCowork() },
    onKindResolved: resolved => configureKind(resolved),
    onError: error => {
      const code = (error as { code?: string }).code
      if (code === 'not-found' || code === 'session-full') showJoinError(error)
      else console.error('Cowork room error', error)
    },
    onIdentity: id => { text?.setIdentity(id, colorForPeer(id)); activeCowork.value?.draw?.setIdentity() },
    saveAsNote: async () => {
      if (session.kind === 'draw') await activeCowork.value?.draw?.requestScene()
      await store.saveCoworkSnapshot()
    },
  })
  activeCowork.value = { session, text: null, draw: null }
  function configureKind(resolved: CoworkKind) {
    if (resolved === 'draw') {
      store.excalidraw = true
      store.content = initial || JSON.stringify({ type: 'EXCALIDRAW', data: [] })
    } else {
      text = new CoworkText(session, { content: initial, name, color: '#38bdf8', peerId: session.peerId, onContent: value => { store.content = value }, onStalePeer: id => session.forgetPeer(id), onSeenPeer: (id, peerName) => session.rememberPeer(id, peerName) })
      if (session.peerId) text.setIdentity(session.peerId, colorForPeer(session.peerId))
    }
    activeCowork.value = { session, text, draw: activeCowork.value?.draw || null }
  }
  if (kind !== 'unknown') configureKind(kind)
  return session
}

export async function START_COWORK() {
  const store = useAppStore()
  if (!store.info.p2pRooms || store.readonly || store.settings || (store.excalidraw && !store.config.drawURL) || activeCowork.value) return
  const name = await displayName()
  if (!name) return
  const client = p2pApiFor(null, store.api.getOptions().baseUrl, window.location.origin, store.api.getOptions().password)
  const session = buildSession(client, Crypto.generateSeed(), name, store.content, store.selectedLanguage || store.detectedLanguage || 'plaintext', store.excalidraw ? 'draw' : 'text')
  try {
    await session.create()
    coworkShareOpen.value = true
  } catch (error) { leaveCowork(); showJoinError(error) }
}

export async function joinCowork(roomId: string, href: string): Promise<void> {
  const store = useAppStore()
  const settings = useSettingsStore()
  let fragment: FragmentData
  try { fragment = FragmentData.fromURL(href) } catch { store.dialog = new OkDialog('Cowork error', 'Could not read the cowork link.'); return }
  if (fragment.cryptoMode !== 'gcm') { store.dialog = new OkDialog('Cowork error', 'Invalid cowork link.'); return }
  if (fragment.server && settings.warnings.unknownServer && settings.customServer.url !== fragment.server && !settings.trustedServers.includes(fragment.server)) {
    const trusted = await new Promise<boolean>(resolve => store.dialog = new YesNoDialog('Warning', [
      'This note is hosted on a private server:', fragment.server + '\n', 'Do you trust this server?', '(Your IP address will be sent to the server.)',
    ].join('\n'), () => { settings.trustedServers.push(fragment.server!); resolve(true) }, () => resolve(false)))
    if (!trusted) { store.pushToRouter('/', true); return }
  }
  const name = await displayName()
  if (!name) return
  const base = store.api.getOptions().baseUrl
  const client = p2pApiFor(fragment.server, base, window.location.origin, fragment.server ? undefined : store.api.getOptions().password)
  const session = buildSession(client, fragment.seed, name, '', undefined, 'unknown')
  try { await session.join(roomId) } catch (error) { leaveCowork(); showJoinError(error) }
}
