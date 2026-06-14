/**
 * Выбор видеотрека для воспроизведения: в одном PeerConnection может приходить
 * и камера, и экран — &lt;video&gt; по умолчанию берёт первый трек (часто «пустой»).
 */

export type VideoPlaybackMode = 'auto' | 'screen' | 'camera';

/** Эвристика: демонстрация экрана vs веб-камера по settings и label трека. */
export function classifyVideoTrack(track: MediaStreamTrack): 'screen' | 'camera' {
  if (track.kind !== 'video') return 'camera';
  try {
    const settings = track.getSettings?.() ?? {};
    const ds = (settings as { displaySurface?: string }).displaySurface;
    if (ds === 'monitor' || ds === 'window' || ds === 'browser') return 'screen';
  } catch {
    /* ignore */
  }
  const label = (track.label || '').toLowerCase();
  if (
    label.includes('screen') ||
    label.includes('display') ||
    label.includes('monitor') ||
    label.includes('window') ||
    label.includes('desktop') ||
    label.includes('capture') ||
    label.includes('obs') ||
    label.includes('zoom') ||
    label.includes('teams')
  ) {
    return 'screen';
  }
  return 'camera';
}

export function pickVideoTrackFromStream(
  stream: MediaStream | null,
  mode: VideoPlaybackMode,
  hint: { screenPreferred?: boolean; cameraPreferred?: boolean },
): MediaStreamTrack | null {
  if (!stream) return null;
  const videos = stream.getVideoTracks().filter((t) => t.readyState !== 'ended');
  if (videos.length === 0) return null;
  if (videos.length === 1) return videos[0];

  const screenTracks = videos.filter((t) => classifyVideoTrack(t) === 'screen');
  const cameraTracks = videos.filter((t) => classifyVideoTrack(t) === 'camera');

  if (mode === 'screen') {
    if (screenTracks.length > 0) return screenTracks[0];
    return videos[videos.length - 1];
  }
  if (mode === 'camera') {
    if (cameraTracks.length > 0) return cameraTracks[0];
    return videos[0];
  }

  if (hint.screenPreferred && screenTracks.length > 0) return screenTracks[0];
  if (hint.cameraPreferred && cameraTracks.length > 0) return cameraTracks[0];
  if (screenTracks.length > 0 && cameraTracks.length > 0) return screenTracks[0];
  if (screenTracks.length > 0) return screenTracks[0];
  /* Участник демонстрирует экран по данным канала, но трек не распознан как screen — часто второй трек после камеры */
  if (hint.screenPreferred && videos.length > 1) return videos[videos.length - 1];
  return videos[0];
}
