"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

type Language = "nl" | "en";

type TermsSection = {
  title: string;
  content: ReactNode;
};

const nlSections: TermsSection[] = [
  {
    title: "1. Over deze voorwaarden",
    content: (
      <>
        <p>
          Deze gebruiksvoorwaarden zijn van toepassing op het gebruik van de
          websites, applicaties, calculators, modules, rapportagetools,
          accountdiensten en overige digitale diensten van Dost Industries
          B.V., handelend onder de naam Dost Industries.
        </p>

        <p>
          Door een account aan te maken, een betaald product af te nemen of
          anderszins gebruik te maken van DOST Industries gaat u akkoord met
          deze voorwaarden voor zover dat volgens toepasselijk recht is
          toegestaan.
        </p>

        <p>
          Sommige diensten kunnen aanvullende voorwaarden hebben. Indien
          aanvullende voorwaarden van toepassing zijn, worden deze vóór gebruik
          of aankoop beschikbaar gesteld.
        </p>
      </>
    ),
  },
  {
    title: "2. Wie kan DOST Industries gebruiken?",
    content: (
      <>
        <p>
          DOST Industries is bedoeld voor zowel consumenten als professionele
          en zakelijke gebruikers.
        </p>

        <p>
          U moet minimaal <strong className="text-white">18 jaar</strong> oud
          zijn om zelfstandig een persoonlijk account aan te maken.
        </p>

        <p>
          Indien u DOST Industries namens een onderneming of andere organisatie
          gebruikt, verklaart u bevoegd te zijn om namens die organisatie te
          handelen voor zover dat voor het gebruik van de betreffende dienst
          noodzakelijk is.
        </p>
      </>
    ),
  },
  {
    title: "3. Accounts",
    content: (
      <>
        <p>
          Een persoonlijk DOST Industries-account is uitsluitend bestemd voor
          gebruik door de persoon op wiens naam het account is geregistreerd.
        </p>

        <p>
          Persoonlijke accounts mogen niet worden gedeeld met collega&apos;s,
          medewerkers of andere personen.
        </p>

        <p>U bent verantwoordelijk voor:</p>

        <ul>
          <li>het verstrekken van juiste accountinformatie;</li>
          <li>het vertrouwelijk houden van uw inloggegevens;</li>
          <li>activiteiten die via uw account plaatsvinden;</li>
          <li>
            het zo snel mogelijk melden van vermoedelijk onbevoegd gebruik.
          </li>
        </ul>

        <p>
          Dost Industries kan aanvullende beveiligingsmaatregelen toepassen,
          waaronder e-mailverificatie, herauthenticatie en
          misbruikpreventiemechanismen.
        </p>
      </>
    ),
  },
  {
    title: "4. Zakelijke en teamaccounts",
    content: (
      <>
        <p>
          Dost Industries kan in de toekomst bedrijfs-, organisatie- en
          teamaccounts aanbieden.
        </p>

        <p>
          Een organisatie kan in dat geval eigenaar of beheerder zijn van een
          teamomgeving en onder meer gebruikers uitnodigen, toegang beheren,
          rollen toewijzen of toegang beëindigen.
        </p>

        <p>
          Gebruikers die via een organisatieaccount werken, erkennen dat de
          betreffende organisatie bepaalde beheermogelijkheden kan hebben over
          de zakelijke omgeving en gegevens die binnen die omgeving worden
          opgeslagen.
        </p>
      </>
    ),
  },
  {
    title: "5. FREE en Premium",
    content: (
      <>
        <p>
          DOST Industries kan zowel gratis als betaalde functionaliteiten
          aanbieden.
        </p>

        <p>
          De gratis versie kan beperkingen bevatten en kan advertenties tonen.
        </p>

        <p>
          Betaalde functionaliteiten kunnen onder andere worden aangeboden via
          DOST Premium, losse modules, bundels of andere toekomstige
          productvormen.
        </p>

        <p>
          De exacte functionaliteiten, prijs en voorwaarden van een betaald
          product worden vóór de aankoop kenbaar gemaakt.
        </p>

        <p>
          Het feit dat bepaalde functionaliteit op enig moment gratis
          beschikbaar is, geeft geen permanent recht op kosteloze beschikbaarheid
          van die functionaliteit.
        </p>
      </>
    ),
  },
  {
    title: "6. Abonnementen en automatische verlenging",
    content: (
      <>
        <p>
          Wanneer DOST Premium als abonnement wordt aangeboden, kan het
          abonnement automatisch worden verlengd totdat het overeenkomstig de
          aangeboden opzeggingsmogelijkheden wordt beëindigd.
        </p>

        <p>
          Informatie over de prijs, factureringsperiode, verlenging en wijze van
          opzeggen wordt vóór het aangaan van het abonnement beschikbaar
          gesteld.
        </p>

        <p>
          Na opzegging kan Premium-toegang beschikbaar blijven gedurende de
          reeds betaalde periode, tenzij toepasselijk dwingend recht een andere
          uitkomst vereist of de betreffende betaalprovider een andere wettelijk
          geldige afwikkeling voorschrijft.
        </p>

        <p>
          Voor consumenten gelden altijd de toepasselijke wettelijke regels
          inzake automatische verlenging en opzegging.
        </p>
      </>
    ),
  },
  {
    title: "7. Prijzen en wijzigingen",
    content: (
      <>
        <p>
          Dost Industries kan prijzen voor toekomstige abonnementsperioden,
          modules of andere betaalde diensten wijzigen.
        </p>

        <p>
          Wanneer een wijziging betrekking heeft op een bestaand abonnement,
          worden gebruikers vooraf geïnformeerd voor zover dat contractueel of
          wettelijk vereist is.
        </p>

        <p>
          Wettelijke rechten van consumenten bij een prijs- of
          contractswijziging blijven volledig van toepassing.
        </p>
      </>
    ),
  },
  {
    title: "8. Betalingen",
    content: (
      <>
        <p>
          Betalingen kunnen afhankelijk van het platform worden verwerkt via
          Dost Industries of via externe betaal- of storeproviders, waaronder
          bijvoorbeeld PayPal, Apple, Google of andere toekomstige providers.
        </p>

        <p>
          Voor betalingen via een externe provider kunnen tevens de
          betalingsvoorwaarden van die provider gelden.
        </p>

        <p>
          Premium-toegang en andere betaalde rechten worden uitsluitend
          toegekend wanneer de relevante aankoop geldig is bevestigd of
          gevalideerd.
        </p>
      </>
    ),
  },
  {
    title: "9. Herroepingsrecht voor consumenten",
    content: (
      <>
        <p>
          Consumenten kunnen bij online afgesloten overeenkomsten een wettelijk
          herroepings- of ontbindingsrecht hebben.
        </p>

        <p>
          Waar dit recht van toepassing is, verstrekt Dost Industries vóór de
          aankoop de wettelijk vereiste informatie over de termijn, wijze van
          uitoefening en eventuele gevolgen van het starten van de digitale
          dienst tijdens die termijn.
        </p>

        <p>
          Indien een consument uitdrukkelijk verzoekt om een dienst reeds
          tijdens de wettelijke bedenktijd te laten beginnen, kunnen daarvoor
          aanvullende wettelijke voorwaarden gelden.
        </p>

        <p>
          Dwingende wettelijke consumentenrechten worden door deze voorwaarden
          niet beperkt.
        </p>
      </>
    ),
  },
  {
    title: "10. Technische tools en professioneel gebruik",
    content: (
      <>
        <p>
          DOST Industries biedt technische hulpmiddelen voor onder andere
          lassen, fabricage, engineering, inspectie en aanverwante professionele
          werkzaamheden.
        </p>

        <p>
          Professioneel en commercieel gebruik van berekeningsresultaten is
          toegestaan, mits de gebruiker deze voorwaarden naleeft.
        </p>

        <p>
          DOST Industries is echter een{" "}
          <strong className="text-cyan-300">
            technisch hulpmiddel en geen vervanging voor professionele
            beoordeling
          </strong>
          .
        </p>

        <p>De gebruiker blijft zelf verantwoordelijk voor:</p>

        <ul>
          <li>de juistheid en volledigheid van invoergegevens;</li>
          <li>het controleren van berekeningen en resultaten;</li>
          <li>de interpretatie van resultaten;</li>
          <li>materiaal- en proceskeuzes;</li>
          <li>de toepasbaarheid en juiste toepassing van normen;</li>
          <li>projectspecifieke eisen en toleranties;</li>
          <li>wettelijke en contractuele eisen;</li>
          <li>veiligheidsbeoordelingen;</li>
          <li>de uiteindelijke technische beslissing;</li>
          <li>de veiligheid en kwaliteit van het uitgevoerde werk.</li>
        </ul>

        <p>
          Resultaten van DOST Industries mogen niet zonder passende
          professionele beoordeling als enige basis worden gebruikt voor een
          veiligheidskritische technische beslissing.
        </p>
      </>
    ),
  },
  {
    title: "11. Geen certificering of formele goedkeuring",
    content: (
      <>
        <p>
          Tenzij bij een specifieke dienst uitdrukkelijk anders wordt vermeld,
          vormt een berekening, rapport, resultaat of andere output van DOST
          Industries geen:
        </p>

        <ul>
          <li>certificaat;</li>
          <li>formele engineeringgoedkeuring;</li>
          <li>inspectiecertificaat;</li>
          <li>conformiteitsverklaring;</li>
          <li>WPS-, WPQR- of kwalificatiegoedkeuring;</li>
          <li>juridische of contractuele acceptatie.</li>
        </ul>

        <p>
          Waar formele beoordeling, verificatie of goedkeuring door een
          bevoegde persoon, organisatie of instantie vereist is, blijft deze
          afzonderlijk noodzakelijk.
        </p>
      </>
    ),
  },
  {
    title: "12. Normen en technische informatie",
    content: (
      <>
        <p>
          DOST Industries kan functionaliteiten aanbieden die gebruikers helpen
          bij het werken met technische normen, standaarden, regels of
          engineeringmethoden.
        </p>

        <p>
          De gebruiker blijft verantwoordelijk voor het vaststellen welke norm,
          editie, revisie, acceptatiecriteria en projectspecificaties van
          toepassing zijn.
        </p>

        <p>
          Verwijzingen naar normen betekenen niet dat Dost Industries de
          volledige officiële normtekst levert of dat een door de gebruiker
          benodigde licentie voor auteursrechtelijk beschermde normen wordt
          vervangen.
        </p>
      </>
    ),
  },
  {
    title: "13. Door gebruikers aangeleverde inhoud",
    content: (
      <>
        <p>
          Gebruikers kunnen, wanneer dergelijke functionaliteit beschikbaar is,
          eigen informatie uploaden of opslaan, waaronder:
        </p>

        <ul>
          <li>documenten en PDF&apos;s;</li>
          <li>normen;</li>
          <li>certificaten;</li>
          <li>foto&apos;s en camerabeelden;</li>
          <li>projectinformatie;</li>
          <li>klantgegevens;</li>
          <li>technische gegevens;</li>
          <li>rapporten en andere bestanden.</li>
        </ul>

        <p>
          U verklaart dat u over voldoende rechten, toestemming of een andere
          geldige juridische grond beschikt om dergelijke inhoud te gebruiken,
          uploaden en verwerken.
        </p>

        <p>
          U blijft eigenaar van uw eigen inhoud voor zover u daar reeds rechten
          op bezit.
        </p>

        <p>
          U verleent Dost Industries uitsluitend de rechten die redelijkerwijs
          noodzakelijk zijn om de gekozen dienst technisch uit te voeren,
          bijvoorbeeld voor opslag, verwerking, synchronisatie, rapportage of
          weergave.
        </p>
      </>
    ),
  },
  {
    title: "14. Verboden gebruik",
    content: (
      <>
        <p>DOST Industries mag niet worden gebruikt voor:</p>

        <ul>
          <li>onwettige activiteiten;</li>
          <li>fraude of misleiding;</li>
          <li>ongeautoriseerde toegang tot systemen of accounts;</li>
          <li>het omzeilen van beveiligingsmaatregelen;</li>
          <li>
            het verspreiden van malware, schadelijke code of andere
            beveiligingsbedreigingen;
          </li>
          <li>
            het uploaden van inhoud waarvoor de gebruiker niet over de
            benodigde rechten beschikt;
          </li>
          <li>
            reverse engineering voor zover beperking daarvan wettelijk is
            toegestaan;
          </li>
          <li>
            geautomatiseerd misbruik of buitensporige belasting van onze
            infrastructuur;
          </li>
          <li>het delen of doorverkopen van persoonlijke accounttoegang;</li>
          <li>
            gebruik dat de rechten, veiligheid of diensten van Dost Industries
            of derden schaadt.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "15. Intellectueel eigendom",
    content: (
      <>
        <p>
          De software, vormgeving, broncode, interfaces, merkuitingen,
          databasestructuren, teksten en andere door Dost Industries ontwikkelde
          onderdelen van het platform zijn beschermd door toepasselijke
          intellectuele-eigendomsrechten.
        </p>

        <p>
          Gebruik van DOST Industries verleent geen eigendomsrecht op het
          platform of de onderliggende technologie.
        </p>

        <p>
          Gebruikers krijgen een beperkte, persoonlijke, niet-exclusieve en
          niet-overdraagbare gebruikslicentie voor de functionaliteit waarvoor
          zij geldige toegang hebben.
        </p>

        <p>
          Rechten van derden, waaronder rechten op technische normen,
          documentatie, merken en andere externe inhoud, blijven bij de
          betreffende rechthebbenden.
        </p>
      </>
    ),
  },
  {
    title: "16. Beschikbaarheid, onderhoud en wijzigingen",
    content: (
      <>
        <p>
          Dost Industries streeft naar een betrouwbare beschikbaarheid van de
          dienst, maar garandeert geen ononderbroken of volledig foutloze
          werking.
        </p>

        <p>
          Diensten kunnen tijdelijk niet beschikbaar zijn door bijvoorbeeld:
        </p>

        <ul>
          <li>onderhoud;</li>
          <li>updates;</li>
          <li>beveiligingsmaatregelen;</li>
          <li>storingen;</li>
          <li>problemen bij externe leveranciers;</li>
          <li>technische of operationele omstandigheden.</li>
        </ul>

        <p>
          Dost Industries kan FREE- en Premium-functionaliteiten, modules,
          interfaces en technische onderdelen toevoegen, verbeteren, vervangen
          of beëindigen.
        </p>

        <p>
          Wanneer een wijziging wezenlijke gevolgen heeft voor een betaald
          product of voor wettelijke rechten van een consument, worden de
          toepasselijke contractuele en wettelijke verplichtingen gerespecteerd.
        </p>
      </>
    ),
  },
  {
    title: "17. Updates en correcties",
    content: (
      <>
        <p>
          Dost Industries kan software, formules, datasets, functionaliteiten,
          beveiligingsmaatregelen en technische implementaties bijwerken.
        </p>

        <p>
          Correcties kunnen noodzakelijk zijn wanneer fouten, onduidelijkheden,
          beveiligingsproblemen of gewijzigde technische inzichten worden
          vastgesteld.
        </p>

        <p>
          Gebruikers dienen waar relevant te controleren of opgeslagen of eerder
          geëxporteerde resultaten nog passend zijn voor het actuele project,
          de geldende norm en de gebruikte softwareversie.
        </p>
      </>
    ),
  },
  {
    title: "18. Aansprakelijkheid",
    content: (
      <>
        <p>
          Dost Industries zal de dienst met redelijke zorg ontwikkelen en
          onderhouden.
        </p>

        <p>
          Voor zover wettelijk toegestaan is Dost Industries niet
          verantwoordelijk voor schade die uitsluitend voortvloeit uit:
        </p>

        <ul>
          <li>onjuiste of onvolledige gebruikersinvoer;</li>
          <li>onjuiste interpretatie van technische resultaten;</li>
          <li>het toepassen van een onjuiste norm of normeditie;</li>
          <li>
            het ontbreken van een noodzakelijke professionele verificatie;
          </li>
          <li>
            gebruik van resultaten buiten het doel of bereik waarvoor de tool
            is bedoeld;
          </li>
          <li>
            inhoud of beslissingen van externe dienstverleners of providers
            buiten de redelijke controle van Dost Industries.
          </li>
        </ul>

        <p>
          Niets in deze voorwaarden sluit aansprakelijkheid uit of beperkt deze
          voor zover een dergelijke uitsluiting of beperking volgens
          toepasselijk dwingend recht niet is toegestaan.
        </p>

        <p>
          Wettelijke consumentenrechten blijven volledig van toepassing.
        </p>
      </>
    ),
  },
  {
    title: "19. Schorsing en beëindiging",
    content: (
      <>
        <p>
          Dost Industries kan toegang tot een account of dienst tijdelijk
          beperken of schorsen wanneer dit redelijkerwijs noodzakelijk is in
          verband met:
        </p>

        <ul>
          <li>fraude;</li>
          <li>misbruik;</li>
          <li>een beveiligingsrisico;</li>
          <li>ongeautoriseerd accountgebruik;</li>
          <li>ernstige of herhaalde schending van deze voorwaarden;</li>
          <li>wettelijke verplichtingen.</li>
        </ul>

        <p>
          Definitieve beëindiging vindt niet willekeurig plaats en wordt
          toegepast met inachtneming van toepasselijke wettelijke en
          contractuele verplichtingen.
        </p>

        <p>
          De gebruiker kan zijn account beëindigen via de daarvoor aangeboden
          functionaliteit of door contact op te nemen met Dost Industries.
        </p>
      </>
    ),
  },
  {
    title: "20. Privacy en gegevensbescherming",
    content: (
      <>
        <p>
          De verwerking van persoonsgegevens door Dost Industries wordt nader
          beschreven in de DOST Industries Privacy Policy.
        </p>

        <Link
          href="/legal/privacy"
          className="inline-flex rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300 transition hover:bg-cyan-400/15"
        >
          Privacy Policy
        </Link>
      </>
    ),
  },
  {
    title: "21. Wijzigingen van deze voorwaarden",
    content: (
      <>
        <p>
          Dost Industries kan deze voorwaarden aanpassen wanneer dit
          noodzakelijk is vanwege bijvoorbeeld:
        </p>

        <ul>
          <li>wijzigingen in de diensten;</li>
          <li>nieuwe modules of bedrijfsmodellen;</li>
          <li>technische of beveiligingsontwikkelingen;</li>
          <li>wijzigingen in wet- en regelgeving;</li>
          <li>redelijke commerciële of operationele behoeften.</li>
        </ul>

        <p>
          Bij materiële wijzigingen worden gebruikers vooraf geïnformeerd voor
          zover dat op grond van de overeenkomst of toepasselijk recht vereist
          is.
        </p>

        <p>
          Dwingende wettelijke rechten bij wijzigingen blijven volledig van
          toepassing.
        </p>
      </>
    ),
  },
  {
    title: "22. Nederlands recht en geschillen",
    content: (
      <>
        <p>
          Op deze voorwaarden en de overeenkomst met Dost Industries is
          Nederlands recht van toepassing.
        </p>

        <p>
          Voor consumenten geldt deze rechtskeuze niet voor zover zij daardoor
          bescherming zouden verliezen die zij op grond van dwingend recht
          hebben volgens het recht dat zonder deze rechtskeuze van toepassing
          zou zijn.
        </p>

        <p>
          Geschillen worden voorgelegd aan de volgens toepasselijk recht
          bevoegde rechter.
        </p>

        <p>
          Voor zakelijke gebruikers kan, voor zover rechtsgeldig, de bevoegde
          Nederlandse rechter worden aangewezen in aanvullende zakelijke
          voorwaarden of overeenkomsten.
        </p>
      </>
    ),
  },
  {
    title: "23. Scheidbaarheid",
    content: (
      <>
        <p>
          Indien een bepaling van deze voorwaarden geheel of gedeeltelijk
          ongeldig, niet-afdwingbaar of niet-toepasselijk blijkt te zijn, tast
          dit de geldigheid van de overige bepalingen niet aan.
        </p>

        <p>
          De betreffende bepaling wordt voor zover mogelijk toegepast op een
          wijze die het doel ervan benadert binnen de grenzen van toepasselijk
          recht.
        </p>
      </>
    ),
  },
  {
    title: "24. Contact",
    content: (
      <>
        <p>
          Voor vragen over deze voorwaarden kunt u contact opnemen met:
        </p>

        <address className="not-italic">
          <strong className="text-white">Dost Industries B.V.</strong>
          <br />
          Veckdijk 42
          <br />
          3237 LV Vierpolders
          <br />
          Nederland
          <br />
          KvK: 90713052
          <br />
          BTW: NL865425322B01
          <br />
          <span className="text-cyan-300">info@dostindustries.com</span>
        </address>
      </>
    ),
  },
];

const enSections: TermsSection[] = [
  {
    title: "1. About these Terms",
    content: (
      <>
        <p>
          These Terms of Use apply to the websites, applications, calculators,
          modules, reporting tools, account services and other digital services
          provided by Dost Industries B.V., trading as Dost Industries.
        </p>

        <p>
          By creating an account, purchasing a paid product or otherwise using
          DOST Industries, you agree to these Terms to the extent permitted by
          applicable law.
        </p>

        <p>
          Certain services may be subject to additional terms. Where additional
          terms apply, they will be made available before the relevant service
          is used or purchased.
        </p>
      </>
    ),
  },
  {
    title: "2. Who may use DOST Industries?",
    content: (
      <>
        <p>
          DOST Industries is intended for consumers as well as professional and
          business users.
        </p>

        <p>
          You must be at least <strong className="text-white">18 years old</strong>{" "}
          to independently create a personal account.
        </p>

        <p>
          If you use DOST Industries on behalf of a company or other
          organization, you represent that you have sufficient authority to act
          on behalf of that organization where required.
        </p>
      </>
    ),
  },
  {
    title: "3. Accounts",
    content: (
      <>
        <p>
          A personal DOST Industries account is intended solely for use by the
          individual in whose name the account is registered.
        </p>

        <p>
          Personal accounts may not be shared with colleagues, employees or
          other individuals.
        </p>

        <p>You are responsible for:</p>

        <ul>
          <li>providing accurate account information;</li>
          <li>keeping your login credentials confidential;</li>
          <li>activities performed through your account;</li>
          <li>
            promptly reporting suspected unauthorized use of your account.
          </li>
        </ul>

        <p>
          Dost Industries may implement additional security measures including
          email verification, reauthentication and abuse-prevention mechanisms.
        </p>
      </>
    ),
  },
  {
    title: "4. Business and team accounts",
    content: (
      <>
        <p>
          Dost Industries may offer company, organization and team accounts in
          the future.
        </p>

        <p>
          An organization may act as owner or administrator of a team
          environment and may be able to invite users, manage access, assign
          roles or terminate access.
        </p>

        <p>
          Users working through an organization account acknowledge that the
          relevant organization may have administrative control over the
          business environment and information stored within that environment.
        </p>
      </>
    ),
  },
  {
    title: "5. FREE and Premium",
    content: (
      <>
        <p>
          DOST Industries may provide both free and paid functionality.
        </p>

        <p>
          The free version may contain limitations and may display advertising.
        </p>

        <p>
          Paid functionality may be offered through DOST Premium, individual
          modules, bundles or other future product structures.
        </p>

        <p>
          The applicable features, price and conditions of a paid product will
          be disclosed before purchase.
        </p>

        <p>
          The fact that functionality is available free of charge at a
          particular time does not create a permanent right to free access to
          that functionality.
        </p>
      </>
    ),
  },
  {
    title: "6. Subscriptions and automatic renewal",
    content: (
      <>
        <p>
          Where DOST Premium is offered as a subscription, the subscription may
          renew automatically until terminated through the available
          cancellation method.
        </p>

        <p>
          Information about price, billing period, renewal and cancellation
          will be made available before the subscription is entered into.
        </p>

        <p>
          Following cancellation, Premium access may remain available for the
          already paid period unless mandatory applicable law requires a
          different outcome or the applicable payment provider applies another
          legally valid settlement method.
        </p>

        <p>
          Consumers always retain all mandatory legal rights relating to
          automatic renewal and cancellation.
        </p>
      </>
    ),
  },
  {
    title: "7. Prices and changes",
    content: (
      <>
        <p>
          Dost Industries may change prices for future subscription periods,
          modules or other paid services.
        </p>

        <p>
          Where a change affects an existing subscription, users will receive
          advance notice where required by contract or applicable law.
        </p>

        <p>
          Mandatory consumer rights relating to price or contractual changes
          remain fully applicable.
        </p>
      </>
    ),
  },
  {
    title: "8. Payments",
    content: (
      <>
        <p>
          Depending on the platform, payments may be processed by Dost
          Industries or external payment and store providers such as PayPal,
          Apple, Google or other future providers.
        </p>

        <p>
          Payments made through an external provider may also be subject to that
          provider&apos;s payment terms.
        </p>

        <p>
          Premium access and other paid rights are only granted where the
          relevant purchase has been validly confirmed or validated.
        </p>
      </>
    ),
  },
  {
    title: "9. Consumer withdrawal rights",
    content: (
      <>
        <p>
          Consumers entering into agreements online may have a statutory right
          of withdrawal or cancellation.
        </p>

        <p>
          Where this right applies, Dost Industries will provide the legally
          required information before purchase regarding the applicable period,
          method of exercising the right and any consequences of commencing a
          digital service during that period.
        </p>

        <p>
          Where a consumer expressly requests that a service begins during a
          statutory withdrawal period, additional legal conditions may apply.
        </p>

        <p>
          Nothing in these Terms limits mandatory statutory consumer rights.
        </p>
      </>
    ),
  },
  {
    title: "10. Technical tools and professional use",
    content: (
      <>
        <p>
          DOST Industries provides technical tools for welding, fabrication,
          engineering, inspection and related professional activities.
        </p>

        <p>
          Professional and commercial use of calculation results is permitted
          provided these Terms are followed.
        </p>

        <p>
          DOST Industries is a{" "}
          <strong className="text-cyan-300">
            technical aid and does not replace professional judgment
          </strong>
          .
        </p>

        <p>The user remains responsible for:</p>

        <ul>
          <li>the accuracy and completeness of input data;</li>
          <li>verification of calculations and results;</li>
          <li>interpretation of results;</li>
          <li>material and process selection;</li>
          <li>selection and correct application of standards;</li>
          <li>project-specific requirements and tolerances;</li>
          <li>legal and contractual requirements;</li>
          <li>safety assessments;</li>
          <li>the final technical decision;</li>
          <li>the safety and quality of the completed work.</li>
        </ul>

        <p>
          DOST Industries results must not be used as the sole basis for a
          safety-critical technical decision without appropriate professional
          review.
        </p>
      </>
    ),
  },
  {
    title: "11. No certification or formal approval",
    content: (
      <>
        <p>
          Unless expressly stated for a particular service, a calculation,
          report, result or other output generated by DOST Industries does not
          constitute:
        </p>

        <ul>
          <li>a certificate;</li>
          <li>formal engineering approval;</li>
          <li>an inspection certificate;</li>
          <li>a declaration of conformity;</li>
          <li>WPS, WPQR or qualification approval;</li>
          <li>legal or contractual acceptance.</li>
        </ul>

        <p>
          Where formal review, verification or approval by a competent person,
          organization or authority is required, that approval remains
          separately necessary.
        </p>
      </>
    ),
  },
  {
    title: "12. Standards and technical information",
    content: (
      <>
        <p>
          DOST Industries may provide functionality intended to assist users
          working with technical standards, rules, specifications or
          engineering methods.
        </p>

        <p>
          The user remains responsible for determining the applicable standard,
          edition, revision, acceptance criteria and project specifications.
        </p>

        <p>
          References to standards do not mean that Dost Industries supplies the
          complete official standard text or replaces any licence required by
          the user for copyrighted standards.
        </p>
      </>
    ),
  },
  {
    title: "13. User-provided content",
    content: (
      <>
        <p>
          Where such functionality is available, users may upload or store
          their own information including:
        </p>

        <ul>
          <li>documents and PDFs;</li>
          <li>standards;</li>
          <li>certificates;</li>
          <li>photos and camera images;</li>
          <li>project information;</li>
          <li>customer information;</li>
          <li>technical information;</li>
          <li>reports and other files.</li>
        </ul>

        <p>
          You represent that you have sufficient rights, permission or another
          valid legal basis to use, upload and process such content.
        </p>

        <p>
          You retain ownership of your own content to the extent that you
          already own the relevant rights.
        </p>

        <p>
          You grant Dost Industries only those rights reasonably necessary to
          technically provide the selected service, including where relevant
          storage, processing, synchronization, reporting or display.
        </p>
      </>
    ),
  },
  {
    title: "14. Prohibited use",
    content: (
      <>
        <p>DOST Industries may not be used for:</p>

        <ul>
          <li>unlawful activities;</li>
          <li>fraud or deception;</li>
          <li>unauthorized access to systems or accounts;</li>
          <li>circumventing security controls;</li>
          <li>distributing malware or harmful code;</li>
          <li>
            uploading content for which the user does not have sufficient
            rights;
          </li>
          <li>
            reverse engineering to the extent restriction is permitted by law;
          </li>
          <li>
            automated abuse or excessive loading of Dost Industries
            infrastructure;
          </li>
          <li>sharing or reselling personal account access;</li>
          <li>
            activity that harms the rights, safety or services of Dost
            Industries or others.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "15. Intellectual property",
    content: (
      <>
        <p>
          Software, designs, source code, interfaces, branding, database
          structures, text and other components developed by Dost Industries
          are protected by applicable intellectual-property rights.
        </p>

        <p>
          Use of DOST Industries does not transfer ownership of the platform or
          underlying technology.
        </p>

        <p>
          Users receive a limited, personal, non-exclusive and non-transferable
          licence to use functionality for which they have valid access.
        </p>

        <p>
          Third-party rights, including rights relating to technical standards,
          documentation, trademarks and other external content, remain with the
          applicable rights holders.
        </p>
      </>
    ),
  },
  {
    title: "16. Availability, maintenance and changes",
    content: (
      <>
        <p>
          Dost Industries aims to provide a reliable service but does not
          guarantee uninterrupted or entirely error-free availability.
        </p>

        <p>Services may temporarily become unavailable due to:</p>

        <ul>
          <li>maintenance;</li>
          <li>updates;</li>
          <li>security measures;</li>
          <li>technical failures;</li>
          <li>issues affecting external providers;</li>
          <li>technical or operational circumstances.</li>
        </ul>

        <p>
          Dost Industries may add, improve, replace or discontinue FREE and
          Premium functionality, modules, interfaces and technical components.
        </p>

        <p>
          Where a change materially affects a paid product or mandatory
          consumer rights, applicable contractual and statutory obligations
          will be respected.
        </p>
      </>
    ),
  },
  {
    title: "17. Updates and corrections",
    content: (
      <>
        <p>
          Dost Industries may update software, formulas, datasets,
          functionality, security controls and technical implementations.
        </p>

        <p>
          Corrections may be necessary where errors, ambiguities, security
          issues or changed technical insights are identified.
        </p>

        <p>
          Where relevant, users should verify whether previously saved or
          exported results remain suitable for the current project, applicable
          standard and software version.
        </p>
      </>
    ),
  },
  {
    title: "18. Liability",
    content: (
      <>
        <p>
          Dost Industries will develop and maintain its services with
          reasonable care.
        </p>

        <p>
          To the extent permitted by applicable law, Dost Industries is not
          responsible for damage resulting solely from:
        </p>

        <ul>
          <li>incorrect or incomplete user input;</li>
          <li>incorrect interpretation of technical results;</li>
          <li>application of an incorrect standard or edition;</li>
          <li>failure to obtain necessary professional verification;</li>
          <li>
            use of results outside the purpose or scope for which the tool was
            designed;
          </li>
          <li>
            content or decisions of external service providers outside the
            reasonable control of Dost Industries.
          </li>
        </ul>

        <p>
          Nothing in these Terms excludes or limits liability where such
          exclusion or limitation is prohibited by mandatory applicable law.
        </p>

        <p>Mandatory consumer rights remain fully applicable.</p>
      </>
    ),
  },
  {
    title: "19. Suspension and termination",
    content: (
      <>
        <p>
          Dost Industries may temporarily restrict or suspend access where
          reasonably necessary due to:
        </p>

        <ul>
          <li>fraud;</li>
          <li>abuse;</li>
          <li>a security risk;</li>
          <li>unauthorized account use;</li>
          <li>serious or repeated violations of these Terms;</li>
          <li>legal obligations.</li>
        </ul>

        <p>
          Permanent termination will not be applied arbitrarily and will take
          applicable legal and contractual obligations into account.
        </p>

        <p>
          Users may terminate their account through available account
          functionality or by contacting Dost Industries.
        </p>
      </>
    ),
  },
  {
    title: "20. Privacy and data protection",
    content: (
      <>
        <p>
          Processing of personal data by Dost Industries is described in the
          DOST Industries Privacy Policy.
        </p>

        <Link
          href="/legal/privacy"
          className="inline-flex rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300 transition hover:bg-cyan-400/15"
        >
          Privacy Policy
        </Link>
      </>
    ),
  },
  {
    title: "21. Changes to these Terms",
    content: (
      <>
        <p>Dost Industries may update these Terms due to matters including:</p>

        <ul>
          <li>changes to services;</li>
          <li>new modules or business models;</li>
          <li>technical or security developments;</li>
          <li>changes in applicable law;</li>
          <li>reasonable commercial or operational requirements.</li>
        </ul>

        <p>
          Users will receive advance notice of material changes where required
          by contract or applicable law.
        </p>

        <p>
          Mandatory statutory rights relating to contractual changes remain
          fully applicable.
        </p>
      </>
    ),
  },
  {
    title: "22. Dutch law and disputes",
    content: (
      <>
        <p>
          These Terms and the agreement with Dost Industries are governed by
          Dutch law.
        </p>

        <p>
          For consumers, this choice of law does not deprive them of mandatory
          protection available under the law that would have applied in the
          absence of this choice of law.
        </p>

        <p>
          Disputes will be submitted to the court having jurisdiction under
          applicable law.
        </p>

        <p>
          For business users, the competent Dutch court may, where legally
          valid, be designated in additional business terms or agreements.
        </p>
      </>
    ),
  },
  {
    title: "23. Severability",
    content: (
      <>
        <p>
          If any provision of these Terms is found to be wholly or partly
          invalid, unenforceable or inapplicable, the remaining provisions
          remain unaffected.
        </p>

        <p>
          The relevant provision will, where possible, be applied in a manner
          that most closely reflects its intended purpose within the limits of
          applicable law.
        </p>
      </>
    ),
  },
  {
    title: "24. Contact",
    content: (
      <>
        <p>For questions regarding these Terms, please contact:</p>

        <address className="not-italic">
          <strong className="text-white">Dost Industries B.V.</strong>
          <br />
          Veckdijk 42
          <br />
          3237 LV Vierpolders
          <br />
          The Netherlands
          <br />
          Chamber of Commerce: 90713052
          <br />
          VAT: NL865425322B01
          <br />
          <span className="text-cyan-300">info@dostindustries.com</span>
        </address>
      </>
    ),
  },
];

export default function TermsPage() {
  const [language, setLanguage] = useState<Language>("nl");

  const sections = language === "nl" ? nlSections : enSections;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="absolute left-1/2 top-[-300px] h-[900px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute bottom-[-250px] right-[-180px] h-[600px] w-[600px] rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-cyan-500/20 bg-[#020617]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="group">
            <p className="text-sm font-black uppercase italic tracking-[0.2em] sm:text-lg sm:tracking-[0.3em]">
              <span className="text-white">DOST</span>{" "}
              <span className="text-cyan-400 drop-shadow-[0_0_14px_rgba(0,255,255,0.6)]">
                INDUSTRIES
              </span>
            </p>

            <p className="mt-1 text-[0.5rem] uppercase tracking-[0.28em] text-zinc-600 sm:text-[0.6rem]">
              Professional Welding Tools
            </p>
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-cyan-500/25 bg-cyan-400/5 px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cyan-300 transition hover:border-cyan-400/60 hover:bg-cyan-400/10"
          >
            Back to app
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-14">
        <section className="relative overflow-hidden rounded-[30px] border border-cyan-500/25 bg-black/55 shadow-[0_0_70px_rgba(0,255,255,0.08)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.08),transparent_55%)]" />

          <div className="absolute left-0 top-0 h-20 w-20 rounded-tl-[30px] border-l border-t border-cyan-400/60" />
          <div className="absolute right-0 top-0 h-20 w-20 rounded-tr-[30px] border-r border-t border-cyan-400/60" />
          <div className="absolute bottom-0 left-0 h-20 w-20 rounded-bl-[30px] border-b border-l border-cyan-400/30" />
          <div className="absolute bottom-0 right-0 h-20 w-20 rounded-br-[30px] border-b border-r border-cyan-400/30" />

          <div className="relative z-10 px-5 py-8 sm:px-10 sm:py-12">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.38em] text-cyan-400">
                Legal
              </p>

              <h1 className="mt-4 text-3xl font-black uppercase tracking-[0.08em] sm:text-5xl">
                Terms of{" "}
                <span className="text-cyan-400 drop-shadow-[0_0_18px_rgba(0,255,255,0.45)]">
                  Use
                </span>
              </h1>

              <p className="mt-5 text-sm leading-relaxed text-zinc-400 sm:text-base">
                {language === "nl"
                  ? "De voorwaarden voor het gebruik van het DOST Industries-platform, de professionele tools en betaalde diensten."
                  : "The conditions governing use of the DOST Industries platform, professional tools and paid services."}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[0.65rem] uppercase tracking-[0.2em] text-zinc-500">
                <span>Version 1.0</span>
                <span className="text-cyan-500">•</span>
                <span>11 August 2026</span>
              </div>
            </div>

            <div className="mx-auto mt-8 flex w-fit rounded-2xl border border-cyan-500/20 bg-black/50 p-1.5">
              <button
                type="button"
                onClick={() => setLanguage("nl")}
                className={`rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] transition ${
                  language === "nl"
                    ? "border border-cyan-400/40 bg-cyan-400/15 text-cyan-200 shadow-[0_0_18px_rgba(0,255,255,0.08)]"
                    : "border border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Nederlands
              </button>

              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] transition ${
                  language === "en"
                    ? "border border-cyan-400/40 bg-cyan-400/15 text-cyan-200 shadow-[0_0_18px_rgba(0,255,255,0.08)]"
                    : "border border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                English
              </button>
            </div>

            <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-cyan-500/15 bg-cyan-400/5 p-5">
              <div className="grid gap-3 text-sm text-zinc-400 sm:grid-cols-2">
                <div>
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-zinc-600">
                    Provider
                  </p>
                  <p className="mt-1 text-white">Dost Industries B.V.</p>
                </div>

                <div>
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-zinc-600">
                    Trading name
                  </p>
                  <p className="mt-1 text-white">Dost Industries</p>
                </div>

                <div>
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-zinc-600">
                    Chamber of Commerce
                  </p>
                  <p className="mt-1">90713052</p>
                </div>

                <div>
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-zinc-600">
                    VAT
                  </p>
                  <p className="mt-1">NL865425322B01</p>
                </div>

                <div>
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-zinc-600">
                    Address
                  </p>
                  <p className="mt-1">
                    Veckdijk 42
                    <br />
                    3237 LV Vierpolders
                    <br />
                    The Netherlands
                  </p>
                </div>

                <div>
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-zinc-600">
                    Contact
                  </p>
                  <p className="mt-1 text-cyan-300">
                    info@dostindustries.com
                  </p>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-5 max-w-3xl rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">
                Professional responsibility
              </p>

              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {language === "nl"
                  ? "DOST Industries is een professioneel technisch hulpmiddel. Technische output moet passend worden gecontroleerd voordat deze wordt gebruikt voor een veiligheidskritische beslissing."
                  : "DOST Industries is a professional technical aid. Technical output must be appropriately verified before being used for a safety-critical decision."}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 space-y-4">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[24px] border border-cyan-500/15 bg-black/45 p-5 backdrop-blur-xl transition hover:border-cyan-500/25 sm:p-7"
            >
              <h2 className="text-lg font-semibold tracking-wide text-white sm:text-xl">
                {section.title}
              </h2>

              <div className="terms-content mt-4 space-y-4 text-sm leading-7 text-zinc-400 sm:text-[0.95rem]">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-10 border-t border-cyan-500/15 py-8 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
            DOST Industries B.V. · Terms of Use v1.0
          </p>

          <p className="mt-2 text-xs text-zinc-700">
            © 2026 Dost Industries B.V.
          </p>
        </footer>
      </div>

      <style jsx global>{`
        .terms-content ul {
          list-style: none;
          margin: 1rem 0;
          padding: 0;
        }

        .terms-content li {
          position: relative;
          margin: 0.45rem 0;
          padding-left: 1.35rem;
        }

        .terms-content li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.72rem;
          width: 0.36rem;
          height: 0.36rem;
          border-radius: 9999px;
          background: rgb(34 211 238);
          box-shadow: 0 0 8px rgba(34, 211, 238, 0.55);
        }
      `}</style>
    </main>
  );
}