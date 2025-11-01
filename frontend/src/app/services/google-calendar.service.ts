import { Injectable } from '@angular/core';
import { gapi } from 'gapi-script';

@Injectable({
  providedIn: 'root'
})
export class GoogleCalendarService {
  private readonly CLIENT_ID = 'TU_CLIENT_ID_AQUI';
  private readonly API_KEY = 'TU_API_KEY_AQUI';
  private readonly DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  private readonly SCOPES = 'https://www.googleapis.com/auth/calendar';

  private isInitialized = false;
  private isSignedIn = false;

  async initializeGapi(): Promise<void> {
    if (this.isInitialized) return;

    await gapi.load('client:auth2', async () => {
      await gapi.client.init({
        apiKey: this.API_KEY,
        clientId: this.CLIENT_ID,
        discoveryDocs: [this.DISCOVERY_DOC],
        scope: this.SCOPES
      });

      this.isInitialized = true;
      this.isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
    });
  }

  async signIn(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initializeGapi();
    }

    const authInstance = gapi.auth2.getAuthInstance();
    await authInstance.signIn();
    this.isSignedIn = authInstance.isSignedIn.get();
    return this.isSignedIn;
  }

  async signOut(): Promise<void> {
    const authInstance = gapi.auth2.getAuthInstance();
    await authInstance.signOut();
    this.isSignedIn = false;
  }

  async createEvent(eventData: any): Promise<any> {
    if (!this.isSignedIn) {
      throw new Error('Usuario no autenticado con Google');
    }

    const event = {
      summary: eventData.title,
      description: eventData.description,
      start: {
        dateTime: eventData.startDateTime,
        timeZone: 'America/Argentina/Buenos_Aires'
      },
      end: {
        dateTime: eventData.endDateTime,
        timeZone: 'America/Argentina/Buenos_Aires'
      },
      attendees: eventData.attendees || []
    };

    const response = await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });

    return response.result;
  }

  async getEvents(timeMin?: string, timeMax?: string): Promise<any[]> {
    if (!this.isSignedIn) {
      throw new Error('Usuario no autenticado con Google');
    }

    const response = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax,
      showDeleted: false,
      singleEvents: true,
      orderBy: 'startTime'
    });

    return response.result.items || [];
  }

  isUserSignedIn(): boolean {
    return this.isSignedIn;
  }
}