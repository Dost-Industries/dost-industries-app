"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

type Language = "nl" | "en";

type DisclaimerSection = {
  title: string;
  content: ReactNode;
};

const nlSections: DisclaimerSection[] = [
  {
    title: "1. Doel van deze disclaimer",
    content: (
      <>
        <p>
          Deze disclaimer is van toepassing op de technische informatie,
          berekeningen, resultaten, rapporten, metingen, hulpmiddelen en andere
          output die via DOST Industries beschikbaar wordt gesteld.
        </p>

        <p>
          DOST Industries is ontwikkeld als professioneel technisch hulpmiddel
          voor onder andere lassen, fabricage, engineering, inspectie en
          aanverwante werkzaamheden.
        </p>

        <p>
          De output van DOST Industries ondersteunt professionele
          besluitvorming, maar vervangt geen beoordeling die op grond van wet,
          norm, projectspecificatie, contract of goed vakmanschap door een
          bevoegde professional moet worden uitgevoerd.
        </p>
      </>
    ),
  },
  {
    title: "2. Controle van invoergegevens",
    content: (
      <>
        <p>
          De gebruiker blijft verantwoordelijk voor de juistheid, volledigheid
          en toepasbaarheid van alle ingevoerde gegevens.
        </p>

        <p>Dit geldt onder andere voor:</p>

        <ul>
          <li>spanning en stroomsterkte;</li>
          <li>lassnelheid;</li>
          <li>materiaalgegevens;</li>
          <li>afmetingen en geometrie;</li>
          <li>temperaturen;</li>
          <li>lasproces en instellingen;</li>
          <li>K-factoren en rendementen;</li>
          <li>projectparameters;</li>
          <li>norm- en acceptatiecriteria;</li>
          <li>andere technische invoer.</li>
        </ul>

        <p>
          Een technisch correct rekenmodel kan een onjuist resultaat geven
          wanneer onjuiste, onvolledige of niet-toepasselijke invoergegevens
          worden gebruikt.
        </p>
      </>
    ),
  },
  {
    title: "3. Professionele verificatie van resultaten",
    content: (
      <>
        <p>
          Resultaten van DOST Industries moeten vóór professioneel gebruik
          passend worden gecontroleerd.
        </p>

        <p>
          Waar relevant dient de gebruiker resultaten onder andere te toetsen
          aan:
        </p>

        <ul>
          <li>de toepasselijke technische norm;</li>
          <li>de juiste normeditie en revisie;</li>
          <li>projectspecificaties;</li>
          <li>tekeningen;</li>
          <li>WPS- en WPQR-documentatie;</li>
          <li>materiaalcertificaten;</li>
          <li>engineeringberekeningen;</li>
          <li>acceptatiecriteria;</li>
          <li>contractuele eisen;</li>
          <li>wettelijke veiligheidsvereisten.</li>
        </ul>

        <p>
          DOST Industries-resultaten mogen niet zonder passende professionele
          verificatie als enige basis worden gebruikt voor een
          veiligheidskritische technische beslissing.
        </p>
      </>
    ),
  },
  {
    title: "4. Geen vervanging voor bevoegde professionals",
    content: (
      <>
        <p>
          DOST Industries vervangt geen deskundige of bevoegde professional
          wanneer diens beoordeling, verificatie of goedkeuring vereist is.
        </p>

        <p>
          Afhankelijk van het onderwerp of project kan bijvoorbeeld beoordeling
          vereist zijn door een:
        </p>

        <ul>
          <li>IWT of IWE;</li>
          <li>lascoördinator;</li>
          <li>engineer of constructeur;</li>
          <li>inspecteur;</li>
          <li>NDO-deskundige;</li>
          <li>kwaliteitsfunctionaris;</li>
          <li>bevoegde keuringsinstantie;</li>
          <li>andere vakbekwame of wettelijk bevoegde persoon.</li>
        </ul>

        <p>
          Het gebruik van DOST Industries verandert dergelijke
          verantwoordelijkheden of formele bevoegdheidseisen niet.
        </p>
      </>
    ),
  },
  {
    title: "5. Normen, standaarden en revisies",
    content: (
      <>
        <p>
          Technische normen, standaarden, richtlijnen en projectspecificaties
          kunnen worden gewijzigd, vervangen of ingetrokken.
        </p>

        <p>
          De gebruiker blijft verantwoordelijk voor het controleren welke norm,
          editie, revisie, aanvullingen, acceptatiecriteria en
          projectspecificaties op het betreffende werk van toepassing zijn.
        </p>

        <p>
          Een verwijzing in DOST Industries naar een norm of technische methode
          garandeert niet dat die verwijzing voor ieder project, land,
          contract, toepassing of moment de juiste of meest actuele grondslag
          vormt.
        </p>
      </>
    ),
  },
  {
    title: "6. Geen officiële normtekst",
    content: (
      <>
        <p>
          DOST Industries kan technische informatie, berekeningsmethoden,
          verwijzingen en hulpmiddelen aanbieden die verband houden met normen
          en standaarden.
        </p>

        <p>
          Tenzij uitdrukkelijk anders vermeld, levert DOST Industries daarmee
          geen officiële normtekst en vervangt de dienst geen geldige licentie
          of rechtmatig verkregen exemplaar van een auteursrechtelijk
          beschermde norm.
        </p>

        <p>
          Bij twijfel dient de gebruiker de officiële, toepasselijke bron te
          raadplegen.
        </p>
      </>
    ),
  },
  {
    title: "7. Rapporten en projectdocumentatie",
    content: (
      <>
        <p>
          Resultaten uit DOST Industries mogen worden gebruikt in rapporten,
          dossiers en projectdocumentatie wanneer de gebruiker deze passend
          heeft gecontroleerd en professioneel verantwoordelijk gebruik
          daarvan is toegestaan.
        </p>

        <p>
          Een gegenereerd rapport of PDF-bestand bewijst op zichzelf niet dat:
        </p>

        <ul>
          <li>de invoergegevens juist zijn;</li>
          <li>de juiste norm is toegepast;</li>
          <li>een constructie veilig is;</li>
          <li>een las voldoet aan alle projectspecificaties;</li>
          <li>formele goedkeuring heeft plaatsgevonden;</li>
          <li>een bevoegde derde het resultaat heeft geverifieerd.</li>
        </ul>

        <p>
          Waar dergelijke verificatie of goedkeuring vereist is, moet deze
          afzonderlijk plaatsvinden.
        </p>
      </>
    ),
  },
  {
    title: "8. Geen certificering of conformiteitsverklaring",
    content: (
      <>
        <p>
          Tenzij bij een specifieke functie uitdrukkelijk anders wordt
          aangegeven, vormt output van DOST Industries geen:
        </p>

        <ul>
          <li>certificaat;</li>
          <li>verklaring van conformiteit;</li>
          <li>formele WPS- of WPQR-goedkeuring;</li>
          <li>kwalificatiecertificaat;</li>
          <li>inspectiecertificaat;</li>
          <li>constructieve goedkeuring;</li>
          <li>juridische of contractuele acceptatie.</li>
        </ul>
      </>
    ),
  },
  {
    title: "9. Foto-, meet- en inspectiefuncties",
    content: (
      <>
        <p>
          Wanneer DOST Industries in de toekomst camera-, meet- of
          inspectiefuncties aanbiedt, blijven deze functies hulpmiddelen ter
          ondersteuning van de gebruiker.
        </p>

        <p>
          De gebruiker blijft verantwoordelijk voor onder andere:
        </p>

        <ul>
          <li>de kwaliteit van het gebruikte beeld;</li>
          <li>correcte kalibratie of referentiemeting waar relevant;</li>
          <li>juiste positionering en meetmethode;</li>
          <li>interpretatie van indicaties of meetwaarden;</li>
          <li>toepassing van acceptatiecriteria;</li>
          <li>formeel vereiste inspectie of NDO.</li>
        </ul>

        <p>
          Een digitale beeld- of meetfunctie vervangt geen formele inspectie
          waar een norm, contract of wettelijke eis een bevoegde inspecteur,
          meetmethode of NDO-procedure voorschrijft.
        </p>
      </>
    ),
  },
  {
    title: "10. Software, formules en technische fouten",
    content: (
      <>
        <p>
          Dost Industries ontwikkelt en onderhoudt zijn tools met zorg, maar
          software kan fouten, onvolkomenheden of onverwachte technische
          beperkingen bevatten.
        </p>

        <p>
          Formules, datasets, interfaces en technische implementaties kunnen
          worden gecorrigeerd of bijgewerkt wanneer nieuwe inzichten, fouten,
          wijzigingen in normen of technische verbeteringen daartoe aanleiding
          geven.
        </p>

        <p>
          Waar resultaten relevant zijn voor kwaliteit, veiligheid of
          contractuele conformiteit, dient de gebruiker deze onafhankelijk te
          verifiëren.
        </p>
      </>
    ),
  },
  {
    title: "11. Eerdere en opgeslagen resultaten",
    content: (
      <>
        <p>
          Een eerder opgeslagen, geëxporteerd of gegenereerd resultaat blijft
          gebaseerd op de invoer, softwareversie, formule, instellingen en
          technische context die op dat moment van toepassing waren.
        </p>

        <p>
          Gebruikers dienen bij hergebruik te beoordelen of het resultaat nog
          geschikt is voor:
        </p>

        <ul>
          <li>het actuele project;</li>
          <li>de actuele technische situatie;</li>
          <li>de juiste normeditie;</li>
          <li>de geldende projectspecificaties;</li>
          <li>de actuele versie van de gebruikte tool.</li>
        </ul>
      </>
    ),
  },
  {
    title: "12. Veiligheidskritische toepassingen",
    content: (
      <>
        <p>
          Bij toepassingen waarbij fouten kunnen leiden tot letsel,
          constructief falen, milieuschade, productuitval of andere ernstige
          gevolgen, moet passende professionele controle plaatsvinden voordat
          resultaten uit DOST Industries worden toegepast.
        </p>

        <p>
          De gebruiker mag niet uitsluitend vertrouwen op geautomatiseerde
          output wanneer vakinhoudelijke verificatie redelijkerwijs of volgens
          toepasselijke eisen noodzakelijk is.
        </p>
      </>
    ),
  },
  {
    title: "13. Verantwoordelijkheid van de gebruiker",
    content: (
      <>
        <p>
          De gebruiker blijft verantwoordelijk voor de uiteindelijke keuze om
          een DOST Industries-resultaat toe te passen.
        </p>

        <p>Deze verantwoordelijkheid omvat onder andere:</p>

        <ul>
          <li>controle van invoer;</li>
          <li>controle van uitvoer;</li>
          <li>professionele interpretatie;</li>
          <li>normtoepassing;</li>
          <li>materiaal- en proceskeuze;</li>
          <li>veiligheidsbeoordeling;</li>
          <li>projectspecifieke verificatie;</li>
          <li>uitvoering van het werk;</li>
          <li>vereiste formele goedkeuringen.</li>
        </ul>
      </>
    ),
  },
  {
    title: "14. Aansprakelijkheid en wettelijke rechten",
    content: (
      <>
        <p>
          Deze disclaimer heeft tot doel de technische rol van DOST Industries
          en de verantwoordelijkheid van de gebruiker duidelijk te maken.
        </p>

        <p>
          Voor zover wettelijk toegestaan is Dost Industries niet
          verantwoordelijk voor schade die uitsluitend ontstaat doordat een
          gebruiker:
        </p>

        <ul>
          <li>onjuiste of onvolledige gegevens invoert;</li>
          <li>een resultaat onjuist interpreteert;</li>
          <li>de verkeerde norm, revisie of projectspecificatie toepast;</li>
          <li>noodzakelijke professionele verificatie achterwege laat;</li>
          <li>
            een tool gebruikt buiten het doel of technische toepassingsgebied
            waarvoor deze is ontwikkeld.
          </li>
        </ul>

        <p>
          Niets in deze disclaimer sluit aansprakelijkheid uit of beperkt
          wettelijke rechten voor zover een dergelijke uitsluiting of beperking
          volgens toepasselijk dwingend recht niet is toegestaan.
        </p>

        <p>
          Dwingende consumentenrechten blijven volledig van toepassing.
        </p>
      </>
    ),
  },
  {
    title: "15. Relatie met de Terms of Use",
    content: (
      <>
        <p>
          Deze disclaimer vormt een aanvulling op de DOST Industries Terms of
          Use.
        </p>

        <p>
          De Terms of Use bevatten aanvullende bepalingen over onder andere
          accounts, abonnementen, intellectueel eigendom, verboden gebruik,
          beschikbaarheid, aansprakelijkheid en beëindiging.
        </p>

        <Link
          href="/legal/terms"
          className="inline-flex rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300 transition hover:bg-cyan-400/15"
        >
          Terms of Use
        </Link>
      </>
    ),
  },
  {
    title: "16. Contact",
    content: (
      <>
        <p>
          Voor vragen over deze disclaimer of het professioneel gebruik van
          DOST Industries kunt u contact opnemen met:
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
          <span className="text-cyan-300">info@dostindustries.com</span>
        </address>
      </>
    ),
  },
];

const enSections: DisclaimerSection[] = [
  {
    title: "1. Purpose of this Disclaimer",
    content: (
      <>
        <p>
          This Disclaimer applies to technical information, calculations,
          results, reports, measurements, tools and other output made available
          through DOST Industries.
        </p>

        <p>
          DOST Industries is developed as a professional technical aid for
          welding, fabrication, engineering, inspection and related activities.
        </p>

        <p>
          DOST Industries output supports professional decision-making but does
          not replace any assessment that must be performed by a competent
          professional under applicable law, standards, project specifications,
          contracts or accepted professional practice.
        </p>
      </>
    ),
  },
  {
    title: "2. Verification of input data",
    content: (
      <>
        <p>
          The user remains responsible for the accuracy, completeness and
          applicability of all information entered into DOST Industries.
        </p>

        <p>This includes, among other things:</p>

        <ul>
          <li>voltage and amperage;</li>
          <li>travel speed;</li>
          <li>material information;</li>
          <li>dimensions and geometry;</li>
          <li>temperatures;</li>
          <li>welding processes and settings;</li>
          <li>K-factors and efficiencies;</li>
          <li>project parameters;</li>
          <li>standards and acceptance criteria;</li>
          <li>other technical input.</li>
        </ul>

        <p>
          A technically correct calculation model may produce an incorrect
          result where incorrect, incomplete or inapplicable input data is used.
        </p>
      </>
    ),
  },
  {
    title: "3. Professional verification of results",
    content: (
      <>
        <p>
          DOST Industries results must be appropriately verified before
          professional use.
        </p>

        <p>
          Where relevant, users should verify results against matters including:
        </p>

        <ul>
          <li>the applicable technical standard;</li>
          <li>the correct standard edition and revision;</li>
          <li>project specifications;</li>
          <li>drawings;</li>
          <li>WPS and WPQR documentation;</li>
          <li>material certificates;</li>
          <li>engineering calculations;</li>
          <li>acceptance criteria;</li>
          <li>contractual requirements;</li>
          <li>statutory safety requirements.</li>
        </ul>

        <p>
          DOST Industries results must not be used as the sole basis for a
          safety-critical technical decision without appropriate professional
          verification.
        </p>
      </>
    ),
  },
  {
    title: "4. No replacement for competent professionals",
    content: (
      <>
        <p>
          DOST Industries does not replace a qualified or competent professional
          where professional assessment, verification or approval is required.
        </p>

        <p>
          Depending on the subject or project, review may for example be
          required by an:
        </p>

        <ul>
          <li>IWT or IWE;</li>
          <li>welding coordinator;</li>
          <li>engineer or structural engineer;</li>
          <li>inspector;</li>
          <li>NDT specialist;</li>
          <li>quality professional;</li>
          <li>authorized inspection body;</li>
          <li>other competent or legally authorized professional.</li>
        </ul>

        <p>
          Use of DOST Industries does not alter such responsibilities or formal
          competency requirements.
        </p>
      </>
    ),
  },
  {
    title: "5. Standards and revisions",
    content: (
      <>
        <p>
          Technical standards, specifications, guidelines and project
          requirements may be amended, replaced or withdrawn.
        </p>

        <p>
          The user remains responsible for determining which standard, edition,
          revision, amendment, acceptance criteria and project specification
          applies to the relevant work.
        </p>

        <p>
          A reference in DOST Industries to a technical standard or method does
          not guarantee that the reference is the correct or most current basis
          for every project, country, contract, application or point in time.
        </p>
      </>
    ),
  },
  {
    title: "6. No official standards text",
    content: (
      <>
        <p>
          DOST Industries may provide technical information, calculation
          methods, references and tools connected with standards and
          specifications.
        </p>

        <p>
          Unless expressly stated otherwise, DOST Industries does not thereby
          provide the official text of a standard and does not replace any
          licence or lawfully obtained copy required for copyrighted standards.
        </p>

        <p>
          Where uncertainty exists, users should consult the applicable
          official source.
        </p>
      </>
    ),
  },
  {
    title: "7. Reports and project documentation",
    content: (
      <>
        <p>
          DOST Industries results may be used in reports, dossiers and project
          documentation where the user has appropriately verified them and such
          professional use is otherwise permitted.
        </p>

        <p>
          A generated report or PDF does not by itself prove that:
        </p>

        <ul>
          <li>the input data is correct;</li>
          <li>the correct standard has been applied;</li>
          <li>a structure is safe;</li>
          <li>a weld satisfies all project requirements;</li>
          <li>formal approval has occurred;</li>
          <li>a competent third party has verified the result.</li>
        </ul>

        <p>
          Where such verification or approval is required, it must take place
          separately.
        </p>
      </>
    ),
  },
  {
    title: "8. No certification or declaration of conformity",
    content: (
      <>
        <p>
          Unless expressly stated for a particular function, DOST Industries
          output does not constitute:
        </p>

        <ul>
          <li>a certificate;</li>
          <li>a declaration of conformity;</li>
          <li>formal WPS or WPQR approval;</li>
          <li>a qualification certificate;</li>
          <li>an inspection certificate;</li>
          <li>structural approval;</li>
          <li>legal or contractual acceptance.</li>
        </ul>
      </>
    ),
  },
  {
    title: "9. Image, measurement and inspection functions",
    content: (
      <>
        <p>
          Where DOST Industries introduces camera, measurement or inspection
          functionality, those functions remain technical aids intended to
          support the user.
        </p>

        <p>The user remains responsible for matters including:</p>

        <ul>
          <li>image quality;</li>
          <li>correct calibration or reference measurement where relevant;</li>
          <li>correct positioning and measurement methods;</li>
          <li>interpretation of indications and measurements;</li>
          <li>application of acceptance criteria;</li>
          <li>formally required inspection or NDT.</li>
        </ul>

        <p>
          A digital imaging or measurement feature does not replace formal
          inspection where a standard, contract or legal requirement specifies
          a competent inspector, measurement method or NDT procedure.
        </p>
      </>
    ),
  },
  {
    title: "10. Software, formulas and technical errors",
    content: (
      <>
        <p>
          Dost Industries develops and maintains its tools with care, but
          software may contain errors, limitations or unexpected technical
          behaviour.
        </p>

        <p>
          Formulas, datasets, interfaces and technical implementations may be
          corrected or updated where new information, identified errors,
          changes to standards or technical improvements make this appropriate.
        </p>

        <p>
          Where results are relevant to quality, safety or contractual
          conformity, users should independently verify them.
        </p>
      </>
    ),
  },
  {
    title: "11. Previous and saved results",
    content: (
      <>
        <p>
          A previously saved, exported or generated result remains based on the
          inputs, software version, formulas, settings and technical context
          applicable at the time it was produced.
        </p>

        <p>
          Before reuse, users should assess whether the result remains suitable
          for:
        </p>

        <ul>
          <li>the current project;</li>
          <li>the current technical situation;</li>
          <li>the applicable standard edition;</li>
          <li>current project specifications;</li>
          <li>the current version of the relevant tool.</li>
        </ul>
      </>
    ),
  },
  {
    title: "12. Safety-critical applications",
    content: (
      <>
        <p>
          Where an error could result in injury, structural failure,
          environmental damage, product failure or other serious consequences,
          appropriate professional review must take place before DOST Industries
          results are applied.
        </p>

        <p>
          Users must not rely solely on automated output where professional
          verification is reasonably necessary or required by applicable rules.
        </p>
      </>
    ),
  },
  {
    title: "13. User responsibility",
    content: (
      <>
        <p>
          The user remains responsible for the final decision to apply a DOST
          Industries result.
        </p>

        <p>This responsibility includes:</p>

        <ul>
          <li>verification of input;</li>
          <li>verification of output;</li>
          <li>professional interpretation;</li>
          <li>application of standards;</li>
          <li>material and process selection;</li>
          <li>safety assessment;</li>
          <li>project-specific verification;</li>
          <li>execution of the work;</li>
          <li>required formal approvals.</li>
        </ul>
      </>
    ),
  },
  {
    title: "14. Liability and statutory rights",
    content: (
      <>
        <p>
          This Disclaimer is intended to clarify the technical role of DOST
          Industries and the responsibilities of its users.
        </p>

        <p>
          To the extent permitted by applicable law, Dost Industries is not
          responsible for damage resulting solely from a user:
        </p>

        <ul>
          <li>entering incorrect or incomplete information;</li>
          <li>incorrectly interpreting a result;</li>
          <li>applying the wrong standard, revision or project specification;</li>
          <li>failing to obtain necessary professional verification;</li>
          <li>
            using a tool outside the purpose or technical scope for which it
            was designed.
          </li>
        </ul>

        <p>
          Nothing in this Disclaimer excludes liability or limits statutory
          rights where such exclusion or limitation is prohibited by mandatory
          applicable law.
        </p>

        <p>Mandatory consumer rights remain fully applicable.</p>
      </>
    ),
  },
  {
    title: "15. Relationship with the Terms of Use",
    content: (
      <>
        <p>
          This Disclaimer supplements the DOST Industries Terms of Use.
        </p>

        <p>
          The Terms of Use contain additional provisions regarding accounts,
          subscriptions, intellectual property, prohibited use, availability,
          liability and termination.
        </p>

        <Link
          href="/legal/terms"
          className="inline-flex rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300 transition hover:bg-cyan-400/15"
        >
          Terms of Use
        </Link>
      </>
    ),
  },
  {
    title: "16. Contact",
    content: (
      <>
        <p>
          For questions regarding this Disclaimer or the professional use of
          DOST Industries, please contact:
        </p>

        <address className="not-italic">
          <strong className="text-white">Dost Industries B.V.</strong>
          <br />
          Veckdijk 42
          <br />
          3237 LV Vierpolders
          <br />
          The Netherlands
          <br />
          <span className="text-cyan-300">info@dostindustries.com</span>
        </address>
      </>
    ),
  },
];

export default function DisclaimerPage() {
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
                Technical{" "}
                <span className="text-cyan-400 drop-shadow-[0_0_18px_rgba(0,255,255,0.45)]">
                  Disclaimer
                </span>
              </h1>

              <p className="mt-5 text-sm leading-relaxed text-zinc-400 sm:text-base">
                {language === "nl"
                  ? "Belangrijke voorwaarden voor het professioneel en veiligheidskritisch gebruik van technische output uit DOST Industries."
                  : "Important conditions for professional and safety-critical use of technical output from DOST Industries."}
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

            <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">
                {language === "nl"
                  ? "Professionele verificatie vereist"
                  : "Professional verification required"}
              </p>

              <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                {language === "nl"
                  ? "DOST Industries is een technisch hulpmiddel. Controleer invoer, resultaten, normtoepassing en projectspecifieke eisen voordat technische output wordt toegepast. Gebruik geautomatiseerde output nooit als enige basis voor een veiligheidskritische beslissing wanneer professionele verificatie vereist is."
                  : "DOST Industries is a technical aid. Verify inputs, results, applicable standards and project-specific requirements before applying technical output. Never use automated output as the sole basis for a safety-critical decision where professional verification is required."}
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

              <div className="disclaimer-content mt-4 space-y-4 text-sm leading-7 text-zinc-400 sm:text-[0.95rem]">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-10 border-t border-cyan-500/15 py-8 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
            DOST Industries B.V. · Technical Disclaimer v1.0
          </p>

          <p className="mt-2 text-xs text-zinc-700">
            © 2026 Dost Industries B.V.
          </p>
        </footer>
      </div>

      <style jsx global>{`
        .disclaimer-content ul {
          list-style: none;
          margin: 1rem 0;
          padding: 0;
        }

        .disclaimer-content li {
          position: relative;
          margin: 0.45rem 0;
          padding-left: 1.35rem;
        }

        .disclaimer-content li::before {
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