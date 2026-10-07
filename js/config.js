/* Blackline Performance — configuração e valores por defeito
 *
 * A ligação ao Supabase está em js/env.js (gerado a partir de .env com: node scripts/build-env.mjs).
 * Sem Supabase o site funciona em modo demonstração (dados só no navegador).
 */
window.BL_CONFIG = {
  // Só para o modo demonstração. Com Supabase o login é feito com email e palavra-passe do Supabase Auth.
  adminUser: 'admin',
  adminPassHash: '2e71858c36954a6c40cb339e20f82ae72ea53895be6a2222865cb724f1a94b9d', // só modo demonstração (sem Supabase)
};

window.BL_DEFAULTS = {
  version: 1,
  contacts: {
    phone: '+258 86 042 4242',
    whatsapp: '258860424242',
    email: '',
    instagram: 'blp_autocare',
    tiktok: 'blackline.perfomace',
    address: { pt: 'Moçambique', en: 'Mozambique' },
    hours: { pt: 'Seg–Sex 08:00–17:30 · Sáb, dom e feriados por marcação', en: 'Mon–Fri 08:00–17:30 · Sat, Sun and public holidays by appointment' },
    payment: { pt: 'Numerário, POS, M-Pesa e e-Mola', en: 'Cash, card, M-Pesa and e-Mola' },
  },
  booking: {
    pickupFee: 500,
    weekdayClose: '17:30',   // último horário = 30 min antes
    weekend: 'request',      // sábados, domingos e feriados: 'request' (por marcação) | 'closed'
  },
  // Dados que aparecem nas cotações em PDF
  company: {
    legalName: 'Blackline Performance',
    nuit: '',
    address: 'Moçambique',
    vatRate: 16,              // IVA em Moçambique
    pricesIncludeVat: true,   // os preços dos serviços já incluem IVA
    quoteValidityDays: 15,
    quoteTerms: 'Valores sujeitos a confirmação após avaliação da viatura. Garantia de 6 meses na mão de obra. Peças com garantia do fornecedor.',
    bankDetails: '',
  },
  // Promoções (geridas no painel). type: 'percent' | 'fixed' | 'price'. services: [] = todos.
  promos: [],
  // Preços indicativos (MZN). price: null = sob orçamento. from: true = "desde".
  // options: subopções com subpreço (o cliente escolhe; o total é a soma). optMode: 'multi' (várias) | 'single' (só uma).
  groups: [
    {
      "id": "grp-hqa5p",
      "name": {
        "en": "Todos Serviços",
        "pt": "Todos Serviços"
      },
      "items": [
        {
          "id": "smash-and-grab",
          "dur": {
            "en": "3H",
            "pt": "3H"
          },
          "desc": {
            "pt": "Película de segurança anti-arrombamento. Escolha os vidros: frente 2 500 MT, trás 2 500 MT, laterais 1 500 MT cada.",
            "en": "Anti smash-and-grab security film. Choose the windows: front 2 500 MT, rear 2 500 MT, sides 1 500 MT each."
          },
          "from": false,
          "name": {
            "en": "Smash and Grab",
            "pt": "Smash and Grab"
          },
          "price": 12000,
          "active": true,
          "optMode": "multi",
          "options": [
            {
              "id": "frente",
              "active": true,
              "price": 2500,
              "name": {
                "pt": "Vidro da frente",
                "en": "Front window"
              },
              "desc": {
                "pt": "Película de segurança no vidro da frente",
                "en": "Security film on the front window"
              }
            },
            {
              "id": "tras",
              "active": true,
              "price": 2500,
              "name": {
                "pt": "Vidro de trás",
                "en": "Rear window"
              },
              "desc": {
                "pt": "Película de segurança no vidro de trás",
                "en": "Security film on the rear window"
              }
            },
            {
              "id": "lat_fe",
              "active": true,
              "price": 1500,
              "name": {
                "pt": "Vidro lateral dianteiro esquerdo",
                "en": "Front left side window"
              },
              "desc": {
                "pt": "Vidro da porta (1 500 MT cada lateral)",
                "en": "Door window (1 500 MT each side)"
              }
            },
            {
              "id": "lat_fd",
              "active": true,
              "price": 1500,
              "name": {
                "pt": "Vidro lateral dianteiro direito",
                "en": "Front right side window"
              },
              "desc": {
                "pt": "Vidro da porta (1 500 MT cada lateral)",
                "en": "Door window (1 500 MT each side)"
              }
            },
            {
              "id": "lat_te",
              "active": true,
              "price": 1500,
              "name": {
                "pt": "Vidro lateral traseiro esquerdo",
                "en": "Rear left side window"
              },
              "desc": {
                "pt": "Vidro da porta (1 500 MT cada lateral)",
                "en": "Door window (1 500 MT each side)"
              }
            },
            {
              "id": "lat_td",
              "active": true,
              "price": 1500,
              "name": {
                "pt": "Vidro lateral traseiro direito",
                "en": "Rear right side window"
              },
              "desc": {
                "pt": "Vidro da porta (1 500 MT cada lateral)",
                "en": "Door window (1 500 MT each side)"
              }
            }
          ]
        },
        {
          "id": "diagnostico",
          "dur": {
            "en": "3H",
            "pt": "3H"
          },
          "desc": {
            "pt": "Leitura completa das avarias. Recebe o relatório com os erros em PDF no seu email.",
            "en": "Full fault scan. You receive the error report as a PDF by email."
          },
          "from": false,
          "name": {
            "en": "Diagnosis",
            "pt": "Diagnóstico"
          },
          "price": 3500,
          "active": true,
          "options": []
        },
        {
          "id": "facelift",
          "active": true,
          "price": null,
          "from": false,
          "name": {
            "pt": "Facelift",
            "en": "Facelift"
          },
          "desc": {
            "pt": "Atualização do visual para a versão mais recente do modelo — para todas as viaturas.",
            "en": "Update the look to the latest version of the model — for all vehicles."
          },
          "dur": {
            "pt": "A definir",
            "en": "To be defined"
          },
          "optMode": "multi",
          "options": [
            {
              "id": "farois",
              "active": true,
              "price": null,
              "name": {
                "pt": "Faróis",
                "en": "Headlights"
              },
              "desc": {
                "pt": "Faróis da versão nova",
                "en": "New-version headlights"
              }
            },
            {
              "id": "pc_f",
              "active": true,
              "price": null,
              "name": {
                "pt": "Para-choques dianteiro",
                "en": "Front bumper"
              },
              "desc": {
                "pt": "",
                "en": ""
              }
            },
            {
              "id": "grelha",
              "active": true,
              "price": null,
              "name": {
                "pt": "Grelha",
                "en": "Grille"
              },
              "desc": {
                "pt": "",
                "en": ""
              }
            },
            {
              "id": "farolins",
              "active": true,
              "price": null,
              "name": {
                "pt": "Farolins",
                "en": "Tail lights"
              },
              "desc": {
                "pt": "",
                "en": ""
              }
            },
            {
              "id": "pc_t",
              "active": true,
              "price": null,
              "name": {
                "pt": "Para-choques traseiro",
                "en": "Rear bumper"
              },
              "desc": {
                "pt": "",
                "en": ""
              }
            },
            {
              "id": "kit",
              "active": true,
              "price": null,
              "name": {
                "pt": "Kit completo",
                "en": "Full kit"
              },
              "desc": {
                "pt": "Frente e traseira completas",
                "en": "Complete front and rear"
              }
            }
          ]
        }
      ]
    },
    {
      "id": "grp-b1m6d",
      "name": {
        "pt": "Montagem",
        "en": "Installation"
      },
      "items": [
        {
          "id": "ppf",
          "active": true,
          "price": null,
          "from": false,
          "name": {
            "pt": "Montagem de PPF",
            "en": "PPF installation"
          },
          "desc": {
            "pt": "Película de proteção da pintura (PPF) contra pedras, riscos e desgaste.",
            "en": "Paint protection film (PPF) against stone chips, scratches and wear."
          },
          "dur": {
            "pt": "A definir",
            "en": "To be defined"
          },
          "optMode": "multi",
          "options": [
            {
              "id": "frente_parcial",
              "active": true,
              "price": null,
              "name": {
                "pt": "Frente parcial",
                "en": "Partial front"
              },
              "desc": {
                "pt": "Capô e guarda-lamas parciais, para-choques",
                "en": "Partial bonnet and fenders, bumper"
              }
            },
            {
              "id": "frente_total",
              "active": true,
              "price": null,
              "name": {
                "pt": "Frente completa",
                "en": "Full front"
              },
              "desc": {
                "pt": "Capô, guarda-lamas, para-choques e espelhos",
                "en": "Bonnet, fenders, bumper and mirrors"
              }
            },
            {
              "id": "farois",
              "active": true,
              "price": null,
              "name": {
                "pt": "Faróis",
                "en": "Headlights"
              },
              "desc": {
                "pt": "",
                "en": ""
              }
            },
            {
              "id": "desgaste",
              "active": true,
              "price": null,
              "name": {
                "pt": "Zonas de desgaste",
                "en": "High-wear areas"
              },
              "desc": {
                "pt": "Soleiras, puxadores e bagageira",
                "en": "Sills, door cups and boot ledge"
              }
            },
            {
              "id": "completo",
              "active": true,
              "price": null,
              "name": {
                "pt": "Carro completo",
                "en": "Full car"
              },
              "desc": {
                "pt": "Toda a pintura",
                "en": "Entire paintwork"
              }
            }
          ]
        },
        {
          "id": "som",
          "active": true,
          "price": null,
          "from": false,
          "name": {
            "pt": "Montagem de sistema de som",
            "en": "Sound system installation"
          },
          "desc": {
            "pt": "Instalação de rádio, colunas, subwoofer e amplificador.",
            "en": "Installation of head unit, speakers, subwoofer and amplifier."
          },
          "dur": {
            "pt": "A definir",
            "en": "To be defined"
          },
          "optMode": "multi",
          "options": [
            {
              "id": "radio",
              "active": true,
              "price": null,
              "name": {
                "pt": "Rádio / ecrã multimédia",
                "en": "Head unit / multimedia screen"
              },
              "desc": {
                "pt": "Android, Apple CarPlay",
                "en": "Android, Apple CarPlay"
              }
            },
            {
              "id": "colunas",
              "active": true,
              "price": null,
              "name": {
                "pt": "Colunas",
                "en": "Speakers"
              },
              "desc": {
                "pt": "Portas da frente e/ou de trás",
                "en": "Front and/or rear doors"
              }
            },
            {
              "id": "sub",
              "active": true,
              "price": null,
              "name": {
                "pt": "Subwoofer e amplificador",
                "en": "Subwoofer and amplifier"
              },
              "desc": {
                "pt": "",
                "en": ""
              }
            },
            {
              "id": "camara",
              "active": true,
              "price": null,
              "name": {
                "pt": "Câmara de marcha-atrás",
                "en": "Reversing camera"
              },
              "desc": {
                "pt": "",
                "en": ""
              }
            },
            {
              "id": "completo",
              "active": true,
              "price": null,
              "name": {
                "pt": "Sistema completo",
                "en": "Full system"
              },
              "desc": {
                "pt": "Rádio, colunas, subwoofer e amplificador",
                "en": "Head unit, speakers, subwoofer and amplifier"
              }
            }
          ]
        }
      ]
    }
  ],
};
