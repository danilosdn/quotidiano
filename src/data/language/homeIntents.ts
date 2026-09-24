import type { IntentDefinition } from '../../game/dialogue/types';

export const HOME_INTENTS: readonly IntentDefinition[] = [
  { id:'CONFIRM_READY', variants:['Ja.','Ja, graag.','Ik ben klaar.','Prima.','Oké.'], confirmationNL:'Mooi, je bent klaar.' },
  { id:'DECLINE', variants:['Nee.','Nee, dank je.','Liever niet.','Nu niet.'], confirmationNL:'Dat is goed.' },
  { id:'STOP_ALARM', variants:['Stop.','Zet de wekker uit.','Ik sta op.'], confirmationNL:'De wekker is uit.' },
  { id:'SNOOZE', variants:['Nog vijf minuten.','Sluimeren, alsjeblieft.','Ik wil nog even slapen.'], confirmationNL:'Over vijf minuten gaat de wekker opnieuw.' },
  { id:'OPEN_CURTAINS', variants:['Doe de gordijnen open.','Ik open de gordijnen.','Laat het licht binnen.'], confirmationNL:'Het ochtendlicht komt binnen.' },
  { id:'CHOOSE_OUTFIT', variants:['Ik kies deze kleren.','Deze outfit is goed.','Ik trek dit aan.'], confirmationNL:'Deze kleren passen bij vandaag.' },
  { id:'NEED_COAT', variants:['Ik heb een jas nodig.','Ik trek mijn jas aan.','Het is koud, dus ik neem een jas.'], confirmationNL:'Je jas hangt klaar bij de deur.' },
  { id:'NO_COAT', variants:['Ik heb geen jas nodig.','Zonder jas is goed.','Het is warm genoeg.'], confirmationNL:'Je laat de jas aan de kapstok.' },
  { id:'WASH', variants:['Ik was mijn handen.','Ik wil me wassen.','Even wassen.'], confirmationNL:'Alles is weer schoon.' },
  { id:'BRUSH_TEETH', variants:['Ik poets mijn tanden.','Tanden poetsen.','Waar is mijn tandenborstel?'], confirmationNL:'Je tanden voelen schoon.' },
  { id:'MAKE_COFFEE', variants:['Ik zet koffie.','Een kop koffie, graag.','Tijd voor koffie.'], confirmationNL:'De koffie wordt gezet.' },
  { id:'MAKE_TOAST', variants:['Ik maak toast.','Ik rooster het brood.','Brood in de broodrooster.'], confirmationNL:'De toast wordt goudbruin.' },
  { id:'SIT_DOWN', variants:['Ik ga zitten.','Mag ik hier zitten?','Even zitten.'], confirmationNL:'Je gaat rustig zitten.' },
  { id:'EAT_BREAKFAST', variants:['Ik eet mijn ontbijt.','Tijd om te eten.','Ik begin aan het ontbijt.'], confirmationNL:'Eet smakelijk.' },
  { id:'DRINK_COFFEE', variants:['Ik drink de koffie.','Een slok koffie.','De koffie ruikt lekker.'], confirmationNL:'De koffie is warm.' },
  { id:'READ_MESSAGE', variants:['Ik lees het bericht.','Open het bericht.','Wat schrijft Lotte?'], confirmationNL:'Je opent het bericht.' },
  { id:'ACCEPT_COFFEE', variants:['Ja.','Graag.','Ja, graag.','Dat is goed.','Een koffie graag.'], confirmationNL:'Prima. Tot straks!' },
  { id:'DECLINE_COFFEE', variants:['Nee, bedankt.','Vandaag niet.','Misschien een andere keer.'], confirmationNL:'Geen probleem. Een andere keer.' },
  { id:'FIND_KEYS', variants:['Waar zijn mijn sleutels?','Ik zoek mijn sleutels.','Mijn sleutels zijn weg.'], confirmationNL:'Kijk op het halmeubel.' },
  { id:'KEYS_FOUND', variants:['Ik heb ze gevonden.','Daar zijn de sleutels.','Gevonden!'], confirmationNL:'De sleutels liggen in het schaaltje.' },
  { id:'READ_MAIL', variants:['Ik lees de brief.','Wat staat er in de brief?','Open de post.'], confirmationNL:'Je maakt de brief open.' },
  { id:'START_LAUNDRY', variants:['Ik doe de was.','Start de wasmachine.','De kleren moeten gewassen worden.'], confirmationNL:'De wasmachine kan beginnen.' },
  { id:'ADD_DETERGENT', variants:['Ik voeg wasmiddel toe.','Wasmiddel erbij.','Eerst het wasmiddel.'], confirmationNL:'Het wasmiddel zit in de machine.' },
  { id:'RELAX', variants:['Ik wil ontspannen.','Even op de bank.','Ik neem rust.'], confirmationNL:'Je neemt even rust.' },
  { id:'TURN_ON_TV', variants:['Zet de televisie aan.','Ik kijk even televisie.','De tv mag aan.'], confirmationNL:'De televisie gaat aan.' },
  { id:'GO_TO_SLEEP', variants:['Ik ga slapen.','Welterusten.','Tijd voor bed.'], confirmationNL:'Welterusten.' },
  { id:'OPEN_DOOR', variants:['Doe de deur open.','Ik open de voordeur.','De deur mag open.'], confirmationNL:'De voordeur gaat open.' },
  { id:'ASK_REPEAT', variants:['Kun je dat herhalen?','Nog een keer, alsjeblieft.','Pardon?'], confirmationNL:'Natuurlijk, ik herhaal het.' },
  { id:'CORRECT_SELF', variants:['Sorry, ik bedoel...','Nee, dat bedoel ik niet.','Laat me mezelf verbeteren.'], confirmationNL:'Geen probleem. Probeer het opnieuw.' },
  { id:'GREET_VISITOR', variants:['Hallo, kom binnen.','Goedemorgen!','Hoi, fijn je te zien.'], confirmationNL:'De bezoeker glimlacht.' }
] as const;

export const HOME_INTENT_VARIANTS: Record<string, string[]> = Object.fromEntries(
  HOME_INTENTS.map((intent) => [intent.id, [...intent.variants]])
);

export const intentById = (id: string): IntentDefinition | undefined => HOME_INTENTS.find((intent) => intent.id === id);
