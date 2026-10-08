/**
 * Values to fill in before publishing the app.
 *
 * PRIVACY_POLICY_URL: the public address of the privacy policy (see docs/PRIVACY_POLICY.md).
 * Both stores ask for it. While it is empty the "Privacy policy" row in Settings is hidden.
 *
 * CHAT_API_URL: the address of YOUR chat server (see server/chat-proxy.js), for example
 * "https://my-chat.example.com/chat". Never put an AI API key in the app: anyone can extract it.
 * While it is empty the chat opens but explains that it is not set up yet.
 */
export const PRIVACY_POLICY_URL = '';

export const CHAT_API_URL = 'https://health-chat.yyut7773.workers.dev/chat';

/**
 * REGISTRATION_API_URL: the address of your Worker WITHOUT /chat at the end, for example
 * "https://health-chat.yourname.workers.dev". When it is not empty, the Register screen shows an
 * optional box; only if she ticks it, her name, email, phone and YEAR of birth are saved on your
 * server (see worker/schema.sql). Leave it empty to keep everything on the phone.
 */
export const REGISTRATION_API_URL = 'https://health-chat.yyut7773.workers.dev';