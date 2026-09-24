import type { DialogueLine } from '../../game/dialogue/types';

export const HOME_DIALOGUES: readonly DialogueLine[] = [
  {
    "id": "alarm_start",
    "scenarioId": "morning-alarm",
    "speaker": "Wekker",
    "level": "A1",
    "textNL": "Goedemorgen. Het is zeven uur.",
    "hintPT": "Bom dia. São sete horas.",
    "keywordNL": "zeven uur",
    "starterNL": "Het is...",
    "intents": [
      "STOP_ALARM",
      "SNOOZE"
    ],
    "responses": [
      {
        "text": "Ik sta op.",
        "intent": "STOP_ALARM"
      },
      {
        "text": "Nog vijf minuten.",
        "intent": "SNOOZE"
      }
    ]
  },
  {
    "id": "alarm_choice",
    "scenarioId": "morning-alarm",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "De wekker blijft rinkelen. Wat doe je?",
    "hintPT": "O despertador continua tocando. O que você faz?",
    "keywordNL": "de wekker",
    "starterNL": "Ik...",
    "intents": [
      "STOP_ALARM",
      "SNOOZE"
    ],
    "responses": [
      {
        "text": "Zet de wekker uit.",
        "intent": "STOP_ALARM"
      },
      {
        "text": "Sluimeren.",
        "intent": "SNOOZE"
      }
    ]
  },
  {
    "id": "alarm_stopped",
    "scenarioId": "morning-alarm",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "De wekker is uit. De kamer is stil.",
    "hintPT": "O despertador está desligado. O quarto está silencioso.",
    "keywordNL": "stil",
    "starterNL": "De wekker...",
    "intents": [
      "CONFIRM_READY"
    ],
    "responses": [
      {
        "text": "Ik ben klaar.",
        "intent": "CONFIRM_READY"
      }
    ]
  },
  {
    "id": "alarm_snoozed",
    "scenarioId": "morning-alarm",
    "speaker": "Wekker",
    "level": "A1",
    "textNL": "Goed, nog vijf minuten.",
    "hintPT": "Certo, mais cinco minutos.",
    "keywordNL": "vijf minuten",
    "starterNL": "Nog...",
    "intents": [
      "CONFIRM_READY"
    ],
    "responses": [
      {
        "text": "Oké.",
        "intent": "CONFIRM_READY"
      }
    ]
  },
  {
    "id": "alarm_ready",
    "scenarioId": "morning-alarm",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Je zet je voeten op de vloer en staat op.",
    "hintPT": "Você põe os pés no chão e se levanta.",
    "keywordNL": "opstaan",
    "starterNL": "Ik sta...",
    "intents": [
      "CONFIRM_READY"
    ],
    "responses": [
      {
        "text": "Ik sta op.",
        "intent": "CONFIRM_READY"
      }
    ]
  },
  {
    "id": "curtain_intro",
    "scenarioId": "curtain-weather",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "De gordijnen zijn nog dicht.",
    "hintPT": "As cortinas ainda estão fechadas.",
    "keywordNL": "de gordijnen",
    "starterNL": "De gordijnen...",
    "intents": [
      "OPEN_CURTAINS"
    ],
    "responses": [
      {
        "text": "Ik open de gordijnen.",
        "intent": "OPEN_CURTAINS"
      }
    ]
  },
  {
    "id": "curtain_open",
    "scenarioId": "curtain-weather",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Er komt zacht ochtendlicht binnen.",
    "hintPT": "Uma luz suave da manhã entra.",
    "keywordNL": "ochtendlicht",
    "starterNL": "Er komt...",
    "intents": [
      "CONFIRM_READY"
    ],
    "responses": [
      {
        "text": "Mooi.",
        "intent": "CONFIRM_READY"
      }
    ]
  },
  {
    "id": "weather_observe",
    "scenarioId": "curtain-weather",
    "speaker": "Verteller",
    "level": "A2",
    "textNL": "Buiten is het bewolkt en een beetje koel.",
    "hintPT": "Lá fora está nublado e um pouco frio.",
    "keywordNL": "bewolkt",
    "starterNL": "Buiten is...",
    "intents": [
      "NEED_COAT",
      "NO_COAT"
    ],
    "responses": [
      {
        "text": "Ik neem een jas.",
        "intent": "NEED_COAT"
      },
      {
        "text": "Geen jas vandaag.",
        "intent": "NO_COAT"
      }
    ]
  },
  {
    "id": "weather_coat",
    "scenarioId": "curtain-weather",
    "speaker": "Telefoon",
    "level": "A1",
    "textNL": "Vandaag wordt het veertien graden.",
    "hintPT": "Hoje fará catorze graus.",
    "keywordNL": "veertien graden",
    "starterNL": "Vandaag wordt...",
    "intents": [
      "NEED_COAT",
      "NO_COAT"
    ],
    "responses": [
      {
        "text": "Ik heb een jas nodig.",
        "intent": "NEED_COAT"
      },
      {
        "text": "Het is warm genoeg.",
        "intent": "NO_COAT"
      }
    ]
  },
  {
    "id": "weather_done",
    "scenarioId": "curtain-weather",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Je weet nu wat je buiten nodig hebt.",
    "hintPT": "Agora você sabe do que precisa lá fora.",
    "keywordNL": "nodig hebben",
    "starterNL": "Ik heb...",
    "intents": [
      "CONFIRM_READY"
    ],
    "responses": [
      {
        "text": "Ik ben klaar.",
        "intent": "CONFIRM_READY"
      }
    ]
  },
  {
    "id": "outfit_intro",
    "scenarioId": "choose-outfit",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "De kledingkast staat voor je.",
    "hintPT": "O guarda-roupa está à sua frente.",
    "keywordNL": "de kledingkast",
    "starterNL": "De kast...",
    "intents": [
      "CHOOSE_OUTFIT"
    ],
    "responses": [
      {
        "text": "Ik kies mijn kleren.",
        "intent": "CHOOSE_OUTFIT"
      }
    ]
  },
  {
    "id": "outfit_options",
    "scenarioId": "choose-outfit",
    "speaker": "Verteller",
    "level": "A2",
    "textNL": "Je ziet een gele jas, een groen shirt en een donkere broek.",
    "hintPT": "Você vê uma jaqueta amarela, uma camiseta verde e uma calça escura.",
    "keywordNL": "de broek",
    "starterNL": "Ik zie...",
    "intents": [
      "CHOOSE_OUTFIT"
    ],
    "responses": [
      {
        "text": "Ik trek dit aan.",
        "intent": "CHOOSE_OUTFIT"
      }
    ]
  },
  {
    "id": "outfit_chosen",
    "scenarioId": "choose-outfit",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "De outfit zit comfortabel.",
    "hintPT": "A roupa é confortável.",
    "keywordNL": "comfortabel",
    "starterNL": "De outfit...",
    "intents": [
      "CONFIRM_READY"
    ],
    "responses": [
      {
        "text": "Prima.",
        "intent": "CONFIRM_READY"
      }
    ]
  },
  {
    "id": "coat_question",
    "scenarioId": "choose-outfit",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Neem je ook een jas mee?",
    "hintPT": "Você também leva um casaco?",
    "keywordNL": "de jas",
    "starterNL": "Ik neem...",
    "intents": [
      "NEED_COAT",
      "NO_COAT"
    ],
    "responses": [
      {
        "text": "Ja, ik neem een jas.",
        "intent": "NEED_COAT"
      },
      {
        "text": "Nee, zonder jas.",
        "intent": "NO_COAT"
      }
    ]
  },
  {
    "id": "outfit_done",
    "scenarioId": "choose-outfit",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Je bent aangekleed voor de dag.",
    "hintPT": "Você está vestido para o dia.",
    "keywordNL": "aangekleed",
    "starterNL": "Ik ben...",
    "intents": [
      "CONFIRM_READY"
    ],
    "responses": [
      {
        "text": "Ik ben klaar.",
        "intent": "CONFIRM_READY"
      }
    ]
  },
  {
    "id": "hygiene_intro",
    "scenarioId": "morning-hygiene",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "In de badkamer hoor je zacht stromend water.",
    "hintPT": "No banheiro você ouve água correndo suavemente.",
    "keywordNL": "de badkamer",
    "starterNL": "In de badkamer...",
    "intents": [
      "WASH"
    ],
    "responses": [
      {
        "text": "Ik wil me wassen.",
        "intent": "WASH"
      }
    ]
  },
  {
    "id": "shower_prompt",
    "scenarioId": "morning-hygiene",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "De douche is klaar. Wil je douchen?",
    "hintPT": "O chuveiro está pronto. Você quer tomar banho?",
    "keywordNL": "douchen",
    "starterNL": "Ik wil...",
    "intents": [
      "WASH",
      "DECLINE"
    ],
    "responses": [
      {
        "text": "Ja, ik ga douchen.",
        "intent": "WASH"
      },
      {
        "text": "Nu niet.",
        "intent": "DECLINE"
      }
    ]
  },
  {
    "id": "sink_prompt",
    "scenarioId": "morning-hygiene",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Je handen en je gezicht kunnen nog gewassen worden.",
    "hintPT": "Suas mãos e seu rosto ainda podem ser lavados.",
    "keywordNL": "wassen",
    "starterNL": "Ik was...",
    "intents": [
      "WASH"
    ],
    "responses": [
      {
        "text": "Ik was mijn handen.",
        "intent": "WASH"
      }
    ]
  },
  {
    "id": "brush_prompt",
    "scenarioId": "morning-hygiene",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "De tandenborstel staat naast de wastafel.",
    "hintPT": "A escova de dentes está ao lado da pia.",
    "keywordNL": "de tandenborstel",
    "starterNL": "Ik poets...",
    "intents": [
      "BRUSH_TEETH"
    ],
    "responses": [
      {
        "text": "Ik poets mijn tanden.",
        "intent": "BRUSH_TEETH"
      }
    ]
  },
  {
    "id": "hygiene_done",
    "scenarioId": "morning-hygiene",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Je voelt je fris en klaar voor de dag.",
    "hintPT": "Você se sente renovado e pronto para o dia.",
    "keywordNL": "fris",
    "starterNL": "Ik voel...",
    "intents": [
      "CONFIRM_READY"
    ],
    "responses": [
      {
        "text": "Ik ben klaar.",
        "intent": "CONFIRM_READY"
      }
    ]
  },
  {
    "id": "breakfast_intro",
    "scenarioId": "make-breakfast",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Je hebt trek. In de keuken kun je ontbijt maken.",
    "hintPT": "Você está com fome. Na cozinha pode preparar o café da manhã.",
    "keywordNL": "trek hebben",
    "starterNL": "Ik heb...",
    "intents": [
      "MAKE_TOAST",
      "MAKE_COFFEE"
    ],
    "responses": [
      {
        "text": "Ik maak toast.",
        "intent": "MAKE_TOAST"
      },
      {
        "text": "Ik zet koffie.",
        "intent": "MAKE_COFFEE"
      }
    ]
  },
  {
    "id": "toast_prompt",
    "scenarioId": "make-breakfast",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Het brood ligt klaar bij de broodrooster.",
    "hintPT": "O pão está pronto perto da torradeira.",
    "keywordNL": "het brood",
    "starterNL": "Ik rooster...",
    "intents": [
      "MAKE_TOAST"
    ],
    "responses": [
      {
        "text": "Ik rooster het brood.",
        "intent": "MAKE_TOAST"
      }
    ]
  },
  {
    "id": "coffee_prompt",
    "scenarioId": "make-breakfast",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "De koffiemachine is leeg. Zet je koffie?",
    "hintPT": "A cafeteira está vazia. Você prepara café?",
    "keywordNL": "de koffie",
    "starterNL": "Ik zet...",
    "intents": [
      "MAKE_COFFEE"
    ],
    "responses": [
      {
        "text": "Een kop koffie, graag.",
        "intent": "MAKE_COFFEE"
      }
    ]
  },
  {
    "id": "table_prompt",
    "scenarioId": "make-breakfast",
    "speaker": "Verteller",
    "level": "A2",
    "textNL": "Toast en koffie staan op tafel. Ga rustig zitten.",
    "hintPT": "Torrada e café estão na mesa. Sente-se com calma.",
    "keywordNL": "op tafel",
    "starterNL": "Ik ga...",
    "intents": [
      "SIT_DOWN",
      "EAT_BREAKFAST",
      "DRINK_COFFEE"
    ],
    "responses": [
      {
        "text": "Ik ga zitten.",
        "intent": "SIT_DOWN"
      },
      {
        "text": "Ik eet mijn ontbijt.",
        "intent": "EAT_BREAKFAST"
      },
      {
        "text": "Ik drink koffie.",
        "intent": "DRINK_COFFEE"
      }
    ]
  },
  {
    "id": "breakfast_done",
    "scenarioId": "make-breakfast",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Het ontbijt is op. De ochtend kan verder.",
    "hintPT": "O café da manhã terminou. A manhã pode continuar.",
    "keywordNL": "het ontbijt",
    "starterNL": "Het ontbijt...",
    "intents": [
      "CONFIRM_READY"
    ],
    "responses": [
      {
        "text": "Ik ben klaar.",
        "intent": "CONFIRM_READY"
      }
    ]
  },
  {
    "id": "message_notification",
    "scenarioId": "phone-message",
    "speaker": "Telefoon",
    "level": "A1",
    "textNL": "Je hebt een nieuw bericht van Lotte.",
    "hintPT": "Você tem uma nova mensagem de Lotte.",
    "keywordNL": "een bericht",
    "starterNL": "Ik heb...",
    "intents": [
      "READ_MESSAGE"
    ],
    "responses": [
      {
        "text": "Ik lees het bericht.",
        "intent": "READ_MESSAGE"
      }
    ]
  },
  {
    "id": "message_open",
    "scenarioId": "phone-message",
    "speaker": "Lotte",
    "level": "A1",
    "textNL": "Goedemorgen! Hoe gaat het?",
    "hintPT": "Bom dia! Como vai?",
    "keywordNL": "hoe gaat het",
    "starterNL": "Het gaat...",
    "intents": [
      "CONFIRM_READY"
    ],
    "responses": [
      {
        "text": "Goed, dank je.",
        "intent": "CONFIRM_READY"
      }
    ]
  },
  {
    "id": "morning_message",
    "scenarioId": "phone-message",
    "speaker": "Lotte",
    "level": "A1",
    "textNL": "Goedemorgen! Heb je straks tijd voor koffie?",
    "hintPT": "Bom dia! Você tem tempo para um café mais tarde?",
    "keywordNL": "tijd voor koffie",
    "starterNL": "Ja, graag...",
    "intents": [
      "ACCEPT_COFFEE",
      "DECLINE_COFFEE",
      "ASK_REPEAT"
    ],
    "responses": [
      {
        "text": "Ja, graag.",
        "intent": "ACCEPT_COFFEE"
      },
      {
        "text": "Vandaag niet, bedankt.",
        "intent": "DECLINE_COFFEE"
      },
      {
        "text": "Kun je dat herhalen?",
        "intent": "ASK_REPEAT"
      }
    ]
  },
  {
    "id": "message_accept",
    "scenarioId": "phone-message",
    "speaker": "Lotte",
    "level": "A1",
    "textNL": "Leuk! Ik stuur je later de tijd.",
    "hintPT": "Legal! Mais tarde envio o horário.",
    "keywordNL": "later",
    "starterNL": "Ik stuur...",
    "intents": [
      "CONFIRM_READY"
    ],
    "responses": [
      {
        "text": "Prima.",
        "intent": "CONFIRM_READY"
      }
    ]
  },
  {
    "id": "message_done",
    "scenarioId": "phone-message",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Het gesprek staat nu in je berichten.",
    "hintPT": "A conversa agora está nas suas mensagens.",
    "keywordNL": "het gesprek",
    "starterNL": "Het gesprek...",
    "intents": [
      "CONFIRM_READY"
    ],
    "responses": [
      {
        "text": "Oké.",
        "intent": "CONFIRM_READY"
      }
    ]
  },
  {
    "id": "keys_missing",
    "scenarioId": "find-keys",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "De deur is op slot, maar je hebt je sleutels niet.",
    "hintPT": "A porta está trancada, mas você não está com as chaves.",
    "keywordNL": "op slot",
    "starterNL": "De deur...",
    "intents": [
      "FIND_KEYS"
    ],
    "responses": [
      {
        "text": "Waar zijn mijn sleutels?",
        "intent": "FIND_KEYS"
      }
    ]
  },
  {
    "id": "keys_think",
    "scenarioId": "find-keys",
    "speaker": "Verteller",
    "level": "A2",
    "textNL": "Waar leg je kleine dingen meestal neer?",
    "hintPT": "Onde você costuma colocar coisas pequenas?",
    "keywordNL": "neerleggen",
    "starterNL": "Ik leg...",
    "intents": [
      "FIND_KEYS",
      "ASK_REPEAT"
    ],
    "responses": [
      {
        "text": "Ik zoek in de hal.",
        "intent": "FIND_KEYS"
      },
      {
        "text": "Kun je dat herhalen?",
        "intent": "ASK_REPEAT"
      }
    ]
  },
  {
    "id": "keys_hint",
    "scenarioId": "find-keys",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Kijk op het halmeubel, bij het kleine schaaltje.",
    "hintPT": "Olhe no móvel do hall, perto da tigela pequena.",
    "keywordNL": "het schaaltje",
    "starterNL": "Kijk op...",
    "intents": [
      "KEYS_FOUND"
    ],
    "responses": [
      {
        "text": "Daar zijn de sleutels.",
        "intent": "KEYS_FOUND"
      }
    ]
  },
  {
    "id": "keys_found",
    "scenarioId": "find-keys",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Je vindt de sleutels in het schaaltje.",
    "hintPT": "Você encontra as chaves na tigela.",
    "keywordNL": "vinden",
    "starterNL": "Ik vind...",
    "intents": [
      "KEYS_FOUND"
    ],
    "responses": [
      {
        "text": "Gevonden!",
        "intent": "KEYS_FOUND"
      }
    ]
  },
  {
    "id": "keys_done",
    "scenarioId": "find-keys",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Met de sleutels kun je de voordeur ontgrendelen.",
    "hintPT": "Com as chaves você pode destrancar a porta.",
    "keywordNL": "ontgrendelen",
    "starterNL": "Ik kan...",
    "intents": [
      "OPEN_DOOR"
    ],
    "responses": [
      {
        "text": "Ik open de voordeur.",
        "intent": "OPEN_DOOR"
      }
    ]
  },
  {
    "id": "mail_arrived",
    "scenarioId": "read-mail",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Er ligt post op het halmeubel.",
    "hintPT": "Há correspondência sobre o móvel do hall.",
    "keywordNL": "de post",
    "starterNL": "Er ligt...",
    "intents": [
      "READ_MAIL"
    ],
    "responses": [
      {
        "text": "Ik pak de post.",
        "intent": "READ_MAIL"
      }
    ]
  },
  {
    "id": "mail_take",
    "scenarioId": "read-mail",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "De envelop heeft jouw naam.",
    "hintPT": "O envelope tem o seu nome.",
    "keywordNL": "de envelop",
    "starterNL": "De envelop...",
    "intents": [
      "READ_MAIL"
    ],
    "responses": [
      {
        "text": "Ik maak hem open.",
        "intent": "READ_MAIL"
      }
    ]
  },
  {
    "id": "mail_open",
    "scenarioId": "read-mail",
    "speaker": "Verteller",
    "level": "A2",
    "textNL": "Het is een korte brief over een pakket.",
    "hintPT": "É uma carta curta sobre um pacote.",
    "keywordNL": "het pakket",
    "starterNL": "Het is...",
    "intents": [
      "READ_MAIL"
    ],
    "responses": [
      {
        "text": "Ik lees de brief.",
        "intent": "READ_MAIL"
      }
    ]
  },
  {
    "id": "mail_content",
    "scenarioId": "read-mail",
    "speaker": "Brief",
    "level": "A2",
    "textNL": "Uw pakket wordt morgen tussen tien en twaalf uur bezorgd.",
    "hintPT": "Seu pacote será entregue amanhã entre dez e doze horas.",
    "keywordNL": "morgen",
    "starterNL": "Mijn pakket...",
    "intents": [
      "CONFIRM_READY"
    ],
    "responses": [
      {
        "text": "Dat is duidelijk.",
        "intent": "CONFIRM_READY"
      }
    ]
  },
  {
    "id": "mail_done",
    "scenarioId": "read-mail",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Je bewaart de brief bij je agenda.",
    "hintPT": "Você guarda a carta junto da agenda.",
    "keywordNL": "bewaren",
    "starterNL": "Ik bewaar...",
    "intents": [
      "CONFIRM_READY"
    ],
    "responses": [
      {
        "text": "Prima.",
        "intent": "CONFIRM_READY"
      }
    ]
  },
  {
    "id": "laundry_intro",
    "scenarioId": "do-laundry",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "De wasmand is vol. De kleren moeten gewassen worden.",
    "hintPT": "O cesto está cheio. As roupas precisam ser lavadas.",
    "keywordNL": "de wasmand",
    "starterNL": "De kleren...",
    "intents": [
      "START_LAUNDRY"
    ],
    "responses": [
      {
        "text": "Ik doe de was.",
        "intent": "START_LAUNDRY"
      }
    ]
  },
  {
    "id": "laundry_load",
    "scenarioId": "do-laundry",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Doe de kleren in de wasmachine.",
    "hintPT": "Coloque as roupas na máquina de lavar.",
    "keywordNL": "in de wasmachine",
    "starterNL": "Ik doe...",
    "intents": [
      "START_LAUNDRY"
    ],
    "responses": [
      {
        "text": "Ik laad de wasmachine.",
        "intent": "START_LAUNDRY"
      }
    ]
  },
  {
    "id": "laundry_detergent",
    "scenarioId": "do-laundry",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Vergeet het wasmiddel niet.",
    "hintPT": "Não esqueça o detergente.",
    "keywordNL": "het wasmiddel",
    "starterNL": "Ik voeg...",
    "intents": [
      "ADD_DETERGENT"
    ],
    "responses": [
      {
        "text": "Ik voeg wasmiddel toe.",
        "intent": "ADD_DETERGENT"
      }
    ]
  },
  {
    "id": "laundry_start",
    "scenarioId": "do-laundry",
    "speaker": "Verteller",
    "level": "A2",
    "textNL": "De deur is dicht en het programma kan starten.",
    "hintPT": "A porta está fechada e o programa pode começar.",
    "keywordNL": "het programma",
    "starterNL": "Ik start...",
    "intents": [
      "START_LAUNDRY"
    ],
    "responses": [
      {
        "text": "Start de wasmachine.",
        "intent": "START_LAUNDRY"
      }
    ]
  },
  {
    "id": "laundry_done",
    "scenarioId": "do-laundry",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "De was is schoon. Hang de kleren te drogen.",
    "hintPT": "A roupa está limpa. Pendure-a para secar.",
    "keywordNL": "drogen",
    "starterNL": "Ik hang...",
    "intents": [
      "CONFIRM_READY"
    ],
    "responses": [
      {
        "text": "Ik hang de was op.",
        "intent": "CONFIRM_READY"
      }
    ]
  },
  {
    "id": "evening_intro",
    "scenarioId": "evening-routine",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Het is avond. Thuis wordt het rustig.",
    "hintPT": "É noite. Em casa tudo fica calmo.",
    "keywordNL": "de avond",
    "starterNL": "Het is...",
    "intents": [
      "RELAX"
    ],
    "responses": [
      {
        "text": "Ik wil ontspannen.",
        "intent": "RELAX"
      }
    ]
  },
  {
    "id": "evening_sofa",
    "scenarioId": "evening-routine",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "De bank is vrij en de lamp geeft warm licht.",
    "hintPT": "O sofá está livre e a luminária dá uma luz quente.",
    "keywordNL": "de bank",
    "starterNL": "Ik ga...",
    "intents": [
      "SIT_DOWN",
      "RELAX"
    ],
    "responses": [
      {
        "text": "Ik ga op de bank zitten.",
        "intent": "SIT_DOWN"
      },
      {
        "text": "Ik neem rust.",
        "intent": "RELAX"
      }
    ]
  },
  {
    "id": "evening_tv",
    "scenarioId": "evening-routine",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Wil je de televisie aanzetten?",
    "hintPT": "Você quer ligar a televisão?",
    "keywordNL": "de televisie",
    "starterNL": "Ik zet...",
    "intents": [
      "TURN_ON_TV",
      "DECLINE"
    ],
    "responses": [
      {
        "text": "Ik kijk even televisie.",
        "intent": "TURN_ON_TV"
      },
      {
        "text": "Nee, liever niet.",
        "intent": "DECLINE"
      }
    ]
  },
  {
    "id": "evening_bed",
    "scenarioId": "evening-routine",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Je bent moe. Het bed wacht.",
    "hintPT": "Você está cansado. A cama espera.",
    "keywordNL": "moe",
    "starterNL": "Ik ga...",
    "intents": [
      "GO_TO_SLEEP"
    ],
    "responses": [
      {
        "text": "Tijd voor bed.",
        "intent": "GO_TO_SLEEP"
      }
    ]
  },
  {
    "id": "evening_done",
    "scenarioId": "evening-routine",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Welterusten. Morgen begint een nieuwe dag.",
    "hintPT": "Boa noite. Amanhã começa um novo dia.",
    "keywordNL": "morgen",
    "starterNL": "Morgen...",
    "intents": [
      "CONFIRM_READY"
    ],
    "responses": [
      {
        "text": "Welterusten.",
        "intent": "CONFIRM_READY"
      }
    ]
  },
  {
    "id": "visitor_bell",
    "scenarioId": "visitor-at-door",
    "speaker": "Deurbel",
    "level": "A1",
    "textNL": "Ding-dong! Er staat iemand voor de deur.",
    "hintPT": "Ding-dong! Há alguém à porta.",
    "keywordNL": "de deurbel",
    "starterNL": "Er staat...",
    "intents": [
      "OPEN_DOOR"
    ],
    "responses": [
      {
        "text": "Wie is daar?",
        "intent": "OPEN_DOOR"
      }
    ]
  },
  {
    "id": "visitor_ask",
    "scenarioId": "visitor-at-door",
    "speaker": "Pieter",
    "level": "A1",
    "textNL": "Hoi! Ben je thuis?",
    "hintPT": "Oi! Você está em casa?",
    "keywordNL": "thuis",
    "starterNL": "Ja, ik...",
    "intents": [
      "GREET_VISITOR",
      "ASK_REPEAT"
    ],
    "responses": [
      {
        "text": "Ja, kom binnen.",
        "intent": "GREET_VISITOR"
      },
      {
        "text": "Pardon?",
        "intent": "ASK_REPEAT"
      }
    ]
  },
  {
    "id": "visitor_reply",
    "scenarioId": "visitor-at-door",
    "speaker": "Pieter",
    "level": "A2",
    "textNL": "Ik kom alleen even iets brengen.",
    "hintPT": "Só vim trazer uma coisa rapidamente.",
    "keywordNL": "brengen",
    "starterNL": "Ik kom...",
    "intents": [
      "OPEN_DOOR",
      "GREET_VISITOR"
    ],
    "responses": [
      {
        "text": "Ik doe de deur open.",
        "intent": "OPEN_DOOR"
      },
      {
        "text": "Hallo, Pieter.",
        "intent": "GREET_VISITOR"
      }
    ]
  },
  {
    "id": "visitor_greet",
    "scenarioId": "visitor-at-door",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Je begroet Pieter bij de deur.",
    "hintPT": "Você cumprimenta Pieter na porta.",
    "keywordNL": "begroeten",
    "starterNL": "Ik zeg...",
    "intents": [
      "GREET_VISITOR"
    ],
    "responses": [
      {
        "text": "Goedemorgen!",
        "intent": "GREET_VISITOR"
      }
    ]
  },
  {
    "id": "visitor_done",
    "scenarioId": "visitor-at-door",
    "speaker": "Pieter",
    "level": "A1",
    "textNL": "Dank je. Tot later!",
    "hintPT": "Obrigado. Até mais!",
    "keywordNL": "tot later",
    "starterNL": "Tot...",
    "intents": [
      "CONFIRM_READY"
    ],
    "responses": [
      {
        "text": "Tot later!",
        "intent": "CONFIRM_READY"
      }
    ]
  },
  {
    "id": "food_missing",
    "scenarioId": "missing-food",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Het brood is op. De broodzak is leeg.",
    "hintPT": "O pão acabou. O saco está vazio.",
    "keywordNL": "op zijn",
    "starterNL": "Het brood...",
    "intents": [
      "CORRECT_SELF",
      "MAKE_COFFEE"
    ],
    "responses": [
      {
        "text": "Dan maak ik alleen koffie.",
        "intent": "MAKE_COFFEE"
      },
      {
        "text": "Sorry, ik bedoel ontbijt.",
        "intent": "CORRECT_SELF"
      }
    ]
  },
  {
    "id": "food_check",
    "scenarioId": "missing-food",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Kijk nog eens in de koelkast.",
    "hintPT": "Olhe novamente na geladeira.",
    "keywordNL": "de koelkast",
    "starterNL": "Ik kijk...",
    "intents": [
      "CONFIRM_READY"
    ],
    "responses": [
      {
        "text": "Ik kijk nog eens.",
        "intent": "CONFIRM_READY"
      }
    ]
  },
  {
    "id": "food_alternative",
    "scenarioId": "missing-food",
    "speaker": "Verteller",
    "level": "A2",
    "textNL": "Je kunt koffie drinken en later brood kopen.",
    "hintPT": "Você pode tomar café e comprar pão mais tarde.",
    "keywordNL": "later kopen",
    "starterNL": "Ik kan...",
    "intents": [
      "MAKE_COFFEE",
      "DECLINE"
    ],
    "responses": [
      {
        "text": "Ik zet koffie.",
        "intent": "MAKE_COFFEE"
      },
      {
        "text": "Ik wacht nog even.",
        "intent": "DECLINE"
      }
    ]
  },
  {
    "id": "food_decision",
    "scenarioId": "missing-food",
    "speaker": "Telefoon",
    "level": "A1",
    "textNL": "Zet brood op je boodschappenlijst?",
    "hintPT": "Adicionar pão à sua lista de compras?",
    "keywordNL": "de boodschappenlijst",
    "starterNL": "Zet...",
    "intents": [
      "CONFIRM_READY",
      "DECLINE"
    ],
    "responses": [
      {
        "text": "Ja, graag.",
        "intent": "CONFIRM_READY"
      },
      {
        "text": "Nee, dank je.",
        "intent": "DECLINE"
      }
    ]
  },
  {
    "id": "food_done",
    "scenarioId": "missing-food",
    "speaker": "Verteller",
    "level": "A1",
    "textNL": "Brood staat nu op de lijst voor later.",
    "hintPT": "Pão agora está na lista para mais tarde.",
    "keywordNL": "op de lijst",
    "starterNL": "Brood staat...",
    "intents": [
      "CONFIRM_READY"
    ],
    "responses": [
      {
        "text": "Prima.",
        "intent": "CONFIRM_READY"
      }
    ]
  }
] as const;
