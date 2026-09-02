import auth from 'firebase-tools/lib/auth.js';
import config from 'firebase-tools/lib/configstore.js';

export async function firestoreClient(project) {
  if (!/^[a-z][a-z0-9-]+$/.test(project ?? ''))
    throw new Error('Pass an explicit --project Firebase project ID.');
  const refreshToken = config.configstore.get('tokens')?.refresh_token;
  if (!refreshToken)
    throw new Error(
      'Sign in with npx firebase login before running this command.',
    );
  const { access_token: token } = await auth.getAccessToken(refreshToken, [
    'https://www.googleapis.com/auth/cloud-platform',
  ]);
  const database = `projects/${project}/databases/(default)`;
  const request = async (url, body) => {
    const response = await fetch(url, {
      method: body ? 'POST' : 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(30_000),
    });
    const data = await response.json();
    const error = Array.isArray(data)
      ? data.find((item) => item.error)?.error
      : data.error;
    if (!response.ok || error)
      throw new Error(
        `Firebase request failed (${response.status}): ${error?.message ?? response.statusText}`,
      );
    return data;
  };
  return {
    database,
    request,
    firestore: (path, body) =>
      request(`https://firestore.googleapis.com/v1/${database}/${path}`, body),
  };
}
