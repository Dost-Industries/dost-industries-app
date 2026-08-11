"use client";

import { useState } from "react";

type Language = "nl" | "en";

type PrivacySection = {
  title: string;
  content: React.ReactNode;
};

const nlSections: PrivacySection[] = [
  {
    title: "1. Wie zijn wij?",
    content: (
      <>
        <p>
          Dost Industries B.V. is verantwoordelijk voor de verwerking van
          persoonsgegevens binnen de DOST Industries-applicaties, websites en
          digitale diensten, tenzij bij een specifieke dienst uitdrukkelijk
          anders wordt aangegeven.
        </p>

        <p>
          Voor privacyvragen of verzoeken kunt u contact opnemen via{" "}
          <strong className="text-cyan-300">
            info@dostindustries.com
          </strong>
          .
        </p>
      </>
    ),
  },
  {
    title: "2. Op welke diensten is deze Privacy Policy van toepassing?",
    content: (
      <>
        <p>
          Deze Privacy Policy geldt voor het gehele digitale platform van Dost
          Industries, waaronder huidige en toekomstige:
        </p>

        <ul>
          <li>welding- en engineeringcalculators;</li>
          <li>Heat Input Calculator;</li>
          <li>Preheat Calculator;</li>
          <li>CEV Calculator;</li>
          <li>Level + Angle Tool;</li>
          <li>lasnaadinhoudcalculators;</li>
          <li>elektrische/formuletools voor lasprocessen;</li>
          <li>inspectie- en rapportagetools;</li>
          <li>project- en bedrijfsfunctionaliteiten;</li>
          <li>document- en certificaatfunctionaliteiten;</li>
          <li>mobiele apps, webapps en PWA-functionaliteiten;</li>
          <li>account- en abonnementsdiensten;</li>
          <li>en, indien later geïntroduceerd, AI-functionaliteiten.</li>
        </ul>

        <p>
          Niet iedere hieronder beschreven gegevenscategorie wordt op dit
          moment al verwerkt. Waar toekomstige functionaliteit wordt
          beschreven, geldt dit alleen indien en voor zover die functionaliteit
          beschikbaar wordt gesteld en door de gebruiker wordt gebruikt.
        </p>
      </>
    ),
  },
  {
    title: "3. Accountgegevens",
    content: (
      <>
        <p>
          Wanneer u een account aanmaakt of gebruikt, kunnen wij onder andere
          verwerken:
        </p>

        <ul>
          <li>naam;</li>
          <li>e-mailadres;</li>
          <li>gebruikers-ID;</li>
          <li>accountstatus;</li>
          <li>e-mailverificatiestatus;</li>
          <li>accountaanmaakdatum;</li>
          <li>rol- en toegangsrechten;</li>
          <li>Premium-entitlements;</li>
          <li>abonnementstatus;</li>
          <li>bedrijfs- of team-ID indien van toepassing.</li>
        </ul>

        <p>
          Authenticatie, e-mailverificatie, wachtwoordherstel en
          herauthenticatie kunnen worden uitgevoerd via externe
          authenticatie-infrastructuur zoals Firebase Authentication.
        </p>
      </>
    ),
  },
  {
    title: "4. Technische en beveiligingsgegevens",
    content: (
      <>
        <p>
          Om de applicatie veilig en betrouwbaar te houden, kunnen wij
          technische gegevens verwerken, waaronder:
        </p>

        <ul>
          <li>IP-adres;</li>
          <li>datum en tijd van verzoeken;</li>
          <li>account- of loginidentifiers;</li>
          <li>informatie over mislukte loginpogingen;</li>
          <li>browser- en apparaatinformatie;</li>
          <li>beveiligingslogs;</li>
          <li>technische foutinformatie;</li>
          <li>fraudepreventie- en misbruiksignalen.</li>
        </ul>

        <p>
          Wij kunnen deze gegevens gebruiken om ongeautoriseerde toegang,
          misbruik en fraude te voorkomen en om de beveiliging van het platform
          te beschermen.
        </p>

        <p>
          Wij publiceren bewust geen gedetailleerde technische
          beveiligingsarchitectuur wanneer openbaarmaking daarvan de
          effectiviteit van beveiligingsmaatregelen kan verminderen.
        </p>
      </>
    ),
  },
  {
    title: "5. Calculator- en technische gegevens",
    content: (
      <>
        <p>
          Wanneer u DOST Industries-tools gebruikt, kunnen gegevens worden
          verwerkt die u invoert of laat berekenen, bijvoorbeeld:
        </p>

        <ul>
          <li>spanning;</li>
          <li>stroomsterkte;</li>
          <li>lassnelheid;</li>
          <li>lasproces;</li>
          <li>rendement/K-factor;</li>
          <li>materiaalgegevens;</li>
          <li>temperaturen;</li>
          <li>afmetingen;</li>
          <li>hoeken;</li>
          <li>lasgeometrie;</li>
          <li>berekende technische resultaten;</li>
          <li>gekozen normen, processen of instellingen.</li>
        </ul>

        <p>
          Wanneer opslagfunctionaliteit wordt gebruikt, kunnen invoer,
          resultaten, de gebruikte tool of module en timestamps aan uw account
          worden gekoppeld.
        </p>
      </>
    ),
  },
  {
    title: "6. Project- en bedrijfsgegevens",
    content: (
      <>
        <p>
          Wanneer toekomstige project-, bedrijfs- of teamfunctionaliteiten
          worden gebruikt, kunnen wij onder andere verwerken:
        </p>

        <ul>
          <li>bedrijfsnaam;</li>
          <li>klantnaam;</li>
          <li>projectnaam;</li>
          <li>projectnummer;</li>
          <li>locatie;</li>
          <li>werkorder- of objectgegevens;</li>
          <li>gebruikers binnen een team;</li>
          <li>projectrollen;</li>
          <li>technische projectinformatie;</li>
          <li>rapport- en dossiergegevens.</li>
        </ul>

        <p>
          Gebruikers zijn zelf verantwoordelijk voor het rechtmatig invoeren
          van persoonsgegevens van derden in dergelijke projecten.
        </p>
      </>
    ),
  },
  {
    title: "7. Foto's, camerabeelden en inspectiegegevens",
    content: (
      <>
        <p>
          Wanneer een module camera-, meet- of inspectiefuncties ondersteunt,
          kan de gebruiker ervoor kiezen om bijvoorbeeld de volgende gegevens
          te verwerken:
        </p>

        <ul>
          <li>foto&apos;s;</li>
          <li>camerabeelden;</li>
          <li>afbeeldingen van lassen;</li>
          <li>referentiekaarten;</li>
          <li>meetbeelden;</li>
          <li>inspectieresultaten;</li>
          <li>annotaties.</li>
        </ul>

        <p>
          Dost Industries verwerkt dergelijke gegevens uitsluitend voor de
          functionaliteit waarvoor zij zijn aangeleverd en voor andere
          doeleinden waarvoor een geldige rechtsgrond bestaat.
        </p>
      </>
    ),
  },
  {
    title: "8. Documenten, certificaten en uploads",
    content: (
      <>
        <p>
          Wanneer documentfunctionaliteit beschikbaar wordt gesteld, kunnen
          gebruikers bijvoorbeeld uploaden:
        </p>

        <ul>
          <li>normen;</li>
          <li>technische documenten;</li>
          <li>certificaten;</li>
          <li>WPS/WPQR-documenten;</li>
          <li>inspectierapporten;</li>
          <li>projectdocumenten;</li>
          <li>PDF-bestanden;</li>
          <li>andere technische bestanden.</li>
        </ul>

        <p>
          De gebruiker blijft verantwoordelijk voor de inhoud van geüploade
          documenten en voor het beschikken over de benodigde rechten om deze
          te verwerken of uploaden.
        </p>
      </>
    ),
  },
  {
    title: "9. Rapporten en PDF-export",
    content: (
      <>
        <p>
          Wanneer rapportagefunctionaliteit wordt gebruikt, kunnen
          gegenereerde documenten gegevens bevatten zoals:
        </p>

        <ul>
          <li>naam;</li>
          <li>bedrijfsnaam;</li>
          <li>projectinformatie;</li>
          <li>technische invoer;</li>
          <li>calculatieresultaten;</li>
          <li>inspectieresultaten;</li>
          <li>datum en tijd;</li>
          <li>rapportidentificatie.</li>
        </ul>

        <p>
          Deze gegevens worden verwerkt om het door de gebruiker gevraagde
          rapport te genereren, op te slaan en beschikbaar te stellen.
        </p>
      </>
    ),
  },
  {
    title: "10. Abonnementen en betalingen",
    content: (
      <>
        <p>
          Wanneer een betaald DOST Industries-product wordt aangeschaft,
          kunnen wij gegevens verwerken over:
        </p>

        <ul>
          <li>product of abonnement;</li>
          <li>subscription-ID;</li>
          <li>subscriptionstatus;</li>
          <li>aankoop- of transactie-ID;</li>
          <li>betaalprovider;</li>
          <li>entitlementstatus;</li>
          <li>
            start, wijziging, beëindiging, verloop of herstel van een
            abonnement.
          </li>
        </ul>

        <p>
          Betaalgegevens kunnen afhankelijk van het gebruikte platform
          rechtstreeks worden verwerkt door externe betaal- of
          storeproviders, bijvoorbeeld PayPal, Apple, Google of een andere
          later gekozen betaalprovider.
        </p>

        <p>
          Dost Industries zal waar mogelijk niet meer betaalinformatie
          ontvangen of bewaren dan noodzakelijk voor validatie, administratie,
          toegang en wettelijke verplichtingen.
        </p>
      </>
    ),
  },
  {
    title: "11. Advertenties, cookies en vergelijkbare technologieën",
    content: (
      <>
        <p>
          De gratis versie van DOST Industries kan advertenties bevatten.
        </p>

        <p>
          Wanneer Google AdSense of een vergelijkbare advertentiedienst wordt
          geactiveerd, kan de advertentieprovider technische gegevens ontvangen
          en kunnen cookies of vergelijkbare technologieën worden gebruikt.
        </p>

        <p>
          Waar toestemming wettelijk vereist is voor niet-noodzakelijke
          cookies, gepersonaliseerde advertenties, analytics of vergelijkbare
          trackingtechnologieën, worden deze alleen gebruikt nadat geldige
          toestemming is verkregen.
        </p>

        <p>
          Premiumgebruikers kunnen advertentievrij gebruik krijgen indien dat
          onderdeel is van hun geldende entitlement of abonnement.
        </p>
      </>
    ),
  },
  {
    title: "12. Analytics en crash reporting",
    content: (
      <>
        <p>
          Dost Industries kan analytics en technische monitoring gebruiken om
          bijvoorbeeld te begrijpen:
        </p>

        <ul>
          <li>welke tools worden gebruikt;</li>
          <li>welke functies goed of slecht functioneren;</li>
          <li>waar technische fouten optreden;</li>
          <li>welke apparaten of appversies problemen veroorzaken;</li>
          <li>hoe productprestaties kunnen worden verbeterd.</li>
        </ul>

        <p>
          Waar hiervoor toestemming vereist is, vragen wij deze vooraf.
        </p>

        <p>
          Crash-, diagnostische en beveiligingsgegevens kunnen daarnaast
          worden verwerkt wanneer dit noodzakelijk is voor beveiliging,
          foutanalyse en betrouwbare dienstverlening.
        </p>
      </>
    ),
  },
  {
    title: "13. E-mail en notificaties",
    content: (
      <>
        <p>
          Wij kunnen contactgegevens gebruiken voor functionele communicatie,
          zoals:
        </p>

        <ul>
          <li>accountverificatie;</li>
          <li>wachtwoordherstel;</li>
          <li>beveiligingsmeldingen;</li>
          <li>abonnement- of betalingsinformatie;</li>
          <li>belangrijke servicewijzigingen;</li>
          <li>gegenereerde rapporten;</li>
          <li>
            certificaat- of documentherinneringen wanneer de gebruiker deze
            functie activeert.
          </li>
        </ul>

        <p>
          Commerciële marketingcommunicatie wordt alleen verzonden wanneer
          daarvoor een geldige rechtsgrond bestaat en waar nodig toestemming
          is verkregen.
        </p>
      </>
    ),
  },
  {
    title: "14. AI-functionaliteiten",
    content: (
      <>
        <p>
          DOST Industries bevat momenteel geen actieve AI-assistent als
          onderdeel van deze eerste privacyarchitectuur.
        </p>

        <p>
          Wanneer later AI-functionaliteit wordt geïntroduceerd, kunnen —
          afhankelijk van de gekozen functionaliteit — prompts, technische
          vragen, documenten, projectinformatie of andere door de gebruiker
          geselecteerde gegevens worden verwerkt.
        </p>

        <p>
          Voordat dergelijke verwerking wordt geactiveerd, zal Dost Industries
          beoordelen welke gegevens worden verwerkt, door welke partijen, voor
          welke doeleinden en op welke rechtsgrond. Indien noodzakelijk wordt
          deze Privacy Policy vóór ingebruikname aangepast.
        </p>
      </>
    ),
  },
  {
    title: "15. Waarom verwerken wij persoonsgegevens?",
    content: (
      <>
        <p>
          Afhankelijk van de verwerking kunnen wij persoonsgegevens gebruiken
          voor:
        </p>

        <ul>
          <li>registratie en accountbeheer;</li>
          <li>het leveren van aangevraagde diensten;</li>
          <li>uitvoeren en opslaan van berekeningen;</li>
          <li>rapportage;</li>
          <li>abonnements- en toegangsbeheer;</li>
          <li>betalingsvalidatie;</li>
          <li>beveiliging;</li>
          <li>fraudepreventie;</li>
          <li>klantenservice;</li>
          <li>communicatie;</li>
          <li>wettelijke administratie;</li>
          <li>productverbetering;</li>
          <li>analytics, indien toegestaan;</li>
          <li>advertenties, indien toegestaan;</li>
          <li>toekomstige functies die de gebruiker bewust activeert.</li>
        </ul>
      </>
    ),
  },
  {
    title: "16. Rechtsgronden",
    content: (
      <>
        <p>
          Afhankelijk van de verwerking baseren wij ons op één of meer
          rechtsgronden uit de AVG.
        </p>

        <p>
          <strong className="text-white">
            Uitvoering van een overeenkomst
          </strong>{" "}
          — wanneer verwerking noodzakelijk is om een account, abonnement,
          calculator, rapport of andere aangevraagde dienst te leveren.
        </p>

        <p>
          <strong className="text-white">Wettelijke verplichting</strong> —
          bijvoorbeeld wanneer gegevens moeten worden bewaard vanwege fiscale,
          boekhoudkundige of andere wettelijke verplichtingen.
        </p>

        <p>
          <strong className="text-white">Gerechtvaardigd belang</strong> —
          bijvoorbeeld voor beveiliging, fraudepreventie, misbruikbestrijding
          en het betrouwbaar laten functioneren en beschermen van onze
          diensten, voor zover de belangen en grondrechten van betrokkenen niet
          zwaarder wegen.
        </p>

        <p>
          <strong className="text-white">Toestemming</strong> — wanneer de wet
          toestemming vereist, bijvoorbeeld voor bepaalde niet-noodzakelijke
          tracking-, advertentie- of analyseactiviteiten.
        </p>
      </>
    ),
  },
  {
    title: "17. Met wie delen wij gegevens?",
    content: (
      <>
        <p>
          Afhankelijk van de gebruikte functionaliteit kunnen persoonsgegevens
          worden verwerkt door of gedeeld met categorieën partijen zoals:
        </p>

        <ul>
          <li>cloud- en hostingproviders;</li>
          <li>
            Google/Firebase voor relevante backend- en
            authenticatiediensten;
          </li>
          <li>betaalproviders;</li>
          <li>
            Apple en Google voor app-storegerelateerde transacties indien van
            toepassing;
          </li>
          <li>advertentieproviders;</li>
          <li>analyticsproviders;</li>
          <li>e-mail- en notificatieproviders;</li>
          <li>technische supportproviders;</li>
          <li>toekomstige AI-serviceproviders;</li>
          <li>professionele adviseurs;</li>
          <li>autoriteiten wanneer wij daartoe wettelijk verplicht zijn.</li>
        </ul>

        <p>
          Wij verkopen persoonsgegevens niet als handelswaar.
        </p>

        <p>
          Dienstverleners die voor ons persoonsgegevens verwerken, worden waar
          vereist contractueel gebonden aan passende privacy- en
          beveiligingsverplichtingen.
        </p>
      </>
    ),
  },
  {
    title: "18. Internationale doorgifte",
    content: (
      <>
        <p>
          Sommige dienstverleners kunnen gegevens verwerken buiten Nederland
          of buiten de Europese Economische Ruimte.
        </p>

        <p>
          Wanneer persoonsgegevens worden doorgegeven naar een land buiten de
          EER, passen wij waar vereist een rechtsgeldig doorgiftemechanisme toe,
          bijvoorbeeld een adequaatheidsbesluit, door de Europese Commissie
          vastgestelde Standard Contractual Clauses of een ander wettelijk
          toegestaan mechanisme.
        </p>
      </>
    ),
  },
  {
    title: "19. Hoe lang bewaren wij persoonsgegevens?",
    content: (
      <>
        <p>
          Wij bewaren persoonsgegevens niet langer dan noodzakelijk voor het
          doel waarvoor zij worden verwerkt, tenzij een langere bewaartermijn
          wettelijk vereist of anderszins gerechtvaardigd is.
        </p>

        <ul>
          <li>
            <strong className="text-white">Accountgegevens:</strong> zolang het
            account actief is en daarna zolang noodzakelijk voor afwikkeling,
            geschillen of wettelijke verplichtingen.
          </li>
          <li>
            <strong className="text-white">Opgeslagen berekeningen:</strong>{" "}
            totdat de gebruiker deze verwijdert, het account wordt verwijderd
            of verdere bewaring niet langer noodzakelijk is.
          </li>
          <li>
            <strong className="text-white">
              Betaal- en administratieve gegevens:
            </strong>{" "}
            gedurende de toepasselijke wettelijke bewaartermijnen.
          </li>
          <li>
            <strong className="text-white">Beveiligingsgegevens:</strong>{" "}
            zolang redelijkerwijs noodzakelijk voor beveiliging,
            misbruikpreventie en onderzoek.
          </li>
          <li>
            <strong className="text-white">Consentgegevens:</strong> zolang
            noodzakelijk om toestemming en privacykeuzes te kunnen aantonen.
          </li>
          <li>
            <strong className="text-white">
              Project- en documentgegevens:
            </strong>{" "}
            zolang de gebruiker of organisatie deze bewaart of zolang dit voor
            de dienstverlening noodzakelijk is.
          </li>
          <li>
            <strong className="text-white">Back-ups:</strong> gegevens kunnen
            gedurende een beperkte technische uitloopperiode aanwezig blijven
            totdat back-ups worden overschreven of verwijderd.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "20. Beveiliging",
    content: (
      <>
        <p>
          Dost Industries neemt passende technische en organisatorische
          maatregelen om persoonsgegevens te beschermen tegen onder andere:
        </p>

        <ul>
          <li>ongeautoriseerde toegang;</li>
          <li>verlies;</li>
          <li>wijziging;</li>
          <li>ongeautoriseerde openbaarmaking;</li>
          <li>misbruik.</li>
        </ul>

        <p>
          Geen enkel internetverbonden of digitaal systeem kan absolute
          veiligheid garanderen.
        </p>
      </>
    ),
  },
  {
    title: "21. Uw privacyrechten",
    content: (
      <>
        <p>
          Afhankelijk van de situatie heeft u onder de AVG onder meer het recht
          op:
        </p>

        <ul>
          <li>inzage;</li>
          <li>rectificatie;</li>
          <li>verwijdering;</li>
          <li>beperking van verwerking;</li>
          <li>overdraagbaarheid van gegevens;</li>
          <li>bezwaar tegen verwerking;</li>
          <li>
            intrekking van toestemming wanneer verwerking daarop is gebaseerd;
          </li>
          <li>het indienen van een klacht bij een toezichthouder.</li>
        </ul>

        <p>
          Privacyverzoeken kunnen worden gestuurd naar{" "}
          <strong className="text-cyan-300">
            info@dostindustries.com
          </strong>
          .
        </p>

        <p>
          Wij kunnen aanvullende informatie vragen wanneer dit redelijkerwijs
          noodzakelijk is om uw identiteit te verifiëren voordat een
          privacyverzoek wordt uitgevoerd.
        </p>
      </>
    ),
  },
  {
    title: "22. Account verwijderen",
    content: (
      <>
        <p>
          Waar de applicatie accountverwijdering ondersteunt, kan de gebruiker
          zijn account laten verwijderen.
        </p>

        <p>
          Persoonsgegevens worden vervolgens verwijderd of geanonimiseerd voor
          zover deze niet langer noodzakelijk zijn en geen wettelijke grond
          bestaat om bepaalde gegevens langer te bewaren.
        </p>

        <p>
          De concrete procedure wordt nader beschreven in de{" "}
          <strong className="text-cyan-300">
            DOST Industries Account Deletion Policy
          </strong>
          .
        </p>
      </>
    ),
  },
  {
    title: "23. Gegevens van andere personen",
    content: (
      <>
        <p>
          Voert u persoonsgegevens van collega&apos;s, klanten, medewerkers of
          andere personen in DOST Industries in, dan bent u verantwoordelijk
          voor het hebben van een geldige grond om deze gegevens te gebruiken.
        </p>

        <p>
          Zakelijke klanten kunnen afhankelijk van de gekozen functionaliteit
          zelf verwerkingsverantwoordelijke zijn voor persoonsgegevens die zij
          via DOST Industries verwerken.
        </p>

        <p>
          Dost Industries kan in dat geval voor bepaalde verwerkingen als
          verwerker optreden. Waar vereist kunnen daarvoor aanvullende
          contractuele afspraken, waaronder een verwerkersovereenkomst, worden
          gesloten.
        </p>
      </>
    ),
  },
  {
    title: "24. Geautomatiseerde besluitvorming",
    content: (
      <>
        <p>
          Dost Industries gebruikt momenteel geen uitsluitend geautomatiseerde
          besluitvorming die rechtsgevolgen heeft voor gebruikers of hen
          anderszins in aanmerkelijke mate treft.
        </p>

        <p>
          Wanneer dergelijke functionaliteit in de toekomst wordt
          geïntroduceerd, beoordelen wij de toepasselijke juridische
          verplichtingen en informeren wij gebruikers voordat of wanneer deze
          functionaliteit wordt gebruikt.
        </p>
      </>
    ),
  },
  {
    title: "25. Wijzigingen aan deze Privacy Policy",
    content: (
      <>
        <p>Dost Industries kan deze Privacy Policy aanpassen wanneer:</p>

        <ul>
          <li>de applicatie of diensten veranderen;</li>
          <li>nieuwe modules worden toegevoegd;</li>
          <li>nieuwe gegevenscategorieën worden verwerkt;</li>
          <li>dienstverleners veranderen;</li>
          <li>wet- of regelgeving verandert.</li>
        </ul>

        <p>
          Bij materiële wijzigingen kunnen gebruikers via de app, website,
          e-mail of een andere passende methode worden geïnformeerd.
        </p>

        <p>
          De actuele versie vermeldt altijd een versienummer en ingangsdatum.
        </p>
      </>
    ),
  },
  {
    title: "26. Contact en klachten",
    content: (
      <>
        <p>Voor vragen, verzoeken of klachten over privacy:</p>

        <address className="not-italic">
          <strong className="text-white">Dost Industries B.V.</strong>
          <br />
          Veckdijk 42
          <br />
          3237 LV Vierpolders
          <br />
          Nederland
          <br />
          <span className="text-cyan-300">
            info@dostindustries.com
          </span>
        </address>

        <p>
          U heeft daarnaast het recht om een klacht in te dienen bij de
          bevoegde toezichthoudende autoriteit. Voor Dost Industries in
          Nederland is dit de Autoriteit Persoonsgegevens.
        </p>
      </>
    ),
  },
];

const enSections: PrivacySection[] = [
  {
    title: "1. Who are we?",
    content: (
      <>
        <p>
          Dost Industries B.V. is responsible for the processing of personal
          data within DOST Industries applications, websites and digital
          services, unless expressly stated otherwise for a specific service.
        </p>

        <p>
          For privacy-related questions or requests, please contact{" "}
          <strong className="text-cyan-300">
            info@dostindustries.com
          </strong>
          .
        </p>
      </>
    ),
  },
  {
    title: "2. Which services does this Privacy Policy apply to?",
    content: (
      <>
        <p>
          This Privacy Policy applies to the entire Dost Industries digital
          platform, including current and future:
        </p>

        <ul>
          <li>welding and engineering calculators;</li>
          <li>Heat Input Calculator;</li>
          <li>Preheat Calculator;</li>
          <li>CEV Calculator;</li>
          <li>Level + Angle Tool;</li>
          <li>weld volume calculators;</li>
          <li>electrical and formula tools for welding processes;</li>
          <li>inspection and reporting tools;</li>
          <li>project and business functionality;</li>
          <li>document and certificate functionality;</li>
          <li>mobile apps, web applications and PWA functionality;</li>
          <li>account and subscription services;</li>
          <li>and, if introduced in the future, AI functionality.</li>
        </ul>

        <p>
          Not every category of personal data described below is currently
          processed. Where future functionality is described, such processing
          only applies if and to the extent that the functionality is made
          available and used by the user.
        </p>
      </>
    ),
  },
  {
    title: "3. Account data",
    content: (
      <>
        <p>
          When you create or use an account, we may process information
          including:
        </p>

        <ul>
          <li>name;</li>
          <li>email address;</li>
          <li>user ID;</li>
          <li>account status;</li>
          <li>email verification status;</li>
          <li>account creation date;</li>
          <li>roles and access rights;</li>
          <li>Premium entitlements;</li>
          <li>subscription status;</li>
          <li>company or team ID, where applicable.</li>
        </ul>

        <p>
          Authentication, email verification, password recovery and
          reauthentication may be provided through external authentication
          infrastructure such as Firebase Authentication.
        </p>
      </>
    ),
  },
  {
    title: "4. Technical and security data",
    content: (
      <>
        <p>
          To protect the security and reliability of our services, we may
          process technical information including:
        </p>

        <ul>
          <li>IP address;</li>
          <li>date and time of requests;</li>
          <li>account or login identifiers;</li>
          <li>failed login information;</li>
          <li>browser and device information;</li>
          <li>security logs;</li>
          <li>technical error information;</li>
          <li>fraud prevention and abuse signals.</li>
        </ul>

        <p>
          We may use this information to prevent unauthorized access,
          investigate abuse, prevent fraud, protect accounts and maintain the
          security of the platform.
        </p>

        <p>
          We intentionally do not disclose detailed security architecture where
          doing so could reduce the effectiveness of our security measures.
        </p>
      </>
    ),
  },
  {
    title: "5. Calculator and technical data",
    content: (
      <>
        <p>
          When you use DOST Industries tools, we may process technical
          information entered by you or generated by the relevant tool,
          including for example:
        </p>

        <ul>
          <li>voltage;</li>
          <li>amperage;</li>
          <li>travel speed;</li>
          <li>welding process;</li>
          <li>efficiency or K-factor;</li>
          <li>material information;</li>
          <li>temperatures;</li>
          <li>dimensions;</li>
          <li>angles;</li>
          <li>weld geometry;</li>
          <li>calculated results;</li>
          <li>selected standards, processes or settings.</li>
        </ul>

        <p>
          Where calculation storage is available and used, input values,
          results, tool or module identifiers and timestamps may be associated
          with your account.
        </p>
      </>
    ),
  },
  {
    title: "6. Project and company data",
    content: (
      <>
        <p>
          Where project, company or team functionality is available, we may
          process information including:
        </p>

        <ul>
          <li>company name;</li>
          <li>customer name;</li>
          <li>project name;</li>
          <li>project number;</li>
          <li>location;</li>
          <li>work order or asset information;</li>
          <li>team members;</li>
          <li>project roles;</li>
          <li>technical project information;</li>
          <li>reporting and dossier information.</li>
        </ul>

        <p>
          Users remain responsible for ensuring that they have a lawful basis
          for entering personal data relating to other individuals into the
          platform.
        </p>
      </>
    ),
  },
  {
    title: "7. Photos, camera images and inspection data",
    content: (
      <>
        <p>
          Where a module provides camera, measurement or inspection
          functionality, users may choose to process information such as:
        </p>

        <ul>
          <li>photographs;</li>
          <li>camera images;</li>
          <li>weld images;</li>
          <li>reference cards;</li>
          <li>measurement images;</li>
          <li>inspection results;</li>
          <li>annotations.</li>
        </ul>

        <p>
          Dost Industries will process this information for the functionality
          for which it was provided and for other purposes only where an
          appropriate legal basis exists.
        </p>
      </>
    ),
  },
  {
    title: "8. Documents, certificates and uploads",
    content: (
      <>
        <p>
          Where document functionality becomes available, users may upload
          information including:
        </p>

        <ul>
          <li>standards;</li>
          <li>technical documents;</li>
          <li>certificates;</li>
          <li>WPS/WPQR documents;</li>
          <li>inspection reports;</li>
          <li>project documents;</li>
          <li>PDF files;</li>
          <li>other technical files.</li>
        </ul>

        <p>
          Users remain responsible for the content they upload and for ensuring
          that they have the necessary rights or permissions to process, use
          and upload such content.
        </p>
      </>
    ),
  },
  {
    title: "9. Reports and PDF exports",
    content: (
      <>
        <p>
          Where reporting functionality is used, generated documents may
          contain information including:
        </p>

        <ul>
          <li>name;</li>
          <li>company name;</li>
          <li>project information;</li>
          <li>technical input;</li>
          <li>calculation results;</li>
          <li>inspection results;</li>
          <li>date and time;</li>
          <li>report identification.</li>
        </ul>

        <p>
          Such information may be processed to generate, store and make
          available the report requested by the user.
        </p>
      </>
    ),
  },
  {
    title: "10. Subscriptions and payments",
    content: (
      <>
        <p>
          When a paid DOST Industries product or subscription is purchased, we
          may process information relating to:
        </p>

        <ul>
          <li>the purchased product or subscription;</li>
          <li>subscription ID;</li>
          <li>subscription status;</li>
          <li>purchase or transaction ID;</li>
          <li>payment provider;</li>
          <li>entitlement status;</li>
          <li>
            subscription activation, modification, cancellation, expiration or
            restoration.
          </li>
        </ul>

        <p>
          Depending on the platform used, payment information may be processed
          directly by third-party payment or store providers such as PayPal,
          Apple, Google or another payment provider selected in the future.
        </p>

        <p>
          Where possible, Dost Industries will not receive or retain more
          payment information than necessary for purchase validation,
          administration, access management and compliance with legal
          obligations.
        </p>
      </>
    ),
  },
  {
    title: "11. Advertising, cookies and similar technologies",
    content: (
      <>
        <p>The free version of DOST Industries may contain advertising.</p>

        <p>
          Where Google AdSense or another advertising service is activated, the
          advertising provider may receive technical information and cookies or
          similar technologies may be used.
        </p>

        <p>
          Where applicable law requires consent for non-essential cookies,
          personalized advertising, analytics or comparable tracking
          technologies, such technologies will only be activated after valid
          consent has been obtained.
        </p>

        <p>
          Premium users may receive advertising-free access where this is
          included in their applicable entitlement or subscription.
        </p>
      </>
    ),
  },
  {
    title: "12. Analytics and crash reporting",
    content: (
      <>
        <p>
          Dost Industries may use analytics and technical monitoring services
          to understand matters such as:
        </p>

        <ul>
          <li>which tools are used;</li>
          <li>how functionality performs;</li>
          <li>where technical errors occur;</li>
          <li>which devices or app versions experience problems;</li>
          <li>how the platform can be improved.</li>
        </ul>

        <p>
          Where consent is legally required for such processing, consent will
          be obtained in advance.
        </p>

        <p>
          Crash, diagnostic and security information may also be processed
          where necessary to maintain security, diagnose faults and provide a
          reliable service.
        </p>
      </>
    ),
  },
  {
    title: "13. Email and notifications",
    content: (
      <>
        <p>
          We may use contact information for service-related communications
          including:
        </p>

        <ul>
          <li>account verification;</li>
          <li>password recovery;</li>
          <li>security notifications;</li>
          <li>subscription and payment information;</li>
          <li>important changes to services;</li>
          <li>generated reports;</li>
          <li>
            certificate or document reminders where the user enables such
            functionality.
          </li>
        </ul>

        <p>
          Commercial marketing communications will only be sent where an
          appropriate legal basis exists and, where required, consent has been
          obtained.
        </p>
      </>
    ),
  },
  {
    title: "14. AI functionality",
    content: (
      <>
        <p>
          DOST Industries does not currently operate an active AI assistant as
          part of this initial privacy architecture.
        </p>

        <p>
          If AI functionality is introduced in the future, information
          processed may — depending on the functionality selected — include
          prompts, technical questions, documents, project information and
          other data selected or supplied by the user.
        </p>

        <p>
          Before such processing is activated, Dost Industries will assess what
          data is processed, which parties are involved, the purposes of the
          processing and the applicable legal basis. Where necessary, this
          Privacy Policy will be updated before the relevant functionality is
          placed into service.
        </p>
      </>
    ),
  },
  {
    title: "15. Why do we process personal data?",
    content: (
      <>
        <p>
          Depending on the relevant functionality, personal data may be
          processed for purposes including:
        </p>

        <ul>
          <li>account registration and administration;</li>
          <li>providing requested services;</li>
          <li>performing and storing calculations;</li>
          <li>reporting;</li>
          <li>subscription and access management;</li>
          <li>purchase validation;</li>
          <li>security;</li>
          <li>fraud and abuse prevention;</li>
          <li>customer support;</li>
          <li>service communications;</li>
          <li>legal and administrative obligations;</li>
          <li>product improvement;</li>
          <li>analytics where permitted;</li>
          <li>advertising where permitted;</li>
          <li>future functionality deliberately activated by the user.</li>
        </ul>
      </>
    ),
  },
  {
    title: "16. Legal bases",
    content: (
      <>
        <p>
          Depending on the processing activity, we may rely on one or more
          legal bases under applicable data protection law.
        </p>

        <p>
          <strong className="text-white">
            Performance of a contract
          </strong>{" "}
          — where processing is necessary to provide an account, subscription,
          calculator, report or another service requested by the user.
        </p>

        <p>
          <strong className="text-white">Legal obligation</strong> — where
          processing is required to comply with tax, accounting or other legal
          obligations.
        </p>

        <p>
          <strong className="text-white">Legitimate interests</strong> — where
          necessary for matters such as security, fraud prevention, abuse
          prevention and maintaining the reliable operation and protection of
          our services, provided those interests are not overridden by the
          rights and freedoms of individuals.
        </p>

        <p>
          <strong className="text-white">Consent</strong> — where consent is
          required by law, including certain non-essential analytics,
          advertising, tracking or similar technologies.
        </p>
      </>
    ),
  },
  {
    title: "17. Who may receive personal data?",
    content: (
      <>
        <p>
          Depending on the functionality used, personal data may be processed
          by or shared with categories of recipients including:
        </p>

        <ul>
          <li>cloud and hosting providers;</li>
          <li>
            Google/Firebase for relevant backend and authentication services;
          </li>
          <li>payment providers;</li>
          <li>
            Apple and Google for app-store-related transactions where
            applicable;
          </li>
          <li>advertising providers;</li>
          <li>analytics providers;</li>
          <li>email and notification providers;</li>
          <li>technical support providers;</li>
          <li>future AI service providers;</li>
          <li>professional advisers;</li>
          <li>
            competent authorities where disclosure is legally required.
          </li>
        </ul>

        <p>Dost Industries does not sell personal data as a commodity.</p>

        <p>
          Where third parties process personal data on our behalf, appropriate
          contractual privacy and security obligations will be used where
          required.
        </p>
      </>
    ),
  },
  {
    title: "18. International data transfers",
    content: (
      <>
        <p>
          Some service providers may process data outside the Netherlands or
          outside the European Economic Area.
        </p>

        <p>
          Where personal data is transferred outside the EEA and applicable law
          requires additional safeguards, Dost Industries will use an
          appropriate lawful transfer mechanism, such as an adequacy decision,
          Standard Contractual Clauses approved by the European Commission or
          another legally permitted transfer mechanism.
        </p>
      </>
    ),
  },
  {
    title: "19. How long do we retain personal data?",
    content: (
      <>
        <p>
          Personal data will not be retained longer than necessary for the
          purpose for which it is processed, unless longer retention is legally
          required or otherwise justified.
        </p>

        <ul>
          <li>
            <strong className="text-white">Account information:</strong>{" "}
            retained while the account is active and afterwards where necessary
            for settlement, disputes or legal obligations.
          </li>
          <li>
            <strong className="text-white">Saved calculations:</strong>{" "}
            retained until deleted by the user, the relevant account is deleted
            or further storage is no longer necessary.
          </li>
          <li>
            <strong className="text-white">
              Payment and administrative information:
            </strong>{" "}
            retained for applicable statutory retention periods.
          </li>
          <li>
            <strong className="text-white">Security information:</strong>{" "}
            retained for as long as reasonably necessary for security, fraud
            prevention, abuse prevention and investigation.
          </li>
          <li>
            <strong className="text-white">Consent records:</strong> retained
            where necessary to demonstrate consent and privacy preferences.
          </li>
          <li>
            <strong className="text-white">
              Project and document data:
            </strong>{" "}
            retained for as long as the user or organization keeps the
            information or as long as necessary to provide the relevant
            service.
          </li>
          <li>
            <strong className="text-white">Backups:</strong> information may
            remain temporarily within secure technical backup systems until
            those backups are overwritten or deleted.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "20. Security",
    content: (
      <>
        <p>
          Dost Industries implements appropriate technical and organizational
          measures designed to protect personal data against risks including:
        </p>

        <ul>
          <li>unauthorized access;</li>
          <li>loss;</li>
          <li>alteration;</li>
          <li>unauthorized disclosure;</li>
          <li>misuse.</li>
        </ul>

        <p>
          However, no internet-connected or digital system can guarantee
          absolute security.
        </p>
      </>
    ),
  },
  {
    title: "21. Your privacy rights",
    content: (
      <>
        <p>
          Depending on the circumstances and applicable law, you may have
          rights including:
        </p>

        <ul>
          <li>access to your personal data;</li>
          <li>correction of inaccurate data;</li>
          <li>deletion;</li>
          <li>restriction of processing;</li>
          <li>data portability;</li>
          <li>objection to processing;</li>
          <li>
            withdrawal of consent where processing is based on consent;
          </li>
          <li>
            the right to lodge a complaint with a competent supervisory
            authority.
          </li>
        </ul>

        <p>
          Privacy requests can be submitted to{" "}
          <strong className="text-cyan-300">
            info@dostindustries.com
          </strong>
          .
        </p>

        <p>
          We may request additional information where reasonably necessary to
          verify your identity before processing a privacy request.
        </p>
      </>
    ),
  },
  {
    title: "22. Account deletion",
    content: (
      <>
        <p>
          Where account deletion functionality is supported, users may request
          or initiate deletion of their account.
        </p>

        <p>
          Personal data will then be deleted or anonymized where it is no
          longer necessary and where no legal basis requires or permits
          continued retention.
        </p>

        <p>
          The applicable process will be described separately in the{" "}
          <strong className="text-cyan-300">
            DOST Industries Account Deletion Policy
          </strong>
          .
        </p>
      </>
    ),
  },
  {
    title: "23. Information relating to other individuals",
    content: (
      <>
        <p>
          If you enter personal information relating to colleagues, customers,
          employees or other individuals into DOST Industries, you are
          responsible for ensuring that you have an appropriate legal basis for
          doing so.
        </p>

        <p>
          Business customers may, depending on the functionality used, act as
          the controller of personal data processed through DOST Industries.
        </p>

        <p>
          In such circumstances, Dost Industries may act as a processor for
          certain processing activities. Appropriate contractual arrangements,
          including a data processing agreement where required, may apply.
        </p>
      </>
    ),
  },
  {
    title: "24. Automated decision-making",
    content: (
      <>
        <p>
          Dost Industries does not currently use solely automated
          decision-making that produces legal effects concerning users or
          similarly significantly affects them.
        </p>

        <p>
          If such functionality is introduced in the future, Dost Industries
          will assess the applicable legal requirements and provide the
          required information before or when such functionality is used.
        </p>
      </>
    ),
  },
  {
    title: "25. Changes to this Privacy Policy",
    content: (
      <>
        <p>Dost Industries may update this Privacy Policy when:</p>

        <ul>
          <li>the application or services change;</li>
          <li>new modules are introduced;</li>
          <li>new categories of information are processed;</li>
          <li>service providers change;</li>
          <li>legal or regulatory requirements change.</li>
        </ul>

        <p>
          Where changes are material, users may be informed through the
          application, website, email or another appropriate communication
          method.
        </p>

        <p>
          The current Privacy Policy will identify its version and effective
          date.
        </p>
      </>
    ),
  },
  {
    title: "26. Contact and complaints",
    content: (
      <>
        <p>For questions, requests or complaints relating to privacy:</p>

        <address className="not-italic">
          <strong className="text-white">Dost Industries B.V.</strong>
          <br />
          Veckdijk 42
          <br />
          3237 LV Vierpolders
          <br />
          The Netherlands
          <br />
          <span className="text-cyan-300">
            info@dostindustries.com
          </span>
        </address>

        <p>
          Individuals also have the right to lodge a complaint with the
          competent supervisory authority. For Dost Industries in the
          Netherlands, this is the Autoriteit Persoonsgegevens (Dutch Data
          Protection Authority).
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  const [language, setLanguage] =
    useState<Language>("nl");

  const sections =
    language === "nl" ? nlSections : enSections;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="absolute left-1/2 top-[-300px] h-[900px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute bottom-[-250px] right-[-180px] h-[600px] w-[600px] rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-cyan-500/20 bg-[#020617]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a
            href="/"
            className="group"
          >
            <p className="text-sm font-black uppercase italic tracking-[0.2em] sm:text-lg sm:tracking-[0.3em]">
              <span className="text-white">
                DOST
              </span>{" "}
              <span className="text-cyan-400 drop-shadow-[0_0_14px_rgba(0,255,255,0.6)]">
                INDUSTRIES
              </span>
            </p>

            <p className="mt-1 text-[0.5rem] uppercase tracking-[0.28em] text-zinc-600 sm:text-[0.6rem]">
              Professional Welding Tools
            </p>
          </a>

          <a
            href="/"
            className="rounded-xl border border-cyan-500/25 bg-cyan-400/5 px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cyan-300 transition hover:border-cyan-400/60 hover:bg-cyan-400/10"
          >
            Back to app
          </a>
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
                Privacy{" "}
                <span className="text-cyan-400 drop-shadow-[0_0_18px_rgba(0,255,255,0.45)]">
                  Policy
                </span>
              </h1>

              <p className="mt-5 text-sm leading-relaxed text-zinc-400 sm:text-base">
                {language === "nl"
                  ? "Hoe Dost Industries persoonsgegevens verwerkt, beschermt en gebruikt binnen het DOST Industries-platform."
                  : "How Dost Industries processes, protects and uses personal data within the DOST Industries platform."}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[0.65rem] uppercase tracking-[0.2em] text-zinc-500">
                <span>Version 1.0</span>
                <span className="text-cyan-500">
                  •
                </span>
                <span>
                  11 August 2026
                </span>
              </div>
            </div>

            <div className="mx-auto mt-8 flex w-fit rounded-2xl border border-cyan-500/20 bg-black/50 p-1.5">
              <button
                type="button"
                onClick={() =>
                  setLanguage("nl")
                }
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
                onClick={() =>
                  setLanguage("en")
                }
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
                    Controller
                  </p>
                  <p className="mt-1 text-white">
                    Dost Industries B.V.
                  </p>
                </div>

                <div>
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-zinc-600">
                    Trading name
                  </p>
                  <p className="mt-1 text-white">
                    Dost Industries
                  </p>
                </div>

                <div>
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-zinc-600">
                    Chamber of Commerce
                  </p>
                  <p className="mt-1">
                    90713052
                  </p>
                </div>

                <div>
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-zinc-600">
                    VAT
                  </p>
                  <p className="mt-1">
                    NL865425322B01
                  </p>
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
                    Privacy contact
                  </p>
                  <p className="mt-1 text-cyan-300">
                    info@dostindustries.com
                  </p>
                </div>
              </div>
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

              <div className="privacy-content mt-4 space-y-4 text-sm leading-7 text-zinc-400 sm:text-[0.95rem]">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-10 border-t border-cyan-500/15 py-8 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
            DOST Industries B.V. · Privacy Policy v1.0
          </p>

          <p className="mt-2 text-xs text-zinc-700">
            © 2026 Dost Industries B.V.
          </p>
        </footer>
      </div>

      <style jsx global>{`
        .privacy-content ul {
          list-style: none;
          margin: 1rem 0;
          padding: 0;
        }

        .privacy-content li {
          position: relative;
          margin: 0.45rem 0;
          padding-left: 1.35rem;
        }

        .privacy-content li::before {
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