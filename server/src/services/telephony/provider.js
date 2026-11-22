/**
 * Telephony boundary. A real provider (Twilio, etc.) can implement this
 * interface later without changing any controller or client code.
 */
export class TelephonyProvider {
  get name() {
    return 'abstract';
  }

  async initiateCall() {
    throw new Error('initiateCall() must be implemented by a provider');
  }

  async getStatus() {
    throw new Error('getStatus() must be implemented by a provider');
  }

  async endCall() {
    throw new Error('endCall() must be implemented by a provider');
  }
}
