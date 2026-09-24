export interface PhoneMessage {
  id: string;
  from: string;
  preview: string;
  bodyNL: string;
  dialogueId?: string;
  scenarioId?: string;
}

export const HOME_PHONE_MESSAGES: readonly PhoneMessage[] = [
  { id:'lotte-coffee', from:'Lotte', preview:'Heb je straks tijd voor koffie?', bodyNL:'Goedemorgen! Heb je straks tijd voor koffie?', dialogueId:'morning_message', scenarioId:'phone-message' },
  { id:'pieter-package', from:'Pieter', preview:'Ik kan je pakket aannemen.', bodyNL:'Hoi! Als je niet thuis bent, kan ik je pakket aannemen.', dialogueId:'mail_content', scenarioId:'read-mail' },
  { id:'work-reminder', from:'Werk', preview:'Vergeet je agenda niet.', bodyNL:'Goedemorgen. Vergeet niet om je agenda voor negen uur te controleren.' }
] as const;

export const HOME_PHONE_AGENDA = [
  { time:'09:00', title:'Administratie', detailNL:'E-mails lezen en planning controleren.' },
  { time:'12:30', title:'Lunch', detailNL:'Lunchpauze.' },
  { time:'18:30', title:'Was ophangen', detailNL:'Controleer of de was klaar is.' }
] as const;

export const HOME_PHONE_CONTACTS = [
  { name:'Lotte', relationNL:'vriendin', noteNL:'Houdt van koffie en wandelen.' },
  { name:'Pieter', relationNL:'buurman', noteNL:'Woont twee deuren verder.' },
  { name:'Werk', relationNL:'kantoor', noteNL:'Bereikbaar op werkdagen.' }
] as const;
