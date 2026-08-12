"use client";

import { useState } from "react";

import Link from "next/link";

type Language = "nl" | "en";

type Section = {
  title: string;
  content: React.ReactNode;
};

export default function AccountDeletionPolicyPage() {
  const [language, setLanguage] =
    useState<Language>("nl");

  const nlSections: Section[] = [
    {
      title: "1. Doel van dit beleid",
      content: (
        <>
          <p>
            Dit Account Deletion Policy
            beschrijft hoe gebruikers hun
            DOST Industries-account en
            bijbehorende persoonsgegevens
            kunnen laten verwijderen.
          </p>

          <p className="mt-4">
            Dost Industries B.V. streeft
            ernaar verwijderingsverzoeken
            zonder onredelijke vertraging
            af te handelen, rekening
            houdend met toepasselijke
            wettelijke verplichtingen en
            gerechtvaardigde
            bewaartermijnen.
          </p>
        </>
      ),
    },
    {
      title:
        "2. Self-service account verwijderen",
      content: (
        <>
          <p>
            Een ingelogde en
            geverifieerde gebruiker kan
            zijn of haar account
            rechtstreeks verwijderen via
            de Account-pagina van DOST
            Industries.
          </p>

          <p className="mt-4">
            Ter bescherming tegen
            onbevoegde verwijdering moet
            de gebruiker:
          </p>

          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              ingelogd zijn;
            </li>
            <li>
              een geverifieerd
              e-mailadres hebben;
            </li>
            <li>
              het huidige wachtwoord
              opnieuw invoeren;
            </li>
            <li>
              expliciet DELETE invoeren
              ter bevestiging.
            </li>
          </ul>
        </>
      ),
    },
    {
      title:
        "3. Wat bij accountverwijdering wordt verwijderd",
      content: (
        <>
          <p>
            Bij succesvolle
            self-service accountverwijdering
            verwijdert DOST Industries
            onder andere:
          </p>

          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              het DOST
              gebruikersprofiel;
            </li>
            <li>
              naam en
              e-mailadres uit het
              applicatieprofiel;
            </li>
            <li>
              accountrol en
              toegangsgegevens;
            </li>
            <li>
              opgeslagen
              entitlements en
              abonnementsstatus binnen
              het DOST-profiel;
            </li>
            <li>
              opgeslagen
              berekeningen die onder het
              account zijn opgeslagen;
            </li>
            <li>
              andere geneste
              gebruikersdata onder het
              betreffende account;
            </li>
            <li>
              het Firebase
              Authentication-account.
            </li>
          </ul>

          <p className="mt-4">
            De applicatie verwijdert de
            gebruikersdata eerst
            server-side en verwijdert
            daarna het
            authenticatieaccount.
          </p>
        </>
      ),
    },
    {
      title:
        "4. Opgeslagen berekeningen",
      content: (
        <>
          <p>
            Opgeslagen berekeningen
            kunnen afzonderlijk worden
            verwijderd zolang het account
            actief is.
          </p>

          <p className="mt-4">
            Wanneer het gehele account
            wordt verwijderd, worden alle
            berekeningen die onder dat
            account zijn opgeslagen
            eveneens verwijderd.
          </p>
        </>
      ),
    },
    {
      title:
        "5. Login- en beveiligingsgegevens",
      content: (
        <>
          <p>
            DOST Industries gebruikt
            tijdelijke beveiligingsrecords
            om misbruik en herhaalde
            mislukte inlogpogingen tegen
            te gaan.
          </p>

          <p className="mt-4">
            In deze tijdelijke
            login-securityrecords wordt
            geen onbewerkt e-mailadres of
            onbewerkt IP-adres
            opgeslagen. De applicatie
            gebruikt een pseudonieme
            SHA-256 identifier die is
            afgeleid van de combinatie
            van IP-adres en
            genormaliseerd e-mailadres.
          </p>

          <p className="mt-4">
            Deze records hebben een
            operationele bewaartermijn
            van maximaal ongeveer 24 uur
            na de laatste mislukte
            inlogpoging en worden
            applicatiegestuurd
            opgeschoond. Bij een
            succesvolle login wordt het
            overeenkomende actieve record
            verwijderd.
          </p>
        </>
      ),
    },
    {
      title:
        "6. Gegevens bij externe dienstverleners",
      content: (
        <>
          <p>
            DOST Industries gebruikt
            externe infrastructuur- en
            authenticatiediensten,
            waaronder Firebase / Google
            en Vercel.
          </p>

          <p className="mt-4">
            Wanneer DOST Industries
            accountgegevens verwijdert,
            kunnen beperkte gegevens nog
            tijdelijk voorkomen in
            back-ups, beveiligingslogs of
            operationele systemen van een
            dienstverlener volgens diens
            eigen technische
            verwijderingscyclus.
          </p>

          <p className="mt-4">
            DOST Industries gebruikt
            dergelijke gegevens niet
            opnieuw voor het normale
            accountgebruik nadat het
            account is verwijderd.
          </p>
        </>
      ),
    },
    {
      title:
        "7. Gegevens die mogelijk langer moeten worden bewaard",
      content: (
        <>
          <p>
            Het verwijderen van een
            account betekent niet altijd
            dat elk afzonderlijk gegeven
            onmiddellijk en
            onvoorwaardelijk moet worden
            vernietigd.
          </p>

          <p className="mt-4">
            Beperkte gegevens kunnen
            langer worden bewaard wanneer
            dit noodzakelijk is voor
            bijvoorbeeld:
          </p>

          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              een wettelijke
              bewaarplicht;
            </li>
            <li>
              fiscale of
              administratieve
              verplichtingen;
            </li>
            <li>
              fraudepreventie of
              beveiligingsonderzoek;
            </li>
            <li>
              het instellen,
              uitoefenen of verdedigen van
              rechtsvorderingen;
            </li>
            <li>
              andere verplichtingen
              die voortvloeien uit
              toepasselijk recht.
            </li>
          </ul>

          <p className="mt-4">
            In dat geval wordt alleen
            bewaard wat noodzakelijk is
            voor dat specifieke doel en
            niet voor regulier gebruik
            van het verwijderde account.
          </p>
        </>
      ),
    },
    {
      title:
        "8. Betalings- en financiële gegevens",
      content: (
        <>
          <p>
            Wanneer betaalde diensten in
            de toekomst worden
            geactiveerd, kunnen
            betalingsproviders en Dost
            Industries bepaalde
            transactie- of
            administratieve gegevens
            moeten bewaren.
          </p>

          <p className="mt-4">
            Dergelijke gegevens worden
            niet automatisch uitsluitend
            vanwege accountverwijdering
            verwijderd wanneer een
            wettelijke of fiscale
            bewaarplicht van toepassing
            is.
          </p>
        </>
      ),
    },
    {
      title:
        "9. Verwijdering lukt niet via de app",
      content: (
        <>
          <p>
            Wanneer een gebruiker zijn of
            haar account niet zelfstandig
            kan verwijderen, kan een
            verwijderingsverzoek worden
            gestuurd naar:
          </p>

          <p className="mt-4 font-semibold text-cyan-300">
            info@dostindustries.com
          </p>

          <p className="mt-4">
            Dost Industries kan
            aanvullende informatie vragen
            wanneer dit redelijkerwijs
            noodzakelijk is om de
            identiteit van de verzoeker
            te verifiëren en onbevoegde
            verwijdering te voorkomen.
          </p>
        </>
      ),
    },
    {
      title:
        "10. Verwerkingstijd van verzoeken",
      content: (
        <>
          <p>
            Self-service verwijdering
            wordt direct door de
            applicatie gestart nadat de
            vereiste controles succesvol
            zijn afgerond.
          </p>

          <p className="mt-4">
            Handmatige
            privacyverzoeken worden
            behandeld binnen de termijnen
            die gelden op grond van de
            AVG en overige toepasselijke
            privacywetgeving.
          </p>
        </>
      ),
    },
    {
      title:
        "11. Gevolgen van accountverwijdering",
      content: (
        <>
          <p>
            Accountverwijdering is
            permanent.
          </p>

          <p className="mt-4">
            Na succesvolle verwijdering:
          </p>

          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              kan het verwijderde
              account niet worden
              hersteld;
            </li>
            <li>
              vervalt toegang tot
              opgeslagen
              gebruikersgegevens;
            </li>
            <li>
              worden opgeslagen
              berekeningen verwijderd;
            </li>
            <li>
              kan hetzelfde
              e-mailadres later opnieuw
              voor een nieuw account
              worden gebruikt indien de
              authenticatieprovider dit
              toestaat.
            </li>
          </ul>

          <p className="mt-4">
            Een nieuw account wordt als
            een nieuw account behandeld
            en herstelt geen eerder
            verwijderde gegevens.
          </p>
        </>
      ),
    },
    {
      title:
        "12. Toekomstige modules en gegevens",
      content: (
        <>
          <p>
            DOST Industries is een
            modulair platform.
          </p>

          <p className="mt-4">
            Toekomstige functionaliteit
            kan onder meer projecten,
            rapporten, foto&apos;s,
            documenten, certificaten,
            technische bestanden,
            teamaccounts of AI-functies
            bevatten.
          </p>

          <p className="mt-4">
            Voordat dergelijke
            functionaliteit live gaat,
            wordt beoordeeld hoe
            bijbehorende gegevens worden
            verwijderd en of dit beleid
            moet worden aangepast.
          </p>
        </>
      ),
    },
    {
      title:
        "13. Relatie met het Privacybeleid",
      content: (
        <>
          <p>
            Dit beleid moet worden
            gelezen samen met het
            Privacybeleid van DOST
            Industries.
          </p>

          <p className="mt-4">
            Het Privacybeleid bevat
            bredere informatie over
            doeleinden, rechtsgronden,
            ontvangers, bewaartermijnen,
            internationale doorgiften en
            privacyrechten.
          </p>
        </>
      ),
    },
    {
      title:
        "14. Contact",
      content: (
        <>
          <p>
            Verwerkingsverantwoordelijke:
          </p>

          <p className="mt-4">
            <strong>
              Dost Industries B.V.
            </strong>
            <br />
            Veckdijk 42
            <br />
            3237 LV Vierpolders
            <br />
            Nederland
          </p>

          <p className="mt-4">
            KvK: 90713052
            <br />
            BTW: NL865425322B01
            <br />
            E-mail:
            info@dostindustries.com
          </p>
        </>
      ),
    },
  ];

  const enSections: Section[] = [
    {
      title: "1. Purpose of this policy",
      content: (
        <>
          <p>
            This Account Deletion Policy
            explains how users can delete
            their DOST Industries account
            and associated personal data.
          </p>

          <p className="mt-4">
            Dost Industries B.V. aims to
            handle deletion requests
            without undue delay, subject
            to applicable legal
            obligations and justified
            retention requirements.
          </p>
        </>
      ),
    },
    {
      title:
        "2. Self-service account deletion",
      content: (
        <>
          <p>
            A logged-in and verified user
            can delete their account
            directly through the DOST
            Industries Account page.
          </p>

          <p className="mt-4">
            To protect against
            unauthorised deletion, the
            user must:
          </p>

          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>be logged in;</li>
            <li>
              have a verified email
              address;
            </li>
            <li>
              re-enter the current
              password;
            </li>
            <li>
              explicitly enter DELETE as
              confirmation.
            </li>
          </ul>
        </>
      ),
    },
    {
      title:
        "3. What is deleted when an account is deleted",
      content: (
        <>
          <p>
            Following successful
            self-service account
            deletion, DOST Industries
            removes, among other things:
          </p>

          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              the DOST user
              profile;
            </li>
            <li>
              name and email
              address from the
              application profile;
            </li>
            <li>
              account role and
              access information;
            </li>
            <li>
              stored entitlements
              and subscription state
              within the DOST profile;
            </li>
            <li>
              saved calculations
              stored under the account;
            </li>
            <li>
              other nested user
              data under the account;
            </li>
            <li>
              the Firebase
              Authentication account.
            </li>
          </ul>

          <p className="mt-4">
            Application user data is
            removed server-side before
            the authentication account is
            deleted.
          </p>
        </>
      ),
    },
    {
      title:
        "4. Saved calculations",
      content: (
        <>
          <p>
            Saved calculations can be
            deleted individually while an
            account remains active.
          </p>

          <p className="mt-4">
            When the complete account is
            deleted, calculations stored
            under that account are also
            deleted.
          </p>
        </>
      ),
    },
    {
      title:
        "5. Login and security data",
      content: (
        <>
          <p>
            DOST Industries uses
            temporary security records to
            reduce abuse and repeated
            failed login attempts.
          </p>

          <p className="mt-4">
            The application does not
            persist the raw email address
            or raw IP address in these
            login-security records.
            Instead, it uses a
            pseudonymous SHA-256
            identifier derived from the
            combination of IP address and
            normalised email address.
          </p>

          <p className="mt-4">
            These records have an
            operational retention period
            of approximately no more than
            24 hours after the last
            failed login attempt and are
            removed through
            application-triggered
            cleanup. The matching active
            record is removed after a
            successful login.
          </p>
        </>
      ),
    },
    {
      title:
        "6. Data held by external service providers",
      content: (
        <>
          <p>
            DOST Industries uses external
            infrastructure and
            authentication services,
            including Firebase / Google
            and Vercel.
          </p>

          <p className="mt-4">
            Following account deletion,
            limited information may
            temporarily remain in
            provider backups, security
            logs or operational systems
            in accordance with the
            provider&apos;s technical deletion
            lifecycle.
          </p>

          <p className="mt-4">
            DOST Industries does not
            return such information to
            normal account use after the
            account has been deleted.
          </p>
        </>
      ),
    },
    {
      title:
        "7. Data that may need to be retained",
      content: (
        <>
          <p>
            Deleting an account does not
            necessarily mean that every
            individual record must always
            be destroyed immediately and
            unconditionally.
          </p>

          <p className="mt-4">
            Limited information may be
            retained where necessary for,
            for example:
          </p>

          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              a legal retention
              obligation;
            </li>
            <li>
              tax or accounting
              obligations;
            </li>
            <li>
              fraud prevention or
              security investigations;
            </li>
            <li>
              establishment,
              exercise or defence of
              legal claims;
            </li>
            <li>
              other requirements
              imposed by applicable law.
            </li>
          </ul>

          <p className="mt-4">
            Where retention is necessary,
            only the information required
            for that specific purpose
            will be retained and it will
            not be used for ordinary use
            of the deleted account.
          </p>
        </>
      ),
    },
    {
      title:
        "8. Payment and financial records",
      content: (
        <>
          <p>
            If paid services are
            activated in the future,
            payment providers and Dost
            Industries may be required to
            retain certain transaction or
            administrative information.
          </p>

          <p className="mt-4">
            Such information will not
            automatically be deleted
            solely because an application
            account is deleted where a
            legal or tax retention
            obligation applies.
          </p>
        </>
      ),
    },
    {
      title:
        "9. If deletion through the app is not possible",
      content: (
        <>
          <p>
            If a user cannot delete their
            account through the
            application, a deletion
            request can be sent to:
          </p>

          <p className="mt-4 font-semibold text-cyan-300">
            info@dostindustries.com
          </p>

          <p className="mt-4">
            Dost Industries may request
            additional information where
            reasonably necessary to
            verify the identity of the
            requester and prevent
            unauthorised deletion.
          </p>
        </>
      ),
    },
    {
      title:
        "10. Time required to process deletion",
      content: (
        <>
          <p>
            Self-service deletion is
            initiated immediately by the
            application after the
            required checks have
            successfully completed.
          </p>

          <p className="mt-4">
            Manual privacy requests are
            handled within the time
            limits required under the
            GDPR and other applicable
            privacy law.
          </p>
        </>
      ),
    },
    {
      title:
        "11. Consequences of account deletion",
      content: (
        <>
          <p>
            Account deletion is
            permanent.
          </p>

          <p className="mt-4">
            Following successful
            deletion:
          </p>

          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              the deleted account
              cannot be restored;
            </li>
            <li>
              access to stored
              user data is lost;
            </li>
            <li>
              saved calculations
              are deleted;
            </li>
            <li>
              the same email
              address may later be used
              for a new account where
              permitted by the
              authentication provider.
            </li>
          </ul>

          <p className="mt-4">
            A newly created account is
            treated as a new account and
            does not restore previously
            deleted data.
          </p>
        </>
      ),
    },
    {
      title:
        "12. Future modules and data",
      content: (
        <>
          <p>
            DOST Industries is a modular
            platform.
          </p>

          <p className="mt-4">
            Future functionality may
            include projects, reports,
            photos, documents,
            certificates, technical
            files, team accounts or AI
            functionality.
          </p>

          <p className="mt-4">
            Before such functionality is
            activated, DOST Industries
            will assess how the associated
            data is deleted and whether
            this policy must be updated.
          </p>
        </>
      ),
    },
    {
      title:
        "13. Relationship with the Privacy Policy",
      content: (
        <>
          <p>
            This policy should be read
            together with the DOST
            Industries Privacy Policy.
          </p>

          <p className="mt-4">
            The Privacy Policy provides
            broader information about
            processing purposes, legal
            bases, recipients, retention,
            international transfers and
            privacy rights.
          </p>
        </>
      ),
    },
    {
      title:
        "14. Contact",
      content: (
        <>
          <p>Data controller:</p>

          <p className="mt-4">
            <strong>
              Dost Industries B.V.
            </strong>
            <br />
            Veckdijk 42
            <br />
            3237 LV Vierpolders
            <br />
            The Netherlands
          </p>

          <p className="mt-4">
            Chamber of Commerce:
            90713052
            <br />
            VAT:
            NL865425322B01
            <br />
            Email:
            info@dostindustries.com
          </p>
        </>
      ),
    },
  ];

  const sections =
    language === "nl"
      ? nlSections
      : enSections;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="absolute left-1/2 top-[-300px] h-[900px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute bottom-[-250px] right-[-180px] h-[600px] w-[600px] rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-cyan-500/20 bg-[#020617]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
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
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setLanguage("nl")
              }
              className={
                language === "nl"
                  ? "rounded-lg border border-cyan-400/60 bg-cyan-400/10 px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-cyan-300"
                  : "rounded-lg border border-zinc-700 bg-white/5 px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-zinc-500 transition hover:text-zinc-300"
              }
            >
              NL
            </button>

            <button
              type="button"
              onClick={() =>
                setLanguage("en")
              }
              className={
                language === "en"
                  ? "rounded-lg border border-cyan-400/60 bg-cyan-400/10 px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-cyan-300"
                  : "rounded-lg border border-zinc-700 bg-white/5 px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-zinc-500 transition hover:text-zinc-300"
              }
            >
              EN
            </button>

            <Link
              href="/"
              className="hidden rounded-xl border border-cyan-500/25 bg-cyan-400/5 px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cyan-300 transition hover:border-cyan-400/60 hover:bg-cyan-400/10 sm:block"
            >
              {language === "nl"
                ? "Terug naar app"
                : "Back to app"}
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-14">
        <section className="relative overflow-hidden rounded-[30px] border border-cyan-500/25 bg-black/55 shadow-[0_0_70px_rgba(0,255,255,0.08)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.08),transparent_55%)]" />

          <div className="absolute left-0 top-0 h-20 w-20 rounded-tl-[30px] border-l border-t border-cyan-400/60" />

          <div className="absolute right-0 top-0 h-20 w-20 rounded-tr-[30px] border-r border-t border-cyan-400/60" />

          <div className="relative z-10 p-6 sm:p-10 lg:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-400">
              Legal
            </p>

            <h1 className="mt-4 text-3xl font-black uppercase tracking-[0.08em] text-white sm:text-5xl">
              {language === "nl"
                ? "Accountverwijderingsbeleid"
                : "Account Deletion Policy"}
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
              {language === "nl"
                ? "Informatie over het permanent verwijderen van een DOST Industries-account en de bijbehorende gegevens."
                : "Information about permanently deleting a DOST Industries account and associated data."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-xs text-zinc-500">
              <span className="rounded-full border border-cyan-500/20 bg-cyan-400/5 px-3 py-2">
                Dost Industries B.V.
              </span>

              <span className="rounded-full border border-cyan-500/20 bg-cyan-400/5 px-3 py-2">
                {language === "nl"
                  ? "Versie 12 augustus 2026"
                  : "Version 12 August 2026"}
              </span>
            </div>
          </div>
        </section>

        <div className="mt-6 space-y-4">
          {sections.map(
            (section) => (
              <section
                key={section.title}
                className="rounded-2xl border border-cyan-500/15 bg-black/45 p-5 backdrop-blur-lg sm:p-7"
              >
                <h2 className="text-lg font-semibold text-cyan-300 sm:text-xl">
                  {section.title}
                </h2>

                <div className="mt-4 text-sm leading-7 text-zinc-400 sm:text-[0.95rem]">
                  {section.content}
                </div>
              </section>
            )
          )}
        </div>

        <section className="mt-6 rounded-2xl border border-cyan-400/25 bg-cyan-400/5 p-6">
          <p className="text-sm leading-7 text-zinc-400">
            {language === "nl" ? (
              <>
                Lees ook ons{" "}
                <Link
                  href="/legal/privacy"
                  className="font-semibold text-cyan-300 underline decoration-cyan-500/40 underline-offset-4 transition hover:text-cyan-200"
                >
                  Privacybeleid
                </Link>{" "}
                voor aanvullende
                informatie over de
                verwerking van
                persoonsgegevens.
              </>
            ) : (
              <>
                Please also read our{" "}
                <Link
                  href="/legal/privacy"
                  className="font-semibold text-cyan-300 underline decoration-cyan-500/40 underline-offset-4 transition hover:text-cyan-200"
                >
                  Privacy Policy
                </Link>{" "}
                for further information
                about personal-data
                processing.
              </>
            )}
          </p>
        </section>

        <footer className="py-8 text-center text-[0.65rem] uppercase tracking-[0.22em] text-zinc-700">
          © 2026 Dost Industries B.V.
        </footer>
      </div>
    </main>
  );
}